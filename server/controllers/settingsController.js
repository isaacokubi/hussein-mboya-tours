import SystemSetting from "../models/SystemSetting.js";
import Organization from "../models/Organization.js";
import User from "../models/User.js";
import { getTenantContext, requireTenantId, isTenantBypassed } from "../tenancy/context.js";
import { COMPANY_DEFAULTS } from "../config/companyDefaults.js";

const DEFAULTS = { ...COMPANY_DEFAULTS, primaryColor: "#047857", secondaryColor: "#064e3b", accentColor: "#10b981", backgroundColor: "#f8fafc", surfaceColor: "#ffffff", textColor: "#0f172a", fontFamily: "Inter", borderRadius: "xl", buttonStyle: "rounded", heroOverlayOpacity: 50, homepageSections: { stats: true, tours: true, destinations: true, experiences: true, services: true, testimonials: true, gallery: true, whyChooseUs: true, newsletter: true } };
const COLOR_FIELDS = ["primaryColor", "secondaryColor", "accentColor", "backgroundColor", "surfaceColor", "textColor"];
const NUMERIC_FIELDS = ["taxRate", "bookingDepositPercentage", "defaultCommissionRate", "heroOverlayOpacity"];
const BOOLEAN_FIELDS = ["bookingNotifications", "paymentNotifications", "emailNotifications", "systemAlerts", "twoFactor", "maintenanceMode", "allowRegistrations", "allowAgentRegistrations", "requireEmailVerification", "requirePhoneVerification", "enableMpesa", "enableStripe", "enablePaypal", "enableBankTransfer"];
const ALLOWED = ["companyName", "companyLogo", "websiteUrl", "supportEmail", "supportPhone", "address", "city", "country", "currency", "currencySymbol", "timezone", "language", "taxRate", "taxServiceType", "bookingStatus", "paymentProvider", "bookingDepositPercentage", "defaultCommissionRate", "maintenanceMode", "allowRegistrations", "allowAgentRegistrations", "requireEmailVerification", "requirePhoneVerification", "enableMpesa", "enableStripe", "enablePaypal", "enableBankTransfer", "bankName", "bankAccountName", "bankAccountNumber", "bankBranch", "bankSwiftCode", "emailFromName", "emailFromAddress", "facebook", "instagram", "twitter", "youtube", "seoTitle", "seoDescription", "seoKeywords", "bookingNotifications", "paymentNotifications", "emailNotifications", "systemAlerts", "twoFactor", ...COLOR_FIELDS, "fontFamily", "borderRadius", "buttonStyle", "heroOverlayOpacity", "homepageSections"];
const isColor = (value) => /^#[0-9a-fA-F]{6}$/.test(String(value || ""));

const normalizeUpdates = (body = {}) => {
  const updates = {};
  for (const key of ALLOWED) if (body[key] !== undefined) updates[key] = body[key];
  if (updates.companyName !== undefined) updates.companyName = String(updates.companyName).trim();
  if (updates.supportEmail !== undefined) updates.supportEmail = String(updates.supportEmail).trim().toLowerCase();
  if (updates.supportPhone !== undefined) updates.supportPhone = String(updates.supportPhone).trim();
  if (updates.currency !== undefined) updates.currency = String(updates.currency).trim().toUpperCase();
  if (updates.timezone !== undefined) updates.timezone = String(updates.timezone).trim();
  if (updates.taxServiceType !== undefined) updates.taxServiceType = String(updates.taxServiceType).trim();
  if (updates.bookingStatus !== undefined) updates.bookingStatus = String(updates.bookingStatus).trim().toLowerCase();
  if (updates.paymentProvider !== undefined) updates.paymentProvider = String(updates.paymentProvider).trim();
  for (const key of NUMERIC_FIELDS) if (updates[key] !== undefined) { const value = Number(updates[key]); updates[key] = Number.isFinite(value) ? value : updates[key]; }
  for (const key of BOOLEAN_FIELDS) if (typeof updates[key] === "string") updates[key] = updates[key] === "true";
  if (typeof updates.seoKeywords === "string") { try { updates.seoKeywords = JSON.parse(updates.seoKeywords); } catch { updates.seoKeywords = updates.seoKeywords.split(",").map((v) => v.trim()).filter(Boolean); } }
  if (typeof updates.homepageSections === "string") { try { updates.homepageSections = JSON.parse(updates.homepageSections); } catch { updates.homepageSections = undefined; } }
  return updates;
};

