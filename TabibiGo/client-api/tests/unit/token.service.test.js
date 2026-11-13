const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const {
  signAccessToken,
  verifyAccessToken,
} = require("../../src/modules/auth/services/token.service");

describe("Token Service Unit Tests", () => {
  const dummyUser = {
    _id: "672288301712a4b8cd9e1234",
    role: "patient",
    email: "patient@test.com",
  };

  it("should sign a valid JWT access token and verify its payload", () => {
    const token = signAccessToken(dummyUser);
    assert.ok(typeof token === "string");
    assert.ok(token.split(".").length === 3);

    const decoded = verifyAccessToken(token);
    assert.equal(decoded.sub, dummyUser._id);
    assert.equal(decoded.role, dummyUser.role);
    assert.equal(decoded.email, dummyUser.email);
  });

  it("should fail verification for a tampered token", () => {
    const token = signAccessToken(dummyUser);
    const tampered = token.slice(0, -5) + "abcde";
    assert.throws(() => {
      verifyAccessToken(tampered);
    });
  });
});

