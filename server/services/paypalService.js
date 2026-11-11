/**
 * Purpose: paypal Service business-logic service. Main declarations: normalizePaypalEnvironment, getPaypalEnvironmentSettings, request, getPaypalAccessToken, paypalApiRequest.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { decryptSecret } from "../models/PaymentGatewayConfig.js";

// Declare PAYPAL_TIMEOUT_MS for use by the surrounding module or function.
const PAYPAL_TIMEOUT_MS = 10000;
// Declare API_ROOT for use by the surrounding module or function.
const API_ROOT = Object.freeze({
  sandbox: "https://api-m.sandbox.paypal.com",
  production: "https://api-m.paypal.com",
});

// Declare normalizePaypalEnvironment for use by the surrounding module or function.
export const normalizePaypalEnvironment = (value) => {
  // Declare environment for use by the surrounding module or function.
  const environment = String(value || "").trim().toLowerCase();
  // Return the expression shown below to the caller.
  return Object.hasOwn(API_ROOT, environment) ? environment : "";
};

// Declare getPaypalEnvironmentSettings for use by the surrounding module or function.
export const getPaypalEnvironmentSettings = (config = {}, environment = config.environment) => {
  // Declare selected for use by the surrounding module or function.
  const selected = normalizePaypalEnvironment(environment);
  // Check the condition (!selected) and run the matching branch.
  if (!selected) return { environment: "", configured: false, clientId: "", clientSecret: "", webhookId: "" };
  // Declare prefix for use by the surrounding module or function.
  const prefix = selected === "sandbox" ? "sandbox" : "production";
  // Declare clientId for use by the surrounding module or function.
  let clientId = "";
  // Declare clientSecret for use by the surrounding module or function.
  let clientSecret = "";
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    clientId = decryptSecret(config[`${prefix}PaypalClientIdEncrypted`]);
    // Perform the side effect or state update expressed on the following line.
    clientSecret = decryptSecret(config[`${prefix}PaypalClientSecretEncrypted`]);
  } catch {
    // Return the object assembled below to the caller.
    return { environment: selected, configured: false, clientId: "", clientSecret: "", webhookId: String(config[`${prefix}PaypalWebhookId`] || ""), merchantId: String(config[`${prefix}PaypalMerchantId`] || ""), decryptionFailed: true };
  }
  // Declare webhookId for use by the surrounding module or function.
  const webhookId = String(config[`${prefix}PaypalWebhookId`] || "").trim();
  // Declare merchantId for use by the surrounding module or function.
  const merchantId = String(config[`${prefix}PaypalMerchantId`] || "").trim();
  // Declare validatedAt for use by the surrounding module or function.
  const validatedAt = config[`${prefix}PaypalValidatedAt`] || null;
  // Return the object assembled below to the caller.
  return { environment: selected, clientId, clientSecret, webhookId, merchantId, validatedAt, configured: Boolean(clientId && clientSecret && webhookId) };
};

// Declare request for use by the surrounding module or function.
const request = async (url, options = {}, fetchImpl = fetch) => {
  // Declare response for use by the surrounding module or function.
  const response = await fetchImpl(url, { ...options, signal: AbortSignal.timeout(PAYPAL_TIMEOUT_MS), redirect: "error" });
  // Declare body for use by the surrounding module or function.
  const body = await response.json().catch(() => ({}));
  // Check the condition (!response.ok) and run the matching branch.
  if (!response.ok) {
    // Declare error for use by the surrounding module or function.
    const error = new Error("PayPal could not complete the request.");
    // Perform the side effect or state update expressed on the following line.
    error.status = response.status;
    // Perform the side effect or state update expressed on the following line.
    error.providerBody = body;
    // Stop the current operation by raising the value of error.
    throw error;
  }
  // Return the value of body to the caller.
  return body;
};

// Declare getPaypalAccessToken for use by the surrounding module or function.
export const getPaypalAccessToken = async (config, fetchImpl = fetch) => {
  // Declare env for use by the surrounding module or function.
  const env = normalizePaypalEnvironment(config?.environment);
  // Check the condition (!env || !config?.clientId || !config?.clientSecret) and run the matching branch.
  if (!env || !config?.clientId || !config?.clientSecret) throw new Error("PayPal credentials are incomplete.");
  // Declare encoded for use by the surrounding module or function.
  const encoded = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64");
  // Declare token for use by the surrounding module or function.
  const token = await request(`${API_ROOT[env]}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${encoded}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  }, fetchImpl);
  // Check the condition (!token?.access_token) and run the matching branch.
  if (!token?.access_token) throw new Error("PayPal did not return an access token.");
  // Return the access token value to the caller.
  return token.access_token;
};

// Declare paypalApiRequest for use by the surrounding module or function.
export const paypalApiRequest = async (config, path, { method = "GET", body, requestId } = {}, fetchImpl = fetch) => {
  // Declare environment for use by the surrounding module or function.
  const environment = normalizePaypalEnvironment(config?.environment);
  // Declare accessToken for use by the surrounding module or function.
  const accessToken = await getPaypalAccessToken(config, fetchImpl);
  // Return the result of request() to the caller.
  return request(`${API_ROOT[environment]}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(requestId ? { "PayPal-Request-Id": String(requestId).slice(0, 38) } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  }, fetchImpl);
};

// Declare verifyPaypalWebhook for use by the surrounding module or function.
export const verifyPaypalWebhook = async ({ config, headers, event, fetchImpl = fetch }) => {
  // Check the condition (!config?.webhookId) and run the matching branch.
  if (!config?.webhookId) return false;
  // Declare requiredHeaders for use by the surrounding module or function.
  const requiredHeaders = {
    transmission_id: headers?.["paypal-transmission-id"],
    transmission_time: headers?.["paypal-transmission-time"],
    cert_url: headers?.["paypal-cert-url"],
    auth_algo: headers?.["paypal-auth-algo"],
    transmission_sig: headers?.["paypal-transmission-sig"],
  };
  // Check the condition (Object.values(requiredHeaders).some((value) => !value)) and run the matching branch.
  if (Object.values(requiredHeaders).some((value) => !value)) return false;
  // Declare result for use by the surrounding module or function.
  const result = await paypalApiRequest(config, "/v1/notifications/verify-webhook-signature", {
    method: "POST",
    body: { ...requiredHeaders, webhook_id: config.webhookId, webhook_event: event },
  }, fetchImpl);
  // Return the expression shown below to the caller.
  return result?.verification_status === "SUCCESS";
};

// Declare getPaypalApiRoot for use by the surrounding module or function.
export const getPaypalApiRoot = (environment) => API_ROOT[normalizePaypalEnvironment(environment)] || "";
