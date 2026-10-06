import "dotenv/config";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import mongoose from "mongoose";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getSafeDemoApiOrigin, LOGIN_WINDOW_MS, needsLoginWindowWait } from "./demoApiValidationSafety.js";

const baseUrl = getSafeDemoApiOrigin(process.env.DEMO_API_BASE_URL);
const password = String(process.env.DEMO_TEST_PASSWORD || process.env.TEST_DEMO_SEED_PASSWORD || process.env.SEED_DEMO_PASSWORD || "");
if (password.length < 8) throw new Error("Set DEMO_TEST_PASSWORD (or an existing demo password environment variable) before verifying demo accounts.");
const defaultReportPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../reports/demo-api-validation.json");
const reportPath = path.resolve(process.env.DEMO_API_REPORT_PATH || defaultReportPath);
const pause = (duration) => new Promise((resolve) => setTimeout(resolve, duration));
const userAgent = "HusseinMboyaDemoApiValidator/1.0";
const customerAccounts = [
  ["A", "hussein-mboya"],
  ["B", "amani-trails"],
  ["C", "demo-safari"],
].flatMap(([tenantKey, tenant]) => Array.from({ length: 4 }, (_, index) => {
  const customerNumber = index + 1;
  return {
    key: customerNumber === 1 ? `customer${tenantKey}` : `customer${customerNumber}${tenantKey}`,
    email: `customer${customerNumber}@${tenant}.com`,
    role: "customer",
    tenant,
  };
}));
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
  ...customerAccounts,
];
assert.equal(logins.length, 28, "the production demo audit must cover all 28 seeded users");
const report = { timestamp: new Date().toISOString(), logins: [], dashboards: [], dashboardComparisons: [], financeComparisons: [], tenantIsolation: [], rbac: [], failures: [] };
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
  for (const [index, account] of logins.entries()) {
    if (needsLoginWindowWait(index, logins.length)) await pause(LOGIN_WINDOW_MS + 1000);
    const response = await request("/api/auth/login", null, {
      method: "POST",
      body: JSON.stringify({ email: account.email, password }),
    });
    if (response.status === 429) throw new Error("Demo API login limiter reached; stopping without retrying or changing client identity.");
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
  const tenantIdBySlug = new Map([
    ["hussein-mboya", tenantIds[0]],
    ["amani-trails", tenantIds[1]],
    ["demo-safari", tenantIds[2]],
  ]);
  for (const account of logins.filter((candidate) => candidate.tenant)) {
    assert.equal(sessions.get(account.key).tenantId, tenantIdBySlug.get(account.tenant), `${account.key} must resolve to ${account.tenant}`);
  }

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
    ...customerAccounts.map(({ key }) => [key, "/api/bookings/my-bookings"]),
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

  const atlasTarget = new URL(process.env.MONGODB_URI || "");
  const atlasDatabase = decodeURIComponent(atlasTarget.pathname.replace(/^\//, "").split("/")[0] || "");
  if (atlasDatabase !== "husseindb" || !atlasTarget.hostname.endsWith(".mongodb.net")) {
    throw new Error("Refusing dashboard comparison outside the configured Atlas application database.");
  }
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  const db = mongoose.connection.db;
  const count = (collection, filter) => db.collection(collection).countDocuments(filter);
  const aggregateTotal = async (collection, pipeline, field = "total") => {
    const [row] = await db.collection(collection).aggregate(pipeline).toArray();
    return Number(row?.[field] || 0);
  };
  const postedRevenue = (tenantId) => aggregateTotal("journalentries", [
    { $match: { tenantId, status: "posted" } },
    { $unwind: "$lines" },
    { $lookup: { from: "chartofaccounts", localField: "lines.account", foreignField: "_id", as: "account" } },
    { $unwind: "$account" },
    { $match: { "account.tenantId": tenantId, "account.type": "revenue", "account.active": true } },
    { $group: { _id: null, total: { $sum: { $subtract: [{ $ifNull: ["$lines.credit", 0] }, { $ifNull: ["$lines.debit", 0] }] } } } },
  ]);
  const active = { isDeleted: { $ne: true } };
  const paidStatuses = ["paid", "completed", "success"];
  for (const [tenant, account] of [["hussein-mboya", "tenantAdminA"], ["amani-trails", "tenantAdminB"], ["demo-safari", "tenantAdminC"]]) {
    const tenantId = new mongoose.Types.ObjectId(sessions.get(account).tenantId);
    const scope = { tenantId, ...active };
    const data = payloads.get(`${account}:/api/admin/dashboard/metrics`)?.data;
    const [revenue, collections, refundedAmount, commission] = await Promise.all([
      postedRevenue(tenantId),
      aggregateTotal("payments", [{ $match: { tenantId, status: "completed" } }, { $group: { _id: null, total: { $sum: { $ifNull: ["$amount", 0] } } } }]),
      aggregateTotal("payments", [{ $match: { tenantId, refundedAmount: { $gt: 0 } } }, { $group: { _id: null, total: { $sum: { $ifNull: ["$refundedAmount", 0] } } } }]),
      aggregateTotal("commissions", [{ $match: { tenantId } }, { $group: { _id: null, total: { $sum: { $ifNull: ["$amount", 0] } } } }]),
    ]);
    const [users, customers, staff, guides, drivers, agents, approvedAgents, pendingAgents, vehicles, availableVehicles, assignedVehicles, maintenanceVehicles, tours, destinations, bookings, pendingBookings, confirmedBookings, completedBookings, cancelledBookings, refundedBookings, payments, completedPayments, pendingPayments, failedPayments] = await Promise.all([
      count("users", { ...scope, status: { $ne: "blocked" } }),
      count("users", { ...scope, status: { $ne: "blocked" }, $or: [{ role: "customer" }, { legacyRole: "customer" }] }),
      count("staffs", { ...scope, isActive: { $ne: false }, status: { $nin: ["inactive", "suspended"] } }),
      count("staffs", { ...scope, isActive: { $ne: false }, status: { $nin: ["inactive", "suspended"] }, $or: [{ position: "guide" }, { role: "guide" }] }),
      count("staffs", { ...scope, isActive: { $ne: false }, status: { $nin: ["inactive", "suspended"] }, $or: [{ position: "driver" }, { role: "driver" }] }),
      count("agents", { ...scope, status: { $ne: "inactive" } }),
      count("agents", { ...scope, status: { $ne: "inactive" }, $or: [{ isApproved: true }, { status: "approved" }] }),
      count("agents", { ...scope, status: { $nin: ["inactive", "approved"] }, isApproved: { $ne: true } }),
      count("vehicles", { ...scope, isActive: { $ne: false } }),
      count("vehicles", { ...scope, isActive: { $ne: false }, status: "available" }),
      count("vehicles", { ...scope, isActive: { $ne: false }, status: "assigned" }),
      count("vehicles", { ...scope, isActive: { $ne: false }, status: "maintenance" }),
      count("tours", scope), count("destinations", scope), count("bookings", scope),
      count("bookings", { ...scope, status: "pending" }), count("bookings", { ...scope, status: "confirmed" }),
      count("bookings", { ...scope, status: "completed" }), count("bookings", { ...scope, status: "cancelled" }),
      count("bookings", { ...scope, status: "refunded" }), count("payments", scope),
      count("payments", { ...scope, status: { $in: paidStatuses } }),
      count("payments", { ...scope, status: { $in: ["pending", "processing", "partial"] } }),
      count("payments", { ...scope, status: { $in: ["failed", "cancelled"] } }),
    ]);
    const expected = { users, customers, staff, guides, drivers, agents, approvedAgents, pendingAgents, vehicles, availableVehicles, assignedVehicles, maintenanceVehicles, tours, destinations, bookings, pendingBookings, confirmedBookings, completedBookings, cancelledBookings, refundedBookings, payments, completedPayments, pendingPayments, failedPayments, revenue };
    assert.ok(data, `${tenant} admin dashboard returns metrics data`);
    for (const [metric, atlasValue] of Object.entries(expected)) {
      assert.equal(Number(data[metric]), atlasValue, `${tenant} dashboard ${metric} matches Atlas`);
    }
    report.dashboardComparisons.push({ tenant, metricsCompared: Object.keys(expected).length, matched: true });

    const financeData = payloads.get(`${account}:/api/admin/finance/stats`)?.data;
    const expectedFinance = {
      revenue,
      netRevenue: revenue,
      collections,
      netCollections: Math.max(0, collections - refundedAmount),
      refundedAmount,
      completedPayments: await count("payments", { tenantId, status: "completed" }),
      pendingPayments: await count("payments", { tenantId, status: "pending" }),
      failedPayments: await count("payments", { tenantId, status: "failed" }),
      refundedPayments: await count("payments", { tenantId, status: "refunded" }),
      paidBookings: await count("bookings", { tenantId, paymentStatus: "paid" }),
      commission,
    };
    assert.ok(financeData, `${tenant} finance endpoint returns metrics data`);
    for (const [metric, atlasValue] of Object.entries(expectedFinance)) {
      assert.ok(Math.abs(Number(financeData[metric] || 0) - atlasValue) < 0.01, `${tenant} finance ${metric} matches Atlas`);
    }
    report.financeComparisons.push({ tenant, metricsCompared: Object.keys(expectedFinance).length, matched: true });
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
  const customerBookings = customerAccounts.map(({ key, tenant }) => ({ key, tenant, bookingId: bookingId(key) }));
  assert.ok(customerBookings.every(({ bookingId: id }) => id), "all 12 tenant customers have seeded bookings");
  for (const account of customerAccounts) {
    const foreignBookings = customerBookings.filter((candidate) => candidate.tenant !== account.tenant);
    for (const foreign of foreignBookings) {
      const response = await request(`/api/bookings/${encodeURIComponent(foreign.bookingId)}`, sessions.get(account.key).token);
      report.tenantIsolation.push({ account: account.key, foreignBooking: true, status: response.status });
      assert.equal(response.status, 404, `${account.key} must not retrieve another tenant's booking`);
    }
  }
  for (const account of logins.filter((candidate) => candidate.role !== "super_admin" && candidate.role !== "admin")) {
    const denied = await request("/api/admin/dashboard/metrics", sessions.get(account.key).token);
    report.rbac.push({ account: account.key, protectedAdminDashboardStatus: denied.status });
    assert.equal(denied.status, 403, `${account.key} cannot use tenant admin dashboard API`);
  }
  for (const account of logins.filter((candidate) => candidate.role !== "super_admin")) {
    const denied = await request("/api/superadmin/tenants", sessions.get(account.key).token);
    report.rbac.push({ account: account.key, platformTenantManagementStatus: denied.status });
    assert.equal(denied.status, 403, `${account.key} cannot use platform tenant management API`);
  }
} catch (error) {
  report.failures.push(error?.name || "ValidationError");
  process.exitCode = 1;
} finally {
  await mongoose.disconnect().catch(() => {});
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
  console.log(JSON.stringify({ logins: report.logins.length, dashboards: report.dashboards.length, isolationChecks: report.tenantIsolation.length, rbacChecks: report.rbac.length, failures: report.failures, report: path.relative(process.cwd(), reportPath) }, null, 2));
}
