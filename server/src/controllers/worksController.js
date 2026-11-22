const mongoose = require("mongoose");
const Work = require("../models/Work");

exports.getAllWorks = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 12, 1), 50);
    const skip = (page - 1) * limit;

    const { category } = req.query;
    const filter = category ? { category } : {};

    const [works, total] = await Promise.all([
      Work.find(filter)
        .populate("category", "name slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Work.countDocuments(filter),
    ]);

    res.json({
      data: works,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};
exports.getWorkById = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res
        .status(404)
        .json({ error: "NOT_FOUND", message: "العمل غير موجود" });
    }
    const work = await Work.findById(req.params.id).populate(
      "category",
      "name slug",
    );
    if (!work) {
      return res
        .status(404)
        .json({ error: "NOT_FOUND", message: "العمل غير موجود" });
    }
    res.json({ data: work });
  } catch (err) {
    next(err);
  }
};

exports.createWork = async (req, res, next) => {
  try {
    const work = await Work.create(req.body);
    res.status(201).json({ data: work });
  } catch (err) {
    next(err);
  }
};

exports.updateWork = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res
        .status(404)
        .json({ error: "NOT_FOUND", message: "العمل غير موجود" });
    }

    const work = await Work.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("category", "name slug");

    if (!work) {
      return res
        .status(404)
        .json({ error: "NOT_FOUND", message: "العمل غير موجود" });
    }

    res.json({ data: work });
  } catch (err) {
    next(err);
  }
};

exports.deleteWork = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res
        .status(404)
        .json({ error: "NOT_FOUND", message: "العمل غير موجود" });
    }

    const work = await Work.findByIdAndDelete(req.params.id);

    if (!work) {
      return res
        .status(404)
        .json({ error: "NOT_FOUND", message: "العمل غير موجود" });
    }

    res.json({ data: { message: "تم حذف العمل" } });
  } catch (err) {
    next(err);
  }
};
