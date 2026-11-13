const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const env = require("../../../config/env");
const RefreshToken = require("../models/refresh-token.model");

/**
 * Sign a short-lived access token for the given user.
 *
 * @param {object} user - User document or user details ({ _id, role, email })
 * @returns {string} Signed JWT
 */
const signAccessToken = (user) => {
  return jwt.sign(
    {
      sub: (user._id || user.id).toString(),
      role: user.role,
      email: user.email,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
};

/**
 * Create a refresh token, hash it, persist to DB, and return the raw token.
 *
 * @param {string|mongoose.Types.ObjectId} userId
 * @returns {Promise<string>} Raw unhashed refresh token
 */
const createRefreshToken = async (userId) => {
  const rawToken = crypto.randomBytes(40).toString("hex");
  const tokenHash = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await RefreshToken.create({ userId, tokenHash, expiresAt });

  return rawToken;
};

/**
 * Verify an access JWT and return the decoded payload (throws on failure).
 *
 * @param {string} token - Bearer JWT string
 * @returns {object} Decoded payload
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, env.jwtSecret);
};

/**
 * Find a refresh token record by hashing the raw token.
 *
 * @param {string} rawToken
 * @returns {Promise<object|null>} Refresh token document if active
 */
const findRefreshToken = async (rawToken) => {
  const tokenHash = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  return RefreshToken.findOne({
    tokenHash,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  }).select("+tokenHash");
};

/**
 * Revoke a refresh token by its raw value.
 *
 * @param {string} rawToken
 */
const revokeRefreshToken = async (rawToken) => {
  const tokenHash = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  await RefreshToken.findOneAndUpdate(
    { tokenHash, revokedAt: null },
    { $set: { revokedAt: new Date() } }
  );
};

/**
 * Revoke all refresh tokens for a given user (used on logout-all).
 *
 * @param {string|mongoose.Types.ObjectId} userId
 */
const revokeAllRefreshTokens = async (userId) => {
  await RefreshToken.updateMany(
    { userId, revokedAt: null },
    { $set: { revokedAt: new Date() } }
  );
};

module.exports = {
  signAccessToken,
  createRefreshToken,
  verifyAccessToken,
  findRefreshToken,
  revokeRefreshToken,
  revokeAllRefreshTokens,
};

