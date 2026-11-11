/**
 * Purpose: request Logger.test automated test. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import assert from "node:assert/strict";
// Load node:test so this module can use its exported dependencies.
import test from "node:test";
// Load ../middleware/requestLogger.js so this module can use its exported dependencies.
import requestLogger from "../middleware/requestLogger.js";

// Perform the side effect or state update expressed on the following line.
test("request timing logs omit query strings and their potentially sensitive values", () => {
  // Declare priorNodeEnv for use by the surrounding module or function.
  const priorNodeEnv = process.env.NODE_ENV;
  // Declare priorLog for use by the surrounding module or function.
  const priorLog = console.log;
  // Declare headers for use by the surrounding module or function.
  const headers = {};
  // Declare finish for use by the surrounding module or function.
  let finish;
  // Declare logged for use by the surrounding module or function.
  let logged;
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    process.env.NODE_ENV = "production";
    // Perform the side effect or state update expressed on the following line.
    console.log = (line) => { logged = JSON.parse(line); };
    // Perform the side effect or state update expressed on the following line.
    requestLogger(
      { method: "GET", path: "/api/search", originalUrl: "/api/search?q=private@example.com" },
      {
        setHeader: (key, value) => { headers[key] = value; },
        on: (event, callback) => { if (event === "finish") finish = callback; },
        statusCode: 200,
      },
      () => {},
    );
    // Perform the side effect or state update expressed on the following line.
    finish();
  } finally {
    // Perform the side effect or state update expressed on the following line.
    console.log = priorLog;
    // Check the condition (priorNodeEnv === undefined) and run the matching branch.
    if (priorNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = priorNodeEnv;
  }

  // Perform the side effect or state update expressed on the following line.
  assert.equal(headers["X-Request-ID"], logged.requestId);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(logged.path, "/api/search");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(JSON.stringify(logged).includes("private@example.com"), false);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(logged.status, 200);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(typeof logged.durationMs, "number");
});
