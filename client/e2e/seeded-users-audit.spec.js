import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const password = process.env.DEMO_SMOKE_PASSWORD || process.env.DEMO_TEST_PASSWORD;
const users = [
  { email: "superadmin1@husseinmboya.com", role: "super_admin", tenant: null, route: "/superadmin/dashboard", menu: "/superadmin/users" },
  ...[
    { slug: "hussein-mboya", domain: "husseinmboya.com" },
    { slug: "amani-trails", domain: "amanitrails.com" },
    { slug: "demo-safari", domain: "demosafari.com" },
  ].flatMap(({ slug: tenant, domain }) => [
    { email: `admin1@${domain}`, role: "admin", tenant, route: "/admin/dashboard", menu: "/admin/users" },
    { email: `tourmanager1@${domain}`, role: "tour_manager", tenant, route: "/tour-manager/dashboard", menu: "/tour-manager/tours" },
    ...[1, 2].map((n) => ({ email: `agent${n}@${domain}`, role: "agent", tenant, route: "/agent/dashboard", menu: "/agent/bookings" })),
    ...[1, 2].map((n) => ({ email: `guide${n}@${domain}`, role: "tour_guide", tenant, route: "/guide/dashboard", menu: "/guide/assigned-tours" })),
    ...[1, 2].map((n) => ({ email: `driver${n}@${domain}`, role: "driver", tenant, route: "/driver/dashboard", menu: "/driver/dashboard" })),
    ...[1, 2, 3, 4].map((n) => ({ email: `customer${n}@${domain}`, role: "customer", tenant, route: "/dashboard", menu: "/my-bookings" })),
  ]),
];
if (users.length !== 37) throw new Error(`Expected 37 seeded demo users, found ${users.length}`);
const auditUsers = process.env.DEMO_AUDIT_EMAIL
  ? users.filter((account) => account.email === process.env.DEMO_AUDIT_EMAIL.trim().toLowerCase())
  : users;
if (process.env.DEMO_AUDIT_EMAIL && auditUsers.length !== 1) throw new Error("DEMO_AUDIT_EMAIL must match one seeded fixture account");

const resumeFile = process.env.DEMO_AUDIT_RESUME_FILE;

const roleAliases = { guide: "tour_guide", tourguide: "tour_guide", manager: "tour_manager", tourmanager: "tour_manager", superadmin: "super_admin" };
const normalizeRole = (role) => {
  const value = typeof role === "object" ? role?.name || role?.role : role;
  const normalized = String(value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  return roleAliases[normalized] || roleAliases[normalized.replaceAll("_", "")] || normalized;
};
const tenantIdOf = (user) => {
  const value = user?.tenantId;
  return value && typeof value === "object" ? value._id || value.id || null : value || null;
};
const pause = (duration) => new Promise((resolve) => setTimeout(resolve, duration));
const sanitizeError = (error) => String(error?.message || error || "Unknown browser audit error")
  .replace(/(authorization:\s*Bearer\s+)[^\s\r\n]+/gi, "$1[redacted]");
const getReadResponse = async (context, url, options = {}, onRetry = () => {}) => {
  for (let attempt = 0; ; attempt += 1) {
    try {
      const response = await context.request.get(url, { ...options, timeout: 45_000 });
      if (attempt === 0 && response.status() >= 500) {
        onRetry(`HTTP ${response.status()}`);
        await pause(1500);
        continue;
      }
      return response;
    } catch (error) {
      if (attempt > 0 || !/ETIMEDOUT|ECONNRESET|ECONNREFUSED|EAI_AGAIN/i.test(String(error?.message || ""))) throw error;
      onRetry(error.code || "network timeout");
      await pause(1500);
    }
  }
};
const gotoWithRetry = async (page, url, onRetry = () => {}) => {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 25_000 });
      return;
    } catch (error) {
      if (attempt === 2 || !/ERR_TIMED_OUT|ERR_CONNECTION_RESET|ERR_NETWORK_CHANGED|Timeout|ERR_HTTP2_PING_FAILED/i.test(String(error?.message || ""))) throw error;
      onRetry(String(error.message).split("\n")[0]);
      await pause((attempt + 1) * 2000);
    }
  }
};

