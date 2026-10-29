import { expect, test } from "@playwright/test";

const dashboards = [
  { role: "customer", path: "/dashboard", menu: /Toggle navigation|Open dashboard menu/ },
  { role: "admin", path: "/admin/dashboard", menu: /Open admin menu/ },
  { role: "agent", path: "/agent/dashboard", menu: /Open agent menu/ },
  { role: "manager", path: "/tour-manager/dashboard", menu: /Open Tour Manager navigation/ },
  { role: "super_admin", path: "/superadmin/dashboard", menu: /Open super admin menu/ },
  { role: "guide", path: "/guide/dashboard", menu: /Open dashboard menu/ },
  { role: "driver", path: "/driver/dashboard", menu: /Open dashboard menu/ },
];

for (const dashboard of dashboards) {
  test(`${dashboard.role} mobile dashboard keeps Logout clear of the navigation menu`, async ({ page }) => {
    const user = {
      _id: `${dashboard.role}-test-user`,
      name: "Mobile Layout Test",
      email: "mobile-layout@example.test",
      role: dashboard.role,
      tenantId: dashboard.role === "super_admin" ? null : "tenant-layout-test",
      permissions: [],
    };
    await page.addInitScript((storedUser) => {
      localStorage.setItem("token", "mobile-layout-test-token");
      localStorage.setItem("user", JSON.stringify(storedUser));
      if (storedUser.tenantId) localStorage.setItem("tenantId", storedUser.tenantId);
    }, user);
    await page.route("**/api/**", async (route) => {
      const pathname = new URL(route.request().url()).pathname;
      if (pathname.endsWith("/auth/me")) {
        return route.fulfill({ json: { user } });
      }
      if (pathname.endsWith("/subscription")) {
        return route.fulfill({ json: { plan: "enterprise", features: ["dashboard", "agents", "operations", "fleet"] } });
      }
      return route.fulfill({ json: { success: true, data: [], bookings: [], tours: [], stats: {} } });
    });

    await page.goto(dashboard.path);
    const logout = page.getByRole("button", { name: "Logout" }).first();
    await expect(logout).toBeVisible();
    const menuButtons = page.getByRole("button", { name: dashboard.menu });
    await expect(menuButtons.first()).toBeVisible();

    const logoutBox = await logout.boundingBox();
    expect(logoutBox).not.toBeNull();
    for (let index = 0; index < await menuButtons.count(); index += 1) {
      const menuBox = await menuButtons.nth(index).boundingBox();
      if (!menuBox) continue;
      const overlaps = logoutBox.x < menuBox.x + menuBox.width
        && logoutBox.x + logoutBox.width > menuBox.x
        && logoutBox.y < menuBox.y + menuBox.height
        && logoutBox.y + logoutBox.height > menuBox.y;
      expect(overlaps, `Logout overlaps navigation button ${index}`).toBe(false);
    }
  });
}
