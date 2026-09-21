import test from "node:test";
import assert from "node:assert/strict";
import { clearAuthCookies, setAuthCookie } from "../utils/authCookie.js";

test("setAuthCookie issues an HttpOnly auth cookie and readable CSRF cookie", () => {
  const cookies = [];
  const res = { cookie(name, value, options) { cookies.push({ name, value, options }); } };

  const csrfToken = setAuthCookie(res, "test-jwt");

  assert.equal(cookies.length, 2);
  assert.equal(cookies[0].name, "token");
  assert.equal(cookies[0].value, "test-jwt");
  assert.equal(cookies[0].options.httpOnly, true);
  assert.equal(cookies[0].options.path, "/");
  assert.equal(cookies[1].name, "csrfToken");
  assert.equal(cookies[1].options.httpOnly, false);
  assert.equal(cookies[1].value, csrfToken);
  assert.match(csrfToken, /^[a-f0-9]{64}$/);
});

test("clearAuthCookies clears both session cookies", () => {
  const cleared = [];
  const res = { clearCookie(name, options) { cleared.push({ name, options }); } };

  clearAuthCookies(res);

  assert.deepEqual(cleared.map((item) => item.name), ["token", "csrfToken"]);
  assert.equal(cleared[0].options.httpOnly, true);
  assert.equal(cleared[1].options.httpOnly, false);
});
