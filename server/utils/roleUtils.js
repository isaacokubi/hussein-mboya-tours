const ROLE_ALIASES = {
  customer: "customer",
  user: "customer",
  admin: "admin",
  administrator: "admin",
  superadmin: "superadmin",
  super_admin: "superadmin",
  manager: "manager",
  tourmanager: "manager",
  tour_manager: "manager",
  agent: "agent",
  travelagent: "agent",
  travel_agent: "agent",
  driver: "driver",
  guide: "guide",
  tourguide: "guide",
  tour_guide: "guide",
};

export function normalizeRole(role) {
  if (!role) return "";

  if (typeof role === "object") {
    role = role.name || role.displayName || role.role || role._id || "";
  }

  const key = String(role)
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  return ROLE_ALIASES[key] || ROLE_ALIASES[key.replace(/_/g, "")] || key;
}

export function getUserRole(user) {
  return normalizeRole(
    user?.roleId?.name ||
    user?.role?.name ||
    user?.role ||
    user?.legacyRole
  );
}

export function isSuperAdmin(user) {
  return getUserRole(user) === "superadmin";
}

export function isAdmin(user) {
  return ["admin", "superadmin"].includes(getUserRole(user));
}

export function isStaff(user) {
  return ["admin", "superadmin", "manager", "agent", "driver", "guide"].includes(
    getUserRole(user)
  );
}

export default normalizeRole;
