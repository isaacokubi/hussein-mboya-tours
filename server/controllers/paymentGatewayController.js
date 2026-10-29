import PaymentGatewayConfig, { encryptSecret } from "../models/PaymentGatewayConfig.js";
import { requireTenantId } from "../tenancy/context.js";
import { getEnvironmentMpesaSettings, validateMpesaGatewaySettings } from "../services/mpesaGatewaySettings.js";
import { getMpesaUrls } from "../config/mpesa.js";
import { decryptSecret } from "../models/PaymentGatewayConfig.js";
import axios from "axios";

const SECRET_FIELDS = [
  "consumerKey", "consumerSecret", "passkey", "secretKey", "webhookSecret",
  "initiatorName", "securityCredential",
];
const ALLOWED_PROVIDERS = ["MPESA", "STRIPE", "PAYPAL", "PESAPAL", "BANK"];

export const listGatewayConfigs = async (req, res, next) => {
  try {
    requireTenantId();
    const configs = await PaymentGatewayConfig.find({})
      .select("-consumerKeyEncrypted -consumerSecretEncrypted -passkeyEncrypted -sandboxConsumerKeyEncrypted -sandboxConsumerSecretEncrypted -sandboxPasskeyEncrypted -productionConsumerKeyEncrypted -productionConsumerSecretEncrypted -productionPasskeyEncrypted -secretKeyEncrypted -webhookSecretEncrypted -initiatorNameEncrypted -securityCredentialEncrypted")
      .sort({ provider: 1 }).lean();
    return res.json({ success: true, data: configs.map((c) => ({
      ...c,
      configured: c.provider === "MPESA"
        ? (() => { const env = getEnvironmentMpesaSettings(c); return Boolean(env.consumerKeyEncrypted && env.consumerSecretEncrypted && env.passkeyEncrypted && env.shortcode && env.callbackUrl); })()
        : true,
    })) });
  } catch (error) { next(error); }
};

export const upsertGatewayConfig = async (req, res, next) => {
  try {
    const tenantId = requireTenantId();
    const provider = String(req.params.provider || "").toUpperCase();
    if (!ALLOWED_PROVIDERS.includes(provider)) return res.status(400).json({ success: false, message: "Unsupported payment provider." });

    const body = req.body || {};
    if (provider === "MPESA" && !["sandbox", "production"].includes(String(body.environment || "sandbox").toLowerCase())) {
      return res.status(400).json({ success: false, message: "Environment must be sandbox or production." });
    }
    const existing = provider === "MPESA" ? await PaymentGatewayConfig.findOne({ tenantId, provider }).lean() : null;
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

    const config = await PaymentGatewayConfig.findOneAndUpdate(
      { tenantId, provider },
      { $set: update },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    const configuredSettings = provider === "MPESA" ? getEnvironmentMpesaSettings(config, environment) : {};
    const configured = provider === "MPESA"
      ? Boolean(configuredSettings.consumerKeyEncrypted && configuredSettings.consumerSecretEncrypted && configuredSettings.passkeyEncrypted && configuredSettings.shortcode && configuredSettings.callbackUrl)
      : true;

    return res.json({ success: true, message: `${provider} configuration saved securely${config.enabled ? " and enabled" : ""}.`, data: {
      id: config._id, provider: config.provider, environment: config.environment, enabled: config.enabled,
      accountName: config.accountName, shortcode: provider === "MPESA" ? configuredSettings.shortcode : config.shortcode, publicKey: config.publicKey, merchantId: config.merchantId,
      callbackUrl: provider === "MPESA" ? configuredSettings.callbackUrl : config.callbackUrl, configured,
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
    const environmentSettings = provider === "MPESA" ? getEnvironmentMpesaSettings(config, config.environment || "sandbox") : {};
    return res.json({ success: true, data: {
      id: config._id, provider: config.provider, environment: config.environment, enabled: config.enabled,
      accountName: config.accountName, shortcode: provider === "MPESA" ? environmentSettings.shortcode : config.shortcode, publicKey: config.publicKey, merchantId: config.merchantId,
      callbackUrl: provider === "MPESA" ? environmentSettings.callbackUrl : config.callbackUrl,
      configured: provider === "MPESA"
        ? Boolean(environmentSettings.consumerKeyEncrypted && environmentSettings.consumerSecretEncrypted && environmentSettings.passkeyEncrypted && environmentSettings.shortcode && environmentSettings.callbackUrl)
        : true,
      secretsConfigured: SECRET_FIELDS.reduce((out, field) => { out[field] = Boolean(provider === "MPESA" ? environmentSettings[`${field}Encrypted`] : config[`${field}Encrypted`]); return out; }, {}),
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
