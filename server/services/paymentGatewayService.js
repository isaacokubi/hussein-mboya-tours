import { requireTenantId } from "../tenancy/context.js";
import PaymentGatewayConfig, { decryptSecret } from "../models/PaymentGatewayConfig.js";
import { mpesaConfig as legacyMpesaConfig, hasLegacyMpesaConfig, getMpesaUrls } from "../config/mpesa.js";

export const isLegacyMpesaFallbackAllowed = (nodeEnv, setting) => (
  nodeEnv !== "production" && String(setting || "").toLowerCase() === "true"
);

const gatewayConfigurationError = (message) => Object.assign(new Error(message), {
  status: 503,
  code: "PAYMENT_GATEWAY_NOT_CONFIGURED",
  expose: true,
});

/** Resolve the active M-Pesa configuration for the current tenant. */
export const getTenantMpesaConfig = async () => {
  const tenantId = requireTenantId();
  const gateway = await PaymentGatewayConfig.findOne({ tenantId, provider: "MPESA", enabled: true }).lean();

  if (gateway) {
    const config = {
      consumerKey: decryptSecret(gateway.consumerKeyEncrypted),
      consumerSecret: decryptSecret(gateway.consumerSecretEncrypted),
      shortcode: gateway.shortcode,
      passkey: decryptSecret(gateway.passkeyEncrypted),
      callbackUrl: gateway.callbackUrl || legacyMpesaConfig.callbackUrl,
      environment: gateway.environment || "sandbox",
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
    return config;
  }

  if (!isLegacyMpesaFallbackAllowed(process.env.NODE_ENV, process.env.ALLOW_GLOBAL_MPESA_FALLBACK) || !hasLegacyMpesaConfig()) {
    throw gatewayConfigurationError("M-Pesa is not configured for this tenant.");
  }

  return { ...legacyMpesaConfig, source: "legacy" };
};

export const getTenantMpesaUrls = (config) => {
  const environment = String(config?.environment || "sandbox").toLowerCase();
  return getMpesaUrls(environment);
};
