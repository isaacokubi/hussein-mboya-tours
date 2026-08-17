import { getUserRole, normalizeRole } from "../utils/roleUtils.js";

export const roleMiddleware = (...allowedRoles) => (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const userRole = getUserRole(req.user);
    const allowed = allowedRoles.flat().map(normalizeRole);

    // Platform SuperAdmin can administer every role-scoped operational module.
    if (userRole === "superadmin") return next();

    if (!allowed.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient role.",
        role: userRole,
        allowedRoles: [...new Set(allowed)],
      });
    }

    req.userRole = userRole;
    next();
  } catch (error) {
    console.error("ROLE MIDDLEWARE ERROR:", error);
    return res.status(500).json({ success: false, message: "Role verification failed." });
  }
};

export const adminOnly = roleMiddleware("admin", "administrator");
export const managerOnly = roleMiddleware("manager", "tour_manager", "tourmanager");
export const agentOnly = roleMiddleware("agent", "travel_agent", "travelagent");
export const guideOnly = roleMiddleware("guide", "tour_guide", "tourguide");
export const driverOnly = roleMiddleware("driver");
export const customerOnly = roleMiddleware("customer", "user");

export default roleMiddleware;
