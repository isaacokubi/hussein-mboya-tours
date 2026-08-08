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
                if (permission?.name) {
                    permissionMap.set(permission.name, permission);
                }
            });

            const userPermissions = [...permissionMap.keys()];

            /*
            |--------------------------------------------------------------------------
            | CHECK REQUIRED PERMISSIONS
            |--------------------------------------------------------------------------
            */

            const hasPermission = requiredPermissions.every((permission) =>
                userPermissions.includes(permission)
            );

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. Missing required permission.",
                    missingPermissions: requiredPermissions.filter(
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