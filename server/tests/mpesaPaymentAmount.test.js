/**
 * Purpose: mpesa Payment Amount.test automated test. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import assert from "node:assert/strict";
// Load node:test so this module can use its exported dependencies.
import test from "node:test";
// Load ../utils/mpesaPaymentAmount.js so this module can use its exported dependencies.
import { resolveMpesaPaymentAmount } from "../utils/mpesaPaymentAmount.js";

// Perform the side effect or state update expressed on the following line.
test("an omitted M-Pesa amount means the full valid outstanding balance", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.equal(resolveMpesaPaymentAmount(undefined, 5400), 5400);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(resolveMpesaPaymentAmount("", 5400), 5400);
});

// Perform the side effect or state update expressed on the following line.
test("a requested M-Pesa amount must be a whole KES value within the balance", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.equal(resolveMpesaPaymentAmount("1200", 5400), 1200);
  // Repeat the enclosed work for each required iteration.
  for (const amount of ["not-a-number", 0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, 5401]) {
    // Perform the side effect or state update expressed on the following line.
    assert.throws(
      () => resolveMpesaPaymentAmount(amount, 5400),
      (error) => error.status === 400 && error.code === "INVALID_MPESA_AMOUNT",
    );
  }
});

// Perform the side effect or state update expressed on the following line.
test("an invalid stored KES balance cannot be used as an STK amount", () => {
  // Repeat the enclosed work for each required iteration.
  for (const balance of [0, -100, 100.5, Number.MAX_SAFE_INTEGER + 1, "not-a-number"]) {
    // Perform the side effect or state update expressed on the following line.
    assert.throws(
      () => resolveMpesaPaymentAmount(undefined, balance),
      (error) => error.status === 400 && error.code === "INVALID_MPESA_AMOUNT",
    );
  }
});
