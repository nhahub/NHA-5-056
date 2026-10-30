const {
  registerUser,
  loginUser,
  resetPassword: resetPasswordService
} = require("../services/auth.service");

// Register
const register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await registerUser({
      email,
      password,
      role
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully. Please verify your email.",
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified
        }
      }
    });

  } catch (error) {
    console.error("Register Error:", error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error."
    });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await loginUser({
      email,
      password
    });

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified
        }
      }
    });

  } catch (error) {
    console.error("Login Error:", error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error."
    });
  }
};

// Reset Password
const resetPasswordController = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    await resetPasswordService({
      resetToken,
      newPassword
    });

    return res.status(200).json({
      success: true,
      message: "Password reset successfully."
    });

  } catch (error) {
    console.error("Reset Password Error:", error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error."
    });
  }
};

module.exports = {
  register,
  login,
  resetPasswordController
};
