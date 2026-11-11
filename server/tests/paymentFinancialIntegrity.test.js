/**
 * Purpose: payment Financial Integrity.test automated test. Main declarations: read.
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
test("completed payments have a tenant-scoped operational GL posting path", () => {
  // Declare payment for use by the surrounding module or function.
  const payment = read("models/Payment.js");
  // Declare accounting for use by the surrounding module or function.
  const accounting = read("services/operationalAccountingService.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(payment, /postPaymentToLedger/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(payment, /this\.status === "completed" && this\.\$statusWasModified/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(accounting, /sourceType: "payment"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(accounting, /tenantId: payment\.tenantId/);
});

// Perform the side effect or state update expressed on the following line.
test("subscription M-Pesa callbacks cannot select a payment without the resolved tenant", () => {
  // Declare controller for use by the surrounding module or function.
  const controller = read("controllers/subscriptionMpesaCallbackController.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /const tenantId = resolvedTenantId\(req\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /SubscriptionPayment\.findOne\(\{ tenantId, checkoutRequestID \}\)/);
});

// Perform the side effect or state update expressed on the following line.
test("payment model keeps provider transaction identifiers tenant-unique", () => {
  // Declare payment for use by the surrounding module or function.
  const payment = read("models/Payment.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(payment, /tenantId: 1, provider: 1, transactionReference: 1/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(payment, /tenantId: 1, mpesaReceiptNumber: 1/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(payment, /tenantId: 1, callbackEventId: 1/);
});
