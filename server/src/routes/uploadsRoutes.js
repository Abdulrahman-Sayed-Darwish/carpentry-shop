const express = require("express");
const { uploadImages } = require("../controllers/uploadsController");
const { protect, restrictTo } = require("../middlewares/auth");
const { customerUploadLimiter } = require("../middlewares/rateLimiters");
const upload = require("../middlewares/upload");

const router = express.Router();

router.post(
  "/",
  protect,
  restrictTo("admin"),
  upload.array("images", 10),
  uploadImages,
);

router.post(
  "/custom",
  protect,
  restrictTo("customer", "admin"),
  customerUploadLimiter,
  upload.array("images", 5),
  uploadImages,
);

module.exports = router;
