/**
 * Purpose: demo Account Matrix operational script. Main declarations: roleForEmail, dashboardForRole, buildDemoAccountMatrix.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { TEST_LOGIN_EMAILS } from "../seeds/completeTestDemoSeed.js";

// Declare selectedTenantAccounts for use by the surrounding module or function.
const selectedTenantAccounts = new Set([
  "admin1", "tourmanager1", "agent1", "guide1", "driver1",
  "customer1", "customer2", "customer3", "customer4",
]);
// Declare tenantByDomain for use by the surrounding module or function.
const tenantByDomain = {
  "husseinmboya.com": "hussein-mboya",
  "amanitrails.com": "amani-trails",
  "demosafari.com": "demo-safari",
};

// Define roleForEmail; its parameters and body implement this operation.
function roleForEmail(email) {
  // Check the condition (email === "superadmin1@husseinmboya.com") and run the matching branch.
  if (email === "superadmin1@husseinmboya.com") return "super_admin";
  // Declare local for use by the surrounding module or function.
  const local = email.split("@")[0];
  // Check the condition (local === "admin1") and run the matching branch.
  if (local === "admin1") return "admin";
  // Check the condition (local === "tourmanager1") and run the matching branch.
  if (local === "tourmanager1") return "tour_manager";
  // Check the condition (local.startsWith("agent")) and run the matching branch.
  if (local.startsWith("agent")) return "agent";
  // Check the condition (local.startsWith("guide")) and run the matching branch.
  if (local.startsWith("guide")) return "tour_guide";
  // Check the condition (local.startsWith("driver")) and run the matching branch.
  if (local.startsWith("driver")) return "driver";
  // Check the condition (local.startsWith("customer")) and run the matching branch.
  if (local.startsWith("customer")) return "customer";
  // Return the expression shown below to the caller.
  return null;
}

// Define dashboardForRole; its parameters and body implement this operation.
function dashboardForRole(role) {
  // Return the expression shown below to the caller.
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
// Define buildDemoAccountMatrix; its parameters and body implement this operation.
export function buildDemoAccountMatrix() {
  // Return the result of TEST_LOGIN_EMAILS     .filter((email) => email === "superadmin1@husseinmboya.com" || selectedTenantAccounts.has(email.split("@")[0]))     .map() to the caller.
  return TEST_LOGIN_EMAILS
    .filter((email) => email === "superadmin1@husseinmboya.com" || selectedTenantAccounts.has(email.split("@")[0]))
    .map((email) => {
      // Declare [, domain] for use by the surrounding module or function.
      const [, domain] = email.split("@");
      // Declare role for use by the surrounding module or function.
      const role = roleForEmail(email);
      // Declare tenant for use by the surrounding module or function.
      const tenant = email === "superadmin1@husseinmboya.com" ? null : (tenantByDomain[domain] || null);
      // Declare dashboard for use by the surrounding module or function.
      const dashboard = dashboardForRole(role);
      // Check the condition (!role || !dashboard || (email !== "superadmin1@husseinmboya.com" && !t) and run the matching branch.
      if (!role || !dashboard || (email !== "superadmin1@husseinmboya.com" && !tenant)) {
        // Stop the current operation by raising a new Error instance.
        throw new Error(`Unsupported canonical demo account in staging matrix: ${email}`);
      }
      // Return the object assembled below to the caller.
      return { email, role, tenant, dashboard };
    });
}
