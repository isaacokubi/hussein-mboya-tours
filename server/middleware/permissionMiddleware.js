import Role from "../models/Role.js";
import { getUserRole } from "../utils/roleUtils.js";

const ADMIN_COMPATIBILITY_PERMISSIONS = [
  "admin.dashboard", "roles.manage", "system.audit", "system.security",
  "manage_customers", "manage_destinations", "manage_tours", "manage_bookings",
  "manage_staff", "manage_users", "manage_agents", "manage_guides", "manage_vehicles",
  "booking.manage", "payment.manage", "report.view", "analytics.view",
  "commission.view", "commission.manage", "commission.approve", "commission.pay",
  "coupon.manage", "coupons.manage", "review.manage", "gallery.manage",
  "settings.manage", "finance.view", "finance.manage", "notification.manage",
];

const normalizePermission = (permission) => String(permission || "").trim().toLowerCase();
const extractEnabledPermissions = (items = []) => items
  .filter((item) => item && (typeof item !== "object" || item.enabled !== false))
  .map((item) => (typeof item === "string" ? item : item?.name))
  .map(normalizePermission)
  .filter(Boolean);

export const getEffectivePermissions = async (user) => {
  const roleName = getUserRole(user);
  if (roleName === "superadmin") return ["*"];
  let permissions = [];
  if (user?.roleId) {
    const role = await Role.findById(user.roleId).populate("permissions", "name enabled");
    permissions.push(...extractEnabledPermissions(role?.permissions));
  }
  permissions.push(...extractEnabledPermissions(user?.permissionsOverride));
  if (roleName === "admin") permissions.push(...ADMIN_COMPATIBILITY_PERMISSIONS.map(normalizePermission));
  return [...new Set(permissions)];
};

export const authorize = (permission) => async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Authentication required" });
    const wanted = normalizePermission(permission);
    if (!wanted) return res.status(500).json({ success: false, message: "Authorization configuration error" });
    const permissions = await getEffectivePermissions(req.user);
    if (permissions.includes("*") || permissions.includes(wanted)) {
      req.userPermissions = permissions;
      return next();
    }
    return res.status(403).json({ success: false, message: "Access denied. Missing required permission.", required: wanted });
  } catch (error) {
    console.error("Permission middleware error:", error);
    return res.status(500).json({ success: false, message: "Permission check failed" });
  }
};
