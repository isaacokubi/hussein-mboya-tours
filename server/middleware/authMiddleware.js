import jwt from "jsonwebtoken";
import User from "../models/User.js";
import env from "../config/env.js";
import { normalizeRole, getUserRole } from "../utils/roleUtils.js";
import { setTenantContext, runWithTenant } from "../tenancy/context.js";

export { normalizeRole, getUserRole };

const ADMIN_BASE_PERMISSIONS = new Set([
  "admin.dashboard", "user.manage", "staff.manage", "tour.manage", "booking.manage", "payment.manage", "refund.manage", "analytics.view",
  "settings.manage", "roles.manage", "notifications.view", "finance.view", "customer.view", "tour.view", "tour.create", "tour.update",
  "booking.view", "report.view", "guide.view", "vehicle.view",
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
    const decoded = jwt.verify(token, secret, { issuer: "husseinmboyatours", audience: "husseinmboyatours-client" });
    const userId = decoded.sub || decoded.id || decoded._id || decoded.userId;
    if (!userId) return res.status(401).json({ success: false, message: "Invalid authentication token." });

    const tokenRole = normalizeRole(decoded.role);
    // Identity lookup must be tenant-independent. Tenant authorization is applied
    // only after the database user and its authoritative tenantId are loaded.
    const loadUser = () => User.findById(userId).select("-password").populate({ path: "roleId", populate: { path: "permissions" } }).populate("permissionsOverride");
    const user = await runWithTenant({ role: "superadmin", bypass: true }, loadUser);
    if (!user) return res.status(401).json({ success: false, message: "User no longer exists." });
    if (user.status !== "active" || user.isActive === false) return res.status(403).json({ success: false, message: "Account is inactive." });

    const role = getUserRole(user);
    const isPlatformOwner = role === "superadmin" || role === "super_admin";
    const tokenTenantId = decoded.tenantId ? String(decoded.tenantId) : null;
    const requestedTenantId = req.tenantId ? String(req.tenantId) : null;
    const userTenantId = user.tenantId ? String(user.tenantId) : null;

    if (!isPlatformOwner) {
      if (!userTenantId) return res.status(403).json({ success: false, message: "Account is not assigned to a company." });
      if (requestedTenantId && requestedTenantId !== userTenantId) return res.status(403).json({ success: false, message: "You cannot access another company." });
      if (tokenTenantId && tokenTenantId !== userTenantId) return res.status(403).json({ success: false, message: "Authentication tenant mismatch." });
      setTenantContext({ tenantId: user.tenantId, tenant: req.tenant || null, role, bypass: false });
      req.tenantId = user.tenantId;
    } else {
      if (userTenantId) return res.status(403).json({ success: false, message: "Platform owner account must not belong to a tenant." });
      // A platform owner is global. Ignore tenant headers and JWT tenant claims;
      // neither is allowed to narrow or redirect the platform identity.
      setTenantContext({ tenantId: null, tenant: null, role, bypass: true });
      req.tenantId = null;
      req.tenant = null;
    }

    req.user = user;
    req.userRole = role;
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
    const wanted = String(permissionName || "").trim().toLowerCase();
    if (role === "admin" && ADMIN_BASE_PERMISSIONS.has(wanted)) return next();
    const permissions = [...(req.user.roleId?.permissions || []), ...(req.user.permissionsOverride || [])];
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
