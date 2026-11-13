require("dotenv").config();

const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGO_URI,
  mongoDbName: process.env.MONGO_DB_NAME || "TabibiGo-Users",

  // JWT
  jwtSecret: process.env.JWT_SECRET || "default_jwt_secret_key_tabibigo_2026",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "15m",

  // Refresh Token
  refreshSecret: process.env.REFRESH_SECRET || "default_refresh_secret_key_tabibigo_2026",
  refreshExpiresIn: process.env.REFRESH_EXPIRES_IN || "7d",

  // OTP
  otpSecret: process.env.OTP_SECRET || "default_otp_secret_key_tabibigo_2026",

  // SMTP / Email
  smtpEmail: process.env.SMTP_EMAIL,
  smtpAppPassword: process.env.SMTP_APP_PASSWORD,
};

module.exports = env;
