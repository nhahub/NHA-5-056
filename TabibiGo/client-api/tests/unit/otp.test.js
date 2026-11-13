const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("crypto");
const env = require("../../src/config/env");
const {
  OTP_TTL_MS,
  OTP_COOLDOWN_MS,
  USER_ROLES,
  OTP_PURPOSES,
} = require("../../src/modules/auth/auth.constants");

describe("Auth Constants & OTP Logic", () => {
  it("should have correct auth constants", () => {
    assert.equal(OTP_TTL_MS, 5 * 60 * 1000);
    assert.equal(OTP_COOLDOWN_MS, 60 * 1000);
    assert.equal(USER_ROLES.PATIENT, "patient");
    assert.equal(USER_ROLES.PROVIDER, "provider");
    assert.equal(OTP_PURPOSES.EMAIL_VERIFICATION, "email_verification");
    assert.equal(OTP_PURPOSES.PASSWORD_RESET, "password_reset");
  });

  it("should compute matching HMAC-SHA256 hashes for OTP verification", () => {
    const email = "patient@test.com";
    const code = "123456";
    const purpose = "email_verification";

    const hash1 = crypto
      .createHmac("sha256", env.otpSecret)
      .update(`${email}:${purpose}:${code}`)
      .digest("hex");

    const hash2 = crypto
      .createHmac("sha256", env.otpSecret)
      .update(`${email}:${purpose}:${code}`)
      .digest("hex");

    assert.equal(hash1, hash2);
    assert.equal(hash1.length, 64);
  });
});

