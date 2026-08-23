import SystemSetting from "../models/SystemSetting.js";
import Organization from "../models/Organization.js";
import { getTenantContext, requireTenantId } from "../tenancy/context.js";
import { COMPANY_DEFAULTS } from "../config/companyDefaults.js";

const DEFAULTS = {
  ...COMPANY_DEFAULTS,
  primaryColor: "#047857", secondaryColor: "#064e3b", accentColor: "#10b981", backgroundColor: "#f8fafc", surfaceColor: "#ffffff", textColor: "#0f172a",
  fontFamily: "Inter", borderRadius: "xl", buttonStyle: "rounded", heroOverlayOpacity: 50,
  homepageSections: { stats: true, tours: true, destinations: true, experiences: true, services: true, testimonials: true, gallery: true, whyChooseUs: true, newsletter: true },
};

const COLOR_FIELDS = ["primaryColor", "secondaryColor", "accentColor", "backgroundColor", "surfaceColor", "textColor"];
const ALLOWED = [
  "companyName", "companyLogo", "websiteUrl", "supportEmail", "supportPhone", "address", "city", "country", "currency", "currencySymbol", "timezone", "language",
  "taxRate", "bookingDepositPercentage", "defaultCommissionRate", "maintenanceMode", "allowRegistrations", "allowAgentRegistrations", "requireEmailVerification", "requirePhoneVerification",
  "enableMpesa", "enableStripe", "enablePaypal", "enableBankTransfer", "bankName", "bankAccountName", "bankAccountNumber", "bankBranch", "bankSwiftCode",
  "emailFromName", "emailFromAddress", "facebook", "instagram", "twitter", "youtube", "seoTitle", "seoDescription", "seoKeywords", "bookingNotifications", "paymentNotifications",
  ...COLOR_FIELDS, "fontFamily", "borderRadius", "buttonStyle", "heroOverlayOpacity", "homepageSections",
];

const isColor = (value) => /^#[0-9a-fA-F]{6}$/.test(String(value || ""));

export const getSettings = async (req, res, next) => {
  try {
    requireTenantId();
    const { tenantId } = getTenantContext();
    const settings = await SystemSetting.findOneAndUpdate({ tenantId, key: "default" }, { $setOnInsert: { tenantId, key: "default", ...DEFAULTS } }, { upsert: true, new: true, setDefaultsOnInsert: true }).lean();
    return res.status(200).json({ success: true, data: settings, settings });
  } catch (error) { next(error); }
};

