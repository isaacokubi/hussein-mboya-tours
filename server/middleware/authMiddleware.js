/**
 * Purpose: auth Middleware request middleware. Main declarations: verifyAccessToken, extractAndVerifyToken, protect, loadUser, optionalProtect.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import jwt from "jsonwebtoken";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../models/Role.js so this module can use its exported dependencies.
import "../models/Role.js";
// Load ../models/Permission.js so this module can use its exported dependencies.
import "../models/Permission.js";
// Load ../config/env.js so this module can use its exported dependencies.
import env from "../config/env.js";
// Load ../utils/roleUtils.js so this module can use its exported dependencies.
import { normalizeRole, getUserRole } from "../utils/roleUtils.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { setTenantContext, runWithTenant } from "../tenancy/context.js";

// Expose the selected declarations or re-exported members to other parts of the application.
export { normalizeRole, getUserRole };

// Declare ADMIN_BASE_PERMISSIONS for use by the surrounding module or function.
const ADMIN_BASE_PERMISSIONS = new Set([
  "admin.dashboard", "user.manage", "staff.manage", "tour.manage", "booking.manage", "payment.manage", "refund.manage", "analytics.view",
  "settings.manage", "roles.manage", "notifications.view", "finance.view", "customer.view", "tour.view", "tour.create", "tour.update",
  "booking.view", "report.view", "guide.view", "vehicle.view",
]);

// Declare JWT_ISSUER for use by the surrounding module or function.
const JWT_ISSUER = "husseinmboyatours";
// Declare JWT_AUDIENCE for use by the surrounding module or function.
const JWT_AUDIENCE = "husseinmboyatours-client";

// Declare verifyAccessToken for use by the surrounding module or function.
const verifyAccessToken = (token, secret) =>
  jwt.verify(token, secret, { issuer: JWT_ISSUER, audience: JWT_AUDIENCE });

// Declare extractAndVerifyToken for use by the surrounding module or function.
const extractAndVerifyToken = (req, secret) => {
  // Declare bearer for use by the surrounding module or function.
  const bearer = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.substring(7).trim()
    : "";
  // Declare cookie for use by the surrounding module or function.
  const cookie = String(req.cookies?.token || "").trim();
  // Declare candidates for use by the surrounding module or function.
  const candidates = [
    ...(bearer ? [{ token: bearer, source: "bearer" }] : []),
    ...(cookie ? [{ token: cookie, source: "cookie" }] : []),
  ];
  // Check the condition (!candidates.length) and run the matching branch.
  if (!candidates.length) return { decoded: null, token: null, source: null, error: null };

  // Declare lastError for use by the surrounding module or function.
  let lastError = null;
  // Repeat the enclosed work for each required iteration.
  for (const candidate of candidates) {
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Return the object assembled below to the caller.
      return {
        decoded: verifyAccessToken(candidate.token, secret),
        token: candidate.token,
        source: candidate.source,
        error: null,
      };
    } catch (error) {
      // Perform the side effect or state update expressed on the following line.
      lastError = error;
    }
  }
  // Return the object assembled below to the caller.
  return { decoded: null, token: null, source: null, error: lastError };
};

// Declare protect for use by the surrounding module or function.
export const protect = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare secret for use by the surrounding module or function.
    const secret = env.JWT_SECRET || process.env.JWT_SECRET;
    // Check the condition (!secret) and run the matching branch.
    if (!secret) return res.status(500).json({ success: false, message: "Authentication configuration error." });

    // Declare { decoded, source, error } for use by the surrounding module or function.
    const { decoded, source, error } = extractAndVerifyToken(req, secret);
    // Check the condition (error && !decoded) and run the matching branch.
    if (error && !decoded) {
      // Perform the side effect or state update expressed on the following line.
      console.error("AUTH TOKEN VERIFICATION ERROR:", error.name, error.message);
      // Declare message for use by the surrounding module or function.
      const message = error?.name === "TokenExpiredError" ? "Authentication session expired." : "Invalid authentication token.";
      // Return the result of res.status(401).json() to the caller.
      return res.status(401).json({ success: false, message });
    }
    // Check the condition (!decoded) and run the matching branch.
    if (!decoded) return res.status(401).json({ success: false, message: "Authentication required." });

    // Check the condition (source === "cookie" && !["GET", "HEAD", "OPTIONS"].includes(String(req) and run the matching branch.
    if (source === "cookie" && !["GET", "HEAD", "OPTIONS"].includes(String(req.method || "").toUpperCase())) {
      // Declare csrfCookie for use by the surrounding module or function.
      const csrfCookie = String(req.cookies?.csrfToken || "").trim();
      // Declare csrfHeader for use by the surrounding module or function.
      const csrfHeader = String(req.get("X-CSRF-Token") || "").trim();
      // Check the condition (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) and run the matching branch.
      if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
        // Return the result of res.status(403).json() to the caller.
        return res.status(403).json({ success: false, message: "CSRF validation failed." });
      }
    }

    // Declare userId for use by the surrounding module or function.
    const userId = decoded.sub || decoded.id || decoded._id || decoded.userId;
    // Check the condition (!userId) and run the matching branch.
    if (!userId) return res.status(401).json({ success: false, message: "Invalid authentication token." });

    // Declare loadUser for use by the surrounding module or function.
    const loadUser = () => User.findById(userId).select("-password").populate({ path: "roleId", populate: { path: "permissions" } }).populate("permissionsOverride");
    // Declare user for use by the surrounding module or function.
    const user = await runWithTenant({ role: "super_admin", bypass: true }, loadUser);
    // Check the condition (!user) and run the matching branch.
    if (!user) return res.status(401).json({ success: false, message: "User no longer exists." });
    // Check the condition (user.status !== "active" || user.isActive === false) and run the matching branch.
    if (user.status !== "active" || user.isActive === false) return res.status(403).json({ success: false, message: "Account is inactive." });

    // Declare role for use by the surrounding module or function.
    const role = getUserRole(user);
    // Declare isPlatformOwner for use by the surrounding module or function.
    const isPlatformOwner = role === "super_admin";
    // Declare tokenTenantId for use by the surrounding module or function.
    const tokenTenantId = decoded.tenantId ? String(decoded.tenantId) : null;
    // Declare requestedTenantId for use by the surrounding module or function.
    const requestedTenantId = req.tenantId ? String(req.tenantId) : null;
    // Declare userTenantId for use by the surrounding module or function.
    const userTenantId = user.tenantId ? String(user.tenantId) : null;

    // Check the condition (!isPlatformOwner) and run the matching branch.
    if (!isPlatformOwner) {
      // Check the condition (!userTenantId) and run the matching branch.
      if (!userTenantId) return res.status(403).json({ success: false, message: "Account is not assigned to a company." });
      // Check the condition (requestedTenantId && requestedTenantId !== userTenantId) and run the matching branch.
      if (requestedTenantId && requestedTenantId !== userTenantId) return res.status(403).json({ success: false, message: "You cannot access another company." });
      // Check the condition (tokenTenantId && tokenTenantId !== userTenantId) and run the matching branch.
      if (tokenTenantId && tokenTenantId !== userTenantId) return res.status(403).json({ success: false, message: "Authentication tenant mismatch." });
      // Perform the side effect or state update expressed on the following line.
      setTenantContext({ tenantId: user.tenantId, tenant: req.tenant || null, role, bypass: false });
      // Perform the side effect or state update expressed on the following line.
      req.tenantId = user.tenantId;
    } else {
      // Check the condition (userTenantId) and run the matching branch.
      if (userTenantId) return res.status(403).json({ success: false, message: "Platform owner account must not belong to a tenant." });
      // Perform the side effect or state update expressed on the following line.
      setTenantContext({ tenantId: null, tenant: null, role, bypass: true });
      // Perform the side effect or state update expressed on the following line.
      req.tenantId = null;
      // Perform the side effect or state update expressed on the following line.
      req.tenant = null;
    }

    // Perform the side effect or state update expressed on the following line.
    req.user = user;
    // Perform the side effect or state update expressed on the following line.
    req.userRole = role;
    // Perform the side effect or state update expressed on the following line.
    next();
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("AUTH ERROR:", error.message);
    // Declare message for use by the surrounding module or function.
    const message = error?.name === "TokenExpiredError" ? "Authentication session expired." : "Invalid authentication token.";
    // Return the result of res.status(401).json() to the caller.
    return res.status(401).json({ success: false, message });
  }
};

// Public endpoints can accept a logged-in customer without requiring login.
// If credentials are present they are fully verified; invalid credentials are rejected.
// Declare optionalProtect for use by the surrounding module or function.
export const optionalProtect = async (req, res, next) => {
  // Declare hasBearer for use by the surrounding module or function.
  const hasBearer = req.headers.authorization?.startsWith("Bearer ") && req.headers.authorization.substring(7).trim();
  // Declare hasCookie for use by the surrounding module or function.
  const hasCookie = Boolean(String(req.cookies?.token || "").trim());
  // Check the condition (!hasBearer && !hasCookie) and run the matching branch.
  if (!hasBearer && !hasCookie) return next();
  // Return the result of protect() to the caller.
  return protect(req, res, next);
};

// Declare requireRoles for use by the surrounding module or function.
export const requireRoles = (...allowedRoles) => (req, res, next) => {
  // Check the condition (!req.user) and run the matching branch.
  if (!req.user) return res.status(401).json({ success: false, message: "Authentication required." });
  // Declare role for use by the surrounding module or function.
  const role = getUserRole(req.user);
  // Declare allowed for use by the surrounding module or function.
  const allowed = allowedRoles.flat().map(normalizeRole);
  // Check the condition (!allowed.includes(role)) and run the matching branch.
  if (!allowed.includes(role)) return res.status(403).json({ success: false, message: "You do not have access to this resource." });
  // Perform the side effect or state update expressed on the following line.
  next();
};

// Declare adminOnly for use by the surrounding module or function.
export const adminOnly = requireRoles("admin", "super_admin");
// Declare superAdminOnly for use by the surrounding module or function.
export const superAdminOnly = requireRoles("super_admin");
// Declare managerOnly for use by the surrounding module or function.
export const managerOnly = requireRoles("manager", "admin", "super_admin");
// Declare agentOnly for use by the surrounding module or function.
export const agentOnly = requireRoles("agent", "admin", "super_admin");
// Declare driverOnly for use by the surrounding module or function.
export const driverOnly = requireRoles("driver", "admin", "super_admin");
// Declare guideOnly for use by the surrounding module or function.
export const guideOnly = requireRoles("guide", "admin", "super_admin");
// Declare customerOnly for use by the surrounding module or function.
export const customerOnly = requireRoles("customer");

// Declare checkPermission for use by the surrounding module or function.
export const checkPermission = (permissionName) => (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!req.user) and run the matching branch.
    if (!req.user) return res.status(401).json({ success: false, message: "Authentication required." });
    // Declare role for use by the surrounding module or function.
    const role = getUserRole(req.user);
    // Check the condition (role === "super_admin") and run the matching branch.
    if (role === "super_admin") return next();
    // Declare wanted for use by the surrounding module or function.
    const wanted = String(permissionName || "").trim().toLowerCase();
    // Check the condition (role === "admin" && ADMIN_BASE_PERMISSIONS.has(wanted)) and run the matching branch.
    if (role === "admin" && ADMIN_BASE_PERMISSIONS.has(wanted)) return next();
    // Declare permissions for use by the surrounding module or function.
    const permissions = [...(req.user.roleId?.permissions || []), ...(req.user.permissionsOverride || [])];
    // Declare hasPermission for use by the surrounding module or function.
    const hasPermission = permissions.some((permission) => {
      // Declare name for use by the surrounding module or function.
      const name = typeof permission === "object" ? permission.name : permission;
      // Return the expression shown below to the caller.
      return String(name || "").trim().toLowerCase() === wanted && permission?.enabled !== false;
    });
    // Check the condition (!hasPermission) and run the matching branch.
    if (!hasPermission) return res.status(403).json({ success: false, message: "You do not have permission to perform this action." });
    // Perform the side effect or state update expressed on the following line.
    next();
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("PERMISSION CHECK ERROR:", error);
    // Return the result of res.status(500).json() to the caller.
    return res.status(500).json({ success: false, message: "Permission verification failed." });
  }
};
