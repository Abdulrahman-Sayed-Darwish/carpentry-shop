const mongoose = require("mongoose");
const Product = require("../models/Product");

const notFound = (res) =>
  res.status(404).json({ error: "NOT_FOUND", message: "المنتج غير موجود" });

exports.getAllProducts = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 12, 1), 50);
    const skip = (page - 1) * limit;

    const { category, minPrice, maxPrice, search } = req.query;

    const filter = { isActive: true };

    if (category) {
      if (!mongoose.isValidObjectId(category)) {
        return res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "معرّف التصنيف غير صحيح",
        });
      }
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      const safe = String(search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.name = { $regex: safe, $options: "i" };
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    res.json({
      data: products,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return notFound(res);

    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true,
    }).populate("category", "name slug");

    if (!product) return notFound(res);
    res.json({ data: product });
  } catch (err) {
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ data: product });
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return notFound(res);

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("category", "name slug");

    if (!product) return notFound(res);
    res.json({ data: product });
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return notFound(res);

    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return notFound(res);

    res.json({ data: { message: "تم حذف المنتج" } });
  } catch (err) {
    next(err);
  }
};
