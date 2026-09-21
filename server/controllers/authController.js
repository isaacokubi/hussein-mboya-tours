import crypto from "crypto";
import { mergeTenantFilter, runWithTenant, setTenantContext, getTenantContext } from "../tenancy/context.js";
import User from "../models/User.js";
import Role from "../models/Role.js";
import SecurityLog from "../models/SecurityLog.js";
import AuditLog from "../models/AuditLog.js";
import generateToken from "../utils/generateToken.js";
import buildPermissions from "../utils/buildPermissions.js";
import { createCustomerLoginChallenge } from "./mfaController.js";
import { sendSMS } from "../services/smsService.js";
import Staff from "../models/Staff.js";
import Agent from "../models/Agent.js";
import { setAuthCookie, clearAuthCookies } from "../utils/authCookie.js";

const normalizeRole = (value) => String(value?.name || value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
const effectiveRoleForUser = (user) => normalizeRole(user?.role) || normalizeRole(user?.legacyRole) || normalizeRole(user?.roleId) || "customer";
const isPlatformRole = (user) => ["super_admin", "superadmin"].includes(effectiveRoleForUser(user));
const isPlatformOwner = (user) => isPlatformRole(user) && !user.tenantId;
const isCustomer = (user) => effectiveRoleForUser(user) === "customer";
const MFA_ENABLED = String(process.env.MFA_ENABLED || "false").toLowerCase() === "true";
const publicUser = (user, permissions = []) => {
  const role = effectiveRoleForUser(user);
  const platformOwner = ["super_admin", "superadmin"].includes(role);
  return { _id: user._id, name: user.name, email: user.email, phone: user.phone, role, tenantId: platformOwner ? null : (user.tenantId || null), permissions, profileImage: user.profileImage, status: user.status, isVerified: user.isVerified, loyaltyPoints: user.loyaltyPoints, referralCode: user.referralCode, lastLoginAt: user.lastLoginAt, createdAt: user.createdAt };
};
const createAuditLog = (data) => AuditLog.log(data);

const isLocalPublicLogin = (req) => {
  const host = String(req.get("X-Forwarded-Host") || req.get("Host") || "").split(",")[0].trim().toLowerCase().replace(/:\d+$/, "");
  const hasExplicitTenant = Boolean(
    String(req.get("X-Tenant-ID") || "").trim() ||
    String(req.get("X-Tenant-Slug") || "").trim() ||
    String(req.get("X-Tenant-Key") || "").trim()
  );
  return ["localhost", "127.0.0.1", "[::1]"].includes(host) && !hasExplicitTenant;
};

const mongooseConnectionAvailable = () => Boolean(User?.db?.readyState === 1 && User?.collection);

// Resolve local/shared tenant-owned accounts before the tenant-scoped query.
// Local login accepts ObjectId and legacy string tenantId values so migrated
// tenant accounts cannot silently fall through to the wrong/default tenant.
const findUniqueLocalTenantUser = async (req, email) => {
  if (!isLocalPublicLogin(req) || !mongooseConnectionAvailable()) return { resolved: false, ambiguous: false, user: null };

  const matches = await User.collection
    .find({ email, tenantId: { $exists: true, $ne: null } })
    .limit(3)
    .toArray();

  // Never guess between companies when a local login has no tenant identity.
  if (matches.length > 1) return { resolved: true, ambiguous: true, user: null };
  if (matches.length !== 1 || !matches[0]?.tenantId) return { resolved: false, ambiguous: false, user: null };

  const tenantId = matches[0].tenantId;
  setTenantContext({ tenantId, role: "public", bypass: false });

  const rawUser = matches[0];
  const rawRole = normalizeRole(rawUser.role || rawUser.legacyRole);
  const tenantAdminRoles = new Set(["admin", "administrator"]);

  // Hydrate tenant admins directly from the identified document so the
  // select:false password hash is retained and a second tenant-scoped query
  // cannot change which account is authenticated.
  if (tenantAdminRoles.has(rawRole)) return { resolved: true, ambiguous: false, user: User.hydrate(rawUser) };

  const user = await User.findById(rawUser._id)
    .select("+password")
    .populate({ path: "roleId", populate: { path: "permissions" } })
    .populate("permissionsOverride");
  return { resolved: true, ambiguous: false, user };
};

export const login = async (req, res, next) => {
  try {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!email || !password) return res.status(400).json({ success: false, message: "Email and password are required." });

    const localResolution = await findUniqueLocalTenantUser(req, email);
    if (localResolution.ambiguous) {
      return res.status(409).json({ success: false, code: "TENANT_SELECTION_REQUIRED", message: "This email is registered with more than one company. Open the company login page or provide the company identifier before signing in." });
    }

    let user = localResolution.user;

    // Platform SuperAdmins are global accounts and have no tenant context.
    // Resolve them before mergeTenantFilter(), because a public login request
    // can legitimately have no tenant yet. The bypass is restricted to the
    // two supported platform role spellings and tenantId:null.
    if (!user) {
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
    if (!user) {
      user = await User.findOne(mergeTenantFilter({ email }))
        .select("+password")
        .populate({ path: "roleId", populate: { path: "permissions" } })
        .populate("permissionsOverride");
    }

    if (!user) {
      await SecurityLog.logEvent({ email, action: "login_failed", status: "failed", severity: "high", ipAddress: req.ip, userAgent: req.headers["user-agent"], details: "User not found" });
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }
    if (user.status !== "active") return res.status(403).json({ success: false, message: `Account ${user.status}.` });
    if (user.lockUntil && user.lockUntil > new Date()) return res.status(423).json({ success: false, message: "Account temporarily locked due to multiple failed login attempts." });

    if (!(await user.matchPassword(password))) {
      user.loginAttempts = Number(user.loginAttempts || 0) + 1;
      if (user.loginAttempts >= 5) user.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
      await user.save({ validateBeforeSave: false });
      await SecurityLog.logEvent({ user: user._id, email: user.email, action: "login_failed", status: "failed", severity: "high", ipAddress: req.ip, userAgent: req.headers["user-agent"], details: "Invalid password" });
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    user.loginAttempts = 0;
    user.lockUntil = null;
    const effectiveRole = effectiveRoleForUser(user);
    const platformOwner = isPlatformOwner(user);
    const platformRoleWithTenant = isPlatformRole(user) && !platformOwner;
    if (platformRoleWithTenant) return res.status(403).json({ success: false, message: "Platform owner account must not belong to a tenant." });
    const permissions = buildPermissions(user);

    if (isCustomer(user) && MFA_ENABLED) {
      await user.save({ validateBeforeSave: false });
      const challenge = await createCustomerLoginChallenge(user);
      await createAuditLog({ user: user._id, action: "mfa_challenge_created", resource: "Authentication", description: "Customer login MFA challenge created.", severity: "medium", ipAddress: req.ip, userAgent: req.headers["user-agent"] });
      await SecurityLog.logEvent({ user: user._id, email: user.email, action: "mfa_challenge_created", status: "success", severity: "medium", ipAddress: req.ip, userAgent: req.headers["user-agent"], details: "Customer password verified; MFA challenge created" });
      return res.status(200).json({ success: true, mfaRequired: true, userId: challenge.userId, devPin: String(process.env.MFA_DEV_MODE || "").toLowerCase() === "true" ? challenge.pin : undefined, message: String(process.env.MFA_DEV_MODE || "").toLowerCase() === "true" ? `Development PIN: ${challenge.pin}` : "A 4-digit verification PIN has been sent to your registered phone." });
    }

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });
    const tokenTenantId = platformOwner ? null : (user.tenantId || null);
    const token = generateToken({ _id: user._id, role: effectiveRole, roleId: user.roleId, email: user.email, permissions, tenantId: tokenTenantId });
    setAuthCookie(res, token);
    await createAuditLog({ user: user._id, action: "login", resource: "Authentication", description: "User successfully logged in.", severity: "medium", ipAddress: req.ip, userAgent: req.headers["user-agent"] });
    await SecurityLog.logEvent({ user: user._id, email: user.email, action: "login_success", status: "success", severity: "medium", ipAddress: req.ip, userAgent: req.headers["user-agent"], details: "Login successful" });
    return res.status(200).json({ success: true, token, user: publicUser(user, permissions) });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body || {};
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const normalizedPhone = String(phone || "").trim();
    if (!name || !normalizedEmail || !normalizedPhone || !password) return res.status(400).json({ success: false, message: "All fields are required." });
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) return res.status(400).json({ success: false, message: "Enter a valid email address." });
    if (!/^\d{10}$/.test(normalizedPhone)) return res.status(400).json({ success: false, message: "Phone number must contain exactly 10 digits." });
    if (password.length < 8 || !/\d/.test(password) || !/[A-Z]/.test(password)) return res.status(400).json({ success: false, message: "Password must be at least 8 characters and include an uppercase letter and a number." });
    const tenantId = req.tenant?._id || req.tenant?.id || req.tenantId || null;
    if (!tenantId) return res.status(400).json({ success: false, message: "Unable to determine the company for this registration. Configure the public tenant or use the company domain and try again." });
    const existingUser = await User.findOne(mergeTenantFilter({ $or: [{ email: normalizedEmail }, { phone: normalizedPhone }] }));
    if (existingUser) return res.status(400).json({ success: false, message: existingUser.email === normalizedEmail ? "Email is already registered." : "Phone number is already registered." });
    const customerRole = await Role.findOne({ name: "customer" });
    const user = await User.create({ name: String(name).trim(), email: normalizedEmail, phone: normalizedPhone, password, status: "active", isVerified: true, role: "customer", roleId: customerRole?._id || null, legacyRole: "customer", tenantId });
    await SecurityLog.logEvent({ user: user._id, email: user.email, action: "register", status: "success", ipAddress: req.ip, userAgent: req.headers["user-agent"], details: "User registration" });
    return res.status(201).json({ success: true, user: publicUser(user, []), message: "Registration successful. You can now log in." });
  } catch (error) { console.error("REGISTER ERROR:", error); return next(error); }
};

