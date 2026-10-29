import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(process.cwd());
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("M-Pesa callback is tenant-resolved and integrity-protected before processing", () => {
  const routes = read("routes/mpesaRoutes.js");
  assert.match(routes, /router\.post\("\/callback", validateMpesaCallbackPayload, resolveMpesaCallbackTenant, verifyMpesaCallbackIntegrity, subscriptionMpesaCallback\)/);
});

test("failed and successful M-Pesa callbacks are both checked against Daraja", () => {
  const integrity = read("middleware/mpesaCallbackIntegrity.js");
  assert.doesNotMatch(integrity, /ResultCode\)\) !== 0\) return next\(\)/);
  assert.match(integrity, /providerQuery\(checkoutRequestID, paymentConfig \|\| config\)/);
  assert.match(integrity, /providerEnvironment, allowDisabled: true/);
  assert.match(integrity, /const callbackState = classifyStkQueryResult\(callback\.ResultCode\)/);
  assert.match(integrity, /providerState === "pending" \|\| callbackState !== providerState/);
  assert.match(integrity, /Unknown CheckoutRequestID/);
});

test("platform subscription checkouts use their own configured Daraja credentials for token and callback verification", () => {
  const checkout = read("services/tenantSubscriptionService.js");
  const integrity = read("middleware/mpesaCallbackIntegrity.js");
  assert.match(checkout, /generateAccessToken\(mpesaConfig\)/);
  assert.match(integrity, /subscriptionPayment && legacyConfigCheck\(\) \? legacyConfig/);
});

test("M-Pesa booking callback validates provider result, amount and receipt before completion", () => {
  const controller = read("controllers/mpesaController.js");
  assert.match(controller, /evaluateStkPaymentCallback\(stkCallback,payment\.amount\)/);
  assert.match(controller, /callback\.state==="provider_failed"/);
  assert.match(controller, /callback\.state==="invalid_amount"/);
  assert.match(controller, /callback\.state==="amount_mismatch"/);
  assert.match(controller, /callback\.state==="missing_receipt"/);
  assert.match(controller, /completeBookingPayment\(\{payment,booking/);
});

test("M-Pesa completion and failure paths use the central lifecycle service", () => {
  const controller = read("controllers/mpesaController.js");
  const lifecycle = read("services/paymentLifecycleService.js");
  assert.match(controller, /failBookingPayment/);
  assert.match(controller, /completeBookingPayment/);
  assert.match(lifecycle, /withTransaction/);
  assert.match(lifecycle, /alreadyCompleted/);
  assert.match(lifecycle, /Never allow overpayment/i);
});

test("M-Pesa provider identifiers are tenant-unique to prevent duplicate completion", () => {
  const payment = read("models/Payment.js");
  assert.match(payment, /tenantId: 1, checkoutRequestID: 1/);
  assert.match(payment, /tenantId: 1, mpesaReceiptNumber: 1/);
  assert.match(payment, /tenantId: 1, callbackEventId: 1/);
});

test("booking payment status and verification endpoints enforce booking ownership", () => {
  const controller = read("controllers/mpesaController.js");
  assert.match(controller, /canAccessBookingPayment\(payment\.booking,req\.user\)/);
  assert.match(controller, /canAccessBookingPayment\(booking,req\.user\)/);
});

test("invalid M-Pesa phone input is normalized before a payment attempt is created", () => {
  const controller = read("controllers/mpesaController.js");
  const normalizeAt = controller.indexOf("normalizePhoneNumber(phoneNumber");
  const createAt = controller.indexOf("payment = await Payment.create");
  assert.ok(normalizeAt >= 0 && createAt > normalizeAt);
});
