import { createAuditLog } from "../services/auditService.js";
import { getSystemSettings } from "../services/settingsService.js";
import crypto from "crypto";
import "../models/Role.js";
import "../models/Permission.js";
import User from "../models/User.js";
import Role from "../models/Role.js";
import SecurityLog from "../models/SecurityLog.js";
import generateToken from "../utils/generateToken.js";
import buildPermissions from "../utils/buildPermissions.js";
import { sendSMS } from "../services/smsService.js";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 30 * 60 * 1000;

const normalizeRole = (value) => String(value?.name || value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");

/*
 * User.role is the durable role source. roleId is a relational convenience and
 * may legitimately become null/stale after Role records are recreated.
 */
const effectiveRoleForUser = (user) => {
  const durable = normalizeRole(user?.role);
  if (durable) return durable;
  const legacy = normalizeRole(user?.legacyRole);
  if (legacy) return legacy;
  return normalizeRole(user?.roleId) || "customer";
};

const publicUser = (user, permissions = []) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: effectiveRoleForUser(user),
  permissions,
  profileImage: user.profileImage,
  status: user.status,
  isVerified: user.isVerified,
  loyaltyPoints: user.loyaltyPoints,
  referralCode: user.referralCode,
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt,
});

export const login = async (req, res, next) => {
  try {
    const normalizedEmail = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!normalizedEmail || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const user = await User.findOne({ email: normalizedEmail })
      .select("+password")
      .populate({ path: "roleId", populate: { path: "permissions" } })
      .populate("permissionsOverride");

    if (!user) {
      await SecurityLog.create({ email: normalizedEmail, action: "login_failed", resource: "Authentication", description: "Failed authentication attempt", severity: "high", ipAddress: req.ip, userAgent: req.headers["user-agent"], details: "User not found" });
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    if (user.status !== "active") return res.status(403).json({ success: false, message: `Account ${user.status}.` });
    if (user.lockUntil && user.lockUntil > new Date()) return res.status(423).json({ success: false, message: "Account temporarily locked due to multiple failed login attempts." });

    const passwordMatch = await user.matchPassword(password);
    if (!passwordMatch) {
      user.loginAttempts = Number(user.loginAttempts || 0) + 1;
      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) user.lockUntil = new Date(Date.now() + LOCK_TIME);
      await user.save({ validateBeforeSave: false });
      await SecurityLog.create({ user: user._id, email: user.email, action: "login_failed", resource: "Authentication", description: "Failed authentication attempt", severity: "high", ipAddress: req.ip, userAgent: req.headers["user-agent"], details: "Invalid password" });
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const effectiveRole = effectiveRoleForUser(user);
    const permissions = buildPermissions({ ...user.toObject(), role: effectiveRole, roleId: user.roleId, permissionsOverride: user.permissionsOverride });

    user.loginAttempts = 0;
    user.lockUntil = null;
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken({ _id: user._id, role: effectiveRole, roleId: user.roleId, email: user.email, permissions });
    await createAuditLog({ user: user._id, action: "login", resource: "Authentication", description: "User successfully logged in", severity: "medium", ipAddress: req.ip, userAgent: req.headers["user-agent"] });
    await SecurityLog.create({ user: user._id, email: user.email, action: "login_success", resource: "Authentication", description: "User successfully logged in", severity: "medium", ipAddress: req.ip, userAgent: req.headers["user-agent"], details: "Login successful" });

    return res.status(200).json({ success: true, token, user: publicUser(user, permissions) });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    next(error);
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

    const existingUser = await User.findOne({ $or: [{ email: normalizedEmail }, { phone: normalizedPhone }] });
    if (existingUser) return res.status(400).json({ success: false, message: existingUser.email === normalizedEmail ? "Email is already registered." : "Phone number is already registered." });

    const customerRole = await Role.findOne({ name: "customer" });
    const user = await User.create({ name: String(name).trim(), email: normalizedEmail, phone: normalizedPhone, password, status: "active", isVerified: true, role: "customer", roleId: customerRole?._id || null, legacyRole: "customer" });
    await SecurityLog.create({ user: user._id, email: user.email, action: "register", resource: "Authentication", description: "User registration", ipAddress: req.ip, userAgent: req.headers["user-agent"], details: "User registration" });
    const token = generateToken({ _id: user._id, role: "customer", roleId: user.roleId, email: user.email, permissions: [] });
    return res.status(201).json({ success: true, token, user: publicUser(user, []) });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    next(error);
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({ path: "roleId", populate: { path: "permissions" } }).populate("permissionsOverride");
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    const effectiveRole = effectiveRoleForUser(user);
    const permissions = buildPermissions({ ...user.toObject(), role: effectiveRole, roleId: user.roleId, permissionsOverride: user.permissionsOverride });
    return res.status(200).json({ success: true, user: publicUser(user, permissions) });
  } catch (error) {
    console.error("GET ME ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const requestPasswordReset = async (req, res, next) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const phone = normalizeMfaPhone(req.body?.phone);
    if (!/^\S+@\S+\.\S+$/.test(email) || !phone) return res.status(400).json({ success: false, message: "Enter the registered email address and 10-digit phone number." });
    const user = await User.findOne({ email, phone }).select("+passwordResetCodeHash +passwordResetExpiresAt +passwordResetAttempts");
    if (!user) return res.status(200).json({ success: true, message: "If the account details are valid, a reset code has been sent." });
    const settings = await getSystemSettings().catch(() => ({}));
    const companyName = settings?.companyName || "Hussein Mboya Tours";
    const code = String(crypto.randomInt(100000, 1000000));
    user.passwordResetCodeHash = crypto.createHash("sha256").update(code).digest("hex");
    user.passwordResetExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    user.passwordResetAttempts = 0;
    await user.save({ validateBeforeSave: false });
    try {
      await sendSMS(phone, `${companyName} password reset code: ${code}. It expires in 10 minutes. Do not share this code.`);
    } catch (smsError) {
      user.passwordResetCodeHash = "";
      user.passwordResetExpiresAt = null;
      await user.save({ validateBeforeSave: false });
      throw smsError;
    }
    return res.status(200).json({ success: true, message: "A password reset code has been sent to your registered phone." });
  } catch (error) { next(error); }
};

export const resetPasswordWithCode = async (req, res, next) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const phone = normalizeMfaPhone(req.body?.phone);
    const code = String(req.body?.code || "").trim();
    const newPassword = String(req.body?.newPassword || "");
    if (!/^\S+@\S+\.\S+$/.test(email) || !phone || !/^\d{6}$/.test(code)) return res.status(400).json({ success: false, message: "Email, phone number and 6-digit reset code are required." });
    if (newPassword.length < 8 || !/\d/.test(newPassword) || !/[A-Z]/.test(newPassword)) return res.status(400).json({ success: false, message: "Password must be at least 8 characters and include an uppercase letter and a number." });
    const user = await User.findOne({ email, phone }).select("+password +passwordResetCodeHash +passwordResetExpiresAt +passwordResetAttempts");
    if (!user || !user.passwordResetCodeHash || !user.passwordResetExpiresAt || user.passwordResetExpiresAt < new Date()) return res.status(400).json({ success: false, message: "The reset code is invalid or expired." });
    if (Number(user.passwordResetAttempts || 0) >= 5) return res.status(429).json({ success: false, message: "Too many incorrect attempts. Request a new code." });
    const hash = crypto.createHash("sha256").update(code).digest("hex");
    if (hash !== user.passwordResetCodeHash) {
      user.passwordResetAttempts = Number(user.passwordResetAttempts || 0) + 1;
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({ success: false, message: "The reset code is invalid or expired." });
    }
    user.password = newPassword;
    user.passwordResetCodeHash = "";
    user.passwordResetExpiresAt = null;
    user.passwordResetAttempts = 0;
    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();
    await createAuditLog({ user: user._id, action: "password_reset", resource: "Authentication", description: "Password reset completed successfully.", severity: "medium", ipAddress: req.ip, userAgent: req.headers["user-agent"] });
    return res.status(200).json({ success: true, message: "Password reset successfully. You can now log in." });
  } catch (error) { next(error); }
};

export const changePassword = async (req, res, next) => {
  try {
    const currentPassword = String(req.body?.currentPassword || "");
    const newPassword = String(req.body?.newPassword || "");
    if (!currentPassword || !newPassword) return res.status(400).json({ success: false, message: "Current password and new password are required." });
    if (newPassword.length < 8 || !/\d/.test(newPassword) || !/[A-Z]/.test(newPassword)) return res.status(400).json({ success: false, message: "Password must be at least 8 characters and include an uppercase letter and a number." });
    if (currentPassword === newPassword) return res.status(400).json({ success: false, message: "New password must be different from the current password." });
    const user = await User.findById(req.user._id).select("+password");
    if (!user) return res.status(404).json({ success: false, message: "Authenticated user not found." });
    if (!(await user.matchPassword(currentPassword))) return res.status(401).json({ success: false, message: "Current password is incorrect." });
    user.password = newPassword;
    await user.save();
    await createAuditLog({ user: user._id, action: "password_changed", resource: "Authentication", description: "User changed password.", severity: "medium", ipAddress: req.ip, userAgent: req.headers["user-agent"] });
    return res.status(200).json({ success: true, message: "Password changed successfully." });
  } catch (error) { next(error); }
};
