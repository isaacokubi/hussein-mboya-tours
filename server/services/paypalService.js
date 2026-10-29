import { decryptSecret } from "../models/PaymentGatewayConfig.js";

const PAYPAL_TIMEOUT_MS = 10000;
const API_ROOT = Object.freeze({
  sandbox: "https://api-m.sandbox.paypal.com",
  production: "https://api-m.paypal.com",
});

export const normalizePaypalEnvironment = (value) => {
  const environment = String(value || "").trim().toLowerCase();
  return Object.hasOwn(API_ROOT, environment) ? environment : "";
};

export const getPaypalEnvironmentSettings = (config = {}, environment = config.environment) => {
  const selected = normalizePaypalEnvironment(environment);
  if (!selected) return { environment: "", configured: false, clientId: "", clientSecret: "", webhookId: "" };
  const prefix = selected === "sandbox" ? "sandbox" : "production";
  let clientId = "";
  let clientSecret = "";
  try {
    clientId = decryptSecret(config[`${prefix}PaypalClientIdEncrypted`]);
    clientSecret = decryptSecret(config[`${prefix}PaypalClientSecretEncrypted`]);
  } catch {
    return { environment: selected, configured: false, clientId: "", clientSecret: "", webhookId: String(config[`${prefix}PaypalWebhookId`] || ""), merchantId: String(config[`${prefix}PaypalMerchantId`] || ""), decryptionFailed: true };
  }
  const webhookId = String(config[`${prefix}PaypalWebhookId`] || "").trim();
  const merchantId = String(config[`${prefix}PaypalMerchantId`] || "").trim();
  const validatedAt = config[`${prefix}PaypalValidatedAt`] || null;
  return { environment: selected, clientId, clientSecret, webhookId, merchantId, validatedAt, configured: Boolean(clientId && clientSecret && webhookId) };
};

const request = async (url, options = {}, fetchImpl = fetch) => {
  const response = await fetchImpl(url, { ...options, signal: AbortSignal.timeout(PAYPAL_TIMEOUT_MS), redirect: "error" });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error("PayPal could not complete the request.");
    error.status = response.status;
    error.providerBody = body;
    throw error;
  }
  return body;
};

export const getPaypalAccessToken = async (config, fetchImpl = fetch) => {
  const env = normalizePaypalEnvironment(config?.environment);
  if (!env || !config?.clientId || !config?.clientSecret) throw new Error("PayPal credentials are incomplete.");
  const encoded = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64");
  const token = await request(`${API_ROOT[env]}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${encoded}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  }, fetchImpl);
  if (!token?.access_token) throw new Error("PayPal did not return an access token.");
  return token.access_token;
};

export const paypalApiRequest = async (config, path, { method = "GET", body, requestId } = {}, fetchImpl = fetch) => {
  const environment = normalizePaypalEnvironment(config?.environment);
  const accessToken = await getPaypalAccessToken(config, fetchImpl);
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

export const verifyPaypalWebhook = async ({ config, headers, event, fetchImpl = fetch }) => {
  if (!config?.webhookId) return false;
  const requiredHeaders = {
    transmission_id: headers?.["paypal-transmission-id"],
    transmission_time: headers?.["paypal-transmission-time"],
    cert_url: headers?.["paypal-cert-url"],
    auth_algo: headers?.["paypal-auth-algo"],
    transmission_sig: headers?.["paypal-transmission-sig"],
  };
  if (Object.values(requiredHeaders).some((value) => !value)) return false;
  const result = await paypalApiRequest(config, "/v1/notifications/verify-webhook-signature", {
    method: "POST",
    body: { ...requiredHeaders, webhook_id: config.webhookId, webhook_event: event },
  }, fetchImpl);
  return result?.verification_status === "SUCCESS";
};

export const getPaypalApiRoot = (environment) => API_ROOT[normalizePaypalEnvironment(environment)] || "";