const validateUpdates = (updates, existing = {}) => {
  for (const key of COLOR_FIELDS) if (updates[key] !== undefined && !isColor(updates[key])) return `${key} must be a valid 6-digit hex color.`;
  if (updates.heroOverlayOpacity !== undefined && (!Number.isFinite(updates.heroOverlayOpacity) || updates.heroOverlayOpacity < 0 || updates.heroOverlayOpacity > 100)) return "Hero overlay opacity must be between 0 and 100.";
  for (const key of ["taxRate", "bookingDepositPercentage", "defaultCommissionRate"]) if (updates[key] !== undefined && (!Number.isFinite(updates[key]) || updates[key] < 0 || updates[key] > 100)) return "Tax, deposit and commission rates must be between 0 and 100.";
  const companyName = String(updates.companyName ?? existing.companyName ?? DEFAULTS.companyName).trim();
  if (!companyName) return "Company name cannot be empty.";
  if (updates.supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.supportEmail)) return "Enter a valid support email.";
  return null;
};

const getOrCreateSettings = async (filter) => {
  let settings = await SystemSetting.findOne(filter).lean();
  if (settings) return settings;
  const seed = { ...filter, ...DEFAULTS };
  if (filter.tenantId) {
    const tenant = await Organization.findById(filter.tenantId).lean();
    if (tenant) Object.assign(seed, { companyName: tenant.name || DEFAULTS.companyName, companyLogo: tenant.logoUrl || "", websiteUrl: tenant.websiteUrl || "", supportEmail: tenant.supportEmail || "", supportPhone: tenant.supportPhone || "", address: tenant.address || "", country: tenant.country || DEFAULTS.country, currency: tenant.currency || DEFAULTS.currency, timezone: tenant.timezone || DEFAULTS.timezone, emailFromName: tenant.name || DEFAULTS.companyName, emailFromAddress: tenant.supportEmail || "", seoTitle: tenant.name || DEFAULTS.companyName, primaryColor: tenant.brandColors?.primary || DEFAULTS.primaryColor, secondaryColor: tenant.brandColors?.secondary || DEFAULTS.secondaryColor, accentColor: tenant.brandColors?.accent || DEFAULTS.accentColor });
  }
  try { settings = await SystemSetting.create(seed); return settings.toObject(); }
  catch (error) { if (error?.code === 11000) { const existing = await SystemSetting.findOne(filter).lean(); if (existing) return existing; } throw error; }
};

const getTenantProfile = async (tenantId) => { const tenant = await Organization.findById(tenantId).lean(); if (!tenant) return null; const primaryAdministrator = await User.findOne({ tenantId: tenant._id, role: { $in: ["admin", "administrator"] } }).select("name email phone status").sort({ createdAt: 1 }).lean(); return { id: tenant._id, companyName: tenant.name, legalName: tenant.legalName || "", slug: tenant.slug, platformUrl: `https://${tenant.slug}.${String(process.env.PLATFORM_HOST || "globaltours.com").replace(/^https?:\/\//, "").replace(/\/$/, "")}`, customDomain: tenant.domain || "", websiteUrl: tenant.websiteUrl || "", companyEmail: tenant.supportEmail || "", companyPhone: tenant.supportPhone || "", country: tenant.country || "Kenya", currency: tenant.currency || "KES", timezone: tenant.timezone || "Africa/Nairobi", logoUrl: tenant.logoUrl || "", favicon: tenant.favicon || "", brandColors: tenant.brandColors || {}, status: tenant.status, subscriptionPlan: tenant.subscription?.plan || "starter", userSeats: Number(tenant.subscription?.seats || 0), trialEndsAt: tenant.subscription?.trialEndsAt || null, renewsAt: tenant.subscription?.renewsAt || null, primaryAdministrator: primaryAdministrator || null }; };

export const getSettings = async (req, res, next) => { try { if (isTenantBypassed()) { const settings = await getOrCreateSettings({ tenantId: null, key: "platform" }); return res.status(200).json({ success: true, data: settings, settings, scope: "platform" }); } requireTenantId(); const { tenantId } = getTenantContext(); const settings = await getOrCreateSettings({ tenantId, key: "default" }); const tenantProfile = await getTenantProfile(tenantId); const resolved = { ...settings, companyName: tenantProfile?.companyName || settings.companyName, companyLogo: tenantProfile?.logoUrl || settings.companyLogo, websiteUrl: tenantProfile?.websiteUrl || settings.websiteUrl, supportEmail: tenantProfile?.companyEmail || settings.supportEmail, supportPhone: tenantProfile?.companyPhone || settings.supportPhone, currency: tenantProfile?.currency || settings.currency, timezone: tenantProfile?.timezone || settings.timezone, seoTitle: tenantProfile?.companyName || settings.seoTitle }; return res.status(200).json({ success: true, data: { ...resolved, tenantProfile }, settings: { ...resolved, tenantProfile }, tenantProfile, scope: "tenant" }); } catch (error) { next(error); } };

