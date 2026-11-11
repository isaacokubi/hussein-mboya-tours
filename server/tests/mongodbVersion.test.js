/**
 * Purpose: mongodb Version.test automated test. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import test from "node:test";
// Load node:assert/strict so this module can use its exported dependencies.
import assert from "node:assert/strict";
// Load ../utils/mongodbVersion.js so this module can use its exported dependencies.
import { assertSupportedMongoVersion, MINIMUM_MONGODB_VERSION } from "../utils/mongodbVersion.js";

// Perform the side effect or state update expressed on the following line.
test("MongoDB 4.2 and later meet the runtime minimum", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.equal(assertSupportedMongoVersion("4.2.0"), true);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(assertSupportedMongoVersion("4.4.29"), true);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(assertSupportedMongoVersion("7.0.14"), true);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(assertSupportedMongoVersion("8.0.0"), true);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(assertSupportedMongoVersion("8.2.3"), true);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(assertSupportedMongoVersion("10.0.0"), true);
});

// Perform the side effect or state update expressed on the following line.
test("older and unidentified MongoDB versions fail with a clear safe error", () => {
  // Repeat the enclosed work for each required iteration.
  for (const version of ["4.0.29", "3.6.8", "unknown"]) {
    // Perform the side effect or state update expressed on the following line.
    assert.throws(
      () => assertSupportedMongoVersion(version),
      (error) => error.code === "UNSUPPORTED_MONGODB_VERSION" && error.message.includes(MINIMUM_MONGODB_VERSION) && !error.message.includes("mongodb://"),
    );
  }
});
