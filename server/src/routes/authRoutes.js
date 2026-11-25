const express = require("express");
const {
  login,
  register,
  refresh,
  logout,
} = require("../controllers/authController");
const {
  loginLimiter,
  registerLimiter,
} = require("../middlewares/rateLimiters");
const validate = require("../middlewares/validate");
const { loginSchema, registerSchema } = require("../validators/authValidator");

const router = express.Router();

router.post("/register", registerLimiter, validate(registerSchema), register);
router.post("/login", loginLimiter, validate(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", logout);

module.exports = router;
