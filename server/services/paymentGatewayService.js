import { requireTenantId } from "../tenancy/context.js";
import PaymentGatewayConfig, { decryptSecret } from "../models/PaymentGatewayConfig.js";
import { mpesaConfig as legacyMpesaConfig } from "../config/mpesa.js";

/**
 * Resolve the active M-Pesa configuration for the current tenant.
 * Tenant credentials are decrypted only in memory and are never returned
 * from the admin API or written to logs.
 */
export const getTenantMpesaConfig = async () => {
  const tenantId = requireTenantId();
  const gateway = await PaymentGatewayConfig.findOne({
    tenantId,
    provider: "MPESA",
    enabled: true,
  }).lean();

  if (gateway) {
    const consumerKey = decryptSecret(gateway.consumerKeyEncrypted);
    const consumerSecret = decryptSecret(gateway.consumerSecretEncrypted);
    const passkey = decryptSecret(gateway.passkeyEncrypted);

    if (!consumerKey || !consumerSecret || !gateway.shortcode || !passkey) {
      throw new Error("Tenant M-Pesa configuration is incomplete.");
    }

    return {
      consumerKey,
      consumerSecret,
      shortcode: gateway.shortcode,
      passkey,
      callbackUrl: gateway.callbackUrl || legacyMpesaConfig.callbackUrl,
      environment: gateway.environment || "sandbox",
      source: "tenant",
    };
  }

  if (process.env.ALLOW_GLOBAL_MPESA_FALLBACK === "false") {
    throw new Error("M-Pesa is not configured for this tenant.");
  }

  if (!legacyMpesaConfig.consumerKey || !legacyMpesaConfig.consumerSecret || !legacyMpesaConfig.shortcode || !legacyMpesaConfig.passkey) {
    throw new Error("M-Pesa is not configured for this tenant.");
  }

  return {
    ...legacyMpesaConfig,
    source: "legacy",
  };
};

export const getTenantMpesaUrls = (config) => {
  const production = config.environment === "production";
  return production
    ? {
        auth: "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
        stk: "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
        query: "https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query",
      }
    : {
        auth: "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
        stk: "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
        query: "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query",
      };
};
