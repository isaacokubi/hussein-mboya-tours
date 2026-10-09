import { test, expect } from "@playwright/test";
import process from "node:process";

const apiOrigin = process.env.DEMO_API_ORIGIN || "https://hussein-mboya-tours.onrender.com";
const password = process.env.DEMO_TEST_PASSWORD || process.env.DEMO_SMOKE_PASSWORD || process.env.SEED_DEMO_PASSWORD;
const accounts = [
  { name: "customer", email: "customer1@husseinmboya.com", role: "customer", route: "/dashboard", tenant: true, content: /dashboard|welcome|booking/i },
  { name: "super admin", email: "superadmin1@husseinmboya.com", role: "super_admin", route: "/superadmin/dashboard", tenant: false, content: /dashboard|overview|tenant/i },
  { name: "tenant admin", email: "admin1@husseinmboya.com", role: "admin", route: "/admin/dashboard", tenant: true, content: /dashboard|overview|booking/i },
  { name: "tour manager", email: "tourmanager1@husseinmboya.com", role: "tour_manager", route: "/tour-manager/dashboard", tenant: true, content: /dashboard|tour|booking/i },
  { name: "agent", email: "agent1@husseinmboya.com", role: "agent", route: "/agent/dashboard", tenant: true, content: /dashboard|booking|commission/i },
  { name: "guide", email: "guide1@husseinmboya.com", role: "tour_guide", route: "/guide/dashboard", tenant: true, content: /dashboard|tour|guest/i },
  { name: "driver", email: "driver1@husseinmboya.com", role: "driver", route: "/driver/dashboard", tenant: true, content: /dashboard|tour|vehicle/i },
];

test("public catalogue smoke acceptance", async ({ page }) => {
  const errors = [];
  const failedRequests = [];
  const badResponses = [];
  const apiOrigins = new Set();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("requestfailed", (request) => failedRequests.push(`${request.method()} ${new URL(request.url()).pathname}`));
  page.on("response", (response) => {
    const responseUrl = new URL(response.url());
    if (responseUrl.origin === apiOrigin) {
      apiOrigins.add(responseUrl.origin);
      const path = responseUrl.pathname;
      // Public pages probe the current-user endpoint without a session; that 401 is expected.
      if (response.status() >= 400 && !(path.endsWith("/auth/me") && response.status() === 401)) {
        badResponses.push(`${response.status()} ${path}`);
      }
    }
    if (response.status() >= 500) badResponses.push(`${response.status()} ${new URL(response.url()).pathname}`);
  });

  await page.goto("/");
  await expect(page.locator("body")).toContainText(/Hussein|safari|tour/i);
  await expect(page.locator("body")).not.toContainText(/Sarah Williams|James Anderson|Amina Hassan/);
  const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
  expect(new URL(canonical).origin, "canonical must use the active tenant host").toBe(new URL(page.url()).origin);
  await expect(page.getByRole("link", { name: "Tours", exact: true }).first()).toBeVisible();
  await page.goto("/tours");
  await expect(page.locator("body")).toContainText(/tour/i);
  await expect(page.locator("a[href*='/tours/']:not([href='/tours'])").first()).toBeVisible({ timeout: 20_000 });
  await page.locator("a[href*='/tours/']:not([href='/tours'])").first().click();
  await expect(page).toHaveURL(/\/tours\/[^/]+/);
  await expect(page.locator("main").last()).not.toBeEmpty();
  await page.goto("/destinations");
  await expect(page.locator("body")).toContainText(/destination/i);
  await expect(page.locator("footer").getByRole("link", { name: /explore all destinations/i })).toHaveAttribute("href", "/destinations");
  await page.locator("main").last().locator("a[href^='/destinations/']").first().click();
  await expect(page).toHaveURL(/\/destinations\/[^/]+/);
  await expect(page.locator("main").last()).not.toContainText("Destination not found");

  // Let lazy-loaded catalogue/detail images settle before checking naturalWidth.
  // Sampling immediately after SPA navigation can report still-pending SVGs as broken.
  await page.locator("img").evaluateAll((items) => items.forEach((img) => { img.loading = "eager"; }));
  await page.waitForFunction(() => Array.from(document.images).every((img) => img.complete), null, { timeout: 20_000 });
  const imgs = await page.locator("img").evaluateAll((items) => items.map((img) => ({ src: img.currentSrc || img.src, ok: img.complete && img.naturalWidth > 0 })));
  expect(imgs.filter((item) => !item.ok).map((item) => item.src)).toEqual([]);
  const anchors = await page.locator("a[href]").evaluateAll((items) => items.map((link) => link.href).filter((href) => new URL(href).origin === location.origin));
  for (const href of [...new Set(anchors)]) {
    const result = await page.request.get(href);
    expect(result.status(), `link ${new URL(href).pathname}`).toBeLessThan(400);
  }
  const catalogueTenantIds = [];
  for (const collection of ["tours", "destinations"]) {
    const response = await page.request.get(`${apiOrigin}/api/${collection}`, { headers: { "X-Tenant-Slug": "hussein-mboya" } });
    expect(response.status(), `${collection} catalogue API`).toBe(200);
    const payload = await response.json();
    const records = payload.data || payload[collection] || [];
    expect(records.length, `${collection} catalogue records`).toBeGreaterThan(0);
    catalogueTenantIds.push(...records.map((record) => record.tenantId).filter(Boolean).map(String));
  }
  expect(new Set(catalogueTenantIds).size).toBe(1);
  await page.goto("/admin/dashboard");
  await expect(page).toHaveURL(/\/login$/);
  expect(errors).toEqual([]);
  expect(failedRequests).toEqual([]);
  expect(badResponses).toEqual([]);
  expect([...apiOrigins]).toEqual([apiOrigin]);
});

