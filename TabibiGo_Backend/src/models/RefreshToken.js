
const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    tokenHash: {
      type: String,
      required: true,
      select: false
    },

    expiresAt: {
      type: Date,
      required: true
    },

    revokedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// TTL Index
refreshTokenSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

const RefreshToken = mongoose.model(
  "RefreshToken",
  refreshTokenSchema,
  "Refresh_Tokens"
);

module.exports = RefreshToken;
