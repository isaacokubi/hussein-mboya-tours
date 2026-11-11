/**
 * Purpose: build Permissions server application module. Main declarations: normalizeRole, buildPermissions, addPermission.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
const ADMIN_BASE_PERMISSIONS = ["admin.dashboard", "user.manage", "staff.manage", "tour.manage", "booking.manage", "payment.manage", "refund.manage", "analytics.view", "settings.manage", "roles.manage", "notifications.view", "finance.view", "customer.view", "manage_customers", "tour.view", "tour.create", "tour.update", "booking.view", "report.view", "guide.view", "vehicle.view"];
// Declare normalizeRole for use by the surrounding module or function.
const normalizeRole = (value) => { const raw = typeof value === "object" ? value?.name || value?.role : value; return String(raw || "").trim().toLowerCase().replace(/[\s-]+/g, "_"); };

/* Admin/SuperAdmin access must survive Role document deletion/recreation. */
// Define buildPermissions; its parameters and body implement this operation.
export default function buildPermissions(user) {
  // Check the condition (!user) and run the matching branch.
  if (!user) return [];
  // Declare rolePermissions for use by the surrounding module or function.
  const rolePermissions = Array.isArray(user.role?.permissions) ? user.role.permissions : Array.isArray(user.roleId?.permissions) ? user.roleId.permissions : [];
  // Declare overrides for use by the surrounding module or function.
  const overrides = Array.isArray(user.permissionsOverride) ? user.permissionsOverride : [];
  // Declare effectiveRole for use by the surrounding module or function.
  const effectiveRole = normalizeRole(user.role) || normalizeRole(user.roleId) || normalizeRole(user.legacyRole);
  // Declare permissionMap for use by the surrounding module or function.
  const permissionMap = new Map();
  // Declare addPermission for use by the surrounding module or function.
  const addPermission = (permission) => {
    // Check the condition (!permission) and run the matching branch.
    if (!permission) return;
    // Check the condition (typeof permission === "string") and run the matching branch.
    if (typeof permission === "string") { permissionMap.set(permission, { name: permission, label: permission, module: null, icon: null, path: null }); return; }
    // Check the condition (!permission.name) and run the matching branch.
    if (!permission.name) return;
    // Check the condition (permission.enabled === false) and run the matching branch.
    if (permission.enabled === false) { permissionMap.delete(permission.name); return; }
    // Perform the side effect or state update expressed on the following line.
    permissionMap.set(permission.name, { name: permission.name, label: permission.label || permission.name, module: permission.module || null, icon: permission.icon || null, path: permission.path || null });
  };
  // Check the condition (["admin", "administrator", "super_admin", "superadmin"].includes(effec) and run the matching branch.
  if (["admin", "administrator", "super_admin", "superadmin"].includes(effectiveRole)) ADMIN_BASE_PERMISSIONS.forEach(addPermission);
  // Perform the side effect or state update expressed on the following line.
  rolePermissions.forEach(addPermission);
  // Perform the side effect or state update expressed on the following line.
  overrides.forEach(addPermission);
  // Return the result of [...permissionMap.values()].sort() to the caller.
  return [...permissionMap.values()].sort((a, b) => a.label.localeCompare(b.label));
}
