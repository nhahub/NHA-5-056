const { body, validationResult } = require("express-validator");

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: errors.array(),
      });
    }
    next();
  };
};

const createApplicationValidation = validate([
  body("licenseNumber")
    .trim()
    .notEmpty()
    .withMessage("License number is required."),
  body("licenseExpiry")
    .notEmpty()
    .withMessage("License expiry date is required.")
    .isISO8601()
    .withMessage("License expiry must be a valid ISO 8601 date."),
]);

module.exports = {
  createApplicationValidation,
};
