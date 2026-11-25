const mongoose = require("mongoose");
const CustomRequest = require("../models/CustomRequest");

const STATUSES = [
  "new",
  "contacted",
  "quoted",
  "in-progress",
  "delivered",
  "cancelled",
];

const notFound = (res) =>
  res.status(404).json({ error: "NOT_FOUND", message: "الطلب غير موجود" });

exports.createCustomRequest = async (req, res, next) => {
  try {
    const request = await CustomRequest.create({
      ...req.body,
      user: req.user ? req.user.id : null, // من التوكن، مش من الـ body
    });
    res.status(201).json({ data: request });
  } catch (err) {
    next(err);
  }
};

exports.getMyCustomRequests = async (req, res, next) => {
  try {
    const requests = await CustomRequest.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.json({ data: requests });
  } catch (err) {
    next(err);
  }
};

// عرض الكل: أدمن
exports.getAllCustomRequests = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) {
      if (!STATUSES.includes(req.query.status)) {
        return res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "حالة الطلب غير صحيحة",
        });
      }
      filter.status = req.query.status;
    }

    const [requests, total] = await Promise.all([
      CustomRequest.find(filter)
        .populate("user", "username email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      CustomRequest.countDocuments(filter),
    ]);

    res.json({
      data: requests,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// تفاصيل: أدمن أو صاحب الطلب
exports.getCustomRequestById = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return notFound(res);

    const request = await CustomRequest.findById(req.params.id).populate(
      "user",
      "username email",
    );
    if (!request) return notFound(res);

    const isOwner = request.user && request.user.id === req.user.id;
    if (!isOwner && req.user.role !== "admin") return notFound(res);

    res.json({ data: request });
  } catch (err) {
    next(err);
  }
};

// تعديل: أدمن (الحالة والسعر التقديري)
exports.updateCustomRequest = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return notFound(res);

    const request = await CustomRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );
    if (!request) return notFound(res);

    res.json({ data: request });
  } catch (err) {
    next(err);
  }
};
