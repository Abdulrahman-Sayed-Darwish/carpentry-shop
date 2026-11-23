const express = require("express");
const { uploadImages } = require("../controllers/uploadsController");
const { protect, restrictTo } = require("../middlewares/auth");
const upload = require("../middlewares/upload");

const router = express.Router();

router.post(
  "/",
  protect,
  restrictTo("admin"),
  upload.array("images", 10),
  uploadImages,
);

module.exports = router;
