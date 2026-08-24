import Organization from "../models/Organization.js";
import Subscription from "../models/Subscription.js";
import User from "../models/User.js";
import SecurityLog from "../models/SecurityLog.js";
import { runWithTenant } from "../tenancy/context.js";
import { countSuperAdmins, ensureSystemRoles } from "./onboardingService.js";
import { getDuplicateKeyDetails } from "./duplicateKeyDiagnostic.js";

const slugify = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
const identity = ({ name, email, phone, password }) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedPhone = String(phone || "").trim();
  if (!String(name || "").trim()) throw new Error("Administrator name is required.");
  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) throw new Error("Enter a valid administrator email.");
  if (!/^\d{10}$/.test(normalizedPhone)) throw new Error("Phone number must contain exactly 10 digits.");
  if (String(password || "").length < 12 || !/[A-Z]/.test(password) || !/\d/.test(password)) throw new Error("Password must be at least 12 characters and include an uppercase letter and a number.");
  return { normalizedEmail, normalizedPhone };
};
const PLAN_LIMITS = { starter: { seats: 5, trialDays: 14 }, professional: { seats: 15, trialDays: 14 }, business: { seats: 50, trialDays: 14 }, enterprise: { seats: 250, trialDays: 14 } };

export async function registerTenant({ company, admin, plan = "starter", request }) {
  const selectedPlan = String(plan).toLowerCase();
  const limits = PLAN_LIMITS[selectedPlan];
  if (!limits) throw new Error("Invalid subscription plan.");
  if (!String(company?.name || "").trim()) throw new Error("Company name is required.");

  const adminIdentity = identity(admin);
  const slug = slugify(company.slug || company.name);
  if (!slug) throw new Error("A valid company slug is required.");
  if (await runWithTenant({ bypass: true }, () => Organization.findOne({ slug }).lean())) throw new Error("That company slug is already in use.");

  // Administrator email uniqueness is tenant-scoped. Do not perform a global
  // lookup here because the organization/tenant does not exist yet.

  let organization;
  let adminUser;
  let subscription;
  let superAdminUser;
  try {
    const roles = await ensureSystemRoles();
    const trialStartsAt = new Date();
    const trialEndsAt = new Date(trialStartsAt.getTime() + limits.trialDays * 86400000);

    organization = await runWithTenant({ bypass: true }, () => Organization.create({
      name: String(company.name).trim(), slug, legalName: String(company.legalName || "").trim(), websiteUrl: String(company.websiteUrl || "").trim(),
      supportEmail: adminIdentity.normalizedEmail, supportPhone: adminIdentity.normalizedPhone, country: String(company.country || "Kenya").trim(),
      timezone: String(company.timezone || "Africa/Nairobi").trim(), currency: String(company.currency || "KES").trim().toUpperCase(), status: "trial",
      subscription: { plan: selectedPlan, seats: limits.seats, trialEndsAt }, createdBy: null,
    }));

    adminUser = await runWithTenant({ tenantId: organization._id, tenant: organization, bypass: false }, () => User.create({
      name: String(admin.name).trim(), email: adminIdentity.normalizedEmail, phone: adminIdentity.normalizedPhone, password: admin.password,
      role: "admin", legacyRole: "admin", roleId: roles.admin._id, status: "active", isVerified: true,
    }));

    organization.createdBy = adminUser._id;
    await runWithTenant({ bypass: true }, () => organization.save());

    subscription = await runWithTenant({ bypass: true }, () => Subscription.create({
      tenantId: organization._id, plan: selectedPlan, status: "trialing", provider: "internal", seats: limits.seats,
      trialStartsAt, trialEndsAt, currentPeriodStartsAt: trialStartsAt, currentPeriodEndsAt: trialEndsAt, metadata: { source: "public_registration" },
    }));

    if ((await countSuperAdmins()) === 0) {
      const required = ["BOOTSTRAP_SUPERADMIN_NAME", "BOOTSTRAP_SUPERADMIN_EMAIL", "BOOTSTRAP_SUPERADMIN_PHONE", "BOOTSTRAP_SUPERADMIN_PASSWORD"];
      const missing = required.filter((key) => !String(process.env[key] || "").trim());
      if (missing.length) throw new Error(`Platform first-SuperAdmin provisioning is not configured. Missing: ${missing.join(", ")}`);
      const platform = identity({ name: process.env.BOOTSTRAP_SUPERADMIN_NAME, email: process.env.BOOTSTRAP_SUPERADMIN_EMAIL, phone: process.env.BOOTSTRAP_SUPERADMIN_PHONE, password: process.env.BOOTSTRAP_SUPERADMIN_PASSWORD });
      if (platform.normalizedEmail === adminIdentity.normalizedEmail) throw new Error("Platform SuperAdmin email must be different from the company Admin email.");
      if (await runWithTenant({ bypass: true }, () => User.findOne({ email: platform.normalizedEmail }).lean())) throw new Error("Configured platform SuperAdmin email already belongs to another user.");
      superAdminUser = await runWithTenant({ bypass: true }, () => User.create({
        name: String(process.env.BOOTSTRAP_SUPERADMIN_NAME).trim(), email: platform.normalizedEmail, phone: platform.normalizedPhone,
        password: process.env.BOOTSTRAP_SUPERADMIN_PASSWORD, role: "super_admin", legacyRole: "super_admin", roleId: roles.superadmin._id,
        status: "active", isVerified: true,
      }));
    }

    await runWithTenant({ tenantId: organization._id, tenant: organization, bypass: false }, () => SecurityLog.logEvent({
      user: adminUser._id, email: adminUser.email, action: "account_created", ipAddress: request?.ip || "", userAgent: request?.headers?.["user-agent"] || "",
      status: "success", severity: "medium", details: { source: "public_tenant_registration", tenantId: String(organization._id), plan: selectedPlan, trialEndsAt, firstSuperAdminProvisioned: Boolean(superAdminUser) },
    }));

    return { organization, adminUser, subscription, createdFirstSuperAdmin: Boolean(superAdminUser) };
  } catch (error) {
    if (subscription?._id) await runWithTenant({ bypass: true }, () => Subscription.deleteOne({ _id: subscription._id })).catch(() => {});
    if (adminUser?._id && organization?._id) await runWithTenant({ tenantId: organization._id, tenant: organization, bypass: false }, () => User.deleteOne({ _id: adminUser._id })).catch(() => {});
    if (organization?._id) await runWithTenant({ bypass: true }, () => Organization.deleteOne({ _id: organization._id })).catch(() => {});

    if (error?.code === 11000) {
      const duplicate = getDuplicateKeyDetails(error);
      const duplicateError = new Error(duplicate?.message || "A unique value already exists.");
      duplicateError.code = "DUPLICATE_KEY";
      duplicateError.field = duplicate?.field;
      duplicateError.value = duplicate?.value;
      duplicateError.keyPattern = duplicate?.keyPattern;
      duplicateError.keyValue = duplicate?.keyValue;
      duplicateError.indexName = duplicate?.indexName;
      throw duplicateError;
    }

    throw error;
  }
}
