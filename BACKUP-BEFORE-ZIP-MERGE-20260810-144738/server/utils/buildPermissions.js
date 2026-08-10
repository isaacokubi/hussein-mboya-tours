/*
|--------------------------------------------------------------------------
| BUILD EFFECTIVE USER PERMISSIONS
|--------------------------------------------------------------------------
|
| Combines:
| - Role permissions
| - User permission overrides
|
| Removes duplicates
| Ignores invalid permissions
| Returns frontend-friendly permission objects
|--------------------------------------------------------------------------
*/

export default function buildPermissions(user) {
  if (!user) {
    return [];
  }

  const rolePermissions = Array.isArray(user.role?.permissions)
    ? user.role.permissions
    : Array.isArray(user.roleId?.permissions)
    ? user.roleId.permissions
    : [];

  const overrides = Array.isArray(user.permissionsOverride)
    ? user.permissionsOverride
    : [];

  const permissionMap = new Map();

  const addPermission = (permission) => {
    if (
      !permission ||
      typeof permission !== "object" ||
      !permission.name
    ) {
      return;
    }

    // Skip disabled permissions
    if (permission.enabled === false) {
      permissionMap.delete(permission.name);
      return;
    }

    permissionMap.set(permission.name, {
      name: permission.name,

      label: permission.label || permission.name,

      module: permission.module || null,

      icon: permission.icon || null,

      path: permission.path || null,
    });
  };

  rolePermissions.forEach(addPermission);

  overrides.forEach(addPermission);

  return [...permissionMap.values()].sort((a, b) =>
    a.label.localeCompare(b.label)
  );
}