
const { body, validationResult } = require("express-validator");

// Register Validation
const registerValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .bail()
    .isEmail()
    .withMessage("Please enter a valid email.")
    .normalizeEmail(),

  body("password")
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
    .withMessage("Password must contain a number."),

  body("role")
    .notEmpty()
    .withMessage("Role is required.")
    .bail()
    .isIn(["patient", "provider"])
    .withMessage("Role must be patient or provider.")
];

// Login Validation
const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .bail()
    .isEmail()
    .withMessage("Please enter a valid email.")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required.")
];

const forgotPasswordValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .bail()
    .isEmail()
    .withMessage("Please enter a valid email.")
    .normalizeEmail()
];
const verifyPasswordResetValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .bail()
    .isEmail()
    .withMessage("Please enter a valid email.")
    .normalizeEmail(),

  body("code")
    .notEmpty()
    .withMessage("OTP code is required.")
    .bail()
    .matches(/^\d{6}$/)
    .withMessage("OTP must be exactly 6 digits.")
];
// Reset Password Validation
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
    .withMessage("Password must contain a number.")
];


// Verify Email Validation
const verifyEmailValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .bail()
    .isEmail()
    .withMessage("Please enter a valid email.")
    .normalizeEmail(),

  body("code")
    .notEmpty()
    .withMessage("OTP code is required.")
    .bail()
    .matches(/^\d{6}$/)
    .withMessage("OTP must be exactly 6 digits.")
];

// Validate Request
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg
      }))
    });
  }

  next();
};

module.exports = {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  verifyPasswordResetValidation,
  verifyEmailValidation,
  resetPasswordValidation,
  validateRequest
};