import jwt from "jsonwebtoken";
import User from "../models/User.js";
import env from "../config/env.js";
import { normalizeRole, getUserRole } from "../utils/roleUtils.js";

export { normalizeRole, getUserRole };

const ADMIN_BASE_PERMISSIONS = new Set([
  "admin.dashboard", "user.manage", "staff.manage", "tour.manage",
  "booking.manage", "payment.manage", "refund.manage", "analytics.view",
  "settings.manage", "roles.manage", "notifications.view", "finance.view",
  "customer.view", "tour.view", "tour.create", "tour.update", "booking.view",
  "report.view", "guide.view", "vehicle.view",
]);

export const protect = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) token = authHeader.substring(7).trim();
    if (!token && req.cookies?.token) token = req.cookies.token;
    if (!token) return res.status(401).json({ success: false, message: "Authentication required." });

    const secret = env.JWT_SECRET || process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ success: false, message: "Authentication configuration error." });

    const decoded = jwt.verify(token, secret, {
      issuer: "husseinmboyatours",
      audience: "husseinmboyatours-client",
    });
    const userId = decoded.sub || decoded.id || decoded._id || decoded.userId;
    if (!userId) return res.status(401).json({ success: false, message: "Invalid authentication token." });

    const user = await User.findById(userId)
      .select("-password")
      .populate({ path: "roleId", populate: { path: "permissions" } })
      .populate("permissionsOverride");
    if (!user) return res.status(401).json({ success: false, message: "User no longer exists." });
    if (user.status !== "active" || user.isActive === false) return res.status(403).json({ success: false, message: "Account is inactive." });

    req.user = user;
    req.userRole = getUserRole(user);
    next();
  } catch (error) {
    console.error("AUTH ERROR:", error.message);
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};

export const requireRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: "Authentication required." });
  const role = getUserRole(req.user);
  const allowed = allowedRoles.flat().map(normalizeRole);
  if (!allowed.includes(role)) return res.status(403).json({ success: false, message: "You do not have access to this resource." });
  next();
};

export const adminOnly = requireRoles("admin", "superadmin");
export const superAdminOnly = requireRoles("superadmin");
export const managerOnly = requireRoles("manager", "admin", "superadmin");
export const agentOnly = requireRoles("agent", "admin", "superadmin");
export const driverOnly = requireRoles("driver", "admin", "superadmin");
export const guideOnly = requireRoles("guide", "admin", "superadmin");
export const customerOnly = requireRoles("customer");

export const checkPermission = (permissionName) => (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Authentication required." });

    const role = getUserRole(req.user);
    if (role === "superadmin") return next();

    // System Admin access must remain functional even if its Role document or
    // permission references were deleted while replacing users.
    const wanted = String(permissionName || "").trim().toLowerCase();
    if (role === "admin" && ADMIN_BASE_PERMISSIONS.has(wanted)) return next();

    const permissions = [
      ...(req.user.roleId?.permissions || []),
      ...(req.user.permissionsOverride || []),
    ];
    const hasPermission = permissions.some((permission) => {
      const name = typeof permission === "object" ? permission.name : permission;
      return String(name || "").trim().toLowerCase() === wanted && permission?.enabled !== false;
    });
    if (!hasPermission) return res.status(403).json({ success: false, message: "You do not have permission to perform this action." });
    next();
  } catch (error) {
    console.error("PERMISSION CHECK ERROR:", error);
    return res.status(500).json({ success: false, message: "Permission verification failed." });
  }
};
