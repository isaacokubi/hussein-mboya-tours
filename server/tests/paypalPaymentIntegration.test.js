import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { encryptSecret } from "../models/PaymentGatewayConfig.js";
import { getPaypalEnvironmentSettings, getPaypalAccessToken, paypalApiRequest, verifyPaypalWebhook } from "../services/paypalService.js";
import { isTenantPaymentMethodAvailable, isPaypalCurrencySupported } from "../services/tenantPaymentMethods.js";

const jsonResponse = (body, ok = true, status = 200) => ({ ok, status, json: async () => body });
const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("PayPal Sandbox and Production credentials are tenant record fields with isolated environment slots", () => {
  const prior = process.env.PAYMENT_CREDENTIAL_ENCRYPTION_KEY;
  process.env.PAYMENT_CREDENTIAL_ENCRYPTION_KEY = "unit-test-only-encryption-key";
  try {
    const sandboxClientId = "sandbox-client-example";
    const productionClientId = "production-client-example";
    const record = {
      sandboxPaypalClientIdEncrypted: encryptSecret(sandboxClientId),
      sandboxPaypalClientSecretEncrypted: encryptSecret("sandbox-secret-example"),
      sandboxPaypalWebhookId: "sandbox-webhook",
      sandboxPaypalMerchantId: "sandbox-merchant",
      productionPaypalClientIdEncrypted: encryptSecret(productionClientId),
      productionPaypalClientSecretEncrypted: encryptSecret("production-secret-example"),
      productionPaypalWebhookId: "production-webhook",
      productionPaypalMerchantId: "production-merchant",
    };
    assert.equal(getPaypalEnvironmentSettings(record, "sandbox").clientId, sandboxClientId);
    assert.equal(getPaypalEnvironmentSettings(record, "production").clientId, productionClientId);
    assert.notEqual(getPaypalEnvironmentSettings(record, "sandbox").clientSecret, getPaypalEnvironmentSettings(record, "production").clientSecret);
    assert.equal(getPaypalEnvironmentSettings(record, "sandbox").merchantId, "sandbox-merchant");
    assert.equal(getPaypalEnvironmentSettings(record, "production").merchantId, "production-merchant");
  } finally {
    if (prior === undefined) delete process.env.PAYMENT_CREDENTIAL_ENCRYPTION_KEY;
    else process.env.PAYMENT_CREDENTIAL_ENCRYPTION_KEY = prior;
  }
});

test("PayPal OAuth and API calls use only the selected environment endpoint", async () => {
  const urls = [];
  const fetchImpl = async (url, init) => {
    urls.push({ url, init });
    if (String(url).endsWith("/v1/oauth2/token")) return jsonResponse({ access_token: "opaque-test-token" });
    return jsonResponse({ id: "ORDER-TEST", status: "CREATED" });
  };
  await getPaypalAccessToken({ environment: "sandbox", clientId: "sandbox-id", clientSecret: "sandbox-secret" }, fetchImpl);
  await paypalApiRequest({ environment: "production", clientId: "production-id", clientSecret: "production-secret" }, "/v2/checkout/orders", { method: "POST", requestId: "payment-attempt-id", body: { intent: "CAPTURE" } }, fetchImpl);
  assert.match(urls[0].url, /^https:\/\/api-m\.sandbox\.paypal\.com\//);
  assert.match(urls[1].url, /^https:\/\/api-m\.paypal\.com\/v1\/oauth2\/token$/);
  assert.match(urls[2].url, /^https:\/\/api-m\.paypal\.com\/v2\/checkout\/orders$/);
  assert.equal(urls[2].init.headers["PayPal-Request-Id"], "payment-attempt-id");
  assert.equal(urls[1].init.redirect, "error");
});

test("PayPal webhook validation uses PayPal's signature verification endpoint only", async () => {
  const calls = [];
  const valid = await verifyPaypalWebhook({
    config: { environment: "sandbox", clientId: "id", clientSecret: "secret", webhookId: "registered-webhook" },
    headers: { "paypal-transmission-id": "transmission", "paypal-transmission-time": "2026-01-01T00:00:00Z", "paypal-cert-url": "https://api-m.sandbox.paypal.com/cert", "paypal-auth-algo": "SHA256withRSA", "paypal-transmission-sig": "signature" },
    event: { id: "event", event_type: "PAYMENT.CAPTURE.COMPLETED" },
    fetchImpl: async (url, init) => { calls.push({ url, init }); return jsonResponse(String(url).endsWith("/v1/oauth2/token") ? { access_token: "token" } : { verification_status: "SUCCESS" }); },
  });
  assert.equal(valid, true);
  assert.equal(calls.length, 2);
  assert.match(calls[1].url, /\/v1\/notifications\/verify-webhook-signature$/);
  assert.doesNotMatch(calls[1].url, /\/checkout\/orders|\/capture/);
  assert.equal(JSON.parse(calls[1].init.body).webhook_id, "registered-webhook");
});

test("PayPal checkout is gated by validated tenant state and supported currency", () => {
  assert.equal(isPaypalCurrencySupported("KES"), false);
  assert.equal(isPaypalCurrencySupported("USD"), true);
  assert.equal(isTenantPaymentMethodAvailable({ paypalAvailable: true, currency: "KES" }, "PAYPAL"), false);
  assert.equal(isTenantPaymentMethodAvailable({ paypalAvailable: true, currency: "USD" }, "PAYPAL"), true);
  assert.equal(isTenantPaymentMethodAvailable({ paypalAvailable: false, currency: "USD" }, "PAYPAL"), false);
});

test("PayPal validation, capture, and webhook routes are server-side and payment completion is idempotency-aware", async () => {
  const controller = await read("../controllers/paypalController.js");
  const routes = await read("../routes/paypalRoutes.js");
  const configs = await read("../controllers/paymentGatewayController.js");
  assert.match(routes, /\/webhooks\/:tenantId\/:environment/);
  assert.match(routes, /\/orders\/capture/);
  assert.match(controller, /getPayableBookingAmount\(booking\)/);
  assert.match(controller, /requestId: `capture-\$\{payment\._id\}`/);
  assert.match(controller, /verifyPaypalWebhook/);
  assert.match(controller, /completeBookingPayment/);
  assert.match(controller, /sandboxLifecycleVerifiedAt/);
  assert.match(configs, /sandboxPaypalClientSecretEncrypted/);
  assert.match(configs, /productionPaypalClientSecretEncrypted/);
  assert.match(configs, /validatePaypalGateway/);
  assert.doesNotMatch(configs.match(/export const validatePaypalGateway[\s\S]*$/)?.[0] || "", /checkout\/orders|\/capture/);
});
