/**
 * Purpose: mpesa Callback Payload.test automated test. Main declarations: callback, successItems, statusResponse, statusPayment, statusBooking.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import assert from "node:assert/strict";
// Load node:test so this module can use its exported dependencies.
import test from "node:test";
// Load ../services/mpesaQueryService.js so this module can use its exported dependencies.
import { classifyStkQueryResult } from "../services/mpesaQueryService.js";
// Load ../services/mpesaCallbackPayload.js so this module can use its exported dependencies.
import { evaluateStkPaymentCallback, getCheckoutRequestId, getStkCallback, validateStkCallback } from "../services/mpesaCallbackPayload.js";
// Load ../middleware/mpesaCallbackIntegrity.js so this module can use its exported dependencies.
import { createVerifyMpesaCallbackIntegrity, validateMpesaCallbackPayload } from "../middleware/mpesaCallbackIntegrity.js";
// Load express so this module can use its exported dependencies.
import express from "express";
// Load node:stream so this module can use its exported dependencies.
import { Readable } from "node:stream";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { runWithTenant } from "../tenancy/context.js";
// Load ../utils/publicError.js so this module can use its exported dependencies.
import { publicErrorMessage } from "../utils/publicError.js";

// Declare callback for use by the surrounding module or function.
const callback = (ResultCode, items = [], extra = {}) => ({
  ResultCode,
  ResultDesc: "provider response",
  CheckoutRequestID: "ws_CO_test",
  CallbackMetadata: { Item: items },
  ...extra,
});
// Declare successItems for use by the surrounding module or function.
const successItems = (amount = 100) => [
  { Name: "Amount", Value: amount },
  { Name: "MpesaReceiptNumber", Value: "TEST-RECEIPT-1" },
  { Name: "PhoneNumber", Value: 254712345678 },
  { Name: "TransactionDate", Value: 20261029123456 },
];

// Perform the side effect or state update expressed on the following line.
test("M-Pesa cancellation, timeout, provider rejection, and delayed results classify safely", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.equal(classifyStkQueryResult(0), "completed");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(classifyStkQueryResult(1032), "cancelled");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(classifyStkQueryResult(1037), "cancelled");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(classifyStkQueryResult(1), "failed");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(classifyStkQueryResult(2001), "failed");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(classifyStkQueryResult(9999), "pending");
});

// Perform the side effect or state update expressed on the following line.
test("malformed and missing callback payloads fail structural validation", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.equal(getStkCallback(null), null);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(getStkCallback({ Body: {} }), null);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(getCheckoutRequestId({ ResultCode: 0 }), "");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(getCheckoutRequestId({ checkoutRequestId: " ws_CO_lower " }), "ws_CO_lower");
  // Perform the side effect or state update expressed on the following line.
  assert.match(validateStkCallback(null), /Malformed/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(validateStkCallback(callback(0, successItems(), { CheckoutRequestID: "" })), /CheckoutRequestID/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(validateStkCallback(callback("unexpected", successItems())), /ResultCode/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(validateStkCallback(callback("", successItems())), /ResultCode/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(validateStkCallback(callback(0)), /metadata/);
});

// Perform the side effect or state update expressed on the following line.
test("malformed STK callbacks are rejected before payment/provider lookups or downstream processing", async () => {
  // Declare calls for use by the surrounding module or function.
  const calls = { payment: 0, subscription: 0, provider: 0, next: 0 };
  // Declare middleware for use by the surrounding module or function.
  const middleware = createVerifyMpesaCallbackIntegrity({
    findPayment: async () => { calls.payment += 1; return null; },
    findSubscriptionPayment: async () => { calls.subscription += 1; return null; },
    providerQuery: async () => { calls.provider += 1; return { ResultCode: 0 }; },
  });
  // Repeat the enclosed work for each required iteration.
  for (const body of [null, {}, { Body: {} }, { Body: { stkCallback: { ResultCode: 0 } } }, { Body: { stkCallback: callback(0) } }]) {
    // Declare statusCode for use by the surrounding module or function.
    let statusCode = 200;
    // Declare responseBody for use by the surrounding module or function.
    let responseBody;
    // Declare response for use by the surrounding module or function.
    const response = { status(code) { statusCode = code; return this; }, json(bodyValue) { responseBody = bodyValue; return this; } };
    // Perform the side effect or state update expressed on the following line.
    await middleware({ body, tenantId: "tenant-test" }, response, () => { calls.next += 1; });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(statusCode, 400);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(responseBody.ResultCode, 1);
  }
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(calls, { payment: 0, subscription: 0, provider: 0, next: 0 });

  // Declare resolverCalls for use by the surrounding module or function.
  let resolverCalls = 0;
  // Declare earlyStatus for use by the surrounding module or function.
  let earlyStatus = 200;
  // Perform the side effect or state update expressed on the following line.
  await validateMpesaCallbackPayload(
    { body: { Body: { stkCallback: { CheckoutRequestID: "malformed-but-has-id", ResultCode: "bad" } } } },
    { status(code) { earlyStatus = code; return this; }, json() { return this; } },
    () => { resolverCalls += 1; },
  );
  // Perform the side effect or state update expressed on the following line.
  assert.equal(earlyStatus, 400);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(resolverCalls, 0, "tenant resolver, which performs the first payment lookup, must not run");
});

// Perform the side effect or state update expressed on the following line.
test("malformed JSON parser errors cannot reach callback lookups or payment processing", async () => {
  // Declare calls for use by the surrounding module or function.
  const calls = { payment: 0, subscription: 0, provider: 0, next: 0 };
  // Declare parser for use by the surrounding module or function.
  const parser = express.json();
  // Declare req for use by the surrounding module or function.
  const req = Readable.from(["{not-json"]);
  // Perform the side effect or state update expressed on the following line.
  req.method = "POST";
  // Perform the side effect or state update expressed on the following line.
  req.url = "/callback";
  // Perform the side effect or state update expressed on the following line.
  req.headers = { "content-type": "application/json", "content-length": "9" };
  // Declare parserError for use by the surrounding module or function.
  let parserError;
  // Perform the side effect or state update expressed on the following line.
  await new Promise((resolve) => parser(req, {}, (error) => { parserError = error; resolve(); }));
  // Perform the side effect or state update expressed on the following line.
  assert.equal(parserError?.status, 400);
  // Perform the side effect or state update expressed on the following line.
  assert.match(parserError?.message || "", /JSON|Unexpected|Expected/i);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(publicErrorMessage(parserError), "Invalid JSON request body.");
  // Perform the side effect or state update expressed on the following line.
  assert.doesNotMatch(publicErrorMessage(parserError), /not-json/);
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(calls, { payment: 0, subscription: 0, provider: 0, next: 0 });
});

// Perform the side effect or state update expressed on the following line.
test("valid callbacks query the tenant payment, verify provider state, then continue", async () => {
  // Declare calls for use by the surrounding module or function.
  const calls = [];
  // Declare middleware for use by the surrounding module or function.
  const middleware = createVerifyMpesaCallbackIntegrity({
    findPayment: async (filter) => { calls.push(["payment", filter]); return { _id: "p1" }; },
    findSubscriptionPayment: async () => { calls.push(["subscription"]); return null; },
    providerQuery: async (checkoutId) => { calls.push(["provider", checkoutId]); return { ResultCode: 0 }; },
  });
  // Declare nextCalled for use by the surrounding module or function.
  let nextCalled = false;
  // Perform the side effect or state update expressed on the following line.
  await runWithTenant({ tenantId: "tenant-test" }, () => middleware({ body: { Body: { stkCallback: callback(0, successItems()) } }, tenantId: "tenant-test" }, { status() { throw new Error("unexpected rejection"); }, json() { throw new Error("unexpected rejection"); } }, () => { nextCalled = true; }));
  // Perform the side effect or state update expressed on the following line.
  assert.equal(nextCalled, true);
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(calls.map(([name]) => name), ["payment", "subscription", "provider"]);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(calls[2][1], "ws_CO_test");
});

// Perform the side effect or state update expressed on the following line.
test("unknown callback references and provider timeouts never reach payment processing", async () => {
  // Repeat the enclosed work for each required iteration.
  for (const scenario of ["unknown", "timeout", "state-mismatch"]) {
    // Declare calls for use by the surrounding module or function.
    const calls = { payment: 0, subscription: 0, provider: 0, next: 0 };
    // Declare middleware for use by the surrounding module or function.
    const middleware = createVerifyMpesaCallbackIntegrity({
      findPayment: async () => { calls.payment += 1; return scenario === "unknown" ? null : { _id: "p1" }; },
      findSubscriptionPayment: async () => { calls.subscription += 1; return null; },
      providerQuery: async () => {
        // Perform the side effect or state update expressed on the following line.
        calls.provider += 1;
        // Check the condition (scenario === "timeout") and run the matching branch.
        if (scenario === "timeout") throw new Error("private provider detail");
        // Return the object assembled below to the caller.
        return { ResultCode: scenario === "state-mismatch" ? 1032 : 0 };
      },
    });
    // Declare statusCode for use by the surrounding module or function.
    let statusCode = 200;
    // Declare responseBody for use by the surrounding module or function.
    let responseBody;
    // Perform the side effect or state update expressed on the following line.
    await runWithTenant({ tenantId: "tenant-test" }, () => middleware(
      { body: { Body: { stkCallback: callback(0, successItems()) } }, tenantId: "tenant-test" },
      { status(code) { statusCode = code; return this; }, json(value) { responseBody = value; return this; } },
      () => { calls.next += 1; },
    ));
    // Perform the side effect or state update expressed on the following line.
    assert.equal(calls.next, 0);
    // Check the condition (scenario === "unknown") and run the matching branch.
    if (scenario === "unknown") {
      // Perform the side effect or state update expressed on the following line.
      assert.equal(statusCode, 400);
      // Perform the side effect or state update expressed on the following line.
      assert.equal(calls.provider, 0);
    } else if (scenario === "timeout") {
      // Perform the side effect or state update expressed on the following line.
      assert.equal(statusCode, 503);
      // Perform the side effect or state update expressed on the following line.
      assert.doesNotMatch(JSON.stringify(responseBody), /private provider detail/);
    } else {
      // Perform the side effect or state update expressed on the following line.
      assert.equal(statusCode, 409);
    }
    // Perform the side effect or state update expressed on the following line.
    assert.equal(calls.payment, 1);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(calls.subscription, 1);
  }
});

// Perform the side effect or state update expressed on the following line.
test("provider rejection and customer cancellation never qualify as payment success", () => {
  // Repeat the enclosed work for each required iteration.
  for (const code of [1, 1032, 1037, 2001]) {
    // Declare result for use by the surrounding module or function.
    const result = evaluateStkPaymentCallback(callback(code, successItems()), 100);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(result.state, "provider_failed");
    // Perform the side effect or state update expressed on the following line.
    assert.equal(result.resultCode, code);
  }
  // Declare unexpectedDescription for use by the surrounding module or function.
  const unexpectedDescription = evaluateStkPaymentCallback(callback(1, [], { ResultDesc: { secret: "private" } }), 100);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(unexpectedDescription.state, "provider_failed");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(unexpectedDescription.reason, "M-Pesa payment failed.");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(unexpectedDescription.reason.includes("private"), false);
});

// Perform the side effect or state update expressed on the following line.
test("missing, non-positive, or mismatched amounts and missing receipts are rejected", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.equal(evaluateStkPaymentCallback(callback(0), 100).state, "invalid_amount");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(evaluateStkPaymentCallback(callback(0, [{ Name: "Amount", Value: 0 }]), 100).state, "invalid_amount");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(evaluateStkPaymentCallback(callback(0, successItems(100.4)), 100).state, "invalid_amount");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(evaluateStkPaymentCallback(callback(0, successItems(99)), 100).state, "amount_mismatch");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(evaluateStkPaymentCallback(callback(0, successItems(101)), 100).state, "amount_mismatch");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(evaluateStkPaymentCallback(callback(0, [{ Name: "Amount", Value: 100 }]), 100).state, "missing_receipt");
});

// Perform the side effect or state update expressed on the following line.
test("a valid callback yields verified fields for the transactional payment lifecycle", () => {
  // Declare result for use by the surrounding module or function.
  const result = evaluateStkPaymentCallback(callback(0, successItems()), 100);
  // Perform the side effect or state update expressed on the following line.
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


// Load ../controllers/mpesaStatusController.js so this module can use its exported dependencies.
import { createMpesaStatusHandlers } from "../controllers/mpesaStatusController.js";

// Declare statusResponse for use by the surrounding module or function.
const statusResponse = () => {
  // Declare statusCode for use by the surrounding module or function.
  let statusCode = 200;
  // Declare body for use by the surrounding module or function.
  let body;
  // Return the object assembled below to the caller.
  return {
    res: {
      // Implement the status method for this class.
      status(code) { statusCode = code; return this; },
      // Implement the json method for this class.
      json(value) { body = value; return this; },
    },
    get statusCode() { return statusCode; },
    get body() { return body; },
  };
};

// Declare statusPayment for use by the surrounding module or function.
const statusPayment = (overrides = {}) => ({
  _id: "payment-1",
  booking: "booking-1",
  status: "pending",
  providerResultCode: "",
  saves: 0,
  // Implement the save method for this class.
  async save() { this.saves += 1; },
  ...overrides,
});

// Declare statusBooking for use by the surrounding module or function.
const statusBooking = (overrides = {}) => ({
  _id: "booking-1",
  user: "customer-1",
  status: "confirmed",
  paymentStatus: "pending",
  saves: 0,
  // Implement the save method for this class.
  async save() { this.saves += 1; },
  ...overrides,
});

// Declare makeStatusHandler for use by the surrounding module or function.
const makeStatusHandler = ({ payment = statusPayment(), booking = statusBooking(), providerResponse = { ResultCode: 0 }, failPayment } = {}) => {
  // Declare calls for use by the surrounding module or function.
  const calls = { tenant: 0, lookups: 0, provider: 0, failures: [] };
  // Declare handlers for use by the surrounding module or function.
  const handlers = createMpesaStatusHandlers({
    // Implement the requireTenant method for this class.
    requireTenant() { calls.tenant += 1; },
    // Implement the findPayment method for this class.
    async findPayment(req, checkoutRequestID) { calls.lookups += 1; calls.checkoutRequestID = checkoutRequestID; return payment; },
    // Implement the findBooking method for this class.
    async findBooking(req, foundPayment) { assert.equal(foundPayment, payment); return booking; },
    // Implement the queryProvider method for this class.
    async queryProvider(checkoutRequestID) { calls.provider += 1; calls.providerCheckoutRequestID = checkoutRequestID; return providerResponse; },
    // Implement the failPayment method for this class.
    async failPayment(args) { calls.failures.push(args); if (failPayment) await failPayment(args); },
    now: () => new Date("2026-11-10T12:00:00.000Z"),
  });
  // Return the object assembled below to the caller.
  return { queryMpesaPayment: handlers.queryMpesaPayment, calls, payment, booking };
};

// Perform the side effect or state update expressed on the following line.
test("M-Pesa status query keeps local payment pending until callback receipt metadata arrives", async () => {
  // Declare { queryMpesaPayment, calls, payment } for use by the surrounding module or function.
  const { queryMpesaPayment, calls, payment } = makeStatusHandler();
  // Declare state for use by the surrounding module or function.
  const state = statusResponse();
  // Perform the side effect or state update expressed on the following line.
  await queryMpesaPayment({
    params: { checkoutRequestId: " ws_CO_status " },
    user: { _id: "customer-1" },
  }, state.res, (error) => { throw error; });

  // Perform the side effect or state update expressed on the following line.
  assert.equal(state.statusCode, 200);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(state.body.data.providerStatus, "completed");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(state.body.data.providerQueried, true);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(payment.status, "pending");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(payment.providerResultCode, "0");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(payment.saves, 1);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(calls.providerCheckoutRequestID, "ws_CO_status");
});

// Perform the side effect or state update expressed on the following line.
test("M-Pesa cancellation query marks payment and eligible booking cancelled", async () => {
  // Declare { queryMpesaPayment, payment, booking } for use by the surrounding module or function.
  const { queryMpesaPayment, payment, booking } = makeStatusHandler({
    providerResponse: { ResultCode: 1032, ResultDesc: "Request cancelled by user" },
  });
  // Declare state for use by the surrounding module or function.
  const state = statusResponse();
  // Perform the side effect or state update expressed on the following line.
  await queryMpesaPayment({ params: { checkoutRequestId: "ws_CO_cancel" }, user: { _id: "customer-1" } }, state.res, (error) => { throw error; });

  // Perform the side effect or state update expressed on the following line.
  assert.equal(payment.status, "cancelled");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(payment.failureReason, "Request cancelled by user");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(booking.paymentStatus, "failed");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(booking.status, "cancelled");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(payment.saves, 1);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(booking.saves, 1);
});

// Perform the side effect or state update expressed on the following line.
test("M-Pesa failed query delegates booking failure to the central lifecycle service", async () => {
  // Declare { queryMpesaPayment, payment, booking, calls } for use by the surrounding module or function.
  const { queryMpesaPayment, payment, booking, calls } = makeStatusHandler({
    providerResponse: { ResultCode: 1, ResultDesc: "Provider rejected payment" },
  });
  // Declare state for use by the surrounding module or function.
  const state = statusResponse();
  // Perform the side effect or state update expressed on the following line.
  await queryMpesaPayment({ params: { checkoutRequestId: "ws_CO_failed" }, user: { _id: "customer-1" } }, state.res, (error) => { throw error; });

  // Perform the side effect or state update expressed on the following line.
  assert.equal(payment.saves, 1);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(calls.failures.length, 1);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(calls.failures[0].payment, payment);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(calls.failures[0].booking, booking);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(calls.failures[0].failureReason, "Provider rejected payment");
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(calls.failures[0].paymentData, { checkoutRequestID: "ws_CO_failed" });
});

// Perform the side effect or state update expressed on the following line.
test("terminal M-Pesa payments are returned without another provider query", async () => {
  // Declare { queryMpesaPayment, calls, payment } for use by the surrounding module or function.
  const { queryMpesaPayment, calls, payment } = makeStatusHandler({ payment: statusPayment({ status: "completed" }) });
  // Declare state for use by the surrounding module or function.
  const state = statusResponse();
  // Perform the side effect or state update expressed on the following line.
  await queryMpesaPayment({ params: { checkoutRequestId: "ws_CO_done" }, user: { _id: "customer-1" } }, state.res, (error) => { throw error; });

  // Perform the side effect or state update expressed on the following line.
  assert.equal(state.body.data.providerQueried, false);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(state.body.data.paymentStatus, "completed");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(calls.provider, 0);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(payment.saves, 0);
});

// Perform the side effect or state update expressed on the following line.
test("M-Pesa status query denies users who do not own the booking", async () => {
  // Declare { queryMpesaPayment, calls } for use by the surrounding module or function.
  const { queryMpesaPayment, calls } = makeStatusHandler();
  // Declare state for use by the surrounding module or function.
  const state = statusResponse();
  // Perform the side effect or state update expressed on the following line.
  await queryMpesaPayment({ params: { checkoutRequestId: "ws_CO_other" }, user: { _id: "customer-2" } }, state.res, (error) => { throw error; });

  // Perform the side effect or state update expressed on the following line.
  assert.equal(state.statusCode, 403);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(calls.provider, 0);
});

// Perform the side effect or state update expressed on the following line.
test("M-Pesa status query rejects blank checkout IDs before database or provider access", async () => {
  // Declare { queryMpesaPayment, calls } for use by the surrounding module or function.
  const { queryMpesaPayment, calls } = makeStatusHandler();
  // Declare state for use by the surrounding module or function.
  const state = statusResponse();
  // Perform the side effect or state update expressed on the following line.
  await queryMpesaPayment({ params: { checkoutRequestId: "  " }, user: { _id: "customer-1" } }, state.res, (error) => { throw error; });

  // Perform the side effect or state update expressed on the following line.
  assert.equal(state.statusCode, 400);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(calls.lookups, 0);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(calls.provider, 0);
});
