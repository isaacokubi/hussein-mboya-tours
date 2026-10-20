// Define permissions that administrators retain even if a Role record is missing.
const ADMIN_BASE_PERMISSIONS = ["admin.dashboard", "user.manage", "staff.manage", "tour.manage", "booking.manage", "payment.manage", "refund.manage", "analytics.view", "settings.manage", "roles.manage", "notifications.view", "finance.view", "customer.view", "manage_customers", "tour.view", "tour.create", "tour.update", "booking.view", "report.view", "guide.view", "vehicle.view"];
// Normalize string or object role values into the same canonical comparison format.
const normalizeRole = (value) => {
  // For role objects, prefer the role name and then the generic role field.
  const raw = typeof value === "object" ? value?.name || value?.role : value;
  // Return a trimmed, lowercase role label with whitespace and hyphens replaced by underscores.
  return String(raw || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
};

/* Admin/SuperAdmin access must survive Role document deletion/recreation. */
// Build the effective permission list for a user from role defaults and explicit overrides.
export default function buildPermissions(user) {
  // A missing user cannot be granted any permissions.
  if (!user) return [];
  // Prefer populated role permissions, falling back to permissions stored on roleId.
  const rolePermissions = Array.isArray(user.role?.permissions) ? user.role.permissions : Array.isArray(user.roleId?.permissions) ? user.roleId.permissions : [];
  // Read per-user permission overrides only when they are stored as an array.
  const overrides = Array.isArray(user.permissionsOverride) ? user.permissionsOverride : [];
  // Determine the effective role from the populated role, roleId or legacy role fields.
  const effectiveRole = normalizeRole(user.role) || normalizeRole(user.roleId) || normalizeRole(user.legacyRole);
  // Use a map keyed by permission name to merge duplicates and apply overrides.
  const permissionMap = new Map();
  // Add one permission while normalizing strings and object-based permission records.
  const addPermission = (permission) => {
    // Ignore empty or missing permission entries.
    if (!permission) return;
    // Convert a simple permission string into the standard permission object shape.
    if (typeof permission === "string") { permissionMap.set(permission, { name: permission, label: permission, module: null, icon: null, path: null }); return; }
    // Ignore object permissions without a stable name.
    if (!permission.name) return;
    // An explicit disabled override removes that permission from the merged result.
    if (permission.enabled === false) { permissionMap.delete(permission.name); return; }
    // Store the permission's known display/navigation fields, using safe defaults for absent values.
    permissionMap.set(permission.name, { name: permission.name, label: permission.label || permission.name, module: permission.module || null, icon: permission.icon || null, path: permission.path || null });
  };
  // Add the baseline permission set for administrator role aliases.
  if (["admin", "administrator", "super_admin", "superadmin"].includes(effectiveRole)) ADMIN_BASE_PERMISSIONS.forEach(addPermission);
  // Merge permissions assigned to the user's role.
  rolePermissions.forEach(addPermission);
  // Apply per-user overrides last so explicit user settings take precedence.
  overrides.forEach(addPermission);
  // Return unique permissions sorted by their user-facing label.
  return [...permissionMap.values()].sort((a, b) => a.label.localeCompare(b.label));
}
