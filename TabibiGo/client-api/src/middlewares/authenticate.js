const { verifyAccessToken } = require("../utils/jwt");

/**
 * Middleware: verify the Bearer JWT in the Authorization header.
 * Attaches `req.user = { id, role, email }` on success.
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
      error: { code: "UNAUTHENTICATED" },
    });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = verifyAccessToken(token);

    req.user = {
      id: decoded.sub,
      role: decoded.role,
      email: decoded.email,
    };

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
      error: { code: "UNAUTHENTICATED" },
    });
  }
};

module.exports = authenticate;
