const mongoose = require("mongoose");
const Product = require("../models/Product");
const Order = require("../models/Order");
const restoreStock = (deducted) =>
  Promise.all(
    deducted.map((item) =>
      Product.updateOne(
        { _id: item.product },
        { $inc: { stock: item.quantity } },
      ),
    ),
  );

exports.createOrder = async (req, res, next) => {
  const deducted = [];
  try {
    const { items, shippingAddress, notes } = req.body;

    const quantities = new Map();
    for (const item of items) {
      quantities.set(
        item.productId,
        (quantities.get(item.productId) || 0) + item.quantity,
      );
    }

    const ids = [...quantities.keys()];
    const products = await Product.find({ _id: { $in: ids }, isActive: true });

    if (products.length !== ids.length) {
      return res.status(400).json({
        error: "PRODUCT_UNAVAILABLE",
        message: "في منتج في الطلب مش موجود أو مش متاح",
      });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const product of products) {
      const quantity = quantities.get(product._id.toString());

      if (product.stock < quantity) {
        return res.status(400).json({
          error: "INSUFFICIENT_STOCK",
          message: `المخزون المتاح من "${product.name}" هو ${product.stock} بس`,
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        unitPrice: product.price,
        quantity,
      });
      totalAmount += product.price * quantity;
    }

    for (const item of orderItems) {
      const result = await Product.updateOne(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
      );

      if (result.modifiedCount === 0) {
        await restoreStock(deducted);
        return res.status(409).json({
          error: "STOCK_CHANGED",
          message: `"${item.name}" المخزون اتغيّر، جرّب تاني`,
        });
      }
      deducted.push(item);
    }

    let order;
    try {
      order = await Order.create({
        user: req.user.id,
        items: orderItems,
        totalAmount: Math.round(totalAmount * 100) / 100,
        shippingAddress,
        notes,
      });
    } catch (err) {
      await restoreStock(deducted);
      throw err;
    }

    res.status(201).json({ data: order });
  } catch (err) {
    next(err);
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
    const skip = (page - 1) * limit;

    const filter = { user: req.user.id };

    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);

    res.json({
      data: orders,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const notFound = () =>
      res.status(404).json({ error: "NOT_FOUND", message: "الطلب غير موجود" });

    if (!mongoose.isValidObjectId(req.params.id)) return notFound();

    const order = await Order.findById(req.params.id);
    if (!order) return notFound();

    const isOwner = order.user.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) return notFound();

    res.json({ data: order });
  } catch (err) {
    next(err);
  }
};
