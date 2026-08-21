import mongoose from "mongoose";
import User from "../models/User.js";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";
import Organization from "../models/Organization.js";
import SecurityLog from "../models/SecurityLog.js";
import { createAuditLog } from "../services/auditService.js";
import generateToken from "../utils/generateToken.js";
import buildPermissions from "../utils/buildPermissions.js";

const SYSTEM_ROLES = [
  { name: "super_admin", displayName: "Super Admin", description: "Platform tenant owner with full access.", level: 100, isDefault: false },
  { name: "admin", displayName: "Admin", description: "Tenant administrator.", level: 90, isDefault: false },
  { name: "manager", displayName: "Tour Manager", description: "Manages tours and operations.", level: 70, isDefault: false },
  { name: "tour_guide", displayName: "Tour Guide", description: "Manages assigned tours and guests.", level: 50, isDefault: false },
  { name: "driver", displayName: "Driver", description: "Manages assigned transport duties.", level: 40, isDefault: false },
  { name: "agent", displayName: "Travel Agent", description: "Manages agent bookings and customers.", level: 40, isDefault: false },
  { name: "customer", displayName: "Customer", description: "Default customer account.", level: 10, isDefault: true },
];

const slugify = (value) => String(value || "")
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "")
  .slice(0, 80) || `tenant-${Date.now()}`;

const validateInput = ({ companyName, name, email, phone, password }) => {
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const normalizedPhone = String(phone || "").trim();
  if (!companyName || !name || !normalizedEmail || !normalizedPhone || !password) return "Company name, administrator name, email, phone and password are required.";
  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) return "Enter a valid email address.";
  if (!/^\d{10}$/.test(normalizedPhone)) return "Phone number must contain exactly 10 digits.";
  if (String(password).length < 8 || !/\d/.test(password) || !/[A-Z]/.test(password)) return "Password must be at least 8 characters and include an uppercase letter and a number.";
  return null;
};

export const bootstrapTenant = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    const input = req.body || {};
    const validationError = validateInput(input);
    if (validationError) return res.status(400).json({ success: false, message: validationError });

    const normalizedEmail = input.email.trim().toLowerCase();
    const normalizedPhone = String(input.phone).trim();

    const existingOrganizations = await Organization.countDocuments();
    const existingUsers = await User.countDocuments();
    if (existingOrganizations > 0 || existingUsers > 0) {
      return res.status(409).json({ success: false, message: "Initial tenant bootstrap is already completed. Use normal tenant administration to create additional accounts." });
    }

    const existingEmail = await User.findOne({ email: normalizedEmail }).select("_id").lean();
    if (existingEmail) return res.status(409).json({ success: false, message: "Email is already registered." });

    const existingPhone = await User.findOne({ phone: normalizedPhone }).select("_id").lean();
    if (existingPhone) return res.status(409).json({ success: false, message: "Phone number is already registered." });

    const permissions = await Permission.find({}).select("_id").lean();
    const permissionIds = permissions.map((permission) => permission._id);
    const baseSlug = slugify(input.companyName);

    let organization;
    let superAdmin;

    await session.withTransaction(async () => {
      const roleMap = new Map();
      for (const definition of SYSTEM_ROLES) {
        const [role] = await Role.create([{
          ...definition,
          permissions: definition.name === "super_admin" ? permissionIds : [],
          isSystem: true,
          status: "active",
        }], { session });
        roleMap.set(role.name, role);
      }

      const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
      const [createdOrganization] = await Organization.create([{
        name: String(input.companyName).trim(),
        slug: baseSlug,
        legalName: String(input.legalName || input.companyName).trim(),
        supportEmail: normalizedEmail,
        supportPhone: normalizedPhone,
        country: String(input.country || "Kenya").trim(),
        timezone: String(input.timezone || "Africa/Nairobi").trim(),
        currency: String(input.currency || "KES").trim().toUpperCase(),
        status: "trial",
        subscription: { plan: "starter", seats: 5, trialEndsAt },
        createdBy: null,
      }], { session });
      organization = createdOrganization;

      const [createdUser] = await User.create([{
        name: String(input.name).trim(),
        email: normalizedEmail,
        phone: normalizedPhone,
        password: input.password,
        status: "active",
        isVerified: true,
        role: "super_admin",
        roleId: roleMap.get("super_admin")._id,
        legacyRole: "super_admin",
        organizationId: organization._id,
      }], { session });
      superAdmin = createdUser;

      await Organization.updateOne({ _id: organization._id }, { $set: { createdBy: superAdmin._id } }, { session });
    });

    const permissionsForToken = buildPermissions({ ...superAdmin.toObject(), role: "super_admin", roleId: superAdmin.roleId, permissionsOverride: [] });
    const token = generateToken({ _id: superAdmin._id, role: "super_admin", roleId: superAdmin.roleId, organizationId: organization._id, email: superAdmin.email, permissions: permissionsForToken });

    await SecurityLog.create({ user: superAdmin._id, email: superAdmin.email, action: "bootstrap_register", resource: "Organization", description: "Initial tenant and Super Admin account created.", severity: "high", ipAddress: req.ip, userAgent: req.headers["user-agent"], details: `Organization ${organization._id} created.` });
    await createAuditLog({ user: superAdmin._id, action: "bootstrap_register", resource: "Organization", description: "Initial tenant and Super Admin account created.", severity: "high", ipAddress: req.ip, userAgent: req.headers["user-agent"] });

    return res.status(201).json({
      success: true,
      message: "Tenant and Super Admin created successfully.",
      token,
      organization: { _id: organization._id, name: organization.name, slug: organization.slug, status: organization.status, subscription: organization.subscription },
      user: { _id: superAdmin._id, name: superAdmin.name, email: superAdmin.email, phone: superAdmin.phone, role: "super_admin", organizationId: organization._id, permissions: permissionsForToken },
    });
  } catch (error) {
    console.error("BOOTSTRAP TENANT ERROR:", error);
    next(error);
  } finally {
    await session.endSession();
  }
};
