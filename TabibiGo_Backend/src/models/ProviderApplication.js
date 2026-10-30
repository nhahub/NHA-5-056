
const mongoose = require("mongoose");

const providerApplicationSchema = new mongoose.Schema(
  {
    providerId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "ProviderProfile",
  required: true
},

    licenseNumber: {
      type: String,
      required: true,
      trim: true
    },

    licenseExpiry: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: [
        "draft",
        "submitted",
        "under_review",
        "interview_required",
        "approved",
        "rejected"
      ],
      default: "draft"
    },

    submittedAt: {
      type: Date,
      default: null
    },

    decidedAt: {
      type: Date,
      default: null
    },

    decidedByAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },

    decisionReason: {
      type: String,
      trim: true,
      default: null
    }
  },
  {
    timestamps: true
  }
);
providerApplicationSchema.index({
  providerId: 1,
  createdAt: -1
});

const ProviderApplication = mongoose.model(
  "ProviderApplication",
  providerApplicationSchema,
  "Provider_Applications"
);

module.exports = ProviderApplication;
