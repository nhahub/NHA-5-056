const ProviderProfile = require("../provider-profile/models/provider-profile.model");
const {
  createProviderApplication,
  getMyApplication,
  submitApplication,
} = require("./provider-application.service");

const getProviderProfileFromRequest = async (req) => {
  if (req.providerProfile) {
    return req.providerProfile;
  }
  if (req.user && req.user.id) {
    return ProviderProfile.findOne({ userId: req.user.id });
  }
  return null;
};

const createApplication = async (req, res, next) => {
  try {
    const { licenseNumber, licenseExpiry } = req.body;

    const providerProfile = await getProviderProfileFromRequest(req);
    if (!providerProfile) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found for this user account.",
      });
    }

    const application = await createProviderApplication({
      providerId: providerProfile._id,
      licenseNumber,
      licenseExpiry: new Date(licenseExpiry),
    });

    return res.status(201).json({
      success: true,
      message: "Provider application created successfully.",
      data: { application },
    });
  } catch (error) {
    next(error);
  }
};

const getApplication = async (req, res, next) => {
  try {
    const providerProfile = await getProviderProfileFromRequest(req);
    if (!providerProfile) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found for this user account.",
      });
    }

    const application = await getMyApplication(providerProfile._id);

    return res.status(200).json({
      success: true,
      data: { application },
    });
  } catch (error) {
    next(error);
  }
};

const submitMyApplication = async (req, res, next) => {
  try {
    const providerProfile = await getProviderProfileFromRequest(req);
    if (!providerProfile) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found for this user account.",
      });
    }

    const application = await submitApplication(providerProfile._id);

    return res.status(200).json({
      success: true,
      message: "Provider application submitted successfully.",
      data: { application },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createApplication,
  getApplication,
  submitMyApplication,
};
