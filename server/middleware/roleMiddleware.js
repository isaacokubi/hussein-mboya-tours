import { requireRoles } from "./authMiddleware.js";

// Canonical role middleware.
// All role aliases are normalized by authMiddleware -> roleUtils, and the
// privileged-role semantics therefore remain identical across the application.
export const roleMiddleware = (...allowedRoles) => requireRoles(...allowedRoles);

export const adminOnly = roleMiddleware("admin", "super_admin");
export const managerOnly = roleMiddleware("manager", "admin", "super_admin");
export const agentOnly = roleMiddleware("agent", "admin", "super_admin");
export const guideOnly = roleMiddleware("guide", "admin", "super_admin");
export const driverOnly = roleMiddleware("driver", "admin", "super_admin");
export const customerOnly = roleMiddleware("customer");

export const authorizeRole = roleMiddleware;
export const authorizeRoles = roleMiddleware;

export default roleMiddleware;
