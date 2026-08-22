import { mergeTenantFilter } from "../tenancy/context.js";
import User from "../models/User.js";
import Role from "../models/Role.js";
import SecurityLog from "../models/SecurityLog.js";
import AuditLog from "../models/AuditLog.js";
import generateToken from "../utils/generateToken.js";
import buildPermissions from "../utils/buildPermissions.js";

const normalizeRole = (value) => String(value?.name || value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");

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
  tenantId: user.tenantId || null,
  permissions,
  profileImage: user.profileImage,
  status: user.status,
  isVerified: user.isVerified,
  loyaltyPoints: user.loyaltyPoints,
  referralCode: user.referralCode,
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt,
});

const createAuditLog = (data) => AuditLog.log(data);

export const login = async (req, res, next) => {
  try {
    const normalizedEmail = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!normalizedEmail || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const userQuery = mergeTenantFilter({ email: normalizedEmail });
    console.log("LOGIN QUERY:", userQuery);

    const user = await User.findOne(userQuery)
      .select("+password")
      .populate({
        path: "roleId",
        populate: { path: "permissions" }
      })
      .populate("permissionsOverride");

    if (!user) {
      await SecurityLog.create({
        email: normalizedEmail,
        action: "login_failed",
        resource: "Authentication",
        description: "Failed authentication attempt",
        severity: "high",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        details: "User not found"
      });
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    if (user.status !== "active") {
      return res.status(403).json({ success: false, message: `Account ${user.status}.` });
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      return res.status(423).json({ success: false, message: "Account temporarily locked due to multiple failed login attempts." });
    }

    const passwordMatches = await user.matchPassword(password);
    if (!passwordMatches) {
      user.loginAttempts = Number(user.loginAttempts || 0) + 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
      }
      await user.save({ validateBeforeSave: false });

      await SecurityLog.create({
        user: user._id,
        email: user.email,
        action: "login_failed",
        resource: "Authentication",
        description: "Failed authentication attempt",
        severity: "high",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        details: "Invalid password"
      });

      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const effectiveRole = effectiveRoleForUser(user);
    const permissions = buildPermissions({
      ...user.toObject(),
      role: effectiveRole,
      roleId: user.roleId,
      permissionsOverride: user.permissionsOverride
    });

    user.loginAttempts = 0;
    user.lockUntil = null;
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken({
      _id: user._id,
      role: effectiveRole,
      roleId: user.roleId,
      email: user.email,
      permissions,
      tenantId: user.tenantId || null
    });

    await createAuditLog({
      user: user._id,
      action: "login",
      resource: "Authentication",
      description: "User successfully logged in",
      severity: "medium",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });

    await SecurityLog.create({
      user: user._id,
      email: user.email,
      action: "login_success",
      resource: "Authentication",
      description: "User successfully logged in",
      severity: "medium",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      details: "Login successful"
    });

    return res.status(200).json({
      success: true,
      token,
      user: publicUser(user, permissions)
    });
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

    if (!name || !normalizedEmail || !normalizedPhone || !password) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      return res.status(400).json({ success: false, message: "Enter a valid email address." });
    }
    if (!/^\d{10}$/.test(normalizedPhone)) {
      return res.status(400).json({ success: false, message: "Phone number must contain exactly 10 digits." });
    }
    if (password.length < 8 || !/\d/.test(password) || !/[A-Z]/.test(password)) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters and include an uppercase letter and a number." });
    }

    const existingUser = await User.findOne(mergeTenantFilter({
      $or: [{ email: normalizedEmail }, { phone: normalizedPhone }]
    }));

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === normalizedEmail ? "Email is already registered." : "Phone number is already registered."
      });
    }

    const customerRole = await Role.findOne({ name: "customer" });
    const tenantId = req.tenant?._id || req.tenant?.id || req.tenantId || null;

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      password,
      status: "active",
      isVerified: true,
      role: "customer",
      roleId: customerRole?._id || null,
      legacyRole: "customer",
      tenantId
    });

    await SecurityLog.create({
      user: user._id,
      email: user.email,
      action: "register",
      resource: "Authentication",
      description: "User registration",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      details: "User registration"
    });

    const token = generateToken({
      _id: user._id,
      role: "customer",
      roleId: user.roleId,
      email: user.email,
      permissions: [],
      tenantId: user.tenantId || null
    });

    return res.status(201).json({ success: true, token, user: publicUser(user, []) });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("roleId")
      .populate("tenantId");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({
      success: true,
      user: {
        ...user.toObject(),
        tenantId: user.tenantId?._id || null,
        tenantSlug: user.tenantId?.slug || null
      }
    });
  } catch (error) {
    return next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const ok = await user.matchPassword(req.body.currentPassword);
    if (!ok) {
      return res.status(401).json({ success: false, message: "Current password incorrect" });
    }

    user.password = req.body.newPassword;
    await user.save();

    return res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    return next(error);
  }
};

export const requestPasswordReset = async (req, res) => {
  return res.json({ success: true, message: "Reset code request accepted" });
};

export const resetPasswordWithCode = async (req, res) => {
  return res.json({ success: true, message: "Password reset accepted" });
};
