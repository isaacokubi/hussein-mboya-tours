import SystemSetting from "../models/SystemSetting.js";
import Organization from "../models/Organization.js";
import { getTenantContext, requireTenantId, isTenantBypassed } from "../tenancy/context.js";
import { COMPANY_DEFAULTS } from "../config/companyDefaults.js";

const DEFAULTS = {
  ...COMPANY_DEFAULTS,
  primaryColor: "#047857", secondaryColor: "#064e3b", accentColor: "#10b981", backgroundColor: "#f8fafc", surfaceColor: "#ffffff", textColor: "#0f172a",
  fontFamily: "Inter", borderRadius: "xl", buttonStyle: "rounded", heroOverlayOpacity: 50,
  homepageSections: { stats: true, tours: true, destinations: true, experiences: true, services: true, testimonials: true, gallery: true, whyChooseUs: true, newsletter: true },
};

const COLOR_FIELDS = ["primaryColor", "secondaryColor", "accentColor", "backgroundColor", "surfaceColor", "textColor"];
const ALLOWED = ["companyName", "companyLogo", "websiteUrl", "supportEmail", "supportPhone", "address", "city", "country", "currency", "currencySymbol", "timezone", "language", "taxRate", "bookingDepositPercentage", "defaultCommissionRate", "maintenanceMode", "allowRegistrations", "allowAgentRegistrations", "requireEmailVerification", "requirePhoneVerification", "enableMpesa", "enableStripe", "enablePaypal", "enableBankTransfer", "bankName", "bankAccountName", "bankAccountNumber", "bankBranch", "bankSwiftCode", "emailFromName", "emailFromAddress", "facebook", "instagram", "twitter", "youtube", "seoTitle", "seoDescription", "seoKeywords", "bookingNotifications", "paymentNotifications", ...COLOR_FIELDS, "fontFamily", "borderRadius", "buttonStyle", "heroOverlayOpacity", "homepageSections"];

const isColor = (value) => /^#[0-9a-fA-F]{6}$/.test(String(value || ""));
const normalizeUpdates = (body = {}) => {
  const updates = {};
  for (const key of ALLOWED) if (body[key] !== undefined) updates[key] = body[key];
  updates.companyName = String(updates.companyName ?? DEFAULTS.companyName).trim();
  updates.supportEmail = String(updates.supportEmail ?? DEFAULTS.supportEmail).trim().toLowerCase();
  updates.supportPhone = String(updates.supportPhone ?? DEFAULTS.supportPhone).trim();
  updates.currency = String(updates.currency ?? DEFAULTS.currency).trim().toUpperCase();
  updates.timezone = String(updates.timezone ?? DEFAULTS.timezone).trim();
  for (const key of ["taxRate", "bookingDepositPercentage", "defaultCommissionRate", "heroOverlayOpacity"]) if (updates[key] !== undefined) updates[key] = Number(updates[key]);
  for (const key of ["bookingNotifications", "paymentNotifications", "maintenanceMode", "allowRegistrations", "allowAgentRegistrations", "requireEmailVerification", "requirePhoneVerification", "enableMpesa", "enableStripe", "enablePaypal", "enableBankTransfer"]) if (typeof updates[key] === "string") updates[key] = updates[key] === "true";
  if (typeof updates.seoKeywords === "string") { try { updates.seoKeywords = JSON.parse(updates.seoKeywords); } catch { updates.seoKeywords = updates.seoKeywords.split(",").map((v) => v.trim()).filter(Boolean); } }
  if (typeof updates.homepageSections === "string") { try { updates.homepageSections = JSON.parse(updates.homepageSections); } catch { updates.homepageSections = undefined; } }
  return updates;
};

const validateUpdates = (updates) => {
  for (const key of COLOR_FIELDS) if (updates[key] !== undefined && !isColor(updates[key])) return `${key} must be a valid 6-digit hex color.`;
  if (updates.heroOverlayOpacity !== undefined && (updates.heroOverlayOpacity < 0 || updates.heroOverlayOpacity > 100)) return "Hero overlay opacity must be between 0 and 100.";
  if ((updates.taxRate ?? 0) < 0 || (updates.taxRate ?? 0) > 100 || (updates.bookingDepositPercentage ?? 0) < 0 || (updates.bookingDepositPercentage ?? 0) > 100 || (updates.defaultCommissionRate ?? 0) < 0 || (updates.defaultCommissionRate ?? 0) > 100) return "Tax, deposit and commission rates must be between 0 and 100.";
  if (!updates.companyName) return "Company name cannot be empty.";
  if (updates.supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.supportEmail)) return "Enter a valid support email.";
  return null;
};

const getOrCreateSettings = async (filter) => {
  let settings = await SystemSetting.findOne(filter).lean();
  if (settings) return settings;
  try {
    settings = await SystemSetting.create({ ...filter, ...DEFAULTS });
    return settings.toObject();
  } catch (error) {
    if (error?.code === 11000) {
      const existing = await SystemSetting.findOne(filter).lean();
      if (existing) return existing;
    }
    throw error;
  }
};

export const getSettings = async (req, res, next) => {
  try {
    if (isTenantBypassed()) {
      const settings = await getOrCreateSettings({ tenantId: null, key: "platform" });
      return res.status(200).json({ success: true, data: settings, settings, scope: "platform" });
    }
    requireTenantId();
    const { tenantId } = getTenantContext();
    const settings = await getOrCreateSettings({ tenantId, key: "default" });
    return res.status(200).json({ success: true, data: settings, settings, scope: "tenant" });
  } catch (error) { next(error); }
};

