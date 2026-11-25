const express = require("express");
const {
  createCustomRequest,
  getMyCustomRequests,
  getAllCustomRequests,
  getCustomRequestById,
  updateCustomRequest,
} = require("../controllers/customRequestsController");
const validate = require("../middlewares/validate");
const { protect, restrictTo, optionalAuth } = require("../middlewares/auth");
const { customRequestLimiter } = require("../middlewares/rateLimiters");
const {
  createCustomRequestSchema,
  updateCustomRequestSchema,
} = require("../validators/customRequestValidator");

const router = express.Router();

router.post(
  "/",
  customRequestLimiter,
  optionalAuth,
  validate(createCustomRequestSchema),
  createCustomRequest,
);

// عميل مسجّل (لازم قبل /:id)
router.get("/my", protect, getMyCustomRequests);

// أدمن بس
router.get("/", protect, restrictTo("admin"), getAllCustomRequests);
router.patch(
  "/:id",
  protect,
  restrictTo("admin"),
  validate(updateCustomRequestSchema),
  updateCustomRequest,
);

// صاحب الطلب أو الأدمن (الفحص جوه الـ Controller)
router.get("/:id", protect, getCustomRequestById);

module.exports = router;
