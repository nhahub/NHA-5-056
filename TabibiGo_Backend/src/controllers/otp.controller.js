
const {
  sendEmailVerificationOTP,
  verifyEmailOTP,
  sendPasswordResetOTP,
  verifyPasswordResetOTP
} = require("../services/otp.service");

// Send Verification OTP
const sendVerificationOTP = async (req, res) => {
  try {
    const { email } = req.body;

    await sendEmailVerificationOTP(email);

    return res.status(200).json({
      success: true,
      message: "Verification OTP sent successfully."
    });

  } catch (error) {
    console.error("Send OTP Error:", error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error."
    });
  }
};

// Verify Email OTP
const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    await verifyEmailOTP({
      email,
      code
    });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully."
    });

  } catch (error) {
    console.error("Verify Email Error:", error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error."
    });
  }
};

// Send Password Reset OTP
const sendPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    await sendPasswordResetOTP(email);

    return res.status(200).json({
      success: true,
      message: "Password reset OTP sent successfully."
    });

  } catch (error) {
    console.error("Password Reset OTP Error:", error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error."
    });
  }
};


const verifyPasswordReset = async (req, res) => {
  try {
    const { email, code } = req.body;

    const resetToken = await verifyPasswordResetOTP({
      email,
      code
    });

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
      data: {
        resetToken
      }
    });

  } catch (error) {
    console.error("Verify Password Reset Error:", error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error."
    });
  }
};


module.exports = {
  sendVerificationOTP,
  verifyEmail,
  sendPasswordReset,
  verifyPasswordReset
};
