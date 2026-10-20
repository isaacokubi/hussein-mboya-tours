// Load environment variables for local development when this module is imported.
import dotenv from "dotenv";

// Read a local .env file without overwriting values already supplied by the environment.
dotenv.config();

/*
 * Legacy/platform-level M-Pesa configuration.
 * Tenant gateway credentials are preferred; these variables remain for controlled
 * backward compatibility and single-tenant deployments. Never commit real values.
 */

// Collect optional platform-level Daraja settings in one exported object.
export const mpesaConfig = {
  consumerKey: process.env.MPESA_CONSUMER_KEY || "", // OAuth consumer key issued by Safaricom.
  consumerSecret: process.env.MPESA_CONSUMER_SECRET || "", // OAuth consumer secret; keep it server-side.
  shortcode: process.env.MPESA_SHORTCODE || "", // Paybill or till shortcode used by the configured account.
  passkey: process.env.MPESA_PASSKEY || "", // Daraja passkey used to create the STK password.
  callbackUrl: process.env.MPESA_CALLBACK_URL || "", // Public HTTPS endpoint that receives provider callbacks.
  initiatorName: process.env.MPESA_INITIATOR_NAME || "", // Initiator identity for supported business-to-business operations.
  securityCredential: process.env.MPESA_SECURITY_CREDENTIAL || "", // Encrypted credential required by certain Daraja operations.
  environment: String(process.env.MPESA_ENVIRONMENT || "sandbox").trim().toLowerCase(), // Default to sandbox unless explicitly configured.
  sandboxBaseUrl: String(process.env.MPESA_SANDBOX_BASE_URL || "https://sandbox.safaricom.co.ke").trim().replace(/\/$/, ""), // Normalize the sandbox API base URL.
  productionBaseUrl: String(process.env.MPESA_PRODUCTION_BASE_URL || "https://api.safaricom.co.ke").trim().replace(/\/$/, ""), // Normalize the live API base URL.
};

// Validate the requested environment before constructing a provider endpoint.
export const validateMpesaEnvironment = (environment = mpesaConfig.environment) => {
  // Normalize whitespace and case so equivalent environment names behave consistently.
  const normalized = String(environment || "").trim().toLowerCase();
  // Only the explicitly supported sandbox and production modes are allowed.
  if (!["sandbox", "production"].includes(normalized)) {
    // Attach a service-unavailable status and safe-to-show message for callers.
    throw Object.assign(new Error("MPESA_ENVIRONMENT must be either sandbox or production."), { status: 503, expose: true });
  }
  // Return the validated mode to the URL builder.
  return normalized;
};

// Report whether every credential needed by the legacy STK flow is present.
export const hasLegacyMpesaConfig = () => Boolean(
  mpesaConfig.consumerKey && // OAuth client identifier must be present.
  mpesaConfig.consumerSecret && // OAuth secret must be present.
  mpesaConfig.shortcode && // Merchant shortcode must be present.
  mpesaConfig.passkey && // STK passkey must be present.
  mpesaConfig.callbackUrl // Callback destination must be configured.
);

/*
 * Construct the endpoint URLs for the validated Daraja environment.
 */

// Return the provider endpoints for the selected sandbox/live environment.
export const getMpesaUrls = (environment = mpesaConfig.environment) => {
  // Validate the environment before using it to select a host.
  const normalized = validateMpesaEnvironment(environment);
  // Select the configured base URL for the requested environment and remove its trailing slash.
  const base = String(normalized === "production"
    ? (process.env.MPESA_PRODUCTION_BASE_URL || mpesaConfig.productionBaseUrl)
    : (process.env.MPESA_SANDBOX_BASE_URL || mpesaConfig.sandboxBaseUrl)).trim().replace(/\/$/, "");
  // Pin the expected hostname so a misconfiguration cannot redirect credentials to another host.
  const expectedHost = normalized === "production" ? "api.safaricom.co.ke" : "sandbox.safaricom.co.ke";
  // Declare the parsed URL separately so invalid input can be handled safely.
  let parsed;
  // Parse the base URL; malformed URLs are treated as invalid configuration.
  try { parsed = new URL(base); } catch { parsed = null; }
  // Require HTTPS, the exact environment hostname, no embedded credentials, and no custom path.
  if (!parsed || parsed.protocol !== "https:" || parsed.hostname.toLowerCase() !== expectedHost || parsed.username || parsed.password || (parsed.pathname !== "/" && parsed.pathname !== "")) {
    // Fail closed instead of sending payment credentials to an unexpected endpoint.
    throw Object.assign(new Error(`Configured Daraja ${normalized} base URL is invalid.`), { status: 503, expose: true });
  }
  // Return the known Daraja endpoints relative to the validated base URL.
  return {
    auth: `${base}/oauth/v1/generate?grant_type=client_credentials`, // OAuth endpoint for an access token.
    stk: `${base}/mpesa/stkpush/v1/processrequest`, // Endpoint that requests an STK Push prompt.
    query: `${base}/mpesa/stkpushquery/v1/query`, // Endpoint that queries the status of an STK request.
    reversal: `${base}/mpesa/reversal/v1/request`, // Endpoint for supported transaction reversals.
    b2c: `${base}/mpesa/b2c/v1/paymentrequest`, // Endpoint for supported business-to-customer payouts.
  };
};
