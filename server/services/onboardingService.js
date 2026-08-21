import mongoose from "mongoose";
import Organization from "../models/Organization.js";
import Permission from "../models/Permission.js";
import Role from "../models/Role.js";
import User from "../models/User.js";
import { runWithTenant } from "../tenancy/context.js";

const SUPERADMIN_ROLES = ["superadmin", "super_admin"];

export const ADMIN_PERMISSION_NAMES = [
  "admin.dashboard",
  "user.manage",
  "staff.manage",
  "tour.manage",
  "booking.manage",
  "payment.manage",
  "refund.manage",
  "analytics.view",
  "settings.manage",
  "roles.manage",
  "notifications.view",
  "finance.view",
  "customer.view",
  "tour.view",
  "tour.create",
  "tour.update",
  "booking.view",
  "report.view",
  "guide.view",
  "vehicle.view",
];

export const SUPERADMIN_PERMISSION_NAMES = [
  ...ADMIN_PERMISSION_NAMES,
  "system.audit",
  "system.security",
  "system.database",
  "system.backup",
  "system.settings",
  "tenant.manage",
  "system.maintenance",
];

const permissionMeta = (name) => {
  const [module = "system"] = name.split(".");
  const categoryMap = {
    admin: "dashboard",
    user: "user",
    staff: "staff",
    tour: "tour",
    booking: "booking",
    payment: "payment",
    refund: "payment",
    analytics: "report",
    settings: "system",
    roles: "role",
    notifications: "system",
    finance: "payment",
    customer: "customer",
    guide: "staff",
    vehicle: "vehicle",
    report: "report",
    system: "system",
    tenant: "system",
  };
  const label = name
    .replace(/[._]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
  return {
    name,
    label,
    module,
    category: categoryMap[module] || "other",
    description: `Permission to ${name.replace(/[._]/g, " ")}.`,
    isActive: true,
  };
};

export async function ensureSystemRoles() {
  const allNames = [...new Set([...SUPERADMIN_PERMISSION_NAMES, ...ADMIN_PERMISSION_NAMES])];
  const permissionMap = new Map();

  for (const name of allNames) {
    const permission = await Permission.findOneAndUpdate(
      { name },
      { $set: permissionMeta(name) },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    permissionMap.set(name, permission._id);
  }

  const superadmin = await Role.findOneAndUpdate(
    { name: "superadmin" },
    {
      $set: {
        displayName: "Super Admin",
        description: "Platform-level administrator with unrestricted system and tenant administration access.",
        permissions: SUPERADMIN_PERMISSION_NAMES.map((name) => permissionMap.get(name)),
        isSystem: true,
        status: "active",
        level: 1000,
        isDefault: false,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const admin = await Role.findOneAndUpdate(
    { name: "admin" },
    {
      $set: {
        displayName: "Administrator",
        description: "Company administrator for a single tenant.",
        permissions: ADMIN_PERMISSION_NAMES.map((name) => permissionMap.get(name)),
        isSystem: true,
        status: "active",
        level: 100,
        isDefault: false,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return { superadmin, admin };
}

export async function countSuperAdmins() {
  return User.countDocuments({ role: { $in: SUPERADMIN_ROLES }, status: { $ne: "blocked" } });
}

export async function bootstrapFirstSuperAdmin({
  name,
  email,
  phone,
  password,
  companyName,
  companySlug,
  country = "Kenya",
  timezone = "Africa/Nairobi",
  currency = "KES",
}) {
  if (await countSuperAdmins() > 0) {
    throw new Error("Initial SuperAdmin already exists. Bootstrap is permanently closed.");
  }

  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedPhone = String(phone || "").trim();
  if (!String(name || "").trim()) throw new Error("SuperAdmin name is required.");
  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) throw new Error("A valid SuperAdmin email is required.");
  if (!/^\d{10}$/.test(normalizedPhone)) throw new Error("SuperAdmin phone must contain exactly 10 digits.");
  if (String(password || "").length < 12 || !/\d/.test(password) || !/[A-Z]/.test(password)) {
    throw new Error("SuperAdmin password must be at least 12 characters and include an uppercase letter and a number.");
  }

  const { superadmin, admin } = await runWithTenant({ bypass: true }, () => ensureSystemRoles());

  if (await User.exists({ email: normalizedEmail })) {
    throw new Error("A user with the SuperAdmin email already exists.");
  }

  const slug = String(companySlug || companyName || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  if (!slug) throw new Error("A valid company slug is required.");

  const existingOrganization = await runWithTenant({ bypass: true }, () => Organization.findOne({ slug }).lean());
  if (existingOrganization) throw new Error("That company slug is already in use.");

  let organization;
  let superAdminUser;
  let adminUser;

  try {
    organization = await runWithTenant({ bypass: true }, () => Organization.create({
      name: String(companyName).trim(),
      slug,
      country,
      timezone,
      currency,
      status: "trial",
      subscription: {
        plan: "starter",
        seats: 5,
        trialEndsAt: new Date(Date.now() + 14 * 86400000),
      },
      createdBy: null,
    }));

    superAdminUser = await runWithTenant({ bypass: true }, () => User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      password,
      role: "superadmin",
      legacyRole: "superadmin",
      roleId: superadmin._id,
      status: "active",
      isVerified: true,
    }));

    organization.createdBy = superAdminUser._id;
    await runWithTenant({ bypass: true }, () => organization.save());

    adminUser = await runWithTenant({ tenantId: organization._id, tenant: organization, bypass: false }, () => User.create({
      name: String(name).trim(),
      email: normalizedEmail.replace("@", "+admin@"),
      phone: normalizedPhone,
      password,
      role: "admin",
      legacyRole: "admin",
      roleId: admin._id,
      status: "active",
      isVerified: true,
    }));
  } catch (error) {
    if (adminUser?._id) await runWithTenant({ tenantId: organization?._id, tenant: organization, bypass: false }, () => User.deleteOne({ _id: adminUser._id })).catch(() => {});
    if (superAdminUser?._id) await runWithTenant({ bypass: true }, () => User.deleteOne({ _id: superAdminUser._id })).catch(() => {});
    if (organization?._id) await runWithTenant({ bypass: true }, () => Organization.deleteOne({ _id: organization._id })).catch(() => {});
    throw error;
  }

  return {
    organization,
    superAdmin: { _id: superAdminUser._id, name: superAdminUser.name, email: superAdminUser.email, role: "superadmin" },
    admin: { _id: adminUser._id, name: adminUser.name, email: adminUser.email, role: "admin", tenantId: adminUser.tenantId },
  };
}

export function assertObjectId(value, label) {
  if (!mongoose.Types.ObjectId.isValid(value)) throw new Error(`${label} is invalid.`);
  return new mongoose.Types.ObjectId(value);
}
