/**
 * Purpose: auth Cookie.test automated test. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import test from "node:test";
// Load node:assert/strict so this module can use its exported dependencies.
import assert from "node:assert/strict";
// Load ../utils/authCookie.js so this module can use its exported dependencies.
import { clearAuthCookies, setAuthCookie } from "../utils/authCookie.js";

// Perform the side effect or state update expressed on the following line.
test("setAuthCookie issues an HttpOnly auth cookie and readable CSRF cookie", () => {
  // Declare cookies for use by the surrounding module or function.
  const cookies = [];
  // Declare res for use by the surrounding module or function.
  const res = { cookie(name, value, options) { cookies.push({ name, value, options }); } };

  // Declare csrfToken for use by the surrounding module or function.
  const csrfToken = setAuthCookie(res, "test-jwt");

  // Perform the side effect or state update expressed on the following line.
  assert.equal(cookies.length, 2);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(cookies[0].name, "token");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(cookies[0].value, "test-jwt");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(cookies[0].options.httpOnly, true);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(cookies[0].options.path, "/");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(cookies[1].name, "csrfToken");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(cookies[1].options.httpOnly, false);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(cookies[1].value, csrfToken);
  // Perform the side effect or state update expressed on the following line.
  assert.match(csrfToken, /^[a-f0-9]{64}$/);
});

// Perform the side effect or state update expressed on the following line.
test("clearAuthCookies clears both session cookies", () => {
  // Declare cleared for use by the surrounding module or function.
  const cleared = [];
  // Declare res for use by the surrounding module or function.
  const res = { clearCookie(name, options) { cleared.push({ name, options }); } };

  // Perform the side effect or state update expressed on the following line.
  clearAuthCookies(res);

  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(cleared.map((item) => item.name), ["token", "csrfToken"]);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(cleared[0].options.httpOnly, true);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(cleared[1].options.httpOnly, false);
});
