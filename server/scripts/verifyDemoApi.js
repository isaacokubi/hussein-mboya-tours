import "dotenv/config";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import mongoose from "mongoose";
import path from "node:path";
import { fileURLToPath } from "node:url";
import AuditLog from "../models/AuditLog.js";
import SecurityLog from "../models/SecurityLog.js";

const baseUrl = process.env.DEMO_API_BASE_URL || "http://127.0.0.1:5055";
const password = process.env.TEST_DEMO_SEED_PASSWORD || "Password@2785";
const reportPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../reports/demo-api-validation.json");
const userAgent = "AtlasDemoValidation/2026-09-27";
const logins = [
  { key: "superAdmin", email: "superadmin1@husseinmboya.com", role: "super_admin", tenant: null },
  { key: "tenantAdminA", email: "admin1@husseinmboya.com", role: "admin", tenant: "hussein-mboya" },
  { key: "managerA", email: "tourmanager1@husseinmboya.com", role: "tour_manager", tenant: "hussein-mboya" },
  { key: "agentA", email: "agent1@husseinmboya.com", role: "agent", tenant: "hussein-mboya" },
  { key: "guideA", email: "guide1@husseinmboya.com", role: "tour_guide", tenant: "hussein-mboya" },
  { key: "driverA", email: "driver1@husseinmboya.com", role: "driver", tenant: "hussein-mboya" },
  { key: "customerA", email: "customer1@husseinmboya.com", role: "customer", tenant: "hussein-mboya" },
  { key: "customerB", email: "customer1@amanitrails.com", role: "customer", tenant: "amani-trails" },
];
const report = { timestamp: new Date().toISOString(), logins: [], dashboards: [], tenantIsolation: [], rbac: [], testArtifactsRemoved: {}, failures: [] };
const sessions = new Map();

async function request(endpoint, token, options = {}) {
  const response = await fetch(new URL(endpoint, baseUrl), {
    ...options,
    headers: { "content-type": "application/json", "user-agent": userAgent, ...(token ? { authorization: `Bearer ${token}` } : {}), ...options.headers },
  });
  let payload = {};
  try { payload = await response.json(); } catch { /* status remains the assertion */ }
  return { status: response.status, payload };
}

try {
  for (const account of logins) {
    const response = await request("/api/auth/login", null, { method: "POST", body: JSON.stringify({ email: account.email, password }) });
    const actualRole = response.payload?.user?.role;
    const actualTenantId = response.payload?.user?.tenantId || null;
    const result = { account: account.key, status: response.status, role: actualRole, authenticatedTenant: actualTenantId };
    report.logins.push(result);
    assert.equal(response.status, 200, `${account.key} login`);
    assert.equal(actualRole, account.role, `${account.key} role`);
    assert.ok(response.payload?.token, `${account.key} token`);
    sessions.set(account.key, { token: response.payload.token, tenantId: actualTenantId });
  }
  assert.notEqual(sessions.get("customerA").tenantId, sessions.get("customerB").tenantId, "the customer fixtures belong to different tenants");

  const dashboardChecks = [
    ["superAdmin", "/api/superadmin/dashboard"],
    ["tenantAdminA", "/api/admin/dashboard/metrics"],
    ["tenantAdminA", "/api/admin/finance/stats"],
    ["managerA", "/api/tourmanager/dashboard"],
    ["managerA", "/api/tourmanager/tours"],
    ["agentA", "/api/agent/dashboard"],
    ["agentA", "/api/agent/bookings"],
    ["guideA", "/api/guide/dashboard"],
    ["guideA", "/api/guide/assigned-tours"],
    ["driverA", "/api/driver/dashboard"],
    ["driverA", "/api/driver/assigned-tours"],
    ["customerA", "/api/bookings/my-bookings"],
    ["customerB", "/api/bookings/my-bookings"],
    ["tenantAdminA", "/api/bookings/admin/all"],
  ];
  const payloads = new Map();
  for (const [key, endpoint] of dashboardChecks) {
    const response = await request(endpoint, sessions.get(key).token);
    report.dashboards.push({ account: key, endpoint, status: response.status, success: response.payload?.success });
    assert.equal(response.status, 200, `${key} ${endpoint}`);
    payloads.set(`${key}:${endpoint}`, response.payload);
  }

  const bookingId = (key) => payloads.get(`${key}:/api/bookings/my-bookings`)?.bookings?.[0]?._id;
  const bookingA = bookingId("customerA");
  const bookingB = bookingId("customerB");
  assert.ok(bookingA && bookingB, "both tenants have customer bookings");
  for (const [account, foreignBookingId] of [["customerA", bookingB], ["customerB", bookingA]]) {
    const response = await request(`/api/bookings/${encodeURIComponent(foreignBookingId)}`, sessions.get(account).token);
    report.tenantIsolation.push({ account, foreignBooking: true, status: response.status });
    assert.equal(response.status, 404, `${account} must not retrieve another tenant's booking`);
  }
  const denied = await request("/api/admin/dashboard/metrics", sessions.get("customerA").token);
  report.rbac.push({ account: "customerA", protectedAdminDashboardStatus: denied.status });
  assert.equal(denied.status, 403, "customer cannot use tenant admin dashboard API");
} catch (error) {
  report.failures.push(String(error?.message || "API validation failed"));
  process.exitCode = 1;
} finally {
  try {
    const target = new URL(process.env.MONGODB_URI || "");
    const databaseName = decodeURIComponent(target.pathname.replace(/^\//, "").split("/")[0] || "");
    if (databaseName !== "husseindb" || !target.hostname.endsWith(".mongodb.net")) throw new Error("Refusing to clean validation logs outside the configured Atlas application database.");
    const client = new mongoose.mongo.MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    await client.connect();
    try {
      const collectionNames = { AuditLog: AuditLog.collection.collectionName, SecurityLog: SecurityLog.collection.collectionName };
      for (const [modelName, collectionName] of Object.entries(collectionNames)) {
        const result = await client.db(databaseName).collection(collectionName).deleteMany({ userAgent });
        report.testArtifactsRemoved[modelName] = result.deletedCount;
      }
    } finally { await client.close(); }
  } catch (error) {
    report.failures.push(`Could not clean exact demo API validation log markers: ${String(error?.message || error).replace(/mongodb(?:\+srv)?:\/\/[^\s"']+/gi, "[MongoDB URI redacted]")}`);
    process.exitCode = 1;
  }
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
  console.log(JSON.stringify({ logins: report.logins.length, dashboards: report.dashboards.length, isolationChecks: report.tenantIsolation.length, rbacChecks: report.rbac.length, testArtifactsRemoved: report.testArtifactsRemoved, failures: report.failures, report: "reports/demo-api-validation.json" }, null, 2));
}
