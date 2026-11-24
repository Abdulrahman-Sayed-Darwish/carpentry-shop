const express = require("express");
const {
  createOrder,
  getMyOrders,
  getOrderById,
} = require("../controllers/ordersController");
const validate = require("../middlewares/validate");
const { protect } = require("../middlewares/auth");
const { createOrderSchema } = require("../validators/orderValidator");

const router = express.Router();

router.use(protect);

router.post("/", validate(createOrderSchema), createOrder);
router.get("/my", getMyOrders);
router.get("/:id", getOrderById);

module.exports = router;
