const crypto = require("crypto");
const User = require("./models/user.model");
const OTPCode = require("./models/otp-code.model");
const {
  signAccessToken,
  createRefreshToken,
} = require("../../utils/jwt");


const registerUser = async ({ email, password, role }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    const error = new Error("Email is already registered.");
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({
    email,
    password,
    role,
    emailVerified: false,
  });

  return user;
};

// ─── Login ────────────────────────────────────────────────────────────────────

/**
 * Authenticate a user with email/password.
 * Returns access token, raw refresh token, and a safe user DTO.
 */
const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  if (!user.emailVerified) {
    const error = new Error("Please verify your email first.");
    error.statusCode = 403;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error("Your account is inactive.");
    error.statusCode = 403;
    throw error;
  }

  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  const accessToken = signAccessToken(user);
  const refreshToken = await createRefreshToken(user._id);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
    },
  };
};

// ─── Reset Password ───────────────────────────────────────────────────────────

/**
 * Update a user's password using a verified reset token.
 */
const resetPassword = async ({ resetToken, newPassword }) => {
  const resetTokenHash = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const now = new Date();

  const otpRecord = await OTPCode.findOneAndUpdate(
    {
      resetTokenHash,
      resetTokenExpiresAt: { $gt: now },
      resetCompletedAt: null,
    },
    { $set: { resetCompletedAt: now } },
    { returnDocument: "after" }
  );

  if (!otpRecord) {
    const error = new Error("Invalid or expired reset token.");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({ email: otpRecord.email });

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  user.password = newPassword;
  await user.save();

  return true;
};

// ─── Get Authenticated User ───────────────────────────────────────────────────

/**
 * Return a safe profile DTO for the currently authenticated user.
 */
const getMe = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  return {
    id: user._id,
    email: user.email,
    role: user.role,
    emailVerified: user.emailVerified,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
};

module.exports = {
  registerUser,
  loginUser,
  resetPassword,
  getMe,
};