export const logout = async (req, res, next) => {
  try {
    clearAuthCookies(res);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("roleId").populate("tenantId");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.json({ success: true, user: { ...user.toObject(), tenantId: user.tenantId?._id || null, tenantSlug: user.tenantId?.slug || null } });
  } catch (error) { return next(error); }
};

export const changePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("+password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (!(await user.matchPassword(req.body.currentPassword))) return res.status(401).json({ success: false, message: "Current password incorrect" });
    const newPassword = String(req.body.newPassword || "");
    if (newPassword.length < 8 || !/\d/.test(newPassword) || !/[A-Z]/.test(newPassword)) return res.status(400).json({ success: false, message: "Password must be at least 8 characters and include an uppercase letter and a number." });
    user.password = newPassword;
    await user.save();
    await SecurityLog.logEvent({ user: user._id, email: user.email, action: "password_changed", status: "success", severity: "medium", ipAddress: req.ip, userAgent: req.headers["user-agent"] });
    return res.json({ success: true, message: "Password changed successfully" });
  } catch (error) { return next(error); }
};

const findPasswordResetUser = async (email) => {
  let user = await User.findOne(mergeTenantFilter({ email }))
    .select("+passwordResetCodeHash +passwordResetExpiresAt +passwordResetAttempts");
  if (!user) {
    user = await runWithTenant(
      { tenantId: null, tenant: null, role: "super_admin", bypass: true },
      async () => User.findOne({ email, role: { $in: ["super_admin", "superadmin"] }, tenantId: null })
        .select("+passwordResetCodeHash +passwordResetExpiresAt +passwordResetAttempts")
    );
  }
  return user;
};

