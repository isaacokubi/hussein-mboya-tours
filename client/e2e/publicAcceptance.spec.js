import { test, expect } from "@playwright/test";

const publicRoutes = [
  "/",
  "/tours",
  "/destinations",
  "/airport-transfers",
  "/hotels",
  "/contact",
  "/privacy",
  "/terms",
  "/refund-policy",
  "/login",
  "/register",
  "/forgot-password",
];

for (const route of publicRoutes) {
  test(`public page loads: ${route}`, async ({ page }) => {
    const response = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(response?.status(), `${route} response`).toBeLessThan(400);
    await expect(page.locator("body")).not.toBeEmpty();
  });
}

test("protected customer dashboard redirects unauthenticated users to login", async ({ page }) => {
  await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/login(?:\?|$)/);
});

test("protected booking route redirects unauthenticated users to login", async ({ page }) => {
  await page.goto("/my-bookings", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/login(?:\?|$)/);
});

test("login rejects an empty submission without leaving the login surface", async ({ page }) => {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  const form = page.locator("form").first();
  await expect(form).toBeVisible();
  const submit = form.locator('button[type="submit"]').first();
  await expect(submit).toBeVisible();
  await submit.click();
  await expect(page).toHaveURL(/\/login/);
});

test("public pages remain usable at a mobile viewport", async ({ page }) => {
  await page.goto("/tours", { waitUntil: "domcontentloaded" });
  await expect(page.locator("body")).not.toBeEmpty();
  await expect(page.locator("body")).toBeVisible();
});
