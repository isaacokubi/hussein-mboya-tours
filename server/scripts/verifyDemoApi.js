import "dotenv/config";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import mongoose from "mongoose";
import path from "node:path";
import { fileURLToPath } from "node:url";
import AuditLog from "../models/AuditLog.js";
import SecurityLog from "../models/SecurityLog.js";

const baseUrl = process.env.DEMO_API_BASE_URL || "http://127.0.0.1:5055";
const password = String(process.env.TEST_DEMO_SEED_PASSWORD || process.env.SEED_DEMO_PASSWORD || "");
if (password.length < 8) throw new Error("Set TEST_DEMO_SEED_PASSWORD or SEED_DEMO_PASSWORD (at least 8 characters) before verifying demo accounts.");
const reportPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../reports/demo-api-validation.json");
const userAgent = "AtlasDemoValidation/2026-09-27";
const logins = [
  { key: "superAdmin", email: "superadmin@hussein-mboya.com", role: "super_admin", tenant: null },
  { key: "tenantAdminA", email: "admin@hussein-mboya.com", role: "admin", tenant: "hussein-mboya" },
  { key: "tenantAdminB", email: "admin@amani-trails.com", role: "admin", tenant: "amani-trails" },
  { key: "tenantAdminC", email: "admin@demo-safari.com", role: "admin", tenant: "demo-safari" },
  { key: "managerA", email: "manager@hussein-mboya.com", role: "tour_manager", tenant: "hussein-mboya" },
  { key: "managerB", email: "manager@amani-trails.com", role: "tour_manager", tenant: "amani-trails" },
  { key: "managerC", email: "manager@demo-safari.com", role: "tour_manager", tenant: "demo-safari" },
  { key: "agentA", email: "agent@hussein-mboya.com", role: "agent", tenant: "hussein-mboya" },
  { key: "agentB", email: "agent@amani-trails.com", role: "agent", tenant: "amani-trails" },
  { key: "agentC", email: "agent@demo-safari.com", role: "agent", tenant: "demo-safari" },
  { key: "guideA", email: "guide1@hussein-mboya.com", role: "guide", tenant: "hussein-mboya" },
  { key: "guideB", email: "guide1@amani-trails.com", role: "guide", tenant: "amani-trails" },
  { key: "guideC", email: "guide1@demo-safari.com", role: "guide", tenant: "demo-safari" },
  { key: "driverA", email: "driver1@hussein-mboya.com", role: "driver", tenant: "hussein-mboya" },
  { key: "driverB", email: "driver1@amani-trails.com", role: "driver", tenant: "amani-trails" },
  { key: "driverC", email: "driver1@demo-safari.com", role: "driver", tenant: "demo-safari" },
  { key: "customerA", email: "customer1@hussein-mboya.com", role: "customer", tenant: "hussein-mboya" },
  { key: "customerB", email: "customer1@amani-trails.com", role: "customer", tenant: "amani-trails" },
  { key: "customerC", email: "customer1@demo-safari.com", role: "customer", tenant: "demo-safari" },
];
const report = { timestamp: new Date().toISOString(), logins: [], dashboards: [], tenantIsolation: [], rbac: [], testArtifactsRemoved: {}, failures: [] };
const sessions = new Map();

