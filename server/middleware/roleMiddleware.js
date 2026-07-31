// server/middleware/roleMiddleware.js

/*
|--------------------------------------------------------------------------
| ROLE AUTHORIZATION MIDDLEWARE
|--------------------------------------------------------------------------
|
| Usage:
|
| router.get(
|     "/admin",
|     protect,
|     roleMiddleware("admin"),
|     controller
| );
|
| router.post(
|     "/manager",
|     protect,
|     roleMiddleware("tour_manager"),
|     controller
| );
|
|--------------------------------------------------------------------------
*/

export const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
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
            | GET USER ROLE
            |--------------------------------------------------------------------------
            |
            | Supports both:
            | - Legacy string role
            | - New RBAC role document
            |
            |--------------------------------------------------------------------------
            */

            const userRole =
                req.user.roleId?.name ||
                req.user.role ||
                "";

            /*
            |--------------------------------------------------------------------------
            | CHECK ROLE
            |--------------------------------------------------------------------------
            */

            const normalizedRole = userRole.toLowerCase();

            const normalizedAllowed = allowedRoles.map((role) =>
                role.toLowerCase()
            );

            if (!normalizedAllowed.includes(normalizedRole)) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. Insufficient role.",
                });
            }

            next();
        } catch (error) {
            console.error("ROLE MIDDLEWARE ERROR:", error);

            return res.status(500).json({
                success: false,
                message: "Role verification failed.",
            });
        }
    };
};

/*
|--------------------------------------------------------------------------
| ROLE ALIASES
|--------------------------------------------------------------------------
*/

export const adminOnly = roleMiddleware("admin");

export const managerOnly = roleMiddleware("tour_manager");

export const agentOnly = roleMiddleware("travel_agent");

export const guideOnly = roleMiddleware("guide");

export const customerOnly = roleMiddleware("customer");

export default roleMiddleware;