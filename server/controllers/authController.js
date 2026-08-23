import crypto from "crypto";
import { mergeTenantFilter, runWithTenant } from "../tenancy/context.js";
import User from "../models/User.js";
import Role from "../models/Role.js";
import SecurityLog from "../models/SecurityLog.js";
import AuditLog from "../models/AuditLog.js";
import generateToken from "../utils/generateToken.js";
import buildPermissions from "../utils/buildPermissions.js";
import { createCustomerLoginChallenge } from "./mfaController.js";
import { sendSMS } from "../services/smsService.js";

const normalizeRole = (value) => String(value?.name || value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
const effectiveRoleForUser = (user) => normalizeRole(user?.role) || normalizeRole(user?.legacyRole) || normalizeRole(user?.roleId) || "customer";
const isPlatformRole = (user) => ["super_admin", "superadmin"].includes(effectiveRoleForUser(user));
const isPlatformOwner = (user) => isPlatformRole(user) && !user.tenantId;
const publicUser = (user, permissions = []) => {
  const role = effectiveRoleForUser(user);
  const platformOwner = ["super_admin", "superadmin"].includes(role);
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role,
    tenantId: platformOwner ? null : (user.tenantId || null),
    permissions,
    profileImage: user.profileImage,
    status: user.status,
    isVerified: user.isVerified,
    loyaltyPoints: user.loyaltyPoints,
    referralCode: user.referralCode,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  };
};
const createAuditLog = (data) => AuditLog.log(data);
const isCustomer = (user) => effectiveRoleForUser(user) === "customer";

export const login = async (req, res, next) => {
  try {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!email || !password) return res.status(400).json({ success: false, message: "Email and password are required." });

    let user = await User.findOne(mergeTenantFilter({ email }))
      .select("+password")
      .populate({ path: "roleId", populate: { path: "permissions" } })
      .populate("permissionsOverride");

    // Platform owners are deliberately tenantless. A tenant-scoped request must
    // still be able to authenticate a tenantless superadmin without allowing a
    // tenant admin to escape its own tenant boundary.
    if (!user) {
      user = await runWithTenant({ tenantId: null, tenant: null, role: "super_admin", bypass: true }, async () => User.findOne({
        email,
        role: { $in: ["super_admin", "superadmin"] },
        tenantId: null,
      })
        .select("+password")
        .populate({ path: "roleId", populate: { path: "permissions" } })
        .populate("permissionsOverride"));
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
    if (platformRoleWithTenant) {
      return res.status(403).json({ success: false, message: "Platform owner account must not belong to a tenant." });
    }

    const permissions = buildPermissions(user);

    if (isCustomer(user)) {
      await user.save({ validateBeforeSave: false });
      const challenge = await createCustomerLoginChallenge(user);
      await createAuditLog({ user: user._id, action: "mfa_challenge_created", resource: "Authentication", description: "Customer login MFA challenge created.", severity: "medium", ipAddress: req.ip, userAgent: req.headers["user-agent"] });
      await SecurityLog.logEvent({ user: user._id, email: user.email, action: "mfa_challenge_created", status: "success", severity: "medium", ipAddress: req.ip, userAgent: req.headers["user-agent"], details: "Customer password verified; MFA challenge created" });
      return res.status(200).json({
        success: true,
        mfaRequired: true,
        userId: challenge.userId,
        devPin: String(process.env.MFA_DEV_MODE || "").toLowerCase() === "true" ? challenge.pin : undefined,
        message: String(process.env.MFA_DEV_MODE || "").toLowerCase() === "true" ? `Development PIN: ${challenge.pin}` : "A 4-digit verification PIN has been sent to your registered phone."
      });
    }

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });
    const tokenTenantId = platformOwner ? null : (user.tenantId || null);
    const token = generateToken({ _id: user._id, role: effectiveRole, roleId: user.roleId, email: user.email, permissions, tenantId: tokenTenantId });
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

    const existingUser = await User.findOne(mergeTenantFilter({ $or: [{ email: normalizedEmail }, { phone: normalizedPhone }] }));
    if (existingUser) return res.status(400).json({ success: false, message: existingUser.email === normalizedEmail ? "Email is already registered." : "Phone number is already registered." });

    const customerRole = await Role.findOne({ name: "customer" });
    const tenantId = req.tenant?._id || req.tenant?.id || req.tenantId || null;
    const user = await User.create({ name: String(name).trim(), email: normalizedEmail, phone: normalizedPhone, password, status: "active", isVerified: true, role: "customer", roleId: customerRole?._id || null, legacyRole: "customer", tenantId });
    await SecurityLog.logEvent({ user: user._id, email: user.email, action: "register", status: "success", ipAddress: req.ip, userAgent: req.headers["user-agent"], details: "User registration" });

    return res.status(201).json({ success: true, user: publicUser(user, []), message: "Registration successful. Please log in to verify your phone PIN." });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
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
    await SecurityLog.logEvent({ user: user._id, email: user.email, action: "password_changed", status: "success", ipAddress: req.ip, userAgent: req.headers["user-agent"] });
    return res.json({ success: true, message: "Password changed successfully" });
  } catch (error) { return next(error); }
};

