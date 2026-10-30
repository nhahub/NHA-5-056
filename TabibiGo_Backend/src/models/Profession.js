
const mongoose = require("mongoose");

const professionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    description: {
      type: String,
      trim: true
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Profession = mongoose.model(
  "Profession",
  professionSchema,
  "Professions"
);

module.exports = Profession;
