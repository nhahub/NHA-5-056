
const {
  createProviderApplication
} = require("../services/providerApplication.service");

const createApplication = async (req, res) => {
  try {
    const {
      licenseNumber,
      licenseExpiry
    } = req.body;

    // 1. Validate required fields
    if (!licenseNumber || !licenseExpiry) {
      return res.status(400).json({
        success: false,
        message: "License number and expiry date are required."
      });
    }

    // 2. Validate expiry date format
    const expiryDate = new Date(licenseExpiry);

    if (Number.isNaN(expiryDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid license expiry date."
      });
    }

    // 3. Get provider ID from authenticated user
    const providerId = req.providerProfile._id;

    // 4. Call service
    const application = await createProviderApplication({
      providerId,
      licenseNumber,
      licenseExpiry: expiryDate
    });

    // 5. Send response
    return res.status(201).json({
      success: true,
      message: "Provider application created successfully.",
      data: {
        application
      }
    });

  } catch (error) {
    console.error("Create Application Error:", error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error."
    });
  }
};

module.exports = {
  createApplication
};
