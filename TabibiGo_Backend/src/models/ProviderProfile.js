
const mongoose = require("mongoose");

const providerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    professionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profession",
      required: true
    },

    fullName: {
      type: String,
      required: true,
      trim: true
    },

    photoUrl: {
      type: String,
      default: null
    },

    bio: {
      type: String,
      trim: true
    },

    yearsOfExperience: {
      type: Number,
      min: 0,
      default: 0
    },

    education: [{
      degree: String,
      institution: String,
      graduationYear: Number
    }],

    certifications: [{
      name: String,
      issuer: String,
      certificateUrl: String
    }],

    serviceArea: [{
      governorate: String,
      city: String
    }],

    availability: [{
      day: {
        type: String,
        enum: [
          "saturday",
          "sunday",
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday"
        ]
      },
      startTime: String,
      endTime: String
    }],

    baseLocation: {
      type: {
        type: String,
        enum: ["Point"]
      },
      coordinates: {
        type: [Number]
      }
    },

    isApproved: {
      type: Boolean,
      default: false
    },

    ratingAvg: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },

    ratingCount: {
      type: Number,
      default: 0,
      min: 0
    },

    balance: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Geospatial index
providerProfileSchema.index({
  baseLocation: "2dsphere"
});

const ProviderProfile = mongoose.model(
  "ProviderProfile",
  providerProfileSchema,
  "Provider_Profiles"
);

module.exports = ProviderProfile;