const escapeHtml = (value) => String(value || "").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[char]));

const accountEmailCompanyName = (req) => String(
  req.tenant?.name ||
  req.tenant?.companyName ||
  process.env.MAIL_FROM_NAME ||
  "Global Tours"
).trim() || "Global Tours";

export const requestEmailChange = async (req, res, next) => {
  try {
    const currentPassword = String(req.body?.currentPassword || "");
    const newEmail = String(req.body?.newEmail || "").trim().toLowerCase();

    if (!currentPassword) {
      return res.status(400).json({ success: false, message: "Your current password is required." });
    }
    if (!/^\S+@\S+\.\S+$/.test(newEmail)) {
      return res.status(400).json({ success: false, message: "Enter a valid new email address." });
    }

    const user = await User.findById(req.user._id)
      .select("+password +emailChangeCodeHash +emailChangeExpiresAt +emailChangeAttempts")
      .populate({ path: "roleId", populate: { path: "permissions" } })
      .populate("permissionsOverride");

    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    if (!(await user.matchPassword(currentPassword))) {
      await SecurityLog.logEvent({ user: user._id, email: user.email, action: "email_change_failed", status: "failed", severity: "high", ipAddress: req.ip, userAgent: req.headers["user-agent"], details: "Incorrect current password." });
      return res.status(401).json({ success: false, message: "Current password is incorrect." });
    }
    if (newEmail === String(user.email || "").trim().toLowerCase()) {
      return res.status(400).json({ success: false, message: "The new email address must be different from your current email." });
    }

    const existing = await runWithTenant(
      { tenantId: user.tenantId || null, tenant: req.tenant || null, role: effectiveRoleForUser(user), bypass: isPlatformOwner(user) },
      async () => {
        if (isPlatformOwner(user)) return User.findOne({ email: newEmail, role: { $in: ["super_admin", "superadmin"] }, tenantId: null }).select("_id email");
        return User.findOne({ email: newEmail, tenantId: user.tenantId }).select("_id email");
      }
    );
    if (existing && String(existing._id) !== String(user._id)) {
      return res.status(409).json({ success: false, message: "That email address is already in use by another account." });
    }

    if (!isPlatformOwner(user)) {
      const [staffConflict, agentConflict] = await Promise.all([
        Staff.findOne({ tenantId: user.tenantId, email: newEmail, user: { $ne: user._id } }).select("_id").lean(),
        Agent.findOne({ tenantId: user.tenantId, email: newEmail, user: { $ne: user._id } }).select("_id").lean(),
      ]);
      if (staffConflict || agentConflict) {
        return res.status(409).json({ success: false, message: "That email address is already assigned to another staff or agent profile in this company." });
      }
    }

    const code = String(crypto.randomInt(100000, 1000000));
    user.pendingEmail = newEmail;
    user.emailChangeCodeHash = crypto.createHash("sha256").update(code).digest("hex");
    user.emailChangeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    user.emailChangeAttempts = 0;
    await user.save({ validateBeforeSave: false });

    const companyName = accountEmailCompanyName(req);
    const safeCompanyName = escapeHtml(companyName);
    const subject = `Confirm your new email address - ${companyName}`;
    const text = `We received a request to change your ${companyName} account email to ${newEmail}. Your verification code is: ${code}. This code expires in 10 minutes. If you did not request this change, ignore this email.`;
    const html = `<div style="max-width:620px;margin:0 auto;padding:28px;font-family:Arial,sans-serif;color:#1f2937;line-height:1.6;border:1px solid #e5e7eb;border-radius:12px"><h2 style="margin-top:0;color:#166534">Confirm your email address</h2><p>Your ${safeCompanyName} account email is being changed to <strong>${escapeHtml(newEmail)}</strong>.</p><p>Enter this one-time verification code in your dashboard:</p><div style="margin:22px 0;padding:18px;text-align:center;background:#f0fdf4;border-radius:12px;font-size:30px;font-weight:700;letter-spacing:8px;color:#166534">${code}</div><p>This code expires in <strong>10 minutes</strong>.</p><p>If you did not request this change, ignore this email and keep your current account email.</p><p>Regards,<br>${safeCompanyName}</p></div>`;

    try {
      const { sendEmail } = await import("../services/emailService.js");
      await sendEmail({ to: newEmail, subject, html, text, fromName: companyName, settingsSource: req });
    } catch (emailError) {
      user.pendingEmail = "";
      user.emailChangeCodeHash = "";
      user.emailChangeExpiresAt = null;
      user.emailChangeAttempts = 0;
      await user.save({ validateBeforeSave: false });
      console.error("EMAIL CHANGE VERIFICATION ERROR:", emailError.message);
      return res.status(503).json({ success: false, message: "We could not send the verification email right now. Please try again shortly." });
    }

    await SecurityLog.logEvent({ user: user._id, email: user.email, action: "email_change_requested", status: "success", severity: "medium", ipAddress: req.ip, userAgent: req.headers["user-agent"], details: `Verification code sent to pending address ${newEmail}.` });
    return res.json({ success: true, message: `A verification code has been sent to ${newEmail}.`, pendingEmail: newEmail });
  } catch (error) {
    console.error("EMAIL CHANGE REQUEST ERROR:", error);
    return next(error);
  }
};

