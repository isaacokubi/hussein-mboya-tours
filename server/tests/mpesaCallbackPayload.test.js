import assert from "node:assert/strict";
import test from "node:test";
import { classifyStkQueryResult } from "../services/mpesaQueryService.js";
import { evaluateStkPaymentCallback, getCheckoutRequestId, getStkCallback, validateStkCallback } from "../services/mpesaCallbackPayload.js";
import { createVerifyMpesaCallbackIntegrity, validateMpesaCallbackPayload } from "../middleware/mpesaCallbackIntegrity.js";
import express from "express";
import { Readable } from "node:stream";
import { runWithTenant } from "../tenancy/context.js";
import { publicErrorMessage } from "../utils/publicError.js";

const callback = (ResultCode, items = [], extra = {}) => ({
  ResultCode,
  ResultDesc: "provider response",
  CheckoutRequestID: "ws_CO_test",
  CallbackMetadata: { Item: items },
  ...extra,
});
const successItems = (amount = 100) => [
  { Name: "Amount", Value: amount },
  { Name: "MpesaReceiptNumber", Value: "TEST-RECEIPT-1" },
  { Name: "PhoneNumber", Value: 254712345678 },
  { Name: "TransactionDate", Value: 20261029123456 },
];

test("M-Pesa cancellation, timeout, provider rejection, and delayed results classify safely", () => {
  assert.equal(classifyStkQueryResult(0), "completed");
  assert.equal(classifyStkQueryResult(1032), "cancelled");
  assert.equal(classifyStkQueryResult(1037), "cancelled");
  assert.equal(classifyStkQueryResult(1), "failed");
  assert.equal(classifyStkQueryResult(2001), "failed");
  assert.equal(classifyStkQueryResult(9999), "pending");
});

test("malformed and missing callback payloads fail structural validation", () => {
  assert.equal(getStkCallback(null), null);
  assert.equal(getStkCallback({ Body: {} }), null);
  assert.equal(getCheckoutRequestId({ ResultCode: 0 }), "");
  assert.equal(getCheckoutRequestId({ checkoutRequestId: " ws_CO_lower " }), "ws_CO_lower");
  assert.match(validateStkCallback(null), /Malformed/);
  assert.match(validateStkCallback(callback(0, successItems(), { CheckoutRequestID: "" })), /CheckoutRequestID/);
  assert.match(validateStkCallback(callback("unexpected", successItems())), /ResultCode/);
  assert.match(validateStkCallback(callback("", successItems())), /ResultCode/);
  assert.match(validateStkCallback(callback(0)), /metadata/);
});

test("malformed STK callbacks are rejected before payment/provider lookups or downstream processing", async () => {
  const calls = { payment: 0, subscription: 0, provider: 0, next: 0 };
  const middleware = createVerifyMpesaCallbackIntegrity({
    findPayment: async () => { calls.payment += 1; return null; },
    findSubscriptionPayment: async () => { calls.subscription += 1; return null; },
    providerQuery: async () => { calls.provider += 1; return { ResultCode: 0 }; },
  });
  for (const body of [null, {}, { Body: {} }, { Body: { stkCallback: { ResultCode: 0 } } }, { Body: { stkCallback: callback(0) } }]) {
    let statusCode = 200;
    let responseBody;
    const response = { status(code) { statusCode = code; return this; }, json(bodyValue) { responseBody = bodyValue; return this; } };
    await middleware({ body, tenantId: "tenant-test" }, response, () => { calls.next += 1; });
    assert.equal(statusCode, 400);
    assert.equal(responseBody.ResultCode, 1);
  }
  assert.deepEqual(calls, { payment: 0, subscription: 0, provider: 0, next: 0 });

  let resolverCalls = 0;
  let earlyStatus = 200;
  await validateMpesaCallbackPayload(
    { body: { Body: { stkCallback: { CheckoutRequestID: "malformed-but-has-id", ResultCode: "bad" } } } },
    { status(code) { earlyStatus = code; return this; }, json() { return this; } },
    () => { resolverCalls += 1; },
  );
  assert.equal(earlyStatus, 400);
  assert.equal(resolverCalls, 0, "tenant resolver, which performs the first payment lookup, must not run");
});

test("malformed JSON parser errors cannot reach callback lookups or payment processing", async () => {
  const calls = { payment: 0, subscription: 0, provider: 0, next: 0 };
  const parser = express.json();
  const req = Readable.from(["{not-json"]);
  req.method = "POST";
  req.url = "/callback";
  req.headers = { "content-type": "application/json", "content-length": "9" };
  let parserError;
  await new Promise((resolve) => parser(req, {}, (error) => { parserError = error; resolve(); }));
  assert.equal(parserError?.status, 400);
  assert.match(parserError?.message || "", /JSON|Unexpected|Expected/i);
  assert.equal(publicErrorMessage(parserError), "Invalid JSON request body.");
  assert.doesNotMatch(publicErrorMessage(parserError), /not-json/);
  assert.deepEqual(calls, { payment: 0, subscription: 0, provider: 0, next: 0 });
});

