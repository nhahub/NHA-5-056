/**
 * Global error-handling middleware.
 * Formats every error thrown or passed via next(error) into the standard
 * response envelope: { success, message, error: { code } }
 *
 * IMPORTANT: Express identifies an error handler by its 4-parameter signature;
 * keep (err, req, res, next) even when next is unused.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Log internal details (never expose stack to clients in production)
  if (process.env.NODE_ENV !== "production") {
    console.error("[Error]", err);
  } else {
    console.error(`[Error] ${err.statusCode || 500} — ${err.message}`);
  }

  const statusCode = err.statusCode || 500;

  const errorCode = err.code || (statusCode === 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR");

  const message =
    statusCode === 500
      ? "An unexpected error occurred. Please try again later."
      : err.message || "Request failed.";

  return res.status(statusCode).json({
    success: false,
    message,
    error: { code: errorCode },
  });
};

module.exports = errorHandler;
