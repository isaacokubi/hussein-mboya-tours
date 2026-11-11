/**
 * Purpose: super Admin Tenant Controller HTTP controller. Main declarations: asObjectId, slugify, normalizeDomain, uniqueSlug, validateAdminPassword.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../models/Organization.js so this module can use its exported dependencies.
import Organization from "../models/Organization.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../models/Role.js so this module can use its exported dependencies.
import Role from "../models/Role.js";
// Load ../models/SystemSetting.js so this module can use its exported dependencies.
import SystemSetting from "../models/SystemSetting.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { runWithTenant } from "../tenancy/context.js";
// Load ../services/tenantSubscriptionService.js so this module can use its exported dependencies.
import { activateTenantSubscription } from "../services/tenantSubscriptionService.js";

// Declare TENANT_PLANS for use by the surrounding module or function.
export const TENANT_PLANS = Object.freeze({
  starter: Object.freeze({ label: "Starter", seats: 5 }),
  professional: Object.freeze({ label: "Professional", seats: 20 }),
  business: Object.freeze({ label: "Business", seats: 50 }),
  enterprise: Object.freeze({ label: "Enterprise", seats: 100, customSeats: true }),
});

// Declare asObjectId for use by the surrounding module or function.
const asObjectId = (id) => new mongoose.Types.ObjectId(id);
// Declare slugify for use by the surrounding module or function.
const slugify = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100);
// Declare normalizeDomain for use by the surrounding module or function.
const normalizeDomain = (value) => {
  // Declare raw for use by the surrounding module or function.
  const raw = String(value || "").trim().toLowerCase();
  // Check the condition (!raw) and run the matching branch.
  if (!raw) return null;
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare url for use by the surrounding module or function.
    const url = new URL(raw.includes("://") ? raw : `https://${raw}`);
    // Return the result of url.hostname.replace() to the caller.
    return url.hostname.replace(/^www\./, "");
  } catch { return null; }
};
// Declare uniqueSlug for use by the surrounding module or function.
const uniqueSlug = async (name, requestedSlug) => {
  // Declare base for use by the surrounding module or function.
  const base = slugify(requestedSlug || name) || `company-${Date.now()}`;
  // Declare slug for use by the surrounding module or function.
  let slug = base;
  // Declare suffix for use by the surrounding module or function.
  let suffix = 2;
  // Repeat the enclosed work for each required iteration.
  while (await Organization.exists({ slug })) slug = `${base}-${suffix++}`;
  // Return the value of slug to the caller.
  return slug;
};
// Declare validateAdminPassword for use by the surrounding module or function.
const validateAdminPassword = (password) => String(password || "").length >= 12 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password);

// Declare getTenantCounts for use by the surrounding module or function.
const getTenantCounts = async (tenantId) => {
  // Declare db for use by the surrounding module or function.
  const db = mongoose.connection.db;
  // Declare collections for use by the surrounding module or function.
  const collections = ["users", "tours", "tourpackages", "bookings", "payments", "customers", "agents", "staffs", "vehicles", "destinations"];
  // Declare counts for use by the surrounding module or function.
  const counts = {};
  // Perform the side effect or state update expressed on the following line.
  await Promise.all(collections.map(async (name) => {
    // Run this operation with a dedicated error-handling path for failures.
    try { counts[name] = await db.collection(name).countDocuments({ tenantId: asObjectId(tenantId) }); } catch { counts[name] = 0; }
  }));
  // Return the value of counts to the caller.
  return counts;
};

// Declare getTenantPlans for use by the surrounding module or function.
export const getTenantPlans = async (req, res) => res.json({ success: true, plans: Object.entries(TENANT_PLANS).map(([value, plan]) => ({ value, ...plan })) });

// Declare createTenantWithAdmin for use by the surrounding module or function.
export const createTenantWithAdmin = async (req, res, next) => {
  // Declare session for use by the surrounding module or function.
  const session = await mongoose.startSession();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare { companyName, legalName = "", slug: requestedSlug = "", companyEmail, companyPhone, domain: requestedDomain = "", country = "Kenya", timezone = "Africa/Nairobi", currency = "KES", plan = "starter", seats, websiteUrl = "", logoUrl = "", adminName, adminEmail, adminPhone, adminPassword } for use by the surrounding module or function.
    const { companyName, legalName = "", slug: requestedSlug = "", companyEmail, companyPhone, domain: requestedDomain = "", country = "Kenya", timezone = "Africa/Nairobi", currency = "KES", plan = "starter", seats, websiteUrl = "", logoUrl = "", adminName, adminEmail, adminPhone, adminPassword } = req.body || {};
    // Check the condition (!String(companyName || "").trim()) and run the matching branch.
    if (!String(companyName || "").trim()) return res.status(400).json({ success: false, message: "Company name is required." });
    // Check the condition (!/^\S+@\S+\.\S+$/.test(String(companyEmail || "").trim())) and run the matching branch.
    if (!/^\S+@\S+\.\S+$/.test(String(companyEmail || "").trim())) return res.status(400).json({ success: false, message: "A valid company email is required." });
    // Check the condition (!/^\d{10}$/.test(String(companyPhone || "").trim())) and run the matching branch.
    if (!/^\d{10}$/.test(String(companyPhone || "").trim())) return res.status(400).json({ success: false, message: "Company phone must contain exactly 10 digits." });
    // Check the condition (!String(adminName || "").trim() || !/^\S+@\S+\.\S+$/.test(String(admin) and run the matching branch.
    if (!String(adminName || "").trim() || !/^\S+@\S+\.\S+$/.test(String(adminEmail || "").trim())) return res.status(400).json({ success: false, message: "Primary administrator name and valid email are required." });
    // Check the condition (!/^\d{10}$/.test(String(adminPhone || "").trim())) and run the matching branch.
    if (!/^\d{10}$/.test(String(adminPhone || "").trim())) return res.status(400).json({ success: false, message: "Administrator phone must contain exactly 10 digits." });
    // Check the condition (!validateAdminPassword(adminPassword)) and run the matching branch.
    if (!validateAdminPassword(adminPassword)) return res.status(400).json({ success: false, message: "Administrator password must be at least 12 characters and include uppercase, lowercase and a number." });
    // Declare selectedPlan for use by the surrounding module or function.
    const selectedPlan = TENANT_PLANS[plan];
    // Check the condition (!selectedPlan) and run the matching branch.
    if (!selectedPlan) return res.status(400).json({ success: false, message: "Invalid subscription plan." });
    // Declare requestedSeats for use by the surrounding module or function.
    const requestedSeats = Number(seats);
    // Declare effectiveSeats for use by the surrounding module or function.
    const effectiveSeats = Number.isFinite(requestedSeats) && requestedSeats > 0 ? Math.floor(requestedSeats) : selectedPlan.seats;
    // Check the condition (effectiveSeats < selectedPlan.seats) and run the matching branch.
    if (effectiveSeats < selectedPlan.seats) return res.status(400).json({ success: false, code: "SEAT_LIMIT_BELOW_PLAN_MINIMUM", message: `${selectedPlan.label} includes a minimum of ${selectedPlan.seats} user seats. Increase the seat count or choose a different plan.`, minimumSeats: selectedPlan.seats });
    // Check the condition (effectiveSeats > 10000) and run the matching branch.
    if (effectiveSeats > 10000) return res.status(400).json({ success: false, message: "User seats cannot exceed 10,000." });
    // Declare normalizedCompanyEmail for use by the surrounding module or function.
    const normalizedCompanyEmail = String(companyEmail).trim().toLowerCase();
    // Declare normalizedAdminEmail for use by the surrounding module or function.
    const normalizedAdminEmail = String(adminEmail).trim().toLowerCase();
    // Declare normalizedCompanyName for use by the surrounding module or function.
    const normalizedCompanyName = String(companyName).trim();
    // Declare normalizedCompanyPhone for use by the surrounding module or function.
    const normalizedCompanyPhone = String(companyPhone).trim();
    // Declare normalizedCountry for use by the surrounding module or function.
    const normalizedCountry = String(country || "Kenya").trim();
    // Declare normalizedTimezone for use by the surrounding module or function.
    const normalizedTimezone = String(timezone || "Africa/Nairobi").trim();
    // Declare normalizedCurrency for use by the surrounding module or function.
    const normalizedCurrency = String(currency || "KES").trim().toUpperCase();
    // Declare normalizedWebsiteUrl for use by the surrounding module or function.
    const normalizedWebsiteUrl = String(websiteUrl || "").trim();
    // Declare normalizedLogoUrl for use by the surrounding module or function.
    const normalizedLogoUrl = String(logoUrl || "").trim();
    // Declare domain for use by the surrounding module or function.
    const domain = normalizeDomain(requestedDomain);
    // Check the condition (requestedDomain && !domain) and run the matching branch.
    if (requestedDomain && !domain) return res.status(400).json({ success: false, message: "Enter a valid custom domain, for example www.example.com." });
    // Check the condition (domain && await Organization.exists({ domain })) and run the matching branch.
    if (domain && await Organization.exists({ domain })) return res.status(409).json({ success: false, message: "That custom domain is already assigned to another company." });
    // Declare slug for use by the surrounding module or function.
    const slug = await uniqueSlug(normalizedCompanyName, requestedSlug);
    // Declare trialEndsAt for use by the surrounding module or function.
    const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    // Declare organization for use by the surrounding module or function.
    let organization;
    // Declare admin for use by the surrounding module or function.
    let admin;
    // Perform the side effect or state update expressed on the following line.
    await session.withTransaction(async () => {
      // Declare organizationData for use by the surrounding module or function.
      const organizationData = {
        name: normalizedCompanyName,
        slug,
        legalName: String(legalName || "").trim(),
        supportEmail: normalizedCompanyEmail,
        supportPhone: normalizedCompanyPhone,
        country: normalizedCountry,
        timezone: normalizedTimezone,
        currency: normalizedCurrency,
        websiteUrl: normalizedWebsiteUrl,
        logoUrl: normalizedLogoUrl,
        status: "trial",
        subscription: { plan, seats: effectiveSeats, trialEndsAt },
        features: { customDomain: Boolean(domain) },
        createdBy: req.user?._id || null,
      };
      // Check the condition (domain) and run the matching branch.
      if (domain) organizationData.domain = domain;
      // Perform the side effect or state update expressed on the following line.
      [organization] = await Organization.create([organizationData], { session });
      // Declare roleDoc for use by the surrounding module or function.
      const roleDoc = await runWithTenant({ role: "super_admin", bypass: true }, () => Role.findOne({ name: "admin" }).session(session).lean());
      // Check the condition (!roleDoc) and run the matching branch.
      if (!roleDoc) throw Object.assign(new Error("System role 'admin' is not configured."), { status: 400 });
      // Perform the side effect or state update expressed on the following line.
      [admin] = await runWithTenant({ role: "super_admin", bypass: true }, () => User.create([{ name: String(adminName).trim(), email: normalizedAdminEmail, phone: String(adminPhone).trim(), password: adminPassword, role: "admin", legacyRole: "admin", roleId: roleDoc._id, tenantId: organization._id, status: "active", isVerified: true }], { session }));
      // Perform the side effect or state update expressed on the following line.
      await SystemSetting.create([{
        tenantId: organization._id,
        key: "default",
        companyName: normalizedCompanyName,
        companyLogo: normalizedLogoUrl,
        websiteUrl: normalizedWebsiteUrl,
        supportEmail: normalizedCompanyEmail,
        supportPhone: normalizedCompanyPhone,
        country: normalizedCountry,
        currency: normalizedCurrency,
        timezone: normalizedTimezone,
        emailFromName: normalizedCompanyName,
        emailFromAddress: normalizedCompanyEmail,
        seoTitle: normalizedCompanyName,
      }], { session });
    });
    // Declare safeAdmin for use by the surrounding module or function.
    const safeAdmin = await runWithTenant({ role: "super_admin", bypass: true }, () => User.findById(admin._id).select("-password").populate("roleId", "name displayName permissions").lean());
    // Return the result of res.status(201).json() to the caller.
    return res.status(201).json({ success: true, message: `Company "${organization.name}" and its primary administrator were created successfully.`, tenant: organization, admin: safeAdmin, data: { tenant: organization, admin: safeAdmin } });
  } catch (error) {
    // Check the condition (error?.code === 11000) and run the matching branch.
    if (error?.code === 11000) {
      // Declare keyPattern, keyValue, duplicateFields for use by the surrounding module or function.
      const keyPattern = error?.keyPattern || {}, keyValue = error?.keyValue || {}, duplicateFields = Object.keys(keyPattern);
      // Perform the side effect or state update expressed on the following line.
      console.error("SUPERADMIN TENANT CREATION DUPLICATE KEY", { index: error?.index || null, indexName: error?.indexName || null, keyPattern, keyValue, message: error?.message || null });
      // Declare message for use by the surrounding module or function.
      let message = "A company or administrator with the supplied unique value already exists.";
      // Check the condition (duplicateFields.includes("domain")) and run the matching branch.
      if (duplicateFields.includes("domain")) message = "That custom domain is already assigned to another company.";
      else if (duplicateFields.includes("slug")) message = "That company slug is already in use.";
      else if (duplicateFields.includes("email")) message = "That administrator email is already in use by this company.";
      // Return the result of res.status(409).json() to the caller.
      return res.status(409).json({ success: false, code: "DUPLICATE_KEY", message, field: duplicateFields[0] || null });
    }
    // Perform the side effect or state update expressed on the following line.
    next(error);
  } finally { await session.endSession(); }
};

// Declare listTenants for use by the surrounding module or function.
export const listTenants = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare page, limit, search for use by the surrounding module or function.
    const page = Math.max(Number(req.query.page) || 1, 1), limit = Math.min(Math.max(Number(req.query.limit) || 25, 1), 100), search = String(req.query.search || "").trim();
    // Declare filter for use by the surrounding module or function.
    const filter = {};
    // Check the condition (search) and run the matching branch.
    if (search) filter.$or = [{ name: { $regex: search, $options: "i" } }, { legalName: { $regex: search, $options: "i" } }, { slug: { $regex: search, $options: "i" } }, { supportEmail: { $regex: search, $options: "i" } }];
    // Declare [organizations, total] for use by the surrounding module or function.
    const [organizations, total] = await Promise.all([Organization.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(), Organization.countDocuments(filter)]);
    // Declare tenants for use by the surrounding module or function.
    const tenants = await Promise.all(organizations.map(async (organization) => {
      // Declare counts for use by the surrounding module or function.
      const counts = await getTenantCounts(organization._id);
      // Declare owner for use by the surrounding module or function.
      const owner = await runWithTenant({ role: "super_admin", bypass: true }, () => User.findOne({ tenantId: organization._id, role: { $in: ["admin", "administrator"] } }).select("name email phone status").sort({ createdAt: 1 }).lean());
      // Return the object assembled below to the caller.
      return { ...organization, owner: owner || null, counts };
    }));
    // Return the result of res.json() to the caller.
    return res.json({ success: true, tenants, data: tenants, page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) });
  } catch (error) { next(error); }
};

// Declare getTenant for use by the surrounding module or function.
export const getTenant = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!mongoose.isValidObjectId(req.params.id)) and run the matching branch.
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid tenant ID" });
    // Declare tenant for use by the surrounding module or function.
    const tenant = await Organization.findById(req.params.id).lean();
    // Check the condition (!tenant) and run the matching branch.
    if (!tenant) return res.status(404).json({ success: false, message: "Company not found" });
    // Declare owner for use by the surrounding module or function.
    const owner = await runWithTenant({ role: "super_admin", bypass: true }, () => User.findOne({ tenantId: tenant._id, role: { $in: ["admin", "administrator"] } }).select("name email phone status").sort({ createdAt: 1 }).lean());
    // Return the result of res.json() to the caller.
    return res.json({ success: true, tenant: { ...tenant, owner, counts: await getTenantCounts(tenant._id) } });
  } catch (error) { next(error); }
};

// Declare updateTenantStatus for use by the surrounding module or function.
export const updateTenantStatus = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare { status, plan, periodDays, transactionReference } for use by the surrounding module or function.
    const { status, plan, periodDays, transactionReference } = req.body || {};
    // Check the condition (!mongoose.isValidObjectId(req.params.id)) and run the matching branch.
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid tenant ID" });
    // Check the condition (!["active", "suspended", "trial", "cancelled"].includes(status)) and run the matching branch.
    if (!["active", "suspended", "trial", "cancelled"].includes(status)) return res.status(400).json({ success: false, message: "Invalid company status" });
    // Declare existingTenant for use by the surrounding module or function.
    const existingTenant = await Organization.findById(req.params.id).lean();
    // Check the condition (!existingTenant) and run the matching branch.
    if (!existingTenant) return res.status(404).json({ success: false, message: "Company not found" });

    // Check the condition (status === "active") and run the matching branch.
    if (status === "active") {
      // Declare selectedPlan for use by the surrounding module or function.
      const selectedPlan = String(plan || existingTenant.subscription?.plan || "starter").toLowerCase();
      // Check the condition (!TENANT_PLANS[selectedPlan]) and run the matching branch.
      if (!TENANT_PLANS[selectedPlan]) return res.status(400).json({ success: false, message: "Invalid subscription plan." });
      // Declare requestedDays for use by the surrounding module or function.
      const requestedDays = Number(periodDays);
      // Declare effectivePeriodDays for use by the surrounding module or function.
      const effectivePeriodDays = Number.isFinite(requestedDays) && requestedDays > 0 ? Math.floor(requestedDays) : 30;
      // Declare activation for use by the surrounding module or function.
      const activation = await activateTenantSubscription({
        tenantId: existingTenant._id,
        plan: selectedPlan,
        provider: "manual",
        periodDays: effectivePeriodDays,
        transactionReference: String(transactionReference || "").trim(),
      });
      // Declare tenant for use by the surrounding module or function.
      const tenant = await Organization.findById(existingTenant._id).lean();
      // Return the result of res.json() to the caller.
      return res.json({
        success: true,
        tenant,
        subscription: {
          status: "active",
          plan: selectedPlan,
          periodStartsAt: activation.periodStartsAt,
          periodEndsAt: activation.periodEndsAt,
        },
        message: `Company activated for ${effectivePeriodDays} days.`,
      });
    }

    // Declare tenant for use by the surrounding module or function.
    const tenant = await Organization.findByIdAndUpdate(req.params.id, { $set: { status } }, { new: true, runValidators: true }).lean();
    // Return the result of res.json() to the caller.
    return res.json({ success: true, tenant, message: `Company status changed to ${status}` });
  } catch (error) { next(error); }
};

// Declare deleteTenant for use by the surrounding module or function.
export const deleteTenant = async (req, res, next) => {
  // Declare session for use by the surrounding module or function.
  const session = await mongoose.startSession();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare { id } for use by the surrounding module or function.
    const { id } = req.params;
    // Declare confirmation for use by the surrounding module or function.
    const confirmation = String(req.body?.confirmation || "").trim();
    // Check the condition (!mongoose.isValidObjectId(id)) and run the matching branch.
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid tenant ID" });
    // Check the condition (confirmation !== "DELETE") and run the matching branch.
    if (confirmation !== "DELETE") return res.status(400).json({ success: false, message: 'Permanent company deletion requires confirmation="DELETE".' });
    // Declare requesterRole for use by the surrounding module or function.
    const requesterRole = String(req.user?.role || req.user?.legacyRole || "").toLowerCase();
    // Check the condition (!req.user || !["superadmin", "super_admin"].includes(requesterRole)) and run the matching branch.
    if (!req.user || !["superadmin", "super_admin"].includes(requesterRole)) return res.status(403).json({ success: false, message: "Only a SuperAdmin can permanently delete a company." });
    // Declare tenant for use by the surrounding module or function.
    const tenant = await Organization.findById(id).lean();
    // Check the condition (!tenant) and run the matching branch.
    if (!tenant) return res.status(404).json({ success: false, message: "Company not found" });
    // Declare protectedSlugs for use by the surrounding module or function.
    const protectedSlugs = new Set(["platform", "system", "superadmin", "super-admin"]);
    // Declare isPlatformOrganization for use by the surrounding module or function.
    const isPlatformOrganization = protectedSlugs.has(String(tenant.slug || "").trim().toLowerCase()) || (tenant.settings && tenant.settings.isPlatform === true) || (tenant.settings && tenant.settings.platform === true);
    // Check the condition (isPlatformOrganization) and run the matching branch.
    if (isPlatformOrganization) return res.status(403).json({ success: false, message: "The platform/system organization cannot be deleted." });
    // Declare db for use by the surrounding module or function.
    const db = mongoose.connection.db;
    // Declare collections for use by the surrounding module or function.
    const collections = await db.listCollections().toArray();
    // Perform the side effect or state update expressed on the following line.
    await session.withTransaction(async () => {
      // Repeat the enclosed work for each required iteration.
      for (const { name } of collections) {
        // Check the condition (name.startsWith("system.") || name === "organizations") and run the matching branch.
        if (name.startsWith("system.") || name === "organizations") continue;
        // Perform the side effect or state update expressed on the following line.
        await db.collection(name).deleteMany({ tenantId: asObjectId(id) }, { session });
      }
      // Perform the side effect or state update expressed on the following line.
      await Organization.deleteOne({ _id: tenant._id }, { session });
    });
    // Return the result of res.json() to the caller.
    return res.json({ success: true, deleted: true, tenantId: String(tenant._id), message: `Company "${tenant.name || tenant.slug || id}" deleted successfully.` });
  } catch (error) { return next(error); } finally { await session.endSession(); }
};
