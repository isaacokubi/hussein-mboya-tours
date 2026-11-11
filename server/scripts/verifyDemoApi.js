/**
 * Purpose: verify Demo Api operational script. Main declarations: pause, accountRole, accountKey, request, dashboardFeatureFor.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import "dotenv/config";
// Load node:assert/strict so this module can use its exported dependencies.
import assert from "node:assert/strict";
// Load node:fs/promises so this module can use its exported dependencies.
import fs from "node:fs/promises";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load node:path so this module can use its exported dependencies.
import path from "node:path";
// Load node:url so this module can use its exported dependencies.
import { fileURLToPath } from "node:url";
// Load ./demoApiValidationSafety.js so this module can use its exported dependencies.
import { getSafeDemoApiOrigin, LOGIN_WINDOW_MS, needsLoginWindowWait } from "./demoApiValidationSafety.js";
// Load ../seeds/completeTestDemoSeed.js so this module can use its exported dependencies.
import { TEST_LOGIN_EMAILS } from "../seeds/completeTestDemoSeed.js";

// Declare baseUrl for use by the surrounding module or function.
const baseUrl = getSafeDemoApiOrigin(process.env.DEMO_API_BASE_URL);
// Declare password for use by the surrounding module or function.
const password = String(process.env.DEMO_TEST_PASSWORD || process.env.DEMO_SMOKE_PASSWORD || process.env.TEST_DEMO_SEED_PASSWORD || process.env.SEED_DEMO_PASSWORD || "");
// Check the condition (password.length < 8) and run the matching branch.
if (password.length < 8) throw new Error("Set DEMO_TEST_PASSWORD (or an existing demo password environment variable) before verifying demo accounts.");
// Declare defaultReportPath for use by the surrounding module or function.
const defaultReportPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../reports/demo-api-validation.json");
// Declare reportPath for use by the surrounding module or function.
const reportPath = path.resolve(process.env.DEMO_API_REPORT_PATH || defaultReportPath);
// Declare pause for use by the surrounding module or function.
const pause = (duration) => new Promise((resolve) => setTimeout(resolve, duration));
// Declare userAgent for use by the surrounding module or function.
const userAgent = "HusseinMboyaDemoApiValidator/1.0";
// Declare domains for use by the surrounding module or function.
const domains = { "husseinmboya.com": "hussein-mboya", "amanitrails.com": "amani-trails", "demosafari.com": "demo-safari" };
// Declare tenantKeys for use by the surrounding module or function.
const tenantKeys = { "hussein-mboya": "A", "amani-trails": "B", "demo-safari": "C" };
// Declare accountRole for use by the surrounding module or function.
const accountRole = (email) => {
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
  // Check the condition (local.startsWith("customer")) and run the matching branch.
  if (local.startsWith("customer")) return "customer";
  // Return the expression shown below to the caller.
  return null;
};
// Declare accountKey for use by the surrounding module or function.
const accountKey = (email, tenant) => {
  // Check the condition (!tenant) and run the matching branch.
  if (!tenant) return "superAdmin";
  // Declare local for use by the surrounding module or function.
  const local = email.split("@")[0];
  // Check the condition (local === "admin1") and run the matching branch.
  if (local === "admin1") return `tenantAdmin${tenantKeys[tenant]}`;
  // Check the condition (local === "tourmanager1") and run the matching branch.
  if (local === "tourmanager1") return `manager${tenantKeys[tenant]}`;
  // Return the expression shown below to the caller.
  return `${local}${tenantKeys[tenant]}`;
};
// Declare logins for use by the surrounding module or function.
const logins = TEST_LOGIN_EMAILS.map((email) => {
  // Declare tenant for use by the surrounding module or function.
  const tenant = Object.entries(domains).find(([domain]) => email.endsWith(`@${domain}`))?.[1] || null;
  // Return the object assembled below to the caller.
  return { key: accountKey(email, tenant), email, role: accountRole(email), tenant };
});
// Declare customerAccounts for use by the surrounding module or function.
const customerAccounts = logins.filter(({ role }) => role === "customer");
// Perform the side effect or state update expressed on the following line.
assert.equal(logins.length, 37, "the demo API audit must cover all 37 authoritative seeded users");
// Declare report for use by the surrounding module or function.
const report = { timestamp: new Date().toISOString(), logins: [], tenantEntitlements: [], dashboards: [], dashboardComparisons: [], financeComparisons: [], tenantIsolation: [], rbac: [], failures: [] };
// Declare sessions for use by the surrounding module or function.
const sessions = new Map();

// Define request; its parameters and body implement this operation.
async function request(endpoint, token, options = {}) {
  // Declare maxAttempts for use by the surrounding module or function.
  const maxAttempts = 3;
  // Repeat the enclosed work for each required iteration.
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Declare response for use by the surrounding module or function.
      const response = await fetch(new URL(endpoint, baseUrl), {
        ...options,
        signal: AbortSignal.timeout(30000),
        headers: { "content-type": "application/json", "user-agent": userAgent, ...(token ? { authorization: `Bearer ${token}` } : {}), ...options.headers },
      });
      // Declare payload for use by the surrounding module or function.
      let payload = {};
      // Run this operation with a dedicated error-handling path for failures.
      try { payload = await response.json(); } catch { /* status remains the assertion */ }
      // Never retry rate limiting: the validator already enforces the server's
      // login window and must not try to evade it. Retry only transient 5xx
      // responses, which can occur while the Render service wakes or reconnects.
      // Check the condition (response.status < 500 || attempt === maxAttempts) and run the matching branch.
      if (response.status < 500 || attempt === maxAttempts) return { status: response.status, payload };
      // Perform the side effect or state update expressed on the following line.
      await pause(1000 * attempt);
    } catch (error) {
      // Check the condition (attempt === maxAttempts) and run the matching branch.
      if (attempt === maxAttempts) throw error;
      // Perform the side effect or state update expressed on the following line.
      await pause(1000 * attempt);
    }
  }
  // Stop the current operation by raising a new Error instance.
  throw new Error("Demo API request retry loop exhausted unexpectedly.");
}

