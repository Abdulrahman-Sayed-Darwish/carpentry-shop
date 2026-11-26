const rateLimit = require("express-rate-limit");

const handler = (message) => (req, res) =>
  res.status(429).json({ error: "TOO_MANY_REQUESTS", message });

const skipInTests = () => process.env.NODE_ENV === "test";

exports.generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTests,
  handler: handler("طلبات كتير، جرّب بعد شوية"),
});

exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTests,
  handler: handler("محاولات دخول كتير، جرّب بعد 15 دقيقة"),
});

exports.registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTests,
  handler: handler("حاولت تسجّل مرات كتير، جرّب بعد ساعة"),
});

exports.customRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTests,
  handler: handler("بعتّ طلبات كتير، جرّب بعد ساعة"),
});

exports.customerUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTests,
  handler: handler("رفعت صور كتير، جرّب بعد ساعة"),
});
