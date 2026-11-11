/**
 * Purpose: mpesa Callback Lifecycle Contract.test automated test. Main declarations: read.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import assert from "node:assert/strict";
// Load node:fs so this module can use its exported dependencies.
import fs from "node:fs";
// Load node:path so this module can use its exported dependencies.
import path from "node:path";
// Load node:test so this module can use its exported dependencies.
import test from "node:test";

// Declare root for use by the surrounding module or function.
const root = path.resolve(process.cwd());
// Declare read for use by the surrounding module or function.
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

// Perform the side effect or state update expressed on the following line.
test("M-Pesa callback is tenant-resolved and integrity-protected before processing", () => {
  // Declare routes for use by the surrounding module or function.
  const routes = read("routes/mpesaRoutes.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(routes, /router\.post\("\/callback", validateMpesaCallbackPayload, resolveMpesaCallbackTenant, verifyMpesaCallbackIntegrity, subscriptionMpesaCallback\)/);
});

// Perform the side effect or state update expressed on the following line.
test("failed and successful M-Pesa callbacks are both checked against Daraja", () => {
  // Declare integrity for use by the surrounding module or function.
  const integrity = read("middleware/mpesaCallbackIntegrity.js");
  // Perform the side effect or state update expressed on the following line.
  assert.doesNotMatch(integrity, /ResultCode\)\) !== 0\) return next\(\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(integrity, /providerQuery\(checkoutRequestID, paymentConfig \|\| config\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(integrity, /providerEnvironment, allowDisabled: true/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(integrity, /const callbackState = classifyStkQueryResult\(callback\.ResultCode\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(integrity, /providerState === "pending" \|\| callbackState !== providerState/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(integrity, /Unknown CheckoutRequestID/);
});

// Perform the side effect or state update expressed on the following line.
test("platform subscription checkouts use their own configured Daraja credentials for token and callback verification", () => {
  // Declare checkout for use by the surrounding module or function.
  const checkout = read("services/tenantSubscriptionService.js");
  // Declare integrity for use by the surrounding module or function.
  const integrity = read("middleware/mpesaCallbackIntegrity.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(checkout, /generateAccessToken\(mpesaConfig\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(integrity, /subscriptionPayment && legacyConfigCheck\(\) \? legacyConfig/);
});

// Perform the side effect or state update expressed on the following line.
test("M-Pesa booking callback validates provider result, amount and receipt before completion", () => {
  // Declare controller for use by the surrounding module or function.
  const controller = read("controllers/mpesaController.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /evaluateStkPaymentCallback\(stkCallback,payment\.amount\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /callback\.state==="provider_failed"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /callback\.state==="invalid_amount"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /callback\.state==="amount_mismatch"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /callback\.state==="missing_receipt"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /completeBookingPayment\(\{payment,booking/);
});

// Perform the side effect or state update expressed on the following line.
test("M-Pesa completion and failure paths use the central lifecycle service", () => {
  // Declare controller for use by the surrounding module or function.
  const controller = read("controllers/mpesaController.js");
  // Declare lifecycle for use by the surrounding module or function.
  const lifecycle = read("services/paymentLifecycleService.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /failBookingPayment/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /completeBookingPayment/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(lifecycle, /withTransaction/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(lifecycle, /alreadyCompleted/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(lifecycle, /Never allow overpayment/i);
});

// Perform the side effect or state update expressed on the following line.
test("M-Pesa provider identifiers are tenant-unique to prevent duplicate completion", () => {
  // Declare payment for use by the surrounding module or function.
  const payment = read("models/Payment.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(payment, /tenantId: 1, checkoutRequestID: 1/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(payment, /tenantId: 1, mpesaReceiptNumber: 1/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(payment, /tenantId: 1, callbackEventId: 1/);
});

// Perform the side effect or state update expressed on the following line.
test("booking payment status and verification endpoints enforce booking ownership", () => {
  // Declare controller for use by the surrounding module or function.
  const controller = read("controllers/mpesaController.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /canAccessBookingPayment\(payment\.booking,req\.user\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /canAccessBookingPayment\(booking,req\.user\)/);
});

// Perform the side effect or state update expressed on the following line.
test("invalid M-Pesa phone input is normalized before a payment attempt is created", () => {
  // Declare controller for use by the surrounding module or function.
  const controller = read("controllers/mpesaController.js");
  // Declare normalizeAt for use by the surrounding module or function.
  const normalizeAt = controller.indexOf("normalizePhoneNumber(phoneNumber");
  // Declare createAt for use by the surrounding module or function.
  const createAt = controller.indexOf("payment = await Payment.create");
  // Perform the side effect or state update expressed on the following line.
  assert.ok(normalizeAt >= 0 && createAt > normalizeAt);
});
