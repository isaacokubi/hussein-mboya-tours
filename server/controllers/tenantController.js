import mongoose from "mongoose";
import Organization from "../models/Organization.js";
import User from "../models/User.js";
import { runWithTenant } from "../tenancy/context.js";
import { ensureSystemRoles } from "../services/onboardingService.js";

const slugify = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

const validateAdmin = (admin) => {
  if (!admin) return null;
  const values = Object.values(admin).filter(Boolean);
  if (!values.length) return null;
  if (!(admin.name && admin.email && admin.phone && admin.password)) throw new Error("Provide name, email, phone and password for the first company administrator.");
  if (!/^\S+@\S+\.\S+$/.test(String(admin.email).trim())) throw new Error("Administrator email is invalid.");
  if (!/^\d{10}$/.test(String(admin.phone).trim())) throw new Error("Administrator phone must contain exactly 10 digits.");
  if (String(admin.password).length < 12 || !/[A-Z]/.test(admin.password) || !/\d/.test(admin.password)) throw new Error("Administrator password must be at least 12 characters and include an uppercase letter and a number.");
  return { ...admin, email: String(admin.email).trim().toLowerCase(), phone: String(admin.phone).trim() };
};

export async function listTenants(req, res, next) {
  try {
    const tenants = await runWithTenant({ bypass: true }, () => Organization.find({}).sort({ createdAt: -1 }).lean());
    res.json({ success: true, data: tenants, tenants });
  } catch (error) { next(error); }
}

export async function createTenant(req, res, next) {
  let organization = null;
  let adminUser = null;
  try {
    const { name, slug, country = "Kenya", timezone = "Africa/Nairobi", currency = "KES" } = req.body || {};
    if (!name?.trim()) return res.status(400).json({ success: false, message: "Company name is required." });
    const admin = validateAdmin(req.body?.admin);
    const tenantSlug = slugify(slug || name);
    if (!tenantSlug) return res.status(400).json({ success: false, message: "A valid company slug is required." });

    const duplicateSlug = await runWithTenant({ bypass: true }, () => Organization.findOne({ slug: tenantSlug }).lean());
    if (duplicateSlug) return res.status(409).json({ success: false, message: "That company slug is already in use." });
    if (admin && await runWithTenant({ bypass: true }, () => User.exists({ email: admin.email }))) {
      return res.status(409).json({ success: false, message: "A user with the administrator email already exists." });
    }

    const roles = await ensureSystemRoles();
    organization = await runWithTenant({ bypass: true }, () => Organization.create({
      name: name.trim(), slug: tenantSlug, country, timezone, currency, status: "trial",
      subscription: { plan: "starter", seats: 5, trialEndsAt: new Date(Date.now() + 14 * 86400000) },
      createdBy: req.user?._id || null,
    }));

    if (admin) {
      adminUser = await runWithTenant({ tenantId: organization._id, tenant: organization, bypass: false }, () => User.create({
        name: admin.name.trim(), email: admin.email, phone: admin.phone, password: admin.password,
        role: "admin", legacyRole: "admin", roleId: roles.admin._id, status: "active", isVerified: true,
      }));
    }

    const safeAdmin = adminUser ? { _id: adminUser._id, name: adminUser.name, email: adminUser.email, phone: adminUser.phone, role: "admin", tenantId: adminUser.tenantId } : null;
    return res.status(201).json({ success: true, tenant: organization, admin: safeAdmin });
  } catch (error) {
    if (adminUser?._id && organization?._id) await runWithTenant({ tenantId: organization._id, tenant: organization, bypass: false }, () => User.deleteOne({ _id: adminUser._id })).catch(() => {});
    if (organization?._id) await runWithTenant({ bypass: true }, () => Organization.deleteOne({ _id: organization._id })).catch(() => {});
    return next(error);
  }
}

export async function getTenant(req, res, next) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid tenant ID." });
    const tenant = await runWithTenant({ bypass: true }, () => Organization.findById(req.params.id).lean());
    if (!tenant) return res.status(404).json({ success: false, message: "Tenant not found." });
    res.json({ success: true, tenant });
  } catch (error) { next(error); }
}

export async function updateTenant(req, res, next) {
  try {
    const allowed = ["name", "legalName", "logoUrl", "websiteUrl", "domain", "supportEmail", "supportPhone", "country", "timezone", "currency", "status", "subscription", "features", "settings"];
    const updates = Object.fromEntries(Object.entries(req.body || {}).filter(([key]) => allowed.includes(key)));
    const tenant = await runWithTenant({ bypass: true }, () => Organization.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true }).lean());
    if (!tenant) return res.status(404).json({ success: false, message: "Tenant not found." });
    res.json({ success: true, tenant });
  } catch (error) { next(error); }
}
