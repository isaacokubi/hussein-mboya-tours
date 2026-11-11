/**
 * Purpose: payment Gateway Service business-logic service. Main declarations: isLegacyMpesaFallbackAllowed, gatewayConfigurationError, getTenantMpesaConfig, getTenantMpesaUrls.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { requireTenantId } from "../tenancy/context.js";
// Load ../models/PaymentGatewayConfig.js so this module can use its exported dependencies.
import PaymentGatewayConfig, { decryptSecret } from "../models/PaymentGatewayConfig.js";
// Load ../config/mpesa.js so this module can use its exported dependencies.
import { mpesaConfig as legacyMpesaConfig, hasLegacyMpesaConfig, getMpesaUrls } from "../config/mpesa.js";
// Load ./mpesaGatewaySettings.js so this module can use its exported dependencies.
import { getEnvironmentMpesaSettings, validateMpesaGatewaySettings } from "./mpesaGatewaySettings.js";

// Declare isLegacyMpesaFallbackAllowed for use by the surrounding module or function.
export const isLegacyMpesaFallbackAllowed = (nodeEnv, setting) => (
  nodeEnv !== "production" && String(setting || "").toLowerCase() === "true"
);

// Declare gatewayConfigurationError for use by the surrounding module or function.
const gatewayConfigurationError = (message) => Object.assign(new Error(message), {
  status: 503,
  code: "PAYMENT_GATEWAY_NOT_CONFIGURED",
  expose: true,
});

/** Resolve the active M-Pesa configuration for the current tenant. */
// Declare getTenantMpesaConfig for use by the surrounding module or function.
export const getTenantMpesaConfig = async ({ environment: requestedEnvironment = "", allowDisabled = false } = {}) => {
  // Declare tenantId for use by the surrounding module or function.
  const tenantId = requireTenantId();
  // Declare gateway for use by the surrounding module or function.
  const gateway = await PaymentGatewayConfig.findOne({ tenantId, provider: "MPESA" }).lean();

  // Check the condition (gateway) and run the matching branch.
  if (gateway) {
    // Check the condition (!gateway.enabled && !allowDisabled) and run the matching branch.
    if (!gateway.enabled && !allowDisabled) throw gatewayConfigurationError("M-Pesa is disabled for this tenant.");
    // Declare environment for use by the surrounding module or function.
    const environment = String(requestedEnvironment || gateway.environment || "sandbox").toLowerCase();
    // Check the condition (!["sandbox", "production"].includes(environment)) and run the matching branch.
    if (!["sandbox", "production"].includes(environment)) throw gatewayConfigurationError("M-Pesa environment must be sandbox or production.");
    // Declare environmentSettings for use by the surrounding module or function.
    const environmentSettings = getEnvironmentMpesaSettings(gateway, environment);
    // Declare config for use by the surrounding module or function.
    const config = {
      consumerKey: decryptSecret(environmentSettings.consumerKeyEncrypted),
      consumerSecret: decryptSecret(environmentSettings.consumerSecretEncrypted),
      shortcode: environmentSettings.shortcode,
      passkey: decryptSecret(environmentSettings.passkeyEncrypted),
      callbackUrl: environmentSettings.callbackUrl,
      environment,
      initiatorName: decryptSecret(gateway.initiatorNameEncrypted),
      securityCredential: decryptSecret(gateway.securityCredentialEncrypted),
      source: "tenant",
    };

    // Check the condition (!config.consumerKey || !config.consumerSecret || !config.shortcode || ) and run the matching branch.
    if (!config.consumerKey || !config.consumerSecret || !config.shortcode || !config.passkey) {
      // Stop the current operation by raising the result of gatewayConfigurationError().
      throw gatewayConfigurationError("M-Pesa configuration is incomplete for this tenant.");
    }
    // Check the condition (!config.callbackUrl) and run the matching branch.
    if (!config.callbackUrl) throw gatewayConfigurationError("M-Pesa callback URL is not configured for this tenant.");
    // Check the condition (!["sandbox", "production"].includes(String(config.environment).toLower) and run the matching branch.
    if (!["sandbox", "production"].includes(String(config.environment).toLowerCase())) {
      // Stop the current operation by raising the result of gatewayConfigurationError().
      throw gatewayConfigurationError("M-Pesa environment must be sandbox or production.");
    }
    // Declare callbackError for use by the surrounding module or function.
    const callbackError = validateMpesaGatewaySettings(config);
    // Check the condition (callbackError) and run the matching branch.
    if (callbackError) throw gatewayConfigurationError(callbackError);
    // Return the value of config to the caller.
    return config;
  }

  // Check the condition (!isLegacyMpesaFallbackAllowed(process.env.NODE_ENV, process.env.ALLOW_) and run the matching branch.
  if (!isLegacyMpesaFallbackAllowed(process.env.NODE_ENV, process.env.ALLOW_GLOBAL_MPESA_FALLBACK) || !hasLegacyMpesaConfig()) {
    // Stop the current operation by raising the result of gatewayConfigurationError().
    throw gatewayConfigurationError("M-Pesa is not configured for this tenant.");
  }

  // Declare legacyCallbackError for use by the surrounding module or function.
  const legacyCallbackError = validateMpesaGatewaySettings(legacyMpesaConfig);
  // Check the condition (legacyCallbackError) and run the matching branch.
  if (legacyCallbackError) throw gatewayConfigurationError(legacyCallbackError);
  // Return the object assembled below to the caller.
  return { ...legacyMpesaConfig, source: "legacy" };
};

// Declare getTenantMpesaUrls for use by the surrounding module or function.
export const getTenantMpesaUrls = (config) => {
  // Declare environment for use by the surrounding module or function.
  const environment = String(config?.environment || "sandbox").toLowerCase();
  // Return the result of getMpesaUrls() to the caller.
  return getMpesaUrls(environment);
};