export const updateSettings = async (req, res, next) => {
  try {
    requireTenantId();
    const { tenantId } = getTenantContext();
    const updates = {};
    for (const key of ALLOWED) if (req.body?.[key] !== undefined) updates[key] = req.body[key];
    if (req.file?.path) updates.companyLogo = req.file.path;

    updates.companyName = String(updates.companyName ?? DEFAULTS.companyName).trim();
    updates.supportEmail = String(updates.supportEmail ?? DEFAULTS.supportEmail).trim().toLowerCase();
    updates.supportPhone = String(updates.supportPhone ?? DEFAULTS.supportPhone).trim();
    updates.currency = String(updates.currency ?? DEFAULTS.currency).trim().toUpperCase();
    updates.timezone = String(updates.timezone ?? DEFAULTS.timezone).trim();
    for (const key of ["taxRate", "bookingDepositPercentage", "defaultCommissionRate", "heroOverlayOpacity"]) if (updates[key] !== undefined) updates[key] = Number(updates[key]);
    for (const key of ["bookingNotifications", "paymentNotifications", "maintenanceMode", "allowRegistrations", "allowAgentRegistrations", "requireEmailVerification", "requirePhoneVerification", "enableMpesa", "enableStripe", "enablePaypal", "enableBankTransfer"]) if (typeof updates[key] === "string") updates[key] = updates[key] === "true";
    if (typeof updates.seoKeywords === "string") { try { updates.seoKeywords = JSON.parse(updates.seoKeywords); } catch { updates.seoKeywords = updates.seoKeywords.split(",").map((v) => v.trim()).filter(Boolean); } }
    if (typeof updates.homepageSections === "string") { try { updates.homepageSections = JSON.parse(updates.homepageSections); } catch { updates.homepageSections = undefined; } }

    for (const key of COLOR_FIELDS) if (updates[key] !== undefined && !isColor(updates[key])) return res.status(400).json({ success: false, message: `${key} must be a valid 6-digit hex color.` });
    if (updates.heroOverlayOpacity !== undefined && (updates.heroOverlayOpacity < 0 || updates.heroOverlayOpacity > 100)) return res.status(400).json({ success: false, message: "Hero overlay opacity must be between 0 and 100." });
    if (updates.taxRate < 0 || updates.taxRate > 100 || updates.bookingDepositPercentage < 0 || updates.bookingDepositPercentage > 100 || updates.defaultCommissionRate < 0 || updates.defaultCommissionRate > 100) return res.status(400).json({ success: false, message: "Tax, deposit and commission rates must be between 0 and 100." });
    if (!updates.companyName) return res.status(400).json({ success: false, message: "Company name cannot be empty." });
    if (updates.supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.supportEmail)) return res.status(400).json({ success: false, message: "Enter a valid support email." });

    let settings = await SystemSetting.findOne({ tenantId, key: "default" });
    if (!settings) settings = new SystemSetting({ tenantId, key: "default", ...DEFAULTS });
    Object.assign(settings, updates);
    settings.tenantId = tenantId;
    await settings.save();
    const saved = settings.toObject();
    return res.status(200).json({ success: true, message: "System settings saved successfully.", data: saved, settings: saved });
  } catch (error) { console.error("UPDATE SETTINGS ERROR:", error); return res.status(500).json({ success: false, message: error.message || "Failed to save system settings." }); }
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
      companyName: tenant.name || tenantSettings?.companyName || DEFAULTS.companyName,
      supportEmail: tenant.supportEmail || tenantSettings?.supportEmail || "", supportPhone: tenant.supportPhone || tenantSettings?.supportPhone || "",
      currency: tenant.currency || tenantSettings?.currency || "KES", timezone: tenant.timezone || tenantSettings?.timezone || "Africa/Nairobi", currencySymbol: tenantSettings?.currencySymbol || "KSh",
      companyLogo: tenant.logoUrl || tenantSettings?.companyLogo || "", websiteUrl: tenant.websiteUrl || tenantSettings?.websiteUrl || "", address: tenant.address || tenantSettings?.address || "", city: tenant.city || tenantSettings?.city || "", country: tenant.country || tenantSettings?.country || "Kenya",
      facebook: tenantSettings?.facebook || "", instagram: tenantSettings?.instagram || "", twitter: tenantSettings?.twitter || "", youtube: tenantSettings?.youtube || "",
      enableMpesa: overrides.enableMpesa ?? tenantSettings?.enableMpesa ?? tenant.features?.mpesa !== false, enableStripe: overrides.enableStripe ?? tenantSettings?.enableStripe ?? tenant.features?.stripe === true, enableBankTransfer: overrides.enableBankTransfer ?? tenantSettings?.enableBankTransfer ?? true,
      taxRate: Number(tenantSettings?.taxRate || 0), bookingDepositPercentage: Number(tenantSettings?.bookingDepositPercentage ?? 30), defaultCommissionRate: Number(tenantSettings?.defaultCommissionRate ?? 10),
      bankName: tenantSettings?.bankName || "", bankAccountName: tenantSettings?.bankAccountName || "", bankAccountNumber: tenantSettings?.bankAccountNumber || "", bankBranch: tenantSettings?.bankBranch || "", bankSwiftCode: tenantSettings?.bankSwiftCode || "",
      primaryColor: tenantSettings?.primaryColor || DEFAULTS.primaryColor, secondaryColor: tenantSettings?.secondaryColor || DEFAULTS.secondaryColor, accentColor: tenantSettings?.accentColor || DEFAULTS.accentColor,
      backgroundColor: tenantSettings?.backgroundColor || DEFAULTS.backgroundColor, surfaceColor: tenantSettings?.surfaceColor || DEFAULTS.surfaceColor, textColor: tenantSettings?.textColor || DEFAULTS.textColor,
      fontFamily: tenantSettings?.fontFamily || DEFAULTS.fontFamily, borderRadius: tenantSettings?.borderRadius || DEFAULTS.borderRadius, buttonStyle: tenantSettings?.buttonStyle || DEFAULTS.buttonStyle, heroOverlayOpacity: Number(tenantSettings?.heroOverlayOpacity ?? DEFAULTS.heroOverlayOpacity),
      homepageSections: tenantSettings?.homepageSections || DEFAULTS.homepageSections,
    };
    return res.json({ success: true, settings });
  } catch (error) { next(error); }
};
