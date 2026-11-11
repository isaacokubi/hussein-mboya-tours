/**
 * Purpose: mpesa Refund Safety.test automated test. Main declarations: read, response, makePayment, makeHandlers.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import assert from "node:assert/strict";
// Load node:fs so this module can use its exported dependencies.
import fs from "node:fs";
// Load node:path so this module can use its exported dependencies.
import path from "node:path";
// Load node:test so this module can use its exported dependencies.
import test from "node:test";
// Load ../services/mpesaRefundService.js so this module can use its exported dependencies.
import { buildRefundCallbackUrls } from "../services/mpesaRefundService.js";
// Load ../controllers/mpesaRefundController.js so this module can use its exported dependencies.
import { createMpesaRefundHandlers } from "../controllers/mpesaRefundController.js";

// Declare root for use by the surrounding module or function.
const root = path.resolve(process.cwd());
// Declare read for use by the surrounding module or function.
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

// Perform the side effect or state update expressed on the following line.
test("M-Pesa refund callbacks are derived from the callback route without duplicating /callback", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(
    buildRefundCallbackUrls("https://example.test/api/mpesa/callback"),
    {
      resultUrl: "https://example.test/api/mpesa/refund/result",
      timeoutUrl: "https://example.test/api/mpesa/refund/timeout",
    },
  );
});

// Perform the side effect or state update expressed on the following line.
test("M-Pesa refund service uses Daraja TransactionReversal, not B2C disbursement", () => {
  // Declare service for use by the surrounding module or function.
  const service = read("services/mpesaRefundService.js");
  // Declare config for use by the surrounding module or function.
  const config = read("config/mpesa.js");

  // Perform the side effect or state update expressed on the following line.
  assert.match(config, /reversal:/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(config, /\/mpesa\/reversal\/v1\/request/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(service, /urls\.reversal/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(service, /CommandID: "TransactionReversal"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(service, /TransactionID: originalTransactionId/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(service, /ReceiverPartyType: "11"/);
  // Perform the side effect or state update expressed on the following line.
  assert.doesNotMatch(service, /urls\.b2c/);
  // Perform the side effect or state update expressed on the following line.
  assert.doesNotMatch(service, /CommandID: "BusinessPayment"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(service, /ResultURL: resultUrl/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(service, /QueueTimeOutURL: timeoutUrl/);
});


// Perform the side effect or state update expressed on the following line.
test("M-Pesa refund flow never falls back to a checkout request ID or local payment ID", () => {
  // Declare controller for use by the surrounding module or function.
  const controller = read("controllers/adminPaymentController.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /const transactionId = String\(payment\.mpesaReceiptNumber \|\| payment\.transactionId \|\| ""\)\.trim\(\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.doesNotMatch(controller, /payment\.checkoutRequestID \|\| payment\._id/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /Payment\.findOneAndUpdate/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /refundStatus: \{ \$in: \[["]none["], ["']failed["']\] \}/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /refundStatus: "processing"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /refundStatus: "failed"/);
});

// Perform the side effect or state update expressed on the following line.
test("admin refund endpoints fail closed for non-M-Pesa payments", () => {
  // Declare controller for use by the surrounding module or function.
  const controller = read("controllers/adminPaymentController.js");
  // Perform the side effect or state update expressed on the following line.
  assert.equal((controller.match(/Automated refunds are not available for this payment method/g) || []).length, 2);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /payment: updatedPayment, booking/);
});

// Perform the side effect or state update expressed on the following line.
test("Invoice records require tenant ownership", () => {
  // Declare invoice for use by the surrounding module or function.
  const invoice = read("models/Invoice.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(invoice, /tenantId: \{ type: mongoose\.Schema\.Types\.ObjectId, ref: "Organization", required: true, index: true \}/);
});


// Declare response for use by the surrounding module or function.
const response = () => {
  // Declare body for use by the surrounding module or function.
  let body;
  // Return the object assembled below to the caller.
  return {
    res: { json(value) { body = value; return this; } },
    get body() { return body; },
  };
};

// Declare makePayment for use by the surrounding module or function.
const makePayment = (overrides = {}) => ({
  refundReference: "AG_123456",
  refundStatus: "processing",
  refundRequestedAmount: 250,
  refundResponse: {},
  saves: 0,
  // Implement the save method for this class.
  async save() { this.saves += 1; },
  ...overrides,
});

// Declare makeHandlers for use by the surrounding module or function.
const makeHandlers = ({ payment = makePayment(), completeRefund } = {}) => {
  // Declare calls for use by the surrounding module or function.
  const calls = { tenant: 0, lookups: [], completions: [] };
  // Declare handlers for use by the surrounding module or function.
  const handlers = createMpesaRefundHandlers({
    // Implement the requireTenant method for this class.
    requireTenant() { calls.tenant += 1; },
    // Implement the findPayment method for this class.
    async findPayment(req, conversationId) {
      // Perform the side effect or state update expressed on the following line.
      calls.lookups.push({ tenantId: req.tenantId, conversationId });
      // Return the value of payment to the caller.
      return payment;
    },
    // Implement the completeRefund method for this class.
    async completeRefund(args) {
      // Perform the side effect or state update expressed on the following line.
      calls.completions.push(args);
      // Check the condition (completeRefund) and run the matching branch.
      if (completeRefund) await completeRefund(args);
    },
  });
  // Return the object assembled below to the caller.
  return { ...handlers, calls, payment };
};

// Perform the side effect or state update expressed on the following line.
test("successful refund callback completes only a matching in-flight refund using its stored amount", async () => {
  // Declare { mpesaRefundResult, calls, payment } for use by the surrounding module or function.
  const { mpesaRefundResult, calls, payment } = makeHandlers();
  // Declare state for use by the surrounding module or function.
  const state = response();
  // Declare { res } for use by the surrounding module or function.
  const { res } = state;
  // Perform the side effect or state update expressed on the following line.
  await mpesaRefundResult({
    tenantId: "tenant-a",
    body: { Result: { ConversationID: "AG_123456", ResultCode: 0, ResultDesc: "Success", Amount: 1 } },
  }, res);

  // Perform the side effect or state update expressed on the following line.
  assert.equal(calls.tenant, 1);
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(calls.lookups, [{ tenantId: "tenant-a", conversationId: "AG_123456" }]);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(calls.completions.length, 1);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(calls.completions[0].refundAmount, 250);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(calls.completions[0].refundData.refundStatus, "completed");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(state.body.ResultCode, 0);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(payment.saves, 0);
});

// Perform the side effect or state update expressed on the following line.
test("callback with a different conversation reference cannot mutate a payment", async () => {
  // Declare { mpesaRefundResult, payment, calls } for use by the surrounding module or function.
  const { mpesaRefundResult, payment, calls } = makeHandlers();
  // Declare { res } for use by the surrounding module or function.
  const { res } = response();
  // Perform the side effect or state update expressed on the following line.
  await mpesaRefundResult({
    tenantId: "tenant-a",
    body: { Result: { ConversationID: "AG_OTHER", ResultCode: 0 } },
  }, res);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(calls.completions.length, 0);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(payment.saves, 0);
});

// Perform the side effect or state update expressed on the following line.
test("late success after timeout or a completed refund is acknowledged without re-crediting", async (t) => {
  // Repeat the enclosed work for each required iteration.
  for (const refundStatus of ["failed", "completed", "none"]) {
    // Perform the side effect or state update expressed on the following line.
    await t.test(refundStatus, async () => {
      // Declare { mpesaRefundResult, payment, calls } for use by the surrounding module or function.
      const { mpesaRefundResult, payment, calls } = makeHandlers({
        payment: makePayment({ refundStatus, refundRequestedAmount: refundStatus === "failed" ? 0 : 250 }),
      });
      // Declare { res } for use by the surrounding module or function.
      const { res } = response();
      // Perform the side effect or state update expressed on the following line.
      await mpesaRefundResult({
        tenantId: "tenant-a",
        body: { Result: { ConversationID: "AG_123456", ResultCode: 0 } },
      }, res);
      // Perform the side effect or state update expressed on the following line.
      assert.equal(calls.completions.length, 0);
      // Perform the side effect or state update expressed on the following line.
      assert.equal(payment.saves, 0);
    });
  }
});

// Perform the side effect or state update expressed on the following line.
test("failed refund result only closes the active request and clears its requested amount", async () => {
  // Declare { mpesaRefundResult, payment } for use by the surrounding module or function.
  const { mpesaRefundResult, payment } = makeHandlers();
  // Declare { res } for use by the surrounding module or function.
  const { res } = response();
  // Perform the side effect or state update expressed on the following line.
  await mpesaRefundResult({
    tenantId: "tenant-a",
    body: { Result: { ConversationID: "AG_123456", ResultCode: 17, ResultDesc: "Rejected" } },
  }, res);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(payment.refundStatus, "failed");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(payment.refundRequestedAmount, 0);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(payment.refundResponse.ResultCode, 17);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(payment.saves, 1);
});

// Perform the side effect or state update expressed on the following line.
test("timeout callback only fails the matching active refund", async (t) => {
  // Repeat the enclosed work for each required iteration.
  for (const scenario of [
    { refundStatus: "processing", refundRequestedAmount: 250, expectedSaves: 1 },
    { refundStatus: "failed", refundRequestedAmount: 0, expectedSaves: 0 },
    { refundStatus: "completed", refundRequestedAmount: 250, expectedSaves: 0 },
  ]) {
    // Perform the side effect or state update expressed on the following line.
    await t.test(JSON.stringify(scenario), async () => {
      // Declare payment for use by the surrounding module or function.
      const payment = makePayment(scenario);
      // Declare { mpesaRefundTimeout } for use by the surrounding module or function.
      const { mpesaRefundTimeout } = makeHandlers({ payment });
      // Declare { res } for use by the surrounding module or function.
      const { res } = response();
      // Perform the side effect or state update expressed on the following line.
      await mpesaRefundTimeout({
        tenantId: "tenant-a",
        body: { Result: { ConversationID: "AG_123456", ResultCode: 1 } },
      }, res);
      // Perform the side effect or state update expressed on the following line.
      assert.equal(payment.saves, scenario.expectedSaves);
      // Check the condition (scenario.expectedSaves) and run the matching branch.
      if (scenario.expectedSaves) {
        // Perform the side effect or state update expressed on the following line.
        assert.equal(payment.refundStatus, "failed");
        // Perform the side effect or state update expressed on the following line.
        assert.equal(payment.refundRequestedAmount, 0);
      }
    });
  }
});

// Perform the side effect or state update expressed on the following line.
test("missing or unknown refund references are acknowledged without lifecycle changes", async (t) => {
  // Repeat the enclosed work for each required iteration.
  for (const result of [undefined, {}, { ResultCode: 0 }]) {
    // Perform the side effect or state update expressed on the following line.
    await t.test(JSON.stringify(result), async () => {
      // Declare { mpesaRefundResult, calls } for use by the surrounding module or function.
      const { mpesaRefundResult, calls } = makeHandlers();
      // Declare { res } for use by the surrounding module or function.
      const { res } = response();
      // Perform the side effect or state update expressed on the following line.
      await mpesaRefundResult({ tenantId: "tenant-a", body: { Result: result } }, res);
      // Perform the side effect or state update expressed on the following line.
      assert.equal(calls.lookups.length, result?.ConversationID ? 1 : 0);
      // Perform the side effect or state update expressed on the following line.
      assert.equal(calls.completions.length, 0);
    });
  }
});
