const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const app = require("../../src/app");
const { createMockReqRes } = require("../helpers/mock-request");

describe("API Routes Input Validation Tests", () => {
  it("POST /api/auth/register should fail validation for missing fields", async () => {
    const res = await createMockReqRes(app, {
      method: "POST",
      url: "/api/auth/register",
      body: {},
    });
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.ok(Array.isArray(res.body.errors));
    const fields = res.body.errors.map((e) => e.field);
    assert.ok(fields.includes("email"));
    assert.ok(fields.includes("password"));
    assert.ok(fields.includes("role"));
  });

  it("POST /api/auth/register should fail validation for invalid role", async () => {
    const res = await createMockReqRes(app, {
      method: "POST",
      url: "/api/auth/register",
      body: {
        email: "valid@email.com",
        password: "Password123",
        role: "admin",
      },
    });
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    const roleError = res.body.errors.find((e) => e.field === "role");
    assert.ok(roleError);
  });

  it("POST /api/auth/login should fail validation when fields are empty", async () => {
    const res = await createMockReqRes(app, {
      method: "POST",
      url: "/api/auth/login",
      body: { email: "", password: "" },
    });
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.ok(Array.isArray(res.body.errors));
  });

  it("POST /api/auth/verify-email should reject invalid OTP format", async () => {
    const res = await createMockReqRes(app, {
      method: "POST",
      url: "/api/auth/verify-email",
      body: {
        email: "test@tabibigo.com",
        code: "123",
      },
    });
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    const codeError = res.body.errors.find((e) => e.field === "code");
    assert.ok(codeError);
  });

  it("POST /api/auth/reset-password should reject invalid resetToken format", async () => {
    const res = await createMockReqRes(app, {
      method: "POST",
      url: "/api/auth/reset-password",
      body: {
        resetToken: "short-invalid-token",
        newPassword: "NewPassword123",
      },
    });
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    const tokenError = res.body.errors.find((e) => e.field === "resetToken");
    assert.ok(tokenError);
  });

  it("POST /api/provider/application without authorization token should return 401 UNAUTHENTICATED", async () => {
    const res = await createMockReqRes(app, {
      method: "POST",
      url: "/api/provider/application",
      body: {
        licenseNumber: "MED-12345",
        licenseExpiry: "2030-01-01",
      },
    });
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, "UNAUTHENTICATED");
  });
});
