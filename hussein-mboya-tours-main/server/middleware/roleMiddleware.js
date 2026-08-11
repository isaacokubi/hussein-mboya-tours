/**
 * server/middleware/roleMiddleware.js
 *
 * Centralized role authorization.
 */

const normalizeRole = (role) => {
    if (!role) {
        return "";
    }

    if (typeof role === "object") {
        role =
            role.name ||
            role.role ||
            role._id ||
            "";
    }

    return String(role)
        .trim()
        .toLowerCase()
        .replace(/[\s_-]+/g, "");
};

export const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Authentication required",
                });
            }

            const userRole =
                req.user.roleId?.name ||
                req.user.role ||
                req.user.legacyRole ||
                "";

            const normalizedUserRole =
                normalizeRole(userRole);

            const normalizedAllowedRoles =
                allowedRoles.map(normalizeRole);

            console.log("ROLE AUTH DEBUG:", {
                userId: req.user._id?.toString(),
                email: req.user.email,
                rawRole: userRole,
                normalizedRole: normalizedUserRole,
                allowedRoles: normalizedAllowedRoles,
            });

            if (
                !normalizedAllowedRoles.includes(
                    normalizedUserRole
                )
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "Access denied. Insufficient role.",
                    role: normalizedUserRole,
                });
            }

            next();
        } catch (error) {
            console.error(
                "ROLE MIDDLEWARE ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Role verification failed.",
            });
        }
    };
};

export const adminOnly =
    roleMiddleware(
        "admin",
        "super_admin",
        "superadmin",
        "administrator"
    );

export const managerOnly =
    roleMiddleware(
        "tour_manager",
        "tourmanager",
        "manager"
    );

export const agentOnly =
    roleMiddleware("agent");

export const guideOnly =
    roleMiddleware(
        "tour_guide",
        "tourguide",
        "guide"
    );

export const customerOnly =
    roleMiddleware("customer");

export default roleMiddleware;
