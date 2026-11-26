const express = require("express");
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  cancelMyOrder,
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

router.post("/", validate(createOrderSchema), createOrder);
router.get("/my", getMyOrders);
router.patch("/:id/cancel", cancelMyOrder);
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

router.get("/:id", getOrderById);

module.exports = router;
