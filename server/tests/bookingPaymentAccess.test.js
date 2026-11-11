/**
 * Purpose: booking Payment Access.test automated test. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import assert from "node:assert/strict";
// Load node:test so this module can use its exported dependencies.
import test from "node:test";
// Load ../utils/bookingPaymentAccess.js so this module can use its exported dependencies.
import { canAccessBookingPayment, ownsBookingPayment } from "../utils/bookingPaymentAccess.js";

// Declare booking for use by the surrounding module or function.
const booking = { user: "customer-a", customer: "customer-a" };

// Perform the side effect or state update expressed on the following line.
test("a customer can only access payment details for their own booking", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.equal(canAccessBookingPayment(booking, { _id: "customer-a", role: "customer" }), true);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(canAccessBookingPayment(booking, { _id: "customer-b", role: "customer" }), false);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(ownsBookingPayment(booking, { _id: "customer-b" }), false);
});

// Perform the side effect or state update expressed on the following line.
test("authorized tenant payment staff can access a booking payment", () => {
  // Repeat the enclosed work for each required iteration.
  for (const role of ["admin", "tour_manager", "guide", "agent"]) {
    // Perform the side effect or state update expressed on the following line.
    assert.equal(canAccessBookingPayment(booking, { _id: "staff", role }), true);
  }
});

// Perform the side effect or state update expressed on the following line.
test("payment ownership checks support populated and scalar customer references", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.equal(ownsBookingPayment({ user: { _id: "customer-a" } }, { _id: "customer-a" }), true);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(ownsBookingPayment({ customer: "customer-a" }, { _id: "customer-a" }), true);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(ownsBookingPayment(null, { _id: "customer-a" }), false);
});
