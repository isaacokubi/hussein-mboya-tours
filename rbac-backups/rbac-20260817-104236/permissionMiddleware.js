import Role from "../models/Role.js";
import { getUserRole } from "../utils/roleUtils.js";

const ADMIN_COMPATIBILITY_PERMISSIONS = [
  "admin.dashboard",
  "roles.manage",
  "system.audit",
  "manage_customers",
  "payment.manage",
  "report.view",
  "analytics.view",
  "commission.view",
  "commission.manage",
  "commission.approve",
  "commission.pay",
  "coupon.manage",
  "coupons.manage",
  "review.manage",
  "settings.manage",
];

export const authorize = (permission) => async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const roleName = getUserRole(req.user);

    // SuperAdmin is the platform authority. It must never be locked out
    // because a legacy/system Role document is missing a newly-created permission.
    if (roleName === "superadmin") return next();

    let permissions = [];

    if (req.user.roleId) {
      const role = await Role.findById(req.user.roleId).populate("permissions", "name");
      permissions = role?.permissions?.map((item) => item.name).filter(Boolean) || [];
    }

    const overrides = req.user.permissionsOverride || [];
    permissions.push(
      ...overrides.map((item) => (typeof item === "string" ? item : item?.name)).filter(Boolean)
    );

    if (roleName === "admin") permissions.push(...ADMIN_COMPATIBILITY_PERMISSIONS);

    permissions = [...new Set(permissions.map((item) => String(item).trim()))];

    if (!permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Missing required permission.",
        required: permission,
        available: permissions,
      });
    }

    next();
  } catch (error) {
    console.error("Permission middleware error:", error);
    return res.status(500).json({ success: false, message: "Permission check failed" });
  }
};
