// server/middleware/permissionMiddleware.js

const normalizePermission = (permission) =>
  String(permission || "")
    .trim()
    .toLowerCase();

const normalizeRole = (role) => {
  if (!role) return "";

  if (typeof role === "object") {
    role = role.name || role.role || "";
  }

  return String(role)
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
};

const isSuperAdmin = (user) => {
  const roleName = normalizeRole(
    user?.roleId?.name ||
    user?.role ||
    user?.legacyRole
  );

  return roleName === "superadmin";
};

export const authorize = (...requiredPermissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      /*
       * Super Admin has unrestricted access.
       */
      if (isSuperAdmin(req.user)) {
        return next();
      }

      /*
       * Role permissions.
       */
      const rolePermissions =
        req.user.roleId?.permissions || [];

      /*
       * User-specific permission overrides.
       */
      const overridePermissions =
        req.user.permissionsOverride || [];

      /*
       * Merge permissions.
       */
      const permissionMap = new Map();

      [...rolePermissions, ...overridePermissions].forEach((permission) => {
        const name =
          typeof permission === "string"
            ? permission
            : permission?.name;

        if (name) {
          permissionMap.set(
            normalizePermission(name),
            permission
          );
        }
      });

      const userPermissions = [...permissionMap.keys()];

      /*
       * No permission supplied.
       */
      if (!requiredPermissions.length) {
        return next();
      }

      const normalizedRequired =
        requiredPermissions.map(normalizePermission);

      /*
       * All requested permissions are required.
       */
      const missingPermissions =
        normalizedRequired.filter(
          (permission) =>
            !userPermissions.includes(permission)
        );

      if (missingPermissions.length) {
        return res.status(403).json({
          success: false,
          message:
            "Access denied. Missing required permission.",
          missingPermissions,
        });
      }

      next();
    } catch (error) {
      console.error("PERMISSION ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Permission verification failed.",
      });
    }
  };
};

export const permissionMiddleware = (permission) =>
  authorize(permission);

export default authorize;
