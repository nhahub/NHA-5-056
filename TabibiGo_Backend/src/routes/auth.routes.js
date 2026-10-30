
const express = require("express");
const router = express.Router();

// Auth Controllers
const {
  register,
  login,
  resetPasswordController
} = require("../controllers/auth.controller");

// OTP Controllers
const {
  sendVerificationOTP,
  verifyEmail,
  sendPasswordReset,
  verifyPasswordReset
} = require("../controllers/otp.controller");

// Validations
const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  verifyPasswordResetValidation,
  resetPasswordValidation,
  verifyEmailValidation,
  validateRequest
} = require("../middleware/auth.validation");

// Register
router.post(
  "/register",
  registerValidation,
  validateRequest,
  register
);

// Login
router.post(
  "/login",
  loginValidation,
  validateRequest,
  login
);

// Email Verification
router.post(
  "/send-verification-otp",
  sendVerificationOTP
);

router.post(
  "/verify-email",
  verifyEmailValidation,
  validateRequest,
  verifyEmail
);

// Forgot Password
router.post(
  "/forgot-password",
  forgotPasswordValidation,
  validateRequest,
  sendPasswordReset
);

// Verify Password Reset OTP
router.post(
  "/verify-password-reset",
  verifyPasswordResetValidation,
  validateRequest,
  verifyPasswordReset
);

// Reset Password
router.post(
  "/reset-password",
  resetPasswordValidation,
  validateRequest,
  resetPasswordController
);

module.exports = router;