async function request(endpoint, token, options = {}) {
  const response = await fetch(new URL(endpoint, baseUrl), {
    ...options,
    signal: AbortSignal.timeout(30000),
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
    if (account.tenant === null) assert.equal(actualTenantId, null, `${account.key} must be platform scoped`);
    assert.ok(response.payload?.token, `${account.key} token`);
    sessions.set(account.key, { token: response.payload.token, tenantId: actualTenantId });
  }
  const tenantIds = ["tenantAdminA", "tenantAdminB", "tenantAdminC"].map((key) => sessions.get(key).tenantId);
  assert.ok(tenantIds.every(Boolean), "each tenant admin must authenticate into a tenant");
  assert.equal(new Set(tenantIds).size, 3, "the three tenant admin fixtures must resolve to distinct tenants");
  assert.equal(sessions.get("customerA").tenantId, tenantIds[0]);
  assert.equal(sessions.get("customerB").tenantId, tenantIds[1]);
  assert.equal(sessions.get("customerC").tenantId, tenantIds[2]);

  const dashboardChecks = [
    ["superAdmin", "/api/superadmin/dashboard"],
    ["tenantAdminA", "/api/admin/dashboard/metrics"],
    ["tenantAdminB", "/api/admin/dashboard/metrics"],
    ["tenantAdminC", "/api/admin/dashboard/metrics"],
    ["tenantAdminA", "/api/admin/finance/stats"],
    ["tenantAdminB", "/api/admin/finance/stats"],
    ["tenantAdminC", "/api/admin/finance/stats"],
    ["managerA", "/api/tourmanager/dashboard"],
    ["managerA", "/api/tourmanager/tours"],
    ["managerB", "/api/tourmanager/dashboard"],
    ["managerB", "/api/tourmanager/tours"],
    ["managerC", "/api/tourmanager/dashboard"],
    ["managerC", "/api/tourmanager/tours"],
    ["agentA", "/api/agent/dashboard"],
    ["agentA", "/api/agent/bookings"],
    ["agentB", "/api/agent/dashboard"],
    ["agentB", "/api/agent/bookings"],
    ["agentC", "/api/agent/dashboard"],
    ["agentC", "/api/agent/bookings"],
    ["guideA", "/api/guide/dashboard"],
    ["guideA", "/api/guide/assigned-tours"],
    ["guideB", "/api/guide/dashboard"],
    ["guideB", "/api/guide/assigned-tours"],
    ["guideC", "/api/guide/dashboard"],
    ["guideC", "/api/guide/assigned-tours"],
    ["driverA", "/api/driver/dashboard"],
    ["driverA", "/api/driver/assigned-tours"],
    ["driverB", "/api/driver/dashboard"],
    ["driverB", "/api/driver/assigned-tours"],
    ["driverC", "/api/driver/dashboard"],
    ["driverC", "/api/driver/assigned-tours"],
    ["customerA", "/api/bookings/my-bookings"],
    ["customerB", "/api/bookings/my-bookings"],
    ["customerC", "/api/bookings/my-bookings"],
    ["tenantAdminA", "/api/bookings/admin/all"],
    ["tenantAdminB", "/api/bookings/admin/all"],
    ["tenantAdminC", "/api/bookings/admin/all"],
  ];
  const payloads = new Map();
  for (const [key, endpoint] of dashboardChecks) {
    const response = await request(endpoint, sessions.get(key).token);
    report.dashboards.push({ account: key, endpoint, status: response.status, success: response.payload?.success });
    assert.equal(response.status, 200, `${key} ${endpoint}`);
    payloads.set(`${key}:${endpoint}`, response.payload);
  }

  for (const tenant of ["hussein-mboya", "amani-trails", "demo-safari"]) {
    for (const endpoint of ["/api/tours", "/api/destinations"]) {
      const response = await request(endpoint, null, { headers: { "X-Tenant-Slug": tenant } });
      const records = response.payload?.data || response.payload?.tours || response.payload?.destinations || [];
      const expectedTenantId = sessions.get({ "hussein-mboya": "tenantAdminA", "amani-trails": "tenantAdminB", "demo-safari": "tenantAdminC" }[tenant]).tenantId;
      report.dashboards.push({ account: tenant, endpoint, status: response.status, recordCount: records.length });
      assert.equal(response.status, 200, `${tenant} ${endpoint}`);
      assert.ok(records.length > 0, `${tenant} ${endpoint} returns public records`);
      assert.ok(records.every((record) => String(record.tenantId) === String(expectedTenantId)), `${tenant} ${endpoint} must contain only its tenant's records`);
    }
  }

  const bookingId = (key) => payloads.get(`${key}:/api/bookings/my-bookings`)?.bookings?.[0]?._id;
  const bookingA = bookingId("customerA");
  const bookingIds = ["customerA", "customerB", "customerC"].map(bookingId);
  assert.ok(bookingIds.every(Boolean), "all three tenant customers have seeded bookings");
  for (const [index, account] of ["customerA", "customerB", "customerC"].entries()) {
    for (const foreignBookingId of bookingIds.filter((_, other) => other !== index)) {
      const response = await request(`/api/bookings/${encodeURIComponent(foreignBookingId)}`, sessions.get(account).token);
      report.tenantIsolation.push({ account, foreignBooking: true, status: response.status });
      assert.equal(response.status, 404, `${account} must not retrieve another tenant's booking`);
    }
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
