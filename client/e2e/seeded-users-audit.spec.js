import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const password = process.env.DEMO_SMOKE_PASSWORD || process.env.DEMO_TEST_PASSWORD;
const users = [
  { email: "superadmin@hussein-mboya.com", role: "super_admin", tenant: null, route: "/superadmin/dashboard", menu: "/superadmin/users" },
  ...["hussein-mboya", "amani-trails", "demo-safari"].flatMap((tenant) => {
    const domain = tenant === "hussein-mboya" ? "hussein-mboya.com" : `${tenant}.com`;
    return [
      { email: `admin@${domain}`, role: "admin", tenant, route: "/admin/dashboard", menu: "/admin/users" },
      { email: `manager@${domain}`, role: "tour_manager", tenant, route: "/tour-manager/dashboard", menu: "/tour-manager/tours" },
      { email: `agent@${domain}`, role: "agent", tenant, route: "/agent/dashboard", menu: "/agent/bookings" },
      { email: `guide1@${domain}`, role: "tour_guide", tenant, route: "/guide/dashboard", menu: "/guide/assigned-tours" },
      { email: `driver1@${domain}`, role: "driver", tenant, route: "/driver/dashboard", menu: "/driver/dashboard" },
      ...[1, 2, 3, 4].map((customer) => ({ email: `customer${customer}@${domain}`, role: "customer", tenant, route: "/dashboard", menu: "/my-bookings" })),
    ];
  }),
];
if (users.length !== 28) throw new Error(`Expected 28 seeded demo users, found ${users.length}`);
const auditUsers = process.env.DEMO_AUDIT_EMAIL
  ? users.filter((account) => account.email === process.env.DEMO_AUDIT_EMAIL.trim().toLowerCase())
  : users;
if (process.env.DEMO_AUDIT_EMAIL && auditUsers.length !== 1) throw new Error("DEMO_AUDIT_EMAIL must match one seeded fixture account");

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

test("seeded 28-account browser login, dashboard, session and logout audit", async ({ browser }, testInfo) => {
  test.skip(!password, "Set DEMO_SMOKE_PASSWORD for the controlled seeded-account browser audit.");
  test.setTimeout(2 * 60 * 60 * 1000);
  const outputDirectory = testInfo.outputPath("seeded-user-audit");
  await fs.mkdir(outputDirectory, { recursive: true });
  const audit = { startedAt: new Date().toISOString(), accounts: [], tenantScope: [], errors: [], screenshots: [] };
  let apiOrigin = "";

  for (const [index, account] of auditUsers.entries()) {
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
      if (url.pathname.startsWith("/api/") && response.status() >= 400 && response.status() !== 401) {
        badResponses.push(`${response.status()} ${url.pathname}`);
      }
    });

    try {
      await page.goto("/login");
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
        await page.reload();
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

      const authMeResponse = await context.request.get(`${apiOrigin}/api/auth/me`, {
        headers: { authorization: `Bearer ${await page.evaluate(() => localStorage.getItem("token"))}` },
      });
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
        const subscriptionResponse = await context.request.get(`${apiOrigin}/api/subscription`, {
          headers: { authorization: `Bearer ${await page.evaluate(() => localStorage.getItem("token"))}` },
        });
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
      const dashboardResponse = await context.request.get(`${apiOrigin}${dashboardEndpoint}`, {
        headers: { authorization: `Bearer ${await page.evaluate(() => localStorage.getItem("token"))}` },
      });
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

      let expectedMenu = account.menu;
      if (account.role === "admin") {
        if (!features.has("users")) expectedMenu = "/admin/bookings";
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
      await expect(page).toHaveURL(/\/login(?:\?|$)/, { timeout: 15_000 });
      row.sessionCleared = await page.evaluate(() => !localStorage.getItem("token") && !localStorage.getItem("user"));
      const afterLogout = await context.request.get(`${apiOrigin}/api/auth/me`);
      row.postLogoutAuthMeStatus = afterLogout.status();
      if (logoutResponse.status() >= 400 || !row.sessionCleared || afterLogout.status() !== 401) throw new Error("Logout did not clear and invalidate the browser session");
      row.steps.push("logout cleared and invalidated session");
    } catch (error) {
      row.error = error.message;
      audit.errors.push({ email: account.email, error: error.message });
      // Preserve the account-by-account matrix and continue so one defect cannot
      // prevent the rest of the seeded users from being checked.
    } finally {
      row.consoleErrors = consoleErrors;
      row.failedRequests = failedRequests;
      row.badApiResponses = badResponses;
      audit.accounts.push(row);
      await context.close();
      audit.lastCompletedAccountAt = new Date().toISOString();
      await fs.writeFile(path.join(outputDirectory, "audit.json"), `${JSON.stringify(audit, null, 2)}\n`);
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
  await fs.writeFile(path.join(outputDirectory, "audit.json"), `${JSON.stringify(audit, null, 2)}\n`);
  expect(audit.accounts).toHaveLength(auditUsers.length);
  expect(audit.errors, "seeded account audit errors").toEqual([]);
});
