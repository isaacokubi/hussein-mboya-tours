/**
 * Purpose: onboarding Service business-logic service. Main declarations: permissionMeta, ensureSystemRoles, countSuperAdmins, countPlatformSuperAdminAccounts, validateStagingSuperAdminIdentity.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import Organization from "../models/Organization.js";
// Load ../models/Permission.js so this module can use its exported dependencies.
import Permission from "../models/Permission.js";
// Load ../models/Role.js so this module can use its exported dependencies.
import Role from "../models/Role.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { runWithTenant } from "../tenancy/context.js";

// Declare SUPERADMIN_ROLES for use by the surrounding module or function.
const SUPERADMIN_ROLES = ["super_admin", "superadmin"];

// Declare ADMIN_PERMISSION_NAMES for use by the surrounding module or function.
export const ADMIN_PERMISSION_NAMES = [
  "admin.dashboard", "user.manage", "staff.manage", "tour.manage", "booking.manage",
  "payment.manage", "refund.manage", "analytics.view", "settings.manage", "roles.manage",
  "notifications.view", "finance.view", "customer.view", "tour.view", "tour.create",
  "tour.update", "booking.view", "report.view", "guide.view", "vehicle.view",
];

// Declare SUPERADMIN_PERMISSION_NAMES for use by the surrounding module or function.
export const SUPERADMIN_PERMISSION_NAMES = [
  ...ADMIN_PERMISSION_NAMES,
  "system.audit", "system.security", "system.database", "system.backup",
  "system.settings", "tenant.manage", "system.maintenance",
];

// Declare permissionMeta for use by the surrounding module or function.
const permissionMeta = (name) => {
  // Declare [module = "system"] for use by the surrounding module or function.
  const [module = "system"] = name.split(".");
  // Declare categoryMap for use by the surrounding module or function.
  const categoryMap = {
    admin: "dashboard", user: "user", staff: "staff", tour: "tour", booking: "booking",
    payment: "payment", refund: "payment", analytics: "report", settings: "system",
    roles: "role", notifications: "system", finance: "payment", customer: "customer",
    guide: "staff", vehicle: "vehicle", report: "report", system: "system", tenant: "system",
  };
  // Return the object assembled below to the caller.
  return {
    name,
    label: name.replace(/[._]/g, " ").replace(/\b\w/g, (character) => character.toUpperCase()),
    module,
    category: categoryMap[module] || "other",
    description: `Permission to ${name.replace(/[._]/g, " ")}.`,
    isActive: true,
  };
};

// Define ensureSystemRoles; its parameters and body implement this operation.
export async function ensureSystemRoles({ permissionModel = Permission, roleModel = Role, withPlatformContext = runWithTenant } = {}) {
  // Declare permissionMap for use by the surrounding module or function.
  const permissionMap = new Map();
  // Repeat the enclosed work for each required iteration.
  for (const name of [...new Set([...SUPERADMIN_PERMISSION_NAMES, ...ADMIN_PERMISSION_NAMES])]) {
    // Declare permission for use by the surrounding module or function.
    const permission = await withPlatformContext({ bypass: true }, () => permissionModel.findOneAndUpdate(
      { name }, { $set: permissionMeta(name) }, { upsert: true, new: true, setDefaultsOnInsert: true }
    ));
    // Perform the side effect or state update expressed on the following line.
    permissionMap.set(name, permission._id);
  }

  // Declare superadmin for use by the surrounding module or function.
  const superadmin = await withPlatformContext({ bypass: true }, () => roleModel.findOneAndUpdate(
    { name: "super_admin" },
    { $set: {
      displayName: "Super Admin",
      description: "Platform-level administrator with unrestricted system and tenant administration access.",
      permissions: SUPERADMIN_PERMISSION_NAMES.map((name) => permissionMap.get(name)),
      isSystem: true, status: "active", level: 1000, isDefault: false,
    } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ));

  // Declare admin for use by the surrounding module or function.
  const admin = await withPlatformContext({ bypass: true }, () => roleModel.findOneAndUpdate(
    { name: "admin" },
    { $set: {
      displayName: "Administrator",
      description: "Company administrator for a single tenant.",
      permissions: ADMIN_PERMISSION_NAMES.map((name) => permissionMap.get(name)),
      isSystem: true, status: "active", level: 100, isDefault: false,
    } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ));

  // Return the object assembled below to the caller.
  return { superadmin, admin };
}

// Define countSuperAdmins; its parameters and body implement this operation.
export async function countSuperAdmins() {
  // Return the result of runWithTenant() to the caller.
  return runWithTenant({ bypass: true }, () => User.countDocuments({ role: { $in: SUPERADMIN_ROLES }, status: { $ne: "blocked" } }));
}

// Define countPlatformSuperAdminAccounts; its parameters and body implement this operation.
export async function countPlatformSuperAdminAccounts({ userModel = User, withPlatformContext = runWithTenant } = {}) {
  // Return the result of withPlatformContext() to the caller.
  return withPlatformContext({ bypass: true }, () => userModel.countDocuments({ role: { $in: SUPERADMIN_ROLES } }));
}

// Declare validateStagingSuperAdminIdentity for use by the surrounding module or function.
const validateStagingSuperAdminIdentity = ({ name, email, phone, password }) => {
  // Declare normalizedEmail for use by the surrounding module or function.
  const normalizedEmail = String(email || "").trim().toLowerCase();
  // Declare normalizedPhone for use by the surrounding module or function.
  const normalizedPhone = String(phone || "").trim();
  // Declare secret for use by the surrounding module or function.
  const secret = String(password || "");
  // Check the condition (!String(name || "").trim()) and run the matching branch.
  if (!String(name || "").trim()) throw new Error("SuperAdmin name is required.");
  // Check the condition (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) and run the matching branch.
  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) throw new Error("A valid SuperAdmin email is required.");
  // Check the condition (!/^\d{10}$/.test(normalizedPhone)) and run the matching branch.
  if (!/^\d{10}$/.test(normalizedPhone)) throw new Error("SuperAdmin phone must contain exactly 10 digits.");
  // Check the condition (secret.length < 12 || !/[A-Z]/.test(secret) || !/[a-z]/.test(secret) |) and run the matching branch.
  if (secret.length < 12 || !/[A-Z]/.test(secret) || !/[a-z]/.test(secret) || !/\d/.test(secret)) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("SuperAdmin password must be at least 12 characters and include uppercase, lowercase, and a number.");
  }
  // Return the object assembled below to the caller.
  return { normalizedEmail, normalizedPhone };
};

/** Create only the platform account. Password hashing is performed by User's save hook. */
// Define bootstrapStagingSuperAdmin; its parameters and body implement this operation.
export async function bootstrapStagingSuperAdmin(
  { name, email, phone, password },
  { count, userModel = User, ensureRoles = ensureSystemRoles, withPlatformContext = runWithTenant } = {},
) {
  // Declare superAdminCount for use by the surrounding module or function.
  const superAdminCount = count
    ? await count()
    : await countPlatformSuperAdminAccounts({ userModel, withPlatformContext });
  // Check the condition (superAdminCount > 0) and run the matching branch.
  if (superAdminCount > 0) return { created: false, reason: "exists" };

  // Declare identity for use by the surrounding module or function.
  const identity = validateStagingSuperAdminIdentity({ name, email, phone, password });
  // Declare duplicateUser for use by the surrounding module or function.
  const duplicateUser = await withPlatformContext({ bypass: true }, () => userModel.findOne({ email: identity.normalizedEmail }).lean());
  // Check the condition (duplicateUser) and run the matching branch.
  if (duplicateUser) throw new Error("That email address already belongs to a user.");

  // Declare { superadmin } for use by the surrounding module or function.
  const { superadmin } = await ensureRoles();
  // Declare user for use by the surrounding module or function.
  const user = await withPlatformContext({ bypass: true }, () => userModel.create({
    name: String(name).trim(), email: identity.normalizedEmail, phone: identity.normalizedPhone,
    password, role: "super_admin", legacyRole: "super_admin", roleId: superadmin._id,
    status: "active", isVerified: true, tenantId: null,
  }));

  // Check the condition (!user.tenantId && user.role === "super_admin" && user.legacyRole === ") and run the matching branch.
  if (!user.tenantId && user.role === "super_admin" && user.legacyRole === "super_admin") {
    // Return the object assembled below to the caller.
    return { created: true, superAdmin: { _id: user._id, role: user.role, tenantId: user.tenantId || null } };
  }

  // Perform the side effect or state update expressed on the following line.
  await withPlatformContext({ bypass: true }, () => userModel.deleteOne({ _id: user._id })).catch(() => {});
  // Stop the current operation by raising a new Error instance.
  throw new Error("Created account failed platform SuperAdmin verification.");
}

