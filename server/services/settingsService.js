import SystemSetting from "../models/SystemSetting.js";

const DEFAULT_SETTINGS = {
  key: "default",
  companyName: process.env.COMPANY_NAME || "Coherent Tours",
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
  enableBankTransfer: String(process.env.ENABLE_BANK_TRANSFER || "true").toLowerCase() !== "false",
  bankName: process.env.BANK_NAME || "",
  bankAccountName: process.env.BANK_ACCOUNT_NAME || "",
  bankAccountNumber: process.env.BANK_ACCOUNT_NUMBER || "",
  bankBranch: process.env.BANK_BRANCH || "",
  bankSwiftCode: process.env.BANK_SWIFT_CODE || "",
  emailFromName: process.env.EMAIL_FROM_NAME || "Coherent Tours",
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

const resolveTenantId = (source) => source?.tenantId || source?.user?.tenantId || (source?.user?._id && source?.tenantId) || null;

export async function getSystemSettings(source = {}) {
  const tenantId = resolveTenantId(source);

  if (!tenantId) {
    const platformSettings = await SystemSetting.findOne({ tenantId: null, key: "platform" }).lean().catch(() => null);
    if (platformSettings) return { ...DEFAULT_SETTINGS, ...platformSettings, _tenantScoped: false, _platformScoped: true };

    return { ...DEFAULT_SETTINGS, _isDefault: true, _tenantScoped: false, _platformScoped: false };
  }

  let settings = await SystemSetting.findOne({ tenantId, key: "default" }).lean();
  if (!settings) {
    settings = await SystemSetting.findOneAndUpdate(
      { tenantId, key: "default" },
      { $setOnInsert: { ...DEFAULT_SETTINGS, tenantId, key: "default" } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();
  }

  return { ...DEFAULT_SETTINGS, ...settings, tenantId, _tenantScoped: true, _platformScoped: false };
}

export async function updateSystemSettings(source = {}, updates = {}) {
  const tenantId = resolveTenantId(source);
  const allowedFields = Object.keys(DEFAULT_SETTINGS);
  const safeUpdates = {};
  for (const field of allowedFields) if (Object.prototype.hasOwnProperty.call(updates, field)) safeUpdates[field] = updates[field];

  if (!tenantId) {
    return SystemSetting.findOneAndUpdate(
      { tenantId: null, key: "platform" },
      { $set: safeUpdates, $setOnInsert: { tenantId: null, key: "platform" } },
      { upsert: true, new: true, runValidators: true }
    ).lean();
  }

  return SystemSetting.findOneAndUpdate(
    { tenantId, key: "default" },
    { $set: safeUpdates, $setOnInsert: { tenantId, key: "default" } },
    { upsert: true, new: true, runValidators: true }
  ).lean();
}

export { DEFAULT_SETTINGS };
export default getSystemSettings;
