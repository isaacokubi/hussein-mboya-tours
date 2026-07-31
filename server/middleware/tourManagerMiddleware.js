// server/middleware/tourManagerMiddleware.js

/*
|--------------------------------------------------------------------------
| TOUR MANAGER AUTHORIZATION
|--------------------------------------------------------------------------
|
| Usage:
|
| router.get(
|     "/dashboard",
|     protect,
|     tourManagerOnly,
|     controller
| );
|
|--------------------------------------------------------------------------
*/

const tourManagerOnly = (req, res, next) => {
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

        const role =
            req.user.roleId?.name ||
            req.user.role ||
            "";

        if (role.toLowerCase() !== "tour_manager") {
            return res.status(403).json({
                success: false,
                message: "Tour Manager access required",
            });
        }

        next();
    } catch (error) {
        console.error("TOUR MANAGER MIDDLEWARE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Authorization failed",
        });
    }
};

export default tourManagerOnly;