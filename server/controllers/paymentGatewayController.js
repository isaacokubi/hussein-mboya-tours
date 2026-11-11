/**
 * Purpose: payment Gateway Controller HTTP controller. Main declarations: listGatewayConfigs, upsertGatewayConfig, getGatewayConfig, disableGatewayConfig, validateMpesaGateway.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import PaymentGatewayConfig, { encryptSecret } from "../models/PaymentGatewayConfig.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { requireTenantId } from "../tenancy/context.js";
// Load ../services/mpesaGatewaySettings.js so this module can use its exported dependencies.
import { getEnvironmentMpesaSettings, validateMpesaGatewaySettings } from "../services/mpesaGatewaySettings.js";
// Load ../config/mpesa.js so this module can use its exported dependencies.
import { getMpesaUrls } from "../config/mpesa.js";
// Load ../models/PaymentGatewayConfig.js so this module can use its exported dependencies.
import { decryptSecret } from "../models/PaymentGatewayConfig.js";
// Load axios so this module can use its exported dependencies.
import axios from "axios";
// Load ../services/paypalService.js so this module can use its exported dependencies.
import { getPaypalEnvironmentSettings, getPaypalAccessToken } from "../services/paypalService.js";
// Load ../services/settingsService.js so this module can use its exported dependencies.
import { getSystemSettings } from "../services/settingsService.js";
// Load ../services/tenantPaymentMethods.js so this module can use its exported dependencies.
import { isPaypalCurrencySupported, isStripeRuntimeEnvironmentValid } from "../services/tenantPaymentMethods.js";

// Declare SECRET_FIELDS for use by the surrounding module or function.
const SECRET_FIELDS = [
  "consumerKey", "consumerSecret", "passkey", "secretKey", "webhookSecret",
  "initiatorName", "securityCredential",
];
// Declare ALLOWED_PROVIDERS for use by the surrounding module or function.
const ALLOWED_PROVIDERS = ["MPESA", "STRIPE", "PAYPAL", "PESAPAL", "BANK"];

// Declare listGatewayConfigs for use by the surrounding module or function.
export const listGatewayConfigs = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    requireTenantId();
    // Declare configs for use by the surrounding module or function.
    const configs = await PaymentGatewayConfig.find({})
      .select("-consumerKeyEncrypted -consumerSecretEncrypted -passkeyEncrypted -sandboxConsumerKeyEncrypted -sandboxConsumerSecretEncrypted -sandboxPasskeyEncrypted -productionConsumerKeyEncrypted -productionConsumerSecretEncrypted -productionPasskeyEncrypted -secretKeyEncrypted -webhookSecretEncrypted -initiatorNameEncrypted -securityCredentialEncrypted -sandboxPaypalClientIdEncrypted -sandboxPaypalClientSecretEncrypted -productionPaypalClientIdEncrypted -productionPaypalClientSecretEncrypted")
      .sort({ provider: 1 }).lean();
    // Return the result of res.json() to the caller.
    return res.json({ success: true, data: configs.map((c) => ({
      ...c,
      configured: c.provider === "MPESA"
        ? (() => { const env = getEnvironmentMpesaSettings(c); return Boolean(env.consumerKeyEncrypted && env.consumerSecretEncrypted && env.passkeyEncrypted && env.shortcode && env.callbackUrl); })()
        : c.provider === "PAYPAL"
          ? getPaypalEnvironmentSettings(c).configured
          : c.provider === "STRIPE" ? Boolean(process.env.STRIPE_WEBHOOK_SECRET && isStripeRuntimeEnvironmentValid(process.env)) : Boolean(c.enabled),
      secretsConfigured: c.provider === "PAYPAL"
        ? (() => { const env = getPaypalEnvironmentSettings(c); return { clientId: Boolean(env.clientId), clientSecret: Boolean(env.clientSecret), webhookId: Boolean(env.webhookId) }; })()
        : undefined,
    })) });
  } catch (error) { next(error); }
};

// Declare upsertGatewayConfig for use by the surrounding module or function.
export const upsertGatewayConfig = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = requireTenantId();
    // Declare provider for use by the surrounding module or function.
    const provider = String(req.params.provider || "").toUpperCase();
    // Check the condition (!ALLOWED_PROVIDERS.includes(provider)) and run the matching branch.
    if (!ALLOWED_PROVIDERS.includes(provider)) return res.status(400).json({ success: false, message: "Unsupported payment provider." });

    // Declare body for use by the surrounding module or function.
    const body = req.body || {};
    // Check the condition (["MPESA", "PAYPAL"].includes(provider) && !["sandbox", "production"].i) and run the matching branch.
    if (["MPESA", "PAYPAL"].includes(provider) && !["sandbox", "production"].includes(String(body.environment || "sandbox").toLowerCase())) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({ success: false, message: "Environment must be sandbox or production." });
    }
    // Declare existing for use by the surrounding module or function.
    const existing = ["MPESA", "PAYPAL"].includes(provider) ? await PaymentGatewayConfig.findOne({ tenantId, provider }).lean() : null;
    // Declare environment for use by the surrounding module or function.
    const environment = String(body.environment || existing?.environment || "sandbox").toLowerCase();
    // Declare envExisting for use by the surrounding module or function.
    const envExisting = provider === "MPESA" ? getEnvironmentMpesaSettings(existing || {}, environment) : {};
    // Declare update for use by the surrounding module or function.
    const update = {
      provider,
      environment,
      enabled: body.enabled === true || body.enabled === "true",
      accountName: String(body.accountName || "").trim(),
      shortcode: String(body.shortcode ?? envExisting.shortcode ?? "").trim(),
      publicKey: String(body.publicKey || "").trim(),
      merchantId: String(body.merchantId || "").trim(),
      callbackUrl: body.callbackUrl === undefined ? (envExisting.callbackUrl || "") : String(body.callbackUrl || "").trim(),
      updatedBy: req.user?._id || null,
    };

    // Check the condition (provider === "MPESA" && update.enabled) and run the matching branch.
    if (provider === "MPESA" && update.enabled) {
      // Declare hasExistingCredentials for use by the surrounding module or function.
      const hasExistingCredentials = Boolean(
        envExisting.consumerKeyEncrypted && envExisting.consumerSecretEncrypted &&
        envExisting.passkeyEncrypted && envExisting.shortcode && envExisting.callbackUrl
      );
      // Declare hasSubmittedCredentials for use by the surrounding module or function.
      const hasSubmittedCredentials = Boolean(
        body.consumerKey && body.consumerSecret && body.passkey && update.shortcode && update.callbackUrl
      );
      // Check the condition (!hasExistingCredentials && !hasSubmittedCredentials) and run the matching branch.
      if (!hasExistingCredentials && !hasSubmittedCredentials) {
        // Return the result of res.status(400).json() to the caller.
        return res.status(400).json({
          success: false,
          message: "To enable M-Pesa, provide Consumer Key, Consumer Secret, Passkey, Shortcode and a public HTTPS Callback URL.",
        });
      }
    }

    // Check the condition (provider === "MPESA" && (update.enabled || update.callbackUrl)) and run the matching branch.
    if (provider === "MPESA" && (update.enabled || update.callbackUrl)) {
      // Declare validationError for use by the surrounding module or function.
      const validationError = validateMpesaGatewaySettings({ environment: update.environment, callbackUrl: update.callbackUrl });
      // Check the condition (validationError) and run the matching branch.
      if (validationError) return res.status(400).json({ success: false, message: validationError });
    }

    // Repeat the enclosed work for each required iteration.
    for (const field of SECRET_FIELDS) {
      // Check the condition (provider === "PAYPAL") and run the matching branch.
      if (provider === "PAYPAL") continue;
      // Check the condition (body[field] !== undefined && body[field] !== "") and run the matching branch.
      if (body[field] !== undefined && body[field] !== "") {
        // Perform the side effect or state update expressed on the following line.
        update[provider === "MPESA" ? `${environment}${field[0].toUpperCase()}${field.slice(1)}Encrypted` : `${field}Encrypted`] = encryptSecret(body[field]);
      }
    }
    // Check the condition (provider === "MPESA") and run the matching branch.
    if (provider === "MPESA") {
      // Perform the side effect or state update expressed on the following line.
      update[`${environment}Shortcode`] = update.shortcode;
      // Perform the side effect or state update expressed on the following line.
      update[`${environment}CallbackUrl`] = update.callbackUrl;
      // Perform the side effect or state update expressed on the following line.
      delete update.shortcode;
      // Perform the side effect or state update expressed on the following line.
      delete update.callbackUrl;
    }

    // Check the condition (provider === "PAYPAL") and run the matching branch.
    if (provider === "PAYPAL") {
      // Declare prefix for use by the surrounding module or function.
      const prefix = environment === "sandbox" ? "sandbox" : "production";
      // Declare oldPaypal for use by the surrounding module or function.
      const oldPaypal = getPaypalEnvironmentSettings(existing || {}, environment);
      // Declare clientIdProvided for use by the surrounding module or function.
      const clientIdProvided = typeof body.clientId === "string" && body.clientId.trim() !== "";
      // Declare clientSecretProvided for use by the surrounding module or function.
      const clientSecretProvided = typeof body.clientSecret === "string" && body.clientSecret !== "";
      // Declare clientId for use by the surrounding module or function.
      const clientId = clientIdProvided ? body.clientId.trim() : oldPaypal.clientId;
      // Declare clientSecret for use by the surrounding module or function.
      const clientSecret = clientSecretProvided ? body.clientSecret : oldPaypal.clientSecret;
      // Declare webhookId for use by the surrounding module or function.
      const webhookId = body.webhookId === undefined ? oldPaypal.webhookId : String(body.webhookId || "").trim();
      // Declare merchantId for use by the surrounding module or function.
      const merchantId = body.merchantId === undefined ? oldPaypal.merchantId : String(body.merchantId || "").trim();
      // Check the condition (body.clientId !== undefined && typeof body.clientId !== "string" || bo) and run the matching branch.
      if (body.clientId !== undefined && typeof body.clientId !== "string" || body.clientSecret !== undefined && typeof body.clientSecret !== "string") return res.status(400).json({ success: false, message: "PayPal credentials must be text values." });
      // Check the condition (body.webhookId !== undefined && typeof body.webhookId !== "string") and run the matching branch.
      if (body.webhookId !== undefined && typeof body.webhookId !== "string") return res.status(400).json({ success: false, message: "PayPal webhook ID must be a text value." });
      // Check the condition (body.merchantId !== undefined && typeof body.merchantId !== "string") and run the matching branch.
      if (body.merchantId !== undefined && typeof body.merchantId !== "string") return res.status(400).json({ success: false, message: "PayPal merchant ID must be a text value." });
      // Check the condition (update.enabled && (!clientId || !clientSecret || !webhookId)) and run the matching branch.
      if (update.enabled && (!clientId || !clientSecret || !webhookId)) return res.status(400).json({ success: false, message: "To enable PayPal, configure the selected environment's Client ID, Client Secret and Webhook ID, then validate the credentials." });
      // Declare credentialsChanged for use by the surrounding module or function.
      const credentialsChanged = clientIdProvided || clientSecretProvided || body.webhookId !== undefined && webhookId !== oldPaypal.webhookId || body.merchantId !== undefined && merchantId !== oldPaypal.merchantId;
      // Check the condition (update.enabled && credentialsChanged) and run the matching branch.
      if (update.enabled && credentialsChanged) return res.status(409).json({ success: false, message: "Save PayPal credentials with the gateway disabled, validate OAuth connectivity, then enable the gateway." });
      // Check the condition (clientIdProvided) and run the matching branch.
      if (clientIdProvided) update[`${prefix}PaypalClientIdEncrypted`] = encryptSecret(clientId);
      // Check the condition (clientSecretProvided) and run the matching branch.
      if (clientSecretProvided) update[`${prefix}PaypalClientSecretEncrypted`] = encryptSecret(clientSecret);
      // Perform the side effect or state update expressed on the following line.
      update[`${prefix}PaypalWebhookId`] = webhookId;
      // Perform the side effect or state update expressed on the following line.
      update[`${prefix}PaypalMerchantId`] = merchantId;
      // Perform the side effect or state update expressed on the following line.
      delete update.merchantId;
      // Check the condition (credentialsChanged) and run the matching branch.
      if (credentialsChanged) {
        // Perform the side effect or state update expressed on the following line.
        update[`${prefix}PaypalValidatedAt`] = null;
        // Check the condition (environment === "sandbox") and run the matching branch.
        if (environment === "sandbox") update.sandboxLifecycleVerifiedAt = null;
      }
    }

    // Declare config for use by the surrounding module or function.
    const config = await PaymentGatewayConfig.findOneAndUpdate(
      { tenantId, provider },
      { $set: update },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    // Declare configuredSettings for use by the surrounding module or function.
    const configuredSettings = provider === "MPESA" ? getEnvironmentMpesaSettings(config, environment) : {};
    // Declare paypalSettings for use by the surrounding module or function.
    const paypalSettings = provider === "PAYPAL" ? getPaypalEnvironmentSettings(config, environment) : {};
    // Declare configured for use by the surrounding module or function.
    const configured = provider === "MPESA"
      ? Boolean(configuredSettings.consumerKeyEncrypted && configuredSettings.consumerSecretEncrypted && configuredSettings.passkeyEncrypted && configuredSettings.shortcode && configuredSettings.callbackUrl)
      : provider === "PAYPAL" ? Boolean(paypalSettings.configured && paypalSettings.validatedAt) : provider === "STRIPE" ? Boolean(process.env.STRIPE_WEBHOOK_SECRET && isStripeRuntimeEnvironmentValid(process.env)) : true;

    // Return the result of res.json() to the caller.
    return res.json({ success: true, message: `${provider} configuration saved securely${config.enabled ? " and enabled" : ""}.`, data: {
      id: config._id, provider: config.provider, environment: config.environment, enabled: config.enabled,
      accountName: config.accountName, shortcode: provider === "MPESA" ? configuredSettings.shortcode : config.shortcode, publicKey: config.publicKey, merchantId: config.merchantId,
      callbackUrl: provider === "MPESA" ? configuredSettings.callbackUrl : config.callbackUrl, configured,
      ...(provider === "PAYPAL" ? { webhookId: paypalSettings.webhookId, merchantId: paypalSettings.merchantId, secretsConfigured: { clientId: Boolean(paypalSettings.clientId), clientSecret: Boolean(paypalSettings.clientSecret) }, validatedAt: paypalSettings.validatedAt || null, sandboxLifecycleVerifiedAt: config.sandboxLifecycleVerifiedAt || null } : {}),
    } });
  } catch (error) { next(error); }
};

// Declare getGatewayConfig for use by the surrounding module or function.
export const getGatewayConfig = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = requireTenantId();
    // Declare provider for use by the surrounding module or function.
    const provider = String(req.params.provider || "").toUpperCase();
    // Check the condition (!ALLOWED_PROVIDERS.includes(provider)) and run the matching branch.
    if (!ALLOWED_PROVIDERS.includes(provider)) return res.status(400).json({ success: false, message: "Unsupported payment provider." });
    // Declare config for use by the surrounding module or function.
    const config = await PaymentGatewayConfig.findOne({ tenantId, provider }).lean();
    // Check the condition (!config) and run the matching branch.
    if (!config) return res.json({ success: true, data: { provider, configured: false, enabled: false } });
    // Declare requestedEnvironment for use by the surrounding module or function.
    const requestedEnvironment = String(req.query?.environment || "").toLowerCase();
    // Check the condition (provider === "MPESA" && requestedEnvironment && !["sandbox", "producti) and run the matching branch.
    if (provider === "MPESA" && requestedEnvironment && !["sandbox", "production"].includes(requestedEnvironment)) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({ success: false, message: "Environment must be sandbox or production." });
    }
    // Check the condition (provider === "PAYPAL" && requestedEnvironment && !["sandbox", "product) and run the matching branch.
    if (provider === "PAYPAL" && requestedEnvironment && !["sandbox", "production"].includes(requestedEnvironment)) return res.status(400).json({ success: false, message: "Environment must be sandbox or production." });
    // Declare environment for use by the surrounding module or function.
    const environment = ["MPESA", "PAYPAL"].includes(provider) ? requestedEnvironment || config.environment || "sandbox" : config.environment;
    // Declare environmentSettings for use by the surrounding module or function.
    const environmentSettings = provider === "MPESA" ? getEnvironmentMpesaSettings(config, environment) : {};
    // Declare paypalSettings for use by the surrounding module or function.
    const paypalSettings = provider === "PAYPAL" ? getPaypalEnvironmentSettings(config, environment) : {};
    // Declare tenantSettings for use by the surrounding module or function.
    const tenantSettings = provider === "PAYPAL" ? await getSystemSettings(req) : null;
    // Declare paypalCheckoutAvailable for use by the surrounding module or function.
    const paypalCheckoutAvailable = provider === "PAYPAL" && Boolean(config.enabled && config.environment === environment && paypalSettings.configured && paypalSettings.validatedAt && isPaypalCurrencySupported(tenantSettings?.currency) && (environment !== "production" || config.sandboxLifecycleVerifiedAt));
    // Return the result of res.json() to the caller.
    return res.json({ success: true, data: {
      id: config._id, provider: config.provider, environment, activeEnvironment: config.environment || "sandbox", enabled: ["MPESA", "PAYPAL"].includes(provider) ? Boolean(config.enabled && config.environment === environment) : config.enabled,
      accountName: config.accountName, shortcode: provider === "MPESA" ? environmentSettings.shortcode : config.shortcode, publicKey: config.publicKey, merchantId: config.merchantId,
      callbackUrl: provider === "MPESA" ? environmentSettings.callbackUrl : config.callbackUrl,
      configured: provider === "MPESA"
        ? Boolean(environmentSettings.consumerKeyEncrypted && environmentSettings.consumerSecretEncrypted && environmentSettings.passkeyEncrypted && environmentSettings.shortcode && environmentSettings.callbackUrl)
        : provider === "PAYPAL" ? Boolean(paypalSettings.configured && paypalSettings.validatedAt)
          : provider === "STRIPE" ? Boolean(process.env.STRIPE_WEBHOOK_SECRET && isStripeRuntimeEnvironmentValid(process.env)) : Boolean(config.enabled),
      secretsConfigured: provider === "PAYPAL"
        ? { clientId: Boolean(paypalSettings.clientId), clientSecret: Boolean(paypalSettings.clientSecret), webhookId: Boolean(paypalSettings.webhookId) }
        : SECRET_FIELDS.reduce((out, field) => { out[field] = Boolean(provider === "MPESA" ? environmentSettings[`${field}Encrypted`] : config[`${field}Encrypted`]); return out; }, {}),
      ...(provider === "PAYPAL" ? { webhookId: paypalSettings.webhookId, merchantId: paypalSettings.merchantId, validatedAt: paypalSettings.validatedAt || null, sandboxLifecycleVerifiedAt: config.sandboxLifecycleVerifiedAt || null } : {}),
      ...(provider === "PAYPAL" ? { checkoutAvailable: paypalCheckoutAvailable, tenantCurrency: tenantSettings?.currency || "" } : {}),
    } });
  } catch (error) { next(error); }
};

// Declare disableGatewayConfig for use by the surrounding module or function.
export const disableGatewayConfig = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = requireTenantId();
    // Declare provider for use by the surrounding module or function.
    const provider = String(req.params.provider || "").toUpperCase();
    // Check the condition (!ALLOWED_PROVIDERS.includes(provider)) and run the matching branch.
    if (!ALLOWED_PROVIDERS.includes(provider)) return res.status(400).json({ success: false, message: "Unsupported payment provider." });
    // Declare config for use by the surrounding module or function.
    const config = await PaymentGatewayConfig.findOneAndUpdate(
      { tenantId, provider },
      { $set: { enabled: false, updatedBy: req.user?._id || null } },
      { new: true }
    ).lean();
    // Check the condition (!config) and run the matching branch.
    if (!config) return res.status(404).json({ success: false, message: "Payment gateway configuration not found." });
    // Return the result of res.json() to the caller.
    return res.json({ success: true, message: `${provider} has been disabled.` });
  } catch (error) { next(error); }
};

// Declare validateMpesaGateway for use by the surrounding module or function.
export const validateMpesaGateway = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = requireTenantId();
    // Declare environment for use by the surrounding module or function.
    const environment = String(req.body?.environment || "").toLowerCase();
    // Declare config for use by the surrounding module or function.
    const config = await PaymentGatewayConfig.findOne({ tenantId, provider: "MPESA" }).lean();
    // Declare selected for use by the surrounding module or function.
    const selected = getEnvironmentMpesaSettings(config || {}, environment);
    // Declare timestamp for use by the surrounding module or function.
    const timestamp = new Date().toISOString();
    // Declare result for use by the surrounding module or function.
    const result = (status, message, remoteVerified = false) => res.json({ success: true, data: { status, environment, timestamp, remoteVerified, message } });
    // Check the condition (!config || !["sandbox", "production"].includes(environment)) and run the matching branch.
    if (!config || !["sandbox", "production"].includes(environment)) return result("invalid", "Select sandbox or production and save its settings first.");
    // Declare callbackError for use by the surrounding module or function.
    const callbackError = validateMpesaGatewaySettings({ environment, callbackUrl: selected.callbackUrl });
    // Check the condition (!selected.shortcode || !selected.consumerKeyEncrypted || !selected.con) and run the matching branch.
    if (!selected.shortcode || !selected.consumerKeyEncrypted || !selected.consumerSecretEncrypted || !selected.passkeyEncrypted || callbackError) return result("incomplete", callbackError || "Shortcode and all three credentials are required.");
    // Declare key for use by the surrounding module or function.
    let key; let secret;
    // Run this operation with a dedicated error-handling path for failures.
    try { key = decryptSecret(selected.consumerKeyEncrypted); secret = decryptSecret(selected.consumerSecretEncrypted); decryptSecret(selected.passkeyEncrypted); }
    // Handle the error raised by the preceding protected operation.
    catch { return result("invalid", "Saved credentials could not be decrypted. Re-enter them and save again."); }
    // Declare response for use by the surrounding module or function.
    const response = await axios.get(getMpesaUrls(environment).auth, { headers: { Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}` }, timeout: 8000, maxRedirects: 0 });
    // Return the expression shown below to the caller.
    return response.data?.access_token ? result("connected", "Daraja OAuth connectivity verified. No payment was initiated.", true) : result("provider_error", "Daraja did not return an access token.");
  } catch (error) {
    // Check the condition (error?.response?.status === 401 || error?.response?.status === 403) and run the matching branch.
    if (error?.response?.status === 401 || error?.response?.status === 403) return res.json({ success: true, data: { status: "invalid_credentials", environment: req.body?.environment, timestamp: new Date().toISOString(), remoteVerified: false, message: "Daraja rejected these credentials for the selected environment." } });
    // Check the condition (["ECONNABORTED", "ETIMEDOUT"].includes(error?.code)) and run the matching branch.
    if (["ECONNABORTED", "ETIMEDOUT"].includes(error?.code)) return res.json({ success: true, data: { status: "unverified", environment: req.body?.environment, timestamp: new Date().toISOString(), remoteVerified: false, message: "Daraja validation timed out. Connectivity remains unverified." } });
    // Check the condition (error?.response) and run the matching branch.
    if (error?.response) return res.json({ success: true, data: { status: "provider_error", environment: req.body?.environment, timestamp: new Date().toISOString(), remoteVerified: false, message: `Daraja returned HTTP ${Number(error.response.status) || 0}.` } });
    // Return the result of next() to the caller.
    return next(error);
  }
};

// Declare validateStripeGateway for use by the surrounding module or function.
export const validateStripeGateway = async (req, res, next) => {
  // Declare timestamp for use by the surrounding module or function.
  const timestamp = new Date().toISOString();
  // Declare result for use by the surrounding module or function.
  const result = (status, message, remoteVerified = false) => res.json({ success: true, data: { status, environment: "platform-managed", timestamp, remoteVerified, webhookConfigured: Boolean(process.env.STRIPE_WEBHOOK_SECRET), message } });
  // Declare apiKey for use by the surrounding module or function.
  const apiKey = String(process.env.STRIPE_SECRET_KEY || "").trim();
  // Check the condition (!apiKey) and run the matching branch.
  if (!apiKey) return result("incomplete", "Stripe deployment credentials are not configured.");
  // Check the condition (!process.env.STRIPE_WEBHOOK_SECRET) and run the matching branch.
  if (!process.env.STRIPE_WEBHOOK_SECRET) return result("incomplete", "Stripe webhook verification is not configured. Card checkout remains disabled.");
  // Check the condition (!isStripeRuntimeEnvironmentValid(process.env)) and run the matching branch.
  if (!isStripeRuntimeEnvironmentValid(process.env)) return result("environment_mismatch", "Stripe test and live credentials do not match this server environment.");
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare response for use by the surrounding module or function.
    const response = await axios.get("https://api.stripe.com/v1/account", { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 8000, maxRedirects: 0 });
    // Return the expression shown below to the caller.
    return response.data?.id ? result("connected", "Stripe API connectivity verified. No payment was initiated.", true) : result("provider_error", "Stripe did not return account metadata.");
  } catch (error) {
    // Check the condition (error?.response?.status === 401 || error?.response?.status === 403) and run the matching branch.
    if (error?.response?.status === 401 || error?.response?.status === 403) return result("invalid_credentials", "Stripe rejected the deployment credentials.");
    // Check the condition (["ECONNABORTED", "ETIMEDOUT"].includes(error?.code)) and run the matching branch.
    if (["ECONNABORTED", "ETIMEDOUT"].includes(error?.code)) return result("unverified", "Stripe validation timed out. Connectivity remains unverified.");
    // Check the condition (error?.response) and run the matching branch.
    if (error?.response) return result("provider_error", `Stripe returned HTTP ${Number(error.response.status) || 0}.`);
    // Return the result of result() to the caller.
    return result("unverified", "Stripe could not be reached. Connectivity remains unverified.");
  }
};

// Declare validatePaypalGateway for use by the surrounding module or function.
export const validatePaypalGateway = async (req, res) => {
  // Declare environment for use by the surrounding module or function.
  const environment = String(req.body?.environment || "").toLowerCase();
  // Declare timestamp for use by the surrounding module or function.
  const timestamp = new Date().toISOString();
  // Declare result for use by the surrounding module or function.
  const result = (status, message, remoteVerified = false) => res.json({ success: true, data: { status, environment, timestamp, remoteVerified, message } });
  // Check the condition (!["sandbox", "production"].includes(environment)) and run the matching branch.
  if (!["sandbox", "production"].includes(environment)) return result("invalid", "Select sandbox or production and save its settings first.");
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = requireTenantId();
    // Declare config for use by the surrounding module or function.
    const config = await PaymentGatewayConfig.findOne({ tenantId, provider: "PAYPAL" });
    // Declare selected for use by the surrounding module or function.
    const selected = getPaypalEnvironmentSettings(config || {}, environment);
    // Check the condition (!selected.configured) and run the matching branch.
    if (!selected.configured) return result(selected.decryptionFailed ? "invalid" : "incomplete", selected.decryptionFailed ? "Saved PayPal credentials could not be decrypted. Re-enter them and save again." : "PayPal Client ID, Client Secret and Webhook ID are required.");
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Perform the side effect or state update expressed on the following line.
      await getPaypalAccessToken({ environment, clientId: selected.clientId, clientSecret: selected.clientSecret });
    } catch (error) {
      // Check the condition (error?.status === 401 || error?.status === 403) and run the matching branch.
      if (error?.status === 401 || error?.status === 403) return result("invalid_credentials", "PayPal rejected the credentials for the selected environment.");
      // Check the condition (error?.name === "TimeoutError" || error?.name === "AbortError") and run the matching branch.
      if (error?.name === "TimeoutError" || error?.name === "AbortError") return result("unverified", "PayPal validation timed out. Connectivity remains unverified.");
      // Check the condition (error?.status) and run the matching branch.
      if (error?.status) return result("provider_error", `PayPal returned HTTP ${Number(error.status) || 0}.`);
      // Return the result of result() to the caller.
      return result("unverified", "PayPal could not be reached. Connectivity remains unverified.");
    }
    // Perform the side effect or state update expressed on the following line.
    config[`${environment === "sandbox" ? "sandbox" : "production"}PaypalValidatedAt`] = new Date();
    // Perform the side effect or state update expressed on the following line.
    await config.save();
    // Return the result of result() to the caller.
    return result("connected", "PayPal OAuth connectivity verified. No order or payment was created.", true);
  } catch {
    // Return the result of result() to the caller.
    return result("unverified", "PayPal validation could not be completed. Check the selected configuration and retry.");
  }
};
