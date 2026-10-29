import mongoose from "mongoose";
import Organization from "../models/Organization.js";
import PaymentGatewayConfig, { decryptSecret, encryptSecret } from "../models/PaymentGatewayConfig.js";
import { runWithTenant } from "../tenancy/context.js";
import { getEnvironmentMpesaSettings, safeMpesaGatewayView, validateMpesaGatewaySettings } from "../services/mpesaGatewaySettings.js";
import { getMpesaUrls } from "../config/mpesa.js";
import axios from "axios";

const SECRET_FIELDS = ["consumerKey", "consumerSecret", "passkey"];

export const createSuperAdminMpesaGatewayController = ({
  organizations = Organization,
  gateways = PaymentGatewayConfig,
  encrypt = encryptSecret,
  tenantScope = runWithTenant,
  validateSettings = validateMpesaGatewaySettings,
  http = axios,
  decrypt = decryptSecret,
  now = () => new Date(),
} = {}) => {
  const withTenant = (operation) => async (req, res, next) => {
    try {
      const tenantId = String(req.params.tenantId || "");
      if (!mongoose.Types.ObjectId.isValid(tenantId)) return res.status(400).json({ success: false, message: "Invalid tenant ID." });
      const tenant = await tenantScope({ role: "super_admin", bypass: true }, () => organizations.findById(tenantId).select("_id name slug isSystem settings").lean());
      if (!tenant || String(tenant.slug || "").toLowerCase() === "platform" || tenant.isSystem === true || tenant.settings?.isPlatform === true || tenant.settings?.platform === true) {
        return res.status(404).json({ success: false, message: "Tenant not found." });
      }
      return await tenantScope({ tenantId: tenant._id, tenant, role: "admin", bypass: false }, () => operation(req, res, next, tenant));
    } catch (error) { return next(error); }
  };

  const get = withTenant(async (req, res, _next, tenant) => {
    const config = await gateways.findOne({ tenantId: tenant._id, provider: "MPESA" }).lean();
    return res.json({
      success: true,
      tenant: { id: String(tenant._id), name: tenant.name, slug: tenant.slug },
      data: safeMpesaGatewayView(config || {}, String(req.query?.environment || config?.environment || "sandbox").toLowerCase()),
    });
  });

  const save = withTenant(async (req, res, _next, tenant) => {
    const body = req.body || {};
    if (!["sandbox", "production"].includes(String(body.environment || "").toLowerCase())) {
      return res.status(400).json({ success: false, message: "Environment must be sandbox or production." });
    }
    if (typeof body.enabled !== "boolean") {
      return res.status(400).json({ success: false, message: "Enabled must be a boolean." });
    }
    if (SECRET_FIELDS.some((field) => body[field] !== undefined && typeof body[field] !== "string") || ["callbackUrl", "shortcode", "accountName"].some((field) => body[field] !== undefined && typeof body[field] !== "string")) {
      return res.status(400).json({ success: false, message: "M-Pesa settings must contain text values only." });
    }

    const filter = { tenantId: tenant._id, provider: "MPESA" };
    const existing = await gateways.findOne(filter).lean();
    const environment = String(body.environment).toLowerCase();
    const envExisting = getEnvironmentMpesaSettings(existing || {}, environment);
    const callbackUrl = body.callbackUrl === undefined ? envExisting.callbackUrl : String(body.callbackUrl || "").trim();
    const shortcode = body.shortcode === undefined ? envExisting.shortcode : String(body.shortcode || "").trim();
    const settingsError = (body.enabled || callbackUrl)
      ? validateSettings({ environment, callbackUrl })
      : null;
    if (settingsError) return res.status(400).json({ success: false, message: settingsError });

    const hasSecret = (field) => Boolean(body[field] || envExisting[`${field}Encrypted`]);
    if (body.enabled && (!shortcode || SECRET_FIELDS.some((field) => !hasSecret(field)) || !callbackUrl)) {
      return res.status(400).json({ success: false, message: "To enable M-Pesa, configure Consumer Key, Consumer Secret, Shortcode, Passkey and a valid callback URL." });
    }

    const update = {
      provider: "MPESA",
      environment,
      enabled: body.enabled,
      accountName: body.accountName === undefined ? (existing?.accountName || "") : String(body.accountName || "").trim(),
      [`${environment}Shortcode`]: shortcode,
      [`${environment}CallbackUrl`]: callbackUrl,
      updatedBy: req.user?._id || null,
    };
    for (const field of SECRET_FIELDS) {
      if (body[field] !== undefined && body[field] !== "") update[`${environment}${field[0].toUpperCase()}${field.slice(1)}Encrypted`] = encrypt(body[field]);
    }

    const config = await gateways.findOneAndUpdate(filter, { $set: update }, { new: true, upsert: true, runValidators: true }).lean();
    return res.json({ success: true, message: "Tenant M-Pesa settings saved securely.", data: safeMpesaGatewayView(config, environment) });
  });

  const disable = withTenant(async (req, res, _next, tenant) => {
    const config = await gateways.findOneAndUpdate(
      { tenantId: tenant._id, provider: "MPESA" },
      { $set: { enabled: false, updatedBy: req.user?._id || null } },
      { new: true },
    ).lean();
    if (!config) return res.status(404).json({ success: false, message: "Tenant M-Pesa configuration not found." });
    return res.json({ success: true, message: "Tenant M-Pesa gateway disabled." });
  });

  const validate = withTenant(async (req, res, _next, tenant) => {
    const environment = String(req.body?.environment || "").toLowerCase();
    const config = await gateways.findOne({ tenantId: tenant._id, provider: "MPESA" }).lean();
    const selected = getEnvironmentMpesaSettings(config || {}, environment);
    const timestamp = now().toISOString();
    const result = (status, message, remoteVerified = false) => res.json({ success: true, data: { status, environment, timestamp, remoteVerified, message } });
    if (!config || !["sandbox", "production"].includes(environment)) return result("invalid", "Select sandbox or production and save its settings first.");
    const callbackError = validateSettings({ environment, callbackUrl: selected.callbackUrl });
    if (!selected.shortcode || !selected.consumerKeyEncrypted || !selected.consumerSecretEncrypted || !selected.passkeyEncrypted || callbackError) return result("incomplete", callbackError || "Shortcode and all three credentials are required.");
    let consumerKey; let consumerSecret;
    try { consumerKey = decrypt(selected.consumerKeyEncrypted); consumerSecret = decrypt(selected.consumerSecretEncrypted); decrypt(selected.passkeyEncrypted); }
    catch { return result("invalid", "Saved credentials could not be decrypted. Re-enter them and save again."); }
    if (!consumerKey || !consumerSecret) return result("incomplete", "Consumer Key and Consumer Secret are required.");
    try {
      const urls = getMpesaUrls(environment);
      const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
      const response = await http.get(urls.auth, { headers: { Authorization: `Basic ${auth}` }, timeout: 8000, maxRedirects: 0 });
      if (!response.data?.access_token) return result("provider_error", "Daraja did not return an access token.");
      return result("connected", "Daraja OAuth connectivity verified. No payment was initiated.", true);
    } catch (error) {
      const status = Number(error?.response?.status);
      if (["ECONNABORTED", "ETIMEDOUT"].includes(error?.code)) return result("unverified", "Daraja validation timed out. Check connectivity and try again.");
      if (status === 401 || status === 403) return result("invalid_credentials", "Daraja rejected these credentials for the selected environment.");
      return result("provider_error", status ? `Daraja returned HTTP ${status}.` : "Daraja could not be reached. Connectivity remains unverified.");
    }
  });
  return { get, save, disable, validate };
};

const controller = createSuperAdminMpesaGatewayController();
export const getSuperAdminTenantMpesa = controller.get;
export const saveSuperAdminTenantMpesa = controller.save;
export const disableSuperAdminTenantMpesa = controller.disable;
export const validateSuperAdminTenantMpesa = controller.validate;
