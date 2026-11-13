/**
 * Middleware factory: allow only users whose role is in the given list.
 * Must be used AFTER the `authenticate` middleware.
 *
 * @param {...string} roles - Allowed roles, e.g. authorizeRoles("patient", "provider")
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource.",
        error: { code: "FORBIDDEN" },
      });
    }

    next();
  };
};

module.exports = authorizeRoles;
