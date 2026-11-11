/**
 * Purpose: tenant Controller HTTP controller. Main declarations: slugify, validateAdmin, listTenants, createTenant, getTenant.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter } from "../tenancy/context.js";
// Load ../tenancy/tenantQuery.js so this module can use its exported dependencies.
import { tenantFilter } from "../tenancy/tenantQuery.js";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../models/Organization.js so this module can use its exported dependencies.
import Organization from "../models/Organization.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { runWithTenant } from "../tenancy/context.js";
// Load ../services/onboardingService.js so this module can use its exported dependencies.
import { ensureSystemRoles } from "../services/onboardingService.js";

// Declare slugify for use by the surrounding module or function.
const slugify = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

// Declare validateAdmin for use by the surrounding module or function.
const validateAdmin = (admin) => {
  // Check the condition (!admin) and run the matching branch.
  if (!admin) return null;
  // Declare values for use by the surrounding module or function.
  const values = Object.values(admin).filter(Boolean);
  // Check the condition (!values.length) and run the matching branch.
  if (!values.length) return null;
  // Check the condition (!(admin.name && admin.email && admin.phone && admin.password)) and run the matching branch.
  if (!(admin.name && admin.email && admin.phone && admin.password)) throw new Error("Provide name, email, phone and password for the first company administrator.");
  // Check the condition (!/^\S+@\S+\.\S+$/.test(String(admin.email).trim())) and run the matching branch.
  if (!/^\S+@\S+\.\S+$/.test(String(admin.email).trim())) throw new Error("Administrator email is invalid.");
  // Check the condition (!/^\d{10}$/.test(String(admin.phone).trim())) and run the matching branch.
  if (!/^\d{10}$/.test(String(admin.phone).trim())) throw new Error("Administrator phone must contain exactly 10 digits.");
  // Check the condition (String(admin.password).length < 12 || !/[A-Z]/.test(admin.password) ||) and run the matching branch.
  if (String(admin.password).length < 12 || !/[A-Z]/.test(admin.password) || !/\d/.test(admin.password)) throw new Error("Administrator password must be at least 12 characters and include an uppercase letter and a number.");
  // Return the object assembled below to the caller.
  return { ...admin, email: String(admin.email).trim().toLowerCase(), phone: String(admin.phone).trim() };
};

// Define listTenants; its parameters and body implement this operation.
export async function listTenants(req, res, next) {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenants for use by the surrounding module or function.
    const tenants = await runWithTenant({ bypass: true }, () => Organization.find(tenantFilter(req)).sort({ createdAt: -1 }).lean());
    // Perform the side effect or state update expressed on the following line.
    res.json({ success: true, data: tenants, tenants });
  } catch (error) { next(error); }
}

// Define createTenant; its parameters and body implement this operation.
export async function createTenant(req, res, next) {
  // Declare organization for use by the surrounding module or function.
  let organization = null;
  // Declare adminUser for use by the surrounding module or function.
  let adminUser = null;
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare { name, slug, country = "Kenya", timezone = "Africa/Nairobi", currency = "KES" } for use by the surrounding module or function.
    const { name, slug, country = "Kenya", timezone = "Africa/Nairobi", currency = "KES" } = req.body || {};
    // Check the condition (!name?.trim()) and run the matching branch.
    if (!name?.trim()) return res.status(400).json({ success: false, message: "Company name is required." });
    // Declare admin for use by the surrounding module or function.
    const admin = validateAdmin(req.body?.admin);
    // Declare tenantSlug for use by the surrounding module or function.
    const tenantSlug = slugify(slug || name);
    // Check the condition (!tenantSlug) and run the matching branch.
    if (!tenantSlug) return res.status(400).json({ success: false, message: "A valid company slug is required." });

    // Declare duplicateSlug for use by the surrounding module or function.
    const duplicateSlug = await runWithTenant({ bypass: true }, () => Organization.findOne({ slug: tenantSlug }).lean());
    // Check the condition (duplicateSlug) and run the matching branch.
    if (duplicateSlug) return res.status(409).json({ success: false, message: "That company slug is already in use." });
    // Check the condition (admin && await runWithTenant({ bypass: true }, () => User.exists({ ema) and run the matching branch.
    if (admin && await runWithTenant({ bypass: true }, () => User.exists({ email: admin.email }))) {
      // Return the result of res.status(409).json() to the caller.
      return res.status(409).json({ success: false, message: "A user with the administrator email already exists." });
    }

    // Declare roles for use by the surrounding module or function.
    const roles = await ensureSystemRoles();
    // Perform the side effect or state update expressed on the following line.
    organization = await runWithTenant({ bypass: true }, () => Organization.create({
      name: name.trim(), slug: tenantSlug, country, timezone, currency, status: "trial",
      subscription: { plan: "starter", seats: 5, trialEndsAt: new Date(Date.now() + 14 * 86400000) },
      createdBy: req.user?._id || null,
    }));

    // Check the condition (admin) and run the matching branch.
    if (admin) {
      // Perform the side effect or state update expressed on the following line.
      adminUser = await runWithTenant({ tenantId: organization._id, tenant: organization, bypass: false }, () => User.create({
        name: admin.name.trim(), email: admin.email, phone: admin.phone, password: admin.password,
        role: "admin", legacyRole: "admin", roleId: roles.admin._id, status: "active", isVerified: true,
      }));
    }

    // Declare safeAdmin for use by the surrounding module or function.
    const safeAdmin = adminUser ? { _id: adminUser._id, name: adminUser.name, email: adminUser.email, phone: adminUser.phone, role: "admin", tenantId: adminUser.tenantId } : null;
    // Return the result of res.status(201).json() to the caller.
    return res.status(201).json({ success: true, tenant: organization, admin: safeAdmin });
  } catch (error) {
    // Check the condition (adminUser?._id && organization?._id) and run the matching branch.
    if (adminUser?._id && organization?._id) await runWithTenant({ tenantId: organization._id, tenant: organization, bypass: false }, () => User.deleteOne({ _id: adminUser._id })).catch(() => {});
    // Check the condition (organization?._id) and run the matching branch.
    if (organization?._id) await runWithTenant({ bypass: true }, () => Organization.deleteOne({ _id: organization._id })).catch(() => {});
    // Return the result of next() to the caller.
    return next(error);
  }
}

// Define getTenant; its parameters and body implement this operation.
export async function getTenant(req, res, next) {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!mongoose.Types.ObjectId.isValid(req.params.id)) and run the matching branch.
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid tenant ID." });
    // Declare tenant for use by the surrounding module or function.
    const tenant = await runWithTenant({ bypass: true }, () => Organization.findOne(
mergeTenantFilter(req,{
_id:req.params.id
})
).lean());
    // Check the condition (!tenant) and run the matching branch.
    if (!tenant) return res.status(404).json({ success: false, message: "Tenant not found." });
    // Perform the side effect or state update expressed on the following line.
    res.json({ success: true, tenant });
  } catch (error) { next(error); }
}

// Define updateTenant; its parameters and body implement this operation.
export async function updateTenant(req, res, next) {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare allowed for use by the surrounding module or function.
    const allowed = ["name", "legalName", "logoUrl", "websiteUrl", "domain", "supportEmail", "supportPhone", "country", "timezone", "currency", "status", "subscription", "features", "settings"];
    // Declare updates for use by the surrounding module or function.
    const updates = Object.fromEntries(Object.entries(req.body || {}).filter(([key]) => allowed.includes(key)));
    // Declare tenant for use by the surrounding module or function.
    const tenant = await runWithTenant({ bypass: true }, () => Organization.findOneAndUpdate(
mergeTenantFilter(req,{
_id:req.params.id
}), { $set: updates }, { new: true, runValidators: true }).lean());
    // Check the condition (!tenant) and run the matching branch.
    if (!tenant) return res.status(404).json({ success: false, message: "Tenant not found." });
    // Perform the side effect or state update expressed on the following line.
    res.json({ success: true, tenant });
  } catch (error) { next(error); }
}
