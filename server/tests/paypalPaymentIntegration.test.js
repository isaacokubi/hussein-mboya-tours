/**
 * Purpose: paypal Payment Integration.test automated test. Main declarations: jsonResponse, read, fetchImpl.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import assert from "node:assert/strict";
// Load node:fs/promises so this module can use its exported dependencies.
import { readFile } from "node:fs/promises";
// Load node:test so this module can use its exported dependencies.
import test from "node:test";
// Load ../models/PaymentGatewayConfig.js so this module can use its exported dependencies.
import { encryptSecret } from "../models/PaymentGatewayConfig.js";
// Load ../services/paypalService.js so this module can use its exported dependencies.
import { getPaypalEnvironmentSettings, getPaypalAccessToken, paypalApiRequest, verifyPaypalWebhook } from "../services/paypalService.js";
// Load ../services/tenantPaymentMethods.js so this module can use its exported dependencies.
import { isTenantPaymentMethodAvailable, isPaypalCurrencySupported } from "../services/tenantPaymentMethods.js";

// Declare jsonResponse for use by the surrounding module or function.
const jsonResponse = (body, ok = true, status = 200) => ({ ok, status, json: async () => body });
// Declare read for use by the surrounding module or function.
const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

// Perform the side effect or state update expressed on the following line.
test("PayPal Sandbox and Production credentials are tenant record fields with isolated environment slots", () => {
  // Declare prior for use by the surrounding module or function.
  const prior = process.env.PAYMENT_CREDENTIAL_ENCRYPTION_KEY;
  // Perform the side effect or state update expressed on the following line.
  process.env.PAYMENT_CREDENTIAL_ENCRYPTION_KEY = "unit-test-only-encryption-key";
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare sandboxClientId for use by the surrounding module or function.
    const sandboxClientId = "sandbox-client-example";
    // Declare productionClientId for use by the surrounding module or function.
    const productionClientId = "production-client-example";
    // Declare record for use by the surrounding module or function.
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
    // Perform the side effect or state update expressed on the following line.
    assert.equal(getPaypalEnvironmentSettings(record, "sandbox").clientId, sandboxClientId);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(getPaypalEnvironmentSettings(record, "production").clientId, productionClientId);
    // Perform the side effect or state update expressed on the following line.
    assert.notEqual(getPaypalEnvironmentSettings(record, "sandbox").clientSecret, getPaypalEnvironmentSettings(record, "production").clientSecret);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(getPaypalEnvironmentSettings(record, "sandbox").merchantId, "sandbox-merchant");
    // Perform the side effect or state update expressed on the following line.
    assert.equal(getPaypalEnvironmentSettings(record, "production").merchantId, "production-merchant");
  } finally {
    // Check the condition (prior === undefined) and run the matching branch.
    if (prior === undefined) delete process.env.PAYMENT_CREDENTIAL_ENCRYPTION_KEY;
    else process.env.PAYMENT_CREDENTIAL_ENCRYPTION_KEY = prior;
  }
});

// Perform the side effect or state update expressed on the following line.
test("PayPal OAuth and API calls use only the selected environment endpoint", async () => {
  // Declare urls for use by the surrounding module or function.
  const urls = [];
  // Declare fetchImpl for use by the surrounding module or function.
  const fetchImpl = async (url, init) => {
    // Perform the side effect or state update expressed on the following line.
    urls.push({ url, init });
    // Check the condition (String(url).endsWith("/v1/oauth2/token")) and run the matching branch.
    if (String(url).endsWith("/v1/oauth2/token")) return jsonResponse({ access_token: "opaque-test-token" });
    // Return the result of jsonResponse() to the caller.
    return jsonResponse({ id: "ORDER-TEST", status: "CREATED" });
  };
  // Perform the side effect or state update expressed on the following line.
  await getPaypalAccessToken({ environment: "sandbox", clientId: "sandbox-id", clientSecret: "sandbox-secret" }, fetchImpl);
  // Perform the side effect or state update expressed on the following line.
  await paypalApiRequest({ environment: "production", clientId: "production-id", clientSecret: "production-secret" }, "/v2/checkout/orders", { method: "POST", requestId: "payment-attempt-id", body: { intent: "CAPTURE" } }, fetchImpl);
  // Perform the side effect or state update expressed on the following line.
  assert.match(urls[0].url, /^https:\/\/api-m\.sandbox\.paypal\.com\//);
  // Perform the side effect or state update expressed on the following line.
  assert.match(urls[1].url, /^https:\/\/api-m\.paypal\.com\/v1\/oauth2\/token$/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(urls[2].url, /^https:\/\/api-m\.paypal\.com\/v2\/checkout\/orders$/);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(urls[2].init.headers["PayPal-Request-Id"], "payment-attempt-id");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(urls[1].init.redirect, "error");
});

// Perform the side effect or state update expressed on the following line.
test("PayPal webhook validation uses PayPal's signature verification endpoint only", async () => {
  // Declare calls for use by the surrounding module or function.
  const calls = [];
  // Declare valid for use by the surrounding module or function.
  const valid = await verifyPaypalWebhook({
    config: { environment: "sandbox", clientId: "id", clientSecret: "secret", webhookId: "registered-webhook" },
    headers: { "paypal-transmission-id": "transmission", "paypal-transmission-time": "2026-01-01T00:00:00Z", "paypal-cert-url": "https://api-m.sandbox.paypal.com/cert", "paypal-auth-algo": "SHA256withRSA", "paypal-transmission-sig": "signature" },
    event: { id: "event", event_type: "PAYMENT.CAPTURE.COMPLETED" },
    fetchImpl: async (url, init) => { calls.push({ url, init }); return jsonResponse(String(url).endsWith("/v1/oauth2/token") ? { access_token: "token" } : { verification_status: "SUCCESS" }); },
  });
  // Perform the side effect or state update expressed on the following line.
  assert.equal(valid, true);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(calls.length, 2);
  // Perform the side effect or state update expressed on the following line.
  assert.match(calls[1].url, /\/v1\/notifications\/verify-webhook-signature$/);
  // Perform the side effect or state update expressed on the following line.
  assert.doesNotMatch(calls[1].url, /\/checkout\/orders|\/capture/);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(JSON.parse(calls[1].init.body).webhook_id, "registered-webhook");
});

// Perform the side effect or state update expressed on the following line.
test("PayPal checkout is gated by validated tenant state and supported currency", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.equal(isPaypalCurrencySupported("KES"), false);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(isPaypalCurrencySupported("USD"), true);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(isTenantPaymentMethodAvailable({ paypalAvailable: true, currency: "KES" }, "PAYPAL"), false);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(isTenantPaymentMethodAvailable({ paypalAvailable: true, currency: "USD" }, "PAYPAL"), true);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(isTenantPaymentMethodAvailable({ paypalAvailable: false, currency: "USD" }, "PAYPAL"), false);
});

// Perform the side effect or state update expressed on the following line.
test("PayPal validation, capture, and webhook routes are server-side and payment completion is idempotency-aware", async () => {
  // Declare controller for use by the surrounding module or function.
  const controller = await read("../controllers/paypalController.js");
  // Declare routes for use by the surrounding module or function.
  const routes = await read("../routes/paypalRoutes.js");
  // Declare configs for use by the surrounding module or function.
  const configs = await read("../controllers/paymentGatewayController.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(routes, /\/webhooks\/:tenantId\/:environment/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(routes, /\/orders\/capture/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /getPayableBookingAmount\(booking\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /requestId: `capture-\$\{payment\._id\}`/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /verifyPaypalWebhook/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /completeBookingPayment/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /sandboxLifecycleVerifiedAt/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(configs, /sandboxPaypalClientSecretEncrypted/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(configs, /productionPaypalClientSecretEncrypted/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(configs, /validatePaypalGateway/);
  // Perform the side effect or state update expressed on the following line.
  assert.doesNotMatch(configs.match(/export const validatePaypalGateway[\s\S]*$/)?.[0] || "", /checkout\/orders|\/capture/);
});
