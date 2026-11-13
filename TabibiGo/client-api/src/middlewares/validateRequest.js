const { validationResult } = require("express-validator");

/**
 * Reusable middleware to validate request input against express-validator rules.
 * Returns 400 with structured validation errors when invalid.
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
      })),
    });
  }

  next();
};

module.exports = validateRequest;