// Declare validateIdentity for use by the surrounding module or function.
const validateIdentity = ({ name, email, phone, password, label }) => {
  // Declare normalizedEmail for use by the surrounding module or function.
  const normalizedEmail = String(email || "").trim().toLowerCase();
  // Declare normalizedPhone for use by the surrounding module or function.
  const normalizedPhone = String(phone || "").trim();
  // Check the condition (!String(name || "").trim()) and run the matching branch.
  if (!String(name || "").trim()) throw new Error(`${label} name is required.`);
  // Check the condition (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) and run the matching branch.
  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) throw new Error(`A valid ${label} email is required.`);
  // Check the condition (!/^\d{10}$/.test(normalizedPhone)) and run the matching branch.
  if (!/^\d{10}$/.test(normalizedPhone)) throw new Error(`${label} phone must contain exactly 10 digits.`);
  // Check the condition (String(password || "").length < 12 || !/\d/.test(password) || !/[A-Z]/) and run the matching branch.
  if (String(password || "").length < 12 || !/\d/.test(password) || !/[A-Z]/.test(password)) {
    // Stop the current operation by raising a new Error instance.
    throw new Error(`${label} password must be at least 12 characters and include an uppercase letter and a number.`);
  }
  // Return the object assembled below to the caller.
  return { normalizedEmail, normalizedPhone };
};

