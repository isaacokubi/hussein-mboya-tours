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
  const screenshotDirectory = path.join(outputDirectory, "screenshots");
  await fs.mkdir(screenshotDirectory, { recursive: true });
  const audit = { startedAt: new Date().toISOString(), accounts: [], tenantScope: [], errors: [], screenshots: [] };
  let apiOrigin = "";

  for (const [index, account] of users.entries()) {
    if (index > 0 && index % 10 === 0) await pause(15 * 60 * 1000 + 1500);
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    const row = { email: account.email, expectedRole: account.role, expectedTenant: account.tenant, steps: [] };
    const consoleErrors = [];
    const failedRequests = [];
    const badResponses = [];
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
      await page.getByLabel("Email").fill(account.email);
      await page.getByLabel("Password").fill(password);
      const loginResponsePromise = page.waitForResponse((response) => response.url().includes("/api/auth/login") && response.request().method() === "POST");
      await page.getByRole("button", { name: "Login", exact: true }).click();
      let loginResponse = await loginResponsePromise;
      row.loginStatus = loginResponse.status();
      if (loginResponse.status() === 429) {
        const retryAfter = Number(loginResponse.headers()["retry-after"] || 900);
        row.rateLimited = true;
        await pause((retryAfter + 2) * 1000);
        await page.reload();
        await page.getByLabel("Email").fill(account.email);
        await page.getByLabel("Password").fill(password);
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
      await expect(page.locator("main").last()).not.toBeEmpty({ timeout: 30_000 });
      row.steps.push("role dashboard loaded");
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

      const menuLink = page.locator(`a[href="${account.menu}"]`).first();
      await expect(menuLink).toBeVisible({ timeout: 15_000 });
      row.menuVisible = true;
      row.steps.push("role menu visible");
      const screenshot = path.join(screenshotDirectory, `${String(index + 1).padStart(2, "0")}-${account.email.replaceAll("@", "-")}.png`);
      await page.screenshot({ path: screenshot, fullPage: true, animations: "disabled" });
      row.screenshot = path.basename(screenshot);
      audit.screenshots.push(row.screenshot);

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
    }
  }

  const tenantIdBySlug = new Map(audit.accounts
    .filter((account) => account.expectedRole === "admin")
    .map((account) => [account.expectedTenant, String(account.tenantId || "")]));
  if (tenantIdBySlug.size !== 3 || new Set(tenantIdBySlug.values()).size !== 3 || [...tenantIdBySlug.values()].some((id) => !id)) {
    audit.errors.push({ check: "tenant-admin identities", error: "Expected three distinct tenant administrator identities" });
  }
  for (const account of audit.accounts) {
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
  expect(audit.accounts).toHaveLength(28);
  expect(audit.errors, "seeded account audit errors").toEqual([]);
});
