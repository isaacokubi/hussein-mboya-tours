/**
 * Purpose: tax Engine.test automated test. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import test from "node:test";
// Load node:assert/strict so this module can use its exported dependencies.
import assert from "node:assert/strict";
// Load ../services/taxEngineService.js so this module can use its exported dependencies.
import { calculateTax, TAX_CATEGORIES } from "../services/taxEngineService.js";

// Perform the side effect or state update expressed on the following line.
test("standard VAT exclusive calculation", () => {
  // Declare result for use by the surrounding module or function.
  const result = calculateTax({ amount: 1000, category: TAX_CATEGORIES.STANDARD, rate: 16, mode: "exclusive" });
  // Perform the side effect or state update expressed on the following line.
  assert.equal(result.taxableAmount, 1000);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(result.taxAmount, 160);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(result.totalAmount, 1160);
});

// Perform the side effect or state update expressed on the following line.
test("standard VAT inclusive calculation", () => {
  // Declare result for use by the surrounding module or function.
  const result = calculateTax({ amount: 1160, category: TAX_CATEGORIES.STANDARD, rate: 16, mode: "inclusive" });
  // Perform the side effect or state update expressed on the following line.
  assert.equal(result.netAmount, 1000);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(result.taxAmount, 160);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(result.totalAmount, 1160);
});

// Perform the side effect or state update expressed on the following line.
test("zero-rated and exempt supplies produce zero tax", () => {
  // Repeat the enclosed work for each required iteration.
  for (const category of [TAX_CATEGORIES.ZERO_RATED, TAX_CATEGORIES.EXEMPT, TAX_CATEGORIES.NON_VAT]) {
    // Declare result for use by the surrounding module or function.
    const result = calculateTax({ amount: 1000, category, rate: 16 });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(result.taxAmount, 0);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(result.totalAmount, 1000);
  }
});

// Perform the side effect or state update expressed on the following line.
test("discount is removed before VAT is calculated", () => {
  // Declare result for use by the surrounding module or function.
  const result = calculateTax({ amount: 1000, discount: 100, rate: 16 });
  // Perform the side effect or state update expressed on the following line.
  assert.equal(result.taxableAmount, 900);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(result.taxAmount, 144);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(result.totalAmount, 1044);
});

// Perform the side effect or state update expressed on the following line.
test("invalid tax inputs are rejected", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => calculateTax({ amount: 1000, rate: 101 }), /Invalid VAT rate/);
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => calculateTax({ amount: 100, discount: 101 }), /Invalid discount amount/);
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => calculateTax({ amount: 100, mode: "unknown" }), /Invalid tax pricing mode/);
});
