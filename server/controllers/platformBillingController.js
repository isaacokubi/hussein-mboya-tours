import SystemSetting from "../models/SystemSetting.js";
import { hasLegacyMpesaConfig, mpesaConfig } from "../config/mpesa.js";

const PRICE_FIELDS = { starter: "tenantPlanStarterPriceKes", professional: "tenantPlanProfessionalPriceKes", business: "tenantPlanBusinessPriceKes", enterprise: "tenantPlanEnterprisePriceKes" };
const envPrices = () => ({ starter: Number(process.env.TENANT_PLAN_STARTER_PRICE_KES || 0), professional: Number(process.env.TENANT_PLAN_PROFESSIONAL_PRICE_KES || 0), business: Number(process.env.TENANT_PLAN_BUSINESS_PRICE_KES || 0), enterprise: Number(process.env.TENANT_PLAN_ENTERPRISE_PRICE_KES || 0) });
const paymentStatus = () => ({ provider: "mpesa", environment: mpesaConfig.environment, configured: hasLegacyMpesaConfig(), callbackConfigured: Boolean(mpesaConfig.callbackUrl), shortcodeConfigured: Boolean(mpesaConfig.shortcode) });

export const getPlatformBillingConfig = async (req, res, next) => {
  try {
    const settings = await SystemSetting.findOne({ tenantId: null, key: "platform" }).lean();
    const env = envPrices();
    const prices = Object.fromEntries(Object.entries(PRICE_FIELDS).map(([plan, field]) => [plan, Number(settings?.[field] || env[plan] || 0)]));
    return res.json({ success: true, prices, currency: "KES", mpesa: paymentStatus() });
  } catch (error) { next(error); }
};

export const updatePlatformBillingConfig = async (req, res, next) => {
  try {
    let settings = await SystemSetting.findOne({ tenantId: null, key: "platform" });
    if (!settings) settings = new SystemSetting({ tenantId: null, key: "platform", companyName: "Global Tours" });
    const values = {};
    for (const [plan, field] of Object.entries(PRICE_FIELDS)) {
      const value = Number(req.body?.[plan]);
      if (!Number.isInteger(value) || value < 0 || value > 100000000) return res.status(400).json({ success: false, message: `${plan} price must be a whole KES amount between 0 and 100,000,000.` });
      values[field] = value;
    }
    Object.assign(settings, values);
    await settings.save();
    return res.json({ success: true, message: "Platform subscription pricing saved successfully.", prices: Object.fromEntries(Object.entries(PRICE_FIELDS).map(([plan, field]) => [plan, settings[field]])), currency: "KES", mpesa: paymentStatus() });
  } catch (error) { next(error); }
};
