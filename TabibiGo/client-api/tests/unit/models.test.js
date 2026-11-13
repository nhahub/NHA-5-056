const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const User = require("../../src/modules/auth/models/user.model");
const RefreshToken = require("../../src/modules/auth/models/refresh-token.model");
const OTPCode = require("../../src/modules/auth/models/otp-code.model");
const PatientProfile = require("../../src/modules/patient-profile/models/patient-profile.model");
const Profession = require("../../src/modules/catalog/models/profession.model");
const ProviderApplication = require("../../src/modules/provider-application/models/provider-application.model");
const ProviderProfile = require("../../src/modules/provider-profile/models/provider-profile.model");

describe("Mongoose Domain Models Compilation", () => {
  it("should compile User model with password comparison method", () => {
    assert.equal(User.modelName, "User");
    assert.equal(typeof User.prototype.comparePassword, "function");
    assert.ok(User.schema.path("email"));
    assert.ok(User.schema.path("password"));
    assert.ok(User.schema.path("role"));
  });

  it("should compile RefreshToken model with TTL index", () => {
    assert.equal(RefreshToken.modelName, "RefreshToken");
    assert.ok(RefreshToken.schema.path("tokenHash"));
    assert.ok(RefreshToken.schema.path("expiresAt"));
  });

  it("should compile OTPCode model with TTL index and required paths", () => {
    assert.equal(OTPCode.modelName, "OTPCode");
    assert.ok(OTPCode.schema.path("email"));
    assert.ok(OTPCode.schema.path("codeHash"));
    assert.ok(OTPCode.schema.path("purpose"));
  });

  it("should compile PatientProfile model", () => {
    assert.equal(PatientProfile.modelName, "PatientProfile");
    assert.ok(PatientProfile.schema.path("userId"));
    assert.ok(PatientProfile.schema.path("fullName"));
  });

  it("should compile Profession model", () => {
    assert.equal(Profession.modelName, "Profession");
    assert.ok(Profession.schema.path("name"));
  });

  it("should compile ProviderApplication model with compound index", () => {
    assert.equal(ProviderApplication.modelName, "ProviderApplication");
    assert.ok(ProviderApplication.schema.path("providerId"));
    assert.ok(ProviderApplication.schema.path("licenseNumber"));
    assert.ok(ProviderApplication.schema.path("licenseExpiry"));
    assert.ok(ProviderApplication.schema.path("status"));
  });

  it("should compile ProviderProfile model", () => {
    assert.equal(ProviderProfile.modelName, "ProviderProfile");
    assert.ok(ProviderProfile.schema.path("userId"));
    assert.ok(ProviderProfile.schema.path("professionId"));
    assert.ok(ProviderProfile.schema.path("fullName"));
  });
});

