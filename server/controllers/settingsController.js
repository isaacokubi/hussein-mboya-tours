/**
 * Purpose: settings Controller HTTP controller. Main declarations: isColor, normalizeUpdates, validateUpdates, getOrCreateSettings, getTenantProfile.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { publicErrorMessage } from "../utils/publicError.js";
// Load ../models/SystemSetting.js so this module can use its exported dependencies.
import SystemSetting from "../models/SystemSetting.js";
// Load ../models/Organization.js so this module can use its exported dependencies.
import Organization from "../models/Organization.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { getTenantContext, requireTenantId, isTenantBypassed } from "../tenancy/context.js";
// Load ../config/companyDefaults.js so this module can use its exported dependencies.
import { COMPANY_DEFAULTS } from "../config/companyDefaults.js";
// Load ../models/PaymentGatewayConfig.js so this module can use its exported dependencies.
import PaymentGatewayConfig from "../models/PaymentGatewayConfig.js";
// Load ../services/mpesaGatewaySettings.js so this module can use its exported dependencies.
import { getEnvironmentMpesaSettings } from "../services/mpesaGatewaySettings.js";
// Load ../services/paypalService.js so this module can use its exported dependencies.
import { getPaypalEnvironmentSettings } from "../services/paypalService.js";
// Load ../services/tenantPaymentMethods.js so this module can use its exported dependencies.
import { isPaypalCurrencySupported, isStripeRuntimeEnvironmentValid } from "../services/tenantPaymentMethods.js";

// Declare DEFAULTS for use by the surrounding module or function.
const DEFAULTS = { ...COMPANY_DEFAULTS, primaryColor: "#047857", secondaryColor: "#064e3b", accentColor: "#10b981", backgroundColor: "#f8fafc", surfaceColor: "#ffffff", textColor: "#0f172a", fontFamily: "Inter", borderRadius: "xl", buttonStyle: "rounded", heroOverlayOpacity: 50, homepageSections: { stats: true, tours: true, packages: true, destinations: true, experiences: true, services: true, testimonials: true, gallery: true, whyChooseUs: true, newsletter: true } };
// Declare COLOR_FIELDS for use by the surrounding module or function.
const COLOR_FIELDS = ["primaryColor", "secondaryColor", "accentColor", "backgroundColor", "surfaceColor", "textColor"];
// Declare NUMERIC_FIELDS for use by the surrounding module or function.
const NUMERIC_FIELDS = ["taxRate", "bookingDepositPercentage", "defaultCommissionRate", "heroOverlayOpacity"];
// Declare BOOLEAN_FIELDS for use by the surrounding module or function.
const BOOLEAN_FIELDS = ["bookingNotifications", "paymentNotifications", "maintenanceMode", "allowRegistrations", "allowAgentRegistrations", "requireEmailVerification", "requirePhoneVerification", "enableMpesa", "enableStripe", "enablePaypal", "enableBankTransfer", "enableCash", "cashReceiptRequired"];
// Declare ALLOWED for use by the surrounding module or function.
const ALLOWED = ["companyName", "companyLogo", "websiteUrl", "supportEmail", "supportPhone", "address", "city", "country", "currency", "currencySymbol", "timezone", "language", "taxRate", "bookingDepositPercentage", "defaultCommissionRate", "maintenanceMode", "allowRegistrations", "allowAgentRegistrations", "requireEmailVerification", "requirePhoneVerification", "enableMpesa", "enableStripe", "enablePaypal", "enableBankTransfer", "enableCash", "cashReceiptRequired", "bankName", "bankAccountName", "bankAccountNumber", "bankBranch", "bankSwiftCode", "bankInstructions", "bankReferenceInstructions", "cashInstructions", "cashCollectionLocation", "emailFromName", "emailFromAddress", "facebook", "instagram", "twitter", "youtube", "seoTitle", "seoDescription", "seoKeywords", "bookingNotifications", "paymentNotifications", ...COLOR_FIELDS, "fontFamily", "borderRadius", "buttonStyle", "heroOverlayOpacity", "homepageSections"];
// Declare isColor for use by the surrounding module or function.
const isColor = (value) => /^#[0-9a-fA-F]{6}$/.test(String(value || ""));

// Declare normalizeUpdates for use by the surrounding module or function.
const normalizeUpdates = (body = {}) => {
  // Declare updates for use by the surrounding module or function.
  const updates = {};
  // Repeat the enclosed work for each required iteration.
  for (const key of ALLOWED) if (body[key] !== undefined) updates[key] = body[key];
  // Check the condition (updates.companyName !== undefined) and run the matching branch.
  if (updates.companyName !== undefined) updates.companyName = String(updates.companyName).trim();
  // Check the condition (updates.supportEmail !== undefined) and run the matching branch.
  if (updates.supportEmail !== undefined) updates.supportEmail = String(updates.supportEmail).trim().toLowerCase();
  // Check the condition (updates.supportPhone !== undefined) and run the matching branch.
  if (updates.supportPhone !== undefined) updates.supportPhone = String(updates.supportPhone).trim();
  // Check the condition (updates.currency !== undefined) and run the matching branch.
  if (updates.currency !== undefined) updates.currency = String(updates.currency).trim().toUpperCase();
  // Check the condition (updates.timezone !== undefined) and run the matching branch.
  if (updates.timezone !== undefined) updates.timezone = String(updates.timezone).trim();
  // Repeat the enclosed work for each required iteration.
  for (const key of NUMERIC_FIELDS) if (updates[key] !== undefined) { const value = Number(updates[key]); updates[key] = Number.isFinite(value) ? value : updates[key]; }
  // Repeat the enclosed work for each required iteration.
  for (const key of BOOLEAN_FIELDS) if (typeof updates[key] === "string") updates[key] = updates[key] === "true";
  // Check the condition (typeof updates.seoKeywords === "string") and run the matching branch.
  if (typeof updates.seoKeywords === "string") { try { updates.seoKeywords = JSON.parse(updates.seoKeywords); } catch { updates.seoKeywords = updates.seoKeywords.split(",").map((v) => v.trim()).filter(Boolean); } }
  // Check the condition (typeof updates.homepageSections === "string") and run the matching branch.
  if (typeof updates.homepageSections === "string") { try { updates.homepageSections = JSON.parse(updates.homepageSections); } catch { updates.homepageSections = undefined; } }
  // Return the value of updates to the caller.
  return updates;
};

// Declare validateUpdates for use by the surrounding module or function.
const validateUpdates = (updates, existing = {}) => {
  // Repeat the enclosed work for each required iteration.
  for (const key of COLOR_FIELDS) if (updates[key] !== undefined && !isColor(updates[key])) return `${key} must be a valid 6-digit hex color.`;
  // Check the condition (updates.heroOverlayOpacity !== undefined && (!Number.isFinite(updates.) and run the matching branch.
  if (updates.heroOverlayOpacity !== undefined && (!Number.isFinite(updates.heroOverlayOpacity) || updates.heroOverlayOpacity < 0 || updates.heroOverlayOpacity > 100)) return "Hero overlay opacity must be between 0 and 100.";
  // Repeat the enclosed work for each required iteration.
  for (const key of ["taxRate", "bookingDepositPercentage", "defaultCommissionRate"]) if (updates[key] !== undefined && (!Number.isFinite(updates[key]) || updates[key] < 0 || updates[key] > 100)) return "Tax, deposit and commission rates must be between 0 and 100.";
  // Declare companyName for use by the surrounding module or function.
  const companyName = String(updates.companyName ?? existing.companyName ?? DEFAULTS.companyName).trim();
  // Check the condition (!companyName) and run the matching branch.
  if (!companyName) return "Company name cannot be empty.";
  // Check the condition (updates.supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.sup) and run the matching branch.
  if (updates.supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.supportEmail)) return "Enter a valid support email.";
  // Declare bankEnabled for use by the surrounding module or function.
  const bankEnabled = updates.enableBankTransfer ?? existing.enableBankTransfer;
  // Check the condition (bankEnabled === true && ["enableBankTransfer", "bankName", "bankAccoun) and run the matching branch.
  if (bankEnabled === true && ["enableBankTransfer", "bankName", "bankAccountName", "bankAccountNumber", "bankBranch", "bankSwiftCode"].some((key) => updates[key] !== undefined)) {
    // Declare values for use by the surrounding module or function.
    const values = { ...existing, ...updates };
    // Check the condition (!String(values.bankName || "").trim() || !String(values.bankAccountNam) and run the matching branch.
    if (!String(values.bankName || "").trim() || !String(values.bankAccountName || "").trim() || !/^[A-Za-z0-9][A-Za-z0-9 -]{4,33}$/.test(String(values.bankAccountNumber || "").trim()) || !String(values.bankInstructions || "").trim()) return "Bank transfer requires bank name, beneficiary name, valid account number and customer instructions.";
    // Check the condition (values.bankSwiftCode && !/^[A-Za-z0-9]{8}(?:[A-Za-z0-9]{3})?$/.test(St) and run the matching branch.
    if (values.bankSwiftCode && !/^[A-Za-z0-9]{8}(?:[A-Za-z0-9]{3})?$/.test(String(values.bankSwiftCode).trim())) return "Enter a valid 8- or 11-character SWIFT/BIC code.";
  }
  // Check the condition ((updates.enableCash ?? existing.enableCash) === true && ["enableCash",) and run the matching branch.
  if ((updates.enableCash ?? existing.enableCash) === true && ["enableCash", "cashInstructions", "cashCollectionLocation"].some((key) => updates[key] !== undefined)) {
    // Declare values for use by the surrounding module or function.
    const values = { ...existing, ...updates };
    // Check the condition (!String(values.cashCollectionLocation || "").trim() || !String(values.) and run the matching branch.
    if (!String(values.cashCollectionLocation || "").trim() || !String(values.cashInstructions || "").trim()) return "Cash payments require a collection location and customer instructions.";
  }
  // Return the expression shown below to the caller.
  return null;
};

// Declare getOrCreateSettings for use by the surrounding module or function.
const getOrCreateSettings = async (filter) => {
  // Declare settings for use by the surrounding module or function.
  let settings = await SystemSetting.findOne(filter).lean();
  // Check the condition (settings) and run the matching branch.
  if (settings) return settings;
  // Declare seed for use by the surrounding module or function.
  const seed = { ...filter, ...DEFAULTS };
  // Check the condition (filter.tenantId) and run the matching branch.
  if (filter.tenantId) {
    // Declare tenant for use by the surrounding module or function.
    const tenant = await Organization.findById(filter.tenantId).lean();
    // Check the condition (tenant) and run the matching branch.
    if (tenant) Object.assign(seed, { companyName: tenant.name || DEFAULTS.companyName, companyLogo: tenant.logoUrl || "", websiteUrl: tenant.websiteUrl || "", supportEmail: tenant.supportEmail || "", supportPhone: tenant.supportPhone || "", address: tenant.address || "", country: tenant.country || DEFAULTS.country, currency: tenant.currency || DEFAULTS.currency, timezone: tenant.timezone || DEFAULTS.timezone, emailFromName: tenant.name || DEFAULTS.companyName, emailFromAddress: tenant.supportEmail || "", seoTitle: tenant.name || DEFAULTS.companyName, primaryColor: tenant.brandColors?.primary || DEFAULTS.primaryColor, secondaryColor: tenant.brandColors?.secondary || DEFAULTS.secondaryColor, accentColor: tenant.brandColors?.accent || DEFAULTS.accentColor });
  }
  // Run this operation with a dedicated error-handling path for failures.
  try { settings = await SystemSetting.create(seed); return settings.toObject(); }
  // Handle the error raised by the preceding protected operation.
  catch (error) { if (error?.code === 11000) { const existing = await SystemSetting.findOne(filter).lean(); if (existing) return existing; } throw error; }
};

// Declare getTenantProfile for use by the surrounding module or function.
const getTenantProfile = async (tenantId) => { const tenant = await Organization.findById(tenantId).lean(); if (!tenant) return null; const primaryAdministrator = await User.findOne({ tenantId: tenant._id, role: { $in: ["admin", "administrator"] } }).select("name email phone status").sort({ createdAt: 1 }).lean(); return { id: tenant._id, companyName: tenant.name, legalName: tenant.legalName || "", slug: tenant.slug, platformUrl: `https://${tenant.slug}.${String(process.env.PLATFORM_HOST || "globaltours.com").replace(/^https?:\/\//, "").replace(/\/$/, "")}`, customDomain: tenant.domain || "", websiteUrl: tenant.websiteUrl || "", companyEmail: tenant.supportEmail || "", companyPhone: tenant.supportPhone || "", country: tenant.country || "Kenya", currency: tenant.currency || "KES", timezone: tenant.timezone || "Africa/Nairobi", logoUrl: tenant.logoUrl || "", favicon: tenant.favicon || "", brandColors: tenant.brandColors || {}, status: tenant.status, subscriptionPlan: tenant.subscription?.plan || "starter", userSeats: Number(tenant.subscription?.seats || 0), trialEndsAt: tenant.subscription?.trialEndsAt || null, renewsAt: tenant.subscription?.renewsAt || null, primaryAdministrator: primaryAdministrator || null }; };

// Declare getSettings for use by the surrounding module or function.
export const getSettings = async (req, res, next) => { try { if (isTenantBypassed()) { const settings = await getOrCreateSettings({ tenantId: null, key: "platform" }); return res.status(200).json({ success: true, data: settings, settings, scope: "platform" }); } requireTenantId(); const { tenantId } = getTenantContext(); const settings = await getOrCreateSettings({ tenantId, key: "default" }); const tenantProfile = await getTenantProfile(tenantId); const resolved = { ...settings, companyName: tenantProfile?.companyName || settings.companyName, companyLogo: tenantProfile?.logoUrl || settings.companyLogo, websiteUrl: tenantProfile?.websiteUrl || settings.websiteUrl, supportEmail: tenantProfile?.companyEmail || settings.supportEmail, supportPhone: tenantProfile?.companyPhone || settings.supportPhone, currency: tenantProfile?.currency || settings.currency, timezone: tenantProfile?.timezone || settings.timezone, seoTitle: tenantProfile?.companyName || settings.seoTitle }; return res.status(200).json({ success: true, data: { ...resolved, tenantProfile }, settings: { ...resolved, tenantProfile }, tenantProfile, scope: "tenant" }); } catch (error) { next(error); } };

// Declare updateSettings for use by the surrounding module or function.
export const updateSettings = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare filter for use by the surrounding module or function.
    const filter = isTenantBypassed() ? { tenantId: null, key: "platform" } : { tenantId: requireTenantId(), key: "default" };
    // Declare settings for use by the surrounding module or function.
    let settings = await SystemSetting.findOne(filter);
    // Check the condition (!settings) and run the matching branch.
    if (!settings) { const seed = { ...filter, ...DEFAULTS }; if (filter.tenantId) { const tenant = await Organization.findById(filter.tenantId).lean(); if (tenant) Object.assign(seed, { companyName: tenant.name || DEFAULTS.companyName, companyLogo: tenant.logoUrl || "", websiteUrl: tenant.websiteUrl || "", supportEmail: tenant.supportEmail || "", supportPhone: tenant.supportPhone || "", address: tenant.address || "", country: tenant.country || DEFAULTS.country, currency: tenant.currency || DEFAULTS.currency, timezone: tenant.timezone || DEFAULTS.timezone, emailFromName: tenant.name || DEFAULTS.companyName, emailFromAddress: tenant.supportEmail || "", seoTitle: tenant.name || DEFAULTS.companyName, primaryColor: tenant.brandColors?.primary || DEFAULTS.primaryColor, secondaryColor: tenant.brandColors?.secondary || DEFAULTS.secondaryColor, accentColor: tenant.brandColors?.accent || DEFAULTS.accentColor }); } try { settings = new SystemSetting(seed); await settings.save(); } catch (error) { if (error?.code !== 11000) throw error; settings = await SystemSetting.findOne(filter); if (!settings) throw error; } }
    // Declare updates for use by the surrounding module or function.
    const updates = normalizeUpdates(req.body); if (req.file?.path) updates.companyLogo = req.file.path; const validationError = validateUpdates(updates, settings); if (validationError) return res.status(400).json({ success: false, message: validationError }); Object.assign(settings, updates); await settings.save();
    // Check the condition (!isTenantBypassed()) and run the matching branch.
    if (!isTenantBypassed()) { const tenantId = requireTenantId(); const organizationUpdates = {}; const map = { companyName: "name", companyLogo: "logoUrl", websiteUrl: "websiteUrl", supportEmail: "supportEmail", supportPhone: "supportPhone", address: "address", country: "country", timezone: "timezone", currency: "currency" }; for (const [settingKey, organizationKey] of Object.entries(map)) if (updates[settingKey] !== undefined) organizationUpdates[organizationKey] = updates[settingKey]; if (Object.keys(organizationUpdates).length) await Organization.findByIdAndUpdate(tenantId, { $set: organizationUpdates }, { runValidators: true }); if (updates.primaryColor !== undefined || updates.secondaryColor !== undefined || updates.accentColor !== undefined) { const tenant = await Organization.findById(tenantId).select("brandColors"); if (tenant) { tenant.brandColors = { ...(tenant.brandColors || {}), ...(updates.primaryColor !== undefined ? { primary: updates.primaryColor } : {}), ...(updates.secondaryColor !== undefined ? { secondary: updates.secondaryColor } : {}), ...(updates.accentColor !== undefined ? { accent: updates.accentColor } : {}) }; await tenant.save(); } } }
    // Declare saved for use by the surrounding module or function.
    const saved = settings.toObject(); const scope = filter.key === "platform" ? "platform" : "tenant"; const tenantProfile = scope === "tenant" ? await getTenantProfile(filter.tenantId) : null; const resolved = scope === "tenant" ? { ...saved, companyName: tenantProfile?.companyName || saved.companyName, companyLogo: tenantProfile?.logoUrl || saved.companyLogo, websiteUrl: tenantProfile?.websiteUrl || saved.websiteUrl, supportEmail: tenantProfile?.companyEmail || saved.supportEmail, supportPhone: tenantProfile?.companyPhone || saved.supportPhone, currency: tenantProfile?.currency || saved.currency, timezone: tenantProfile?.timezone || saved.timezone, seoTitle: tenantProfile?.companyName || saved.seoTitle } : saved; return res.status(200).json({ success: true, message: scope === "platform" ? "Platform settings saved successfully." : "Tenant settings saved successfully.", data: scope === "tenant" ? { ...resolved, tenantProfile } : resolved, settings: scope === "tenant" ? { ...resolved, tenantProfile } : resolved, tenantProfile, scope });
  } catch (error) { console.error("UPDATE SETTINGS ERROR:", error); return res.status(error?.status || 500).json({ success: false, message: publicErrorMessage(error, "Failed to save tenant settings.") }); }
};

// Declare getPublicSettings for use by the surrounding module or function.
export const getPublicSettings = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    requireTenantId(); const { tenantId } = getTenantContext(); const tenant = await Organization.findById(tenantId).lean(); if (!tenant) return res.status(404).json({ success: false, message: "Tenant not resolved" }); let tenantSettings = await SystemSetting.findOne({ tenantId, key: "default" }).lean(); if (!tenantSettings) tenantSettings = await getOrCreateSettings({ tenantId, key: "default" });
    // Declare mpesaGateway for use by the surrounding module or function.
    const mpesaGateway = await PaymentGatewayConfig.findOne({ tenantId, provider: "MPESA" }).lean();
    // Declare mpesaEnvironment for use by the surrounding module or function.
    const mpesaEnvironment = mpesaGateway?.environment || "sandbox";
    // Declare mpesaCredentials for use by the surrounding module or function.
    const mpesaCredentials = getEnvironmentMpesaSettings(mpesaGateway || {}, mpesaEnvironment);
    // Declare mpesaReady for use by the surrounding module or function.
    const mpesaReady = Boolean(mpesaGateway?.enabled && mpesaCredentials.consumerKeyEncrypted && mpesaCredentials.consumerSecretEncrypted && mpesaCredentials.passkeyEncrypted && mpesaCredentials.shortcode && mpesaCredentials.callbackUrl);
    // Declare paypalGateway for use by the surrounding module or function.
    const paypalGateway = await PaymentGatewayConfig.findOne({ tenantId, provider: "PAYPAL" }).lean();
    // Declare paypalEnvironment for use by the surrounding module or function.
    const paypalEnvironment = getPaypalEnvironmentSettings(paypalGateway || {}, paypalGateway?.environment);
    // Declare paypalAvailable for use by the surrounding module or function.
    const paypalAvailable = Boolean(paypalGateway?.enabled && paypalEnvironment.configured && paypalEnvironment.validatedAt && isPaypalCurrencySupported(tenant.currency || tenantSettings?.currency) && (paypalGateway.environment !== "production" || paypalGateway.sandboxLifecycleVerifiedAt));
    // Declare bankName for use by the surrounding module or function.
    const bankName = tenantSettings?.bankName || "";
    // Declare bankAccountName for use by the surrounding module or function.
    const bankAccountName = tenantSettings?.bankAccountName || "";
    // Declare bankAccountNumber for use by the surrounding module or function.
    const bankAccountNumber = tenantSettings?.bankAccountNumber || "";
    // Declare bankReady for use by the surrounding module or function.
    const bankReady = Boolean(bankName.trim() && bankAccountName.trim() && /^[A-Za-z0-9][A-Za-z0-9 -]{4,33}$/.test(bankAccountNumber.trim()) && String(tenantSettings?.bankInstructions || "").trim());
    // Declare cashReady for use by the surrounding module or function.
    const cashReady = Boolean(String(tenantSettings?.cashCollectionLocation || "").trim() && String(tenantSettings?.cashInstructions || "").trim());
    // Declare settings for use by the surrounding module or function.
    const settings = {
      companyName: tenant.name || tenantSettings?.companyName || DEFAULTS.companyName,
      supportEmail: tenant.supportEmail || tenantSettings?.supportEmail || "", supportPhone: tenant.supportPhone || tenantSettings?.supportPhone || "", websiteUrl: tenant.websiteUrl || tenantSettings?.websiteUrl || "", companyLogo: tenant.logoUrl || tenantSettings?.companyLogo || "",
      legalName: tenant.legalName || "", companySlug: tenant.slug || "", platformUrl: `https://${tenant.slug}.${String(process.env.PLATFORM_HOST || "globaltours.com").replace(/^https?:\/\//, "").replace(/\/$/, "")}`, customDomain: tenant.domain || "", favicon: tenant.favicon || "", brandColors: tenant.brandColors || {},
      subscriptionPlan: tenant.subscription?.plan || "starter", userSeats: Number(tenant.subscription?.seats || 0), tenantStatus: tenant.status || "trial", trialEndsAt: tenant.subscription?.trialEndsAt || null,
      address: tenant.address || tenantSettings?.address || "", city: tenantSettings?.city || tenant.city || "", country: tenant.country || tenantSettings?.country || "Kenya", currency: tenant.currency || tenantSettings?.currency || "KES", currencySymbol: tenantSettings?.currencySymbol || "KSh", timezone: tenant.timezone || tenantSettings?.timezone || "Africa/Nairobi", language: tenantSettings?.language || "en",
      facebook: tenantSettings?.facebook || "", instagram: tenantSettings?.instagram || "", twitter: tenantSettings?.twitter || "", youtube: tenantSettings?.youtube || "", seoTitle: tenant.name || tenantSettings?.seoTitle || DEFAULTS.companyName, seoDescription: tenantSettings?.seoDescription || "", seoKeywords: tenantSettings?.seoKeywords || [],
      maintenanceMode: Boolean(tenantSettings?.maintenanceMode), allowRegistrations: tenantSettings?.allowRegistrations !== false, allowAgentRegistrations: tenantSettings?.allowAgentRegistrations !== false, requireEmailVerification: tenantSettings?.requireEmailVerification !== false, requirePhoneVerification: Boolean(tenantSettings?.requirePhoneVerification),
      enableMpesa: Boolean(tenantSettings?.enableMpesa !== false && mpesaReady), enableStripe: Boolean(tenantSettings?.enableStripe === true && process.env.STRIPE_WEBHOOK_SECRET && isStripeRuntimeEnvironmentValid(process.env)), stripeConfigured: Boolean(process.env.STRIPE_WEBHOOK_SECRET && isStripeRuntimeEnvironmentValid(process.env)), enablePaypal: paypalAvailable, paypalAvailable, enableBankTransfer: Boolean(tenantSettings?.enableBankTransfer === true && bankReady), enableCash: Boolean(tenantSettings?.enableCash === true && cashReady),
      bookingNotifications: tenantSettings?.bookingNotifications !== false, paymentNotifications: tenantSettings?.paymentNotifications !== false, taxRate: Number(tenantSettings?.taxRate || 0), bookingDepositPercentage: Number(tenantSettings?.bookingDepositPercentage ?? 30), defaultCommissionRate: Number(tenantSettings?.defaultCommissionRate ?? 10),
      bankName, bankAccountName, bankAccountNumber, bankBranch: tenantSettings?.bankBranch || "", bankSwiftCode: tenantSettings?.bankSwiftCode || "", bankInstructions: tenantSettings?.bankInstructions || "", bankReferenceInstructions: tenantSettings?.bankReferenceInstructions || "", cashInstructions: tenantSettings?.cashInstructions || "", cashCollectionLocation: tenantSettings?.cashCollectionLocation || "", cashReceiptRequired: Boolean(tenantSettings?.cashReceiptRequired),
      primaryColor: tenantSettings?.primaryColor || tenant.brandColors?.primary || DEFAULTS.primaryColor, secondaryColor: tenantSettings?.secondaryColor || tenant.brandColors?.secondary || DEFAULTS.secondaryColor, accentColor: tenantSettings?.accentColor || tenant.brandColors?.accent || DEFAULTS.accentColor, backgroundColor: tenantSettings?.backgroundColor || DEFAULTS.backgroundColor, surfaceColor: tenantSettings?.surfaceColor || DEFAULTS.surfaceColor, textColor: tenantSettings?.textColor || DEFAULTS.textColor,
      fontFamily: tenantSettings?.fontFamily || DEFAULTS.fontFamily, borderRadius: tenantSettings?.borderRadius || DEFAULTS.borderRadius, buttonStyle: tenantSettings?.buttonStyle || DEFAULTS.buttonStyle, heroOverlayOpacity: Number(tenantSettings?.heroOverlayOpacity ?? DEFAULTS.heroOverlayOpacity), homepageSections: { ...DEFAULTS.homepageSections, ...(tenantSettings?.homepageSections || {}) },
    };
    // Return the result of res.json() to the caller.
    return res.json({ success: true, settings });
  } catch (error) { next(error); }
};
