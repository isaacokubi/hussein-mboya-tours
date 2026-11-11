/**
 * Purpose: role Utils server application module. Main declarations: normalizeRole, getUserRole, isSuperAdmin, isAdmin, isManager.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
const ROLE_ALIASES = {
  customer: "customer",
  user: "customer",

  admin: "admin",
  administrator: "admin",

  superadmin: "super_admin",
  super_admin: "super_admin",

  manager: "tour_manager",
  tourmanager: "tour_manager",
  tour_manager: "tour_manager",

  agent: "agent",
  travelagent: "agent",
  travel_agent: "agent",

  guide: "tour_guide",
  tourguide: "tour_guide",
  tour_guide: "tour_guide",

  driver: "driver",
};

// Define normalizeRole; its parameters and body implement this operation.
export function normalizeRole(role) {
  // Check the condition (!role) and run the matching branch.
  if (!role) return "";

  // Check the condition (typeof role === "object") and run the matching branch.
  if (typeof role === "object") {
    // Perform the side effect or state update expressed on the following line.
    role =
      role.name ||
      role.displayName ||
      role.role ||
      role.value ||
      "";
  }

  // Declare key for use by the surrounding module or function.
  const key = String(role)
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  // Return the expression shown below to the caller.
  return (
    ROLE_ALIASES[key] ||
    ROLE_ALIASES[key.replace(/_/g, "")] ||
    key
  );
}

// Define getUserRole; its parameters and body implement this operation.
export function getUserRole(user) {
  // Return the result of normalizeRole() to the caller.
  return normalizeRole(
    user?.roleId?.name ||
      user?.role?.name ||
      user?.legacyRole ||
      user?.userRole
  );
}

// Define isSuperAdmin; its parameters and body implement this operation.
export function isSuperAdmin(user) {
  // Return the expression shown below to the caller.
  return getUserRole(user) === "super_admin";
}

// Define isAdmin; its parameters and body implement this operation.
export function isAdmin(user) {
  // Return the result of ["admin", "super_admin"].includes() to the caller.
  return ["admin", "super_admin"].includes(getUserRole(user));
}

// Define isManager; its parameters and body implement this operation.
export function isManager(user) {
  // Return the result of ["tour_manager", "admin", "super_admin"].includes() to the caller.
  return ["tour_manager", "admin", "super_admin"].includes(getUserRole(user));
}

// Define isAgent; its parameters and body implement this operation.
export function isAgent(user) {
  // Return the result of ["agent", "admin", "super_admin"].includes() to the caller.
  return ["agent", "admin", "super_admin"].includes(getUserRole(user));
}

// Define isGuide; its parameters and body implement this operation.
export function isGuide(user) {
  // Return the result of ["tour_guide", "admin", "super_admin"].includes() to the caller.
  return ["tour_guide", "admin", "super_admin"].includes(getUserRole(user));
}

// Define isDriver; its parameters and body implement this operation.
export function isDriver(user) {
  // Return the result of ["driver", "admin", "super_admin"].includes() to the caller.
  return ["driver", "admin", "super_admin"].includes(getUserRole(user));
}

// Define isCustomer; its parameters and body implement this operation.
export function isCustomer(user) {
  // Return the expression shown below to the caller.
  return getUserRole(user) === "customer";
}

// Define isStaff; its parameters and body implement this operation.
export function isStaff(user) {
  // Return the result of [     "admin",     "super_admin",     "tour_manager",     "agent",     "tour_guide",     "driver",   ].includes() to the caller.
  return [
    "admin",
    "super_admin",
    "tour_manager",
    "agent",
    "tour_guide",
    "driver",
  ].includes(getUserRole(user));
}

export default normalizeRole;
