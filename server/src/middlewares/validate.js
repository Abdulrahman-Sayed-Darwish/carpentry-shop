const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const details = {};
    result.error.issues.forEach((issue) => {
      details[issue.path.join(".")] = issue.message;
    });
    return res.status(400).json({
      error: "VALIDATION_ERROR",
      message: "بيانات غير صحيحة",
      details,
    });
  }
  req.body = result.data;
  next();
};

module.exports = validate;
