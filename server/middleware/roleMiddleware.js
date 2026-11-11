/**
 * Purpose: role Middleware request middleware. Main declarations: roleMiddleware.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { requireRoles } from "./authMiddleware.js";

// Canonical role middleware.
// All role aliases are normalized by authMiddleware -> roleUtils, and the
// privileged-role semantics therefore remain identical across the application.
// Declare roleMiddleware for use by the surrounding module or function.
export const roleMiddleware = (...allowedRoles) => requireRoles(...allowedRoles);

// Declare adminOnly for use by the surrounding module or function.
export const adminOnly = roleMiddleware("admin", "super_admin");
// Declare managerOnly for use by the surrounding module or function.
export const managerOnly = roleMiddleware("manager", "admin", "super_admin");
// Declare agentOnly for use by the surrounding module or function.
export const agentOnly = roleMiddleware("agent", "admin", "super_admin");
// Declare guideOnly for use by the surrounding module or function.
export const guideOnly = roleMiddleware("guide", "admin", "super_admin");
// Declare driverOnly for use by the surrounding module or function.
export const driverOnly = roleMiddleware("driver", "admin", "super_admin");
// Declare customerOnly for use by the surrounding module or function.
export const customerOnly = roleMiddleware("customer");

// Declare authorizeRole for use by the surrounding module or function.
export const authorizeRole = roleMiddleware;
// Declare authorizeRoles for use by the surrounding module or function.
export const authorizeRoles = roleMiddleware;

export default roleMiddleware;
