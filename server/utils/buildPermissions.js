const ADMIN_BASE_PERMISSIONS = ["admin.dashboard", "user.manage", "staff.manage", "tour.manage", "booking.manage", "payment.manage", "refund.manage", "analytics.view", "settings.manage", "roles.manage", "notifications.view", "finance.view", "customer.view", "manage_customers", "tour.view", "tour.create", "tour.update", "booking.view", "report.view", "guide.view", "vehicle.view"];
const normalizeRole = (value) => { const raw = typeof value === "object" ? value?.name || value?.role : value; return String(raw || "").trim().toLowerCase().replace(/[\s-]+/g, "_"); };

/* Admin/SuperAdmin access must survive Role document deletion/recreation. */
export default function buildPermissions(user) {
  if (!user) return [];
  const rolePermissions = Array.isArray(user.role?.permissions) ? user.role.permissions : Array.isArray(user.roleId?.permissions) ? user.roleId.permissions : [];
  const overrides = Array.isArray(user.permissionsOverride) ? user.permissionsOverride : [];
  const effectiveRole = normalizeRole(user.role) || normalizeRole(user.roleId) || normalizeRole(user.legacyRole);
  const permissionMap = new Map();
  const addPermission = (permission) => {
    if (!permission) return;
    if (typeof permission === "string") { permissionMap.set(permission, { name: permission, label: permission, module: null, icon: null, path: null }); return; }
    if (!permission.name) return;
    if (permission.enabled === false) { permissionMap.delete(permission.name); return; }
    permissionMap.set(permission.name, { name: permission.name, label: permission.label || permission.name, module: permission.module || null, icon: permission.icon || null, path: permission.path || null });
  };
  if (["admin", "administrator", "super_admin", "super_admin"].includes(effectiveRole)) ADMIN_BASE_PERMISSIONS.forEach(addPermission);
  rolePermissions.forEach(addPermission);
  overrides.forEach(addPermission);
  return [...permissionMap.values()].sort((a, b) => a.label.localeCompare(b.label));
}
