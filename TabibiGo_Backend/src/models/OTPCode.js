
const mongoose = require("mongoose");

const otpCodeSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    codeHash: {
      type: String,
      required: true,
      select: false
    },

    purpose: {
      type: String,
      enum: ["sign_in", "email_verification", "password_reset"],
      required: true
    },

    expiresAt: {
      type: Date,
      required: true
    },

    attempts: {
      type: Number,
      default: 0,
      min: 0
    },

    consumedAt: {
      type: Date,
      default: null
    },

    resetCompletedAt: {
      type: Date,
      default: null
    },

    resetTokenHash: {
      type: String,
      default: null,
      select: false
    },

    resetTokenExpiresAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

otpCodeSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

const OTPCode = mongoose.model(
  "OTPCode",
  otpCodeSchema,
  "Otp_Codes"
);

module.exports = OTPCode;