test("customer and staff role dashboards, read-only navigation and tenant scope", async ({ browser }) => {
  test.skip(!password, "Set DEMO_SMOKE_PASSWORD in the local test environment; the value is never logged or stored in this repository.");
  const errors = [];
  const failedRequests = [];
  const badResponses = [];
  const apiOrigins = new Set();
  const tenantIdsByAccount = new Map();
  for (const account of accounts) {
    const context = await browser.newContext();
    const rolePage = await context.newPage();
    rolePage.on("pageerror", (error) => errors.push(error.message));
    rolePage.on("requestfailed", (request) => failedRequests.push(`${request.method()} ${new URL(request.url()).pathname}`));
    rolePage.on("response", (response) => {
      const responseUrl = new URL(response.url());
      if (responseUrl.origin === apiOrigin) {
        apiOrigins.add(responseUrl.origin);
        if (response.status() >= 400) badResponses.push(`${response.status()} ${responseUrl.pathname}`);
      }
      if (response.status() >= 500) badResponses.push(`${response.status()} ${new URL(response.url()).pathname}`);
    });
    await rolePage.goto("/login");
    await rolePage.getByPlaceholder(/enter email/i).fill(account.email);
    await rolePage.getByPlaceholder(/enter password/i).fill(password);
    const loginResponse = rolePage.waitForResponse((response) => response.url().includes("/api/auth/login") && response.request().method() === "POST");
    await rolePage.getByRole("button", { name: "Login" }).click();
    const loginResult = await loginResponse;
    expect(loginResult.status(), `${account.name} login API`).toBe(200);
    const loginPayload = await loginResult.json();
    expect(loginPayload.user?.role, `${account.name} role`).toBe(account.role);
    tenantIdsByAccount.set(account.name, loginPayload.user?.tenantId || null);
    if (account.tenant) expect(tenantIdsByAccount.get(account.name), `${account.name} tenant`).toBeTruthy();
    await expect(rolePage).toHaveURL(new RegExp(account.route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    await expect(rolePage.locator("main").last()).toContainText(account.content);

    const routes = account.name === "customer" ? ["/dashboard", "/my-bookings", "/wishlist", "/profile"] : [account.route];
    for (const route of routes) {
      await rolePage.goto(route);
      await expect(rolePage.locator("main").last()).not.toBeEmpty();
      await expect(rolePage).not.toHaveURL(/\/login(?:\?|$)/);
    }
    if (account.name === "customer") {
      await rolePage.goto("/admin/dashboard");
      await expect(rolePage).not.toHaveURL(/\/admin(?:\/|$)/);
      expect(new URL(rolePage.url()).pathname).not.toMatch(/^\/admin(?:\/|$)/);
    }
    await context.close();
  }
  expect(tenantIdsByAccount.get("customer")).toBe(tenantIdsByAccount.get("tenant admin"));
  for (const account of accounts.filter(({ name }) => name !== "super admin")) {
    expect(tenantIdsByAccount.get(account.name), `${account.name} is scoped to the Hussein tenant`).toBe(tenantIdsByAccount.get("customer"));
  }
  expect(tenantIdsByAccount.get("super admin")).toBeNull();
  expect(errors).toEqual([]);
  expect(failedRequests).toEqual([]);
  expect(badResponses).toEqual([]);
  expect([...apiOrigins]).toEqual([apiOrigin]);
});

test("customer reviews area", async () => {
  test.skip(true, "The client defines no customer reviews route; public review submission would require an existing completed booking and a mutation.");
});


test("mobile homepage trip finder preserves date filters and avoids horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await expect(page.getByRole("textbox", { name: "Destination or tour" })).toBeVisible();
  const dateInput = page.getByRole("textbox", { name: "Preferred travel date" });
  await expect(dateInput).toBeVisible();
  await dateInput.fill("2026-11-01");
  await page.getByRole("button", { name: /find my trip/i }).click();
  await expect(page).toHaveURL(/\/tours\?.*date=2026-11-01/);
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(dimensions.content, "mobile content should not overflow horizontally").toBeLessThanOrEqual(dimensions.viewport);
});
