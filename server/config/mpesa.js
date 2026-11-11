/**
 * Purpose: mpesa configuration module. Main declarations: validateMpesaEnvironment, hasLegacyMpesaConfig, getMpesaUrls.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// server/config/mpesa.js

// Load dotenv so this module can use its exported dependencies.
import dotenv from "dotenv";

// Perform the side effect or state update expressed on the following line.
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

// Declare mpesaConfig for use by the surrounding module or function.
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

// Declare validateMpesaEnvironment for use by the surrounding module or function.
export const validateMpesaEnvironment = (environment = mpesaConfig.environment) => {
  // Declare normalized for use by the surrounding module or function.
  const normalized = String(environment || "").trim().toLowerCase();
  // Check the condition (!["sandbox", "production"].includes(normalized)) and run the matching branch.
  if (!["sandbox", "production"].includes(normalized)) {
    // Stop the current operation by raising the result of Object.assign().
    throw Object.assign(new Error("MPESA_ENVIRONMENT must be either sandbox or production."), { status: 503, expose: true });
  }
  // Return the value of normalized to the caller.
  return normalized;
};

// Declare hasLegacyMpesaConfig for use by the surrounding module or function.
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

// Declare getMpesaUrls for use by the surrounding module or function.
export const getMpesaUrls = (environment = mpesaConfig.environment) => {
  // Declare normalized for use by the surrounding module or function.
  const normalized = validateMpesaEnvironment(environment);
  // Declare base for use by the surrounding module or function.
  const base = String(normalized === "production"
    ? (process.env.MPESA_PRODUCTION_BASE_URL || mpesaConfig.productionBaseUrl)
    : (process.env.MPESA_SANDBOX_BASE_URL || mpesaConfig.sandboxBaseUrl)).trim().replace(/\/$/, "");
  // Declare expectedHost for use by the surrounding module or function.
  const expectedHost = normalized === "production" ? "api.safaricom.co.ke" : "sandbox.safaricom.co.ke";
  // Declare parsed for use by the surrounding module or function.
  let parsed;
  // Run this operation with a dedicated error-handling path for failures.
  try { parsed = new URL(base); } catch { parsed = null; }
  // Check the condition (!parsed || parsed.protocol !== "https:" || parsed.hostname.toLowerCase) and run the matching branch.
  if (!parsed || parsed.protocol !== "https:" || parsed.hostname.toLowerCase() !== expectedHost || parsed.username || parsed.password || (parsed.pathname !== "/" && parsed.pathname !== "")) {
    // Stop the current operation by raising the result of Object.assign().
    throw Object.assign(new Error(`Configured Daraja ${normalized} base URL is invalid.`), { status: 503, expose: true });
  }
  // Return the object assembled below to the caller.
  return {
    auth: `${base}/oauth/v1/generate?grant_type=client_credentials`,
    stk: `${base}/mpesa/stkpush/v1/processrequest`,
    query: `${base}/mpesa/stkpushquery/v1/query`,
    reversal: `${base}/mpesa/reversal/v1/request`,
    b2c: `${base}/mpesa/b2c/v1/paymentrequest`,
  };
};
