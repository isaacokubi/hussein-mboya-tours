/**
 * Purpose: super Admin Mpesa Gateway Controller HTTP controller. Main declarations: createSuperAdminMpesaGatewayController, withTenant, hasSecret, result.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../models/Organization.js so this module can use its exported dependencies.
import Organization from "../models/Organization.js";
// Load ../models/PaymentGatewayConfig.js so this module can use its exported dependencies.
import PaymentGatewayConfig, { decryptSecret, encryptSecret } from "../models/PaymentGatewayConfig.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { runWithTenant } from "../tenancy/context.js";
// Load ../services/mpesaGatewaySettings.js so this module can use its exported dependencies.
import { getEnvironmentMpesaSettings, safeMpesaGatewayView, validateMpesaGatewaySettings } from "../services/mpesaGatewaySettings.js";
// Load ../config/mpesa.js so this module can use its exported dependencies.
import { getMpesaUrls } from "../config/mpesa.js";
// Load axios so this module can use its exported dependencies.
import axios from "axios";

// Declare SECRET_FIELDS for use by the surrounding module or function.
const SECRET_FIELDS = ["consumerKey", "consumerSecret", "passkey"];

// Declare createSuperAdminMpesaGatewayController for use by the surrounding module or function.
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
  // Declare withTenant for use by the surrounding module or function.
  const withTenant = (operation) => async (req, res, next) => {
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Declare tenantId for use by the surrounding module or function.
      const tenantId = String(req.params.tenantId || "");
      // Check the condition (!mongoose.Types.ObjectId.isValid(tenantId)) and run the matching branch.
      if (!mongoose.Types.ObjectId.isValid(tenantId)) return res.status(400).json({ success: false, message: "Invalid tenant ID." });
      // Declare tenant for use by the surrounding module or function.
      const tenant = await tenantScope({ role: "super_admin", bypass: true }, () => organizations.findById(tenantId).select("_id name slug isSystem settings").lean());
      // Check the condition (!tenant || String(tenant.slug || "").toLowerCase() === "platform" || t) and run the matching branch.
      if (!tenant || String(tenant.slug || "").toLowerCase() === "platform" || tenant.isSystem === true || tenant.settings?.isPlatform === true || tenant.settings?.platform === true) {
        // Return the result of res.status(404).json() to the caller.
        return res.status(404).json({ success: false, message: "Tenant not found." });
      }
      // Return the completed the result of tenantScope() operation to the caller.
      return await tenantScope({ tenantId: tenant._id, tenant, role: "admin", bypass: false }, () => operation(req, res, next, tenant));
    } catch (error) { return next(error); }
  };

  // Declare get for use by the surrounding module or function.
  const get = withTenant(async (req, res, _next, tenant) => {
    // Declare config for use by the surrounding module or function.
    const config = await gateways.findOne({ tenantId: tenant._id, provider: "MPESA" }).lean();
    // Return the result of res.json() to the caller.
    return res.json({
      success: true,
      tenant: { id: String(tenant._id), name: tenant.name, slug: tenant.slug },
      data: safeMpesaGatewayView(config || {}, String(req.query?.environment || config?.environment || "sandbox").toLowerCase()),
    });
  });

  // Declare save for use by the surrounding module or function.
  const save = withTenant(async (req, res, _next, tenant) => {
    // Declare body for use by the surrounding module or function.
    const body = req.body || {};
    // Check the condition (!["sandbox", "production"].includes(String(body.environment || "").toL) and run the matching branch.
    if (!["sandbox", "production"].includes(String(body.environment || "").toLowerCase())) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({ success: false, message: "Environment must be sandbox or production." });
    }
    // Check the condition (typeof body.enabled !== "boolean") and run the matching branch.
    if (typeof body.enabled !== "boolean") {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({ success: false, message: "Enabled must be a boolean." });
    }
    // Check the condition (SECRET_FIELDS.some((field) => body[field] !== undefined && typeof body) and run the matching branch.
    if (SECRET_FIELDS.some((field) => body[field] !== undefined && typeof body[field] !== "string") || ["callbackUrl", "shortcode", "accountName"].some((field) => body[field] !== undefined && typeof body[field] !== "string")) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({ success: false, message: "M-Pesa settings must contain text values only." });
    }

    // Declare filter for use by the surrounding module or function.
    const filter = { tenantId: tenant._id, provider: "MPESA" };
    // Declare existing for use by the surrounding module or function.
    const existing = await gateways.findOne(filter).lean();
    // Declare environment for use by the surrounding module or function.
    const environment = String(body.environment).toLowerCase();
    // Declare envExisting for use by the surrounding module or function.
    const envExisting = getEnvironmentMpesaSettings(existing || {}, environment);
    // Declare callbackUrl for use by the surrounding module or function.
    const callbackUrl = body.callbackUrl === undefined ? envExisting.callbackUrl : String(body.callbackUrl || "").trim();
    // Declare shortcode for use by the surrounding module or function.
    const shortcode = body.shortcode === undefined ? envExisting.shortcode : String(body.shortcode || "").trim();
    // Declare settingsError for use by the surrounding module or function.
    const settingsError = (body.enabled || callbackUrl)
      ? validateSettings({ environment, callbackUrl })
      : null;
    // Check the condition (settingsError) and run the matching branch.
    if (settingsError) return res.status(400).json({ success: false, message: settingsError });

    // Declare hasSecret for use by the surrounding module or function.
    const hasSecret = (field) => Boolean(body[field] || envExisting[`${field}Encrypted`]);
    // Check the condition (body.enabled && (!shortcode || SECRET_FIELDS.some((field) => !hasSecre) and run the matching branch.
    if (body.enabled && (!shortcode || SECRET_FIELDS.some((field) => !hasSecret(field)) || !callbackUrl)) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({ success: false, message: "To enable M-Pesa, configure Consumer Key, Consumer Secret, Shortcode, Passkey and a valid callback URL." });
    }

    // Declare update for use by the surrounding module or function.
    const update = {
      provider: "MPESA",
      environment,
      enabled: body.enabled,
      accountName: body.accountName === undefined ? (existing?.accountName || "") : String(body.accountName || "").trim(),
      [`${environment}Shortcode`]: shortcode,
      [`${environment}CallbackUrl`]: callbackUrl,
      updatedBy: req.user?._id || null,
    };
    // Repeat the enclosed work for each required iteration.
    for (const field of SECRET_FIELDS) {
      // Check the condition (body[field] !== undefined && body[field] !== "") and run the matching branch.
      if (body[field] !== undefined && body[field] !== "") update[`${environment}${field[0].toUpperCase()}${field.slice(1)}Encrypted`] = encrypt(body[field]);
    }

    // Declare config for use by the surrounding module or function.
    const config = await gateways.findOneAndUpdate(filter, { $set: update }, { new: true, upsert: true, runValidators: true }).lean();
    // Return the result of res.json() to the caller.
    return res.json({ success: true, message: "Tenant M-Pesa settings saved securely.", data: safeMpesaGatewayView(config, environment) });
  });

  // Declare disable for use by the surrounding module or function.
  const disable = withTenant(async (req, res, _next, tenant) => {
    // Declare config for use by the surrounding module or function.
    const config = await gateways.findOneAndUpdate(
      { tenantId: tenant._id, provider: "MPESA" },
      { $set: { enabled: false, updatedBy: req.user?._id || null } },
      { new: true },
    ).lean();
    // Check the condition (!config) and run the matching branch.
    if (!config) return res.status(404).json({ success: false, message: "Tenant M-Pesa configuration not found." });
    // Return the result of res.json() to the caller.
    return res.json({ success: true, message: "Tenant M-Pesa gateway disabled." });
  });

  // Declare validate for use by the surrounding module or function.
  const validate = withTenant(async (req, res, _next, tenant) => {
    // Declare environment for use by the surrounding module or function.
    const environment = String(req.body?.environment || "").toLowerCase();
    // Declare config for use by the surrounding module or function.
    const config = await gateways.findOne({ tenantId: tenant._id, provider: "MPESA" }).lean();
    // Declare selected for use by the surrounding module or function.
    const selected = getEnvironmentMpesaSettings(config || {}, environment);
    // Declare timestamp for use by the surrounding module or function.
    const timestamp = now().toISOString();
    // Declare result for use by the surrounding module or function.
    const result = (status, message, remoteVerified = false) => res.json({ success: true, data: { status, environment, timestamp, remoteVerified, message } });
    // Check the condition (!config || !["sandbox", "production"].includes(environment)) and run the matching branch.
    if (!config || !["sandbox", "production"].includes(environment)) return result("invalid", "Select sandbox or production and save its settings first.");
    // Declare callbackError for use by the surrounding module or function.
    const callbackError = validateSettings({ environment, callbackUrl: selected.callbackUrl });
    // Check the condition (!selected.shortcode || !selected.consumerKeyEncrypted || !selected.con) and run the matching branch.
    if (!selected.shortcode || !selected.consumerKeyEncrypted || !selected.consumerSecretEncrypted || !selected.passkeyEncrypted || callbackError) return result("incomplete", callbackError || "Shortcode and all three credentials are required.");
    // Declare consumerKey for use by the surrounding module or function.
    let consumerKey; let consumerSecret;
    // Run this operation with a dedicated error-handling path for failures.
    try { consumerKey = decrypt(selected.consumerKeyEncrypted); consumerSecret = decrypt(selected.consumerSecretEncrypted); decrypt(selected.passkeyEncrypted); }
    // Handle the error raised by the preceding protected operation.
    catch { return result("invalid", "Saved credentials could not be decrypted. Re-enter them and save again."); }
    // Check the condition (!consumerKey || !consumerSecret) and run the matching branch.
    if (!consumerKey || !consumerSecret) return result("incomplete", "Consumer Key and Consumer Secret are required.");
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Declare urls for use by the surrounding module or function.
      const urls = getMpesaUrls(environment);
      // Declare auth for use by the surrounding module or function.
      const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
      // Declare response for use by the surrounding module or function.
      const response = await http.get(urls.auth, { headers: { Authorization: `Basic ${auth}` }, timeout: 8000, maxRedirects: 0 });
      // Check the condition (!response.data?.access_token) and run the matching branch.
      if (!response.data?.access_token) return result("provider_error", "Daraja did not return an access token.");
      // Return the result of result() to the caller.
      return result("connected", "Daraja OAuth connectivity verified. No payment was initiated.", true);
    } catch (error) {
      // Declare status for use by the surrounding module or function.
      const status = Number(error?.response?.status);
      // Check the condition (["ECONNABORTED", "ETIMEDOUT"].includes(error?.code)) and run the matching branch.
      if (["ECONNABORTED", "ETIMEDOUT"].includes(error?.code)) return result("unverified", "Daraja validation timed out. Check connectivity and try again.");
      // Check the condition (status === 401 || status === 403) and run the matching branch.
      if (status === 401 || status === 403) return result("invalid_credentials", "Daraja rejected these credentials for the selected environment.");
      // Return the result of result() to the caller.
      return result("provider_error", status ? `Daraja returned HTTP ${status}.` : "Daraja could not be reached. Connectivity remains unverified.");
    }
  });
  // Return the object assembled below to the caller.
  return { get, save, disable, validate };
};

// Declare controller for use by the surrounding module or function.
const controller = createSuperAdminMpesaGatewayController();
// Declare getSuperAdminTenantMpesa for use by the surrounding module or function.
export const getSuperAdminTenantMpesa = controller.get;
// Declare saveSuperAdminTenantMpesa for use by the surrounding module or function.
export const saveSuperAdminTenantMpesa = controller.save;
// Declare disableSuperAdminTenantMpesa for use by the surrounding module or function.
export const disableSuperAdminTenantMpesa = controller.disable;
// Declare validateSuperAdminTenantMpesa for use by the surrounding module or function.
export const validateSuperAdminTenantMpesa = controller.validate;