test("valid callbacks query the tenant payment, verify provider state, then continue", async () => {
  const calls = [];
  const middleware = createVerifyMpesaCallbackIntegrity({
    findPayment: async (filter) => { calls.push(["payment", filter]); return { _id: "p1" }; },
    findSubscriptionPayment: async () => { calls.push(["subscription"]); return null; },
    providerQuery: async (checkoutId) => { calls.push(["provider", checkoutId]); return { ResultCode: 0 }; },
  });
  let nextCalled = false;
  await runWithTenant({ tenantId: "tenant-test" }, () => middleware({ body: { Body: { stkCallback: callback(0, successItems()) } }, tenantId: "tenant-test" }, { status() { throw new Error("unexpected rejection"); }, json() { throw new Error("unexpected rejection"); } }, () => { nextCalled = true; }));
  assert.equal(nextCalled, true);
  assert.deepEqual(calls.map(([name]) => name), ["payment", "subscription", "provider"]);
  assert.equal(calls[2][1], "ws_CO_test");
});

test("unknown callback references and provider timeouts never reach payment processing", async () => {
  for (const scenario of ["unknown", "timeout", "state-mismatch"]) {
    const calls = { payment: 0, subscription: 0, provider: 0, next: 0 };
    const middleware = createVerifyMpesaCallbackIntegrity({
      findPayment: async () => { calls.payment += 1; return scenario === "unknown" ? null : { _id: "p1" }; },
      findSubscriptionPayment: async () => { calls.subscription += 1; return null; },
      providerQuery: async () => {
        calls.provider += 1;
        if (scenario === "timeout") throw new Error("private provider detail");
        return { ResultCode: scenario === "state-mismatch" ? 1032 : 0 };
      },
    });
    let statusCode = 200;
    let responseBody;
    await runWithTenant({ tenantId: "tenant-test" }, () => middleware(
      { body: { Body: { stkCallback: callback(0, successItems()) } }, tenantId: "tenant-test" },
      { status(code) { statusCode = code; return this; }, json(value) { responseBody = value; return this; } },
      () => { calls.next += 1; },
    ));
    assert.equal(calls.next, 0);
    if (scenario === "unknown") {
      assert.equal(statusCode, 400);
      assert.equal(calls.provider, 0);
    } else if (scenario === "timeout") {
      assert.equal(statusCode, 503);
      assert.doesNotMatch(JSON.stringify(responseBody), /private provider detail/);
    } else {
      assert.equal(statusCode, 409);
    }
    assert.equal(calls.payment, 1);
    assert.equal(calls.subscription, 1);
  }
});

test("provider rejection and customer cancellation never qualify as payment success", () => {
  for (const code of [1, 1032, 1037, 2001]) {
    const result = evaluateStkPaymentCallback(callback(code, successItems()), 100);
    assert.equal(result.state, "provider_failed");
    assert.equal(result.resultCode, code);
  }
  const unexpectedDescription = evaluateStkPaymentCallback(callback(1, [], { ResultDesc: { secret: "private" } }), 100);
  assert.equal(unexpectedDescription.state, "provider_failed");
  assert.equal(unexpectedDescription.reason, "M-Pesa payment failed.");
  assert.equal(unexpectedDescription.reason.includes("private"), false);
});

test("missing, non-positive, or mismatched amounts and missing receipts are rejected", () => {
  assert.equal(evaluateStkPaymentCallback(callback(0), 100).state, "invalid_amount");
  assert.equal(evaluateStkPaymentCallback(callback(0, [{ Name: "Amount", Value: 0 }]), 100).state, "invalid_amount");
  assert.equal(evaluateStkPaymentCallback(callback(0, successItems(100.4)), 100).state, "invalid_amount");
  assert.equal(evaluateStkPaymentCallback(callback(0, successItems(99)), 100).state, "amount_mismatch");
  assert.equal(evaluateStkPaymentCallback(callback(0, successItems(101)), 100).state, "amount_mismatch");
  assert.equal(evaluateStkPaymentCallback(callback(0, [{ Name: "Amount", Value: 100 }]), 100).state, "missing_receipt");
});

test("a valid callback yields verified fields for the transactional payment lifecycle", () => {
  const result = evaluateStkPaymentCallback(callback(0, successItems()), 100);
  assert.deepEqual(result, {
    state: "completed",
    resultCode: 0,
    paidAmount: 100,
    expectedAmount: 100,
    receiptNumber: "TEST-RECEIPT-1",
    phoneNumber: 254712345678,
    transactionDate: 20261029123456,
  });
});
