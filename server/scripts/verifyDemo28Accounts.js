/**
 * Purpose: verify Demo28 Accounts operational script. Main declarations: request, loginWithRateLimitRetry.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import "dotenv/config";
// Load node:assert/strict so this module can use its exported dependencies.
import assert from "node:assert/strict";
// Load node:fs/promises so this module can use its exported dependencies.
import fs from "node:fs/promises";
// Load node:path so this module can use its exported dependencies.
import path from "node:path";
// Load ./demoApiValidationSafety.js so this module can use its exported dependencies.
import { getSafeDemoApiOrigin, LOGIN_WINDOW_MS, needsLoginWindowWait } from "./demoApiValidationSafety.js";
// Load ./demoAccountMatrix.js so this module can use its exported dependencies.
import { buildDemoAccountMatrix } from "./demoAccountMatrix.js";
// Load ./demoApiValidationSafety.js so this module can use its exported dependencies.
import { isExplicitProductionDemoMatrix } from "./demoApiValidationSafety.js";

// Declare baseUrl for use by the surrounding module or function.
const baseUrl = getSafeDemoApiOrigin(process.env.DEMO_API_BASE_URL);
// Declare password for use by the surrounding module or function.
const password = String(process.env.DEMO_TEST_PASSWORD || "");
// Check the condition (password.length < 8) and run the matching branch.
if (password.length < 8) throw new Error("Set DEMO_TEST_PASSWORD before verifying demo accounts.");
// Declare parsedBase for use by the surrounding module or function.
const parsedBase = new URL(baseUrl);
// Check the condition (["hussein-mboya-tours.onrender.com", "www.hussein-mboya-tours.onrender) and run the matching branch.
if (["hussein-mboya-tours.onrender.com", "www.hussein-mboya-tours.onrender.com"].includes(parsedBase.hostname.toLowerCase()) && !isExplicitProductionDemoMatrix(baseUrl)) {
  // Stop the current operation by raising a new Error instance.
  throw new Error("Refusing production API matrix without the exact read-only production matrix authorization.");
}
// Check the condition (parsedBase.hostname.toLowerCase() === "www.hussein-mboya-tours.onrende) and run the matching branch.
if (parsedBase.hostname.toLowerCase() === "www.hussein-mboya-tours.onrender.com") {
  // Stop the current operation by raising a new Error instance.
  throw new Error("Use the canonical production API origin without the www alias.");
}

// Declare accounts for use by the surrounding module or function.
const accounts = buildDemoAccountMatrix();
// Declare report for use by the surrounding module or function.
const report = { timestamp: new Date().toISOString(), baseUrl, totalAccounts: accounts.length, results: [], failures: [] };
// Declare sessions for use by the surrounding module or function.
const sessions = new Map();
// Declare tenantIdsBySlug for use by the surrounding module or function.
const tenantIdsBySlug = new Map();

// Define request; its parameters and body implement this operation.
async function request(endpoint, token, options = {}) {
  // Declare response for use by the surrounding module or function.
  const response = await fetch(new URL(endpoint, baseUrl), {
    ...options,
    signal: AbortSignal.timeout(90000),
    headers: {
      "content-type": "application/json",
      "user-agent": "HusseinMboyaProduction28AccountMatrix/1.1",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  // Declare payload for use by the surrounding module or function.
  let payload = {};
  // Run this operation with a dedicated error-handling path for failures.
  try { payload = await response.json(); } catch {}
  // Return the object assembled below to the caller.
  return { status: response.status, payload };
}

// Define loginWithRateLimitRetry; its parameters and body implement this operation.
async function loginWithRateLimitRetry(account) {
  // The production limiter is IP-based and may include requests from earlier
  // workflow runs. Never bypass it: wait for its full window and retry safely.
  // Repeat the enclosed work for each required iteration.
  for (let retry = 0; retry <= 3; retry += 1) {
    // Declare login for use by the surrounding module or function.
    const login = await request("/api/auth/login", null, {
      method: "POST",
      body: JSON.stringify({ email: account.email, password }),
    });
    // Check the condition (login.status !== 429) and run the matching branch.
    if (login.status !== 429) return login;
    // Check the condition (retry === 3) and run the matching branch.
    if (retry === 3) {
      // Stop the current operation by raising a new Error instance.
      throw new Error(`Login rate limiter remained active after 3 full-window waits at ${account.email}; stopping safely.`);
    }
    // Perform the side effect or state update expressed on the following line.
    console.warn(`Production login rate limit reached at ${account.email}; waiting ${LOGIN_WINDOW_MS + 1000}ms before retry ${retry + 1}/3.`);
    // Perform the side effect or state update expressed on the following line.
    await new Promise((resolve) => setTimeout(resolve, LOGIN_WINDOW_MS + 1000));
  }
  // Stop the current operation by raising a new Error instance.
  throw new Error("Unreachable login retry state.");
}

// Run this operation with a dedicated error-handling path for failures.
try {
  // Perform the side effect or state update expressed on the following line.
  assert.equal(accounts.length, 28, "The demo account matrix must contain exactly 28 canonical accounts.");

  // Repeat the enclosed work for each required iteration.
  for (const [index, account] of accounts.entries()) {
    // Check the condition (needsLoginWindowWait(index, accounts.length)) and run the matching branch.
    if (needsLoginWindowWait(index, accounts.length)) {
      // Perform the side effect or state update expressed on the following line.
      console.log(`Login rate-limit window reached after ${index} accounts; waiting ${LOGIN_WINDOW_MS + 1000}ms.`);
      // Perform the side effect or state update expressed on the following line.
      await new Promise((resolve) => setTimeout(resolve, LOGIN_WINDOW_MS + 1000));
    }

    // Declare login for use by the surrounding module or function.
    const login = await loginWithRateLimitRetry(account);
    // Declare actualRole for use by the surrounding module or function.
    const actualRole = login.payload?.user?.role;
    // Declare actualTenantId for use by the surrounding module or function.
    const actualTenantId = login.payload?.user?.tenantId || null;
    // Declare result for use by the surrounding module or function.
    const result = {
      email: account.email,
      expectedRole: account.role,
      actualRole,
      expectedTenant: account.tenant,
      actualTenantId,
      authenticated: login.status === 200,
      loginStatus: login.status,
      dashboardStatus: null,
      dashboardSuccess: null,
      errors: [],
    };

    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Perform the side effect or state update expressed on the following line.
      assert.equal(login.status, 200, `${account.email} login`);
      // Perform the side effect or state update expressed on the following line.
      assert.equal(actualRole, account.role, `${account.email} role`);
      // Perform the side effect or state update expressed on the following line.
      assert.ok(login.payload?.token, `${account.email} token`);

      // Check the condition (account.tenant === null) and run the matching branch.
      if (account.tenant === null) {
        // Perform the side effect or state update expressed on the following line.
        assert.equal(actualTenantId, null, `${account.email} platform scope`);
      } else if (account.role === "admin") {
        // Perform the side effect or state update expressed on the following line.
        assert.ok(actualTenantId, `${account.email} must resolve to a tenant`);
        // Declare previousTenantId for use by the surrounding module or function.
        const previousTenantId = tenantIdsBySlug.get(account.tenant);
        // Check the condition (previousTenantId) and run the matching branch.
        if (previousTenantId) assert.equal(actualTenantId, previousTenantId, `${account.email} tenant identity is stable`);
        // Perform the side effect or state update expressed on the following line.
        tenantIdsBySlug.set(account.tenant, actualTenantId);
      } else {
        // Perform the side effect or state update expressed on the following line.
        assert.equal(actualTenantId, tenantIdsBySlug.get(account.tenant), `${account.email} must resolve to ${account.tenant}`);
      }

      // Declare token for use by the surrounding module or function.
      const token = login.payload.token;
      // Perform the side effect or state update expressed on the following line.
      sessions.set(account.email, { token, tenantId: actualTenantId });
      // Declare dashboard for use by the surrounding module or function.
      const dashboard = await request(account.dashboard, token);
      // Perform the side effect or state update expressed on the following line.
      result.dashboardStatus = dashboard.status;
      // Perform the side effect or state update expressed on the following line.
      result.dashboardSuccess = dashboard.payload?.success ?? null;
      // Perform the side effect or state update expressed on the following line.
      assert.equal(dashboard.status, 200, `${account.email} ${account.dashboard}`);
    } catch (error) {
      // Perform the side effect or state update expressed on the following line.
      result.errors.push(error?.message || String(error));
      // Perform the side effect or state update expressed on the following line.
      report.failures.push({ email: account.email, error: error?.message || String(error) });
    }

    // Perform the side effect or state update expressed on the following line.
    report.results.push(result);
    // Perform the side effect or state update expressed on the following line.
    console.log(JSON.stringify(result));
  }

  // Declare authenticated for use by the surrounding module or function.
  const authenticated = report.results.filter((result) => result.authenticated);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(authenticated.length, 28, "All 28 demo accounts must authenticate.");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(tenantIdsBySlug.size, 3, "All three tenant admin accounts must resolve.");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(new Set(tenantIdsBySlug.values()).size, 3, "Tenant accounts must resolve to three distinct tenant IDs.");

  // Declare customers for use by the surrounding module or function.
  const customers = authenticated.filter((result) => result.expectedRole === "customer");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(customers.length, 12, "All 12 seeded customers must authenticate.");
  // Repeat the enclosed work for each required iteration.
  for (const customer of customers) {
    // Declare session for use by the surrounding module or function.
    const session = sessions.get(customer.email);
    // Declare denied for use by the surrounding module or function.
    const denied = await request("/api/admin/dashboard/metrics", session.token);
    // Perform the side effect or state update expressed on the following line.
    customer.adminDashboardStatus = denied.status;
    // Perform the side effect or state update expressed on the following line.
    assert.equal(denied.status, 403, `${customer.email} must be denied tenant admin dashboard`);
  }

  // Check the condition (report.failures.length) and run the matching branch.
  if (report.failures.length) process.exitCode = 1;
} catch (error) {
  // Declare message for use by the surrounding module or function.
  const message = error?.message || String(error);
  // Perform the side effect or state update expressed on the following line.
  report.failures.push({ error: message });
  // Perform the side effect or state update expressed on the following line.
  console.error(`Demo account matrix aborted: ${message}`);
  // Perform the side effect or state update expressed on the following line.
  process.exitCode = 1;
} finally {
  // Declare reportPath for use by the surrounding module or function.
  const reportPath = path.resolve(process.env.DEMO_API_REPORT_PATH || "reports/demo-28-account-matrix.json");
  // Perform the side effect or state update expressed on the following line.
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  // Perform the side effect or state update expressed on the following line.
  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
  // Perform the side effect or state update expressed on the following line.
  console.log(JSON.stringify({
    totalAccounts: report.totalAccounts,
    passedLogins: report.results.filter((result) => result.authenticated && !result.errors.length).length,
    failures: report.failures.length,
    report: reportPath,
  }, null, 2));
}
