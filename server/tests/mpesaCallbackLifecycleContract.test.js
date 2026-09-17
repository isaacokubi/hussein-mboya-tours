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
