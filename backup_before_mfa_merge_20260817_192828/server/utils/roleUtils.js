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

  guide: "guide",
  tourguide: "guide",
  tour_guide: "guide",

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
      user?.role ||
      user?.legacyRole ||
      user?.userRole
  );
}

export function isSuperAdmin(user) {
  return getUserRole(user) === "superadmin";
}

export function isAdmin(user) {
  return ["admin", "superadmin"].includes(getUserRole(user));
}

export function isManager(user) {
  return ["manager", "admin", "superadmin"].includes(getUserRole(user));
}

export function isAgent(user) {
  return ["agent", "admin", "superadmin"].includes(getUserRole(user));
}

export function isGuide(user) {
  return ["guide", "admin", "superadmin"].includes(getUserRole(user));
}

export function isDriver(user) {
  return ["driver", "admin", "superadmin"].includes(getUserRole(user));
}

export function isCustomer(user) {
  return getUserRole(user) === "customer";
}

export function isStaff(user) {
  return [
    "admin",
    "superadmin",
    "manager",
    "agent",
    "guide",
    "driver",
  ].includes(getUserRole(user));
}

export default normalizeRole;
