import test from "node:test";
import assert from "node:assert/strict";
import { calculateTax, TAX_CATEGORIES } from "../services/taxEngineService.js";

test("standard VAT exclusive calculation", () => {
  const result = calculateTax({ amount: 1000, category: TAX_CATEGORIES.STANDARD, rate: 16, mode: "exclusive" });
  assert.equal(result.taxableAmount, 1000);
  assert.equal(result.taxAmount, 160);
  assert.equal(result.totalAmount, 1160);
});

test("standard VAT inclusive calculation", () => {
  const result = calculateTax({ amount: 1160, category: TAX_CATEGORIES.STANDARD, rate: 16, mode: "inclusive" });
  assert.equal(result.netAmount, 1000);
  assert.equal(result.taxAmount, 160);
  assert.equal(result.totalAmount, 1160);
});

test("zero-rated and exempt supplies produce zero tax", () => {
  for (const category of [TAX_CATEGORIES.ZERO_RATED, TAX_CATEGORIES.EXEMPT, TAX_CATEGORIES.NON_VAT]) {
    const result = calculateTax({ amount: 1000, category, rate: 16 });
    assert.equal(result.taxAmount, 0);
    assert.equal(result.totalAmount, 1000);
  }
});

test("discount is removed before VAT is calculated", () => {
  const result = calculateTax({ amount: 1000, discount: 100, rate: 16 });
  assert.equal(result.taxableAmount, 900);
  assert.equal(result.taxAmount, 144);
  assert.equal(result.totalAmount, 1044);
});

test("invalid tax inputs are rejected", () => {
  assert.throws(() => calculateTax({ amount: 1000, rate: 101 }), /Invalid VAT rate/);
  assert.throws(() => calculateTax({ amount: 100, discount: 101 }), /Invalid discount amount/);
  assert.throws(() => calculateTax({ amount: 100, mode: "unknown" }), /Invalid tax pricing mode/);
});
