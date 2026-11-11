/**
 * Purpose: platform Billing Controller HTTP controller. Main declarations: envPrices, paymentStatus, readPlatformSettings, writePlatformSettings, getPlatformBillingConfig.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import SystemSetting from "../models/SystemSetting.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { runWithTenant } from "../tenancy/context.js";
// Load ../config/mpesa.js so this module can use its exported dependencies.
import { hasLegacyMpesaConfig, mpesaConfig } from "../config/mpesa.js";
// Load ../services/planFeatureService.js so this module can use its exported dependencies.
import { PLAN_FEATURE_CATALOG, PLAN_ORDER, getPlanFeatures, validatePlanFeatures } from "../services/planFeatureService.js";

// Declare PRICE_FIELDS for use by the surrounding module or function.
const PRICE_FIELDS = { starter: "tenantPlanStarterPriceKes", professional: "tenantPlanProfessionalPriceKes", business: "tenantPlanBusinessPriceKes", enterprise: "tenantPlanEnterprisePriceKes" };
// Declare envPrices for use by the surrounding module or function.
const envPrices = () => ({ starter: Number(process.env.TENANT_PLAN_STARTER_PRICE_KES || 0), professional: Number(process.env.TENANT_PLAN_PROFESSIONAL_PRICE_KES || 0), business: Number(process.env.TENANT_PLAN_BUSINESS_PRICE_KES || 0), enterprise: Number(process.env.TENANT_PLAN_ENTERPRISE_PRICE_KES || 0) });
// Declare paymentStatus for use by the surrounding module or function.
const paymentStatus = () => ({ provider: "mpesa", environment: mpesaConfig.environment, configured: hasLegacyMpesaConfig(), callbackConfigured: Boolean(mpesaConfig.callbackUrl), shortcodeConfigured: Boolean(mpesaConfig.shortcode) });
// Declare readPlatformSettings for use by the surrounding module or function.
const readPlatformSettings = () => runWithTenant({ role: "super_admin", bypass: true }, () => SystemSetting.findOne({ tenantId: null, key: "platform" }).lean());
// Declare writePlatformSettings for use by the surrounding module or function.
const writePlatformSettings = (work) => runWithTenant({ role: "super_admin", bypass: true }, work);

// Declare getPlatformBillingConfig for use by the surrounding module or function.
export const getPlatformBillingConfig = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare settings for use by the surrounding module or function.
    const settings = await readPlatformSettings();
    // Declare env for use by the surrounding module or function.
    const env = envPrices();
    // Declare prices for use by the surrounding module or function.
    const prices = Object.fromEntries(Object.entries(PRICE_FIELDS).map(([plan, field]) => [plan, Number(settings?.[field] ?? env[plan] ?? 0)]));
    // Declare features for use by the surrounding module or function.
    const features = await getPlanFeatures();
    // Return the result of res.json() to the caller.
    return res.json({ success: true, prices, currency: "KES", mpesa: paymentStatus(), features, featureCatalog: PLAN_FEATURE_CATALOG.map(([id, name, description]) => ({ id, name, description })) });
  } catch (error) { next(error); }
};

// Declare updatePlatformBillingConfig for use by the surrounding module or function.
export const updatePlatformBillingConfig = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare result for use by the surrounding module or function.
    const result = await writePlatformSettings(async () => {
      // Declare settings for use by the surrounding module or function.
      let settings = await SystemSetting.findOne({ tenantId: null, key: "platform" });
      // Check the condition (!settings) and run the matching branch.
      if (!settings) settings = new SystemSetting({ tenantId: null, key: "platform", companyName: "Global Tours" });
      // Declare values for use by the surrounding module or function.
      const values = {};
      // Repeat the enclosed work for each required iteration.
      for (const [plan, field] of Object.entries(PRICE_FIELDS)) {
        // Declare value for use by the surrounding module or function.
        const value = Number(req.body?.[plan]);
        // Check the condition (!Number.isInteger(value) || value < 0 || value > 100000000) and run the matching branch.
        if (!Number.isInteger(value) || value < 0 || value > 100000000) {
          // Declare error for use by the surrounding module or function.
          const error = new Error(`${plan} price must be a whole KES amount between 0 and 100,000,000.`);
          // Perform the side effect or state update expressed on the following line.
          error.statusCode = 400;
          // Stop the current operation by raising the value of error.
          throw error;
        }
        // Perform the side effect or state update expressed on the following line.
        values[field] = value;
      }
      // Declare rawFeatures for use by the surrounding module or function.
      const rawFeatures = req.body?.features;
      // Declare features for use by the surrounding module or function.
      const features = rawFeatures === undefined ? await getPlanFeatures() : validatePlanFeatures(rawFeatures);
      // Perform the side effect or state update expressed on the following line.
      settings.subscriptionPlanFeatures = features;
      // Perform the side effect or state update expressed on the following line.
      Object.assign(settings, values);
      // Perform the side effect or state update expressed on the following line.
      await settings.save();
      // Return the object assembled below to the caller.
      return { prices: Object.fromEntries(Object.entries(PRICE_FIELDS).map(([plan, field]) => [plan, Number(settings[field] || 0)])), features };
    });
    // Return the result of res.json() to the caller.
    return res.json({ success: true, message: "Subscription pricing and plan features saved successfully.", prices: result.prices, features: result.features, currency: "KES", mpesa: paymentStatus() });
  } catch (error) { next(error); }
};

// Declare getPlatformPlanFeatureCatalog for use by the surrounding module or function.
export const getPlatformPlanFeatureCatalog = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try { return res.json({ success: true, plans: await getPlanFeatures(), catalog: PLAN_FEATURE_CATALOG.map(([id, name, description]) => ({ id, name, description })) }); }
  // Handle the error raised by the preceding protected operation.
  catch (error) { next(error); }
};
