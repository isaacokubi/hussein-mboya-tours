// server/config/mpesa.js

import dotenv from "dotenv";

dotenv.config();

/*
|--------------------------------------------------------------------------
| LEGACY / PLATFORM-LEVEL MPESA CONFIGURATION
|--------------------------------------------------------------------------
|
| Tenant gateway credentials are now the primary configuration source.
| These environment variables are optional and are retained only for
| backward compatibility and controlled single-tenant deployments.
|--------------------------------------------------------------------------
*/

export const mpesaConfig = {
  consumerKey: process.env.MPESA_CONSUMER_KEY || "",
  consumerSecret: process.env.MPESA_CONSUMER_SECRET || "",
  shortcode: process.env.MPESA_SHORTCODE || "",
  passkey: process.env.MPESA_PASSKEY || "",
  callbackUrl: process.env.MPESA_CALLBACK_URL || "",
  initiatorName: process.env.MPESA_INITIATOR_NAME || "",
  securityCredential: process.env.MPESA_SECURITY_CREDENTIAL || "",
  environment: String(process.env.MPESA_ENVIRONMENT || "sandbox").trim().toLowerCase(),
  sandboxBaseUrl: String(process.env.MPESA_SANDBOX_BASE_URL || "https://sandbox.safaricom.co.ke").trim().replace(/\/$/, ""),
  productionBaseUrl: String(process.env.MPESA_PRODUCTION_BASE_URL || "https://api.safaricom.co.ke").trim().replace(/\/$/, ""),
};

export const validateMpesaEnvironment = (environment = mpesaConfig.environment) => {
  const normalized = String(environment || "").trim().toLowerCase();
  if (!["sandbox", "production"].includes(normalized)) {
    throw Object.assign(new Error("MPESA_ENVIRONMENT must be either sandbox or production."), { status: 503, expose: true });
  }
  return normalized;
};

export const hasLegacyMpesaConfig = () => Boolean(
  mpesaConfig.consumerKey &&
  mpesaConfig.consumerSecret &&
  mpesaConfig.shortcode &&
  mpesaConfig.passkey &&
  mpesaConfig.callbackUrl
);

/*
|--------------------------------------------------------------------------
| MPESA API URLS
|--------------------------------------------------------------------------
*/

export const getMpesaUrls = (environment = mpesaConfig.environment) => {
  const normalized = validateMpesaEnvironment(environment);
  const base = String(normalized === "production"
    ? (process.env.MPESA_PRODUCTION_BASE_URL || mpesaConfig.productionBaseUrl)
    : (process.env.MPESA_SANDBOX_BASE_URL || mpesaConfig.sandboxBaseUrl)).trim().replace(/\/$/, "");
  const expectedHost = normalized === "production" ? "api.safaricom.co.ke" : "sandbox.safaricom.co.ke";
  let parsed;
  try { parsed = new URL(base); } catch { parsed = null; }
  if (!parsed || parsed.protocol !== "https:" || parsed.hostname.toLowerCase() !== expectedHost || parsed.username || parsed.password || (parsed.pathname !== "/" && parsed.pathname !== "")) {
    throw Object.assign(new Error(`Configured Daraja ${normalized} base URL is invalid.`), { status: 503, expose: true });
  }
  return {
    auth: `${base}/oauth/v1/generate?grant_type=client_credentials`,
    stk: `${base}/mpesa/stkpush/v1/processrequest`,
    query: `${base}/mpesa/stkpushquery/v1/query`,
    b2c: `${base}/mpesa/b2c/v1/paymentrequest`,
  };
};
