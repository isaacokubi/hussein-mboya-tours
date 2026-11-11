/**
 * Purpose: settings Service business-logic service. Main declarations: resolveTenantId, getSystemSettings, updateSystemSettings.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import SystemSetting from "../models/SystemSetting.js";
// Load ../models/PaymentGatewayConfig.js so this module can use its exported dependencies.
import PaymentGatewayConfig from "../models/PaymentGatewayConfig.js";
// Load ./paypalService.js so this module can use its exported dependencies.
import { getPaypalEnvironmentSettings } from "./paypalService.js";
// Load ./tenantPaymentMethods.js so this module can use its exported dependencies.
import { isPaypalCurrencySupported } from "./tenantPaymentMethods.js";

// Declare DEFAULT_SETTINGS for use by the surrounding module or function.
const DEFAULT_SETTINGS = {
  key: "default",
  companyName: process.env.COMPANY_NAME || "Global Tours",
  companyLogo: process.env.COMPANY_LOGO || "",
  websiteUrl: process.env.COMPANY_WEBSITE || "",
  supportEmail: process.env.SUPPORT_EMAIL || "",
  supportPhone: process.env.SUPPORT_PHONE || "",
  address: process.env.COMPANY_ADDRESS || "",
  city: process.env.COMPANY_CITY || "Nairobi",
  country: process.env.COMPANY_COUNTRY || "Kenya",
  currency: process.env.DEFAULT_CURRENCY || "KES",
  currencySymbol: process.env.DEFAULT_CURRENCY_SYMBOL || "KSh",
  timezone: process.env.DEFAULT_TIMEZONE || "Africa/Nairobi",
  language: process.env.DEFAULT_LANGUAGE || "en",
  taxRate: Number(process.env.DEFAULT_TAX_RATE || 0),
  bookingDepositPercentage: Number(process.env.DEFAULT_BOOKING_DEPOSIT_PERCENTAGE || 30),
  defaultCommissionRate: Number(process.env.DEFAULT_COMMISSION_RATE || 10),
  maintenanceMode: String(process.env.MAINTENANCE_MODE || "false").toLowerCase() === "true",
  allowRegistrations: String(process.env.ALLOW_REGISTRATIONS || "true").toLowerCase() !== "false",
  allowAgentRegistrations: String(process.env.ALLOW_AGENT_REGISTRATIONS || "true").toLowerCase() !== "false",
  requireEmailVerification: String(process.env.REQUIRE_EMAIL_VERIFICATION || "true").toLowerCase() !== "false",
  requirePhoneVerification: String(process.env.REQUIRE_PHONE_VERIFICATION || "false").toLowerCase() === "true",
  enableMpesa: String(process.env.ENABLE_MPESA || "true").toLowerCase() !== "false",
  enableStripe: String(process.env.ENABLE_STRIPE || "false").toLowerCase() === "true",
  enablePaypal: String(process.env.ENABLE_PAYPAL || "false").toLowerCase() === "true",
  enableBankTransfer: String(process.env.ENABLE_BANK_TRANSFER || "false").toLowerCase() === "true",
  enableCash: false,
  bankName: process.env.BANK_NAME || "",
  bankAccountName: process.env.BANK_ACCOUNT_NAME || "",
  bankAccountNumber: process.env.BANK_ACCOUNT_NUMBER || "",
  bankBranch: process.env.BANK_BRANCH || "",
  bankSwiftCode: process.env.BANK_SWIFT_CODE || "",
  bankInstructions: "",
  bankReferenceInstructions: "",
  cashInstructions: "",
  cashCollectionLocation: "",
  cashReceiptRequired: false,
  emailFromName: process.env.EMAIL_FROM_NAME || "Global Tours",
  emailFromAddress: process.env.EMAIL_FROM_ADDRESS || "",
  facebook: process.env.FACEBOOK_URL || "",
  instagram: process.env.INSTAGRAM_URL || "",
  twitter: process.env.TWITTER_URL || "",
  youtube: process.env.YOUTUBE_URL || "",
  seoTitle: process.env.SEO_TITLE || "",
  seoDescription: process.env.SEO_DESCRIPTION || "",
  seoKeywords: [],
  bookingNotifications: true,
  paymentNotifications: true,
};

// Declare resolveTenantId for use by the surrounding module or function.
const resolveTenantId = (source) => source?.tenantId || source?.user?.tenantId || (source?.user?._id && source?.tenantId) || null;

// Define getSystemSettings; its parameters and body implement this operation.
export async function getSystemSettings(source = {}) {
  // Declare tenantId for use by the surrounding module or function.
  const tenantId = resolveTenantId(source);

  // Check the condition (!tenantId) and run the matching branch.
  if (!tenantId) {
    // Declare platformSettings for use by the surrounding module or function.
    const platformSettings = await SystemSetting.findOne({ tenantId: null, key: "platform" }).lean().catch(() => null);
    // Check the condition (platformSettings) and run the matching branch.
    if (platformSettings) return { ...DEFAULT_SETTINGS, ...platformSettings, _tenantScoped: false, _platformScoped: true };

    // Return the object assembled below to the caller.
    return { ...DEFAULT_SETTINGS, _isDefault: true, _tenantScoped: false, _platformScoped: false };
  }

  // Declare settings for use by the surrounding module or function.
  let settings = await SystemSetting.findOne({ tenantId, key: "default" }).lean();
  // Check the condition (!settings) and run the matching branch.
  if (!settings) {
    // Perform the side effect or state update expressed on the following line.
    settings = await SystemSetting.findOneAndUpdate(
      { tenantId, key: "default" },
      { $setOnInsert: { ...DEFAULT_SETTINGS, tenantId, key: "default" } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();
  }

  // Declare paypal for use by the surrounding module or function.
  const paypal = await PaymentGatewayConfig.findOne({ tenantId, provider: "PAYPAL" }).lean().catch(() => null);
  // Declare paypalEnv for use by the surrounding module or function.
  const paypalEnv = getPaypalEnvironmentSettings(paypal || {}, paypal?.environment);
  // Declare paypalAvailable for use by the surrounding module or function.
  const paypalAvailable = Boolean(paypal?.enabled && paypalEnv.configured && paypalEnv.validatedAt && isPaypalCurrencySupported(settings?.currency || DEFAULT_SETTINGS.currency) && (paypal?.environment !== "production" || paypal.sandboxLifecycleVerifiedAt));
  // Return the object assembled below to the caller.
  return { ...DEFAULT_SETTINGS, ...settings, paypalAvailable, enablePaypal: paypalAvailable, tenantId, _tenantScoped: true, _platformScoped: false };
}

// Define updateSystemSettings; its parameters and body implement this operation.
export async function updateSystemSettings(source = {}, updates = {}) {
  // Declare tenantId for use by the surrounding module or function.
  const tenantId = resolveTenantId(source);
  // Declare allowedFields for use by the surrounding module or function.
  const allowedFields = Object.keys(DEFAULT_SETTINGS);
  // Declare safeUpdates for use by the surrounding module or function.
  const safeUpdates = {};
  // Repeat the enclosed work for each required iteration.
  for (const field of allowedFields) if (Object.prototype.hasOwnProperty.call(updates, field)) safeUpdates[field] = updates[field];

  // Check the condition (!tenantId) and run the matching branch.
  if (!tenantId) {
    // Return the result of SystemSetting.findOneAndUpdate(       { tenantId: null, key: "platform" },       { $set: safeUpdates, $setOnInsert: { tenantId: null, key: "platform" } },       { upsert: true, new: true, runValidators: true }     ).lean() to the caller.
    return SystemSetting.findOneAndUpdate(
      { tenantId: null, key: "platform" },
      { $set: safeUpdates, $setOnInsert: { tenantId: null, key: "platform" } },
      { upsert: true, new: true, runValidators: true }
    ).lean();
  }

  // Return the result of SystemSetting.findOneAndUpdate(     { tenantId, key: "default" },     { $set: safeUpdates, $setOnInsert: { tenantId, key: "default" } },     { upsert: true, new: true, runValidators: true }   ).lean() to the caller.
  return SystemSetting.findOneAndUpdate(
    { tenantId, key: "default" },
    { $set: safeUpdates, $setOnInsert: { tenantId, key: "default" } },
    { upsert: true, new: true, runValidators: true }
  ).lean();
}

// Expose the selected declarations or re-exported members to other parts of the application.
export { DEFAULT_SETTINGS };
export default getSystemSettings;
