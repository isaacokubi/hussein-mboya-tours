/**
 * Purpose: verify Demo Local Api operational script. Main declarations: expectedRole, tenantSlug, request.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import "dotenv/config";
// Load node:assert/strict so this module can use its exported dependencies.
import assert from "node:assert/strict";
// Load node:http so this module can use its exported dependencies.
import http from "node:http";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../seeds/completeTestDemoSeed.js so this module can use its exported dependencies.
import { TEST_LOGIN_EMAILS } from "../seeds/completeTestDemoSeed.js";
// Load ../startup/readiness.js so this module can use its exported dependencies.
import { setStartupPhase } from "../startup/readiness.js";

// Declare expectedRole for use by the surrounding module or function.
const expectedRole = (email) => {
  // Check the condition (email === "superadmin1@husseinmboya.com") and run the matching branch.
  if (email === "superadmin1@husseinmboya.com") return "super_admin";
  // Declare local for use by the surrounding module or function.
  const local = email.split("@")[0];
  // Check the condition (local === "admin1") and run the matching branch.
  if (local === "admin1") return "admin";
  // Check the condition (local === "tourmanager1") and run the matching branch.
  if (local === "tourmanager1") return "tour_manager";
  // Check the condition (local.startsWith("agent")) and run the matching branch.
  if (local.startsWith("agent")) return "agent";
  // Check the condition (local.startsWith("guide")) and run the matching branch.
  if (local.startsWith("guide")) return "tour_guide";
  // Check the condition (local.startsWith("driver")) and run the matching branch.
  if (local.startsWith("driver")) return "driver";
  // Return a configured text value to the caller.
  return "customer";
};
// Declare tenantSlug for use by the surrounding module or function.
const tenantSlug = (email) => email === "superadmin1@husseinmboya.com" ? null
  : email.endsWith("@husseinmboya.com") ? "hussein-mboya"
    : email.endsWith("@amanitrails.com") ? "amani-trails"
      : email.endsWith("@demosafari.com") ? "demo-safari" : null;
// Declare target for use by the surrounding module or function.
const target = new URL(process.env.MONGODB_URI || "");
// Perform the side effect or state update expressed on the following line.
assert.equal(target.hostname, "cluster0.cdtxzts.mongodb.net", "local account audit is restricted to the configured demo cluster");
// Perform the side effect or state update expressed on the following line.
assert.equal(decodeURIComponent(target.pathname.slice(1).split("?")[0]), "husseindb", "local account audit is restricted to husseindb");
// Perform the side effect or state update expressed on the following line.
assert.notEqual(process.env.NODE_ENV, "production", "refusing to start local API audit in production mode");
// Declare password for use by the surrounding module or function.
const password = process.env.DEMO_TEST_PASSWORD;
// Perform the side effect or state update expressed on the following line.
assert.ok(password?.length >= 12, "Set DEMO_TEST_PASSWORD in the environment.");

// Perform the side effect or state update expressed on the following line.
await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000, maxPoolSize: 3 });
// Declare app for use by the surrounding module or function.
const app = (await import("../app.js")).default;
// Declare server for use by the surrounding module or function.
const server = http.createServer(app);
// Declare tokens for use by the surrounding module or function.
const tokens = new Map();
// Declare tally for use by the surrounding module or function.
const tally = { accounts: 0, correctLogin: 0, wrongPasswordRejected: 0, me: 0, roleAccess: 0, customerDenied: 0 };

// Run this operation with a dedicated error-handling path for failures.
try {
  // Declare tenantRows for use by the surrounding module or function.
  const tenantRows = await mongoose.connection.db.collection("organizations")
    .find({ slug: { $in: ["hussein-mboya", "amani-trails", "demo-safari"] } }, { projection: { _id: 1, slug: 1 } }).toArray();
  // Declare tenantIdBySlug for use by the surrounding module or function.
  const tenantIdBySlug = new Map(tenantRows.map((tenant) => [tenant.slug, String(tenant._id)]));
  // Perform the side effect or state update expressed on the following line.
  assert.equal(tenantIdBySlug.size, 3, "all three demo tenants must exist");

  // Perform the side effect or state update expressed on the following line.
  await new Promise((resolve, reject) => {
    // Perform the side effect or state update expressed on the following line.
    server.once("error", reject);
    // Perform the side effect or state update expressed on the following line.
    server.listen(0, "127.0.0.1", resolve);
  });
  // Perform the side effect or state update expressed on the following line.
  setStartupPhase("ready");
  // Declare origin for use by the surrounding module or function.
  const origin = `http://127.0.0.1:${server.address().port}`;
  // Declare request for use by the surrounding module or function.
  const request = (path, { ip, token, ...options } = {}) => fetch(new URL(path, origin), {
    ...options,
    headers: {
      ...(options.body ? { "content-type": "application/json" } : {}),
      ...(ip ? { "x-forwarded-for": ip } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  // Repeat the enclosed work for each required iteration.
  for (const [index, email] of TEST_LOGIN_EMAILS.entries()) {
    // Each fixture represents a separate client. The production per-IP login limiter remains enabled.
    // Declare ip for use by the surrounding module or function.
    const ip = `198.51.100.${index + 1}`;
    // Declare wrong for use by the surrounding module or function.
    const wrong = await request("/api/auth/login", {
      ip, method: "POST", body: JSON.stringify({ email, password: `${password}-incorrect` }),
    });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(wrong.status, 401, `incorrect password rejected for account ${index + 1}`);
    // Perform the side effect or state update expressed on the following line.
    tally.wrongPasswordRejected += 1;

    // Declare response for use by the surrounding module or function.
    const response = await request("/api/auth/login", {
      ip, method: "POST", body: JSON.stringify({ email, password }),
    });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(response.status, 200, `correct password accepted for account ${index + 1}`);
    // Declare payload for use by the surrounding module or function.
    const payload = await response.json();
    // Declare user for use by the surrounding module or function.
    const user = payload.user;
    // Perform the side effect or state update expressed on the following line.
    assert.ok(payload.token, `token returned for account ${index + 1}`);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(user.email, email);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(user.role, expectedRole(email));
    // Perform the side effect or state update expressed on the following line.
    assert.equal(user.status, "active");
    // Declare slug for use by the surrounding module or function.
    const slug = tenantSlug(email);
    // Check the condition (slug) and run the matching branch.
    if (slug) assert.equal(String(user.tenantId), tenantIdBySlug.get(slug));
    else assert.equal(user.tenantId, null);
    // Perform the side effect or state update expressed on the following line.
    tokens.set(email, payload.token);
    // Perform the side effect or state update expressed on the following line.
    tally.correctLogin += 1;

    // Declare me for use by the surrounding module or function.
    const me = await request("/api/auth/me", { token: payload.token });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(me.status, 200, `authenticated /me for account ${index + 1}`);
    // Declare mePayload for use by the surrounding module or function.
    const mePayload = await me.json();
    // Perform the side effect or state update expressed on the following line.
    assert.equal(mePayload.user?.email, email);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(mePayload.user?.role, expectedRole(email));
    // Perform the side effect or state update expressed on the following line.
    assert.equal(mePayload.user?.status, "active");
    // Check the condition (slug) and run the matching branch.
    if (slug) assert.equal(String(mePayload.user?.tenantId), tenantIdBySlug.get(slug));
    else assert.equal(mePayload.user?.tenantId, null);
    // Perform the side effect or state update expressed on the following line.
    tally.me += 1;
    // Perform the side effect or state update expressed on the following line.
    tally.accounts += 1;
  }

  // Declare roleChecks for use by the surrounding module or function.
  const roleChecks = [
    ["superadmin1@husseinmboya.com", "/api/superadmin/dashboard"],
    ["admin1@husseinmboya.com", "/api/admin/dashboard/metrics"],
    ["tourmanager1@husseinmboya.com", "/api/tourmanager/dashboard"],
    ["agent1@husseinmboya.com", "/api/agent/dashboard"],
    ["guide1@husseinmboya.com", "/api/guide/dashboard"],
    ["driver1@husseinmboya.com", "/api/driver/dashboard"],
    ["customer1@husseinmboya.com", "/api/bookings/my-bookings"],
  ];
  // Repeat the enclosed work for each required iteration.
  for (const [email, path] of roleChecks) {
    // Declare response for use by the surrounding module or function.
    const response = await request(path, { token: tokens.get(email) });
    // Perform the side effect or state update expressed on the following line.
    assert.ok([200, 403].includes(response.status), `role endpoint produced an authorization result for ${email}`);
    // Check the condition (response.status === 403) and run the matching branch.
    if (response.status === 403) assert.equal((await response.json()).code, "PLAN_FEATURE_LOCKED");
    // Perform the side effect or state update expressed on the following line.
    tally.roleAccess += 1;
  }
  // Declare customerAdminResponse for use by the surrounding module or function.
  const customerAdminResponse = await request("/api/admin/dashboard/metrics", { token: tokens.get("customer1@husseinmboya.com") });
  // Perform the side effect or state update expressed on the following line.
  assert.equal(customerAdminResponse.status, 403, "customer cannot access tenant administration");
  // Perform the side effect or state update expressed on the following line.
  tally.customerDenied = 1;

  // Perform the side effect or state update expressed on the following line.
  console.log(JSON.stringify({
    status: "passed", ...tally, tenants: tenantIdBySlug.size,
    note: "local application API against verified husseindb; synthetic per-account clients; no production endpoint used",
  }));
} finally {
  // Perform the side effect or state update expressed on the following line.
  await new Promise((resolve) => server.close(resolve));
  // Perform the side effect or state update expressed on the following line.
  await mongoose.disconnect();
}
