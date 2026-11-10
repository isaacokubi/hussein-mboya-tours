import assert from "node:assert/strict";
import test from "node:test";
import { createMpesaRefundHandlers } from "../controllers/mpesaRefundController.js";

const response = () => {
  let body;
  return {
    res: { json(value) { body = value; return this; } },
    get body() { return body; },
  };
};

const makePayment = (overrides = {}) => ({
  refundReference: "AG_123456",
  refundStatus: "processing",
  refundRequestedAmount: 250,
  refundResponse: {},
  saves: 0,
  async save() { this.saves += 1; },
  ...overrides,
});

const makeHandlers = ({ payment = makePayment(), completeRefund } = {}) => {
  const calls = { tenant: 0, lookups: [], completions: [] };
  const handlers = createMpesaRefundHandlers({
    requireTenant() { calls.tenant += 1; },
    async findPayment(req, conversationId) {
      calls.lookups.push({ tenantId: req.tenantId, conversationId });
      return payment;
    },
    async completeRefund(args) {
      calls.completions.push(args);
      if (completeRefund) await completeRefund(args);
    },
  });
  return { ...handlers, calls, payment };
};

test("successful refund callback completes only a matching in-flight refund using its stored amount", async () => {
  const { mpesaRefundResult, calls, payment } = makeHandlers();
  const { res, body } = response();
  await mpesaRefundResult({
    tenantId: "tenant-a",
    body: { Result: { ConversationID: "AG_123456", ResultCode: 0, ResultDesc: "Success", Amount: 1 } },
  }, res);

  assert.equal(calls.tenant, 1);
  assert.deepEqual(calls.lookups, [{ tenantId: "tenant-a", conversationId: "AG_123456" }]);
  assert.equal(calls.completions.length, 1);
  assert.equal(calls.completions[0].refundAmount, 250);
  assert.equal(calls.completions[0].refundData.refundStatus, "completed");
  assert.equal(body.ResultCode, 0);
  assert.equal(payment.saves, 0);
});

test("callback with a different conversation reference cannot mutate a payment", async () => {
  const { mpesaRefundResult, payment, calls } = makeHandlers();
  const { res } = response();
  await mpesaRefundResult({
    tenantId: "tenant-a",
    body: { Result: { ConversationID: "AG_OTHER", ResultCode: 0 } },
  }, res);
  assert.equal(calls.completions.length, 0);
  assert.equal(payment.saves, 0);
});

test("late success after timeout or a completed refund is acknowledged without re-crediting", async (t) => {
  for (const refundStatus of ["failed", "completed", "none"]) {
    await t.test(refundStatus, async () => {
      const { mpesaRefundResult, payment, calls } = makeHandlers({
        payment: makePayment({ refundStatus, refundRequestedAmount: refundStatus === "failed" ? 0 : 250 }),
      });
      const { res } = response();
      await mpesaRefundResult({
        tenantId: "tenant-a",
        body: { Result: { ConversationID: "AG_123456", ResultCode: 0 } },
      }, res);
      assert.equal(calls.completions.length, 0);
      assert.equal(payment.saves, 0);
    });
  }
});

test("failed refund result only closes the active request and clears its requested amount", async () => {
  const { mpesaRefundResult, payment } = makeHandlers();
  const { res } = response();
  await mpesaRefundResult({
    tenantId: "tenant-a",
    body: { Result: { ConversationID: "AG_123456", ResultCode: 17, ResultDesc: "Rejected" } },
  }, res);
  assert.equal(payment.refundStatus, "failed");
  assert.equal(payment.refundRequestedAmount, 0);
  assert.equal(payment.refundResponse.ResultCode, 17);
  assert.equal(payment.saves, 1);
});

test("timeout callback only fails the matching active refund", async (t) => {
  for (const scenario of [
    { refundStatus: "processing", refundRequestedAmount: 250, expectedSaves: 1 },
    { refundStatus: "failed", refundRequestedAmount: 0, expectedSaves: 0 },
    { refundStatus: "completed", refundRequestedAmount: 250, expectedSaves: 0 },
  ]) {
    await t.test(JSON.stringify(scenario), async () => {
      const payment = makePayment(scenario);
      const { mpesaRefundTimeout } = makeHandlers({ payment });
      const { res } = response();
      await mpesaRefundTimeout({
        tenantId: "tenant-a",
        body: { Result: { ConversationID: "AG_123456", ResultCode: 1 } },
      }, res);
      assert.equal(payment.saves, scenario.expectedSaves);
      if (scenario.expectedSaves) {
        assert.equal(payment.refundStatus, "failed");
        assert.equal(payment.refundRequestedAmount, 0);
      }
    });
  }
});

test("missing or unknown refund references are acknowledged without lifecycle changes", async (t) => {
  for (const result of [undefined, {}, { ResultCode: 0 }]) {
    await t.test(JSON.stringify(result), async () => {
      const { mpesaRefundResult, calls } = makeHandlers();
      const { res } = response();
      await mpesaRefundResult({ tenantId: "tenant-a", body: { Result: result } }, res);
      assert.equal(calls.lookups.length, result?.ConversationID ? 1 : 0);
      assert.equal(calls.completions.length, 0);
    });
  }
});
