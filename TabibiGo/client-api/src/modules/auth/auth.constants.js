

const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_COOLDOWN_MS = 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const OTP_LENGTH = 6;

const RESET_TOKEN_TTL_MS = 5 * 60 * 1000;

const USER_ROLES = Object.freeze({
  PATIENT: "patient",
  PROVIDER: "provider",
});

const OTP_PURPOSES = Object.freeze({
  EMAIL_VERIFICATION: "email_verification",
  PASSWORD_RESET: "password_reset",
  SIGN_IN: "sign_in",
});

module.exports = {
  OTP_TTL_MS,
  OTP_COOLDOWN_MS,
  OTP_MAX_ATTEMPTS,
  OTP_LENGTH,
  RESET_TOKEN_TTL_MS,
  USER_ROLES,
  OTP_PURPOSES,
};
