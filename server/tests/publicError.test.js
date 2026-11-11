/**
 * Purpose: public Error.test automated test. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import assert from "node:assert/strict";
// Load node:test so this module can use its exported dependencies.
import test from "node:test";
// Load ../utils/publicError.js so this module can use its exported dependencies.
import { publicErrorMessage } from "../utils/publicError.js";

// Perform the side effect or state update expressed on the following line.
test("public errors hide server details in production and preserve safe client errors", () => {
  // Declare original for use by the surrounding module or function.
  const original = process.env.NODE_ENV;
  // Perform the side effect or state update expressed on the following line.
  process.env.NODE_ENV = "production";
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    assert.equal(publicErrorMessage(new Error("database host leaked")), "Internal server error");
    // Perform the side effect or state update expressed on the following line.
    assert.equal(publicErrorMessage(Object.assign(new Error("private duplicate details"), { code: 11000 })), "A record with these unique details already exists.");
    // Perform the side effect or state update expressed on the following line.
    assert.equal(publicErrorMessage(Object.assign(new Error("bad customer input"), { status: 400 })), "bad customer input");
    // Perform the side effect or state update expressed on the following line.
    assert.equal(publicErrorMessage(Object.assign(new Error("M-Pesa is not configured for this tenant."), { status: 503, expose: true })), "M-Pesa is not configured for this tenant.");
    // Perform the side effect or state update expressed on the following line.
    assert.equal(publicErrorMessage(Object.assign(new Error("validation internals"), { name: "ValidationError" })), "Invalid request data.");
  } finally {
    // Check the condition (original === undefined) and run the matching branch.
    if (original === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = original;
  }
});
