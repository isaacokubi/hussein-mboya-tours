const ROLE_ALIASES = {
  customer: "customer", user: "customer",
  admin: "admin", administrator: "admin",
  superadmin: "superadmin", super_admin: "superadmin",
  manager: "manager", tourmanager: "manager", tour_manager: "manager",
  agent: "agent", travelagent: "agent", travel_agent: "agent",
  driver: "driver",
  guide: "guide", tourguide: "guide", tour_guide: "guide",
};

export function normalizeRole(role) {
  if (!role) return "";
  if (typeof role === "object") {
    role = role.name || role.role || role.displayName || role.value || "";
  }
  const key = String(role).trim().toLowerCase().replace(/[\s-]+/g, "_");
  return ROLE_ALIASES[key] || ROLE_ALIASES[key.replace(/_/g, "")] || key;
}

// Client and server use the same precedence: a populated durable Role record
// is authoritative, with legacy string fields retained only as fallbacks.
// This prevents dashboard routing and authorization from disagreeing when a
// user's legacy role string and roleId point at different roles.
export function getUserRole(user) {
  return normalizeRole(
    user?.roleId?.name ||
    user?.roleId?.role ||
    user?.role?.name ||
    user?.role ||
    user?.legacyRole ||
    user?.userRole
  );
}

export function isSuperAdmin(user) { return getUserRole(user) === "superadmin"; }
export function isAdmin(user) { return ["admin", "superadmin"].includes(getUserRole(user)); }
export function isManager(user) { return ["manager", "admin", "superadmin"].includes(getUserRole(user)); }
export function isAgent(user) { return getUserRole(user) === "agent"; }
export function isGuide(user) { return getUserRole(user) === "guide"; }
export function isDriver(user) { return getUserRole(user) === "driver"; }
export function isCustomer(user) { return getUserRole(user) === "customer"; }

export function dashboardPath(user) {
  switch (getUserRole(user)) {
    case "superadmin": return "/superadmin/dashboard";
    case "admin": return "/admin/dashboard";
    case "manager": return "/tour-manager/dashboard";
    case "agent": return "/agent/dashboard";
    case "guide": return "/guide/dashboard";
    case "driver": return "/driver/dashboard";
    case "customer": return "/dashboard";
    default: return "/login";
  }
}

export default normalizeRole;
