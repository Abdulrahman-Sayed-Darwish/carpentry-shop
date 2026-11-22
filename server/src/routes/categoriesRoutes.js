const express = require("express");
const {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoriesController");
const validate = require("../middlewares/validate");
const { protect, restrictTo } = require("../middlewares/auth");
const {
  createCategorySchema,
  updateCategorySchema,
} = require("../validators/categoryValidator");

const router = express.Router();

// all
router.get("/", getAllCategories);

// admin
router.post(
  "/",
  protect,
  restrictTo("admin"),
  validate(createCategorySchema),
  createCategory,
);
router.put(
  "/:id",
  protect,
  restrictTo("admin"),
  validate(updateCategorySchema),
  updateCategory,
);
router.delete("/:id", protect, restrictTo("admin"), deleteCategory);

module.exports = router;
