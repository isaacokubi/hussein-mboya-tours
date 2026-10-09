import { expect, test } from "@playwright/test";

const mockApi = async (page) => {
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    let body = { success: true, data: [], items: [], count: 0 };
    if (path.endsWith("/tenant/branding") || path.endsWith("/tenant/branding/")) {
      body = { success: true, branding: { id: "ci-tenant", name: "CI Demo Travel", slug: "ci-demo", currency: "KES", timezone: "Africa/Nairobi", contactEmail: "hello@example.invalid", contactPhone: "" } };
    } else if (path.endsWith("/settings/public")) {
      body = { success: true, settings: { companyName: "CI Demo Travel", currency: "KES", enableMpesa: false }, data: { companyName: "CI Demo Travel", currency: "KES" } };
    } else if (path.endsWith("/travel-guides")) {
      body = { success: true, guides: [], count: 0 };
    } else if (path.includes("/travel-guides/")) {
      body = { success: false, message: "Travel guide not found" };
    } else if (path.endsWith("/gallery/featured")) {
      body = { success: true, images: [], data: [], count: 0 };
    } else if (path.includes("/hero")) {
      body = { success: true, slides: [], heroSlides: [], data: [] };
    } else if (path.endsWith("/categories")) {
      body = { success: true, categories: [], data: [] };
    } else if (path.endsWith("/destinations")) {
      body = { success: true, destinations: [], data: [] };
    } else if (path.endsWith("/tours")) {
      body = { success: true, tours: [], data: [] };
    } else if (path.endsWith("/packages")) {
      body = { success: true, packages: [], data: [] };
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
  });
};

test("responsive public navigation remains available from phone through tablet widths", async ({ page }) => {
  await mockApi(page);
  for (const width of [375, 768, 1024]) {
    await page.setViewportSize({ width, height: 820 });
    await page.goto("/");
    await expect(page.locator("header")).toBeVisible();
    const toggle = page.getByRole("button", { name: "Toggle navigation" });
    if (await toggle.isVisible()) {
      await toggle.click();
      await expect(page.getByRole("link", { name: "Travel Guides", exact: true }).first()).toBeVisible();
    } else {
      await expect(page.getByRole("link", { name: "Travel Guides", exact: true }).first()).toBeVisible();
    }
    const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
    expect(dimensions.content, "no horizontal overflow at " + width + "px").toBeLessThanOrEqual(dimensions.viewport);
  }
});

test("trip finder preserves the chosen date and traveler count in the catalogue URL", async ({ page }) => {
  await mockApi(page);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.getByLabel("Destination or tour").fill("birding");
  await page.getByLabel("Preferred travel date").fill("2026-11-01");
  await page.getByLabel("Number of travellers").fill("3");
  await page.getByRole("button", { name: /find my trip/i }).click();
  await expect(page).toHaveURL(/\/tours\?.*search=birding.*date=2026-11-01.*travellers=3|\/tours\?.*travellers=3.*date=2026-11-01/);
});
test("homepage avoids unverified metrics, invented testimonials and inert signup controls", async ({ page }) => {
  await mockApi(page);
  await page.goto("/");
  await expect(page.locator("body")).not.toContainText(/4,486|290\+ Tours Completed|Sarah Williams|James Anderson|Amina Hassan/);
  await expect(page.locator("body")).not.toContainText(/Secure M-Pesa Payments/i);
  await expect(page.getByPlaceholder("Email address")).toHaveCount(0);
  await expect(page.getByRole("link", { name: /contact us/i }).first()).toBeVisible();
});

test("tenant travel guide catalogue and canonical metadata render on the active host", async ({ page }) => {
  await mockApi(page);
  await page.goto("/travel-guides");
  await expect(page.getByRole("heading", { name: /travel guides from/i })).toBeVisible();
  await expect(page.getByText("No guides have been published yet.")).toBeVisible();
  const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
  expect(new URL(canonical).origin).toBe(new URL(page.url()).origin);
  await page.goto("/travel-guides/a-draft-that-is-not-published");
  await expect(page.getByRole("heading", { name: "Travel guide not found" })).toBeVisible();
});