export const requestPasswordReset = async (req, res, next) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const phone = String(req.body?.phone || "").trim();
    const generic = { success: true, message: "If the account details are valid, a reset code has been sent." };
    if (!email || !phone) return res.status(400).json({ success: false, message: "Email and phone are required." });
    const user = await User.findOne(mergeTenantFilter({ email, phone })).select("+passwordResetCodeHash +passwordResetExpiresAt +passwordResetAttempts");
    if (!user) return res.json(generic);

    const code = String(crypto.randomInt(100000, 1000000));
    user.passwordResetCodeHash = crypto.createHash("sha256").update(code).digest("hex");
    user.passwordResetExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    user.passwordResetAttempts = 0;
    await user.save({ validateBeforeSave: false });
    try { await sendSMS(phone, `Your Global Tours password reset code is ${code}. It expires in 10 minutes.`); } catch (smsError) { console.error("PASSWORD RESET SMS ERROR:", smsError.message); }
    await SecurityLog.logEvent({ user: user._id, email: user.email, action: "password_reset_requested", status: "success", ipAddress: req.ip, userAgent: req.headers["user-agent"] });
    if (String(process.env.MFA_DEV_MODE || "").toLowerCase() === "true") return res.json({ ...generic, devCode: code, message: `Development reset code: ${code}` });
    return res.json(generic);
  } catch (error) { return next(error); }
};

export const resetPasswordWithCode = async (req, res, next) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const phone = String(req.body?.phone || "").trim();
    const code = String(req.body?.code || "").trim();
    const newPassword = String(req.body?.newPassword || "");
    if (!email || !phone || !/^\d{6}$/.test(code)) return res.status(400).json({ success: false, message: "Email, phone and a 6-digit reset code are required." });
    if (newPassword.length < 8 || !/\d/.test(newPassword) || !/[A-Z]/.test(newPassword)) return res.status(400).json({ success: false, message: "Password must be at least 8 characters and include an uppercase letter and a number." });

    const user = await User.findOne(mergeTenantFilter({ email, phone })).select("+password +passwordResetCodeHash +passwordResetExpiresAt +passwordResetAttempts");
    if (!user || !user.passwordResetCodeHash || !user.passwordResetExpiresAt) return res.status(400).json({ success: false, message: "Invalid or expired reset code." });
    if (new Date(user.passwordResetExpiresAt).getTime() < Date.now()) return res.status(400).json({ success: false, message: "The reset code has expired. Request a new code." });
    if (Number(user.passwordResetAttempts || 0) >= 5) return res.status(429).json({ success: false, message: "Too many incorrect reset attempts. Request a new code." });
    const hash = crypto.createHash("sha256").update(code).digest("hex");
    if (hash !== user.passwordResetCodeHash) {
      user.passwordResetAttempts = Number(user.passwordResetAttempts || 0) + 1;
      await user.save({ validateBeforeSave: false });
      return res.status(401).json({ success: false, message: "Invalid reset code." });
    }

    user.password = newPassword;
    user.passwordResetCodeHash = "";
    user.passwordResetExpiresAt = null;
    user.passwordResetAttempts = 0;
    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();
    await SecurityLog.logEvent({ user: user._id, email: user.email, action: "password_reset", status: "success", ipAddress: req.ip, userAgent: req.headers["user-agent"] });
    return res.json({ success: true, message: "Password reset successfully. You can now log in." });
  } catch (error) { return next(error); }
};
