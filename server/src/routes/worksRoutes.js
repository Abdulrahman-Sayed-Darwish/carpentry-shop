const express = require("express");
const {
  getAllWorks,
  getWorkById,
  createWork,
  updateWork,
  deleteWork,
} = require("../controllers/worksController");
const validate = require("../middlewares/validate");
const { protect, restrictTo } = require("../middlewares/auth");
const {
  createWorkSchema,
  updateWorkSchema,
} = require("../validators/workValidator");

const router = express.Router();

// all
router.get("/", getAllWorks);
router.get("/:id", getWorkById);

// admin only
router.post(
  "/",
  protect,
  restrictTo("admin"),
  validate(createWorkSchema),
  createWork,
);
router.put(
  "/:id",
  protect,
  restrictTo("admin"),
  validate(updateWorkSchema),
  updateWork,
);
router.delete("/:id", protect, restrictTo("admin"), deleteWork);

module.exports = router;
