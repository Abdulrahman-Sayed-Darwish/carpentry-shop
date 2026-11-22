const express = require("express");
const {
  login,
  register,
  refresh,
  logout,
} = require("../controllers/authController");
const validate = require("../middlewares/validate");
const { loginSchema, registerSchema } = require("../validators/authValidator");

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", logout);

module.exports = router;
