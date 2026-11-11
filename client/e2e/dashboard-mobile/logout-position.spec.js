/**
 * Purpose: logout position.spec automated test. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { expect, test } from "@playwright/test";

// Declare dashboards for use by the surrounding module or function.
const dashboards = [
  { role: "customer", path: "/dashboard", menu: /Toggle navigation|Open dashboard menu/ },
  { role: "admin", path: "/admin/dashboard", menu: /Open admin menu/ },
  { role: "agent", path: "/agent/dashboard", menu: /Open agent menu/ },
  { role: "manager", path: "/tour-manager/dashboard", menu: /Open Tour Manager navigation/ },
  { role: "super_admin", path: "/superadmin/dashboard", menu: /Open super admin menu/ },
  { role: "guide", path: "/guide/dashboard", menu: /Open dashboard menu/ },
  { role: "driver", path: "/driver/dashboard", menu: /Open dashboard menu/ },
];

// Repeat the enclosed work for each required iteration.
for (const dashboard of dashboards) {
  // Perform the side effect or state update expressed on the following line.
  test(`${dashboard.role} mobile dashboard keeps Logout clear of the navigation menu`, async ({ page }) => {
    // Declare user for use by the surrounding module or function.
    const user = {
      _id: `${dashboard.role}-test-user`,
      name: "Mobile Layout Test",
      email: "mobile-layout@example.test",
      role: dashboard.role,
      tenantId: dashboard.role === "super_admin" ? null : "tenant-layout-test",
      permissions: [],
    };
    // Perform the side effect or state update expressed on the following line.
    await page.addInitScript((storedUser) => {
      // Perform the side effect or state update expressed on the following line.
      localStorage.setItem("token", "mobile-layout-test-token");
      // Perform the side effect or state update expressed on the following line.
      localStorage.setItem("user", JSON.stringify(storedUser));
      // Check the condition (storedUser.tenantId) and run the matching branch.
      if (storedUser.tenantId) localStorage.setItem("tenantId", storedUser.tenantId);
    }, user);
    // Perform the side effect or state update expressed on the following line.
    await page.route("**/api/**", async (route) => {
      // Declare pathname for use by the surrounding module or function.
      const pathname = new URL(route.request().url()).pathname;
      // Check the condition (pathname.endsWith("/auth/me")) and run the matching branch.
      if (pathname.endsWith("/auth/me")) {
        // Return the result of route.fulfill() to the caller.
        return route.fulfill({ json: { user } });
      }
      // Check the condition (pathname.endsWith("/subscription")) and run the matching branch.
      if (pathname.endsWith("/subscription")) {
        // Return the result of route.fulfill() to the caller.
        return route.fulfill({ json: { plan: "enterprise", features: ["dashboard", "agents", "operations", "fleet"] } });
      }
      // Return the result of route.fulfill() to the caller.
      return route.fulfill({ json: { success: true, data: [], bookings: [], tours: [], stats: {} } });
    });

    // Perform the side effect or state update expressed on the following line.
    await page.goto(dashboard.path);
    // Declare logout for use by the surrounding module or function.
    const logout = page.getByRole("button", { name: "Logout" }).first();
    // Perform the side effect or state update expressed on the following line.
    await expect(logout).toBeVisible();
    // Declare menuButtons for use by the surrounding module or function.
    const menuButtons = page.getByRole("button", { name: dashboard.menu });
    // Perform the side effect or state update expressed on the following line.
    await expect(menuButtons.first()).toBeVisible();

    // Declare logoutBox for use by the surrounding module or function.
    const logoutBox = await logout.boundingBox();
    // Perform the side effect or state update expressed on the following line.
    expect(logoutBox).not.toBeNull();
    // Repeat the enclosed work for each required iteration.
    for (let index = 0; index < await menuButtons.count(); index += 1) {
      // Declare menuBox for use by the surrounding module or function.
      const menuBox = await menuButtons.nth(index).boundingBox();
      // Check the condition (!menuBox) and run the matching branch.
      if (!menuBox) continue;
      // Declare overlaps for use by the surrounding module or function.
      const overlaps = logoutBox.x < menuBox.x + menuBox.width
        && logoutBox.x + logoutBox.width > menuBox.x
        && logoutBox.y < menuBox.y + menuBox.height
        && logoutBox.y + logoutBox.height > menuBox.y;
      // Perform the side effect or state update expressed on the following line.
      expect(overlaps, `Logout overlaps navigation button ${index}`).toBe(false);
    }
  });
}
