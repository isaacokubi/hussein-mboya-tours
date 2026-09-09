import PaymentGatewayConfig, { encryptSecret } from "../models/PaymentGatewayConfig.js";
import { requireTenantId } from "../tenancy/context.js";

const SECRET_FIELDS = [
  "consumerKey", "consumerSecret", "passkey", "secretKey", "webhookSecret",
  "initiatorName", "securityCredential",
];
const ALLOWED_PROVIDERS = ["MPESA", "STRIPE", "PAYPAL", "PESAPAL", "BANK"];

export const listGatewayConfigs = async (req, res, next) => {
  try {
    requireTenantId();
    const configs = await PaymentGatewayConfig.find({})
      .select("-consumerKeyEncrypted -consumerSecretEncrypted -passkeyEncrypted -secretKeyEncrypted -webhookSecretEncrypted -initiatorNameEncrypted -securityCredentialEncrypted")
      .sort({ provider: 1 }).lean();
    return res.json({ success: true, data: configs.map((c) => ({ ...c, configured: true })) });
  } catch (error) { next(error); }
};

export const upsertGatewayConfig = async (req, res, next) => {
  try {
    const tenantId = requireTenantId();
    const provider = String(req.params.provider || "").toUpperCase();
    if (!ALLOWED_PROVIDERS.includes(provider)) return res.status(400).json({ success: false, message: "Unsupported payment provider." });

    const body = req.body || {};
    const update = {
      provider,
      environment: ["sandbox", "production"].includes(body.environment) ? body.environment : "sandbox",
      enabled: body.enabled === true || body.enabled === "true",
      accountName: String(body.accountName || "").trim(),
      shortcode: String(body.shortcode || "").trim(),
      publicKey: String(body.publicKey || "").trim(),
      merchantId: String(body.merchantId || "").trim(),
      callbackUrl: String(body.callbackUrl || "").trim(),
      updatedBy: req.user?._id || null,
    };

    if (provider === "MPESA" && update.enabled) {
      if (!body.consumerKey || !body.consumerSecret || !body.passkey || !update.shortcode) {
        const existing = await PaymentGatewayConfig.findOne({ tenantId, provider }).lean();
        const hasExistingCredentials = Boolean(
          existing?.consumerKeyEncrypted && existing?.consumerSecretEncrypted &&
          existing?.passkeyEncrypted && existing?.shortcode
        );
        if (!hasExistingCredentials) {
          return res.status(400).json({ success: false, message: "Provide the tenant M-Pesa consumer key, consumer secret, passkey and shortcode when enabling M-Pesa." });
        }
      }
    }

    for (const field of SECRET_FIELDS) {
      if (body[field] !== undefined && body[field] !== "") {
        update[`${field}Encrypted`] = encryptSecret(body[field]);
      }
    }

    const config = await PaymentGatewayConfig.findOneAndUpdate(
      { tenantId, provider },
      { $set: update },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    return res.json({ success: true, message: `${provider} configuration saved securely.`, data: {
      id: config._id, provider: config.provider, environment: config.environment, enabled: config.enabled,
      accountName: config.accountName, shortcode: config.shortcode, publicKey: config.publicKey, merchantId: config.merchantId,
      callbackUrl: config.callbackUrl, configured: true,
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
    return res.json({ success: true, data: {
      id: config._id, provider: config.provider, environment: config.environment, enabled: config.enabled,
      accountName: config.accountName, shortcode: config.shortcode, publicKey: config.publicKey, merchantId: config.merchantId,
      callbackUrl: config.callbackUrl, configured: true,
      secretsConfigured: SECRET_FIELDS.reduce((out, field) => { out[field] = Boolean(config[`${field}Encrypted`]); return out; }, {}),
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
