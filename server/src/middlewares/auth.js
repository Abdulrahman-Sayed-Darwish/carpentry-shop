const jwt = require("jsonwebtoken");

exports.protect = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "NO_TOKEN", message: "لازم تسجّل دخول" });
  }

  const token = header.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch (e) {
    return res
      .status(401)
      .json({ error: "INVALID_TOKEN", message: "التوكن غير صالح أو منتهي" });
  }
};

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: "FORBIDDEN", message: "مش مسموحلك بالعملية دي" });
    }
    next();
  };

// لو فيه توكن صالح بنحط req.user، ولو مفيش أو غلط بنكمّل كزائر
exports.optionalAuth = (req, res, next) => {
  const header = req.headers.authorization;

  if (header && header.startsWith("Bearer ")) {
    try {
      const payload = jwt.verify(
        header.split(" ")[1],
        process.env.JWT_ACCESS_SECRET,
      );
      req.user = { id: payload.id, role: payload.role };
    } catch (e) {
      // توكن منتهي أو غلط: نتعامل معاه كزائر بدل ما نرفض الطلب
    }
  }
  next();
};
