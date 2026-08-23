import Role from "../models/Role.js";
import { getUserRole } from "../utils/roleUtils.js";

const ADMIN_COMPATIBILITY_PERMISSIONS = [
  "admin.dashboard", "roles.manage", "system.audit", "system.security",
  "manage_customers", "manage_destinations", "manage_tours", "manage_staff", "manage_users",
  "manage_agents", "manage_guides", "manage_vehicles", "manage_bookings",
  "tour.manage", "destination.manage", "booking.manage", "payment.manage", "report.view",
  "analytics.view", "commission.view", "commission.manage", "commission.approve", "commission.pay",
  "coupon.manage", "coupons.manage", "review.manage", "gallery.manage", "settings.manage",
  "finance.view", "finance.manage", "notification.manage",
];

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

const normalizePermission = (permission) => String(permission || "").trim().toLowerCase();
const isPlatformRole = (role) => ["superadmin", "super_admin"].includes(String(role || "").trim().toLowerCase());

const extractEnabledPermissions = (items = []) => items
  .filter((item) => item && (typeof item !== "object" || item.enabled !== false))
  .map((item) => (typeof item === "string" ? item : item?.name))
  .map(normalizePermission)
  .filter(Boolean);

const expandPermissionAliases = (permissions = []) => {
  const expanded = new Set(permissions.map(normalizePermission));
  for (const permission of [...expanded]) {
    for (const alias of PERMISSION_ALIASES[permission] || []) expanded.add(normalizePermission(alias));
  }
  return [...expanded];
};

export const getEffectivePermissions = async (user) => {
  const roleName = getUserRole(user);
  if (isPlatformRole(roleName)) return ["*"];

  let permissions = [];
  if (user?.roleId) {
    const role = await Role.findById(user.roleId).populate("permissions", "name enabled");
    permissions.push(...extractEnabledPermissions(role?.permissions));
  }
  permissions.push(...extractEnabledPermissions(user?.permissionsOverride));
  if (roleName === "admin") permissions.push(...ADMIN_COMPATIBILITY_PERMISSIONS.map(normalizePermission));
  return [...new Set(expandPermissionAliases(permissions))];
};

export const authorize = (permission) => async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Authentication required" });
    const wanted = normalizePermission(permission);
    if (!wanted) return res.status(500).json({ success: false, message: "Authorization configuration error" });
    const permissions = await getEffectivePermissions(req.user);
    const acceptedPermissions = PERMISSION_ALIASES[wanted] || [wanted];
    if (permissions.includes("*") || acceptedPermissions.some((candidate) => permissions.includes(candidate))) {
      req.userPermissions = permissions;
      return next();
    }
    return res.status(403).json({ success: false, message: "Access denied. Missing required permission.", required: wanted });
  } catch (error) {
    console.error("Permission middleware error:", error);
    return res.status(500).json({ success: false, message: "Permission check failed" });
  }
};
