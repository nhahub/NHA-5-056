const express = require("express");
const router = express.Router();

const {
  register,
  login,
  me,
  resetPasswordController,
  sendVerificationOTP,
  verifyEmail,
  sendPasswordReset,
  verifyPasswordReset,
} = require("./auth.controller");

const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  verifyPasswordResetValidation,
  resetPasswordValidation,
  verifyEmailValidation,
  validateRequest,
} = require("./auth.validation");

const authenticate = require("../../middlewares/authenticate");

// ─── Registration ─────────────────────────────────────────────────────────────

router.post("/register", registerValidation, validateRequest, register);

// ─── Login ────────────────────────────────────────────────────────────────────

router.post("/login", loginValidation, validateRequest, login);

// ─── Authenticated User ───────────────────────────────────────────────────────

router.get("/me", authenticate, me);

// ─── Email Verification ───────────────────────────────────────────────────────

router.post("/send-verification-otp", sendVerificationOTP);

router.post(
  "/verify-email",
  verifyEmailValidation,
  validateRequest,
  verifyEmail
);

// ─── Password Reset Flow ──────────────────────────────────────────────────────

router.post(
  "/forgot-password",
  forgotPasswordValidation,
  validateRequest,
  sendPasswordReset
);

router.post(
  "/verify-password-reset",
  verifyPasswordResetValidation,
  validateRequest,
  verifyPasswordReset
);

router.post(
  "/reset-password",
  resetPasswordValidation,
  validateRequest,
  resetPasswordController
);

module.exports = router;
