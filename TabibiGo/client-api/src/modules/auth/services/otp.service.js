const crypto = require("crypto");
const env = require("../../../config/env");
const OTPCode = require("../models/otp-code.model");
const User = require("../models/user.model");
const { sendEmail } = require("../../../integrations/email/email.service");

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Generate a random 6-digit OTP code.
 */
const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Hash an OTP using HMAC-SHA256 with the OTP_SECRET.
 */
const hashOTP = (email, code, purpose) => {
  return crypto
    .createHmac("sha256", env.otpSecret)
    .update(`${email}:${purpose}:${code}`)
    .digest("hex");
};

/**
 * Persist a new OTP record and return the raw code.
 */
const createOTP = async (email, purpose) => {
  const code = generateOTP();
  const codeHash = hashOTP(email, code, purpose);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await OTPCode.create({ email, codeHash, purpose, expiresAt });

  return code;
};

// ─── Email Verification OTP ──────────────────────────────────────────────────

/**
 * Send an email-verification OTP to the user's address.
 */
const sendEmailVerificationOTP = async (email) => {
  email = email.trim().toLowerCase();

  const user = await User.findOne({ email });

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  if (user.emailVerified) {
    const error = new Error("Email is already verified.");
    error.statusCode = 409;
    throw error;
  }

  // Prevent requests more often than every 60 seconds
  const recentOTP = await OTPCode.findOne({
    email,
    purpose: "email_verification",
    createdAt: { $gt: new Date(Date.now() - 60 * 1000) },
  });

  if (recentOTP) {
    const error = new Error(
      "Please wait 60 seconds before requesting another OTP."
    );
    error.statusCode = 429;
    throw error;
  }

  // Remove previous unused OTPs for this purpose
  await OTPCode.deleteMany({
    email,
    purpose: "email_verification",
    consumedAt: null,
  });

  const code = await createOTP(email, "email_verification");

  try {
    await sendEmail({
      to: email,
      subject: "TabibiGo - Email Verification",
      text: `Your verification code is: ${code}. It expires in 5 minutes.`,
      html: `
        <h2>Welcome to TabibiGo!</h2>
        <p>Use the following code to verify your email:</p>
        <h1 style="letter-spacing: 5px;">${code}</h1>
        <p>This code expires in 5 minutes.</p>
        <p>If you did not request this code, please ignore this email.</p>
      `,
    });
  } catch {
    // Roll back the OTP if email delivery fails
    await OTPCode.deleteOne({
      email,
      purpose: "email_verification",
      codeHash: hashOTP(email, code, "email_verification"),
    });

    const emailError = new Error("Failed to send verification email.");
    emailError.statusCode = 502;
    throw emailError;
  }

  return true;
};

/**
 * Verify an email-verification OTP and mark the user's email as verified.
 */
const verifyEmailOTP = async ({ email, code }) => {
  email = email.trim().toLowerCase();

  const user = await User.findOne({ email });

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  if (user.emailVerified) {
    const error = new Error("Email is already verified.");
    error.statusCode = 409;
    throw error;
  }

  const otpRecord = await OTPCode.findOne({
    email,
    purpose: "email_verification",
    consumedAt: null,
  })
    .sort({ createdAt: -1 })
    .select("+codeHash");

  if (!otpRecord) {
    const error = new Error("Invalid or expired OTP.");
    error.statusCode = 400;
    throw error;
  }

  const now = new Date();

  if (otpRecord.expiresAt <= now) {
    const error = new Error("OTP has expired.");
    error.statusCode = 400;
    throw error;
  }

  if (otpRecord.attempts >= 5) {
    const error = new Error("Maximum OTP attempts exceeded.");
    error.statusCode = 429;
    throw error;
  }

  const submittedHash = hashOTP(email, code, "email_verification");
  const submittedBuffer = Buffer.from(submittedHash, "hex");
  const savedBuffer = Buffer.from(otpRecord.codeHash, "hex");

  const isMatch =
    submittedBuffer.length === savedBuffer.length &&
    crypto.timingSafeEqual(submittedBuffer, savedBuffer);

  if (!isMatch) {
    const updatedOTP = await OTPCode.findOneAndUpdate(
      {
        _id: otpRecord._id,
        consumedAt: null,
        expiresAt: { $gt: now },
        attempts: { $lt: 5 },
      },
      { $inc: { attempts: 1 } },
      { returnDocument: "after" }
    );

    if (!updatedOTP || updatedOTP.attempts >= 5) {
      const error = new Error("Maximum OTP attempts exceeded.");
      error.statusCode = 429;
      throw error;
    }

    const error = new Error("Incorrect OTP.");
    error.statusCode = 400;
    throw error;
  }

  // Consume the OTP atomically to prevent reuse
  const consumedOTP = await OTPCode.findOneAndUpdate(
    {
      _id: otpRecord._id,
      consumedAt: null,
      expiresAt: { $gt: now },
      attempts: { $lt: 5 },
    },
    { $set: { consumedAt: now } },
    { returnDocument: "after" }
  );

  if (!consumedOTP) {
    const error = new Error("OTP is no longer valid.");
    error.statusCode = 400;
    throw error;
  }

  user.emailVerified = true;
  await user.save();

  return true;
};

