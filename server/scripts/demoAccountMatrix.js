import { TEST_LOGIN_EMAILS } from "../seeds/completeTestDemoSeed.js";

const selectedTenantAccounts = new Set([
  "admin1", "tourmanager1", "agent1", "guide1", "driver1",
  "customer1", "customer2", "customer3", "customer4",
]);
const tenantByDomain = {
  "husseinmboya.com": "hussein-mboya",
  "amanitrails.com": "amani-trails",
  "demosafari.com": "demo-safari",
};

function roleForEmail(email) {
  if (email === "superadmin1@husseinmboya.com") return "super_admin";
  const local = email.split("@")[0];
  if (local === "admin1") return "admin";
  if (local === "tourmanager1") return "tour_manager";
  if (local.startsWith("agent")) return "agent";
  if (local.startsWith("guide")) return "tour_guide";
  if (local.startsWith("driver")) return "driver";
  if (local.startsWith("customer")) return "customer";
  return null;
}

function dashboardForRole(role) {
  return {
    super_admin: "/api/superadmin/dashboard",
    admin: "/api/admin/dashboard/metrics",
    tour_manager: "/api/tourmanager/dashboard",
    agent: "/api/agent/dashboard",
    tour_guide: "/api/guide/dashboard",
    driver: "/api/driver/dashboard",
    customer: "/api/bookings/my-bookings",
  }[role] || null;
}

/** One platform owner plus nine representative users from each tenant. */
export function buildDemoAccountMatrix() {
  return TEST_LOGIN_EMAILS
    .filter((email) => email === "superadmin1@husseinmboya.com" || selectedTenantAccounts.has(email.split("@")[0]))
    .map((email) => {
      const [, domain] = email.split("@");
      const role = roleForEmail(email);
      const tenant = tenantByDomain[domain] || null;
      const dashboard = dashboardForRole(role);
      if (!role || !dashboard || (email !== "superadmin1@husseinmboya.com" && !tenant)) {
        throw new Error(`Unsupported canonical demo account in staging matrix: ${email}`);
      }
      return { email, role, tenant, dashboard };
    });
}