export const updateSettings = async (req, res, next) => {
  try {
    const updates = normalizeUpdates(req.body);
    if (req.file?.path) updates.companyLogo = req.file.path;
    const validationError = validateUpdates(updates);
    if (validationError) return res.status(400).json({ success: false, message: validationError });
    const filter = isTenantBypassed() ? { tenantId: null, key: "platform" } : { tenantId: requireTenantId(), key: "default" };
    let settings = await SystemSetting.findOne(filter);
    if (!settings) {
      try { settings = new SystemSetting({ ...filter, ...DEFAULTS }); await settings.save(); }
      catch (error) { if (error?.code !== 11000) throw error; settings = await SystemSetting.findOne(filter); if (!settings) throw error; }
    }
    Object.assign(settings, updates);
    await settings.save();
    const saved = settings.toObject();
    const scope = filter.key === "platform" ? "platform" : "tenant";
    return res.status(200).json({ success: true, message: scope === "platform" ? "Platform settings saved successfully." : "Tenant settings saved successfully.", data: saved, settings: saved, scope });
  } catch (error) {
    console.error("UPDATE SETTINGS ERROR:", error);
    return res.status(error?.status || 500).json({ success: false, message: error.message || "Failed to save tenant settings." });
  }
};

export const getPublicSettings = async (req, res, next) => {
  try {
    requireTenantId();
    const { tenantId } = getTenantContext();
    const tenant = await Organization.findById(tenantId).lean();
    if (!tenant) return res.status(404).json({ success: false, message: "Tenant not resolved" });
    const tenantSettings = await SystemSetting.findOne({ tenantId, key: "default" }).lean();
    const overrides = tenant.settings && typeof tenant.settings === "object" ? tenant.settings : {};
    const settings = {
      companyName: tenantSettings?.companyName || tenant.name || DEFAULTS.companyName,
      supportEmail: tenantSettings?.supportEmail || tenant.supportEmail || "",
      supportPhone: tenantSettings?.supportPhone || tenant.supportPhone || "",
      websiteUrl: tenantSettings?.websiteUrl || tenant.websiteUrl || "",
      companyLogo: tenantSettings?.companyLogo || tenant.logoUrl || "",
      address: tenantSettings?.address || tenant.address || "", city: tenantSettings?.city || tenant.city || "", country: tenantSettings?.country || tenant.country || "Kenya",
      currency: tenantSettings?.currency || tenant.currency || "KES", currencySymbol: tenantSettings?.currencySymbol || "KSh", timezone: tenantSettings?.timezone || tenant.timezone || "Africa/Nairobi", language: tenantSettings?.language || "en",
      facebook: tenantSettings?.facebook || "", instagram: tenantSettings?.instagram || "", twitter: tenantSettings?.twitter || "", youtube: tenantSettings?.youtube || "",
      seoTitle: tenantSettings?.seoTitle || "", seoDescription: tenantSettings?.seoDescription || "", seoKeywords: tenantSettings?.seoKeywords || [],
      maintenanceMode: Boolean(tenantSettings?.maintenanceMode), allowRegistrations: tenantSettings?.allowRegistrations !== false, allowAgentRegistrations: tenantSettings?.allowAgentRegistrations !== false,
      requireEmailVerification: tenantSettings?.requireEmailVerification !== false, requirePhoneVerification: Boolean(tenantSettings?.requirePhoneVerification),
      enableMpesa: overrides.enableMpesa ?? tenantSettings?.enableMpesa ?? tenant.features?.mpesa !== false, enableStripe: overrides.enableStripe ?? tenantSettings?.enableStripe ?? tenant.features?.stripe === true, enablePaypal: overrides.enablePaypal ?? tenantSettings?.enablePaypal ?? false, enableBankTransfer: overrides.enableBankTransfer ?? tenantSettings?.enableBankTransfer ?? true,
      bookingNotifications: tenantSettings?.bookingNotifications !== false, paymentNotifications: tenantSettings?.paymentNotifications !== false,
      taxRate: Number(tenantSettings?.taxRate || 0), bookingDepositPercentage: Number(tenantSettings?.bookingDepositPercentage ?? 30), defaultCommissionRate: Number(tenantSettings?.defaultCommissionRate ?? 10),
      bankName: tenantSettings?.bankName || "", bankAccountName: tenantSettings?.bankAccountName || "", bankAccountNumber: tenantSettings?.bankAccountNumber || "", bankBranch: tenantSettings?.bankBranch || "", bankSwiftCode: tenantSettings?.bankSwiftCode || "",
      primaryColor: tenantSettings?.primaryColor || DEFAULTS.primaryColor, secondaryColor: tenantSettings?.secondaryColor || DEFAULTS.secondaryColor, accentColor: tenantSettings?.accentColor || DEFAULTS.accentColor,
      backgroundColor: tenantSettings?.backgroundColor || DEFAULTS.backgroundColor, surfaceColor: tenantSettings?.surfaceColor || DEFAULTS.surfaceColor, textColor: tenantSettings?.textColor || DEFAULTS.textColor,
      fontFamily: tenantSettings?.fontFamily || DEFAULTS.fontFamily, borderRadius: tenantSettings?.borderRadius || DEFAULTS.borderRadius, buttonStyle: tenantSettings?.buttonStyle || DEFAULTS.buttonStyle, heroOverlayOpacity: Number(tenantSettings?.heroOverlayOpacity ?? DEFAULTS.heroOverlayOpacity),
      homepageSections: { ...DEFAULTS.homepageSections, ...(tenantSettings?.homepageSections || {}) },
    };
    return res.json({ success: true, settings });
  } catch (error) { next(error); }
};
