// Map legacy, display and compact role labels to the canonical authorization names.
const ROLE_ALIASES = {
  customer: "customer", // Keep the customer role unchanged.
  user: "customer", // Treat the older generic user role as a customer.

  admin: "admin", // Canonical administrator role.
  administrator: "admin", // Normalize the longer administrator label.

  superadmin: "super_admin", // Normalize the legacy spelling to the canonical platform role.
  super_admin: "super_admin", // Keep the canonical platform role unchanged.

  manager: "tour_manager", // Map a generic manager label to tour manager.
  tourmanager: "tour_manager", // Accept the compact spelling.
  tour_manager: "tour_manager", // Keep the canonical tour-manager label unchanged.

  agent: "agent", // Canonical travel-agent role.
  travelagent: "agent", // Accept the compact travel-agent spelling.
  travel_agent: "agent", // Accept the underscored travel-agent spelling.

  guide: "tour_guide", // Map a generic guide label to tour guide.
  tourguide: "tour_guide", // Accept the compact tour-guide spelling.
  tour_guide: "tour_guide", // Keep the canonical tour-guide label unchanged.

  driver: "driver", // Canonical driver role.
};

// Normalize any supported role value into one consistent string.
export function normalizeRole(role) {
  // Return an empty role when no role was supplied.
  if (!role) return "";

  // Role data may be a populated database object rather than a string.
  if (typeof role === "object") {
    // Extract the first recognized name-like property from that object.
    role =
      role.name ||
      role.displayName ||
      role.role ||
      role.value ||
      "";
  }

  // Convert the input to lowercase text, trim whitespace and standardize separators.
  const key = String(role)
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  // Prefer an explicit alias, then try the same role without underscores, then preserve unknown roles.
  return (
    ROLE_ALIASES[key] ||
    ROLE_ALIASES[key.replace(/_/g, "")] ||
    key
  );
}

// Read a user's role from the supported current and legacy user fields.
export function getUserRole(user) {
  // Normalize the first populated role field so callers use the same role vocabulary.
  return normalizeRole(
    user?.roleId?.name ||
      user?.role?.name ||
      user?.legacyRole ||
      user?.userRole
  );
}

// Report whether the user has the platform-level super-administrator role.
export function isSuperAdmin(user) {
  // Compare only after normalization so legacy spellings work too.
  return getUserRole(user) === "super_admin";
}

// Report whether the user is an administrator or platform administrator.
export function isAdmin(user) {
  // Either canonical admin role qualifies for this helper.
  return ["admin", "super_admin"].includes(getUserRole(user));
}

// Report whether the user can act as a tour manager or administrator.
export function isManager(user) {
  // Administrative roles inherit the manager-level classification.
  return ["tour_manager", "admin", "super_admin"].includes(getUserRole(user));
}

// Report whether the user can act as an agent or administrator.
export function isAgent(user) {
  // Administrative roles inherit the agent-level classification.
  return ["agent", "admin", "super_admin"].includes(getUserRole(user));
}

// Report whether the user can act as a guide or administrator.
export function isGuide(user) {
  // Administrative roles inherit the guide-level classification.
  return ["tour_guide", "admin", "super_admin"].includes(getUserRole(user));
}

// Report whether the user can act as a driver or administrator.
export function isDriver(user) {
  // Administrative roles inherit the driver-level classification.
  return ["driver", "admin", "super_admin"].includes(getUserRole(user));
}

// Report whether the user's normalized role is customer.
export function isCustomer(user) {
  // Customer is a distinct role and does not include staff roles.
  return getUserRole(user) === "customer";
}

// Report whether the user belongs to the staff role family.
export function isStaff(user) {
  // List staff roles explicitly so customer accounts are not treated as staff.
  return [
    "admin", // Administrator staff.
    "super_admin", // Platform-level administrator staff.
    "tour_manager", // Tour management staff.
    "agent", // Booking/sales agent staff.
    "tour_guide", // Tour guide staff.
    "driver", // Driver staff.
  ].includes(getUserRole(user)); // Return true only when the normalized role is in this list.
}

// Export the normalizer as the default import for existing callers.
export default normalizeRole;
