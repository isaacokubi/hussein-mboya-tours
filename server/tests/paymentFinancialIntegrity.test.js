import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(process.cwd());
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("completed payments have a tenant-scoped operational GL posting path", () => {
  const payment = read("models/Payment.js");
  const accounting = read("services/operationalAccountingService.js");
  assert.match(payment, /postPaymentToLedger/);
  assert.match(payment, /this\.status === "completed" && this\.\$statusWasModified/);
  assert.match(accounting, /sourceType: "payment"/);
  assert.match(accounting, /tenantId: payment\.tenantId/);
});

test("subscription M-Pesa callbacks cannot select a payment without the resolved tenant", () => {
  const controller = read("controllers/subscriptionMpesaCallbackController.js");
  assert.match(controller, /const tenantId = resolvedTenantId\(req\)/);
  assert.match(controller, /SubscriptionPayment\.findOne\(\{ tenantId, checkoutRequestID \}\)/);
});

test("payment model keeps provider transaction identifiers tenant-unique", () => {
  const payment = read("models/Payment.js");
  assert.match(payment, /tenantId: 1, provider: 1, transactionReference: 1/);
  assert.match(payment, /tenantId: 1, mpesaReceiptNumber: 1/);
  assert.match(payment, /tenantId: 1, callbackEventId: 1/);
});
