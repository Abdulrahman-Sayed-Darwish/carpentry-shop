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
// admin
const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "in-progress",
  "delivered",
  "cancelled",
];
const PAYMENT_STATUSES = ["unpaid", "paid"];

//
const ALLOWED_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["in-progress", "cancelled"],
  "in-progress": ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};
exports.getAllOrders = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
    const skip = (page - 1) * limit;

    const { status, paymentStatus } = req.query;
    const filter = {};

    if (status) {
      if (!ORDER_STATUSES.includes(status)) {
        return res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "حالة الطلب غير صحيحة",
        });
      }
      filter.status = status;
    }

    if (paymentStatus) {
      if (!PAYMENT_STATUSES.includes(paymentStatus)) {
        return res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "حالة الدفع غير صحيحة",
        });
      }
      filter.paymentStatus = paymentStatus;
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("user", "username email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
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

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status: newStatus } = req.body;

    const notFound = () =>
      res.status(404).json({ error: "NOT_FOUND", message: "الطلب غير موجود" });

    if (!mongoose.isValidObjectId(req.params.id)) return notFound();

    const order = await Order.findById(req.params.id);
    if (!order) return notFound();

    // 1)
    const allowed = ALLOWED_TRANSITIONS[order.status];
    if (!allowed.includes(newStatus)) {
      return res.status(400).json({
        error: "INVALID_TRANSITION",
        message: `مينفعش تنقل الطلب من "${order.status}" إلى "${newStatus}"`,
      });
    }

    // 2) نحدّث الحالة بشرط ذرّي: بس لو الحالة لسه زي ما قرأناها
    const updated = await Order.findOneAndUpdate(
      { _id: order._id, status: order.status },
      { status: newStatus },
      { new: true },
    );

    if (!updated) {
      // حد غيّر الحالة في نفس اللحظة (مثلًا ضغطتين إلغاء)
      return res.status(409).json({
        error: "STATUS_CHANGED",
        message: "حالة الطلب اتغيّرت، حدّث الصفحة وجرّب تاني",
      });
    }

    // 3) لو اتلغى، نرجّع المخزون (بس لأن التحديث الذرّي نجح)
    if (newStatus === "cancelled") {
      await Promise.all(
        updated.items.map((item) =>
          Product.updateOne(
            { _id: item.product },
            { $inc: { stock: item.quantity } },
          ),
        ),
      );
    }

    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
};

exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentStatus } = req.body;

    const notFound = () =>
      res.status(404).json({ error: "NOT_FOUND", message: "الطلب غير موجود" });

    if (!mongoose.isValidObjectId(req.params.id)) return notFound();

    const order = await Order.findById(req.params.id);
    if (!order) return notFound();

    // مينفعش نسجّل دفع على طلب ملغي
    if (order.status === "cancelled") {
      return res.status(400).json({
        error: "ORDER_CANCELLED",
        message: "مينفعش تغيّر حالة الدفع لطلب ملغي",
      });
    }

    order.paymentStatus = paymentStatus;
    await order.save();

    res.json({ data: order });
  } catch (err) {
    next(err);
  }
};
