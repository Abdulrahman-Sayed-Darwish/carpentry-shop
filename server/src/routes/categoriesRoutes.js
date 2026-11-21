const express = require("express");
const {
  getAllCategories,
  createCategory,
} = require("../controllers/categoriesController");
const validate = require("../middlewares/validate");
const { createCategorySchema } = require("../validators/categoryValidator");

const router = express.Router();

router.get("/", getAllCategories);
router.post("/", validate(createCategorySchema), createCategory);

module.exports = router;
