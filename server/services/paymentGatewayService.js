import { requireTenantId } from "../tenancy/context.js";
import PaymentGatewayConfig, { decryptSecret } from "../models/PaymentGatewayConfig.js";
import { mpesaConfig as legacyMpesaConfig, hasLegacyMpesaConfig } from "../config/mpesa.js";

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
      throw new Error("Tenant M-Pesa configuration is incomplete.");
    }
    return config;
  }

  if (process.env.ALLOW_GLOBAL_MPESA_FALLBACK === "false" || !hasLegacyMpesaConfig()) {
    throw new Error("M-Pesa is not configured for this tenant.");
  }

  return { ...legacyMpesaConfig, source: "legacy" };
};

export const getTenantMpesaUrls = (config) => {
  const host = config.environment === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";
  return {
    auth: `${host}/oauth/v1/generate?grant_type=client_credentials`,
    stk: `${host}/mpesa/stkpush/v1/processrequest`,
    query: `${host}/mpesa/stkpushquery/v1/query`,
    b2c: `${host}/mpesa/b2c/v1/paymentrequest`,
  };
};