export const confirmEmailChange = async (req, res, next) => {
  try {
    const code = String(req.body?.code || "").trim();
    if (!/^\d{6}$/.test(code)) return res.status(400).json({ success: false, message: "Enter the 6-digit verification code." });

    const user = await User.findById(req.user._id)
      .select("+password +emailChangeCodeHash +emailChangeExpiresAt +emailChangeAttempts")
      .populate({ path: "roleId", populate: { path: "permissions" } })
      .populate("permissionsOverride");

    if (!user || !user.pendingEmail || !user.emailChangeCodeHash || !user.emailChangeExpiresAt) {
      return res.status(400).json({ success: false, message: "There is no active email-change request. Request a new verification code." });
    }
    if (new Date(user.emailChangeExpiresAt).getTime() < Date.now()) {
      user.pendingEmail = "";
      user.emailChangeCodeHash = "";
      user.emailChangeExpiresAt = null;
      user.emailChangeAttempts = 0;
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({ success: false, message: "The verification code has expired. Request a new code." });
    }
    if (Number(user.emailChangeAttempts || 0) >= 5) {
      return res.status(429).json({ success: false, message: "Too many incorrect verification attempts. Request a new code." });
    }

    const hash = crypto.createHash("sha256").update(code).digest("hex");
    if (hash !== user.emailChangeCodeHash) {
      user.emailChangeAttempts = Number(user.emailChangeAttempts || 0) + 1;
      await user.save({ validateBeforeSave: false });
      return res.status(401).json({ success: false, message: "Invalid verification code." });
    }

    const oldEmail = user.email;
    const newEmail = String(user.pendingEmail).trim().toLowerCase();

    const duplicate = await runWithTenant(
      { tenantId: user.tenantId || null, tenant: req.tenant || null, role: effectiveRoleForUser(user), bypass: isPlatformOwner(user) },
      async () => isPlatformOwner(user)
        ? User.findOne({ email: newEmail, role: { $in: ["super_admin", "superadmin"] }, tenantId: null }).select("_id")
        : User.findOne({ email: newEmail, tenantId: user.tenantId }).select("_id")
    );
    if (!isPlatformOwner(user)) {
      const [staffConflict, agentConflict] = await Promise.all([
        Staff.findOne({ tenantId: user.tenantId, email: newEmail, user: { $ne: user._id } }).select("_id").lean(),
        Agent.findOne({ tenantId: user.tenantId, email: newEmail, user: { $ne: user._id } }).select("_id").lean(),
      ]);
      if (staffConflict || agentConflict) {
        return res.status(409).json({ success: false, message: "That email address is already assigned to another staff or agent profile in this company." });
      }
    }
    if (duplicate && String(duplicate._id) !== String(user._id)) {
      user.pendingEmail = "";
      user.emailChangeCodeHash = "";
      user.emailChangeExpiresAt = null;
      user.emailChangeAttempts = 0;
      await user.save({ validateBeforeSave: false });
      return res.status(409).json({ success: false, message: "That email address is now in use by another account. Request a new email change." });
    }

    user.email = newEmail;
    user.pendingEmail = "";
    user.emailChangeCodeHash = "";
    user.emailChangeExpiresAt = null;
    user.emailChangeAttempts = 0;
    await user.save();

    const tenantFilter = user.tenantId ? { tenantId: user.tenantId } : {};
    await Promise.allSettled([
      Staff.updateOne({ ...tenantFilter, user: user._id }, { $set: { email: newEmail } }),
      Agent.updateOne({ ...tenantFilter, user: user._id }, { $set: { email: newEmail } }),
    ]);

    const permissions = buildPermissions(user);
    const tokenTenantId = isPlatformOwner(user) ? null : (user.tenantId || null);
    const token = generateToken({ _id: user._id, role: effectiveRoleForUser(user), roleId: user.roleId, email: newEmail, permissions, tenantId: tokenTenantId });
    setAuthCookie(res, token);

    await SecurityLog.logEvent({ user: user._id, email: newEmail, action: "email_changed", status: "success", severity: "high", ipAddress: req.ip, userAgent: req.headers["user-agent"], details: `Account email changed from ${oldEmail} to ${newEmail}.` });
    return res.json({ success: true, message: "Email address changed successfully. Your new email is now used for login and password recovery.", user: publicUser(user, permissions), token });
  } catch (error) {
    console.error("EMAIL CHANGE CONFIRM ERROR:", error);
    return next(error);
  }
};