// Declare dashboardFeatureFor for use by the surrounding module or function.
const dashboardFeatureFor = (account, endpoint) => {
  // Check the condition (endpoint === "/api/admin/finance/stats") and run the matching branch.
  if (endpoint === "/api/admin/finance/stats") return "finance";
  // Check the condition (endpoint.startsWith("/api/tourmanager/") || endpoint.startsWith("/api/) and run the matching branch.
  if (endpoint.startsWith("/api/tourmanager/") || endpoint.startsWith("/api/guide/")) return "operations";
  // Check the condition (endpoint.startsWith("/api/agent/")) and run the matching branch.
  if (endpoint.startsWith("/api/agent/")) return "agents";
  // Check the condition (endpoint.startsWith("/api/driver/")) and run the matching branch.
  if (endpoint.startsWith("/api/driver/")) return "fleet";
  // Return the expression shown below to the caller.
  return null;
};

// Run this operation with a dedicated error-handling path for failures.
try {
  // Repeat the enclosed work for each required iteration.
  for (const [index, account] of logins.entries()) {
    // Check the condition (needsLoginWindowWait(index, logins.length)) and run the matching branch.
    if (needsLoginWindowWait(index, logins.length)) await pause(LOGIN_WINDOW_MS + 1000);
    // Declare response for use by the surrounding module or function.
    const response = await request("/api/auth/login", null, {
      method: "POST",
      body: JSON.stringify({ email: account.email, password }),
    });
    // Check the condition (response.status === 429) and run the matching branch.
    if (response.status === 429) throw new Error("Demo API login limiter reached; stopping without retrying or changing client identity.");
    // Declare actualRole for use by the surrounding module or function.
    const actualRole = response.payload?.user?.role;
    // Declare actualTenantId for use by the surrounding module or function.
    const actualTenantId = response.payload?.user?.tenantId || null;
    // Declare result for use by the surrounding module or function.
    const result = { account: account.key, status: response.status, role: actualRole, authenticatedTenant: actualTenantId };
    // Perform the side effect or state update expressed on the following line.
    report.logins.push(result);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(response.status, 200, `${account.key} login`);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(actualRole, account.role, `${account.key} role`);
    // Check the condition (account.tenant === null) and run the matching branch.
    if (account.tenant === null) assert.equal(actualTenantId, null, `${account.key} must be platform scoped`);
    // Perform the side effect or state update expressed on the following line.
    assert.ok(response.payload?.token, `${account.key} token`);
    // Perform the side effect or state update expressed on the following line.
    sessions.set(account.key, { token: response.payload.token, tenantId: actualTenantId });
  }
  // Declare tenantIds for use by the surrounding module or function.
  const tenantIds = ["tenantAdminA", "tenantAdminB", "tenantAdminC"].map((key) => sessions.get(key).tenantId);
  // Perform the side effect or state update expressed on the following line.
  assert.ok(tenantIds.every(Boolean), "each tenant admin must authenticate into a tenant");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(new Set(tenantIds).size, 3, "the three tenant admin fixtures must resolve to distinct tenants");
  // Declare tenantIdBySlug for use by the surrounding module or function.
  const tenantIdBySlug = new Map([
    ["hussein-mboya", tenantIds[0]],
    ["amani-trails", tenantIds[1]],
    ["demo-safari", tenantIds[2]],
  ]);
  // Repeat the enclosed work for each required iteration.
  for (const account of logins.filter((candidate) => candidate.tenant)) {
    // Perform the side effect or state update expressed on the following line.
    assert.equal(sessions.get(account.key).tenantId, tenantIdBySlug.get(account.tenant), `${account.key} must resolve to ${account.tenant}`);
  }

  // Declare tenantFeatures for use by the surrounding module or function.
  const tenantFeatures = new Map();
  // Repeat the enclosed work for each required iteration.
  for (const [key, tenant] of [["tenantAdminA", "hussein-mboya"], ["tenantAdminB", "amani-trails"], ["tenantAdminC", "demo-safari"]]) {
    // Declare response for use by the surrounding module or function.
    const response = await request("/api/subscription", sessions.get(key).token);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(response.status, 200, `${key} subscription feature access`);
    // Declare features for use by the surrounding module or function.
    const features = Array.isArray(response.payload?.features) ? response.payload.features : [];
    // Perform the side effect or state update expressed on the following line.
    assert.ok(response.payload?.plan, `${key} subscription plan`);
    // Perform the side effect or state update expressed on the following line.
    tenantFeatures.set(tenant, { plan: response.payload.plan, features: new Set(features) });
    // Perform the side effect or state update expressed on the following line.
    report.tenantEntitlements.push({
      tenant,
      plan: response.payload.plan,
      finance: features.includes("finance"),
      operations: features.includes("operations"),
      agents: features.includes("agents"),
      fleet: features.includes("fleet"),
      reports: features.includes("reports"),
      analytics: features.includes("analytics"),
    });
  }

  // Declare dashboardChecks for use by the surrounding module or function.
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
  // Declare payloads for use by the surrounding module or function.
  const payloads = new Map();
  // Repeat the enclosed work for each required iteration.
  for (const [key, endpoint] of dashboardChecks) {
    // Declare response for use by the surrounding module or function.
    const response = await request(endpoint, sessions.get(key).token);
    // Declare account for use by the surrounding module or function.
    const account = logins.find((candidate) => candidate.key === key);
    // Declare requiredFeature for use by the surrounding module or function.
    const requiredFeature = dashboardFeatureFor(account, endpoint);
    // Declare planFeatureLocked for use by the surrounding module or function.
    const planFeatureLocked = requiredFeature
      && account?.tenant
      && !tenantFeatures.get(account.tenant)?.features.has(requiredFeature);
    // Declare expectedStatus for use by the surrounding module or function.
    const expectedStatus = planFeatureLocked ? 403 : 200;
    // Perform the side effect or state update expressed on the following line.
    report.dashboards.push({ account: key, endpoint, requiredFeature, status: response.status, expectedStatus, success: response.payload?.success });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(response.status, expectedStatus, `${key} ${endpoint}`);
    // Check the condition (planFeatureLocked) and run the matching branch.
    if (planFeatureLocked) {
      // Perform the side effect or state update expressed on the following line.
      assert.equal(response.payload?.code, "PLAN_FEATURE_LOCKED", `${key} ${requiredFeature} endpoint must be denied by its plan entitlement`);
      // Perform the side effect or state update expressed on the following line.
      assert.equal(response.payload?.feature, requiredFeature, `${key} ${endpoint} must identify its locked plan feature`);
    }
    // Perform the side effect or state update expressed on the following line.
    payloads.set(`${key}:${endpoint}`, response.payload);
  }

  // Declare atlasTarget for use by the surrounding module or function.
  const atlasTarget = new URL(process.env.MONGODB_URI || "");
  // Declare atlasDatabase for use by the surrounding module or function.
  const atlasDatabase = decodeURIComponent(atlasTarget.pathname.replace(/^\//, "").split("/")[0] || "");
  // Check the condition (atlasDatabase !== "husseindb" || !atlasTarget.hostname.endsWith(".mong) and run the matching branch.
  if (atlasDatabase !== "husseindb" || !atlasTarget.hostname.endsWith(".mongodb.net")) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Refusing dashboard comparison outside the configured Atlas application database.");
  }
  // Perform the side effect or state update expressed on the following line.
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  // Declare db for use by the surrounding module or function.
  const db = mongoose.connection.db;
  // Declare count for use by the surrounding module or function.
  const count = (collection, filter) => db.collection(collection).countDocuments(filter);
  // Declare aggregateTotal for use by the surrounding module or function.
  const aggregateTotal = async (collection, pipeline, field = "total") => {
    // Declare [row] for use by the surrounding module or function.
    const [row] = await db.collection(collection).aggregate(pipeline).toArray();
    // Return the result of Number() to the caller.
    return Number(row?.[field] || 0);
  };
  // Declare postedRevenue for use by the surrounding module or function.
  const postedRevenue = (tenantId) => aggregateTotal("journalentries", [
    { $match: { tenantId, status: "posted" } },
    { $unwind: "$lines" },
    { $lookup: { from: "chartofaccounts", localField: "lines.account", foreignField: "_id", as: "account" } },
    { $unwind: "$account" },
    { $match: { "account.tenantId": tenantId, "account.type": "revenue", "account.active": true } },
    { $group: { _id: null, total: { $sum: { $subtract: [{ $ifNull: ["$lines.credit", 0] }, { $ifNull: ["$lines.debit", 0] }] } } } },
  ]);
  // Declare active for use by the surrounding module or function.
  const active = { isDeleted: { $ne: true } };
  // Declare paidStatuses for use by the surrounding module or function.
  const paidStatuses = ["paid", "completed", "success"];
  // Repeat the enclosed work for each required iteration.
  for (const [tenant, account] of [["hussein-mboya", "tenantAdminA"], ["amani-trails", "tenantAdminB"], ["demo-safari", "tenantAdminC"]]) {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = new mongoose.Types.ObjectId(sessions.get(account).tenantId);
    // Declare scope for use by the surrounding module or function.
    const scope = { tenantId, ...active };
    // Declare data for use by the surrounding module or function.
    const data = payloads.get(`${account}:/api/admin/dashboard/metrics`)?.data;
    // Declare [revenue, collections, refundedAmount, commission] for use by the surrounding module or function.
    const [revenue, collections, refundedAmount, commission] = await Promise.all([
      postedRevenue(tenantId),
      aggregateTotal("payments", [{ $match: { tenantId, status: "completed" } }, { $group: { _id: null, total: { $sum: { $ifNull: ["$amount", 0] } } } }]),
      aggregateTotal("payments", [{ $match: { tenantId, refundedAmount: { $gt: 0 } } }, { $group: { _id: null, total: { $sum: { $ifNull: ["$refundedAmount", 0] } } } }]),
      aggregateTotal("commissions", [{ $match: { tenantId } }, { $group: { _id: null, total: { $sum: { $ifNull: ["$amount", 0] } } } }]),
    ]);
    // Declare [users, customers, staff, guides, drivers, agents, approvedAgents, pendingAgents, vehicles, availableVehicles, assignedVehicles, maintenanceVehicles, tours, destinations, bookings, pendingBookings, confirmedBookings, completedBookings, cancelledBookings, refundedBookings, payments, completedPayments, pendingPayments, failedPayments] for use by the surrounding module or function.
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
    // Declare expected for use by the surrounding module or function.
    const expected = { users, customers, staff, guides, drivers, agents, approvedAgents, pendingAgents, vehicles, availableVehicles, assignedVehicles, maintenanceVehicles, tours, destinations, bookings, pendingBookings, confirmedBookings, completedBookings, cancelledBookings, refundedBookings, payments, completedPayments, pendingPayments, failedPayments, revenue };
    // Perform the side effect or state update expressed on the following line.
    assert.ok(data, `${tenant} admin dashboard returns metrics data`);
    // Repeat the enclosed work for each required iteration.
    for (const [metric, atlasValue] of Object.entries(expected)) {
      // Perform the side effect or state update expressed on the following line.
      assert.equal(Number(data[metric]), atlasValue, `${tenant} dashboard ${metric} matches Atlas`);
    }
    // Perform the side effect or state update expressed on the following line.
    report.dashboardComparisons.push({ tenant, metricsCompared: Object.keys(expected).length, matched: true });

    // Declare financeData for use by the surrounding module or function.
    const financeData = payloads.get(`${account}:/api/admin/finance/stats`)?.data;
    // Check the condition (!tenantFeatures.get(tenant)?.features.has("finance")) and run the matching branch.
    if (!tenantFeatures.get(tenant)?.features.has("finance")) {
      // Perform the side effect or state update expressed on the following line.
      report.financeComparisons.push({ tenant, plan: tenantFeatures.get(tenant)?.plan, matched: null, reason: "finance feature is not included in the tenant plan" });
      // Skip the remainder of this iteration and continue with the next one.
      continue;
    }
    // Declare expectedFinance for use by the surrounding module or function.
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
    // Perform the side effect or state update expressed on the following line.
    assert.ok(financeData, `${tenant} finance endpoint returns metrics data`);
    // Repeat the enclosed work for each required iteration.
    for (const [metric, atlasValue] of Object.entries(expectedFinance)) {
      // Perform the side effect or state update expressed on the following line.
      assert.ok(Math.abs(Number(financeData[metric] || 0) - atlasValue) < 0.01, `${tenant} finance ${metric} matches Atlas`);
    }
    // Perform the side effect or state update expressed on the following line.
    report.financeComparisons.push({ tenant, metricsCompared: Object.keys(expectedFinance).length, matched: true });
  }

  // Repeat the enclosed work for each required iteration.
  for (const tenant of ["hussein-mboya", "amani-trails", "demo-safari"]) {
    // Repeat the enclosed work for each required iteration.
    for (const endpoint of ["/api/tours", "/api/destinations"]) {
      // Declare response for use by the surrounding module or function.
      const response = await request(endpoint, null, { headers: { "X-Tenant-Slug": tenant } });
      // Declare records for use by the surrounding module or function.
      const records = response.payload?.data || response.payload?.tours || response.payload?.destinations || [];
      // Declare expectedTenantId for use by the surrounding module or function.
      const expectedTenantId = sessions.get({ "hussein-mboya": "tenantAdminA", "amani-trails": "tenantAdminB", "demo-safari": "tenantAdminC" }[tenant]).tenantId;
      // Perform the side effect or state update expressed on the following line.
      report.dashboards.push({ account: tenant, endpoint, status: response.status, recordCount: records.length });
      // Perform the side effect or state update expressed on the following line.
      assert.equal(response.status, 200, `${tenant} ${endpoint}`);
      // Perform the side effect or state update expressed on the following line.
      assert.ok(records.length > 0, `${tenant} ${endpoint} returns public records`);
      // Perform the side effect or state update expressed on the following line.
      assert.ok(records.every((record) => String(record.tenantId) === String(expectedTenantId)), `${tenant} ${endpoint} must contain only its tenant's records`);
    }
  }

  // Declare bookingId for use by the surrounding module or function.
  const bookingId = (key) => payloads.get(`${key}:/api/bookings/my-bookings`)?.bookings?.[0]?._id;
  // Declare customerBookings for use by the surrounding module or function.
  const customerBookings = customerAccounts.map(({ key, tenant }) => ({ key, tenant, bookingId: bookingId(key) }));
  // Perform the side effect or state update expressed on the following line.
  assert.ok(customerBookings.every(({ bookingId: id }) => id), "all 12 tenant customers have seeded bookings");
  // Repeat the enclosed work for each required iteration.
  for (const account of customerAccounts) {
    // Declare foreignBookings for use by the surrounding module or function.
    const foreignBookings = customerBookings.filter((candidate) => candidate.tenant !== account.tenant);
    // Repeat the enclosed work for each required iteration.
    for (const foreign of foreignBookings) {
      // Declare response for use by the surrounding module or function.
      const response = await request(`/api/bookings/${encodeURIComponent(foreign.bookingId)}`, sessions.get(account.key).token);
      // Perform the side effect or state update expressed on the following line.
      report.tenantIsolation.push({ account: account.key, foreignBooking: true, status: response.status });
      // Perform the side effect or state update expressed on the following line.
      assert.equal(response.status, 404, `${account.key} must not retrieve another tenant's booking`);
    }
  }
  // Repeat the enclosed work for each required iteration.
  for (const account of logins.filter((candidate) => candidate.role !== "super_admin" && candidate.role !== "admin")) {
    // Declare denied for use by the surrounding module or function.
    const denied = await request("/api/admin/dashboard/metrics", sessions.get(account.key).token);
    // Perform the side effect or state update expressed on the following line.
    report.rbac.push({ account: account.key, protectedAdminDashboardStatus: denied.status });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(denied.status, 403, `${account.key} cannot use tenant admin dashboard API`);
  }
  // Repeat the enclosed work for each required iteration.
  for (const account of logins.filter((candidate) => candidate.role !== "super_admin")) {
    // Declare denied for use by the surrounding module or function.
    const denied = await request("/api/superadmin/tenants", sessions.get(account.key).token);
    // Perform the side effect or state update expressed on the following line.
    report.rbac.push({ account: account.key, platformTenantManagementStatus: denied.status });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(denied.status, 403, `${account.key} cannot use platform tenant management API`);
  }
} catch (error) {
  // Declare safeMessage for use by the surrounding module or function.
  const safeMessage = String(error?.message || "Validation failed.")
    .replace(/mongodb(?:\+srv)?:\/\/[^\s"']+/gi, "[MongoDB URI redacted]")
    .replace(/\bBearer\s+[^\s"']+/gi, "Bearer [redacted]")
    .replace(/(password|secret|token|credential)\s*[:=]\s*[^\s,;]+/gi, "$1=[redacted]");
  // Perform the side effect or state update expressed on the following line.
  report.failures.push(`${error?.name || "ValidationError"}: ${safeMessage}`);
  // Perform the side effect or state update expressed on the following line.
  console.error(`Demo API validation failed safely: ${safeMessage}`);
  // Perform the side effect or state update expressed on the following line.
  process.exitCode = 1;
} finally {
  // Perform the side effect or state update expressed on the following line.
  await mongoose.disconnect().catch(() => {});
  // Perform the side effect or state update expressed on the following line.
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  // Perform the side effect or state update expressed on the following line.
  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
  // Perform the side effect or state update expressed on the following line.
  console.log(JSON.stringify({ logins: report.logins.length, dashboards: report.dashboards.length, isolationChecks: report.tenantIsolation.length, rbacChecks: report.rbac.length, failures: report.failures, report: path.relative(process.cwd(), reportPath) }, null, 2));
}
