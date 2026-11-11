/**
 * Purpose: tour Domain Integrity.test automated test. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import test from "node:test";
// Load node:assert/strict so this module can use its exported dependencies.
import assert from "node:assert/strict";
// Load ../utils/bookingPricing.js so this module can use its exported dependencies.
import { calculateBookingAmounts } from "../utils/bookingPricing.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";

// Perform the side effect or state update expressed on the following line.
test("percentage discounts are calculated against the subtotal", () => {
  // Declare result for use by the surrounding module or function.
  const result = calculateBookingAmounts({ price: 100, discount: 10, depositRequired: 100 }, 10);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(result.subtotal, 1000);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(result.discountAmount, 100);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(result.totalAmount, 900);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(result.depositAmount, 100);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(result.amountPaid, 0);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(result.balanceAmount, 900);
});

// Perform the side effect or state update expressed on the following line.
test("traveler pricing rule overrides global discount", () => {
  // Declare result for use by the surrounding module or function.
  const result = calculateBookingAmounts({
    price: 1000,
    discount: 5,
    pricingRules: [{ minTravelers: 5, maxTravelers: 10, discount: 15 }],
    depositRequired: 20,
    depositType: "percentage",
  }, 5);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(result.discountPercentage, 15);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(result.discountAmount, 750);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(result.totalAmount, 4250);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(result.depositAmount, 850);
});

// Perform the side effect or state update expressed on the following line.
test("discountPrice is treated as an explicit unit-price override", () => {
  // Declare result for use by the surrounding module or function.
  const result = calculateBookingAmounts({ price: 1000, discountPrice: 800, discount: 0, depositRequired: 0 }, 2);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(result.pricePerTraveler, 800);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(result.subtotal, 1600);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(result.totalAmount, 1600);
});

// Perform the side effect or state update expressed on the following line.
test("booking schema separates configured deposit from actual paid amount", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.ok(Booking.schema.path("depositAmount"));
  // Perform the side effect or state update expressed on the following line.
  assert.ok(Booking.schema.path("amountPaid"));
  // Declare booking for use by the surrounding module or function.
  const booking = new Booking({ totalAmount: 1000, depositAmount: 100, amountPaid: 250 });
  // Perform the side effect or state update expressed on the following line.
  assert.equal(booking.remainingBalance, 750);
});

// Perform the side effect or state update expressed on the following line.
test("tour schema persists deposit mode and canonical duration", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.ok(Tour.schema.path("depositType"));
  // Perform the side effect or state update expressed on the following line.
  assert.ok(Tour.schema.path("durationDays"));
  // Perform the side effect or state update expressed on the following line.
  assert.ok(Tour.schema.path("taxEnabled"));
});