export const requestPasswordReset = async (req, res, next) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const generic = { success: true, message: "If an account exists for that email address, a password reset code has been sent." };
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ success: false, message: "A valid email address is required." });
    }
    const user = await findPasswordResetUser(email);
    if (!user) return res.json(generic);

    const code = String(crypto.randomInt(100000, 1000000));
    user.passwordResetCodeHash = crypto.createHash("sha256").update(code).digest("hex");
    user.passwordResetExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    user.passwordResetAttempts = 0;
    await user.save({ validateBeforeSave: false });

    const companyName = isPlatformOwner(user)
      ? String(process.env.MAIL_FROM_NAME || "Global Tours").trim() || "Global Tours"
      : String(req.tenant?.name || req.tenant?.companyName || process.env.MAIL_FROM_NAME || "Global Tours").trim() || "Global Tours";
    const safeCompanyName = companyName.replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
    const subject = `Password reset code - ${companyName}`;
    const text = `We received a request to reset your ${companyName} password.\n\nYour password reset code is: ${code}\n\nThis code expires in 10 minutes. If you did not request a password reset, you can ignore this email.`;
    const html = `<div style="max-width:620px;margin:0 auto;padding:28px;font-family:Arial,sans-serif;color:#1f2937;line-height:1.6;border:1px solid #e5e7eb;border-radius:12px"><h2 style="margin-top:0;color:#166534">Reset your password</h2><p>We received a request to reset your <strong>${safeCompanyName}</strong> password.</p><p>Your one-time password reset code is:</p><div style="margin:22px 0;padding:18px;text-align:center;background:#f0fdf4;border-radius:12px;font-size:30px;font-weight:700;letter-spacing:8px;color:#166534">${code}</div><p>This code expires in <strong>10 minutes</strong>.</p><p>If you did not request this, you can safely ignore this email.</p><p>Regards,<br>${safeCompanyName}</p></div>`;

    try {
      const { sendEmail } = await import("../services/emailService.js");
      await sendEmail({ to: user.email, subject, html, text, fromName: companyName, settingsSource: req });
    } catch (emailError) {
      console.error("PASSWORD RESET EMAIL ERROR:", emailError.message);
      return res.status(503).json({ success: false, message: "We could not send the reset email right now. Please try again shortly." });
    }

    await SecurityLog.logEvent({ user: user._id, email: user.email, action: "password_reset_requested", status: "success", severity: "medium", ipAddress: req.ip, userAgent: req.headers["user-agent"], details: "Password reset code sent by email." });
    if (String(process.env.MFA_DEV_MODE || "").toLowerCase() === "true") {
      return res.json({ ...generic, devCode: code, message: `Development reset code: ${code}` });
    }
    return res.json(generic);
  } catch (error) { console.error("PASSWORD RESET REQUEST ERROR:", error); return next(error); }
};

