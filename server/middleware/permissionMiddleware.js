/**
 * Purpose: permission Middleware request middleware. Main declarations: normalizePermission, isPlatformRole, extractEnabledPermissions, expandPermissionAliases, getEffectivePermissions.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import Role from "../models/Role.js";
// Load ../utils/roleUtils.js so this module can use its exported dependencies.
import { getUserRole } from "../utils/roleUtils.js";

// Declare ADMIN_COMPATIBILITY_PERMISSIONS for use by the surrounding module or function.
const ADMIN_COMPATIBILITY_PERMISSIONS = [
  "admin.dashboard", "roles.manage", "system.audit", "system.security",
  "manage_customers", "manage_destinations", "manage_tours", "manage_staff", "manage_users",
  "manage_agents", "manage_guides", "manage_vehicles", "manage_bookings",
  "tour.manage", "destination.manage", "booking.manage", "payment.manage", "report.view",
  "analytics.view", "commission.view", "commission.manage", "commission.approve", "commission.pay",
  "coupon.manage", "coupons.manage", "review.manage", "gallery.manage", "settings.manage",
  "finance.view", "finance.manage", "notification.manage",
];

// Declare PERMISSION_ALIASES for use by the surrounding module or function.
const PERMISSION_ALIASES = {
  "tour.manage": ["tour.manage", "manage_tours"], "manage_tours": ["manage_tours", "tour.manage"],
  "destination.manage": ["destination.manage", "manage_destinations"], "manage_destinations": ["manage_destinations", "destination.manage"],
  "booking.manage": ["booking.manage", "manage_bookings"], "manage_bookings": ["manage_bookings", "booking.manage"],
  "payment.manage": ["payment.manage", "manage_payments"], "manage_payments": ["manage_payments", "payment.manage"],
  "customer.manage": ["customer.manage", "manage_customers"], "manage_customers": ["manage_customers", "customer.manage"],
  "staff.manage": ["staff.manage", "manage_staff"], "manage_staff": ["manage_staff", "staff.manage"],
  "user.manage": ["user.manage", "manage_users"], "manage_users": ["manage_users", "user.manage"],
  "guide.manage": ["guide.manage", "manage_guides"], "manage_guides": ["manage_guides", "guide.manage"],
  "vehicle.manage": ["vehicle.manage", "manage_vehicles"], "manage_vehicles": ["manage_vehicles", "vehicle.manage"],
  "agent.manage": ["agent.manage", "manage_agents"], "manage_agents": ["manage_agents", "agent.manage"],
};

// Declare normalizePermission for use by the surrounding module or function.
const normalizePermission = (permission) => String(permission || "").trim().toLowerCase();

// Platform owners are global and must not depend on database permission rows.
// Keep both spellings supported because legacy users/tokens may contain either.
// Declare isPlatformRole for use by the surrounding module or function.
const isPlatformRole = (role) => {
  // Declare normalized for use by the surrounding module or function.
  const normalized = String(role || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  // Return the expression shown below to the caller.
  return normalized === "super_admin" || normalized === "superadmin";
};

// Declare extractEnabledPermissions for use by the surrounding module or function.
const extractEnabledPermissions = (items = []) => items
  .filter((item) => item && (typeof item !== "object" || item.enabled !== false))
  .map((item) => (typeof item === "string" ? item : item?.name))
  .map(normalizePermission)
  .filter(Boolean);

// Declare expandPermissionAliases for use by the surrounding module or function.
const expandPermissionAliases = (permissions = []) => {
  // Declare expanded for use by the surrounding module or function.
  const expanded = new Set(permissions.map(normalizePermission));
  // Repeat the enclosed work for each required iteration.
  for (const permission of [...expanded]) {
    // Repeat the enclosed work for each required iteration.
    for (const alias of PERMISSION_ALIASES[permission] || []) expanded.add(normalizePermission(alias));
  }
  // Return the collection assembled below to the caller.
  return [...expanded];
};

// Declare getEffectivePermissions for use by the surrounding module or function.
export const getEffectivePermissions = async (user) => {
  // Declare roleName for use by the surrounding module or function.
  const roleName = getUserRole(user);
  // Check the condition (isPlatformRole(roleName)) and run the matching branch.
  if (isPlatformRole(roleName)) return ["*"];

  // Declare permissions for use by the surrounding module or function.
  let permissions = [];
  // Check the condition (user?.roleId) and run the matching branch.
  if (user?.roleId) {
    // Declare role for use by the surrounding module or function.
    const role = await Role.findById(user.roleId).populate("permissions", "name enabled");
    // Perform the side effect or state update expressed on the following line.
    permissions.push(...extractEnabledPermissions(role?.permissions));
  }
  // Perform the side effect or state update expressed on the following line.
  permissions.push(...extractEnabledPermissions(user?.permissionsOverride));
  // Check the condition (roleName === "admin") and run the matching branch.
  if (roleName === "admin") permissions.push(...ADMIN_COMPATIBILITY_PERMISSIONS.map(normalizePermission));
  // Return the collection assembled below to the caller.
  return [...new Set(expandPermissionAliases(permissions))];
};

// Declare authorize for use by the surrounding module or function.
export const authorize = (permission) => async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!req.user) and run the matching branch.
    if (!req.user) return res.status(401).json({ success: false, message: "Authentication required" });
    // Declare wanted for use by the surrounding module or function.
    const wanted = normalizePermission(permission);
    // Check the condition (!wanted) and run the matching branch.
    if (!wanted) return res.status(500).json({ success: false, message: "Authorization configuration error" });
    // Declare permissions for use by the surrounding module or function.
    const permissions = await getEffectivePermissions(req.user);
    // Declare acceptedPermissions for use by the surrounding module or function.
    const acceptedPermissions = PERMISSION_ALIASES[wanted] || [wanted];
    // Check the condition (permissions.includes("*") || acceptedPermissions.some((candidate) => p) and run the matching branch.
    if (permissions.includes("*") || acceptedPermissions.some((candidate) => permissions.includes(candidate))) {
      // Perform the side effect or state update expressed on the following line.
      req.userPermissions = permissions;
      // Return the result of next() to the caller.
      return next();
    }
    // Return the result of res.status(403).json() to the caller.
    return res.status(403).json({ success: false, message: "Access denied. Missing required permission.", required: wanted });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("Permission middleware error:", error);
    // Return the result of res.status(500).json() to the caller.
    return res.status(500).json({ success: false, message: "Permission check failed" });
  }
};