export const updateSettings = async (req, res, next) => {
  try {
    const filter = isTenantBypassed() ? { tenantId: null, key: "platform" } : { tenantId: requireTenantId(), key: "default" };
    let settings = await SystemSetting.findOne(filter);
    if (!settings) { const seed = { ...filter, ...DEFAULTS }; if (filter.tenantId) { const tenant = await Organization.findById(filter.tenantId).lean(); if (tenant) Object.assign(seed, { companyName: tenant.name || DEFAULTS.companyName, companyLogo: tenant.logoUrl || "", websiteUrl: tenant.websiteUrl || "", supportEmail: tenant.supportEmail || "", supportPhone: tenant.supportPhone || "", address: tenant.address || "", country: tenant.country || DEFAULTS.country, currency: tenant.currency || DEFAULTS.currency, timezone: tenant.timezone || DEFAULTS.timezone, emailFromName: tenant.name || DEFAULTS.companyName, emailFromAddress: tenant.supportEmail || "", seoTitle: tenant.name || DEFAULTS.companyName, primaryColor: tenant.brandColors?.primary || DEFAULTS.primaryColor, secondaryColor: tenant.brandColors?.secondary || DEFAULTS.secondaryColor, accentColor: tenant.brandColors?.accent || DEFAULTS.accentColor }); } try { settings = new SystemSetting(seed); await settings.save(); } catch (error) { if (error?.code !== 11000) throw error; settings = await SystemSetting.findOne(filter); if (!settings) throw error; } }
    const updates = normalizeUpdates(req.body); if (req.file?.path) updates.companyLogo = req.file.path; const validationError = validateUpdates(updates, settings); if (validationError) return res.status(400).json({ success: false, message: validationError }); Object.assign(settings, updates); await settings.save();
    if (!isTenantBypassed()) { const tenantId = requireTenantId(); const organizationUpdates = {}; const map = { companyName: "name", companyLogo: "logoUrl", websiteUrl: "websiteUrl", supportEmail: "supportEmail", supportPhone: "supportPhone", address: "address", country: "country", timezone: "timezone", currency: "currency" }; for (const [settingKey, organizationKey] of Object.entries(map)) if (updates[settingKey] !== undefined) organizationUpdates[organizationKey] = updates[settingKey]; if (Object.keys(organizationUpdates).length) await Organization.findByIdAndUpdate(tenantId, { $set: organizationUpdates }, { runValidators: true }); if (updates.primaryColor !== undefined || updates.secondaryColor !== undefined || updates.accentColor !== undefined) { const tenant = await Organization.findById(tenantId).select("brandColors"); if (tenant) { tenant.brandColors = { ...(tenant.brandColors || {}), ...(updates.primaryColor !== undefined ? { primary: updates.primaryColor } : {}), ...(updates.secondaryColor !== undefined ? { secondary: updates.secondaryColor } : {}), ...(updates.accentColor !== undefined ? { accent: updates.accentColor } : {}) }; await tenant.save(); } }
    }
    const saved = settings.toObject(); const scope = filter.key === "platform" ? "platform" : "tenant"; const tenantProfile = scope === "tenant" ? await getTenantProfile(filter.tenantId) : null; const resolved = scope === "tenant" ? { ...saved, companyName: tenantProfile?.companyName || saved.companyName, companyLogo: tenantProfile?.logoUrl || saved.companyLogo, websiteUrl: tenantProfile?.websiteUrl || saved.websiteUrl, supportEmail: tenantProfile?.companyEmail || saved.supportEmail, supportPhone: tenantProfile?.companyPhone || saved.supportPhone, currency: tenantProfile?.currency || saved.currency, timezone: tenantProfile?.timezone || saved.timezone, seoTitle: tenantProfile?.companyName || saved.seoTitle } : saved; return res.status(200).json({ success: true, message: scope === "platform" ? "Platform settings saved successfully." : "Tenant settings saved successfully.", data: scope === "tenant" ? { ...resolved, tenantProfile } : resolved, settings: scope === "tenant" ? { ...resolved, tenantProfile } : resolved, tenantProfile, scope });
  } catch (error) { console.error("UPDATE SETTINGS ERROR:", error); return res.status(error?.status || 500).json({ success: false, message: error.message || "Failed to save tenant settings." }); }
};

