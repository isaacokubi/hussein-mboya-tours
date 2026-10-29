import PaymentGatewayConfig, { encryptSecret } from "../models/PaymentGatewayConfig.js";
import { requireTenantId } from "../tenancy/context.js";
import { getEnvironmentMpesaSettings, validateMpesaGatewaySettings } from "../services/mpesaGatewaySettings.js";
import { getMpesaUrls } from "../config/mpesa.js";
import { decryptSecret } from "../models/PaymentGatewayConfig.js";
import axios from "axios";
import { getPaypalEnvironmentSettings, getPaypalAccessToken } from "../services/paypalService.js";
import { getSystemSettings } from "../services/settingsService.js";
import { isPaypalCurrencySupported, isStripeRuntimeEnvironmentValid } from "../services/tenantPaymentMethods.js";

const SECRET_FIELDS = [
  "consumerKey", "consumerSecret", "passkey", "secretKey", "webhookSecret",
  "initiatorName", "securityCredential",
];
const ALLOWED_PROVIDERS = ["MPESA", "STRIPE", "PAYPAL", "PESAPAL", "BANK"];

export const listGatewayConfigs = async (req, res, next) => {
  try {
    requireTenantId();
    const configs = await PaymentGatewayConfig.find({})
      .select("-consumerKeyEncrypted -consumerSecretEncrypted -passkeyEncrypted -sandboxConsumerKeyEncrypted -sandboxConsumerSecretEncrypted -sandboxPasskeyEncrypted -productionConsumerKeyEncrypted -productionConsumerSecretEncrypted -productionPasskeyEncrypted -secretKeyEncrypted -webhookSecretEncrypted -initiatorNameEncrypted -securityCredentialEncrypted -sandboxPaypalClientIdEncrypted -sandboxPaypalClientSecretEncrypted -productionPaypalClientIdEncrypted -productionPaypalClientSecretEncrypted")
      .sort({ provider: 1 }).lean();
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

export const upsertGatewayConfig = async (req, res, next) => {
  try {
    const tenantId = requireTenantId();
    const provider = String(req.params.provider || "").toUpperCase();
    if (!ALLOWED_PROVIDERS.includes(provider)) return res.status(400).json({ success: false, message: "Unsupported payment provider." });

    const body = req.body || {};
    if (["MPESA", "PAYPAL"].includes(provider) && !["sandbox", "production"].includes(String(body.environment || "sandbox").toLowerCase())) {
      return res.status(400).json({ success: false, message: "Environment must be sandbox or production." });
    }
    const existing = ["MPESA", "PAYPAL"].includes(provider) ? await PaymentGatewayConfig.findOne({ tenantId, provider }).lean() : null;
    const environment = String(body.environment || existing?.environment || "sandbox").toLowerCase();
    const envExisting = provider === "MPESA" ? getEnvironmentMpesaSettings(existing || {}, environment) : {};
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

    if (provider === "MPESA" && update.enabled) {
      const hasExistingCredentials = Boolean(
        envExisting.consumerKeyEncrypted && envExisting.consumerSecretEncrypted &&
        envExisting.passkeyEncrypted && envExisting.shortcode && envExisting.callbackUrl
      );
      const hasSubmittedCredentials = Boolean(
        body.consumerKey && body.consumerSecret && body.passkey && update.shortcode && update.callbackUrl
      );
      if (!hasExistingCredentials && !hasSubmittedCredentials) {
        return res.status(400).json({
          success: false,
          message: "To enable M-Pesa, provide Consumer Key, Consumer Secret, Passkey, Shortcode and a public HTTPS Callback URL.",
        });
      }
    }

    if (provider === "MPESA" && (update.enabled || update.callbackUrl)) {
      const validationError = validateMpesaGatewaySettings({ environment: update.environment, callbackUrl: update.callbackUrl });
      if (validationError) return res.status(400).json({ success: false, message: validationError });
    }

    for (const field of SECRET_FIELDS) {
      if (provider === "PAYPAL") continue;
      if (body[field] !== undefined && body[field] !== "") {
        update[provider === "MPESA" ? `${environment}${field[0].toUpperCase()}${field.slice(1)}Encrypted` : `${field}Encrypted`] = encryptSecret(body[field]);
      }
    }
    if (provider === "MPESA") {
      update[`${environment}Shortcode`] = update.shortcode;
      update[`${environment}CallbackUrl`] = update.callbackUrl;
      delete update.shortcode;
      delete update.callbackUrl;
    }

    if (provider === "PAYPAL") {
      const prefix = environment === "sandbox" ? "sandbox" : "production";
      const oldPaypal = getPaypalEnvironmentSettings(existing || {}, environment);
      const clientIdProvided = typeof body.clientId === "string" && body.clientId.trim() !== "";
      const clientSecretProvided = typeof body.clientSecret === "string" && body.clientSecret !== "";
      const clientId = clientIdProvided ? body.clientId.trim() : oldPaypal.clientId;
      const clientSecret = clientSecretProvided ? body.clientSecret : oldPaypal.clientSecret;
      const webhookId = body.webhookId === undefined ? oldPaypal.webhookId : String(body.webhookId || "").trim();
      const merchantId = body.merchantId === undefined ? oldPaypal.merchantId : String(body.merchantId || "").trim();
      if (body.clientId !== undefined && typeof body.clientId !== "string" || body.clientSecret !== undefined && typeof body.clientSecret !== "string") return res.status(400).json({ success: false, message: "PayPal credentials must be text values." });
      if (body.webhookId !== undefined && typeof body.webhookId !== "string") return res.status(400).json({ success: false, message: "PayPal webhook ID must be a text value." });
      if (body.merchantId !== undefined && typeof body.merchantId !== "string") return res.status(400).json({ success: false, message: "PayPal merchant ID must be a text value." });
      if (update.enabled && (!clientId || !clientSecret || !webhookId)) return res.status(400).json({ success: false, message: "To enable PayPal, configure the selected environment's Client ID, Client Secret and Webhook ID, then validate the credentials." });
      const credentialsChanged = clientIdProvided || clientSecretProvided || body.webhookId !== undefined && webhookId !== oldPaypal.webhookId || body.merchantId !== undefined && merchantId !== oldPaypal.merchantId;
      if (update.enabled && credentialsChanged) return res.status(409).json({ success: false, message: "Save PayPal credentials with the gateway disabled, validate OAuth connectivity, then enable the gateway." });
      if (clientIdProvided) update[`${prefix}PaypalClientIdEncrypted`] = encryptSecret(clientId);
      if (clientSecretProvided) update[`${prefix}PaypalClientSecretEncrypted`] = encryptSecret(clientSecret);
      update[`${prefix}PaypalWebhookId`] = webhookId;
      update[`${prefix}PaypalMerchantId`] = merchantId;
      delete update.merchantId;
      if (credentialsChanged) {
        update[`${prefix}PaypalValidatedAt`] = null;
        if (environment === "sandbox") update.sandboxLifecycleVerifiedAt = null;
      }
    }

    const config = await PaymentGatewayConfig.findOneAndUpdate(
      { tenantId, provider },
      { $set: update },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    const configuredSettings = provider === "MPESA" ? getEnvironmentMpesaSettings(config, environment) : {};
    const paypalSettings = provider === "PAYPAL" ? getPaypalEnvironmentSettings(config, environment) : {};
    const configured = provider === "MPESA"
      ? Boolean(configuredSettings.consumerKeyEncrypted && configuredSettings.consumerSecretEncrypted && configuredSettings.passkeyEncrypted && configuredSettings.shortcode && configuredSettings.callbackUrl)
      : provider === "PAYPAL" ? Boolean(paypalSettings.configured && paypalSettings.validatedAt) : provider === "STRIPE" ? Boolean(process.env.STRIPE_WEBHOOK_SECRET && isStripeRuntimeEnvironmentValid(process.env)) : true;

    return res.json({ success: true, message: `${provider} configuration saved securely${config.enabled ? " and enabled" : ""}.`, data: {
      id: config._id, provider: config.provider, environment: config.environment, enabled: config.enabled,
      accountName: config.accountName, shortcode: provider === "MPESA" ? configuredSettings.shortcode : config.shortcode, publicKey: config.publicKey, merchantId: config.merchantId,
      callbackUrl: provider === "MPESA" ? configuredSettings.callbackUrl : config.callbackUrl, configured,
      ...(provider === "PAYPAL" ? { webhookId: paypalSettings.webhookId, merchantId: paypalSettings.merchantId, secretsConfigured: { clientId: Boolean(paypalSettings.clientId), clientSecret: Boolean(paypalSettings.clientSecret) }, validatedAt: paypalSettings.validatedAt || null, sandboxLifecycleVerifiedAt: config.sandboxLifecycleVerifiedAt || null } : {}),
    } });
  } catch (error) { next(error); }
};

export const getGatewayConfig = async (req, res, next) => {
  try {
    const tenantId = requireTenantId();
    const provider = String(req.params.provider || "").toUpperCase();
    if (!ALLOWED_PROVIDERS.includes(provider)) return res.status(400).json({ success: false, message: "Unsupported payment provider." });
    const config = await PaymentGatewayConfig.findOne({ tenantId, provider }).lean();
    if (!config) return res.json({ success: true, data: { provider, configured: false, enabled: false } });
    const requestedEnvironment = String(req.query?.environment || "").toLowerCase();
    if (provider === "MPESA" && requestedEnvironment && !["sandbox", "production"].includes(requestedEnvironment)) {
      return res.status(400).json({ success: false, message: "Environment must be sandbox or production." });
    }
    if (provider === "PAYPAL" && requestedEnvironment && !["sandbox", "production"].includes(requestedEnvironment)) return res.status(400).json({ success: false, message: "Environment must be sandbox or production." });
    const environment = ["MPESA", "PAYPAL"].includes(provider) ? requestedEnvironment || config.environment || "sandbox" : config.environment;
    const environmentSettings = provider === "MPESA" ? getEnvironmentMpesaSettings(config, environment) : {};
    const paypalSettings = provider === "PAYPAL" ? getPaypalEnvironmentSettings(config, environment) : {};
    const tenantSettings = provider === "PAYPAL" ? await getSystemSettings(req) : null;
    const paypalCheckoutAvailable = provider === "PAYPAL" && Boolean(config.enabled && config.environment === environment && paypalSettings.configured && paypalSettings.validatedAt && isPaypalCurrencySupported(tenantSettings?.currency) && (environment !== "production" || config.sandboxLifecycleVerifiedAt));
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

export const disableGatewayConfig = async (req, res, next) => {
  try {
    const tenantId = requireTenantId();
    const provider = String(req.params.provider || "").toUpperCase();
    if (!ALLOWED_PROVIDERS.includes(provider)) return res.status(400).json({ success: false, message: "Unsupported payment provider." });
    const config = await PaymentGatewayConfig.findOneAndUpdate(
      { tenantId, provider },
      { $set: { enabled: false, updatedBy: req.user?._id || null } },
      { new: true }
    ).lean();
    if (!config) return res.status(404).json({ success: false, message: "Payment gateway configuration not found." });
    return res.json({ success: true, message: `${provider} has been disabled.` });
  } catch (error) { next(error); }
};

export const validateMpesaGateway = async (req, res, next) => {
  try {
    const tenantId = requireTenantId();
    const environment = String(req.body?.environment || "").toLowerCase();
    const config = await PaymentGatewayConfig.findOne({ tenantId, provider: "MPESA" }).lean();
    const selected = getEnvironmentMpesaSettings(config || {}, environment);
    const timestamp = new Date().toISOString();
    const result = (status, message, remoteVerified = false) => res.json({ success: true, data: { status, environment, timestamp, remoteVerified, message } });
    if (!config || !["sandbox", "production"].includes(environment)) return result("invalid", "Select sandbox or production and save its settings first.");
    const callbackError = validateMpesaGatewaySettings({ environment, callbackUrl: selected.callbackUrl });
    if (!selected.shortcode || !selected.consumerKeyEncrypted || !selected.consumerSecretEncrypted || !selected.passkeyEncrypted || callbackError) return result("incomplete", callbackError || "Shortcode and all three credentials are required.");
    let key; let secret;
    try { key = decryptSecret(selected.consumerKeyEncrypted); secret = decryptSecret(selected.consumerSecretEncrypted); decryptSecret(selected.passkeyEncrypted); }
    catch { return result("invalid", "Saved credentials could not be decrypted. Re-enter them and save again."); }
    const response = await axios.get(getMpesaUrls(environment).auth, { headers: { Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}` }, timeout: 8000, maxRedirects: 0 });
    return response.data?.access_token ? result("connected", "Daraja OAuth connectivity verified. No payment was initiated.", true) : result("provider_error", "Daraja did not return an access token.");
  } catch (error) {
    if (error?.response?.status === 401 || error?.response?.status === 403) return res.json({ success: true, data: { status: "invalid_credentials", environment: req.body?.environment, timestamp: new Date().toISOString(), remoteVerified: false, message: "Daraja rejected these credentials for the selected environment." } });
    if (["ECONNABORTED", "ETIMEDOUT"].includes(error?.code)) return res.json({ success: true, data: { status: "unverified", environment: req.body?.environment, timestamp: new Date().toISOString(), remoteVerified: false, message: "Daraja validation timed out. Connectivity remains unverified." } });
    if (error?.response) return res.json({ success: true, data: { status: "provider_error", environment: req.body?.environment, timestamp: new Date().toISOString(), remoteVerified: false, message: `Daraja returned HTTP ${Number(error.response.status) || 0}.` } });
    return next(error);
  }
};

export const validateStripeGateway = async (req, res, next) => {
  const timestamp = new Date().toISOString();
  const result = (status, message, remoteVerified = false) => res.json({ success: true, data: { status, environment: "platform-managed", timestamp, remoteVerified, webhookConfigured: Boolean(process.env.STRIPE_WEBHOOK_SECRET), message } });
  const apiKey = String(process.env.STRIPE_SECRET_KEY || "").trim();
  if (!apiKey) return result("incomplete", "Stripe deployment credentials are not configured.");
  if (!process.env.STRIPE_WEBHOOK_SECRET) return result("incomplete", "Stripe webhook verification is not configured. Card checkout remains disabled.");
  if (!isStripeRuntimeEnvironmentValid(process.env)) return result("environment_mismatch", "Stripe test and live credentials do not match this server environment.");
  try {
    const response = await axios.get("https://api.stripe.com/v1/account", { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 8000, maxRedirects: 0 });
    return response.data?.id ? result("connected", "Stripe API connectivity verified. No payment was initiated.", true) : result("provider_error", "Stripe did not return account metadata.");
  } catch (error) {
    if (error?.response?.status === 401 || error?.response?.status === 403) return result("invalid_credentials", "Stripe rejected the deployment credentials.");
    if (["ECONNABORTED", "ETIMEDOUT"].includes(error?.code)) return result("unverified", "Stripe validation timed out. Connectivity remains unverified.");
    if (error?.response) return result("provider_error", `Stripe returned HTTP ${Number(error.response.status) || 0}.`);
    return result("unverified", "Stripe could not be reached. Connectivity remains unverified.");
  }
};

export const validatePaypalGateway = async (req, res) => {
  const environment = String(req.body?.environment || "").toLowerCase();
  const timestamp = new Date().toISOString();
  const result = (status, message, remoteVerified = false) => res.json({ success: true, data: { status, environment, timestamp, remoteVerified, message } });
  if (!["sandbox", "production"].includes(environment)) return result("invalid", "Select sandbox or production and save its settings first.");
  try {
    const tenantId = requireTenantId();
    const config = await PaymentGatewayConfig.findOne({ tenantId, provider: "PAYPAL" });
    const selected = getPaypalEnvironmentSettings(config || {}, environment);
    if (!selected.configured) return result(selected.decryptionFailed ? "invalid" : "incomplete", selected.decryptionFailed ? "Saved PayPal credentials could not be decrypted. Re-enter them and save again." : "PayPal Client ID, Client Secret and Webhook ID are required.");
    try {
      await getPaypalAccessToken({ environment, clientId: selected.clientId, clientSecret: selected.clientSecret });
    } catch (error) {
      if (error?.status === 401 || error?.status === 403) return result("invalid_credentials", "PayPal rejected the credentials for the selected environment.");
      if (error?.name === "TimeoutError" || error?.name === "AbortError") return result("unverified", "PayPal validation timed out. Connectivity remains unverified.");
      if (error?.status) return result("provider_error", `PayPal returned HTTP ${Number(error.status) || 0}.`);
      return result("unverified", "PayPal could not be reached. Connectivity remains unverified.");
    }
    config[`${environment === "sandbox" ? "sandbox" : "production"}PaypalValidatedAt`] = new Date();
    await config.save();
    return result("connected", "PayPal OAuth connectivity verified. No order or payment was created.", true);
  } catch {
    return result("unverified", "PayPal validation could not be completed. Check the selected configuration and retry.");
  }
};
