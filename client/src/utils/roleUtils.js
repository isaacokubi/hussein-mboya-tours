/**
 * Purpose: role Utils client application module. Main declarations: normalizeRole, getUserRole, isSuperAdmin, isAdmin, isManager.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
const ROLE_ALIASES = {
  customer: "customer", user: "customer",
  admin: "admin", administrator: "admin",
  superadmin: "super_admin", super_admin: "super_admin",
  manager: "tour_manager", tourmanager: "tour_manager", tour_manager: "tour_manager",
  agent: "agent", travelagent: "agent", travel_agent: "agent",
  driver: "driver", chauffeur: "driver",
  guide: "tour_guide", tourguide: "tour_guide", tour_guide: "tour_guide",
};

// Define normalizeRole; its parameters and body implement this operation.
export function normalizeRole(role) {
  // Check the condition (!role) and run the matching branch.
  if (!role) return "";
  // Check the condition (typeof role === "object") and run the matching branch.
  if (typeof role === "object") {
    // Perform the side effect or state update expressed on the following line.
    role = role.name || role.role || role.displayName || role.value || "";
  }
  // Declare key for use by the surrounding module or function.
  const key = String(role).trim().toLowerCase().replace(/[\s-]+/g, "_");
  // Return the expression shown below to the caller.
  return ROLE_ALIASES[key] || ROLE_ALIASES[key.replace(/_/g, "")] || key;
}

// Define getUserRole; its parameters and body implement this operation.
export function getUserRole(user) {
  // Return the result of normalizeRole() to the caller.
  return normalizeRole(
    user?.role?.name ||
    user?.role ||
    user?.legacyRole ||
    user?.roleId?.name ||
    user?.roleId?.role ||
    user?.userRole
  );
}

// Define isSuperAdmin; its parameters and body implement this operation.
export function isSuperAdmin(user) { return getUserRole(user) === "super_admin"; }
// Define isAdmin; its parameters and body implement this operation.
export function isAdmin(user) { return ["admin", "super_admin"].includes(getUserRole(user)); }
// Define isManager; its parameters and body implement this operation.
export function isManager(user) { return getUserRole(user) === "tour_manager"; }
// Define isAgent; its parameters and body implement this operation.
export function isAgent(user) { return getUserRole(user) === "agent"; }
// Define isGuide; its parameters and body implement this operation.
export function isGuide(user) { return getUserRole(user) === "tour_guide"; }
// Define isDriver; its parameters and body implement this operation.
export function isDriver(user) { return getUserRole(user) === "driver"; }
// Define isCustomer; its parameters and body implement this operation.
export function isCustomer(user) { return getUserRole(user) === "customer"; }

// Define dashboardPath; its parameters and body implement this operation.
export function dashboardPath(user) {
  // Select the appropriate branch based on getUserRole(user).
  switch (getUserRole(user)) {
    case "super_admin": return "/superadmin/dashboard";
    case "admin": return "/admin/dashboard";
    case "tour_manager": return "/tour-manager/dashboard";
    case "agent": return "/agent/dashboard";
    case "tour_guide": return "/guide/dashboard";
    case "driver": return "/driver/dashboard";
    case "customer": return "/dashboard";
    default: return "/login";
  }
}

export default normalizeRole;