test("seeded 28-account browser login, dashboard, session and logout audit", async ({ browser }, testInfo) => {
  test.skip(!password, "Set DEMO_SMOKE_PASSWORD for the controlled seeded-account browser audit.");
  test.setTimeout(2 * 60 * 60 * 1000);
  const outputDirectory = resumeFile ? path.dirname(resumeFile) : testInfo.outputPath("seeded-user-audit");
  await fs.mkdir(outputDirectory, { recursive: true });
  const auditFilePath = resumeFile || path.join(outputDirectory, "audit.json");
  let previousAudit = null;
  if (resumeFile) {
    try { previousAudit = JSON.parse(await fs.readFile(resumeFile, "utf8")); }
    catch (error) { if (error.code !== "ENOENT") throw error; }
  }
  const sameSource = !process.env.DEMO_AUDIT_SOURCE_SHA || previousAudit?.sourceSha === process.env.DEMO_AUDIT_SOURCE_SHA;
  const sameRun = previousAudit && sameSource;
  const completedEmails = new Set((sameRun ? previousAudit.accounts : [])
    .filter((row) => row.steps?.includes("logout cleared and invalidated session") && !row.apiResponseError && !row.badApiResponses?.length)
    .map((row) => row.email));
  const pendingUsers = auditUsers.filter((account) => !completedEmails.has(account.email));
  const audit = {
    sourceSha: process.env.DEMO_AUDIT_SOURCE_SHA || null,
    startedAt: sameRun ? previousAudit.startedAt : new Date().toISOString(),
    resumedAt: sameRun ? new Date().toISOString() : undefined,
    accounts: (sameRun ? previousAudit.accounts : []).filter((row) => completedEmails.has(row.email)),
    tenantScope: [], errors: [], screenshots: sameRun ? previousAudit.screenshots || [] : [],
  };
  const tenantIdsBySlug = new Map(audit.accounts
    .filter((account) => account.expectedRole === "admin" && account.expectedTenant && account.tenantId)
    .map((account) => [account.expectedTenant, String(account.tenantId)]));
  let apiOrigin = "";

  for (const [index, account] of pendingUsers.entries()) {
    if (!process.env.DEMO_AUDIT_EMAIL && index > 0 && index % 10 === 0) await pause(15 * 60 * 1000 + 1500);
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    const row = { email: account.email, expectedRole: account.role, expectedTenant: account.tenant, steps: [] };
    const consoleErrors = [];
    const failedRequests = [];
    const badResponses = [];
    if (account.tenant) {
      await page.route("**/api/auth/login", async (route) => {
        const headers = { ...route.request().headers(), "X-Tenant-Slug": account.tenant };
        await route.continue({ headers });
      });
      row.loginTenantSelector = account.tenant;
    }
    page.on("pageerror", (error) => consoleErrors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
    page.on("requestfailed", (request) => failedRequests.push(`${request.method()} ${new URL(request.url()).pathname}`));
    page.on("response", (response) => {
      const url = new URL(response.url());
      if (url.pathname.endsWith("/api/auth/login") && response.request().method() === "POST") apiOrigin = url.origin;
      const expectedUnauthenticatedProbe = /\/api\/auth\/me\/?$/.test(url.pathname) && response.status() === 401;
      if (url.pathname.startsWith("/api/") && response.status() >= 400 && !expectedUnauthenticatedProbe) {
        badResponses.push(`${response.status()} ${url.pathname}`);
      }
    });

    try {
      await gotoWithRetry(page, "/login", (reason) => { row.navigationRetries = [...(row.navigationRetries || []), reason]; });
      await page.getByPlaceholder(/enter email/i).fill(account.email);
      await page.getByPlaceholder(/enter password/i).fill(password);
      const loginResponsePromise = page.waitForResponse((response) => response.url().includes("/api/auth/login") && response.request().method() === "POST");
      await page.getByRole("button", { name: "Login", exact: true }).click();
      let loginResponse = await loginResponsePromise;
      row.loginStatus = loginResponse.status();
      if (loginResponse.status() === 429) {
        const retryAfter = Number(loginResponse.headers()["retry-after"] || 900);
        row.rateLimited = true;
        await pause((retryAfter + 2) * 1000);
        await page.reload({ waitUntil: "domcontentloaded", timeout: 25_000 });
        await page.getByPlaceholder(/enter email/i).fill(account.email);
        await page.getByPlaceholder(/enter password/i).fill(password);
        const retryPromise = page.waitForResponse((response) => response.url().includes("/api/auth/login") && response.request().method() === "POST");
        await page.getByRole("button", { name: "Login", exact: true }).click();
        loginResponse = await retryPromise;
        row.loginStatus = loginResponse.status();
        if (loginResponse.status() !== 200) throw new Error(`Login retry returned HTTP ${loginResponse.status()}`);
      } else if (loginResponse.status() !== 200) {
        throw new Error(`Login returned HTTP ${loginResponse.status()}`);
      }

      const loginPayload = await loginResponse.json();
      const loggedUser = loginPayload.user;
      row.actualRole = normalizeRole(loggedUser?.role || loggedUser?.legacyRole);
      row.tenantId = tenantIdOf(loggedUser);
      if (account.role === "admin" && account.tenant && row.tenantId) tenantIdsBySlug.set(account.tenant, String(row.tenantId));
      row.permissionCount = Array.isArray(loggedUser?.roleId?.permissions) ? loggedUser.roleId.permissions.length : Array.isArray(loggedUser?.permissions) ? loggedUser.permissions.length : null;
      row.steps.push("login response accepted");
      if (row.actualRole !== account.role) throw new Error(`Expected role ${account.role}, received ${row.actualRole || "none"}`);
      if (account.tenant === null ? Boolean(row.tenantId) : !row.tenantId) throw new Error("Tenant assignment did not match the account scope");

      await expect(page).toHaveURL(new RegExp(account.route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), { timeout: 30_000 });
      const storedSession = await page.evaluate(() => ({
        tokenPresent: Boolean(localStorage.getItem("token")),
        user: JSON.parse(localStorage.getItem("user") || "null"),
        permissions: JSON.parse(localStorage.getItem("permissions") || "[]"),
      }));
      row.sessionCreated = storedSession.tokenPresent;
      if (!storedSession.tokenPresent || normalizeRole(storedSession.user?.role) !== account.role) throw new Error("Browser session or persisted role is missing");
      row.permissionCount = storedSession.permissions.length;
      row.steps.push("browser session and permissions loaded");

      if (account.tenant) {
        const otherTenantId = [...tenantIdsBySlug.entries()].find(([slug]) => slug !== account.tenant)?.[1];
        if (otherTenantId) {
          const crossTenantResponse = await getReadResponse(context, `${apiOrigin}/api/subscription`, {
            headers: {
              authorization: `Bearer ${await page.evaluate(() => localStorage.getItem("token"))}`,
              "X-Tenant-ID": otherTenantId,
            },
          }, (reason) => { row.readRetries = [...(row.readRetries || []), { endpoint: "/api/subscription (cross-tenant)", reason }]; });
          row.crossTenantSelectorStatus = crossTenantResponse.status();
          if (![403, 404].includes(crossTenantResponse.status())) {
            throw new Error(`Cross-tenant selector expected an access-denial status (403 or concealed 404), received ${crossTenantResponse.status()}`);
          }
          row.crossTenantSelectorDenied = true;
          row.steps.push(crossTenantResponse.status() === 404 ? "cross-tenant selector concealed with 404" : "cross-tenant selector rejected with 403");
        }
      }

      const authMeResponse = await getReadResponse(context, `${apiOrigin}/api/auth/me`, {
        headers: { authorization: `Bearer ${await page.evaluate(() => localStorage.getItem("token"))}` },
      }, (reason) => { row.readRetries = [...(row.readRetries || []), { endpoint: "/api/auth/me", reason }]; });
      row.authMeStatus = authMeResponse.status();
      const authMe = await authMeResponse.json();
      const currentUser = authMe.user || authMe;
      row.authMeRole = normalizeRole(currentUser.role || currentUser.legacyRole);
      row.authMeTenantId = tenantIdOf(currentUser);
      if (row.authMeStatus !== 200 || row.authMeRole !== account.role || String(row.authMeTenantId || "") !== String(row.tenantId || "")) {
        throw new Error("Authenticated /auth/me identity did not match login identity");
      }
      row.steps.push("authenticated API session verified");

      let features = new Set();
      if (account.tenant) {
        const subscriptionResponse = await getReadResponse(context, `${apiOrigin}/api/subscription`, {
          headers: { authorization: `Bearer ${await page.evaluate(() => localStorage.getItem("token"))}` },
        }, (reason) => { row.readRetries = [...(row.readRetries || []), { endpoint: "/api/subscription", reason }]; });
        row.subscriptionStatus = subscriptionResponse.status();
        const subscription = await subscriptionResponse.json();
        row.tenantPlan = subscription.plan || null;
        features = new Set(Array.isArray(subscription.features) ? subscription.features : []);
        if (row.subscriptionStatus !== 200 || !row.tenantPlan) throw new Error("Tenant subscription features were not available for route authorization");
      }

      const dashboardFeature = {
        admin: "dashboard",
        tour_manager: "operations",
        agent: "agents",
        tour_guide: "operations",
        driver: "fleet",
        customer: "bookings",
      }[account.role];
      const dashboardFeatureAllowed = account.role === "super_admin" || features.has(dashboardFeature);
      row.dashboardFeature = dashboardFeature || "platform";
      row.dashboardFeatureAllowed = dashboardFeatureAllowed;
      const dashboardEndpoint = {
        super_admin: "/api/superadmin/dashboard",
        admin: "/api/admin/dashboard/metrics",
        tour_manager: "/api/tourmanager/dashboard",
        agent: "/api/agent/dashboard",
        tour_guide: "/api/guide/dashboard",
        driver: "/api/driver/dashboard",
        customer: "/api/bookings/my-bookings",
      }[account.role];
      const dashboardResponse = await getReadResponse(context, `${apiOrigin}${dashboardEndpoint}`, {
        headers: { authorization: `Bearer ${await page.evaluate(() => localStorage.getItem("token"))}` },
      }, (reason) => { row.readRetries = [...(row.readRetries || []), { endpoint: dashboardEndpoint, reason }]; });
      row.dashboardApiStatus = dashboardResponse.status();
      const dashboardPayload = await dashboardResponse.json();
      if (dashboardFeatureAllowed) {
        if (dashboardResponse.status() !== 200) throw new Error(`Permitted ${account.role} dashboard API returned HTTP ${dashboardResponse.status()}`);
        await expect(page.locator("main").last()).not.toBeEmpty({ timeout: 30_000 });
        row.dashboardLoaded = true;
      } else {
        if (dashboardResponse.status() !== 403 || dashboardPayload.code !== "PLAN_FEATURE_LOCKED") {
          throw new Error(`Unentitled ${account.role} dashboard API did not enforce the tenant plan`);
        }
        await expect(page.getByText("Subscription feature lock", { exact: true })).toBeVisible({ timeout: 30_000 });
        row.dashboardLocked = true;
      }
      row.steps.push(dashboardFeatureAllowed ? "role dashboard loaded" : "role dashboard correctly plan locked");

      if (account.role === "customer" && account.tenant === "hussein-mboya" && account.email.endsWith("customer1@hussein-mboya.com")) {
        await gotoWithRetry(page, "/destinations", (reason) => { row.navigationRetries = [...(row.navigationRetries || []), reason]; });
        await expect(page.locator("main").last()).toContainText(/destination/i);
        const destinationLink = page.locator("main").last().locator("a[href^='/destinations/']").first();
        await expect(destinationLink).toBeVisible({ timeout: 20_000 });
        await destinationLink.click();
        await expect(page).toHaveURL(/\/destinations\/[^/]+/);
        await expect(page.locator("main").last()).not.toContainText("Destination not found");

        await gotoWithRetry(page, "/tours", (reason) => { row.navigationRetries = [...(row.navigationRetries || []), reason]; });
        const tourLink = page.locator("a[href*='/tours/']:not([href='/tours'])").first();
        await expect(tourLink).toBeVisible({ timeout: 20_000 });
        await tourLink.click();
        await expect(page).toHaveURL(/\/tours\/[^/]+/);
        await expect(page.getByRole("button", { name: "Book This Adventure" })).toBeVisible();
        await page.getByRole("button", { name: "Book This Adventure" }).click();
        await expect(page).toHaveURL(/\/checkout\/tour\/[^/]+/);
        await expect(page.getByLabel("Travel date")).toBeVisible({ timeout: 20_000 });
        row.customerJourney = "PASS through booking and payment initiation UI; no production booking or charge submitted";
        row.steps.push("destination discovery, tour details and checkout initiation loaded without mutation");
      }

      if (account.role === "super_admin") {
        await gotoWithRetry(page, "/superadmin/settings", (reason) => { row.navigationRetries = [...(row.navigationRetries || []), reason]; });
        const mpesaCard = page.locator("section").filter({ hasText: "Platform M-Pesa Subscription Checkout" }).first();
        await expect(mpesaCard).toBeVisible({ timeout: 20_000 });
        const mpesaText = await mpesaCard.innerText();
        row.platformMpesaReadiness = mpesaText.includes("M-Pesa subscription gateway ready")
          ? "READY"
          : mpesaText.includes("requires deployment configuration") ? "MISSING_DEPLOYMENT_CONFIGURATION" : "UNAVAILABLE";
        row.platformMpesaEnvironment = mpesaText.match(/Environment:\s*(sandbox|production)/i)?.[1]?.toLowerCase() || null;
      }
      if (account.role === "admin" && account.tenant === "hussein-mboya") {
        await gotoWithRetry(page, "/admin/platform-architecture", (reason) => { row.navigationRetries = [...(row.navigationRetries || []), reason]; });
        const gateways = page.locator("section").filter({ has: page.getByRole("heading", { name: "Payment gateways" }) }).first();
        await expect(gateways).toBeVisible({ timeout: 20_000 });
        const gatewayText = await gateways.innerText();
        row.tenantMpesaEnabled = gatewayText.includes("M-Pesa") && /M-Pesa[\s\S]*?Enabled/i.test(gatewayText);
        row.tenantMpesaConfigured = /consumer key\s*\(configured\)/i.test(gatewayText)
          && /consumer secret\s*\(configured\)/i.test(gatewayText)
          && /passkey\s*\(configured\)/i.test(gatewayText);

        await gotoWithRetry(page, "/admin/compliance", (reason) => { row.navigationRetries = [...(row.navigationRetries || []), reason]; });
        await expect(page.getByRole("heading", { name: "Compliance Centre" })).toBeVisible({ timeout: 20_000 });
        const etimsCredentials = page.locator("section").filter({ has: page.getByRole("heading", { name: "eTIMS adapter credentials" }) }).first();
        await expect(etimsCredentials).toBeVisible({ timeout: 20_000 });
        row.etimsAdapterCredentialsConfigured = (await etimsCredentials.innerText()).split("\n").some((line) => line.trim() === "Configured");
        const complianceText = await page.locator("main").last().innerText();
        row.etimsProductionReady = /Production readiness\s+Configuration complete/i.test(complianceText);
      }

      if (account.role !== "super_admin") {
        await gotoWithRetry(page, "/superadmin/users", (reason) => { row.navigationRetries = [...(row.navigationRetries || []), reason]; });
        await expect(page).not.toHaveURL(/\/superadmin(?:\/|$)/);
        row.superAdminDirectRouteDenied = true;
      }
      if (!["super_admin", "admin"].includes(account.role)) {
        await gotoWithRetry(page, "/admin/dashboard", (reason) => { row.navigationRetries = [...(row.navigationRetries || []), reason]; });
        await expect(page).not.toHaveURL(/\/admin(?:\/|$)/);
        row.adminDirectRouteDenied = true;
      }
      await gotoWithRetry(page, account.route, (reason) => { row.navigationRetries = [...(row.navigationRetries || []), reason]; });

      let expectedMenu = account.menu;
      if (account.role === "admin") {
        expectedMenu = "/admin";
        row.expectedMenu = expectedMenu;
        const planControlledLinks = [
          ["finance", "/admin/finance"],
          ["reports", "/admin/reports"],
          ["analytics", "/admin/analytics"],
          ["ai", "/admin/ai"],
        ];
        row.planNavigation = {};
        for (const [feature, href] of planControlledLinks) {
          const link = page.locator(`a.admin-sidebar-link[href="${href}"]`);
          const enabled = features.has(feature);
          await expect(link).toHaveCount(enabled ? 1 : 0, { timeout: 15_000 });
          row.planNavigation[feature] = (await link.isVisible().catch(() => false)) === enabled;
        }
        row.financeFeatureEnabled = features.has("finance");
        row.financeMenuMatchesPlan = row.planNavigation.finance;
        if (row.subscriptionStatus !== 200 || Object.values(row.planNavigation).some((matches) => !matches)) {
          throw new Error("Plan-controlled navigation did not match the tenant's server-reported entitlements");
        }
        if (features.has("finance")) {
          await page.locator('a.admin-sidebar-link[href="/admin/finance"]').click();
          await expect(page).toHaveURL(/\/admin\/finance(?:\?|$)/, { timeout: 20_000 });
          await expect(page.locator("main").last()).not.toBeEmpty({ timeout: 20_000 });
          row.financeDashboardLoaded = true;
        }
        if (features.has("reports")) {
          await page.locator('a.admin-sidebar-link[href="/admin/reports"]').click();
          await expect(page).toHaveURL(/\/admin\/reports(?:\?|$)/, { timeout: 20_000 });
          await expect(page.locator("main").last()).not.toBeEmpty({ timeout: 20_000 });
          row.reportingDashboardLoaded = true;
        }
        if (!row.financeFeatureEnabled) {
          await page.goto("/admin/finance");
          await expect(page.getByText("Subscription feature lock", { exact: true })).toBeVisible({ timeout: 20_000 });
          row.lockedFinanceRouteDenied = true;
          const lockedFinance = await context.request.get(`${apiOrigin}/api/admin/finance/stats`, {
            headers: { authorization: `Bearer ${await page.evaluate(() => localStorage.getItem("token"))}` },
          });
          row.lockedFinanceApiStatus = lockedFinance.status();
          const lockedPayload = await lockedFinance.json();
          if (lockedFinance.status() !== 403 || lockedPayload.code !== "PLAN_FEATURE_LOCKED") {
            throw new Error("Finance API did not enforce the tenant's locked plan feature");
          }
        }
      }

      const menuLink = page.locator(`a[href="${expectedMenu}"]`).first();
      await expect(menuLink).toBeVisible({ timeout: 15_000 });
      row.menuVisible = true;
      await menuLink.click();
      await expect(page).toHaveURL(new RegExp(expectedMenu.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), { timeout: 20_000 });
      await expect(page.locator("main").last()).not.toBeEmpty({ timeout: 20_000 });
      row.steps.push("permitted role navigation loaded");
      const navigatedUrl = page.url();
      await page.reload({ waitUntil: "domcontentloaded" });
      await expect(page).toHaveURL(navigatedUrl, { timeout: 20_000 });
      const reloadedSession = await page.evaluate(() => ({
        tokenPresent: Boolean(localStorage.getItem("token")),
        user: JSON.parse(localStorage.getItem("user") || "null"),
      }));
      row.sessionPersistsAfterReload = reloadedSession.tokenPresent && normalizeRole(reloadedSession.user?.role) === account.role;
      if (!row.sessionPersistsAfterReload) throw new Error("Session identity did not persist after navigation and reload");
      row.steps.push("session persisted after navigation and reload");
      if (account.role === "customer") {
        const unauthorized = await context.request.get(`${apiOrigin}/api/admin/dashboard/metrics`, {
          headers: { authorization: `Bearer ${await page.evaluate(() => localStorage.getItem("token"))}` },
        });
        row.adminApiStatus = unauthorized.status();
        if (unauthorized.status() !== 403) throw new Error(`Customer admin API permission expected 403, received ${unauthorized.status()}`);
        row.steps.push("customer denied admin API");
      }

      let logoutButton = page.getByRole("button", { name: /logout/i }).first();
      if (!(await logoutButton.isVisible().catch(() => false))) {
        const currentName = String(storedSession.user?.name || "");
        await page.locator("header button").filter({ hasText: currentName }).first().click();
        logoutButton = page.getByRole("button", { name: /logout/i }).first();
      }
      const logoutResponsePromise = page.waitForResponse((response) => response.url().includes("/api/auth/logout") && response.request().method() === "POST");
      await logoutButton.click();
      const logoutResponse = await logoutResponsePromise;
      row.logoutStatus = logoutResponse.status();
      if (!/\/login(?:\?|$)/.test(page.url())) {
        await gotoWithRetry(page, "/login", (reason) => { row.navigationRetries = [...(row.navigationRetries || []), reason]; });
      }
      await expect(page).toHaveURL(/\/login(?:\?|$)/, { timeout: 15_000 });
      row.sessionCleared = await page.evaluate(() => !localStorage.getItem("token") && !localStorage.getItem("user"));
      const afterLogout = await context.request.get(`${apiOrigin}/api/auth/me`);
      row.postLogoutAuthMeStatus = afterLogout.status();
      if (logoutResponse.status() >= 400 || !row.sessionCleared || afterLogout.status() !== 401) throw new Error("Logout did not clear and invalidate the browser session");
      row.steps.push("logout cleared and invalidated session");
    } catch (error) {
      row.error = sanitizeError(error);
      audit.errors.push({ email: account.email, error: row.error });
      // Preserve the account-by-account matrix and continue so one defect cannot
      // prevent the rest of the seeded users from being checked.
    } finally {
      if (badResponses.length) {
        const issue = `Unexpected API responses: ${badResponses.join(", ")}`;
        row.apiResponseError = issue;
        if (!audit.errors.some((entry) => entry.email === account.email && entry.error === issue)) {
          audit.errors.push({ email: account.email, error: issue });
        }
      }
      row.consoleErrors = consoleErrors;
      row.failedRequests = failedRequests;
      row.badApiResponses = badResponses;
      audit.accounts.push(row);
      await context.close();
      audit.lastCompletedAccountAt = new Date().toISOString();
      await fs.writeFile(auditFilePath, `${JSON.stringify(audit, null, 2)}\n`);
    }
  }

  const tenantIdBySlug = new Map(audit.accounts
    .filter((account) => account.expectedRole === "admin")
    .map((account) => [account.expectedTenant, String(account.tenantId || "")]));
  if (!process.env.DEMO_AUDIT_EMAIL && (tenantIdBySlug.size !== 3 || new Set(tenantIdBySlug.values()).size !== 3 || [...tenantIdBySlug.values()].some((id) => !id))) {
    audit.errors.push({ check: "tenant-admin identities", error: "Expected three distinct tenant administrator identities" });
  }
  for (const account of process.env.DEMO_AUDIT_EMAIL ? [] : audit.accounts) {
    if (!account.expectedTenant) {
      if (account.tenantId) audit.errors.push({ email: account.email, error: "Platform account unexpectedly resolved to a tenant" });
      continue;
    }
    const matchesTenant = String(account.tenantId || "") === tenantIdBySlug.get(account.expectedTenant);
    audit.tenantScope.push({ email: account.email, tenant: account.expectedTenant, matchesTenant });
    if (!matchesTenant) audit.errors.push({ email: account.email, error: "Account tenant ID did not match its tenant administrator" });
  }

  audit.completedAt = new Date().toISOString();
  await fs.writeFile(auditFilePath, `${JSON.stringify(audit, null, 2)}\n`);
  expect(audit.accounts).toHaveLength(auditUsers.length);
  expect(audit.errors, "seeded account audit errors").toEqual([]);
});
