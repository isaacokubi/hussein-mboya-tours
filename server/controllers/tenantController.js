import { tenantFilter } from "../tenancy/tenantQuery.js";
import mongoose from "mongoose";
import Organization from "../models/Organization.js";
import User from "../models/User.js";
import Role from "../models/Role.js";
import { runWithTenant } from "../tenancy/context.js";

const slugify = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

export async function listTenants(req, res, next) {
  try {
    const tenants = await runWithTenant({ bypass: true }, () => Organization.find(tenantFilter(req)).sort({ createdAt: -1 }).lean());
    res.json({ success: true, data: tenants, tenants });
  } catch (error) { next(error); }
}

export async function createTenant(req, res, next) {
  try {
    const { name, slug, country = "Kenya", timezone = "Africa/Nairobi", currency = "KES", admin } = req.body || {};
    if (!name?.trim()) return res.status(400).json({ success: false, message: "Company name is required." });
    if (admin && Object.values(admin).some(Boolean) && !(admin.name && admin.email && admin.phone && admin.password)) return res.status(400).json({ success: false, message: "Provide name, email, phone and password for the first company administrator." });
    if (admin?.phone && !/^\d{10}$/.test(String(admin.phone))) return res.status(400).json({ success: false, message: "Administrator phone must contain exactly 10 digits." });
    if (admin?.password && String(admin.password).length < 8) return res.status(400).json({ success: false, message: "Administrator password must be at least 8 characters." });
    const tenantSlug = slugify(slug || name);
    if (!tenantSlug) return res.status(400).json({ success: false, message: "A valid company slug is required." });
    if (await Organization.findOne({ slug: tenantSlug }).lean()) return res.status(409).json({ success: false, message: "That company slug is already in use." });

    const organization = await runWithTenant({ bypass: true }, () => Organization.create({ name: name.trim(), slug: tenantSlug, country, timezone, currency, status: "trial", subscription: { plan: "starter", seats: 5, trialEndsAt: new Date(Date.now() + 14 * 86400000) }, createdBy: req.user?._id || null }));

    let adminUser = null;
    if (admin?.name && admin?.email && admin?.phone && admin?.password) {
      adminUser = await runWithTenant({ tenantId: organization._id, tenant: organization, bypass: false }, async () => {
        let role = await Role.findOne({ name: "admin" });
        if (!role) role = await runWithTenant({ bypass: true }, () => Role.create({ name: "admin", displayName: "Administrator", description: "Tenant administrator", isSystem: true, level: 100 }));
        return User.create({ name: admin.name.trim(), email: String(admin.email).trim().toLowerCase(), phone: String(admin.phone).trim(), password: admin.password, role: "admin", legacyRole: "admin", roleId: role._id, status: "active", isVerified: true });
      });
      adminUser = adminUser.toObject();
      delete adminUser.password;
    }
    res.status(201).json({ success: true, tenant: organization, admin: adminUser });
  } catch (error) { next(error); }
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
