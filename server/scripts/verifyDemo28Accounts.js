import "dotenv/config";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { getSafeDemoApiOrigin, LOGIN_WINDOW_MS, needsLoginWindowWait } from "./demoApiValidationSafety.js";
import { buildDemoAccountMatrix } from "./demoAccountMatrix.js";

const baseUrl = getSafeDemoApiOrigin(process.env.DEMO_API_BASE_URL);
const password = String(process.env.DEMO_TEST_PASSWORD || "");
if (password.length < 8) throw new Error("Set DEMO_TEST_PASSWORD before verifying demo accounts.");
const parsedBase = new URL(baseUrl);
if (["hussein-mboya-tours.onrender.com", "www.hussein-mboya-tours.onrender.com"].includes(parsedBase.hostname.toLowerCase())) {
  throw new Error("Refusing to run the demo account matrix against the production hostname. Use the staging API origin.");
}

const accounts = buildDemoAccountMatrix();
const report = { timestamp: new Date().toISOString(), baseUrl, totalAccounts: accounts.length, results: [], failures: [] };
const sessions = new Map();
const tenantIdsBySlug = new Map();

async function request(endpoint, token, options = {}) {
  const response = await fetch(new URL(endpoint, baseUrl), {
    ...options,
    signal: AbortSignal.timeout(90000),
    headers: {
      "content-type": "application/json",
      "user-agent": "HusseinMboyaStaging28AccountMatrix/1.0",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  let payload = {};
  try { payload = await response.json(); } catch {}
  return { status: response.status, payload };
}

try {
  assert.equal(accounts.length, 28, "The demo account matrix must contain exactly 28 canonical accounts.");

  for (const [index, account] of accounts.entries()) {
    if (needsLoginWindowWait(index, accounts.length)) {
      console.log(`Login rate-limit window reached after ${index} accounts; waiting ${LOGIN_WINDOW_MS}ms.`);
      await new Promise((resolve) => setTimeout(resolve, LOGIN_WINDOW_MS + 1000));
    }

    const login = await request("/api/auth/login", null, {
      method: "POST",
      body: JSON.stringify({ email: account.email, password }),
    });
    if (login.status === 429) throw new Error(`Login rate limiter reached at ${account.email}; stopping safely.`);

    const actualRole = login.payload?.user?.role;
    const actualTenantId = login.payload?.user?.tenantId || null;
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

    try {
      assert.equal(login.status, 200, `${account.email} login`);
      assert.equal(actualRole, account.role, `${account.email} role`);
      assert.ok(login.payload?.token, `${account.email} token`);

      if (account.tenant === null) {
        assert.equal(actualTenantId, null, `${account.email} platform scope`);
      } else if (account.role === "admin") {
        assert.ok(actualTenantId, `${account.email} must resolve to a tenant`);
        const previousTenantId = tenantIdsBySlug.get(account.tenant);
        if (previousTenantId) assert.equal(actualTenantId, previousTenantId, `${account.email} tenant identity is stable`);
        tenantIdsBySlug.set(account.tenant, actualTenantId);
      } else {
        assert.equal(actualTenantId, tenantIdsBySlug.get(account.tenant), `${account.email} must resolve to ${account.tenant}`);
      }

      const token = login.payload.token;
      sessions.set(account.email, { token, tenantId: actualTenantId });
      const dashboard = await request(account.dashboard, token);
      result.dashboardStatus = dashboard.status;
      result.dashboardSuccess = dashboard.payload?.success ?? null;
      assert.equal(dashboard.status, 200, `${account.email} ${account.dashboard}`);
    } catch (error) {
      result.errors.push(error?.message || String(error));
      report.failures.push({ email: account.email, error: error?.message || String(error) });
    }

    report.results.push(result);
    console.log(JSON.stringify(result));
  }

  const authenticated = report.results.filter((result) => result.authenticated);
  assert.equal(authenticated.length, 28, "All 28 demo accounts must authenticate.");
  assert.equal(tenantIdsBySlug.size, 3, "All three tenant admin accounts must resolve.");
  assert.equal(new Set(tenantIdsBySlug.values()).size, 3, "Tenant accounts must resolve to three distinct tenant IDs.");

  const customers = authenticated.filter((result) => result.expectedRole === "customer");
  assert.equal(customers.length, 12, "All 12 seeded customers must authenticate.");
  for (const customer of customers) {
    const session = sessions.get(customer.email);
    const denied = await request("/api/admin/dashboard/metrics", session.token);
    customer.adminDashboardStatus = denied.status;
    assert.equal(denied.status, 403, `${customer.email} must be denied tenant admin dashboard`);
  }

  if (report.failures.length) process.exitCode = 1;
} catch (error) {
  const message = error?.message || String(error);
  report.failures.push({ error: message });
  console.error(`Staging matrix aborted: ${message}`);
  process.exitCode = 1;
} finally {
  const reportPath = path.resolve(process.env.DEMO_API_REPORT_PATH || "reports/demo-28-account-matrix.json");
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
  console.log(JSON.stringify({
    totalAccounts: report.totalAccounts,
    passedLogins: report.results.filter((result) => result.authenticated && !result.errors.length).length,
    failures: report.failures.length,
    report: reportPath,
  }, null, 2));
}
