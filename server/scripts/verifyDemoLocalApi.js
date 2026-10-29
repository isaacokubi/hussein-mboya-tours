import "dotenv/config";
import assert from "node:assert/strict";
import http from "node:http";
import mongoose from "mongoose";
import { TEST_LOGIN_EMAILS } from "../seeds/completeTestDemoSeed.js";
import { setStartupPhase } from "../startup/readiness.js";

const expectedRole = (email) => {
  if (email === "superadmin1@husseinmboya.com") return "super_admin";
  const local = email.split("@")[0];
  if (local === "admin1") return "admin";
  if (local === "tourmanager1") return "tour_manager";
  if (local.startsWith("agent")) return "agent";
  if (local.startsWith("guide")) return "tour_guide";
  if (local.startsWith("driver")) return "driver";
  return "customer";
};
const tenantSlug = (email) => email === "superadmin1@husseinmboya.com" ? null
  : email.endsWith("@husseinmboya.com") ? "hussein-mboya"
    : email.endsWith("@amanitrails.com") ? "amani-trails"
      : email.endsWith("@demosafari.com") ? "demo-safari" : null;
const target = new URL(process.env.MONGODB_URI || "");
assert.equal(target.hostname, "cluster0.cdtxzts.mongodb.net", "local account audit is restricted to the configured demo cluster");
assert.equal(decodeURIComponent(target.pathname.slice(1).split("?")[0]), "husseindb", "local account audit is restricted to husseindb");
assert.notEqual(process.env.NODE_ENV, "production", "refusing to start local API audit in production mode");
const password = process.env.DEMO_TEST_PASSWORD;
assert.ok(password?.length >= 12, "Set DEMO_TEST_PASSWORD in the environment.");

await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000, maxPoolSize: 3 });
const app = (await import("../app.js")).default;
const server = http.createServer(app);
const tokens = new Map();
const tally = { accounts: 0, correctLogin: 0, wrongPasswordRejected: 0, me: 0, roleAccess: 0, customerDenied: 0 };

try {
  const tenantRows = await mongoose.connection.db.collection("organizations")
    .find({ slug: { $in: ["hussein-mboya", "amani-trails", "demo-safari"] } }, { projection: { _id: 1, slug: 1 } }).toArray();
  const tenantIdBySlug = new Map(tenantRows.map((tenant) => [tenant.slug, String(tenant._id)]));
  assert.equal(tenantIdBySlug.size, 3, "all three demo tenants must exist");

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  setStartupPhase("ready");
  const origin = `http://127.0.0.1:${server.address().port}`;
  const request = (path, { ip, token, ...options } = {}) => fetch(new URL(path, origin), {
    ...options,
    headers: {
      ...(options.body ? { "content-type": "application/json" } : {}),
      ...(ip ? { "x-forwarded-for": ip } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  for (const [index, email] of TEST_LOGIN_EMAILS.entries()) {
    // Each fixture represents a separate client. The production per-IP login limiter remains enabled.
    const ip = `198.51.100.${index + 1}`;
    const wrong = await request("/api/auth/login", {
      ip, method: "POST", body: JSON.stringify({ email, password: `${password}-incorrect` }),
    });
    assert.equal(wrong.status, 401, `incorrect password rejected for account ${index + 1}`);
    tally.wrongPasswordRejected += 1;

    const response = await request("/api/auth/login", {
      ip, method: "POST", body: JSON.stringify({ email, password }),
    });
    assert.equal(response.status, 200, `correct password accepted for account ${index + 1}`);
    const payload = await response.json();
    const user = payload.user;
    assert.ok(payload.token, `token returned for account ${index + 1}`);
    assert.equal(user.email, email);
    assert.equal(user.role, expectedRole(email));
    assert.equal(user.status, "active");
    const slug = tenantSlug(email);
    if (slug) assert.equal(String(user.tenantId), tenantIdBySlug.get(slug));
    else assert.equal(user.tenantId, null);
    tokens.set(email, payload.token);
    tally.correctLogin += 1;

    const me = await request("/api/auth/me", { token: payload.token });
    assert.equal(me.status, 200, `authenticated /me for account ${index + 1}`);
    const mePayload = await me.json();
    assert.equal(mePayload.user?.email, email);
    assert.equal(mePayload.user?.role, expectedRole(email));
    assert.equal(mePayload.user?.status, "active");
    if (slug) assert.equal(String(mePayload.user?.tenantId), tenantIdBySlug.get(slug));
    else assert.equal(mePayload.user?.tenantId, null);
    tally.me += 1;
    tally.accounts += 1;
  }

  const roleChecks = [
    ["superadmin1@husseinmboya.com", "/api/superadmin/dashboard"],
    ["admin1@husseinmboya.com", "/api/admin/dashboard/metrics"],
    ["tourmanager1@husseinmboya.com", "/api/tourmanager/dashboard"],
    ["agent1@husseinmboya.com", "/api/agent/dashboard"],
    ["guide1@husseinmboya.com", "/api/guide/dashboard"],
    ["driver1@husseinmboya.com", "/api/driver/dashboard"],
    ["customer1@husseinmboya.com", "/api/bookings/my-bookings"],
  ];
  for (const [email, path] of roleChecks) {
    const response = await request(path, { token: tokens.get(email) });
    assert.ok([200, 403].includes(response.status), `role endpoint produced an authorization result for ${email}`);
    if (response.status === 403) assert.equal((await response.json()).code, "PLAN_FEATURE_LOCKED");
    tally.roleAccess += 1;
  }
  const customerAdminResponse = await request("/api/admin/dashboard/metrics", { token: tokens.get("customer1@husseinmboya.com") });
  assert.equal(customerAdminResponse.status, 403, "customer cannot access tenant administration");
  tally.customerDenied = 1;

  console.log(JSON.stringify({
    status: "passed", ...tally, tenants: tenantIdBySlug.size,
    note: "local application API against verified husseindb; synthetic per-account clients; no production endpoint used",
  }));
} finally {
  await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
}
