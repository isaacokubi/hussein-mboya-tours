/**
 * Purpose: auth Controller HTTP controller. Main declarations: normalizeRole, effectiveRoleForUser, isPlatformRole, isPlatformOwner, isCustomer.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import crypto from "crypto";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { mergeTenantFilter, runWithTenant, setTenantContext, getTenantContext } from "../tenancy/context.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../models/Role.js so this module can use its exported dependencies.
import Role from "../models/Role.js";
// Load ../models/SecurityLog.js so this module can use its exported dependencies.
import SecurityLog from "../models/SecurityLog.js";
// Load ../models/AuditLog.js so this module can use its exported dependencies.
import AuditLog from "../models/AuditLog.js";
// Load ../utils/generateToken.js so this module can use its exported dependencies.
import generateToken from "../utils/generateToken.js";
// Load ../utils/buildPermissions.js so this module can use its exported dependencies.
import buildPermissions from "../utils/buildPermissions.js";
// Load ./mfaController.js so this module can use its exported dependencies.
import { createCustomerLoginChallenge } from "./mfaController.js";
// Load ../services/smsService.js so this module can use its exported dependencies.
import { sendSMS } from "../services/smsService.js";
// Load ../models/Staff.js so this module can use its exported dependencies.
import Staff from "../models/Staff.js";
// Load ../models/Agent.js so this module can use its exported dependencies.
import Agent from "../models/Agent.js";
// Load ../utils/authCookie.js so this module can use its exported dependencies.
import { setAuthCookie, clearAuthCookies } from "../utils/authCookie.js";

// Declare normalizeRole for use by the surrounding module or function.
const normalizeRole = (value) => String(value?.name || value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
// Declare effectiveRoleForUser for use by the surrounding module or function.
const effectiveRoleForUser = (user) => normalizeRole(user?.role) || normalizeRole(user?.legacyRole) || normalizeRole(user?.roleId) || "customer";
// Declare isPlatformRole for use by the surrounding module or function.
const isPlatformRole = (user) => ["super_admin", "superadmin"].includes(effectiveRoleForUser(user));
// Declare isPlatformOwner for use by the surrounding module or function.
const isPlatformOwner = (user) => isPlatformRole(user) && !user.tenantId;
// Declare isCustomer for use by the surrounding module or function.
const isCustomer = (user) => effectiveRoleForUser(user) === "customer";
// Declare MFA_ENABLED for use by the surrounding module or function.
const MFA_ENABLED = String(process.env.MFA_ENABLED || "false").toLowerCase() === "true";
// Declare publicUser for use by the surrounding module or function.
const publicUser = (user, permissions = []) => {
  // Declare role for use by the surrounding module or function.
  const role = effectiveRoleForUser(user);
  // Declare platformOwner for use by the surrounding module or function.
  const platformOwner = ["super_admin", "superadmin"].includes(role);
  // Return the object assembled below to the caller.
  return { _id: user._id, name: user.name, email: user.email, phone: user.phone, role, tenantId: platformOwner ? null : (user.tenantId || null), permissions, profileImage: user.profileImage, status: user.status, isVerified: user.isVerified, loyaltyPoints: user.loyaltyPoints, referralCode: user.referralCode, lastLoginAt: user.lastLoginAt, createdAt: user.createdAt };
};
// Declare createAuditLog for use by the surrounding module or function.
const createAuditLog = (data) => AuditLog.log(data);

// Declare isLocalPublicLogin for use by the surrounding module or function.
const isLocalPublicLogin = (req) => {
  // Declare host for use by the surrounding module or function.
  const host = String(req.get("X-Forwarded-Host") || req.get("Host") || "").split(",")[0].trim().toLowerCase().replace(/:\d+$/, "");
  // Declare hasExplicitTenant for use by the surrounding module or function.
  const hasExplicitTenant = Boolean(
    req.tenantId || getTenantContext().tenantId ||
    String(req.get("X-Tenant-ID") || "").trim() ||
    String(req.get("X-Tenant-Slug") || "").trim() ||
    String(req.get("X-Tenant-Key") || "").trim()
  );
  // Return the expression shown below to the caller.
  return ["localhost", "127.0.0.1", "[::1]"].includes(host) && !hasExplicitTenant;
};

// Declare mongooseConnectionAvailable for use by the surrounding module or function.
const mongooseConnectionAvailable = () => Boolean(User?.db?.readyState === 1 && User?.collection);

// Resolve local/shared tenant-owned accounts before the tenant-scoped query.
// Local login accepts ObjectId and legacy string tenantId values so migrated
// tenant accounts cannot silently fall through to the wrong/default tenant.
// Declare findUniqueLocalTenantUser for use by the surrounding module or function.
const findUniqueLocalTenantUser = async (req, email) => {
  // Check the condition (!isLocalPublicLogin(req) || !mongooseConnectionAvailable()) and run the matching branch.
  if (!isLocalPublicLogin(req) || !mongooseConnectionAvailable()) return { resolved: false, ambiguous: false, user: null };

  // Declare matches for use by the surrounding module or function.
  const matches = await User.collection
    .find({ email, tenantId: { $exists: true, $ne: null } })
    .limit(3)
    .toArray();

  // Never guess between companies when a local login has no tenant identity.
  // Check the condition (matches.length > 1) and run the matching branch.
  if (matches.length > 1) return { resolved: true, ambiguous: true, user: null };
  // Check the condition (matches.length !== 1 || !matches[0]?.tenantId) and run the matching branch.
  if (matches.length !== 1 || !matches[0]?.tenantId) return { resolved: false, ambiguous: false, user: null };

  // Declare tenantId for use by the surrounding module or function.
  const tenantId = matches[0].tenantId;
  // Perform the side effect or state update expressed on the following line.
  setTenantContext({ tenantId, role: "public", bypass: false });

  // Declare rawUser for use by the surrounding module or function.
  const rawUser = matches[0];
  // Declare rawRole for use by the surrounding module or function.
  const rawRole = normalizeRole(rawUser.role || rawUser.legacyRole);
  // Declare tenantAdminRoles for use by the surrounding module or function.
  const tenantAdminRoles = new Set(["admin", "administrator"]);

  // Hydrate tenant admins directly from the identified document so the
  // select:false password hash is retained and a second tenant-scoped query
  // cannot change which account is authenticated.
  // Check the condition (tenantAdminRoles.has(rawRole)) and run the matching branch.
  if (tenantAdminRoles.has(rawRole)) return { resolved: true, ambiguous: false, user: User.hydrate(rawUser) };

  // Declare user for use by the surrounding module or function.
  const user = await User.findById(rawUser._id)
    .select("+password")
    .populate({ path: "roleId", populate: { path: "permissions" } })
    .populate("permissionsOverride");
  // Return the object assembled below to the caller.
  return { resolved: true, ambiguous: false, user };
};

// Declare login for use by the surrounding module or function.
export const login = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare email for use by the surrounding module or function.
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    // Declare password for use by the surrounding module or function.
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    // Check the condition (!email || !password) and run the matching branch.
    if (!email || !password) return res.status(400).json({ success: false, message: "Email and password are required." });

    // Capture the tenant selected by middleware before local email resolution
    // can establish a tenant context of its own.
    // Declare selectedTenantId for use by the surrounding module or function.
    const selectedTenantId = String(req.tenantId || getTenantContext().tenantId || "");

    // Declare localResolution for use by the surrounding module or function.
    const localResolution = await findUniqueLocalTenantUser(req, email);
    // Check the condition (localResolution.ambiguous) and run the matching branch.
    if (localResolution.ambiguous) {
      // Return the result of res.status(409).json() to the caller.
      return res.status(409).json({ success: false, code: "TENANT_SELECTION_REQUIRED", message: "This email is registered with more than one company. Open the company login page or provide the company identifier before signing in." });
    }

    // Declare user for use by the surrounding module or function.
    let user = localResolution.user;

    // Platform SuperAdmins are global accounts and have no tenant context.
    // Resolve them before mergeTenantFilter(), because a public login request
    // can legitimately have no tenant yet. The bypass is restricted to the
    // two supported platform role spellings and tenantId:null.
    // Check the condition (!user) and run the matching branch.
    if (!user) {
      // Perform the side effect or state update expressed on the following line.
      user = await runWithTenant(
        { tenantId: null, tenant: null, role: "super_admin", bypass: true },
        async () => User.findOne({ email, role: { $in: ["super_admin", "superadmin"] }, tenantId: null })
          .select("+password")
          .populate({ path: "roleId", populate: { path: "permissions" } })
          .populate("permissionsOverride")
      );
    }

    // Only non-platform accounts require a tenant-scoped lookup. This keeps
    // tenant isolation intact while allowing the global platform owner to log
    // in from the public Global Tours site.
    // Check the condition (!user && selectedTenantId) and run the matching branch.
    if (!user && selectedTenantId) {
      // Perform the side effect or state update expressed on the following line.
      user = await User.findOne(mergeTenantFilter({ email }))
        .select("+password")
        .populate({ path: "roleId", populate: { path: "permissions" } })
        .populate("permissionsOverride");
    }

    // Check the condition (user && !isPlatformOwner(user) && selectedTenantId && String(user.tena) and run the matching branch.
    if (user && !isPlatformOwner(user) && selectedTenantId && String(user.tenantId || "") !== selectedTenantId) {
      // Return the result of res.status(401).json() to the caller.
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    // Check the condition (!user) and run the matching branch.
    if (!user) {
      // Perform the side effect or state update expressed on the following line.
      await SecurityLog.logEvent({ email, action: "login_failed", status: "failed", severity: "high", ipAddress: req.ip, userAgent: req.headers["user-agent"], details: "User not found" });
      // Return the result of res.status(401).json() to the caller.
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }
    // Check the condition (user.status !== "active") and run the matching branch.
    if (user.status !== "active") return res.status(403).json({ success: false, message: `Account ${user.status}.` });
    // Check the condition (user.lockUntil && user.lockUntil > new Date()) and run the matching branch.
    if (user.lockUntil && user.lockUntil > new Date()) return res.status(423).json({ success: false, message: "Account temporarily locked due to multiple failed login attempts." });

    // Check the condition (!(await user.matchPassword(password))) and run the matching branch.
    if (!(await user.matchPassword(password))) {
      // Perform the side effect or state update expressed on the following line.
      user.loginAttempts = Number(user.loginAttempts || 0) + 1;
      // Check the condition (user.loginAttempts >= 5) and run the matching branch.
      if (user.loginAttempts >= 5) user.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
      // Perform the side effect or state update expressed on the following line.
      await user.save({ validateBeforeSave: false });
      // Perform the side effect or state update expressed on the following line.
      await SecurityLog.logEvent({ user: user._id, email: user.email, action: "login_failed", status: "failed", severity: "high", ipAddress: req.ip, userAgent: req.headers["user-agent"], details: "Invalid password" });
      // Return the result of res.status(401).json() to the caller.
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    // Perform the side effect or state update expressed on the following line.
    user.loginAttempts = 0;
    // Perform the side effect or state update expressed on the following line.
    user.lockUntil = null;
    // Declare effectiveRole for use by the surrounding module or function.
    const effectiveRole = effectiveRoleForUser(user);
    // Declare platformOwner for use by the surrounding module or function.
    const platformOwner = isPlatformOwner(user);
    // Declare platformRoleWithTenant for use by the surrounding module or function.
    const platformRoleWithTenant = isPlatformRole(user) && !platformOwner;
    // Check the condition (platformRoleWithTenant) and run the matching branch.
    if (platformRoleWithTenant) return res.status(403).json({ success: false, message: "Platform owner account must not belong to a tenant." });
    // Declare permissions for use by the surrounding module or function.
    const permissions = buildPermissions(user);

    // Check the condition (isCustomer(user) && MFA_ENABLED) and run the matching branch.
    if (isCustomer(user) && MFA_ENABLED) {
      // Perform the side effect or state update expressed on the following line.
      await user.save({ validateBeforeSave: false });
      // Declare challenge for use by the surrounding module or function.
      const challenge = await createCustomerLoginChallenge(user);
      // Perform the side effect or state update expressed on the following line.
      await createAuditLog({ user: user._id, action: "mfa_challenge_created", resource: "Authentication", description: "Customer login MFA challenge created.", severity: "medium", ipAddress: req.ip, userAgent: req.headers["user-agent"] });
      // Perform the side effect or state update expressed on the following line.
      await SecurityLog.logEvent({ user: user._id, email: user.email, action: "mfa_challenge_created", status: "success", severity: "medium", ipAddress: req.ip, userAgent: req.headers["user-agent"], details: "Customer password verified; MFA challenge created" });
      // Return the result of res.status(200).json() to the caller.
      return res.status(200).json({ success: true, mfaRequired: true, userId: challenge.userId, devPin: String(process.env.MFA_DEV_MODE || "").toLowerCase() === "true" ? challenge.pin : undefined, message: String(process.env.MFA_DEV_MODE || "").toLowerCase() === "true" ? `Development PIN: ${challenge.pin}` : "A 4-digit verification PIN has been sent to your registered phone." });
    }

    // Perform the side effect or state update expressed on the following line.
    user.lastLoginAt = new Date();
    // Perform the side effect or state update expressed on the following line.
    await user.save({ validateBeforeSave: false });
    // Declare tokenTenantId for use by the surrounding module or function.
    const tokenTenantId = platformOwner ? null : (user.tenantId || null);
    // Declare token for use by the surrounding module or function.
    const token = generateToken({ _id: user._id, role: effectiveRole, roleId: user.roleId, email: user.email, permissions, tenantId: tokenTenantId });
    // Perform the side effect or state update expressed on the following line.
    setAuthCookie(res, token);
    // Perform the side effect or state update expressed on the following line.
    await createAuditLog({ user: user._id, action: "login", resource: "Authentication", description: "User successfully logged in.", severity: "medium", ipAddress: req.ip, userAgent: req.headers["user-agent"] });
    // Perform the side effect or state update expressed on the following line.
    await SecurityLog.logEvent({ user: user._id, email: user.email, action: "login_success", status: "success", severity: "medium", ipAddress: req.ip, userAgent: req.headers["user-agent"], details: "Login successful" });
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, token, user: publicUser(user, permissions) });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("LOGIN ERROR:", error);
    // Return the result of next() to the caller.
    return next(error);
  }
};

// Declare register for use by the surrounding module or function.
export const register = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare { name, email, phone, password } for use by the surrounding module or function.
    const { name, email, phone, password } = req.body || {};
    // Declare normalizedEmail for use by the surrounding module or function.
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    // Declare normalizedPhone for use by the surrounding module or function.
    const normalizedPhone = String(phone || "").trim();
    // Check the condition (!name || !normalizedEmail || !normalizedPhone || !password) and run the matching branch.
    if (!name || !normalizedEmail || !normalizedPhone || !password) return res.status(400).json({ success: false, message: "All fields are required." });
    // Check the condition (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) and run the matching branch.
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) return res.status(400).json({ success: false, message: "Enter a valid email address." });
    // Check the condition (!/^\d{10}$/.test(normalizedPhone)) and run the matching branch.
    if (!/^\d{10}$/.test(normalizedPhone)) return res.status(400).json({ success: false, message: "Phone number must contain exactly 10 digits." });
    // Check the condition (password.length < 8 || !/\d/.test(password) || !/[A-Z]/.test(password)) and run the matching branch.
    if (password.length < 8 || !/\d/.test(password) || !/[A-Z]/.test(password)) return res.status(400).json({ success: false, message: "Password must be at least 8 characters and include an uppercase letter and a number." });
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = req.tenant?._id || req.tenant?.id || req.tenantId || null;
    // Check the condition (!tenantId) and run the matching branch.
    if (!tenantId) return res.status(400).json({ success: false, message: "Unable to determine the company for this registration. Configure the public tenant or use the company domain and try again." });
    // Declare existingUser for use by the surrounding module or function.
    const existingUser = await User.findOne(mergeTenantFilter({ $or: [{ email: normalizedEmail }, { phone: normalizedPhone }] }));
    // Check the condition (existingUser) and run the matching branch.
    if (existingUser) return res.status(400).json({ success: false, message: existingUser.email === normalizedEmail ? "Email is already registered." : "Phone number is already registered." });
    // Declare customerRole for use by the surrounding module or function.
    const customerRole = await Role.findOne({ name: "customer" });
    // Declare user for use by the surrounding module or function.
    const user = await User.create({ name: String(name).trim(), email: normalizedEmail, phone: normalizedPhone, password, status: "active", isVerified: true, role: "customer", roleId: customerRole?._id || null, legacyRole: "customer", tenantId });
    // Perform the side effect or state update expressed on the following line.
    await SecurityLog.logEvent({ user: user._id, email: user.email, action: "register", status: "success", ipAddress: req.ip, userAgent: req.headers["user-agent"], details: "User registration" });
    // Return the result of res.status(201).json() to the caller.
    return res.status(201).json({ success: true, user: publicUser(user, []), message: "Registration successful. You can now log in." });
  } catch (error) { console.error("REGISTER ERROR:", error); return next(error); }
};

// Declare logout for use by the surrounding module or function.
export const logout = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    clearAuthCookies(res);
    // Return the result of res.status(204).send() to the caller.
    return res.status(204).send();
  } catch (error) {
    // Return the result of next() to the caller.
    return next(error);
  }
};

// Declare getMe for use by the surrounding module or function.
export const getMe = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare user for use by the surrounding module or function.
    const user = await User.findById(req.user._id).populate("roleId").populate("tenantId");
    // Check the condition (!user) and run the matching branch.
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    // Return the result of res.json() to the caller.
    return res.json({ success: true, user: { ...user.toObject(), tenantId: user.tenantId?._id || null, tenantSlug: user.tenantId?.slug || null } });
  } catch (error) { return next(error); }
};

// Declare changePassword for use by the surrounding module or function.
export const changePassword = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare user for use by the surrounding module or function.
    const user = await User.findById(req.user._id).select("+password");
    // Check the condition (!user) and run the matching branch.
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    // Check the condition (!(await user.matchPassword(req.body.currentPassword))) and run the matching branch.
    if (!(await user.matchPassword(req.body.currentPassword))) return res.status(401).json({ success: false, message: "Current password incorrect" });
    // Declare newPassword for use by the surrounding module or function.
    const newPassword = String(req.body.newPassword || "");
    // Check the condition (newPassword.length < 8 || !/\d/.test(newPassword) || !/[A-Z]/.test(new) and run the matching branch.
    if (newPassword.length < 8 || !/\d/.test(newPassword) || !/[A-Z]/.test(newPassword)) return res.status(400).json({ success: false, message: "Password must be at least 8 characters and include an uppercase letter and a number." });
    // Perform the side effect or state update expressed on the following line.
    user.password = newPassword;
    // Perform the side effect or state update expressed on the following line.
    await user.save();
    // Perform the side effect or state update expressed on the following line.
    await SecurityLog.logEvent({ user: user._id, email: user.email, action: "password_changed", status: "success", severity: "medium", ipAddress: req.ip, userAgent: req.headers["user-agent"] });
    // Return the result of res.json() to the caller.
    return res.json({ success: true, message: "Password changed successfully" });
  } catch (error) { return next(error); }
};

// Declare findPasswordResetUser for use by the surrounding module or function.
const findPasswordResetUser = async (email) => {
  // Declare user for use by the surrounding module or function.
  let user = await User.findOne(mergeTenantFilter({ email }))
    .select("+passwordResetCodeHash +passwordResetExpiresAt +passwordResetAttempts");
  // Check the condition (!user) and run the matching branch.
  if (!user) {
    // Perform the side effect or state update expressed on the following line.
    user = await runWithTenant(
      { tenantId: null, tenant: null, role: "super_admin", bypass: true },
      async () => User.findOne({ email, role: { $in: ["super_admin", "superadmin"] }, tenantId: null })
        .select("+passwordResetCodeHash +passwordResetExpiresAt +passwordResetAttempts")
    );
  }
  // Return the value of user to the caller.
  return user;
};

// Declare escapeHtml for use by the surrounding module or function.
const escapeHtml = (value) => String(value || "").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[char]));

// Declare accountEmailCompanyName for use by the surrounding module or function.
const accountEmailCompanyName = (req) => String(
  req.tenant?.name ||
  req.tenant?.companyName ||
  process.env.MAIL_FROM_NAME ||
  "Global Tours"
).trim() || "Global Tours";

// Declare requestEmailChange for use by the surrounding module or function.
export const requestEmailChange = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare currentPassword for use by the surrounding module or function.
    const currentPassword = String(req.body?.currentPassword || "");
    // Declare newEmail for use by the surrounding module or function.
    const newEmail = String(req.body?.newEmail || "").trim().toLowerCase();

    // Check the condition (!currentPassword) and run the matching branch.
    if (!currentPassword) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({ success: false, message: "Your current password is required." });
    }
    // Check the condition (!/^\S+@\S+\.\S+$/.test(newEmail)) and run the matching branch.
    if (!/^\S+@\S+\.\S+$/.test(newEmail)) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({ success: false, message: "Enter a valid new email address." });
    }

    // Declare user for use by the surrounding module or function.
    const user = await User.findById(req.user._id)
      .select("+password +emailChangeCodeHash +emailChangeExpiresAt +emailChangeAttempts")
      .populate({ path: "roleId", populate: { path: "permissions" } })
      .populate("permissionsOverride");

    // Check the condition (!user) and run the matching branch.
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    // Check the condition (!(await user.matchPassword(currentPassword))) and run the matching branch.
    if (!(await user.matchPassword(currentPassword))) {
      // Perform the side effect or state update expressed on the following line.
      await SecurityLog.logEvent({ user: user._id, email: user.email, action: "email_change_failed", status: "failed", severity: "high", ipAddress: req.ip, userAgent: req.headers["user-agent"], details: "Incorrect current password." });
      // Return the result of res.status(401).json() to the caller.
      return res.status(401).json({ success: false, message: "Current password is incorrect." });
    }
    // Check the condition (newEmail === String(user.email || "").trim().toLowerCase()) and run the matching branch.
    if (newEmail === String(user.email || "").trim().toLowerCase()) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({ success: false, message: "The new email address must be different from your current email." });
    }

    // Declare existing for use by the surrounding module or function.
    const existing = await runWithTenant(
      { tenantId: user.tenantId || null, tenant: req.tenant || null, role: effectiveRoleForUser(user), bypass: isPlatformOwner(user) },
      async () => {
        // Check the condition (isPlatformOwner(user)) and run the matching branch.
        if (isPlatformOwner(user)) return User.findOne({ email: newEmail, role: { $in: ["super_admin", "superadmin"] }, tenantId: null }).select("_id email");
        // Return the result of User.findOne({ email: newEmail, tenantId: user.tenantId }).select() to the caller.
        return User.findOne({ email: newEmail, tenantId: user.tenantId }).select("_id email");
      }
    );
    // Check the condition (existing && String(existing._id) !== String(user._id)) and run the matching branch.
    if (existing && String(existing._id) !== String(user._id)) {
      // Return the result of res.status(409).json() to the caller.
      return res.status(409).json({ success: false, message: "That email address is already in use by another account." });
    }

    // Check the condition (!isPlatformOwner(user)) and run the matching branch.
    if (!isPlatformOwner(user)) {
      // Declare [staffConflict, agentConflict] for use by the surrounding module or function.
      const [staffConflict, agentConflict] = await Promise.all([
        Staff.findOne({ tenantId: user.tenantId, email: newEmail, user: { $ne: user._id } }).select("_id").lean(),
        Agent.findOne({ tenantId: user.tenantId, email: newEmail, user: { $ne: user._id } }).select("_id").lean(),
      ]);
      // Check the condition (staffConflict || agentConflict) and run the matching branch.
      if (staffConflict || agentConflict) {
        // Return the result of res.status(409).json() to the caller.
        return res.status(409).json({ success: false, message: "That email address is already assigned to another staff or agent profile in this company." });
      }
    }

    // Declare code for use by the surrounding module or function.
    const code = String(crypto.randomInt(100000, 1000000));
    // Perform the side effect or state update expressed on the following line.
    user.pendingEmail = newEmail;
    // Perform the side effect or state update expressed on the following line.
    user.emailChangeCodeHash = crypto.createHash("sha256").update(code).digest("hex");
    // Perform the side effect or state update expressed on the following line.
    user.emailChangeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    // Perform the side effect or state update expressed on the following line.
    user.emailChangeAttempts = 0;
    // Perform the side effect or state update expressed on the following line.
    await user.save({ validateBeforeSave: false });

    // Declare companyName for use by the surrounding module or function.
    const companyName = accountEmailCompanyName(req);
    // Declare safeCompanyName for use by the surrounding module or function.
    const safeCompanyName = escapeHtml(companyName);
    // Declare subject for use by the surrounding module or function.
    const subject = `Confirm your new email address - ${companyName}`;
    // Declare text for use by the surrounding module or function.
    const text = `We received a request to change your ${companyName} account email to ${newEmail}. Your verification code is: ${code}. This code expires in 10 minutes. If you did not request this change, ignore this email.`;
    // Declare html for use by the surrounding module or function.
    const html = `<div style="max-width:620px;margin:0 auto;padding:28px;font-family:Arial,sans-serif;color:#1f2937;line-height:1.6;border:1px solid #e5e7eb;border-radius:12px"><h2 style="margin-top:0;color:#166534">Confirm your email address</h2><p>Your ${safeCompanyName} account email is being changed to <strong>${escapeHtml(newEmail)}</strong>.</p><p>Enter this one-time verification code in your dashboard:</p><div style="margin:22px 0;padding:18px;text-align:center;background:#f0fdf4;border-radius:12px;font-size:30px;font-weight:700;letter-spacing:8px;color:#166534">${code}</div><p>This code expires in <strong>10 minutes</strong>.</p><p>If you did not request this change, ignore this email and keep your current account email.</p><p>Regards,<br>${safeCompanyName}</p></div>`;

    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Declare { sendEmail } for use by the surrounding module or function.
      const { sendEmail } = await import("../services/emailService.js");
      // Perform the side effect or state update expressed on the following line.
      await sendEmail({ to: newEmail, subject, html, text, fromName: companyName, settingsSource: req });
    } catch (emailError) {
      // Perform the side effect or state update expressed on the following line.
      user.pendingEmail = "";
      // Perform the side effect or state update expressed on the following line.
      user.emailChangeCodeHash = "";
      // Perform the side effect or state update expressed on the following line.
      user.emailChangeExpiresAt = null;
      // Perform the side effect or state update expressed on the following line.
      user.emailChangeAttempts = 0;
      // Perform the side effect or state update expressed on the following line.
      await user.save({ validateBeforeSave: false });
      // Perform the side effect or state update expressed on the following line.
      console.error("EMAIL CHANGE VERIFICATION ERROR:", emailError.message);
      // Return the result of res.status(503).json() to the caller.
      return res.status(503).json({ success: false, message: "We could not send the verification email right now. Please try again shortly." });
    }

    // Perform the side effect or state update expressed on the following line.
    await SecurityLog.logEvent({ user: user._id, email: user.email, action: "email_change_requested", status: "success", severity: "medium", ipAddress: req.ip, userAgent: req.headers["user-agent"], details: `Verification code sent to pending address ${newEmail}.` });
    // Return the result of res.json() to the caller.
    return res.json({ success: true, message: `A verification code has been sent to ${newEmail}.`, pendingEmail: newEmail });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("EMAIL CHANGE REQUEST ERROR:", error);
    // Return the result of next() to the caller.
    return next(error);
  }
};

// Declare confirmEmailChange for use by the surrounding module or function.
export const confirmEmailChange = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare code for use by the surrounding module or function.
    const code = String(req.body?.code || "").trim();
    // Check the condition (!/^\d{6}$/.test(code)) and run the matching branch.
    if (!/^\d{6}$/.test(code)) return res.status(400).json({ success: false, message: "Enter the 6-digit verification code." });

    // Declare user for use by the surrounding module or function.
    const user = await User.findById(req.user._id)
      .select("+password +emailChangeCodeHash +emailChangeExpiresAt +emailChangeAttempts")
      .populate({ path: "roleId", populate: { path: "permissions" } })
      .populate("permissionsOverride");

    // Check the condition (!user || !user.pendingEmail || !user.emailChangeCodeHash || !user.emai) and run the matching branch.
    if (!user || !user.pendingEmail || !user.emailChangeCodeHash || !user.emailChangeExpiresAt) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({ success: false, message: "There is no active email-change request. Request a new verification code." });
    }
    // Check the condition (new Date(user.emailChangeExpiresAt).getTime() < Date.now()) and run the matching branch.
    if (new Date(user.emailChangeExpiresAt).getTime() < Date.now()) {
      // Perform the side effect or state update expressed on the following line.
      user.pendingEmail = "";
      // Perform the side effect or state update expressed on the following line.
      user.emailChangeCodeHash = "";
      // Perform the side effect or state update expressed on the following line.
      user.emailChangeExpiresAt = null;
      // Perform the side effect or state update expressed on the following line.
      user.emailChangeAttempts = 0;
      // Perform the side effect or state update expressed on the following line.
      await user.save({ validateBeforeSave: false });
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({ success: false, message: "The verification code has expired. Request a new code." });
    }
    // Check the condition (Number(user.emailChangeAttempts || 0) >= 5) and run the matching branch.
    if (Number(user.emailChangeAttempts || 0) >= 5) {
      // Return the result of res.status(429).json() to the caller.
      return res.status(429).json({ success: false, message: "Too many incorrect verification attempts. Request a new code." });
    }

    // Declare hash for use by the surrounding module or function.
    const hash = crypto.createHash("sha256").update(code).digest("hex");
    // Check the condition (hash !== user.emailChangeCodeHash) and run the matching branch.
    if (hash !== user.emailChangeCodeHash) {
      // Perform the side effect or state update expressed on the following line.
      user.emailChangeAttempts = Number(user.emailChangeAttempts || 0) + 1;
      // Perform the side effect or state update expressed on the following line.
      await user.save({ validateBeforeSave: false });
      // Return the result of res.status(401).json() to the caller.
      return res.status(401).json({ success: false, message: "Invalid verification code." });
    }

    // Declare oldEmail for use by the surrounding module or function.
    const oldEmail = user.email;
    // Declare newEmail for use by the surrounding module or function.
    const newEmail = String(user.pendingEmail).trim().toLowerCase();

    // Declare duplicate for use by the surrounding module or function.
    const duplicate = await runWithTenant(
      { tenantId: user.tenantId || null, tenant: req.tenant || null, role: effectiveRoleForUser(user), bypass: isPlatformOwner(user) },
      async () => isPlatformOwner(user)
        ? User.findOne({ email: newEmail, role: { $in: ["super_admin", "superadmin"] }, tenantId: null }).select("_id")
        : User.findOne({ email: newEmail, tenantId: user.tenantId }).select("_id")
    );
    // Check the condition (!isPlatformOwner(user)) and run the matching branch.
    if (!isPlatformOwner(user)) {
      // Declare [staffConflict, agentConflict] for use by the surrounding module or function.
      const [staffConflict, agentConflict] = await Promise.all([
        Staff.findOne({ tenantId: user.tenantId, email: newEmail, user: { $ne: user._id } }).select("_id").lean(),
        Agent.findOne({ tenantId: user.tenantId, email: newEmail, user: { $ne: user._id } }).select("_id").lean(),
      ]);
      // Check the condition (staffConflict || agentConflict) and run the matching branch.
      if (staffConflict || agentConflict) {
        // Return the result of res.status(409).json() to the caller.
        return res.status(409).json({ success: false, message: "That email address is already assigned to another staff or agent profile in this company." });
      }
    }
    // Check the condition (duplicate && String(duplicate._id) !== String(user._id)) and run the matching branch.
    if (duplicate && String(duplicate._id) !== String(user._id)) {
      // Perform the side effect or state update expressed on the following line.
      user.pendingEmail = "";
      // Perform the side effect or state update expressed on the following line.
      user.emailChangeCodeHash = "";
      // Perform the side effect or state update expressed on the following line.
      user.emailChangeExpiresAt = null;
      // Perform the side effect or state update expressed on the following line.
      user.emailChangeAttempts = 0;
      // Perform the side effect or state update expressed on the following line.
      await user.save({ validateBeforeSave: false });
      // Return the result of res.status(409).json() to the caller.
      return res.status(409).json({ success: false, message: "That email address is now in use by another account. Request a new email change." });
    }

    // Perform the side effect or state update expressed on the following line.
    user.email = newEmail;
    // Perform the side effect or state update expressed on the following line.
    user.pendingEmail = "";
    // Perform the side effect or state update expressed on the following line.
    user.emailChangeCodeHash = "";
    // Perform the side effect or state update expressed on the following line.
    user.emailChangeExpiresAt = null;
    // Perform the side effect or state update expressed on the following line.
    user.emailChangeAttempts = 0;
    // Perform the side effect or state update expressed on the following line.
    await user.save();

    // Declare tenantFilter for use by the surrounding module or function.
    const tenantFilter = user.tenantId ? { tenantId: user.tenantId } : {};
    // Perform the side effect or state update expressed on the following line.
    await Promise.allSettled([
      Staff.updateOne({ ...tenantFilter, user: user._id }, { $set: { email: newEmail } }),
      Agent.updateOne({ ...tenantFilter, user: user._id }, { $set: { email: newEmail } }),
    ]);

    // Declare permissions for use by the surrounding module or function.
    const permissions = buildPermissions(user);
    // Declare tokenTenantId for use by the surrounding module or function.
    const tokenTenantId = isPlatformOwner(user) ? null : (user.tenantId || null);
    // Declare token for use by the surrounding module or function.
    const token = generateToken({ _id: user._id, role: effectiveRoleForUser(user), roleId: user.roleId, email: newEmail, permissions, tenantId: tokenTenantId });
    // Perform the side effect or state update expressed on the following line.
    setAuthCookie(res, token);

    // Perform the side effect or state update expressed on the following line.
    await SecurityLog.logEvent({ user: user._id, email: newEmail, action: "email_changed", status: "success", severity: "high", ipAddress: req.ip, userAgent: req.headers["user-agent"], details: `Account email changed from ${oldEmail} to ${newEmail}.` });
    // Return the result of res.json() to the caller.
    return res.json({ success: true, message: "Email address changed successfully. Your new email is now used for login and password recovery.", user: publicUser(user, permissions), token });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("EMAIL CHANGE CONFIRM ERROR:", error);
    // Return the result of next() to the caller.
    return next(error);
  }
};

// Declare requestPasswordReset for use by the surrounding module or function.
export const requestPasswordReset = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare email for use by the surrounding module or function.
    const email = String(req.body?.email || "").trim().toLowerCase();
    // Declare generic for use by the surrounding module or function.
    const generic = { success: true, message: "If an account exists for that email address, a password reset code has been sent." };
    // Check the condition (!email || !/^\S+@\S+\.\S+$/.test(email)) and run the matching branch.
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({ success: false, message: "A valid email address is required." });
    }
    // Declare user for use by the surrounding module or function.
    const user = await findPasswordResetUser(email);
    // Check the condition (!user) and run the matching branch.
    if (!user) return res.json(generic);

    // Declare code for use by the surrounding module or function.
    const code = String(crypto.randomInt(100000, 1000000));
    // Perform the side effect or state update expressed on the following line.
    user.passwordResetCodeHash = crypto.createHash("sha256").update(code).digest("hex");
    // Perform the side effect or state update expressed on the following line.
    user.passwordResetExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    // Perform the side effect or state update expressed on the following line.
    user.passwordResetAttempts = 0;
    // Perform the side effect or state update expressed on the following line.
    await user.save({ validateBeforeSave: false });

    // Declare companyName for use by the surrounding module or function.
    const companyName = isPlatformOwner(user)
      ? String(process.env.MAIL_FROM_NAME || "Global Tours").trim() || "Global Tours"
      : String(req.tenant?.name || req.tenant?.companyName || process.env.MAIL_FROM_NAME || "Global Tours").trim() || "Global Tours";
    // Declare safeCompanyName for use by the surrounding module or function.
    const safeCompanyName = companyName.replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
    // Declare subject for use by the surrounding module or function.
    const subject = `Password reset code - ${companyName}`;
    // Declare text for use by the surrounding module or function.
    const text = `We received a request to reset your ${companyName} password.\n\nYour password reset code is: ${code}\n\nThis code expires in 10 minutes. If you did not request a password reset, you can ignore this email.`;
    // Declare html for use by the surrounding module or function.
    const html = `<div style="max-width:620px;margin:0 auto;padding:28px;font-family:Arial,sans-serif;color:#1f2937;line-height:1.6;border:1px solid #e5e7eb;border-radius:12px"><h2 style="margin-top:0;color:#166534">Reset your password</h2><p>We received a request to reset your <strong>${safeCompanyName}</strong> password.</p><p>Your one-time password reset code is:</p><div style="margin:22px 0;padding:18px;text-align:center;background:#f0fdf4;border-radius:12px;font-size:30px;font-weight:700;letter-spacing:8px;color:#166534">${code}</div><p>This code expires in <strong>10 minutes</strong>.</p><p>If you did not request this, you can safely ignore this email.</p><p>Regards,<br>${safeCompanyName}</p></div>`;

    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Declare { sendEmail } for use by the surrounding module or function.
      const { sendEmail } = await import("../services/emailService.js");
      // Perform the side effect or state update expressed on the following line.
      await sendEmail({ to: user.email, subject, html, text, fromName: companyName, settingsSource: req });
    } catch (emailError) {
      // A code must never remain usable when its delivery failed.
      // Perform the side effect or state update expressed on the following line.
      user.passwordResetCodeHash = "";
      // Perform the side effect or state update expressed on the following line.
      user.passwordResetExpiresAt = null;
      // Perform the side effect or state update expressed on the following line.
      user.passwordResetAttempts = 0;
      // Perform the side effect or state update expressed on the following line.
      await user.save({ validateBeforeSave: false });
      // Perform the side effect or state update expressed on the following line.
      console.error("PASSWORD RESET EMAIL ERROR:", emailError.message);
      // Return the result of res.status(503).json() to the caller.
      return res.status(503).json({ success: false, message: "We could not send the reset email right now. Please try again shortly." });
    }

    // Perform the side effect or state update expressed on the following line.
    await SecurityLog.logEvent({ user: user._id, email: user.email, action: "password_reset_requested", status: "success", severity: "medium", ipAddress: req.ip, userAgent: req.headers["user-agent"], details: "Password reset code sent by email." });
    // Check the condition (String(process.env.MFA_DEV_MODE || "").toLowerCase() === "true") and run the matching branch.
    if (String(process.env.MFA_DEV_MODE || "").toLowerCase() === "true") {
      // Return the result of res.json() to the caller.
      return res.json({ ...generic, devCode: code, message: `Development reset code: ${code}` });
    }
    // Return the result of res.json() to the caller.
    return res.json(generic);
  } catch (error) { console.error("PASSWORD RESET REQUEST ERROR:", error); return next(error); }
};

// Declare resetPasswordWithCode for use by the surrounding module or function.
export const resetPasswordWithCode = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare email for use by the surrounding module or function.
    const email = String(req.body?.email || "").trim().toLowerCase();
    // Declare code for use by the surrounding module or function.
    const code = String(req.body?.code || "").trim();
    // Declare newPassword for use by the surrounding module or function.
    const newPassword = String(req.body?.newPassword || "");
    // Check the condition (!email || !/^\d{6}$/.test(code)) and run the matching branch.
    if (!email || !/^\d{6}$/.test(code)) return res.status(400).json({ success: false, message:"Email and a 6-digit reset code are required." });
    // Check the condition (newPassword.length < 8 || !/\d/.test(newPassword) || !/[A-Z]/.test(new) and run the matching branch.
    if (newPassword.length < 8 || !/\d/.test(newPassword) || !/[A-Z]/.test(newPassword)) return res.status(400).json({ success: false, message: "Password must be at least 8 characters and include an uppercase letter and a number." });
    // Declare user for use by the surrounding module or function.
    let user = await User.findOne(mergeTenantFilter({ email })).select("+password +passwordResetCodeHash +passwordResetExpiresAt +passwordResetAttempts");
    // Check the condition (!user) and run the matching branch.
    if (!user) {
      // Perform the side effect or state update expressed on the following line.
      user = await runWithTenant(
        { tenantId: null, tenant: null, role: "super_admin", bypass: true },
        async () => User.findOne({ email, role: { $in: ["super_admin", "superadmin"] }, tenantId: null })
          .select("+password +passwordResetCodeHash +passwordResetExpiresAt +passwordResetAttempts")
      );
    }
    // Check the condition (!user || !user.passwordResetCodeHash || !user.passwordResetExpiresAt) and run the matching branch.
    if (!user || !user.passwordResetCodeHash || !user.passwordResetExpiresAt) return res.status(400).json({ success: false, message: "Invalid or expired reset code." });
    // Check the condition (new Date(user.passwordResetExpiresAt).getTime() < Date.now()) and run the matching branch.
    if (new Date(user.passwordResetExpiresAt).getTime() < Date.now()) return res.status(400).json({ success: false, message: "The reset code has expired. Request a new code." });
    // Check the condition (Number(user.passwordResetAttempts || 0) >= 5) and run the matching branch.
    if (Number(user.passwordResetAttempts || 0) >= 5) return res.status(429).json({ success: false, message: "Too many incorrect reset attempts. Request a new code." });
    // Declare hash for use by the surrounding module or function.
    const hash = crypto.createHash("sha256").update(code).digest("hex");
    // Check the condition (hash !== user.passwordResetCodeHash) and run the matching branch.
    if (hash !== user.passwordResetCodeHash) { user.passwordResetAttempts = Number(user.passwordResetAttempts || 0) + 1; await user.save({ validateBeforeSave: false }); return res.status(401).json({ success: false, message: "Invalid reset code." }); }
    // Perform the side effect or state update expressed on the following line.
    user.password = newPassword; user.passwordResetCodeHash = ""; user.passwordResetExpiresAt = null; user.passwordResetAttempts = 0; user.loginAttempts = 0; user.lockUntil = null;
    // Perform the side effect or state update expressed on the following line.
    await user.save();
    // Perform the side effect or state update expressed on the following line.
    await SecurityLog.logEvent({ user: user._id, email: user.email, action: "password_reset", status: "success", severity: "high", ipAddress: req.ip, userAgent: req.headers["user-agent"] });
    // Return the result of res.json() to the caller.
    return res.json({ success: true, message: "Password reset successfully. You can now log in." });
  } catch (error) { console.error("PASSWORD RESET ERROR:", error); return next(error); }
};
