import mongoose from "mongoose";
import Organization from "../models/Organization.js";
import User from "../models/User.js";
import Role from "../models/Role.js";
import { runWithTenant } from "../tenancy/context.js";

export const TENANT_PLANS = Object.freeze({
  starter: Object.freeze({ label: "Starter", seats: 5 }),
  professional: Object.freeze({ label: "Professional", seats: 20 }),
  business: Object.freeze({ label: "Business", seats: 50 }),
  enterprise: Object.freeze({ label: "Enterprise", seats: 100, customSeats: true }),
});

const asObjectId = (id) => new mongoose.Types.ObjectId(id);
const slugify = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100);
const normalizeDomain = (value) => {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return null;
  try {
    const url = new URL(raw.includes("://") ? raw : `https://${raw}`);
    return url.hostname.replace(/^www\./, "");
  } catch { return null; }
};
const uniqueSlug = async (name, requestedSlug) => {
  const base = slugify(requestedSlug || name) || `company-${Date.now()}`;
  let slug = base;
  let suffix = 2;
  while (await Organization.exists({ slug })) slug = `${base}-${suffix++}`;
  return slug;
};
const validateAdminPassword = (password) => String(password || "").length >= 12 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password);

const getTenantCounts = async (tenantId) => {
  const db = mongoose.connection.db;
  const collections = ["users", "tours", "tourpackages", "bookings", "payments", "customers", "agents", "staffs", "vehicles", "destinations"];
  const counts = {};
  await Promise.all(collections.map(async (name) => {
    try { counts[name] = await db.collection(name).countDocuments({ tenantId: asObjectId(tenantId) }); } catch { counts[name] = 0; }
  }));
  return counts;
};

export const getTenantPlans = async (req, res) => res.json({ success: true, plans: Object.entries(TENANT_PLANS).map(([value, plan]) => ({ value, ...plan })) });

