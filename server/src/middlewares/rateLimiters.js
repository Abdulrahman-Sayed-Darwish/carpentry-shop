const rateLimit = require("express-rate-limit");

// بنخلّي الرد بنفس شكل أخطائنا
const handler = (message) => (req, res) =>
  res.status(429).json({ error: "TOO_MANY_REQUESTS", message });

// بنوقف الحدود وقت التستات عشان ما تبوّظش التجارب
const skipInTests = () => process.env.NODE_ENV === "test";

// حد عام لكل الـ API: 300 طلب كل 15 دقيقة من نفس الـ IP
exports.generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTests,
  handler: handler("طلبات كتير، جرّب بعد شوية"),
});

// الـ Login: 10 محاولات فاشلة كل 15 دقيقة (الناجحة مش بتتحسب)
exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTests,
  handler: handler("محاولات دخول كتير، جرّب بعد 15 دقيقة"),
});

// الـ Register: 5 حسابات كل ساعة من نفس الـ IP
exports.registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTests,
  handler: handler("حاولت تسجّل مرات كتير، جرّب بعد ساعة"),
});

// طلبات التصنيع المخصوص (مفتوحة للزوار): 5 طلبات كل ساعة
exports.customRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTests,
  handler: handler("بعتّ طلبات كتير، جرّب بعد ساعة"),
});
