const express = require("express");
const {
  getAllWorks,
  getWorkById,
  createWork,
} = require("../controllers/worksController");
const validate = require("../middlewares/validate");
const { createWorkSchema } = require("../validators/workValidator");

const router = express.Router();

router.get("/", getAllWorks);
router.get("/:id", getWorkById);
router.post("/", validate(createWorkSchema), createWork);

module.exports = router;
