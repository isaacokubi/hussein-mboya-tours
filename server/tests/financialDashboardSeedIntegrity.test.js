/**
 * Purpose: financial Dashboard Seed Integrity.test automated test. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import test from "node:test";
// Load node:assert/strict so this module can use its exported dependencies.
import assert from "node:assert/strict";
// Load ../seeds/financialDashboardSeed.js so this module can use its exported dependencies.
import { seededPaymentAmounts } from "../seeds/financialDashboardSeed.js";

// Perform the side effect or state update expressed on the following line.
test("financial dashboard seed derives paid and outstanding amounts from the payment state", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(seededPaymentAmounts("paid", 1000, 1000), { amountPaid: 1000, balance: 0 });
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(seededPaymentAmounts("partial", 1000, 450), { amountPaid: 450, balance: 550 });
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(seededPaymentAmounts("pending", 1000, 0), { amountPaid: 0, balance: 1000 });
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(seededPaymentAmounts("refunded", 1000, 1000), { amountPaid: 0, balance: 1000 });
});

// Perform the side effect or state update expressed on the following line.
test("financial dashboard seed clamps paid amounts to valid nonnegative totals", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(seededPaymentAmounts("paid", 1000, 1200), { amountPaid: 1000, balance: 0 });
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(seededPaymentAmounts("partial", 1000, -25), { amountPaid: 0, balance: 1000 });
});
