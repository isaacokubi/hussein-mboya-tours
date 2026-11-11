/**
 * Purpose: production smoke.spec automated test. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { test, expect } from "@playwright/test";
// Load node:process so this module can use its exported dependencies.
import process from "node:process";

// Declare apiOrigin for use by the surrounding module or function.
const apiOrigin = process.env.DEMO_API_ORIGIN || "https://hussein-mboya-tours.onrender.com";
// Declare password for use by the surrounding module or function.
const password = process.env.DEMO_TEST_PASSWORD || process.env.DEMO_SMOKE_PASSWORD || process.env.SEED_DEMO_PASSWORD;
// Declare accounts for use by the surrounding module or function.
const accounts = [
  { name: "customer", email: "customer1@husseinmboya.com", role: "customer", route: "/dashboard", tenant: true, content: /dashboard|welcome|booking/i },
  { name: "super admin", email: "superadmin1@husseinmboya.com", role: "super_admin", route: "/superadmin/dashboard", tenant: false, content: /dashboard|overview|tenant/i },
  { name: "tenant admin", email: "admin1@husseinmboya.com", role: "admin", route: "/admin/dashboard", tenant: true, content: /dashboard|overview|booking/i },
  { name: "tour manager", email: "tourmanager1@husseinmboya.com", role: "tour_manager", route: "/tour-manager/dashboard", tenant: true, content: /dashboard|tour|booking/i },
  { name: "agent", email: "agent1@husseinmboya.com", role: "agent", route: "/agent/dashboard", tenant: true, content: /dashboard|booking|commission/i },
  { name: "guide", email: "guide1@husseinmboya.com", role: "tour_guide", route: "/guide/dashboard", tenant: true, content: /dashboard|tour|guest/i },
  { name: "driver", email: "driver1@husseinmboya.com", role: "driver", route: "/driver/dashboard", tenant: true, content: /dashboard|tour|vehicle/i },
];

// Perform the side effect or state update expressed on the following line.
test("public catalogue smoke acceptance", async ({ page }) => {
  // Declare errors for use by the surrounding module or function.
  const errors = [];
  // Declare failedRequests for use by the surrounding module or function.
  const failedRequests = [];
  // Declare badResponses for use by the surrounding module or function.
  const badResponses = [];
  // Declare apiOrigins for use by the surrounding module or function.
  const apiOrigins = new Set();
  // Perform the side effect or state update expressed on the following line.
  page.on("pageerror", (error) => errors.push(error.message));
  // Perform the side effect or state update expressed on the following line.
  page.on("requestfailed", (request) => failedRequests.push(`${request.method()} ${new URL(request.url()).pathname}`));
  // Perform the side effect or state update expressed on the following line.
  page.on("response", (response) => {
    // Declare responseUrl for use by the surrounding module or function.
    const responseUrl = new URL(response.url());
    // Check the condition (responseUrl.origin === apiOrigin) and run the matching branch.
    if (responseUrl.origin === apiOrigin) {
      // Perform the side effect or state update expressed on the following line.
      apiOrigins.add(responseUrl.origin);
      // Declare path for use by the surrounding module or function.
      const path = responseUrl.pathname;
      // Public pages probe the current-user endpoint without a session; that 401 is expected.
      // Check the condition (response.status() >= 400 && !(path.endsWith("/auth/me") && response.st) and run the matching branch.
      if (response.status() >= 400 && !(path.endsWith("/auth/me") && response.status() === 401)) {
        // Perform the side effect or state update expressed on the following line.
        badResponses.push(`${response.status()} ${path}`);
      }
    }
    // Check the condition (response.status() >= 500) and run the matching branch.
    if (response.status() >= 500) badResponses.push(`${response.status()} ${new URL(response.url()).pathname}`);
  });

  // Perform the side effect or state update expressed on the following line.
  await page.goto("/");
  // Perform the side effect or state update expressed on the following line.
  await expect(page.locator("body")).toContainText(/Hussein|safari|tour/i);
  // Perform the side effect or state update expressed on the following line.
  await expect(page.getByRole("link", { name: "Tours", exact: true }).first()).toBeVisible();
  // Perform the side effect or state update expressed on the following line.
  await page.goto("/tours");
  // Perform the side effect or state update expressed on the following line.
  await expect(page.locator("body")).toContainText(/tour/i);
  // Perform the side effect or state update expressed on the following line.
  await expect(page.locator("a[href*='/tours/']:not([href='/tours'])").first()).toBeVisible({ timeout: 20_000 });
  // Perform the side effect or state update expressed on the following line.
  await page.locator("a[href*='/tours/']:not([href='/tours'])").first().click();
  // Perform the side effect or state update expressed on the following line.
  await expect(page).toHaveURL(/\/tours\/[^/]+/);
  // Perform the side effect or state update expressed on the following line.
  await expect(page.locator("main").last()).not.toBeEmpty();
  // Perform the side effect or state update expressed on the following line.
  await page.goto("/destinations");
  // Perform the side effect or state update expressed on the following line.
  await expect(page.locator("body")).toContainText(/destination/i);
  // Declare footerDestinations for use by the surrounding module or function.
  const footerDestinations = [["Maasai Mara", "/destinations/maasai-mara"], ["Diani Beach", "/destinations/diani-beach"], ["Mount Kenya", "/destinations/mount-kenya"], ["Nairobi", "/destinations/nairobi"]];
  // Repeat the enclosed work for each required iteration.
  for (const [name, href] of footerDestinations) {
    // Perform the side effect or state update expressed on the following line.
    await expect(page.locator("footer").getByRole("link", { name, exact: true })).toHaveAttribute("href", href);
  }
  // Perform the side effect or state update expressed on the following line.
  await page.locator("main").last().locator("a[href^='/destinations/']").first().click();
  // Perform the side effect or state update expressed on the following line.
  await expect(page).toHaveURL(/\/destinations\/[^/]+/);
  // Perform the side effect or state update expressed on the following line.
  await expect(page.locator("main").last()).not.toContainText("Destination not found");

  // Let lazy-loaded catalogue/detail images settle before checking naturalWidth.
  // Sampling immediately after SPA navigation can report still-pending SVGs as broken.
  // Perform the side effect or state update expressed on the following line.
  await page.locator("img").evaluateAll((items) => items.forEach((img) => { img.loading = "eager"; }));
  // Perform the side effect or state update expressed on the following line.
  await page.waitForFunction(() => Array.from(document.images).every((img) => img.complete), null, { timeout: 20_000 });
  // Declare imgs for use by the surrounding module or function.
  const imgs = await page.locator("img").evaluateAll((items) => items.map((img) => ({ src: img.currentSrc || img.src, ok: img.complete && img.naturalWidth > 0 })));
  // Perform the side effect or state update expressed on the following line.
  expect(imgs.filter((item) => !item.ok).map((item) => item.src)).toEqual([]);
  // Declare anchors for use by the surrounding module or function.
  const anchors = await page.locator("a[href]").evaluateAll((items) => items.map((link) => link.href).filter((href) => new URL(href).origin === location.origin));
  // Repeat the enclosed work for each required iteration.
  for (const href of [...new Set(anchors)]) {
    // Declare result for use by the surrounding module or function.
    const result = await page.request.get(href);
    // Perform the side effect or state update expressed on the following line.
    expect(result.status(), `link ${new URL(href).pathname}`).toBeLessThan(400);
  }
  // Declare catalogueTenantIds for use by the surrounding module or function.
  const catalogueTenantIds = [];
  // Repeat the enclosed work for each required iteration.
  for (const collection of ["tours", "destinations"]) {
    // Declare response for use by the surrounding module or function.
    const response = await page.request.get(`${apiOrigin}/api/${collection}`, { headers: { "X-Tenant-Slug": "hussein-mboya" } });
    // Perform the side effect or state update expressed on the following line.
    expect(response.status(), `${collection} catalogue API`).toBe(200);
    // Declare payload for use by the surrounding module or function.
    const payload = await response.json();
    // Declare records for use by the surrounding module or function.
    const records = payload.data || payload[collection] || [];
    // Perform the side effect or state update expressed on the following line.
    expect(records.length, `${collection} catalogue records`).toBeGreaterThan(0);
    // Perform the side effect or state update expressed on the following line.
    catalogueTenantIds.push(...records.map((record) => record.tenantId).filter(Boolean).map(String));
  }
  // Perform the side effect or state update expressed on the following line.
  expect(new Set(catalogueTenantIds).size).toBe(1);
  // Perform the side effect or state update expressed on the following line.
  await page.goto("/admin/dashboard");
  // Perform the side effect or state update expressed on the following line.
  await expect(page).toHaveURL(/\/login$/);
  // Perform the side effect or state update expressed on the following line.
  expect(errors).toEqual([]);
  // Perform the side effect or state update expressed on the following line.
  expect(failedRequests).toEqual([]);
  // Perform the side effect or state update expressed on the following line.
  expect(badResponses).toEqual([]);
  // Perform the side effect or state update expressed on the following line.
  expect([...apiOrigins]).toEqual([apiOrigin]);
});

// Perform the side effect or state update expressed on the following line.
test("customer and staff role dashboards, read-only navigation and tenant scope", async ({ browser }) => {
  // Perform the side effect or state update expressed on the following line.
  test.skip(!password, "Set DEMO_SMOKE_PASSWORD in the local test environment; the value is never logged or stored in this repository.");
  // Declare errors for use by the surrounding module or function.
  const errors = [];
  // Declare failedRequests for use by the surrounding module or function.
  const failedRequests = [];
  // Declare badResponses for use by the surrounding module or function.
  const badResponses = [];
  // Declare apiOrigins for use by the surrounding module or function.
  const apiOrigins = new Set();
  // Declare tenantIdsByAccount for use by the surrounding module or function.
  const tenantIdsByAccount = new Map();
  // Repeat the enclosed work for each required iteration.
  for (const account of accounts) {
    // Declare context for use by the surrounding module or function.
    const context = await browser.newContext();
    // Declare rolePage for use by the surrounding module or function.
    const rolePage = await context.newPage();
    // Perform the side effect or state update expressed on the following line.
    rolePage.on("pageerror", (error) => errors.push(error.message));
    // Perform the side effect or state update expressed on the following line.
    rolePage.on("requestfailed", (request) => failedRequests.push(`${request.method()} ${new URL(request.url()).pathname}`));
    // Perform the side effect or state update expressed on the following line.
    rolePage.on("response", (response) => {
      // Declare responseUrl for use by the surrounding module or function.
      const responseUrl = new URL(response.url());
      // Check the condition (responseUrl.origin === apiOrigin) and run the matching branch.
      if (responseUrl.origin === apiOrigin) {
        // Perform the side effect or state update expressed on the following line.
        apiOrigins.add(responseUrl.origin);
        // Check the condition (response.status() >= 400) and run the matching branch.
        if (response.status() >= 400) badResponses.push(`${response.status()} ${responseUrl.pathname}`);
      }
      // Check the condition (response.status() >= 500) and run the matching branch.
      if (response.status() >= 500) badResponses.push(`${response.status()} ${new URL(response.url()).pathname}`);
    });
    // Perform the side effect or state update expressed on the following line.
    await rolePage.goto("/login");
    // Perform the side effect or state update expressed on the following line.
    await rolePage.getByPlaceholder(/enter email/i).fill(account.email);
    // Perform the side effect or state update expressed on the following line.
    await rolePage.getByPlaceholder(/enter password/i).fill(password);
    // Declare loginResponse for use by the surrounding module or function.
    const loginResponse = rolePage.waitForResponse((response) => response.url().includes("/api/auth/login") && response.request().method() === "POST");
    // Perform the side effect or state update expressed on the following line.
    await rolePage.getByRole("button", { name: "Login" }).click();
    // Declare loginResult for use by the surrounding module or function.
    const loginResult = await loginResponse;
    // Perform the side effect or state update expressed on the following line.
    expect(loginResult.status(), `${account.name} login API`).toBe(200);
    // Declare loginPayload for use by the surrounding module or function.
    const loginPayload = await loginResult.json();
    // Perform the side effect or state update expressed on the following line.
    expect(loginPayload.user?.role, `${account.name} role`).toBe(account.role);
    // Perform the side effect or state update expressed on the following line.
    tenantIdsByAccount.set(account.name, loginPayload.user?.tenantId || null);
    // Check the condition (account.tenant) and run the matching branch.
    if (account.tenant) expect(tenantIdsByAccount.get(account.name), `${account.name} tenant`).toBeTruthy();
    // Perform the side effect or state update expressed on the following line.
    await expect(rolePage).toHaveURL(new RegExp(account.route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    // Perform the side effect or state update expressed on the following line.
    await expect(rolePage.locator("main").last()).toContainText(account.content);

    // Declare routes for use by the surrounding module or function.
    const routes = account.name === "customer" ? ["/dashboard", "/my-bookings", "/wishlist", "/profile"] : [account.route];
    // Repeat the enclosed work for each required iteration.
    for (const route of routes) {
      // Perform the side effect or state update expressed on the following line.
      await rolePage.goto(route);
      // Perform the side effect or state update expressed on the following line.
      await expect(rolePage.locator("main").last()).not.toBeEmpty();
      // Perform the side effect or state update expressed on the following line.
      await expect(rolePage).not.toHaveURL(/\/login(?:\?|$)/);
    }
    // Check the condition (account.name === "customer") and run the matching branch.
    if (account.name === "customer") {
      // Perform the side effect or state update expressed on the following line.
      await rolePage.goto("/admin/dashboard");
      // Perform the side effect or state update expressed on the following line.
      await expect(rolePage).not.toHaveURL(/\/admin(?:\/|$)/);
      // Perform the side effect or state update expressed on the following line.
      expect(new URL(rolePage.url()).pathname).not.toMatch(/^\/admin(?:\/|$)/);
    }
    // Perform the side effect or state update expressed on the following line.
    await context.close();
  }
  // Perform the side effect or state update expressed on the following line.
  expect(tenantIdsByAccount.get("customer")).toBe(tenantIdsByAccount.get("tenant admin"));
  // Repeat the enclosed work for each required iteration.
  for (const account of accounts.filter(({ name }) => name !== "super admin")) {
    // Perform the side effect or state update expressed on the following line.
    expect(tenantIdsByAccount.get(account.name), `${account.name} is scoped to the Hussein tenant`).toBe(tenantIdsByAccount.get("customer"));
  }
  // Perform the side effect or state update expressed on the following line.
  expect(tenantIdsByAccount.get("super admin")).toBeNull();
  // Perform the side effect or state update expressed on the following line.
  expect(errors).toEqual([]);
  // Perform the side effect or state update expressed on the following line.
  expect(failedRequests).toEqual([]);
  // Perform the side effect or state update expressed on the following line.
  expect(badResponses).toEqual([]);
  // Perform the side effect or state update expressed on the following line.
  expect([...apiOrigins]).toEqual([apiOrigin]);
});

// Perform the side effect or state update expressed on the following line.
test("customer reviews area", async () => {
  // Perform the side effect or state update expressed on the following line.
  test.skip(true, "The client defines no customer reviews route; public review submission would require an existing completed booking and a mutation.");
});
