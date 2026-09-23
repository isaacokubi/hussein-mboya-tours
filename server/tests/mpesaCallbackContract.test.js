import test from "node:test";
import assert from "node:assert/strict";
import { mpesaCallbackEventId, parseMpesaStkCallback, validateSuccessfulMpesaCallback } from "../services/mpesaCallbackContract.js";

const successPayload = (overrides = {}) => ({ Body: { stkCallback: { ResultCode: 0, ResultDesc: "The service request is processed successfully.", MerchantRequestID: "MR-1", CheckoutRequestID: "ws_CO_123", CallbackMetadata: { Item: [ { Name: "Amount", Value: 2500 }, { Name: "MpesaReceiptNumber", Value: "ABC123XYZ" }, { Name: "PhoneNumber", Value: 254712345678 }, { Name: "TransactionDate", Value: 20260923120000 } ] }, ...overrides } } });

test("Phase 20 parses the canonical M-Pesa STK success payload", () => { const parsed = parseMpesaStkCallback(successPayload()); assert.equal(parsed.present, true); assert.equal(parsed.checkoutRequestID, "ws_CO_123"); assert.equal(parsed.resultCode, 0); assert.equal(parsed.paidAmount, 2500); assert.equal(parsed.receipt, "ABC123XYZ"); assert.equal(parsed.phoneNumber, "254712345678"); });

test("Phase 20 rejects failure, invalid amount, mismatch and missing receipt", () => { const base = parseMpesaStkCallback(successPayload()); assert.equal(validateSuccessfulMpesaCallback({ callbackData: {...base, resultCode: 1032, resultDescription: "Request cancelled by user."}, expectedAmount: 2500 }).ok, false); assert.equal(validateSuccessfulMpesaCallback({ callbackData: {...base, paidAmount: Number.NaN}, expectedAmount: 2500 }).reason, "invalid_paid_amount"); assert.equal(validateSuccessfulMpesaCallback({ callbackData: {...base, paidAmount: 2000}, expectedAmount: 2500 }).reason, "amount_mismatch"); assert.equal(validateSuccessfulMpesaCallback({ callbackData: {...base, receipt: ""}, expectedAmount: 2500 }).reason, "missing_receipt"); });

test("Phase 20 callback event identity is deterministic", () => { const parsed = parseMpesaStkCallback(successPayload()); const a = mpesaCallbackEventId(parsed); const b = mpesaCallbackEventId({...parsed}); assert.match(a, /^[a-f0-9]{64}$/); assert.equal(a, b); assert.notEqual(a, mpesaCallbackEventId({...parsed, receipt: "DIFFERENT"})); });
