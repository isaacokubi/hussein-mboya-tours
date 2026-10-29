import { isIP } from "node:net";

const CALLBACK_PATH = "/api/mpesa/callback";

const parseHttpsUrl = (value) => {
  let url;
  try { url = new URL(String(value || "").trim()); } catch { return null; }
  if (url.protocol !== "https:" || url.username || url.password || url.hash) return null;
  if (url.port && url.port !== "443") return null;
  if (url.search) return null;
  if (url.pathname.replace(/\/$/, "") !== CALLBACK_PATH) return null;
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".") || !host.includes(".")) return null;
  // Daraja callbacks must target a public DNS host. Reject literal IPs
  // outright so private, loopback, link-local, and ambiguous IP ranges cannot
  // be smuggled through textual range checks.
  if (isIP(host)) return null;
  return url;
};

export const getProductionMpesaCallbackUrl = (environment = process.env) => {
  const explicit = String(environment.MPESA_PRODUCTION_CALLBACK_URL || "").trim();
  if (explicit) return explicit;
  if (String(environment.DEPLOYMENT_ENV || "").trim().toLowerCase() === "staging") return "";
  const legacy = String(environment.MPESA_CALLBACK_URL || "").trim();
  if (legacy) return legacy;
  if (String(environment.NODE_ENV || "").toLowerCase() === "production" && environment.RENDER_EXTERNAL_URL) {
    try {
      const origin = new URL(environment.RENDER_EXTERNAL_URL).origin;
      return `${origin}${CALLBACK_PATH}`;
    } catch { return ""; }
  }
  return "";
};

export const getSandboxMpesaCallbackUrl = (environment = process.env) => {
  const explicit = String(environment.MPESA_SANDBOX_CALLBACK_URL || "").trim();
  if (explicit) return explicit;
  // A single API service can receive both environments safely: the callback
  // handler resolves the pending payment first, then queries Daraja using that
  // attempt's tenant-scoped, persisted providerEnvironment. The production
  // callback URL is therefore the explicit shared-host reference by default.
  return getProductionMpesaCallbackUrl(environment);
};

export const validateMpesaGatewaySettings = ({ environment, callbackUrl }, options = {}) => {
  if (!["sandbox", "production"].includes(String(environment || "").toLowerCase())) {
    return "Environment must be sandbox or production.";
  }
  const callback = parseHttpsUrl(callbackUrl);
  if (!callback) return `Callback URL must be a public HTTPS URL ending in ${CALLBACK_PATH}.`;
  if (String(environment).toLowerCase() === "sandbox") {
    const sandboxCallbackUrl = options.sandboxCallbackUrl ?? options.productionCallbackUrl ?? getSandboxMpesaCallbackUrl(options.processEnv);
    const sandboxCallback = parseHttpsUrl(sandboxCallbackUrl);
    if (!sandboxCallback) return "A valid Sandbox callback host must be configured before saving Sandbox settings.";
    if (callback.origin.toLowerCase() !== sandboxCallback.origin.toLowerCase()) {
      return `Sandbox callback host must match the configured Sandbox host (${sandboxCallback.host}). Set MPESA_SANDBOX_CALLBACK_URL for a dedicated Sandbox API, or use the explicitly configured shared callback host.`;
    }
  }
  return null;
};

export const getEnvironmentMpesaSettings = (config = {}, environment = config.environment || "sandbox") => {
  const prefix = environment === "production" ? "production" : "sandbox";
  const legacyApplies = (config.environment || "sandbox") === prefix;
  return {
    environment: prefix,
    shortcode: config[`${prefix}Shortcode`] || (legacyApplies ? config.shortcode : "") || "",
    callbackUrl: config[`${prefix}CallbackUrl`] || (legacyApplies ? config.callbackUrl : "") || "",
    consumerKeyEncrypted: config[`${prefix}ConsumerKeyEncrypted`] || (legacyApplies ? config.consumerKeyEncrypted : "") || "",
    consumerSecretEncrypted: config[`${prefix}ConsumerSecretEncrypted`] || (legacyApplies ? config.consumerSecretEncrypted : "") || "",
    passkeyEncrypted: config[`${prefix}PasskeyEncrypted`] || (legacyApplies ? config.passkeyEncrypted : "") || "",
  };
};

export const safeMpesaGatewayView = (config = {}, environment = config.environment || "sandbox") => {
  const envConfig = getEnvironmentMpesaSettings(config, environment);
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
