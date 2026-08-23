import Organization from "../models/Organization.js";
import Permission from "../models/Permission.js";
import Role from "../models/Role.js";
import User from "../models/User.js";
import { runWithTenant } from "../tenancy/context.js";

const SUPERADMIN_ROLES = ["super_admin", "superadmin"];

export const ADMIN_PERMISSION_NAMES = [
  "admin.dashboard", "user.manage", "staff.manage", "tour.manage", "booking.manage",
  "payment.manage", "refund.manage", "analytics.view", "settings.manage", "roles.manage",
  "notifications.view", "finance.view", "customer.view", "tour.view", "tour.create",
  "tour.update", "booking.view", "report.view", "guide.view", "vehicle.view",
];

export const SUPERADMIN_PERMISSION_NAMES = [
  ...ADMIN_PERMISSION_NAMES,
  "system.audit", "system.security", "system.database", "system.backup",
  "system.settings", "tenant.manage", "system.maintenance",
];

const permissionMeta = (name) => {
  const [module = "system"] = name.split(".");
  const categoryMap = {
    admin: "dashboard", user: "user", staff: "staff", tour: "tour", booking: "booking",
    payment: "payment", refund: "payment", analytics: "report", settings: "system",
    roles: "role", notifications: "system", finance: "payment", customer: "customer",
    guide: "staff", vehicle: "vehicle", report: "report", system: "system", tenant: "system",
  };
  return {
    name,
    label: name.replace(/[._]/g, " ").replace(/\b\w/g, (character) => character.toUpperCase()),
    module,
    category: categoryMap[module] || "other",
    description: `Permission to ${name.replace(/[._]/g, " ")}.`,
    isActive: true,
  };
};

export async function ensureSystemRoles() {
  const permissionMap = new Map();
  for (const name of [...new Set([...SUPERADMIN_PERMISSION_NAMES, ...ADMIN_PERMISSION_NAMES])]) {
    const permission = await runWithTenant({ bypass: true }, () => Permission.findOneAndUpdate(
      { name }, { $set: permissionMeta(name) }, { upsert: true, new: true, setDefaultsOnInsert: true }
    ));
    permissionMap.set(name, permission._id);
  }

  const superadmin = await runWithTenant({ bypass: true }, () => Role.findOneAndUpdate(
    { name: "super_admin" },
    { $set: {
      displayName: "Super Admin",
      description: "Platform-level administrator with unrestricted system and tenant administration access.",
      permissions: SUPERADMIN_PERMISSION_NAMES.map((name) => permissionMap.get(name)),
      isSystem: true, status: "active", level: 1000, isDefault: false,
    } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ));

  const admin = await runWithTenant({ bypass: true }, () => Role.findOneAndUpdate(
    { name: "admin" },
    { $set: {
      displayName: "Administrator",
      description: "Company administrator for a single tenant.",
      permissions: ADMIN_PERMISSION_NAMES.map((name) => permissionMap.get(name)),
      isSystem: true, status: "active", level: 100, isDefault: false,
    } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ));

  return { superadmin, admin };
}

export async function countSuperAdmins() {
  return runWithTenant({ bypass: true }, () => User.countDocuments({ role: { $in: SUPERADMIN_ROLES }, status: { $ne: "blocked" } }));
}

const validateIdentity = ({ name, email, phone, password, label }) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedPhone = String(phone || "").trim();
  if (!String(name || "").trim()) throw new Error(`${label} name is required.`);
  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) throw new Error(`A valid ${label} email is required.`);
  if (!/^\d{10}$/.test(normalizedPhone)) throw new Error(`${label} phone must contain exactly 10 digits.`);
  if (String(password || "").length < 12 || !/\d/.test(password) || !/[A-Z]/.test(password)) {
    throw new Error(`${label} password must be at least 12 characters and include an uppercase letter and a number.`);
  }
  return { normalizedEmail, normalizedPhone };
};

const slugify = (value) => String(value || "").trim().toLowerCase()
  .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

export async function bootstrapFirstSuperAdmin({
  name, email, phone, password, companyName, companySlug,
  country = "Kenya", timezone = "Africa/Nairobi", currency = "KES", admin,
}) {
  if (await countSuperAdmins() > 0) throw new Error("Initial SuperAdmin already exists. Bootstrap is permanently closed.");

  const superAdminIdentity = validateIdentity({ name, email, phone, password, label: "SuperAdmin" });
  const adminIdentity = validateIdentity({ ...admin, label: "First Admin" });
  if (superAdminIdentity.normalizedEmail === adminIdentity.normalizedEmail) throw new Error("SuperAdmin and first Admin must use different email addresses.");

  const { superadmin, admin: adminRole } = await ensureSystemRoles();
  const slug = slugify(companySlug || companyName);
  if (!slug) throw new Error("A valid company slug is required.");

  const duplicateUser = await runWithTenant({ bypass: true }, () => User.findOne({
    email: { $in: [superAdminIdentity.normalizedEmail, adminIdentity.normalizedEmail] },
  }).lean());
  if (duplicateUser) throw new Error("One of the onboarding email addresses already belongs to a user.");

  const existingOrganization = await runWithTenant({ bypass: true }, () => Organization.findOne({ slug }).lean());
  if (existingOrganization) throw new Error("That company slug is already in use.");

  let organization = null;
  let superAdminUser = null;
  let adminUser = null;
  try {
    organization = await runWithTenant({ bypass: true }, () => Organization.create({
      name: String(companyName || "").trim(), slug, country, timezone, currency,
      status: "trial", subscription: { plan: "starter", seats: 5, trialEndsAt: new Date(Date.now() + 14 * 86400000) },
      createdBy: null,
    }));

    superAdminUser = await runWithTenant({ bypass: true }, () => User.create({
      name: String(name).trim(), email: superAdminIdentity.normalizedEmail, phone: superAdminIdentity.normalizedPhone,
      password, role: "super_admin", legacyRole: "super_admin", roleId: superadmin._id,
      status: "active", isVerified: true,
    }));

    organization.createdBy = superAdminUser._id;
    await runWithTenant({ bypass: true }, () => organization.save());

    adminUser = await runWithTenant({ tenantId: organization._id, tenant: organization, bypass: false }, () => User.create({
      name: String(admin.name).trim(), email: adminIdentity.normalizedEmail, phone: adminIdentity.normalizedPhone,
      password: admin.password, role: "admin", legacyRole: "admin", roleId: adminRole._id,
      status: "active", isVerified: true,
    }));
  } catch (error) {
    if (adminUser?._id && organization?._id) await runWithTenant({ tenantId: organization._id, tenant: organization, bypass: false }, () => User.deleteOne({ _id: adminUser._id })).catch(() => {});
    if (superAdminUser?._id) await runWithTenant({ bypass: true }, () => User.deleteOne({ _id: superAdminUser._id })).catch(() => {});
    if (organization?._id) await runWithTenant({ bypass: true }, () => Organization.deleteOne({ _id: organization._id })).catch(() => {});
    throw error;
  }

  return {
    organization,
    superAdmin: { _id: superAdminUser._id, name: superAdminUser.name, email: superAdminUser.email, role: "super_admin" },
    admin: { _id: adminUser._id, name: adminUser.name, email: adminUser.email, role: "admin", tenantId: adminUser.tenantId },
  };
}
