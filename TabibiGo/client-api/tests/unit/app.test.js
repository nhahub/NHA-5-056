const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const app = require("../../src/app");
const { createMockReqRes } = require("../helpers/mock-request");

describe("App Infrastructure & Base Endpoints", () => {
  it("GET / should return backend running status", async () => {
    const response = await createMockReqRes(app, { method: "GET", url: "/" });
    assert.equal(response.statusCode, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.message, "TabibiGo Backend is Running!");
  });

  it("GET /health should return health check response", async () => {
    const response = await createMockReqRes(app, { method: "GET", url: "/health" });
    assert.equal(response.statusCode, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.message, "TabibiGo Client API is healthy");
  });

  it("GET /unknown-route should return structured 404", async () => {
    const response = await createMockReqRes(app, { method: "GET", url: "/unknown-route" });
    assert.equal(response.statusCode, 404);
    assert.equal(response.body.success, false);
    assert.equal(response.body.error.code, "NOT_FOUND");
  });
});
