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

export function normalizeRole(role) {
  if (!role) return "";

  if (typeof role === "object") {
    role =
      role.name ||
      role.displayName ||
      role.role ||
      role.value ||
      "";
  }

  const key = String(role)
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  return (
    ROLE_ALIASES[key] ||
    ROLE_ALIASES[key.replace(/_/g, "")] ||
    key
  );
}

export function getUserRole(user) {
  return normalizeRole(
    user?.roleId?.name ||
      user?.role?.name ||
      user?.legacyRole ||
      user?.userRole
  );
}

export function isSuperAdmin(user) {
  return getUserRole(user) === "super_admin";
}

export function isAdmin(user) {
  return ["admin", "super_admin"].includes(getUserRole(user));
}

export function isManager(user) {
  return ["tour_manager", "admin", "super_admin"].includes(getUserRole(user));
}

export function isAgent(user) {
  return ["agent", "admin", "super_admin"].includes(getUserRole(user));
}

export function isGuide(user) {
  return ["tour_guide", "admin", "super_admin"].includes(getUserRole(user));
}

export function isDriver(user) {
  return ["driver", "admin", "super_admin"].includes(getUserRole(user));
}

export function isCustomer(user) {
  return getUserRole(user) === "customer";
}

export function isStaff(user) {
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
