/**
 * Purpose: mpesa Gateway Settings business-logic service. Main declarations: parseHttpsUrl, getProductionMpesaCallbackUrl, getSandboxMpesaCallbackUrl, validateMpesaGatewaySettings, getEnvironmentMpesaSettings.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { isIP } from "node:net";

// Declare CALLBACK_PATH for use by the surrounding module or function.
const CALLBACK_PATH = "/api/mpesa/callback";

// Declare parseHttpsUrl for use by the surrounding module or function.
const parseHttpsUrl = (value) => {
  // Declare url for use by the surrounding module or function.
  let url;
  // Run this operation with a dedicated error-handling path for failures.
  try { url = new URL(String(value || "").trim()); } catch { return null; }
  // Check the condition (url.protocol !== "https:" || url.username || url.password || url.hash) and run the matching branch.
  if (url.protocol !== "https:" || url.username || url.password || url.hash) return null;
  // Check the condition (url.port && url.port !== "443") and run the matching branch.
  if (url.port && url.port !== "443") return null;
  // Check the condition (url.search) and run the matching branch.
  if (url.search) return null;
  // Check the condition (url.pathname.replace(/\/$/, "") !== CALLBACK_PATH) and run the matching branch.
  if (url.pathname.replace(/\/$/, "") !== CALLBACK_PATH) return null;
  // Declare host for use by the surrounding module or function.
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  // Check the condition (host === "localhost" || host.endsWith(".localhost") || host.endsWith(") and run the matching branch.
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".") || !host.includes(".")) return null;
  // Daraja callbacks must target a public DNS host. Reject literal IPs
  // outright so private, loopback, link-local, and ambiguous IP ranges cannot
  // be smuggled through textual range checks.
  // Check the condition (isIP(host)) and run the matching branch.
  if (isIP(host)) return null;
  // Return the value of url to the caller.
  return url;
};

// Declare getProductionMpesaCallbackUrl for use by the surrounding module or function.
export const getProductionMpesaCallbackUrl = (environment = process.env) => {
  // Declare explicit for use by the surrounding module or function.
  const explicit = String(environment.MPESA_PRODUCTION_CALLBACK_URL || "").trim();
  // Check the condition (explicit) and run the matching branch.
  if (explicit) return explicit;
  // Check the condition (String(environment.DEPLOYMENT_ENV || "").trim().toLowerCase() === "sta) and run the matching branch.
  if (String(environment.DEPLOYMENT_ENV || "").trim().toLowerCase() === "staging") return "";
  // Declare legacy for use by the surrounding module or function.
  const legacy = String(environment.MPESA_CALLBACK_URL || "").trim();
  // Check the condition (legacy) and run the matching branch.
  if (legacy) return legacy;
  // Check the condition (String(environment.NODE_ENV || "").toLowerCase() === "production" && e) and run the matching branch.
  if (String(environment.NODE_ENV || "").toLowerCase() === "production" && environment.RENDER_EXTERNAL_URL) {
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Declare origin for use by the surrounding module or function.
      const origin = new URL(environment.RENDER_EXTERNAL_URL).origin;
      // Return the expression shown below to the caller.
      return `${origin}${CALLBACK_PATH}`;
    } catch { return ""; }
  }
  // Return a configured text value to the caller.
  return "";
};

// Declare getSandboxMpesaCallbackUrl for use by the surrounding module or function.
export const getSandboxMpesaCallbackUrl = (environment = process.env) => {
  // Declare explicit for use by the surrounding module or function.
  const explicit = String(environment.MPESA_SANDBOX_CALLBACK_URL || "").trim();
  // Check the condition (explicit) and run the matching branch.
  if (explicit) return explicit;
  // A single API service can receive both environments safely: the callback
  // handler resolves the pending payment first, then queries Daraja using that
  // attempt's tenant-scoped, persisted providerEnvironment. The production
  // callback URL is therefore the explicit shared-host reference by default.
  // Return the result of getProductionMpesaCallbackUrl() to the caller.
  return getProductionMpesaCallbackUrl(environment);
};

// Declare validateMpesaGatewaySettings for use by the surrounding module or function.
export const validateMpesaGatewaySettings = ({ environment, callbackUrl }, options = {}) => {
  // Check the condition (!["sandbox", "production"].includes(String(environment || "").toLowerC) and run the matching branch.
  if (!["sandbox", "production"].includes(String(environment || "").toLowerCase())) {
    // Return a configured text value to the caller.
    return "Environment must be sandbox or production.";
  }
  // Declare callback for use by the surrounding module or function.
  const callback = parseHttpsUrl(callbackUrl);
  // Check the condition (!callback) and run the matching branch.
  if (!callback) return `Callback URL must be a public HTTPS URL ending in ${CALLBACK_PATH}.`;
  // Check the condition (String(environment).toLowerCase() === "sandbox") and run the matching branch.
  if (String(environment).toLowerCase() === "sandbox") {
    // Declare sandboxCallbackUrl for use by the surrounding module or function.
    const sandboxCallbackUrl = options.sandboxCallbackUrl ?? options.productionCallbackUrl ?? getSandboxMpesaCallbackUrl(options.processEnv);
    // Declare sandboxCallback for use by the surrounding module or function.
    const sandboxCallback = parseHttpsUrl(sandboxCallbackUrl);
    // Check the condition (!sandboxCallback) and run the matching branch.
    if (!sandboxCallback) return "A valid Sandbox callback host must be configured before saving Sandbox settings.";
    // Check the condition (callback.origin.toLowerCase() !== sandboxCallback.origin.toLowerCase()) and run the matching branch.
    if (callback.origin.toLowerCase() !== sandboxCallback.origin.toLowerCase()) {
      // Return the expression shown below to the caller.
      return `Sandbox callback host must match the configured Sandbox host (${sandboxCallback.host}). Set MPESA_SANDBOX_CALLBACK_URL for a dedicated Sandbox API, or use the explicitly configured shared callback host.`;
    }
  }
  // Return the expression shown below to the caller.
  return null;
};

// Declare getEnvironmentMpesaSettings for use by the surrounding module or function.
export const getEnvironmentMpesaSettings = (config = {}, environment = config.environment || "sandbox") => {
  // Declare prefix for use by the surrounding module or function.
  const prefix = environment === "production" ? "production" : "sandbox";
  // Declare legacyApplies for use by the surrounding module or function.
  const legacyApplies = (config.environment || "sandbox") === prefix;
  // Return the object assembled below to the caller.
  return {
    environment: prefix,
    shortcode: config[`${prefix}Shortcode`] || (legacyApplies ? config.shortcode : "") || "",
    callbackUrl: config[`${prefix}CallbackUrl`] || (legacyApplies ? config.callbackUrl : "") || "",
    consumerKeyEncrypted: config[`${prefix}ConsumerKeyEncrypted`] || (legacyApplies ? config.consumerKeyEncrypted : "") || "",
    consumerSecretEncrypted: config[`${prefix}ConsumerSecretEncrypted`] || (legacyApplies ? config.consumerSecretEncrypted : "") || "",
    passkeyEncrypted: config[`${prefix}PasskeyEncrypted`] || (legacyApplies ? config.passkeyEncrypted : "") || "",
  };
};

// Declare safeMpesaGatewayView for use by the surrounding module or function.
export const safeMpesaGatewayView = (config = {}, environment = config.environment || "sandbox") => {
  // Declare envConfig for use by the surrounding module or function.
  const envConfig = getEnvironmentMpesaSettings(config, environment);
  // Return the expression shown below to the caller.
  return ({
  id: config._id || config.id || null,
  provider: "MPESA",
  environment,
  enabled: config.enabled === true,
  accountName: config.accountName || "",
  shortcode: envConfig.shortcode,
  callbackUrl: envConfig.callbackUrl,
  configured: Boolean(envConfig.consumerKeyEncrypted && envConfig.consumerSecretEncrypted && envConfig.passkeyEncrypted && envConfig.shortcode && envConfig.callbackUrl),
  secretsConfigured: {
    consumerKey: Boolean(envConfig.consumerKeyEncrypted),
    consumerSecret: Boolean(envConfig.consumerSecretEncrypted),
    passkey: Boolean(envConfig.passkeyEncrypted),
  },
  validation: config.validation || null,
});
};
