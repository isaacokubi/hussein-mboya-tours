import { requireTenantId } from "../tenancy/context.js";
import PaymentGatewayConfig, { decryptSecret } from "../models/PaymentGatewayConfig.js";
import { mpesaConfig as legacyMpesaConfig, hasLegacyMpesaConfig, getMpesaUrls } from "../config/mpesa.js";
import { getEnvironmentMpesaSettings, validateMpesaGatewaySettings } from "./mpesaGatewaySettings.js";

export const isLegacyMpesaFallbackAllowed = (nodeEnv, setting) => (
  nodeEnv !== "production" && String(setting || "").toLowerCase() === "true"
);

const gatewayConfigurationError = (message) => Object.assign(new Error(message), {
  status: 503,
  code: "PAYMENT_GATEWAY_NOT_CONFIGURED",
  expose: true,
});

/** Resolve the active M-Pesa configuration for the current tenant. */
export const getTenantMpesaConfig = async ({ environment: requestedEnvironment = "", allowDisabled = false } = {}) => {
  const tenantId = requireTenantId();
  const gateway = await PaymentGatewayConfig.findOne({ tenantId, provider: "MPESA" }).lean();

  if (gateway) {
    if (!gateway.enabled && !allowDisabled) throw gatewayConfigurationError("M-Pesa is disabled for this tenant.");
    const environment = String(requestedEnvironment || gateway.environment || "sandbox").toLowerCase();
    if (!["sandbox", "production"].includes(environment)) throw gatewayConfigurationError("M-Pesa environment must be sandbox or production.");
    const environmentSettings = getEnvironmentMpesaSettings(gateway, environment);
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

    if (!config.consumerKey || !config.consumerSecret || !config.shortcode || !config.passkey) {
      throw gatewayConfigurationError("M-Pesa configuration is incomplete for this tenant.");
    }
    if (!config.callbackUrl) throw gatewayConfigurationError("M-Pesa callback URL is not configured for this tenant.");
    if (!["sandbox", "production"].includes(String(config.environment).toLowerCase())) {
      throw gatewayConfigurationError("M-Pesa environment must be sandbox or production.");
    }
    const callbackError = validateMpesaGatewaySettings(config);
    if (callbackError) throw gatewayConfigurationError(callbackError);
    return config;
  }

  if (!isLegacyMpesaFallbackAllowed(process.env.NODE_ENV, process.env.ALLOW_GLOBAL_MPESA_FALLBACK) || !hasLegacyMpesaConfig()) {
    throw gatewayConfigurationError("M-Pesa is not configured for this tenant.");
  }

  const legacyCallbackError = validateMpesaGatewaySettings(legacyMpesaConfig);
  if (legacyCallbackError) throw gatewayConfigurationError(legacyCallbackError);
  return { ...legacyMpesaConfig, source: "legacy" };
};

export const getTenantMpesaUrls = (config) => {
  const environment = String(config?.environment || "sandbox").toLowerCase();
  return getMpesaUrls(environment);
};
