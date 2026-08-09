// server/middleware/permissionMiddleware.js

/*
|--------------------------------------------------------------------------
| PERMISSION AUTHORIZATION MIDDLEWARE
|--------------------------------------------------------------------------
|
| Usage:
|
| router.get(
|     "/reports",
|     protect,
|     authorize("view_reports"),
|     controller
| );
|
|--------------------------------------------------------------------------
*/

const normalizePermission = (permission) =>
    String(permission || "")
        .trim()
        .toLowerCase();

export const authorize = (...requiredPermissions) => {
    return async (req, res, next) => {
        try {
            /*
            |--------------------------------------------------------------------------
            | AUTHENTICATION
            |--------------------------------------------------------------------------
            */

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Authentication required",
                });
            }

            /*
            |--------------------------------------------------------------------------
            | ROLE PERMISSIONS
            |--------------------------------------------------------------------------
            */

            const rolePermissions =
                req.user.roleId?.permissions || [];

            /*
            |--------------------------------------------------------------------------
            | USER OVERRIDE PERMISSIONS
            |--------------------------------------------------------------------------
            */

            const overridePermissions =
                req.user.permissionsOverride || [];

            /*
            |--------------------------------------------------------------------------
            | MERGE PERMISSIONS
            |--------------------------------------------------------------------------
            */

            const permissionMap = new Map();

            [...rolePermissions, ...overridePermissions].forEach((permission) => {
                const name =
                    typeof permission === "string"
                        ? permission
                        : permission?.name;

                if (name) {
                    permissionMap.set(normalizePermission(name), permission);
                }
            });

            const userPermissions = [...permissionMap.keys()];

            /*
            |--------------------------------------------------------------------------
            | CHECK REQUIRED PERMISSIONS
            |--------------------------------------------------------------------------
            */

            const normalizedRequired = requiredPermissions.map(normalizePermission);

            const hasPermission = normalizedRequired.every((permission) =>
                userPermissions.includes(permission)
            );

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. Missing required permission.",
                    missingPermissions: normalizedRequired.filter(
                        (permission) => !userPermissions.includes(permission)
                    ),
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

/*
|--------------------------------------------------------------------------
| SINGLE PERMISSION ALIAS
|--------------------------------------------------------------------------
*/

export const permissionMiddleware = (permission) =>
    authorize(permission);

export default authorize;