export const resetPasswordWithCode = async (req, res, next) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const code = String(req.body?.code || "").trim();
    const newPassword = String(req.body?.newPassword || "");
    if (!email || !/^\d{6}$/.test(code)) return res.status(400).json({ success: false, message:"Email and a 6-digit reset code are required." });
    if (newPassword.length < 8 || !/\d/.test(newPassword) || !/[A-Z]/.test(newPassword)) return res.status(400).json({ success: false, message: "Password must be at least 8 characters and include an uppercase letter and a number." });
    let user = await User.findOne(mergeTenantFilter({ email })).select("+password +passwordResetCodeHash +passwordResetExpiresAt +passwordResetAttempts");
    if (!user) {
      user = await runWithTenant(
        { tenantId: null, tenant: null, role: "super_admin", bypass: true },
        async () => User.findOne({ email, role: { $in: ["super_admin", "superadmin"] }, tenantId: null })
          .select("+password +passwordResetCodeHash +passwordResetExpiresAt +passwordResetAttempts")
      );
    }
    if (!user || !user.passwordResetCodeHash || !user.passwordResetExpiresAt) return res.status(400).json({ success: false, message: "Invalid or expired reset code." });
    if (new Date(user.passwordResetExpiresAt).getTime() < Date.now()) return res.status(400).json({ success: false, message: "The reset code has expired. Request a new code." });
    if (Number(user.passwordResetAttempts || 0) >= 5) return res.status(429).json({ success: false, message: "Too many incorrect reset attempts. Request a new code." });
    const hash = crypto.createHash("sha256").update(code).digest("hex");
    if (hash !== user.passwordResetCodeHash) { user.passwordResetAttempts = Number(user.passwordResetAttempts || 0) + 1; await user.save({ validateBeforeSave: false }); return res.status(401).json({ success: false, message: "Invalid reset code." }); }
    user.password = newPassword; user.passwordResetCodeHash = ""; user.passwordResetExpiresAt = null; user.passwordResetAttempts = 0; user.loginAttempts = 0; user.lockUntil = null;
    await user.save();
    await SecurityLog.logEvent({ user: user._id, email: user.email, action: "password_reset", status: "success", severity: "high", ipAddress: req.ip, userAgent: req.headers["user-agent"] });
    return res.json({ success: true, message: "Password reset successfully. You can now log in." });
  } catch (error) { console.error("PASSWORD RESET ERROR:", error); return next(error); }
};
