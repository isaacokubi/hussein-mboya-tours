import test from "node:test";
import assert from "node:assert/strict";
import { assertSupportedMongoVersion, MINIMUM_MONGODB_VERSION } from "../utils/mongodbVersion.js";

test("MongoDB 4.2 and later meet the runtime minimum", () => {
  assert.equal(assertSupportedMongoVersion("4.2.0"), true);
  assert.equal(assertSupportedMongoVersion("4.4.29"), true);
  assert.equal(assertSupportedMongoVersion("7.0.14"), true);
  assert.equal(assertSupportedMongoVersion("8.0.0"), true);
  assert.equal(assertSupportedMongoVersion("8.2.3"), true);
  assert.equal(assertSupportedMongoVersion("10.0.0"), true);
});

test("older and unidentified MongoDB versions fail with a clear safe error", () => {
  for (const version of ["4.0.29", "3.6.8", "unknown"]) {
    assert.throws(
      () => assertSupportedMongoVersion(version),
      (error) => error.code === "UNSUPPORTED_MONGODB_VERSION" && error.message.includes(MINIMUM_MONGODB_VERSION) && !error.message.includes("mongodb://"),
    );
  }
});
