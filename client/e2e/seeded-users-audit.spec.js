/**
 * Purpose: seeded users audit.spec automated test. Main declarations: normalizeRole, tenantIdOf, pause, sanitizeError, getReadResponse.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { test, expect } from "@playwright/test";
// Load node:fs/promises so this module can use its exported dependencies.
import fs from "node:fs/promises";
// Load node:path so this module can use its exported dependencies.
import path from "node:path";
// Load node:process so this module can use its exported dependencies.
import process from "node:process";

// Declare password for use by the surrounding module or function.
const password = process.env.DEMO_SMOKE_PASSWORD || process.env.DEMO_TEST_PASSWORD || process.env.SEED_DEMO_PASSWORD;
// Declare users for use by the surrounding module or function.
const users = [
  { email: "superadmin1@husseinmboya.com", role: "super_admin", tenant: null, route: "/superadmin/dashboard", menu: "/superadmin/users" },

  { email: "admin1@husseinmboya.com", role: "admin", tenant: "hussein-mboya", route: "/admin/dashboard", menu: "/admin/users" },
  { email: "tourmanager1@husseinmboya.com", role: "tour_manager", tenant: "hussein-mboya", route: "/tour-manager/dashboard", menu: "/tour-manager/tours" },
  { email: "agent1@husseinmboya.com", role: "agent", tenant: "hussein-mboya", route: "/agent/dashboard", menu: "/agent/bookings" },
  { email: "guide1@husseinmboya.com", role: "tour_guide", tenant: "hussein-mboya", route: "/guide/dashboard", menu: "/guide/assigned-tours" },
  { email: "driver1@husseinmboya.com", role: "driver", tenant: "hussein-mboya", route: "/driver/dashboard", menu: "/driver/dashboard" },
  { email: "customer1@husseinmboya.com", role: "customer", tenant: "hussein-mboya", route: "/dashboard", menu: "/my-bookings" },

  { email: "admin1@amanitrails.com", role: "admin", tenant: "amani-trails", route: "/admin/dashboard", menu: "/admin/users" },
  { email: "admin1@demosafari.com", role: "admin", tenant: "demo-safari", route: "/admin/dashboard", menu: "/admin/users" },
];
// Check the condition (users.length !== 9) and run the matching branch.
if (users.length !== 9) throw new Error(`Expected 9 selected audit users, found ${users.length}`);
// Declare auditUsers for use by the surrounding module or function.
const auditUsers = process.env.DEMO_AUDIT_EMAIL
  ? users.filter((account) => account.email === process.env.DEMO_AUDIT_EMAIL.trim().toLowerCase())
  : users;
// Check the condition (process.env.DEMO_AUDIT_EMAIL && auditUsers.length !== 1) and run the matching branch.
if (process.env.DEMO_AUDIT_EMAIL && auditUsers.length !== 1) throw new Error("DEMO_AUDIT_EMAIL must match one seeded fixture account");

// Declare resumeFile for use by the surrounding module or function.
const resumeFile = process.env.DEMO_AUDIT_RESUME_FILE;

// Declare roleAliases for use by the surrounding module or function.
const roleAliases = { guide: "tour_guide", tourguide: "tour_guide", manager: "tour_manager", tourmanager: "tour_manager", superadmin: "super_admin" };
// Declare normalizeRole for use by the surrounding module or function.
const normalizeRole = (role) => {
  // Declare value for use by the surrounding module or function.
  const value = typeof role === "object" ? role?.name || role?.role : role;
  // Declare normalized for use by the surrounding module or function.
  const normalized = String(value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  // Return the expression shown below to the caller.
  return roleAliases[normalized] || roleAliases[normalized.replaceAll("_", "")] || normalized;
};
// Declare tenantIdOf for use by the surrounding module or function.
const tenantIdOf = (user) => {
  // Declare value for use by the surrounding module or function.
  const value = user?.tenantId;
  // Return the expression shown below to the caller.
  return value && typeof value === "object" ? value._id || value.id || null : value || null;
};
// Declare pause for use by the surrounding module or function.
const pause = (duration) => new Promise((resolve) => setTimeout(resolve, duration));
// Declare sanitizeError for use by the surrounding module or function.
const sanitizeError = (error) => String(error?.message || error || "Unknown browser audit error")
  .replace(/(authorization:\s*Bearer\s+)[^\s\r\n]+/gi, "$1[redacted]");
// Declare getReadResponse for use by the surrounding module or function.
const getReadResponse = async (context, url, options = {}, onRetry = () => {}) => {
  // Repeat the enclosed work for each required iteration.
  for (let attempt = 0; ; attempt += 1) {
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Declare response for use by the surrounding module or function.
      const response = await context.request.get(url, { ...options, timeout: 45_000 });
      // Check the condition (attempt === 0 && response.status() >= 500) and run the matching branch.
      if (attempt === 0 && response.status() >= 500) {
        // Perform the side effect or state update expressed on the following line.
        onRetry(`HTTP ${response.status()}`);
        // Perform the side effect or state update expressed on the following line.
        await pause(1500);
        // Skip the remainder of this iteration and continue with the next one.
        continue;
      }
      // Return the value of response to the caller.
      return response;
    } catch (error) {
      // Check the condition (attempt > 0 || !/ETIMEDOUT|ECONNRESET|ECONNREFUSED|EAI_AGAIN/i.test(St) and run the matching branch.
      if (attempt > 0 || !/ETIMEDOUT|ECONNRESET|ECONNREFUSED|EAI_AGAIN/i.test(String(error?.message || ""))) throw error;
      // Perform the side effect or state update expressed on the following line.
      onRetry(error.code || "network timeout");
      // Perform the side effect or state update expressed on the following line.
      await pause(1500);
    }
  }
};
// Declare gotoWithRetry for use by the surrounding module or function.
const gotoWithRetry = async (page, url, onRetry = () => {}) => {
  // Repeat the enclosed work for each required iteration.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Perform the side effect or state update expressed on the following line.
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 25_000 });
      // Return the result to the caller.
      return;
    } catch (error) {
      // Check the condition (attempt === 2 || !/ERR_TIMED_OUT|ERR_CONNECTION_RESET|ERR_NETWORK_CHAN) and run the matching branch.
      if (attempt === 2 || !/ERR_TIMED_OUT|ERR_CONNECTION_RESET|ERR_NETWORK_CHANGED|Timeout|ERR_HTTP2_PING_FAILED/i.test(String(error?.message || ""))) throw error;
      // Perform the side effect or state update expressed on the following line.
      onRetry(String(error.message).split("\n")[0]);
      // Perform the side effect or state update expressed on the following line.
      await pause((attempt + 1) * 2000);
    }
  }
};

// Perform the side effect or state update expressed on the following line.
test("seeded 9-account browser login, dashboard, session and logout audit", async ({ browser }, testInfo) => {
  // Perform the side effect or state update expressed on the following line.
  test.skip(!password, "Set DEMO_SMOKE_PASSWORD for the controlled seeded-account browser audit.");
  // Perform the side effect or state update expressed on the following line.
  test.setTimeout(2 * 60 * 60 * 1000);
  // Declare outputDirectory for use by the surrounding module or function.
  const outputDirectory = resumeFile ? path.dirname(resumeFile) : testInfo.outputPath("seeded-user-audit");
  // Perform the side effect or state update expressed on the following line.
  await fs.mkdir(outputDirectory, { recursive: true });
  // Declare auditFilePath for use by the surrounding module or function.
  const auditFilePath = resumeFile || path.join(outputDirectory, "audit.json");
  // Declare previousAudit for use by the surrounding module or function.
  let previousAudit = null;
  // Check the condition (resumeFile) and run the matching branch.
  if (resumeFile) {
    // Run this operation with a dedicated error-handling path for failures.
    try { previousAudit = JSON.parse(await fs.readFile(resumeFile, "utf8")); }
    // Handle the error raised by the preceding protected operation.
    catch (error) { if (error.code !== "ENOENT") throw error; }
  }
  // Declare sameSource for use by the surrounding module or function.
  const sameSource = !process.env.DEMO_AUDIT_SOURCE_SHA || previousAudit?.sourceSha === process.env.DEMO_AUDIT_SOURCE_SHA;
  // Declare sameRun for use by the surrounding module or function.
  const sameRun = previousAudit && sameSource;
  // Declare completedEmails for use by the surrounding module or function.
  const completedEmails = new Set((sameRun ? previousAudit.accounts : [])
    .filter((row) => row.steps?.includes("logout cleared and invalidated session") && !row.apiResponseError && !row.badApiResponses?.length)
    .map((row) => row.email));
  // Declare pendingUsers for use by the surrounding module or function.
  const pendingUsers = auditUsers.filter((account) => !completedEmails.has(account.email));
  // Declare audit for use by the surrounding module or function.
  const audit = {
    sourceSha: process.env.DEMO_AUDIT_SOURCE_SHA || null,
    startedAt: sameRun ? previousAudit.startedAt : new Date().toISOString(),
    resumedAt: sameRun ? new Date().toISOString() : undefined,
    accounts: (sameRun ? previousAudit.accounts : []).filter((row) => completedEmails.has(row.email)),
    tenantScope: [], errors: [], screenshots: sameRun ? previousAudit.screenshots || [] : [],
  };
  // Declare tenantIdsBySlug for use by the surrounding module or function.
  const tenantIdsBySlug = new Map(audit.accounts
    .filter((account) => account.expectedRole === "admin" && account.expectedTenant && account.tenantId)
    .map((account) => [account.expectedTenant, String(account.tenantId)]));
  // Declare apiOrigin for use by the surrounding module or function.
  let apiOrigin = "";

  // Repeat the enclosed work for each required iteration.
  for (const [index, account] of pendingUsers.entries()) {
    // Check the condition (!process.env.DEMO_AUDIT_EMAIL && index > 0 && index % 10 === 0) and run the matching branch.
    if (!process.env.DEMO_AUDIT_EMAIL && index > 0 && index % 10 === 0) await pause(15 * 60 * 1000 + 1500);
    // Declare context for use by the surrounding module or function.
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    // Declare page for use by the surrounding module or function.
    const page = await context.newPage();
    // Declare row for use by the surrounding module or function.
    const row = { email: account.email, expectedRole: account.role, expectedTenant: account.tenant, steps: [] };
    // Declare consoleErrors for use by the surrounding module or function.
    const consoleErrors = [];
    // Declare failedRequests for use by the surrounding module or function.
    const failedRequests = [];
    // Declare badResponses for use by the surrounding module or function.
    const badResponses = [];
    // Declare loginNetwork for use by the surrounding module or function.
    const loginNetwork = { started: false, url: null, failure: null };

    // Perform the side effect or state update expressed on the following line.
    page.on("request", (request) => {
      // Check the condition (request.url().includes("/api/auth/login") && request.method() === "POS) and run the matching branch.
      if (request.url().includes("/api/auth/login") && request.method() === "POST") {
        // Perform the side effect or state update expressed on the following line.
        loginNetwork.started = true;
        // Perform the side effect or state update expressed on the following line.
        loginNetwork.url = request.url();
      }
    });

    // Perform the side effect or state update expressed on the following line.
    page.on("requestfailed", (request) => {
      // Check the condition (request.url().includes("/api/auth/login") && request.method() === "POS) and run the matching branch.
      if (request.url().includes("/api/auth/login") && request.method() === "POST") {
        // Perform the side effect or state update expressed on the following line.
        loginNetwork.failure = request.failure()?.errorText || "Login request failed without an error description";
      }
    });
    // Check the condition (account.tenant) and run the matching branch.
    if (account.tenant) {
      // Perform the side effect or state update expressed on the following line.
      await page.route("**/api/auth/login", async (route) => {
        // Declare headers for use by the surrounding module or function.
        const headers = { ...route.request().headers(), "X-Tenant-Slug": account.tenant };
        // Perform the side effect or state update expressed on the following line.
        await route.continue({ headers });
      });
      // Perform the side effect or state update expressed on the following line.
      row.loginTenantSelector = account.tenant;
    }
    // Perform the side effect or state update expressed on the following line.
    page.on("pageerror", (error) => consoleErrors.push(error.message));
    // Perform the side effect or state update expressed on the following line.
    page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
    // Perform the side effect or state update expressed on the following line.
    page.on("requestfailed", (request) => failedRequests.push(`${request.method()} ${new URL(request.url()).pathname}`));
    // Perform the side effect or state update expressed on the following line.
    page.on("response", (response) => {
      // Declare url for use by the surrounding module or function.
      const url = new URL(response.url());
      // Check the condition (url.pathname.endsWith("/api/auth/login") && response.request().method() and run the matching branch.
      if (url.pathname.endsWith("/api/auth/login") && response.request().method() === "POST") apiOrigin = url.origin;
      // Declare expectedUnauthenticatedProbe for use by the surrounding module or function.
      const expectedUnauthenticatedProbe = /\/api\/auth\/me\/?$/.test(url.pathname) && response.status() === 401;
      // Declare expectedStaleTenantProbe for use by the surrounding module or function.
      const expectedStaleTenantProbe = account.role === "super_admin"
        && !row.steps.includes("login response accepted")
        && /\/api\/auth\/me\/?$/.test(url.pathname)
        && response.status() === 404;
      // Check the condition (url.pathname.startsWith("/api/") && response.status() >= 400 && !expec) and run the matching branch.
      if (url.pathname.startsWith("/api/") && response.status() >= 400 && !expectedUnauthenticatedProbe && !expectedStaleTenantProbe) {
        // Perform the side effect or state update expressed on the following line.
        badResponses.push(`${response.status()} ${url.pathname}`);
      }
    });

    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Check the condition (account.role === "super_admin") and run the matching branch.
      if (account.role === "super_admin") {
        // Perform the side effect or state update expressed on the following line.
        await page.addInitScript(() => {
          // Perform the side effect or state update expressed on the following line.
          localStorage.setItem("tenantId", "stale-tenant-selection");
          // Perform the side effect or state update expressed on the following line.
          localStorage.setItem("tenantSlug", "hussein-mboya");
          // Perform the side effect or state update expressed on the following line.
          localStorage.setItem("tenantKey", "stale-tenant-selection");
        });
      }
      // Perform the side effect or state update expressed on the following line.
      await gotoWithRetry(page, "/login", (reason) => { row.navigationRetries = [...(row.navigationRetries || []), reason]; });
      // Perform the side effect or state update expressed on the following line.
      await page.getByPlaceholder(/enter email/i).fill(account.email);
      // Perform the side effect or state update expressed on the following line.
      await page.getByPlaceholder(/enter password/i).fill(password);
      // Declare loginResponsePromise for use by the surrounding module or function.
      const loginResponsePromise = page.waitForResponse((response) => response.url().includes("/api/auth/login") && response.request().method() === "POST", { timeout: 45_000 });
      // Perform the side effect or state update expressed on the following line.
      await page.getByRole("button", { name: "Login", exact: true }).click();
      // Declare loginResponse for use by the surrounding module or function.
      let loginResponse = await loginResponsePromise;
      // Perform the side effect or state update expressed on the following line.
      row.loginStatus = loginResponse.status();
      // Check the condition (loginResponse.status() === 429) and run the matching branch.
      if (loginResponse.status() === 429) {
        // Declare retryAfter for use by the surrounding module or function.
        const retryAfter = Number(loginResponse.headers()["retry-after"] || 900);
        // Perform the side effect or state update expressed on the following line.
        row.rateLimited = true;
        // Perform the side effect or state update expressed on the following line.
        await pause((retryAfter + 2) * 1000);
        // Perform the side effect or state update expressed on the following line.
        await page.reload({ waitUntil: "domcontentloaded", timeout: 25_000 });
        // Perform the side effect or state update expressed on the following line.
        await page.getByPlaceholder(/enter email/i).fill(account.email);
        // Perform the side effect or state update expressed on the following line.
        await page.getByPlaceholder(/enter password/i).fill(password);
        // Declare retryPromise for use by the surrounding module or function.
        const retryPromise = page.waitForResponse((response) => response.url().includes("/api/auth/login") && response.request().method() === "POST", { timeout: 45_000 });
        // Perform the side effect or state update expressed on the following line.
        await page.getByRole("button", { name: "Login", exact: true }).click();
        // Perform the side effect or state update expressed on the following line.
        loginResponse = await retryPromise;
        // Perform the side effect or state update expressed on the following line.
        row.loginStatus = loginResponse.status();
        // Check the condition (loginResponse.status() !== 200) and run the matching branch.
        if (loginResponse.status() !== 200) throw new Error(`Login retry returned HTTP ${loginResponse.status()}`);
      } else if (loginResponse.status() !== 200) {
        // Stop the current operation by raising a new Error instance.
        throw new Error(`Login returned HTTP ${loginResponse.status()}`);
      }

      // Declare loginPayload for use by the surrounding module or function.
      const loginPayload = await loginResponse.json();
      // Declare loggedUser for use by the surrounding module or function.
      const loggedUser = loginPayload.user;
      // Perform the side effect or state update expressed on the following line.
      row.actualRole = normalizeRole(loggedUser?.role || loggedUser?.legacyRole);
      // Perform the side effect or state update expressed on the following line.
      row.tenantId = tenantIdOf(loggedUser);
      // Check the condition (account.role === "admin" && account.tenant && row.tenantId) and run the matching branch.
      if (account.role === "admin" && account.tenant && row.tenantId) tenantIdsBySlug.set(account.tenant, String(row.tenantId));
      // Perform the side effect or state update expressed on the following line.
      row.permissionCount = Array.isArray(loggedUser?.roleId?.permissions) ? loggedUser.roleId.permissions.length : Array.isArray(loggedUser?.permissions) ? loggedUser.permissions.length : null;
      // Perform the side effect or state update expressed on the following line.
      row.steps.push("login response accepted");
      // Check the condition (row.actualRole !== account.role) and run the matching branch.
      if (row.actualRole !== account.role) throw new Error(`Expected role ${account.role}, received ${row.actualRole || "none"}`);
      // Check the condition (account.tenant === null ? Boolean(row.tenantId) : !row.tenantId) and run the matching branch.
      if (account.tenant === null ? Boolean(row.tenantId) : !row.tenantId) throw new Error("Tenant assignment did not match the account scope");

      // Perform the side effect or state update expressed on the following line.
      await expect(page).toHaveURL(new RegExp(account.route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), { timeout: 30_000 });
      // Declare storedSession for use by the surrounding module or function.
      const storedSession = await page.evaluate(() => ({
        tokenPresent: Boolean(localStorage.getItem("token")),
        user: JSON.parse(localStorage.getItem("user") || "null"),
        permissions: JSON.parse(localStorage.getItem("permissions") || "[]"),
        tenantId: localStorage.getItem("tenantId"),
        tenantSlug: localStorage.getItem("tenantSlug"),
        tenantKey: localStorage.getItem("tenantKey"),
      }));
      // Perform the side effect or state update expressed on the following line.
      row.sessionCreated = storedSession.tokenPresent;
      // Check the condition (!storedSession.tokenPresent || normalizeRole(storedSession.user?.role)) and run the matching branch.
      if (!storedSession.tokenPresent || normalizeRole(storedSession.user?.role) !== account.role) throw new Error("Browser session or persisted role is missing");
      // Check the condition (account.role === "super_admin" && (storedSession.tenantId || storedSes) and run the matching branch.
      if (account.role === "super_admin" && (storedSession.tenantId || storedSession.tenantSlug || storedSession.tenantKey || tenantIdOf(storedSession.user))) {
        // Stop the current operation by raising a new Error instance.
        throw new Error("Platform login retained a stale tenant selection or tenant assignment");
      }
      // Check the condition (account.role === "super_admin") and run the matching branch.
      if (account.role === "super_admin") row.staleTenantSelectionCleared = true;
      // Perform the side effect or state update expressed on the following line.
      row.permissionCount = storedSession.permissions.length;
      // Perform the side effect or state update expressed on the following line.
      row.steps.push("browser session and permissions loaded");

      // Check the condition (account.tenant) and run the matching branch.
      if (account.tenant) {
        // Declare otherTenantId for use by the surrounding module or function.
        const otherTenantId = [...tenantIdsBySlug.entries()].find(([slug]) => slug !== account.tenant)?.[1];
        // Check the condition (otherTenantId) and run the matching branch.
        if (otherTenantId) {
          // Declare crossTenantResponse for use by the surrounding module or function.
          const crossTenantResponse = await getReadResponse(context, `${apiOrigin}/api/subscription`, {
            headers: {
              authorization: `Bearer ${await page.evaluate(() => localStorage.getItem("token"))}`,
              "X-Tenant-ID": otherTenantId,
            },
          }, (reason) => { row.readRetries = [...(row.readRetries || []), { endpoint: "/api/subscription (cross-tenant)", reason }]; });
          // Perform the side effect or state update expressed on the following line.
          row.crossTenantSelectorStatus = crossTenantResponse.status();
          // Check the condition (![403, 404].includes(crossTenantResponse.status())) and run the matching branch.
          if (![403, 404].includes(crossTenantResponse.status())) {
            // Stop the current operation by raising a new Error instance.
            throw new Error(`Cross-tenant selector expected an access-denial status (403 or concealed 404), received ${crossTenantResponse.status()}`);
          }
          // Perform the side effect or state update expressed on the following line.
          row.crossTenantSelectorDenied = true;
          // Perform the side effect or state update expressed on the following line.
          row.steps.push(crossTenantResponse.status() === 404 ? "cross-tenant selector concealed with 404" : "cross-tenant selector rejected with 403");
        }
      }

      // Declare authMeResponse for use by the surrounding module or function.
      const authMeResponse = await getReadResponse(context, `${apiOrigin}/api/auth/me`, {
        headers: { authorization: `Bearer ${await page.evaluate(() => localStorage.getItem("token"))}` },
      }, (reason) => { row.readRetries = [...(row.readRetries || []), { endpoint: "/api/auth/me", reason }]; });
      // Perform the side effect or state update expressed on the following line.
      row.authMeStatus = authMeResponse.status();
      // Declare authMe for use by the surrounding module or function.
      const authMe = await authMeResponse.json();
      // Declare currentUser for use by the surrounding module or function.
      const currentUser = authMe.user || authMe;
      // Perform the side effect or state update expressed on the following line.
      row.authMeRole = normalizeRole(currentUser.role || currentUser.legacyRole);
      // Perform the side effect or state update expressed on the following line.
      row.authMeTenantId = tenantIdOf(currentUser);
      // Check the condition (row.authMeStatus !== 200 || row.authMeRole !== account.role || String() and run the matching branch.
      if (row.authMeStatus !== 200 || row.authMeRole !== account.role || String(row.authMeTenantId || "") !== String(row.tenantId || "")) {
        // Stop the current operation by raising a new Error instance.
        throw new Error("Authenticated /auth/me identity did not match login identity");
      }
      // Perform the side effect or state update expressed on the following line.
      row.steps.push("authenticated API session verified");

      // Declare features for use by the surrounding module or function.
      let features = new Set();
      // Check the condition (account.tenant) and run the matching branch.
      if (account.tenant) {
        // Declare subscriptionResponse for use by the surrounding module or function.
        const subscriptionResponse = await getReadResponse(context, `${apiOrigin}/api/subscription`, {
          headers: { authorization: `Bearer ${await page.evaluate(() => localStorage.getItem("token"))}` },
        }, (reason) => { row.readRetries = [...(row.readRetries || []), { endpoint: "/api/subscription", reason }]; });
        // Perform the side effect or state update expressed on the following line.
        row.subscriptionStatus = subscriptionResponse.status();
        // Declare subscription for use by the surrounding module or function.
        const subscription = await subscriptionResponse.json();
        // Perform the side effect or state update expressed on the following line.
        row.tenantPlan = subscription.plan || null;
        // Perform the side effect or state update expressed on the following line.
        features = new Set(Array.isArray(subscription.features) ? subscription.features : []);
        // Check the condition (row.subscriptionStatus !== 200 || !row.tenantPlan) and run the matching branch.
        if (row.subscriptionStatus !== 200 || !row.tenantPlan) throw new Error("Tenant subscription features were not available for route authorization");
      }

      // Declare dashboardFeature for use by the surrounding module or function.
      const dashboardFeature = {
        admin: "dashboard",
        tour_manager: "operations",
        agent: "agents",
        tour_guide: "operations",
        driver: "fleet",
        customer: "bookings",
      }[account.role];
      // Declare dashboardFeatureAllowed for use by the surrounding module or function.
      const dashboardFeatureAllowed = account.role === "super_admin" || features.has(dashboardFeature);
      // Perform the side effect or state update expressed on the following line.
      row.dashboardFeature = dashboardFeature || "platform";
      // Perform the side effect or state update expressed on the following line.
      row.dashboardFeatureAllowed = dashboardFeatureAllowed;
      // Declare dashboardEndpoint for use by the surrounding module or function.
      const dashboardEndpoint = {
        super_admin: "/api/superadmin/dashboard",
        admin: "/api/admin/dashboard/metrics",
        tour_manager: "/api/tourmanager/dashboard",
        agent: "/api/agent/dashboard",
        tour_guide: "/api/guide/dashboard",
        driver: "/api/driver/dashboard",
        customer: "/api/bookings/my-bookings",
      }[account.role];
      // Declare dashboardResponse for use by the surrounding module or function.
      const dashboardResponse = await getReadResponse(context, `${apiOrigin}${dashboardEndpoint}`, {
        headers: { authorization: `Bearer ${await page.evaluate(() => localStorage.getItem("token"))}` },
      }, (reason) => { row.readRetries = [...(row.readRetries || []), { endpoint: dashboardEndpoint, reason }]; });
      // Perform the side effect or state update expressed on the following line.
      row.dashboardApiStatus = dashboardResponse.status();
      // Declare dashboardPayload for use by the surrounding module or function.
      const dashboardPayload = await dashboardResponse.json();
      // Check the condition (dashboardFeatureAllowed) and run the matching branch.
      if (dashboardFeatureAllowed) {
        // Check the condition (dashboardResponse.status() !== 200) and run the matching branch.
        if (dashboardResponse.status() !== 200) throw new Error(`Permitted ${account.role} dashboard API returned HTTP ${dashboardResponse.status()}`);
        // Perform the side effect or state update expressed on the following line.
        await expect(page.locator("main").last()).not.toBeEmpty({ timeout: 30_000 });
        // Perform the side effect or state update expressed on the following line.
        row.dashboardLoaded = true;
      } else {
        // Check the condition (dashboardResponse.status() !== 403 || dashboardPayload.code !== "PLAN_) and run the matching branch.
        if (dashboardResponse.status() !== 403 || dashboardPayload.code !== "PLAN_FEATURE_LOCKED") {
          // Stop the current operation by raising a new Error instance.
          throw new Error(`Unentitled ${account.role} dashboard API did not enforce the tenant plan`);
        }
        // Perform the side effect or state update expressed on the following line.
        await expect(page.getByText("Subscription feature lock", { exact: true })).toBeVisible({ timeout: 30_000 });
        // Perform the side effect or state update expressed on the following line.
        row.dashboardLocked = true;
      }
      // Perform the side effect or state update expressed on the following line.
      row.steps.push(dashboardFeatureAllowed ? "role dashboard loaded" : "role dashboard correctly plan locked");

      // Check the condition (account.role === "customer" && account.tenant === "hussein-mboya" && a) and run the matching branch.
      if (account.role === "customer" && account.tenant === "hussein-mboya" && account.email.endsWith("customer1@husseinmboya.com")) {
        // Perform the side effect or state update expressed on the following line.
        await gotoWithRetry(page, "/destinations", (reason) => { row.navigationRetries = [...(row.navigationRetries || []), reason]; });
        // Perform the side effect or state update expressed on the following line.
        await expect(page.locator("main").last()).toContainText(/destination/i);
        // Declare destinationLink for use by the surrounding module or function.
        const destinationLink = page.locator("main").last().locator("a[href^='/destinations/']").first();
        // Perform the side effect or state update expressed on the following line.
        await expect(destinationLink).toBeVisible({ timeout: 20_000 });
        // Perform the side effect or state update expressed on the following line.
        await destinationLink.click();
        // Perform the side effect or state update expressed on the following line.
        await expect(page).toHaveURL(/\/destinations\/[^/]+/);
        // Perform the side effect or state update expressed on the following line.
        await expect(page.locator("main").last()).not.toContainText("Destination not found");

        // Perform the side effect or state update expressed on the following line.
        await gotoWithRetry(page, "/tours", (reason) => { row.navigationRetries = [...(row.navigationRetries || []), reason]; });
        // Declare tourLink for use by the surrounding module or function.
        const tourLink = page.locator("a[href*='/tours/']:not([href='/tours'])").first();
        // Perform the side effect or state update expressed on the following line.
        await expect(tourLink).toBeVisible({ timeout: 20_000 });
        // Perform the side effect or state update expressed on the following line.
        await tourLink.click();
        // Perform the side effect or state update expressed on the following line.
        await expect(page).toHaveURL(/\/tours\/[^/]+/);
        // Perform the side effect or state update expressed on the following line.
        await expect(page.getByRole("button", { name: "Book This Adventure" })).toBeVisible();
        // Perform the side effect or state update expressed on the following line.
        await page.getByRole("button", { name: "Book This Adventure" }).click();
        // Perform the side effect or state update expressed on the following line.
        await expect(page).toHaveURL(/\/checkout\/tour\/[^/]+/);
        // Perform the side effect or state update expressed on the following line.
        await expect(page.getByLabel("Travel date")).toBeVisible({ timeout: 20_000 });
        // Perform the side effect or state update expressed on the following line.
        row.customerJourney = "PASS through booking and payment initiation UI; no production booking or charge submitted";
        // Perform the side effect or state update expressed on the following line.
        row.steps.push("destination discovery, tour details and checkout initiation loaded without mutation");
      }

      // Check the condition (account.role === "super_admin") and run the matching branch.
      if (account.role === "super_admin") {
        // Perform the side effect or state update expressed on the following line.
        await gotoWithRetry(page, "/superadmin/settings", (reason) => { row.navigationRetries = [...(row.navigationRetries || []), reason]; });
        // Declare mpesaCard for use by the surrounding module or function.
        const mpesaCard = page.locator("section").filter({ hasText: "Platform M-Pesa Subscription Checkout" }).first();
        // Perform the side effect or state update expressed on the following line.
        await expect(mpesaCard).toBeVisible({ timeout: 20_000 });
        // Declare mpesaText for use by the surrounding module or function.
        const mpesaText = await mpesaCard.innerText();
        // Perform the side effect or state update expressed on the following line.
        row.platformMpesaReadiness = mpesaText.includes("M-Pesa subscription gateway ready")
          ? "READY"
          : mpesaText.includes("requires deployment configuration") ? "MISSING_DEPLOYMENT_CONFIGURATION" : "UNAVAILABLE";
        // Perform the side effect or state update expressed on the following line.
        row.platformMpesaEnvironment = mpesaText.match(/Environment:\s*(sandbox|production)/i)?.[1]?.toLowerCase() || null;
      }
      // Check the condition (account.role === "admin" && account.tenant === "hussein-mboya") and run the matching branch.
      if (account.role === "admin" && account.tenant === "hussein-mboya") {
        // Perform the side effect or state update expressed on the following line.
        await gotoWithRetry(page, "/admin/platform-architecture", (reason) => { row.navigationRetries = [...(row.navigationRetries || []), reason]; });
        // Declare gateways for use by the surrounding module or function.
        const gateways = page.locator("section").filter({ has: page.getByRole("heading", { name: "Payment gateways" }) }).first();
        // Perform the side effect or state update expressed on the following line.
        await expect(gateways).toBeVisible({ timeout: 20_000 });
        // Declare gatewayText for use by the surrounding module or function.
        const gatewayText = await gateways.innerText();
        // Perform the side effect or state update expressed on the following line.
        row.tenantMpesaEnabled = gatewayText.includes("M-Pesa") && /M-Pesa[\s\S]*?Enabled/i.test(gatewayText);
        // Perform the side effect or state update expressed on the following line.
        row.tenantMpesaConfigured = /consumer key\s*\(configured\)/i.test(gatewayText)
          && /consumer secret\s*\(configured\)/i.test(gatewayText)
          && /passkey\s*\(configured\)/i.test(gatewayText);

        // Perform the side effect or state update expressed on the following line.
        await gotoWithRetry(page, "/admin/compliance", (reason) => { row.navigationRetries = [...(row.navigationRetries || []), reason]; });
        // Perform the side effect or state update expressed on the following line.
        await expect(page.getByRole("heading", { name: "Compliance Centre" })).toBeVisible({ timeout: 20_000 });
        // Declare etimsCredentials for use by the surrounding module or function.
        const etimsCredentials = page.locator("section").filter({ has: page.getByRole("heading", { name: "eTIMS adapter credentials" }) }).first();
        // Perform the side effect or state update expressed on the following line.
        await expect(etimsCredentials).toBeVisible({ timeout: 20_000 });
        // Perform the side effect or state update expressed on the following line.
        row.etimsAdapterCredentialsConfigured = (await etimsCredentials.innerText()).split("\n").some((line) => line.trim() === "Configured");
        // Declare complianceText for use by the surrounding module or function.
        const complianceText = await page.locator("main").last().innerText();
        // Perform the side effect or state update expressed on the following line.
        row.etimsProductionReady = /Production readiness\s+Configuration complete/i.test(complianceText);
      }

      // Check the condition (account.role !== "super_admin") and run the matching branch.
      if (account.role !== "super_admin") {
        // Perform the side effect or state update expressed on the following line.
        await gotoWithRetry(page, "/superadmin/users", (reason) => { row.navigationRetries = [...(row.navigationRetries || []), reason]; });
        // Perform the side effect or state update expressed on the following line.
        await expect(page).not.toHaveURL(/\/superadmin(?:\/|$)/);
        // Perform the side effect or state update expressed on the following line.
        row.superAdminDirectRouteDenied = true;
      }
      // Check the condition (!["super_admin", "admin"].includes(account.role)) and run the matching branch.
      if (!["super_admin", "admin"].includes(account.role)) {
        // Perform the side effect or state update expressed on the following line.
        await gotoWithRetry(page, "/admin/dashboard", (reason) => { row.navigationRetries = [...(row.navigationRetries || []), reason]; });
        // Perform the side effect or state update expressed on the following line.
        await expect(page).not.toHaveURL(/\/admin(?:\/|$)/);
        // Perform the side effect or state update expressed on the following line.
        row.adminDirectRouteDenied = true;
      }
      // Perform the side effect or state update expressed on the following line.
      await gotoWithRetry(page, account.route, (reason) => { row.navigationRetries = [...(row.navigationRetries || []), reason]; });

      // Declare expectedMenu for use by the surrounding module or function.
      let expectedMenu = account.menu;
      // Check the condition (account.role === "admin") and run the matching branch.
      if (account.role === "admin") {
        // Perform the side effect or state update expressed on the following line.
        expectedMenu = "/admin";
        // Perform the side effect or state update expressed on the following line.
        row.expectedMenu = expectedMenu;
        // Declare planControlledLinks for use by the surrounding module or function.
        const planControlledLinks = [
          ["finance", "/admin/finance"],
          ["reports", "/admin/reports"],
          ["analytics", "/admin/analytics"],
          ["ai", "/admin/ai"],
        ];
        // Perform the side effect or state update expressed on the following line.
        row.planNavigation = {};
        // Repeat the enclosed work for each required iteration.
        for (const [feature, href] of planControlledLinks) {
          // Declare link for use by the surrounding module or function.
          const link = page.locator(`a.admin-sidebar-link[href="${href}"]`);
          // Declare enabled for use by the surrounding module or function.
          const enabled = features.has(feature);
          // Perform the side effect or state update expressed on the following line.
          await expect(link).toHaveCount(enabled ? 1 : 0, { timeout: 15_000 });
          // Perform the side effect or state update expressed on the following line.
          row.planNavigation[feature] = (await link.isVisible().catch(() => false)) === enabled;
        }
        // Perform the side effect or state update expressed on the following line.
        row.financeFeatureEnabled = features.has("finance");
        // Perform the side effect or state update expressed on the following line.
        row.financeMenuMatchesPlan = row.planNavigation.finance;
        // Check the condition (row.subscriptionStatus !== 200 || Object.values(row.planNavigation).so) and run the matching branch.
        if (row.subscriptionStatus !== 200 || Object.values(row.planNavigation).some((matches) => !matches)) {
          // Stop the current operation by raising a new Error instance.
          throw new Error("Plan-controlled navigation did not match the tenant's server-reported entitlements");
        }
        // Check the condition (features.has("finance")) and run the matching branch.
        if (features.has("finance")) {
          // Perform the side effect or state update expressed on the following line.
          await page.locator('a.admin-sidebar-link[href="/admin/finance"]').click();
          // Perform the side effect or state update expressed on the following line.
          await expect(page).toHaveURL(/\/admin\/finance(?:\?|$)/, { timeout: 20_000 });
          // Perform the side effect or state update expressed on the following line.
          await expect(page.locator("main").last()).not.toBeEmpty({ timeout: 20_000 });
          // Perform the side effect or state update expressed on the following line.
          row.financeDashboardLoaded = true;
        }
        // Check the condition (features.has("reports")) and run the matching branch.
        if (features.has("reports")) {
          // Perform the side effect or state update expressed on the following line.
          await page.locator('a.admin-sidebar-link[href="/admin/reports"]').click();
          // Perform the side effect or state update expressed on the following line.
          await expect(page).toHaveURL(/\/admin\/reports(?:\?|$)/, { timeout: 20_000 });
          // Perform the side effect or state update expressed on the following line.
          await expect(page.locator("main").last()).not.toBeEmpty({ timeout: 20_000 });
          // Perform the side effect or state update expressed on the following line.
          row.reportingDashboardLoaded = true;
        }
        // Check the condition (!row.financeFeatureEnabled) and run the matching branch.
        if (!row.financeFeatureEnabled) {
          // Perform the side effect or state update expressed on the following line.
          await page.goto("/admin/finance");
          // Perform the side effect or state update expressed on the following line.
          await expect(page.getByText("Subscription feature lock", { exact: true })).toBeVisible({ timeout: 20_000 });
          // Perform the side effect or state update expressed on the following line.
          row.lockedFinanceRouteDenied = true;
          // Declare lockedFinance for use by the surrounding module or function.
          const lockedFinance = await context.request.get(`${apiOrigin}/api/admin/finance/stats`, {
            headers: { authorization: `Bearer ${await page.evaluate(() => localStorage.getItem("token"))}` },
          });
          // Perform the side effect or state update expressed on the following line.
          row.lockedFinanceApiStatus = lockedFinance.status();
          // Declare lockedPayload for use by the surrounding module or function.
          const lockedPayload = await lockedFinance.json();
          // Check the condition (lockedFinance.status() !== 403 || lockedPayload.code !== "PLAN_FEATURE) and run the matching branch.
          if (lockedFinance.status() !== 403 || lockedPayload.code !== "PLAN_FEATURE_LOCKED") {
            // Stop the current operation by raising a new Error instance.
            throw new Error("Finance API did not enforce the tenant's locked plan feature");
          }
        }
      }

      // Declare menuLink for use by the surrounding module or function.
      const menuLink = page.locator(`a[href="${expectedMenu}"]`).first();
      // Perform the side effect or state update expressed on the following line.
      await expect(menuLink).toBeVisible({ timeout: 15_000 });
      // Perform the side effect or state update expressed on the following line.
      row.menuVisible = true;
      // Perform the side effect or state update expressed on the following line.
      await menuLink.click();
      // Perform the side effect or state update expressed on the following line.
      await expect(page).toHaveURL(new RegExp(expectedMenu.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), { timeout: 20_000 });
      // Perform the side effect or state update expressed on the following line.
      await expect(page.locator("main").last()).not.toBeEmpty({ timeout: 20_000 });
      // Perform the side effect or state update expressed on the following line.
      row.steps.push("permitted role navigation loaded");
      // Declare navigatedUrl for use by the surrounding module or function.
      const navigatedUrl = page.url();
      // Perform the side effect or state update expressed on the following line.
      await page.reload({ waitUntil: "domcontentloaded" });
      // Perform the side effect or state update expressed on the following line.
      await expect(page).toHaveURL(navigatedUrl, { timeout: 20_000 });
      // Declare reloadedSession for use by the surrounding module or function.
      const reloadedSession = await page.evaluate(() => ({
        tokenPresent: Boolean(localStorage.getItem("token")),
        user: JSON.parse(localStorage.getItem("user") || "null"),
      }));
      // Perform the side effect or state update expressed on the following line.
      row.sessionPersistsAfterReload = reloadedSession.tokenPresent && normalizeRole(reloadedSession.user?.role) === account.role;
      // Check the condition (!row.sessionPersistsAfterReload) and run the matching branch.
      if (!row.sessionPersistsAfterReload) throw new Error("Session identity did not persist after navigation and reload");
      // Perform the side effect or state update expressed on the following line.
      row.steps.push("session persisted after navigation and reload");
      // Check the condition (account.role === "customer") and run the matching branch.
      if (account.role === "customer") {
        // Declare unauthorized for use by the surrounding module or function.
        const unauthorized = await context.request.get(`${apiOrigin}/api/admin/dashboard/metrics`, {
          headers: { authorization: `Bearer ${await page.evaluate(() => localStorage.getItem("token"))}` },
        });
        // Perform the side effect or state update expressed on the following line.
        row.adminApiStatus = unauthorized.status();
        // Check the condition (unauthorized.status() !== 403) and run the matching branch.
        if (unauthorized.status() !== 403) throw new Error(`Customer admin API permission expected 403, received ${unauthorized.status()}`);
        // Perform the side effect or state update expressed on the following line.
        row.steps.push("customer denied admin API");
      }

      // Declare logoutButton for use by the surrounding module or function.
      let logoutButton = page.getByRole("button", { name: /logout/i }).first();
      // Check the condition (!(await logoutButton.isVisible().catch(() => false))) and run the matching branch.
      if (!(await logoutButton.isVisible().catch(() => false))) {
        // Declare currentName for use by the surrounding module or function.
        const currentName = String(storedSession.user?.name || "");
        // Perform the side effect or state update expressed on the following line.
        await page.locator("header button").filter({ hasText: currentName }).first().click();
        // Perform the side effect or state update expressed on the following line.
        logoutButton = page.getByRole("button", { name: /logout/i }).first();
      }
      // Declare logoutResponsePromise for use by the surrounding module or function.
      const logoutResponsePromise = page.waitForResponse((response) => response.url().includes("/api/auth/logout") && response.request().method() === "POST", { timeout: 45_000 });
      // Perform the side effect or state update expressed on the following line.
      await logoutButton.click();
      // Declare logoutResponse for use by the surrounding module or function.
      const logoutResponse = await logoutResponsePromise;
      // Perform the side effect or state update expressed on the following line.
      row.logoutStatus = logoutResponse.status();
      // Check the condition (!/\/login(?:\?|$)/.test(page.url())) and run the matching branch.
      if (!/\/login(?:\?|$)/.test(page.url())) {
        // Perform the side effect or state update expressed on the following line.
        await gotoWithRetry(page, "/login", (reason) => { row.navigationRetries = [...(row.navigationRetries || []), reason]; });
      }
      // Perform the side effect or state update expressed on the following line.
      await expect(page).toHaveURL(/\/login(?:\?|$)/, { timeout: 15_000 });
      // Perform the side effect or state update expressed on the following line.
      row.sessionCleared = await page.evaluate(() => !localStorage.getItem("token") && !localStorage.getItem("user"));
      // Declare afterLogout for use by the surrounding module or function.
      const afterLogout = await context.request.get(`${apiOrigin}/api/auth/me`);
      // Perform the side effect or state update expressed on the following line.
      row.postLogoutAuthMeStatus = afterLogout.status();
      // Check the condition (logoutResponse.status() >= 400 || !row.sessionCleared || afterLogout.s) and run the matching branch.
      if (logoutResponse.status() >= 400 || !row.sessionCleared || afterLogout.status() !== 401) throw new Error("Logout did not clear and invalidate the browser session");
      // Perform the side effect or state update expressed on the following line.
      row.steps.push("logout cleared and invalidated session");
    } catch (error) {
      // Perform the side effect or state update expressed on the following line.
      row.error = sanitizeError(error);
      // Perform the side effect or state update expressed on the following line.
      row.loginNetwork = { ...loginNetwork };
      // Perform the side effect or state update expressed on the following line.
      row.failedRequests = failedRequests;
      // Perform the side effect or state update expressed on the following line.
      row.consoleErrors = consoleErrors;
      // Perform the side effect or state update expressed on the following line.
      audit.errors.push({ email: account.email, error: row.error });
      // Preserve the account-by-account matrix and continue so one defect cannot
      // prevent the rest of the seeded users from being checked.
    } finally {
      // Check the condition (badResponses.length) and run the matching branch.
      if (badResponses.length) {
        // Declare issue for use by the surrounding module or function.
        const issue = `Unexpected API responses: ${badResponses.join(", ")}`;
        // Perform the side effect or state update expressed on the following line.
        row.apiResponseError = issue;
        // Check the condition (!audit.errors.some((entry) => entry.email === account.email && entry.e) and run the matching branch.
        if (!audit.errors.some((entry) => entry.email === account.email && entry.error === issue)) {
          // Perform the side effect or state update expressed on the following line.
          audit.errors.push({ email: account.email, error: issue });
        }
      }
      // Perform the side effect or state update expressed on the following line.
      row.consoleErrors = consoleErrors;
      // Perform the side effect or state update expressed on the following line.
      row.failedRequests = failedRequests;
      // Perform the side effect or state update expressed on the following line.
      row.badApiResponses = badResponses;
      // Perform the side effect or state update expressed on the following line.
      audit.accounts.push(row);
      // Perform the side effect or state update expressed on the following line.
      await context.close();
      // Perform the side effect or state update expressed on the following line.
      audit.lastCompletedAccountAt = new Date().toISOString();
      // Perform the side effect or state update expressed on the following line.
      await fs.writeFile(auditFilePath, `${JSON.stringify(audit, null, 2)}\n`);
    }
  }

  // Declare tenantIdBySlug for use by the surrounding module or function.
  const tenantIdBySlug = new Map(audit.accounts
    .filter((account) => account.expectedRole === "admin")
    .map((account) => [account.expectedTenant, String(account.tenantId || "")]));
  // Check the condition (!process.env.DEMO_AUDIT_EMAIL && (tenantIdBySlug.size !== 3 || new Set) and run the matching branch.
  if (!process.env.DEMO_AUDIT_EMAIL && (tenantIdBySlug.size !== 3 || new Set(tenantIdBySlug.values()).size !== 3 || [...tenantIdBySlug.values()].some((id) => !id))) {
    // Perform the side effect or state update expressed on the following line.
    audit.errors.push({ check: "tenant-admin identities", error: "Expected three distinct tenant administrator identities" });
  }
  // Repeat the enclosed work for each required iteration.
  for (const account of process.env.DEMO_AUDIT_EMAIL ? [] : audit.accounts) {
    // Check the condition (!account.expectedTenant) and run the matching branch.
    if (!account.expectedTenant) {
      // Check the condition (account.tenantId) and run the matching branch.
      if (account.tenantId) audit.errors.push({ email: account.email, error: "Platform account unexpectedly resolved to a tenant" });
      // Skip the remainder of this iteration and continue with the next one.
      continue;
    }
    // Declare matchesTenant for use by the surrounding module or function.
    const matchesTenant = String(account.tenantId || "") === tenantIdBySlug.get(account.expectedTenant);
    // Perform the side effect or state update expressed on the following line.
    audit.tenantScope.push({ email: account.email, tenant: account.expectedTenant, matchesTenant });
    // Check the condition (!matchesTenant) and run the matching branch.
    if (!matchesTenant) audit.errors.push({ email: account.email, error: "Account tenant ID did not match its tenant administrator" });
  }

  // Perform the side effect or state update expressed on the following line.
  audit.completedAt = new Date().toISOString();
  // Perform the side effect or state update expressed on the following line.
  await fs.writeFile(auditFilePath, `${JSON.stringify(audit, null, 2)}\n`);
  // Perform the side effect or state update expressed on the following line.
  expect(audit.accounts).toHaveLength(auditUsers.length);
  // Perform the side effect or state update expressed on the following line.
  expect(audit.errors, "seeded account audit errors").toEqual([]);
});
