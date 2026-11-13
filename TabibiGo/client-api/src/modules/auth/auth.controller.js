const {
  registerUser,
  loginUser,
  resetPassword: resetPasswordService,
  getMe,
} = require("./auth.service");

const {
  sendEmailVerificationOTP,
  verifyEmailOTP,
  sendPasswordResetOTP,
  verifyPasswordResetOTP,
} = require("./services/otp.service");



const register = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    const user = await registerUser({ email, password, role });

    return res.status(201).json({
      success: true,
      message: "Account created successfully. Please verify your email.",
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};



const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await loginUser({ email, password });

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


const me = async (req, res, next) => {
  try {
    const user = await getMe(req.user.id);

    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};


const resetPasswordController = async (req, res, next) => {
  try {
    const { resetToken, newPassword } = req.body;

    await resetPasswordService({ resetToken, newPassword });

    return res.status(200).json({
      success: true,
      message: "Password reset successfully.",
    });
  } catch (error) {
    next(error);
  }
};


const sendVerificationOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    await sendEmailVerificationOTP(email);

    return res.status(200).json({
      success: true,
      message: "Verification OTP sent successfully.",
    });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    await verifyEmailOTP({ email, code });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully.",
    });
  } catch (error) {
    next(error);
  }
};


const sendPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;

    await sendPasswordResetOTP(email);

    return res.status(200).json({
      success: true,
      message: "Password reset OTP sent successfully.",
    });
  } catch (error) {
    next(error);
  }
};

const verifyPasswordReset = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    const resetToken = await verifyPasswordResetOTP({ email, code });

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
      data: { resetToken },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  me,
  resetPasswordController,
  sendVerificationOTP,
  verifyEmail,
  sendPasswordReset,
  verifyPasswordReset,
};