export const createTenantWithAdmin = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    const {
      companyName, legalName = "", slug: requestedSlug = "", companyEmail, companyPhone, domain: requestedDomain = "",
      country = "Kenya", timezone = "Africa/Nairobi", currency = "KES", plan = "starter", seats,
      websiteUrl = "", logoUrl = "", adminName, adminEmail, adminPhone, adminPassword,
    } = req.body || {};

    if (!String(companyName || "").trim()) return res.status(400).json({ success: false, message: "Company name is required." });
    if (!/^\S+@\S+\.\S+$/.test(String(companyEmail || "").trim())) return res.status(400).json({ success: false, message: "A valid company email is required." });
    if (!/^\d{10}$/.test(String(companyPhone || "").trim())) return res.status(400).json({ success: false, message: "Company phone must contain exactly 10 digits." });
    if (!String(adminName || "").trim() || !/^\S+@\S+\.\S+$/.test(String(adminEmail || "").trim())) return res.status(400).json({ success: false, message: "Primary administrator name and valid email are required." });
    if (!/^\d{10}$/.test(String(adminPhone || "").trim())) return res.status(400).json({ success: false, message: "Administrator phone must contain exactly 10 digits." });
    if (!validateAdminPassword(adminPassword)) return res.status(400).json({ success: false, message: "Administrator password must be at least 12 characters and include uppercase, lowercase and a number." });

    const selectedPlan = TENANT_PLANS[plan];
    if (!selectedPlan) return res.status(400).json({ success: false, message: "Invalid subscription plan." });
    const requestedSeats = Number(seats);
    const effectiveSeats = Number.isFinite(requestedSeats) && requestedSeats > 0 ? Math.floor(requestedSeats) : selectedPlan.seats;
    if (effectiveSeats < selectedPlan.seats) return res.status(400).json({ success: false, code: "SEAT_LIMIT_BELOW_PLAN_MINIMUM", message: `${selectedPlan.label} includes a minimum of ${selectedPlan.seats} user seats. Increase the seat count or choose a different plan.`, minimumSeats: selectedPlan.seats });
    if (effectiveSeats > 10000) return res.status(400).json({ success: false, message: "User seats cannot exceed 10,000." });

    const normalizedCompanyEmail = String(companyEmail).trim().toLowerCase();
    const normalizedAdminEmail = String(adminEmail).trim().toLowerCase();
    const domain = normalizeDomain(requestedDomain);
    if (requestedDomain && !domain) return res.status(400).json({ success: false, message: "Enter a valid custom domain, for example www.example.com." });
    if (domain && await Organization.exists({ domain })) return res.status(409).json({ success: false, message: "That custom domain is already assigned to another company." });

    // Administrator email uniqueness is tenant-scoped. Do not reject an email
    // merely because it exists in another tenant; the compound
    // tenantId + email index on User enforces uniqueness within the new tenant.

    const slug = await uniqueSlug(companyName, requestedSlug);
    const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    let organization;
    let admin;
    await session.withTransaction(async () => {
      const organizationData = {
        name: String(companyName).trim(),
        slug,
        legalName: String(legalName || "").trim(),
        supportEmail: normalizedCompanyEmail,
        supportPhone: String(companyPhone).trim(),
        country: String(country || "Kenya").trim(),
        timezone: String(timezone || "Africa/Nairobi").trim(),
        currency: String(currency || "KES").trim().toUpperCase(),
        websiteUrl: String(websiteUrl || "").trim(),
        logoUrl: String(logoUrl || "").trim(),
        status: "trial",
        subscription: {
          plan,
          seats: effectiveSeats,
          trialEndsAt,
        },
        features: {
          customDomain: Boolean(domain),
        },
        createdBy: req.user?._id || null,
      };

      // Do not persist an explicit null domain. The domain field has a unique
      // sparse index, so only create the field when a real custom domain exists.
      if (domain) organizationData.domain = domain;

      [organization] = await Organization.create([organizationData], { session });

      const roleDoc = await runWithTenant({ role: "super_admin", bypass: true }, () => Role.findOne({ name: "admin" }).session(session).lean());
      if (!roleDoc) throw Object.assign(new Error("System role 'admin' is not configured."), { status: 400 });
      [admin] = await runWithTenant({ role: "super_admin", bypass: true }, () => User.create([{
        name: String(adminName).trim(), email: normalizedAdminEmail, phone: String(adminPhone).trim(), password: adminPassword,
        role: "admin", legacyRole: "admin", roleId: roleDoc._id, tenantId: organization._id, status: "active", isVerified: true,
      }], { session }));
    });

    const safeAdmin = await runWithTenant({ role: "super_admin", bypass: true }, () => User.findById(admin._id).select("-password").populate("roleId", "name displayName permissions").lean());
    return res.status(201).json({ success: true, message: `Company "${organization.name}" and its primary administrator were created successfully.`, tenant: organization, admin: safeAdmin, data: { tenant: organization, admin: safeAdmin } });
  } catch (error) {
    if (error?.code === 11000) {
      const keyPattern = error?.keyPattern || {};
      const keyValue = error?.keyValue || {};
      const duplicateFields = Object.keys(keyPattern);

      console.error("SUPERADMIN TENANT CREATION DUPLICATE KEY", {
        index: error?.index || null,
        indexName: error?.indexName || null,
        keyPattern,
        keyValue,
        message: error?.message || null,
      });

      let message = "A company or administrator with the supplied unique value already exists.";
      if (duplicateFields.includes("domain")) message = "That custom domain is already assigned to another company.";
      else if (duplicateFields.includes("slug")) message = "That company slug is already in use.";
      else if (duplicateFields.includes("email")) message = "That administrator email is already in use by this company.";

      return res.status(409).json({
        success: false,
        code: "DUPLICATE_KEY",
        message,
        field: duplicateFields[0] || null,
      });
    }
    next(error);
  } finally { await session.endSession(); }
};

