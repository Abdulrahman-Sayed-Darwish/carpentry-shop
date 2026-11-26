exports.notFoundHandler = (req, res) => {
  res.status(404).json({
    error: "NOT_FOUND",
    message: "المسار غير موجود",
  });
};

exports.errorHandler = (err, req, res, next) => {
  if (err.code === 11000) {
    return res.status(409).json({
      error: "DUPLICATE",
      message: "القيمة دي موجودة قبل كده",
    });
  }

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      error: "INVALID_JSON",
      message: "صيغة الـ JSON غير صحيحة",
    });
  }

  if (err.message === "INVALID_FILE_TYPE") {
    return res.status(400).json({
      error: "INVALID_FILE_TYPE",
      message: "مسموح بصور JPG أو PNG أو WebP بس",
    });
  }
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      error: "FILE_TOO_LARGE",
      message: "حجم الصورة أكبر من 5MB",
    });
  }
  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      error: "TOO_MANY_FILES",
      message: "عدد الصور أكبر من المسموح",
    });
  }
  // Origin blocked by CORS
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      error: "CORS_BLOCKED",
      message: "الأصل ده غير مسموح",
    });
  }
  console.error(err);
  res.status(500).json({
    error: "SERVER_ERROR",
    message: "حصل خطأ في السيرفر",
  });
};
