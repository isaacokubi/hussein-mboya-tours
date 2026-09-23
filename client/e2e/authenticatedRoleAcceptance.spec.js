import { test, expect } from "@playwright/test";

const REQUIRED_PERSONAS = [
  "customer",
  "admin",
  "finance",
  "tour_manager",
  "guide",
  "driver",
  "super_admin",
];

function loadRoleUsers() {
  const raw = String(process.env.BROWSER_ACCEPTANCE_ROLE_USERS_JSON || "").trim();
  if (!raw) return null;
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("BROWSER_ACCEPTANCE_ROLE_USERS_JSON must contain valid JSON.");
  }
  for (const persona of REQUIRED_PERSONAS) {
    const account = parsed?.[persona];
    if (!account?.email || !account?.password || !account?.route) {
      throw new Error(`Missing email, password or route for browser acceptance persona: ${persona}`);
    }
  }
  return parsed;
}

const roleUsers = loadRoleUsers();

test.describe("authenticated role acceptance", () => {
  test.skip(!roleUsers, "Set BROWSER_ACCEPTANCE_ROLE_USERS_JSON with approved non-production test accounts.");

  for (const persona of REQUIRED_PERSONAS) {
    test(`${persona} can authenticate and reach its acceptance surface`, async ({ page }) => {
      const account = roleUsers[persona];

      await page.goto("/login", { waitUntil: "domcontentloaded" });
      const form = page.locator("form").first();
      await expect(form).toBeVisible();

      const email = form.locator('input[type="email"], input[name="email"]').first();
      const password = form.locator('input[type="password"], input[name="password"]').first();
      await email.fill(account.email);
      await password.fill(account.password);
      await form.locator('button[type="submit"]').first().click();

      await expect(page).not.toHaveURL(/\/login(?:\?|$)/);
      await page.goto(account.route, { waitUntil: "domcontentloaded" });
      await expect(page).not.toHaveURL(/\/login(?:\?|$)/);
      await expect(page.locator("body")).not.toBeEmpty();

      for (const path of account.paths || []) {
        await page.goto(path, { waitUntil: "domcontentloaded" });
        await expect(page).not.toHaveURL(/\/login(?:\?|$)/);
        await expect(page.locator("body")).not.toBeEmpty();
      }

      const logout = page.getByRole("button", { name: /logout|sign out/i }).first();
      if (await logout.count()) {
        await logout.click();
        await expect(page).toHaveURL(/\/login(?:\?|$)/);
      }
    });
  }
});
