const express = require("express");
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
} = require("../controllers/ordersController");
const validate = require("../middlewares/validate");
const { protect, restrictTo } = require("../middlewares/auth");
const {
  createOrderSchema,
  updateOrderStatusSchema,
  updatePaymentSchema,
} = require("../validators/orderValidator");

const router = express.Router();

router.use(protect);

// للعميل (والأدمن كمان)
router.post("/", validate(createOrderSchema), createOrder);
router.get("/my", getMyOrders);

// للأدمن بس
router.get("/", restrictTo("admin"), getAllOrders);
router.patch(
  "/:id/status",
  restrictTo("admin"),
  validate(updateOrderStatusSchema),
  updateOrderStatus,
);
router.patch(
  "/:id/payment",
  restrictTo("admin"),
  validate(updatePaymentSchema),
  updatePaymentStatus,
);

// صاحب الطلب أو الأدمن (الفحص جوه الـ Controller)
router.get("/:id", getOrderById);

module.exports = router;
