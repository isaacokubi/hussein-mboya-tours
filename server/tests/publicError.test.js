import assert from "node:assert/strict";
import test from "node:test";
import { publicErrorMessage } from "../utils/publicError.js";

test("public errors hide server details in production and preserve safe client errors", () => {
  const original = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  try {
    assert.equal(publicErrorMessage(new Error("database host leaked")), "Internal server error");
    assert.equal(publicErrorMessage(Object.assign(new Error("private duplicate details"), { code: 11000 })), "A record with these unique details already exists.");
    assert.equal(publicErrorMessage(Object.assign(new Error("bad customer input"), { status: 400 })), "bad customer input");
    assert.equal(publicErrorMessage(Object.assign(new Error("M-Pesa is not configured for this tenant."), { status: 503, expose: true })), "M-Pesa is not configured for this tenant.");
    assert.equal(publicErrorMessage(Object.assign(new Error("validation internals"), { name: "ValidationError" })), "Invalid request data.");
  } finally {
    if (original === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = original;
  }
});
