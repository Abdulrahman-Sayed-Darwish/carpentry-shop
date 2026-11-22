const mongoose = require("mongoose");
const Category = require("../models/Category");
const Work = require("../models/Work");
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ data: categories });
  } catch (err) {
    next(err);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ data: category });
  } catch (err) {
    next(err);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res
        .status(404)
        .json({ error: "NOT_FOUND", message: "التصنيف غير موجود" });
    }

    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return res
        .status(404)
        .json({ error: "NOT_FOUND", message: "التصنيف غير موجود" });
    }

    res.json({ data: category });
  } catch (err) {
    next(err);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res
        .status(404)
        .json({ error: "NOT_FOUND", message: "التصنيف غير موجود" });
    }

    // نمنع الحذف لو فيه أعمال تابعة للتصنيف
    const worksCount = await Work.countDocuments({ category: req.params.id });
    if (worksCount > 0) {
      return res.status(409).json({
        error: "CATEGORY_IN_USE",
        message: `التصنيف مستخدم في ${worksCount} عمل، امسح الأعمال أو انقلها الأول`,
      });
    }

    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res
        .status(404)
        .json({ error: "NOT_FOUND", message: "التصنيف غير موجود" });
    }

    res.json({ data: { message: "تم حذف التصنيف" } });
  } catch (err) {
    next(err);
  }
};
