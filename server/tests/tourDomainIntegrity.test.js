import test from "node:test";
import assert from "node:assert/strict";
import { calculateBookingAmounts } from "../utils/bookingPricing.js";
import Booking from "../models/Booking.js";
import Tour from "../models/Tour.js";

test("percentage discounts are calculated against the subtotal", () => {
  const result = calculateBookingAmounts({ price: 100, discount: 10, depositRequired: 100 }, 10);
  assert.equal(result.subtotal, 1000);
  assert.equal(result.discountAmount, 100);
  assert.equal(result.totalAmount, 900);
  assert.equal(result.depositAmount, 100);
  assert.equal(result.amountPaid, 0);
  assert.equal(result.balanceAmount, 900);
});

test("traveler pricing rule overrides global discount", () => {
  const result = calculateBookingAmounts({
    price: 1000,
    discount: 5,
    pricingRules: [{ minTravelers: 5, maxTravelers: 10, discount: 15 }],
    depositRequired: 20,
    depositType: "percentage",
  }, 5);
  assert.equal(result.discountPercentage, 15);
  assert.equal(result.discountAmount, 750);
  assert.equal(result.totalAmount, 4250);
  assert.equal(result.depositAmount, 850);
});

test("discountPrice is treated as an explicit unit-price override", () => {
  const result = calculateBookingAmounts({ price: 1000, discountPrice: 800, discount: 0, depositRequired: 0 }, 2);
  assert.equal(result.pricePerTraveler, 800);
  assert.equal(result.subtotal, 1600);
  assert.equal(result.totalAmount, 1600);
});

test("booking schema separates configured deposit from actual paid amount", () => {
  assert.ok(Booking.schema.path("depositAmount"));
  assert.ok(Booking.schema.path("amountPaid"));
  const booking = new Booking({ totalAmount: 1000, depositAmount: 100, amountPaid: 250 });
  assert.equal(booking.remainingBalance, 750);
});

test("tour schema persists deposit mode and canonical duration", () => {
  assert.ok(Tour.schema.path("depositType"));
  assert.ok(Tour.schema.path("durationDays"));
  assert.ok(Tour.schema.path("taxEnabled"));
});
