const ROLE_ALIASES = {
  customer: "customer", user: "customer",
  admin: "admin", administrator: "admin",
  superadmin: "super_admin", super_admin: "super_admin",
  manager: "tour_manager", tourmanager: "tour_manager", tour_manager: "tour_manager",
  agent: "agent", travelagent: "agent", travel_agent: "agent",
  driver: "driver", chauffeur: "driver",
  guide: "tour_guide", tourguide: "tour_guide", tour_guide: "tour_guide",
};

export function normalizeRole(role) {
  if (!role) return "";
  if (typeof role === "object") {
    role = role.name || role.role || role.displayName || role.value || "";
  }
  const key = String(role).trim().toLowerCase().replace(/[\s-]+/g, "_");
  return ROLE_ALIASES[key] || ROLE_ALIASES[key.replace(/_/g, "")] || key;
}

export function getUserRole(user) {
  return normalizeRole(
    user?.role?.name ||
    user?.role ||
    user?.legacyRole ||
    user?.roleId?.name ||
    user?.roleId?.role ||
    user?.userRole
  );
}

export function isSuperAdmin(user) { return getUserRole(user) === "super_admin"; }
export function isAdmin(user) { return ["admin", "super_admin"].includes(getUserRole(user)); }
export function isManager(user) { return getUserRole(user) === "tour_manager"; }
export function isAgent(user) { return getUserRole(user) === "agent"; }
export function isGuide(user) { return getUserRole(user) === "tour_guide"; }
export function isDriver(user) { return getUserRole(user) === "driver"; }
export function isCustomer(user) { return getUserRole(user) === "customer"; }

export function dashboardPath(user) {
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
