const express = require("express");
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productsController");
const validate = require("../middlewares/validate");
const { protect, restrictTo, optionalAuth } = require("../middlewares/auth");
const {
  createProductSchema,
  updateProductSchema,
} = require("../validators/productValidator");

const router = express.Router();

// all
router.get("/", optionalAuth, getAllProducts);
router.get("/:id", optionalAuth, getProductById);

// admin only
router.post(
  "/",
  protect,
  restrictTo("admin"),
  validate(createProductSchema),
  createProduct,
);
router.put(
  "/:id",
  protect,
  restrictTo("admin"),
  validate(updateProductSchema),
  updateProduct,
);
router.delete("/:id", protect, restrictTo("admin"), deleteProduct);

module.exports = router;