export const listTenants = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1), limit = Math.min(Math.max(Number(req.query.limit) || 25, 1), 100), search = String(req.query.search || "").trim();
    const filter = {};
    if (search) filter.$or = [{ name: { $regex: search, $options: "i" } }, { legalName: { $regex: search, $options: "i" } }, { slug: { $regex: search, $options: "i" } }, { supportEmail: { $regex: search, $options: "i" } }];
    const [organizations, total] = await Promise.all([Organization.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(), Organization.countDocuments(filter)]);
    const tenants = await Promise.all(organizations.map(async (organization) => {
      const counts = await getTenantCounts(organization._id);
      const owner = await runWithTenant({ role: "super_admin", bypass: true }, () => User.findOne({ tenantId: organization._id, role: { $in: ["admin", "administrator"] } }).select("name email phone status").sort({ createdAt: 1 }).lean());
      return { ...organization, owner: owner || null, counts };
    }));
    return res.json({ success: true, tenants, data: tenants, page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) });
  } catch (error) { next(error); }
};

export const getTenant = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid tenant ID" });
    const tenant = await Organization.findById(req.params.id).lean();
    if (!tenant) return res.status(404).json({ success: false, message: "Company not found" });
    const owner = await runWithTenant({ role: "super_admin", bypass: true }, () => User.findOne({ tenantId: tenant._id, role: { $in: ["admin", "administrator"] } }).select("name email phone status").sort({ createdAt: 1 }).lean());
    return res.json({ success: true, tenant: { ...tenant, owner, counts: await getTenantCounts(tenant._id) } });
  } catch (error) { next(error); }
};

export const updateTenantStatus = async (req, res, next) => {
  try {
    const { status } = req.body || {};
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid tenant ID" });
    if (!["active", "suspended", "trial", "cancelled"].includes(status)) return res.status(400).json({ success: false, message: "Invalid company status" });
    const tenant = await Organization.findByIdAndUpdate(req.params.id, { $set: { status } }, { new: true, runValidators: true }).lean();
    if (!tenant) return res.status(404).json({ success: false, message: "Company not found" });
    return res.json({ success: true, tenant, message: `Company status changed to ${status}` });
  } catch (error) { next(error); }
};

export const deleteTenant = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    const { id } = req.params;
    const confirmation = String(req.body?.confirmation || "").trim();

    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid tenant ID" });
    if (confirmation !== "DELETE") return res.status(400).json({ success: false, message: 'Permanent company deletion requires confirmation="DELETE".' });

    const requesterRole = String(req.user?.role || req.user?.legacyRole || "").toLowerCase();
    if (!req.user || !["superadmin", "super_admin"].includes(requesterRole)) return res.status(403).json({ success: false, message: "Only a SuperAdmin can permanently delete a company." });

    const tenant = await Organization.findById(id).lean();
    if (!tenant) return res.status(404).json({ success: false, message: "Company not found" });

    const protectedSlugs = new Set(["platform", "system", "superadmin", "super-admin"]);
    const isPlatformOrganization = protectedSlugs.has(String(tenant.slug || "").trim().toLowerCase()) || (tenant.settings && tenant.settings.isPlatform === true) || (tenant.settings && tenant.settings.platform === true);
    if (isPlatformOrganization) return res.status(403).json({ success: false, message: "The platform/system organization cannot be deleted." });

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    await session.withTransaction(async () => {
      for (const { name } of collections) {
        if (name.startsWith("system.") || name === "organizations") continue;
        await db.collection(name).deleteMany({ tenantId: asObjectId(id) }, { session });
      }
      await Organization.deleteOne({ _id: tenant._id }, { session });
    });

    return res.json({ success: true, deleted: true, tenantId: String(tenant._id), message: `Company "${tenant.name || tenant.slug || id}" deleted successfully.` });
  } catch (error) {
    return next(error);
  } finally {
    await session.endSession();
  }
};
