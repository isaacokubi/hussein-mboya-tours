import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(process.cwd());
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("M-Pesa callback is tenant-resolved and integrity-protected before processing", () => {
  const routes = read("routes/mpesaRoutes.js");
  assert.match(routes, /router\.post\("\/callback", resolveMpesaCallbackTenant, verifyMpesaCallbackIntegrity, subscriptionMpesaCallback\)/);
});

test("failed and successful M-Pesa callbacks are both checked against Daraja", () => {
  const integrity = read("middleware/mpesaCallbackIntegrity.js");
  assert.doesNotMatch(integrity, /ResultCode\)\) !== 0\) return next\(\)/);
  assert.match(integrity, /queryStkPush\(checkoutRequestID, config\)/);
  assert.match(integrity, /const callbackState = classifyStkQueryResult\(callback\.ResultCode\)/);
  assert.match(integrity, /providerState === "pending" \|\| callbackState !== providerState/);
  assert.match(integrity, /Unknown CheckoutRequestID/);
});

test("platform subscription checkouts use their own configured Daraja credentials for token and callback verification", () => {
  const checkout = read("services/tenantSubscriptionService.js");
  const integrity = read("middleware/mpesaCallbackIntegrity.js");
  assert.match(checkout, /generateAccessToken\(mpesaConfig\)/);
  assert.match(integrity, /subscriptionPayment && hasLegacyMpesaConfig\(\) \? mpesaConfig/);
});

test("M-Pesa booking callback validates provider result, amount and receipt before completion", () => {
  const controller = read("controllers/mpesaController.js");
  assert.match(controller, /if\(resultCode!==0\)\{await failBookingPayment/);
  assert.match(controller, /if\(!Number\.isFinite\(paidAmount\)\|\|paidAmount<=0\)\{await failBookingPayment/);
  assert.match(controller, /if\(Math\.round\(paidAmount\)!==Math\.round\(expectedAmount\)\)\{await failBookingPayment/);
  assert.match(controller, /if\(!mpesaReceiptNumber\)\{await failBookingPayment/);
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


test("checkout status endpoint exposes paymentStatus and legacy status from the same persisted Payment record", () => {
  const controller = read("controllers/mpesaController.js");
  assert.match(controller, /paymentStatus: payment\.status/);
  assert.match(controller, /status: payment\.status/);
  assert.match(controller, /mergeTenantFilter\(req, \{ \$or: \[\{ checkoutRequestID: checkoutRequestId \}, \{ checkoutRequestId \}\] \}\)/);
});

test("checkout polling unwraps the Axios response and nested API data envelope before reading the payment state", () => {
  const checkout = fs.readFileSync(path.resolve(root, "../client/src/pages/Checkout.jsx"), "utf8");
  assert.match(checkout, /const envelope = response\?\.data \|\| response \|\| \{\}/);
  assert.match(checkout, /const data = envelope\?\.data \|\| envelope/);
  assert.match(checkout, /data\?\.paymentStatus \|\| data\?\.status \|\| payment\?\.status/);
  for (const terminalState of ["completed", "failed", "cancelled"]) {
    assert.match(checkout, new RegExp(`status === "\\${terminalState}"`));
  }
});

test("subscription callback records a terminal failure or completes the subscription payment before activation", () => {
  const callback = read("controllers/subscriptionMpesaCallbackController.js");
  assert.match(callback, /payment\.status = "failed"/);
  assert.match(callback, /payment\.status = "completed"/);
  assert.match(callback, /activateTenantSubscription\(/);
  assert.match(callback, /Math\.round\(paidAmount\) !== Math\.round\(payment\.amount\)/);
});

test("hospitality payments route through their own lifecycle completion and failure handlers", () => {
  const callback = read("controllers/mpesaController.js");
  assert.match(callback, /completeHospitalityPayment\(/);
  assert.match(callback, /failHospitalityPayment\(/);
  assert.match(callback, /payment\.hospitalityBooking && payment\.hospitalityType/);
});