// Declare slugify for use by the surrounding module or function.
const slugify = (value) => String(value || "").trim().toLowerCase()
  .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

// Define bootstrapFirstSuperAdmin; its parameters and body implement this operation.
export async function bootstrapFirstSuperAdmin({
  name, email, phone, password, companyName, companySlug,
  country = "Kenya", timezone = "Africa/Nairobi", currency = "KES", admin,
}) {
  // Check the condition (await countSuperAdmins() > 0) and run the matching branch.
  if (await countSuperAdmins() > 0) throw new Error("Initial SuperAdmin already exists. Bootstrap is permanently closed.");

  // Declare superAdminIdentity for use by the surrounding module or function.
  const superAdminIdentity = validateIdentity({ name, email, phone, password, label: "SuperAdmin" });
  // Declare adminIdentity for use by the surrounding module or function.
  const adminIdentity = validateIdentity({ ...admin, label: "First Admin" });
  // Check the condition (superAdminIdentity.normalizedEmail === adminIdentity.normalizedEmail) and run the matching branch.
  if (superAdminIdentity.normalizedEmail === adminIdentity.normalizedEmail) throw new Error("SuperAdmin and first Admin must use different email addresses.");

  // Declare { superadmin, admin: adminRole } for use by the surrounding module or function.
  const { superadmin, admin: adminRole } = await ensureSystemRoles();
  // Declare slug for use by the surrounding module or function.
  const slug = slugify(companySlug || companyName);
  // Check the condition (!slug) and run the matching branch.
  if (!slug) throw new Error("A valid company slug is required.");

  // Declare duplicateUser for use by the surrounding module or function.
  const duplicateUser = await runWithTenant({ bypass: true }, () => User.findOne({
    email: { $in: [superAdminIdentity.normalizedEmail, adminIdentity.normalizedEmail] },
  }).lean());
  // Check the condition (duplicateUser) and run the matching branch.
  if (duplicateUser) throw new Error("One of the onboarding email addresses already belongs to a user.");

  // Declare existingOrganization for use by the surrounding module or function.
  const existingOrganization = await runWithTenant({ bypass: true }, () => Organization.findOne({ slug }).lean());
  // Check the condition (existingOrganization) and run the matching branch.
  if (existingOrganization) throw new Error("That company slug is already in use.");

  // Declare organization for use by the surrounding module or function.
  let organization = null;
  // Declare superAdminUser for use by the surrounding module or function.
  let superAdminUser = null;
  // Declare adminUser for use by the surrounding module or function.
  let adminUser = null;
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    organization = await runWithTenant({ bypass: true }, () => Organization.create({
      name: String(companyName || "").trim(), slug, country, timezone, currency,
      status: "trial", subscription: { plan: "starter", seats: 5, trialEndsAt: new Date(Date.now() + 14 * 86400000) },
      createdBy: null,
    }));

    // Perform the side effect or state update expressed on the following line.
    superAdminUser = await runWithTenant({ bypass: true }, () => User.create({
      name: String(name).trim(), email: superAdminIdentity.normalizedEmail, phone: superAdminIdentity.normalizedPhone,
      password, role: "super_admin", legacyRole: "super_admin", roleId: superadmin._id,
      status: "active", isVerified: true,
    }));

    // Perform the side effect or state update expressed on the following line.
    organization.createdBy = superAdminUser._id;
    // Perform the side effect or state update expressed on the following line.
    await runWithTenant({ bypass: true }, () => organization.save());

    // Perform the side effect or state update expressed on the following line.
    adminUser = await runWithTenant({ tenantId: organization._id, tenant: organization, bypass: false }, () => User.create({
      name: String(admin.name).trim(), email: adminIdentity.normalizedEmail, phone: adminIdentity.normalizedPhone,
      password: admin.password, role: "admin", legacyRole: "admin", roleId: adminRole._id,
      status: "active", isVerified: true,
    }));
  } catch (error) {
    // Check the condition (adminUser?._id && organization?._id) and run the matching branch.
    if (adminUser?._id && organization?._id) await runWithTenant({ tenantId: organization._id, tenant: organization, bypass: false }, () => User.deleteOne({ _id: adminUser._id })).catch(() => {});
    // Check the condition (superAdminUser?._id) and run the matching branch.
    if (superAdminUser?._id) await runWithTenant({ bypass: true }, () => User.deleteOne({ _id: superAdminUser._id })).catch(() => {});
    // Check the condition (organization?._id) and run the matching branch.
    if (organization?._id) await runWithTenant({ bypass: true }, () => Organization.deleteOne({ _id: organization._id })).catch(() => {});
    // Stop the current operation by raising the value of error.
    throw error;
  }

  // Return the object assembled below to the caller.
  return {
    organization,
    superAdmin: { _id: superAdminUser._id, name: superAdminUser.name, email: superAdminUser.email, role: "super_admin" },
    admin: { _id: adminUser._id, name: adminUser.name, email: adminUser.email, role: "admin", tenantId: adminUser.tenantId },
  };
}
