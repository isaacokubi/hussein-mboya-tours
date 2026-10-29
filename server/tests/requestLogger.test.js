import assert from "node:assert/strict";
import test from "node:test";
import requestLogger from "../middleware/requestLogger.js";

test("request timing logs omit query strings and their potentially sensitive values", () => {
  const priorNodeEnv = process.env.NODE_ENV;
  const priorLog = console.log;
  const headers = {};
  let finish;
  let logged;
  try {
    process.env.NODE_ENV = "production";
    console.log = (line) => { logged = JSON.parse(line); };
    requestLogger(
      { method: "GET", path: "/api/search", originalUrl: "/api/search?q=private@example.com" },
      {
        setHeader: (key, value) => { headers[key] = value; },
        on: (event, callback) => { if (event === "finish") finish = callback; },
        statusCode: 200,
      },
      () => {},
    );
    finish();
  } finally {
    console.log = priorLog;
    if (priorNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = priorNodeEnv;
  }

  assert.equal(headers["X-Request-ID"], logged.requestId);
  assert.equal(logged.path, "/api/search");
  assert.equal(JSON.stringify(logged).includes("private@example.com"), false);
  assert.equal(logged.status, 200);
  assert.equal(typeof logged.durationMs, "number");
});
