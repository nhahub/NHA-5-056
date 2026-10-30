
const mongoose = require("mongoose");

const patientProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    fullName: {
      type: String,
      required: true,
      trim: true
    },

    dateOfBirth: {
      type: Date
    },

    gender: {
      type: String,
      enum: ["male", "female"]
    },

    location: {
      governorate: {
        type: String,
        trim: true
      },

      city: {
        type: String,
        trim: true
      },

      address: {
        type: String,
        trim: true
      }
    },

    healthInfo: {
      conditions: [{
        type: String,
        trim: true
      }],

      allergies: [{
        type: String,
        trim: true
      }],

      notes: {
        type: String,
        trim: true
      }
    },

    identityStatus: {
      type: String,
      enum: ["none", "pending", "verified", "rejected"],
      default: "none"
    }
  },
  {
    timestamps: true
  }
);

const PatientProfile = mongoose.model(
  "PatientProfile",
  patientProfileSchema,
  "Patient_Profiles"
);

module.exports = PatientProfile;
