
const ProviderProfile = require("../models/ProviderProfile");
const ProviderApplication = require("../models/ProviderApplication");

const createProviderApplication = async ({
  providerId,
  licenseNumber,
  licenseExpiry
}) => {
  // 1. Check if the provider exists
  const provider = await ProviderProfile.findById(providerId);

  if (!provider) {
    const error = new Error("Provider profile not found.");
    error.statusCode = 404;
    throw error;
  }

  // 2. Prevent an already approved provider from applying again
  if (provider.isApproved) {
    const error = new Error("This provider is already approved.");
    error.statusCode = 409;
    throw error;
  }

  // 3. Check for an existing active or approved application
  const existingApplication = await ProviderApplication.findOne({
    providerId,
    status: {
      $in: [
        "draft",
        "submitted",
        "under_review",
        "interview_required",
        "approved"
      ]
    }
  });

  if (existingApplication) {
    const error = new Error(
      "You already have an active or approved application."
    );
    error.statusCode = 409;
    throw error;
  }

  // 4. Create a new application
  const application = await ProviderApplication.create({
    providerId,
    licenseNumber,
    licenseExpiry,
    status: "draft"
  });

  return application;
};

module.exports = {
  createProviderApplication
};
