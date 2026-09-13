import SystemSetting from "../models/SystemSetting.js";
import { runWithTenant } from "../tenancy/context.js";
import { hasLegacyMpesaConfig, mpesaConfig } from "../config/mpesa.js";
import { PLAN_FEATURE_CATALOG, PLAN_ORDER, getPlanFeatures, validatePlanFeatures } from "../services/planFeatureService.js";

const PRICE_FIELDS = { starter: "tenantPlanStarterPriceKes", professional: "tenantPlanProfessionalPriceKes", business: "tenantPlanBusinessPriceKes", enterprise: "tenantPlanEnterprisePriceKes" };
const envPrices = () => ({ starter: Number(process.env.TENANT_PLAN_STARTER_PRICE_KES || 0), professional: Number(process.env.TENANT_PLAN_PROFESSIONAL_PRICE_KES || 0), business: Number(process.env.TENANT_PLAN_BUSINESS_PRICE_KES || 0), enterprise: Number(process.env.TENANT_PLAN_ENTERPRISE_PRICE_KES || 0) });
const paymentStatus = () => ({ provider: "mpesa", environment: mpesaConfig.environment, configured: hasLegacyMpesaConfig(), callbackConfigured: Boolean(mpesaConfig.callbackUrl), shortcodeConfigured: Boolean(mpesaConfig.shortcode) });
const readPlatformSettings = () => runWithTenant({ role: "super_admin", bypass: true }, () => SystemSetting.findOne({ tenantId: null, key: "platform" }).lean());
const writePlatformSettings = (work) => runWithTenant({ role: "super_admin", bypass: true }, work);

export const getPlatformBillingConfig = async (req, res, next) => {
  try {
    const settings = await readPlatformSettings();
    const env = envPrices();
    const prices = Object.fromEntries(Object.entries(PRICE_FIELDS).map(([plan, field]) => [plan, Number(settings?.[field] ?? env[plan] ?? 0)]));
    const features = await getPlanFeatures();
    return res.json({ success: true, prices, currency: "KES", mpesa: paymentStatus(), features, featureCatalog: PLAN_FEATURE_CATALOG.map(([id, name, description]) => ({ id, name, description })) });
  } catch (error) { next(error); }
};

export const updatePlatformBillingConfig = async (req, res, next) => {
  try {
    const result = await writePlatformSettings(async () => {
      let settings = await SystemSetting.findOne({ tenantId: null, key: "platform" });
      if (!settings) settings = new SystemSetting({ tenantId: null, key: "platform", companyName: "Global Tours" });
      const values = {};
      for (const [plan, field] of Object.entries(PRICE_FIELDS)) {
        const value = Number(req.body?.[plan]);
        if (!Number.isInteger(value) || value < 0 || value > 100000000) {
          const error = new Error(`${plan} price must be a whole KES amount between 0 and 100,000,000.`);
          error.statusCode = 400;
          throw error;
        }
        values[field] = value;
      }
      const rawFeatures = req.body?.features;
      const features = rawFeatures === undefined ? await getPlanFeatures() : validatePlanFeatures(rawFeatures);
      settings.subscriptionPlanFeatures = features;
      Object.assign(settings, values);
      await settings.save();
      return { prices: Object.fromEntries(Object.entries(PRICE_FIELDS).map(([plan, field]) => [plan, Number(settings[field] || 0)])), features };
    });
    return res.json({ success: true, message: "Subscription pricing and plan features saved successfully.", prices: result.prices, features: result.features, currency: "KES", mpesa: paymentStatus() });
  } catch (error) { next(error); }
};

export const getPlatformPlanFeatureCatalog = async (req, res, next) => {
  try { return res.json({ success: true, plans: await getPlanFeatures(), catalog: PLAN_FEATURE_CATALOG.map(([id, name, description]) => ({ id, name, description })) }); }
  catch (error) { next(error); }
};
