import assert from "node:assert/strict";
import test from "node:test";
import { resolveMpesaPaymentAmount } from "../utils/mpesaPaymentAmount.js";

test("an omitted M-Pesa amount means the full valid outstanding balance", () => {
  assert.equal(resolveMpesaPaymentAmount(undefined, 5400), 5400);
  assert.equal(resolveMpesaPaymentAmount("", 5400), 5400);
});

test("a requested M-Pesa amount must be a whole KES value within the balance", () => {
  assert.equal(resolveMpesaPaymentAmount("1200", 5400), 1200);
  for (const amount of ["not-a-number", 0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, 5401]) {
    assert.throws(
      () => resolveMpesaPaymentAmount(amount, 5400),
      (error) => error.status === 400 && error.code === "INVALID_MPESA_AMOUNT",
    );
  }
});

test("an invalid stored KES balance cannot be used as an STK amount", () => {
  for (const balance of [0, -100, 100.5, Number.MAX_SAFE_INTEGER + 1, "not-a-number"]) {
    assert.throws(
      () => resolveMpesaPaymentAmount(undefined, balance),
      (error) => error.status === 400 && error.code === "INVALID_MPESA_AMOUNT",
    );
  }
});
