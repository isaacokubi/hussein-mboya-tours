// Verify signed access tokens before allowing protected API actions.
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import "../models/Role.js";
import "../models/Permission.js";
import env from "../config/env.js";
import { normalizeRole, getUserRole } from "../utils/roleUtils.js";
import { setTenantContext, runWithTenant } from "../tenancy/context.js";

export { normalizeRole, getUserRole };

// Permissions granted to standard admins for core dashboard and business workflows.
const ADMIN_BASE_PERMISSIONS = new Set([
  "admin.dashboard", "user.manage", "staff.manage", "tour.manage", "booking.manage", "payment.manage", "refund.manage", "analytics.view",
  "settings.manage", "roles.manage", "notifications.view", "finance.view", "customer.view", "tour.view", "tour.create", "tour.update",
  "booking.view", "report.view", "guide.view", "vehicle.view",
]);

const JWT_ISSUER = "husseinmboyatours";
const JWT_AUDIENCE = "husseinmboyatours-client";

const verifyAccessToken = (token, secret) =>
  jwt.verify(token, secret, { issuer: JWT_ISSUER, audience: JWT_AUDIENCE });

// Read bearer/cookie tokens and verify candidates in order; never trust unverified claims.
const extractAndVerifyToken = (req, secret) => {
  const bearer = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.substring(7).trim()
    : "";
  const cookie = String(req.cookies?.token || "").trim();
  const candidates = [
    ...(bearer ? [{ token: bearer, source: "bearer" }] : []),
    ...(cookie ? [{ token: cookie, source: "cookie" }] : []),
  ];
  if (!candidates.length) return { decoded: null, token: null, source: null, error: null };

  let lastError = null;
  for (const candidate of candidates) {
    try {
      return {
        decoded: verifyAccessToken(candidate.token, secret),
        token: candidate.token,
        source: candidate.source,
        error: null,
      };
    } catch (error) {
      lastError = error;
    }
  }
  return { decoded: null, token: null, source: null, error: lastError };
};

// Require a valid token, reload the user, enforce tenant membership and attach identity to the request.
export const protect = async (req, res, next) => {
  try {
    const secret = env.JWT_SECRET || process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ success: false, message: "Authentication configuration error." });

    const { decoded, source, error } = extractAndVerifyToken(req, secret);
    if (error && !decoded) {
      console.error("AUTH TOKEN VERIFICATION ERROR:", error.name, error.message);
      const message = error?.name === "TokenExpiredError" ? "Authentication session expired." : "Invalid authentication token.";
      return res.status(401).json({ success: false, message });
    }
    if (!decoded) return res.status(401).json({ success: false, message: "Authentication required." });

    // Cookie-authenticated state-changing requests must include a matching CSRF cookie/header pair.
    if (source === "cookie" && !["GET", "HEAD", "OPTIONS"].includes(String(req.method || "").toUpperCase())) {
      const csrfCookie = String(req.cookies?.csrfToken || "").trim();
      const csrfHeader = String(req.get("X-CSRF-Token") || "").trim();
      if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
        return res.status(403).json({ success: false, message: "CSRF validation failed." });
      }
    }

    const userId = decoded.sub || decoded.id || decoded._id || decoded.userId;
    if (!userId) return res.status(401).json({ success: false, message: "Invalid authentication token." });

    // Reload the account so deleted or disabled users are not trusted from stale JWT claims.
    const loadUser = () => User.findById(userId).select("-password").populate({ path: "roleId", populate: { path: "permissions" } }).populate("permissionsOverride");
    const user = await runWithTenant({ role: "super_admin", bypass: true }, loadUser);
    if (!user) return res.status(401).json({ success: false, message: "User no longer exists." });
    if (user.status !== "active" || user.isActive === false) return res.status(403).json({ success: false, message: "Account is inactive." });

    const role = getUserRole(user);
    const isPlatformOwner = role === "super_admin";
    const tokenTenantId = decoded.tenantId ? String(decoded.tenantId) : null;
    const requestedTenantId = req.tenantId ? String(req.tenantId) : null;
    const userTenantId = user.tenantId ? String(user.tenantId) : null;

    // Tenant users must match both the account's tenant and the resolved request tenant.
    if (!isPlatformOwner) {
      if (!userTenantId) return res.status(403).json({ success: false, message: "Account is not assigned to a company." });
      if (requestedTenantId && requestedTenantId !== userTenantId) return res.status(403).json({ success: false, message: "You cannot access another company." });
      if (tokenTenantId && tokenTenantId !== userTenantId) return res.status(403).json({ success: false, message: "Authentication tenant mismatch." });
      setTenantContext({ tenantId: user.tenantId, tenant: req.tenant || null, role, bypass: false });
      req.tenantId = user.tenantId;
    } else {
      if (userTenantId) return res.status(403).json({ success: false, message: "Platform owner account must not belong to a tenant." });
      setTenantContext({ tenantId: null, tenant: null, role, bypass: true });
      req.tenantId = null;
      req.tenant = null;
    }

    req.user = user;
    req.userRole = role;
    next();
  } catch (error) {
    console.error("AUTH ERROR:", error.message);
    const message = error?.name === "TokenExpiredError" ? "Authentication session expired." : "Invalid authentication token.";
    return res.status(401).json({ success: false, message });
  }
};

// Public endpoints can accept a logged-in customer without requiring login.
// If credentials are present they are fully verified; invalid credentials are rejected.
// Permit anonymous access when no token is supplied, but reject invalid supplied credentials.
export const optionalProtect = async (req, res, next) => {
  const hasBearer = req.headers.authorization?.startsWith("Bearer ") && req.headers.authorization.substring(7).trim();
  const hasCookie = Boolean(String(req.cookies?.token || "").trim());
  if (!hasBearer && !hasCookie) return next();
  return protect(req, res, next);
};

// Create middleware that allows only authenticated users whose normalized role is allowlisted.
export const requireRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: "Authentication required." });
  const role = getUserRole(req.user);
  const allowed = allowedRoles.flat().map(normalizeRole);
  if (!allowed.includes(role)) return res.status(403).json({ success: false, message: "You do not have access to this resource." });
  next();
};

export const adminOnly = requireRoles("admin", "super_admin");
export const superAdminOnly = requireRoles("super_admin");
export const managerOnly = requireRoles("manager", "admin", "super_admin");
export const agentOnly = requireRoles("agent", "admin", "super_admin");
export const driverOnly = requireRoles("driver", "admin", "super_admin");
export const guideOnly = requireRoles("guide", "admin", "super_admin");
export const customerOnly = requireRoles("customer");

// Check a named permission against role permissions and explicit overrides.
export const checkPermission = (permissionName) => (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Authentication required." });
    const role = getUserRole(req.user);
    if (role === "super_admin") return next();
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
