const { body } = require("express-validator");
const validateRequest = require("../../middlewares/validateRequest");

// ─── Reusable field rules ─────────────────────────────────────────────────────

const emailRule = body("email")
  .trim()
  .notEmpty()
  .withMessage("Email is required.")
  .bail()
  .isEmail()
  .withMessage("Please enter a valid email.")
  .normalizeEmail();

const passwordRule = body("password")
  .notEmpty()
  .withMessage("Password is required.")
  .bail()
  .isLength({ min: 8 })
  .withMessage("Password must be at least 8 characters.")
  .matches(/[a-z]/)
  .withMessage("Password must contain a lowercase letter.")
  .matches(/[A-Z]/)
  .withMessage("Password must contain an uppercase letter.")
  .matches(/[0-9]/)
  .withMessage("Password must contain a number.");

const otpCodeRule = body("code")
  .notEmpty()
  .withMessage("OTP code is required.")
  .bail()
  .matches(/^\d{6}$/)
  .withMessage("OTP must be exactly 6 digits.");

// ─── Validation Chains ────────────────────────────────────────────────────────

const registerValidation = [
  emailRule,
  passwordRule,
  body("role")
    .notEmpty()
    .withMessage("Role is required.")
    .bail()
    .isIn(["patient", "provider"])
    .withMessage("Role must be patient or provider."),
];

const loginValidation = [
  emailRule,
  body("password").notEmpty().withMessage("Password is required."),
];

const forgotPasswordValidation = [emailRule];

const verifyPasswordResetValidation = [emailRule, otpCodeRule];

const resetPasswordValidation = [
  body("resetToken")
    .notEmpty()
    .withMessage("Reset token is required.")
    .bail()
    .isHexadecimal()
    .withMessage("Invalid reset token.")
    .isLength({ min: 64, max: 64 })
    .withMessage("Invalid reset token."),

  body("newPassword")
    .notEmpty()
    .withMessage("New password is required.")
    .bail()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters.")
    .matches(/[a-z]/)
    .withMessage("Password must contain a lowercase letter.")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter.")
    .matches(/[0-9]/)
    .withMessage("Password must contain a number."),
];

const verifyEmailValidation = [emailRule, otpCodeRule];

module.exports = {
  validateRequest,
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  verifyPasswordResetValidation,
  resetPasswordValidation,
  verifyEmailValidation,
};