// ─── Password Reset OTP ──────────────────────────────────────────────────────

/**
 * Send a password-reset OTP to the user's address.
 */
const sendPasswordResetOTP = async (email) => {
  email = email.trim().toLowerCase();

  const user = await User.findOne({ email });

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  const recentOTP = await OTPCode.findOne({
    email,
    purpose: "password_reset",
    createdAt: { $gt: new Date(Date.now() - 60 * 1000) },
  });

  if (recentOTP) {
    const error = new Error(
      "Please wait 60 seconds before requesting another OTP."
    );
    error.statusCode = 429;
    throw error;
  }

  await OTPCode.deleteMany({
    email,
    purpose: "password_reset",
    consumedAt: null,
  });

  const code = await createOTP(email, "password_reset");

  try {
    await sendEmail({
      to: email,
      subject: "TabibiGo - Password Reset",
      text: `Your password reset code is: ${code}. It expires in 5 minutes.`,
      html: `
        <h2>TabibiGo Password Reset</h2>
        <p>Use the following code to reset your password:</p>
        <h1 style="letter-spacing: 5px;">${code}</h1>
        <p>This code expires in 5 minutes.</p>
        <p>If you did not request this code, please ignore this email.</p>
      `,
    });
  } catch {
    await OTPCode.deleteOne({
      email,
      purpose: "password_reset",
      codeHash: hashOTP(email, code, "password_reset"),
    });

    const emailError = new Error("Failed to send password reset email.");
    emailError.statusCode = 502;
    throw emailError;
  }

  return true;
};

/**
 * Verify a password-reset OTP and return a one-time reset token.
 */
const verifyPasswordResetOTP = async ({ email, code }) => {
  email = email.trim().toLowerCase();

  const user = await User.findOne({ email });

  if (!user) {
    const error = new Error("Invalid or expired OTP.");
    error.statusCode = 400;
    throw error;
  }

  const otpRecord = await OTPCode.findOne({
    email,
    purpose: "password_reset",
    consumedAt: null,
  })
    .sort({ createdAt: -1 })
    .select("+codeHash");

  if (!otpRecord || otpRecord.expiresAt <= new Date()) {
    const error = new Error("Invalid or expired OTP.");
    error.statusCode = 400;
    throw error;
  }

  if (otpRecord.attempts >= 5) {
    const error = new Error("Maximum OTP attempts exceeded.");
    error.statusCode = 429;
    throw error;
  }

  const submittedHash = hashOTP(email, code, "password_reset");
  const submittedBuffer = Buffer.from(submittedHash, "hex");
  const savedBuffer = Buffer.from(otpRecord.codeHash, "hex");

  const isMatch =
    submittedBuffer.length === savedBuffer.length &&
    crypto.timingSafeEqual(submittedBuffer, savedBuffer);

  if (!isMatch) {
    const updatedOTP = await OTPCode.findOneAndUpdate(
      {
        _id: otpRecord._id,
        consumedAt: null,
        expiresAt: { $gt: new Date() },
        attempts: { $lt: 5 },
      },
      { $inc: { attempts: 1 } },
      { returnDocument: "after" }
    );

    if (!updatedOTP || updatedOTP.attempts >= 5) {
      const error = new Error("Maximum OTP attempts exceeded.");
      error.statusCode = 429;
      throw error;
    }

    const error = new Error("Incorrect OTP.");
    error.statusCode = 400;
    throw error;
  }

  // Generate a secure single-use password reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenHash = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const now = new Date();

  const consumedOTP = await OTPCode.findOneAndUpdate(
    {
      _id: otpRecord._id,
      consumedAt: null,
      expiresAt: { $gt: now },
      attempts: { $lt: 5 },
    },
    {
      $set: {
        consumedAt: now,
        resetTokenHash,
        resetTokenExpiresAt: new Date(now.getTime() + 5 * 60 * 1000),
      },
    },
    { returnDocument: "after" }
  );

  if (!consumedOTP) {
    const error = new Error("OTP is no longer valid.");
    error.statusCode = 400;
    throw error;
  }

  return resetToken;
};

module.exports = {
  hashOTP,
  sendEmailVerificationOTP,
  verifyEmailOTP,
  sendPasswordResetOTP,
  verifyPasswordResetOTP,
};
