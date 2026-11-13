const ProviderProfile = require("../provider-profile/models/provider-profile.model");
const ProviderApplication = require("./models/provider-application.model");

/**
 * Create a new draft provider application.
 */
const createProviderApplication = async ({
  providerId,
  licenseNumber,
  licenseExpiry,
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
        "approved",
      ],
    },
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
    status: "draft",
  });

  return application;
};

/**
 * Get current application for a provider.
 */
const getMyApplication = async (providerId) => {
  const application = await ProviderApplication.findOne({ providerId }).sort({
    createdAt: -1,
  });

  return application;
};

/**
 * Submit an application that was in draft status.
 */
const submitApplication = async (providerId) => {
  const application = await ProviderApplication.findOne({
    providerId,
    status: "draft",
  }).sort({ createdAt: -1 });

  if (!application) {
    const error = new Error("No draft application found to submit.");
    error.statusCode = 404;
    throw error;
  }

  application.status = "submitted";
  application.submittedAt = new Date();
  await application.save();

  return application;
};

module.exports = {
  createProviderApplication,
  getMyApplication,
  submitApplication,
};