export const getPublicSettings = async (req, res, next) => {
  try {
    requireTenantId(); const { tenantId } = getTenantContext(); const tenant = await Organization.findById(tenantId).lean(); if (!tenant) return res.status(404).json({ success: false, message: "Tenant not resolved" }); let tenantSettings = await SystemSetting.findOne({ tenantId, key: "default" }).lean(); if (!tenantSettings) tenantSettings = await getOrCreateSettings({ tenantId, key: "default" }); const overrides = tenant.settings && typeof tenant.settings === "object" ? tenant.settings : {};
    const settings = {
      companyName: tenant.name || tenantSettings?.companyName || DEFAULTS.companyName,
      supportEmail: tenant.supportEmail || tenantSettings?.supportEmail || "", supportPhone: tenant.supportPhone || tenantSettings?.supportPhone || "", websiteUrl: tenant.websiteUrl || tenantSettings?.websiteUrl || "", companyLogo: tenant.logoUrl || tenantSettings?.companyLogo || "",
      legalName: tenant.legalName || "", companySlug: tenant.slug || "", platformUrl: `https://${tenant.slug}.${String(process.env.PLATFORM_HOST || "globaltours.com").replace(/^https?:\/\//, "").replace(/\/$/, "")}`, customDomain: tenant.domain || "", favicon: tenant.favicon || "", brandColors: tenant.brandColors || {},
      subscriptionPlan: tenant.subscription?.plan || "starter", userSeats: Number(tenant.subscription?.seats || 0), tenantStatus: tenant.status || "trial", trialEndsAt: tenant.subscription?.trialEndsAt || null,
      address: tenant.address || tenantSettings?.address || "", city: tenantSettings?.city || tenant.city || "", country: tenant.country || tenantSettings?.country || "Kenya", currency: tenant.currency || tenantSettings?.currency || "KES", currencySymbol: tenantSettings?.currencySymbol || "KSh", timezone: tenant.timezone || tenantSettings?.timezone || "Africa/Nairobi", language: tenantSettings?.language || "en",
      facebook: tenantSettings?.facebook || "", instagram: tenantSettings?.instagram || "", twitter: tenantSettings?.twitter || "", youtube: tenantSettings?.youtube || "", seoTitle: tenant.name || tenantSettings?.seoTitle || DEFAULTS.companyName, seoDescription: tenantSettings?.seoDescription || "", seoKeywords: tenantSettings?.seoKeywords || [],
      maintenanceMode: Boolean(tenantSettings?.maintenanceMode), allowRegistrations: tenantSettings?.allowRegistrations !== false, allowAgentRegistrations: tenantSettings?.allowAgentRegistrations !== false, requireEmailVerification: tenantSettings?.requireEmailVerification !== false, requirePhoneVerification: Boolean(tenantSettings?.requirePhoneVerification),
      enableMpesa: overrides.enableMpesa ?? tenantSettings?.enableMpesa ?? tenant.features?.mpesa !== false, enableStripe: overrides.enableStripe ?? tenantSettings?.enableStripe ?? tenant.features?.stripe === true, enablePaypal: overrides.enablePaypal ?? tenantSettings?.enablePaypal ?? false, enableBankTransfer: overrides.enableBankTransfer ?? tenantSettings?.enableBankTransfer ?? true,
      bookingNotifications: tenantSettings?.bookingNotifications !== false, paymentNotifications: tenantSettings?.paymentNotifications !== false, taxRate: Number(tenantSettings?.taxRate || 0), bookingDepositPercentage: Number(tenantSettings?.bookingDepositPercentage ?? 30), defaultCommissionRate: Number(tenantSettings?.defaultCommissionRate ?? 10),
      bankName: tenantSettings?.bankName || "", bankAccountName: tenantSettings?.bankAccountName || "", bankAccountNumber: tenantSettings?.bankAccountNumber || "", bankBranch: tenantSettings?.bankBranch || "", bankSwiftCode: tenantSettings?.bankSwiftCode || "",
      primaryColor: tenantSettings?.primaryColor || tenant.brandColors?.primary || DEFAULTS.primaryColor, secondaryColor: tenantSettings?.secondaryColor || tenant.brandColors?.secondary || DEFAULTS.secondaryColor, accentColor: tenantSettings?.accentColor || tenant.brandColors?.accent || DEFAULTS.accentColor, backgroundColor: tenantSettings?.backgroundColor || DEFAULTS.backgroundColor, surfaceColor: tenantSettings?.surfaceColor || DEFAULTS.surfaceColor, textColor: tenantSettings?.textColor || DEFAULTS.textColor,
      fontFamily: tenantSettings?.fontFamily || DEFAULTS.fontFamily, borderRadius: tenantSettings?.borderRadius || DEFAULTS.borderRadius, buttonStyle: tenantSettings?.buttonStyle || DEFAULTS.buttonStyle, heroOverlayOpacity: Number(tenantSettings?.heroOverlayOpacity ?? DEFAULTS.heroOverlayOpacity), homepageSections: { ...DEFAULTS.homepageSections, ...(tenantSettings?.homepageSections instanceof Map ? Object.fromEntries(tenantSettings.homepageSections) : tenantSettings?.homepageSections || {}) },
    };
    return res.status(200).json({ success: true, data: settings, settings });
  } catch (error) { next(error); }
};
