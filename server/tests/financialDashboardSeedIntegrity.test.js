import test from "node:test";
import assert from "node:assert/strict";
import { seededPaymentAmounts } from "../seeds/financialDashboardSeed.js";

test("financial dashboard seed derives paid and outstanding amounts from the payment state", () => {
  assert.deepEqual(seededPaymentAmounts("paid", 1000, 1000), { amountPaid: 1000, balance: 0 });
  assert.deepEqual(seededPaymentAmounts("partial", 1000, 450), { amountPaid: 450, balance: 550 });
  assert.deepEqual(seededPaymentAmounts("pending", 1000, 0), { amountPaid: 0, balance: 1000 });
  assert.deepEqual(seededPaymentAmounts("refunded", 1000, 1000), { amountPaid: 0, balance: 1000 });
});

test("financial dashboard seed clamps paid amounts to valid nonnegative totals", () => {
  assert.deepEqual(seededPaymentAmounts("paid", 1000, 1200), { amountPaid: 1000, balance: 0 });
  assert.deepEqual(seededPaymentAmounts("partial", 1000, -25), { amountPaid: 0, balance: 1000 });
});
