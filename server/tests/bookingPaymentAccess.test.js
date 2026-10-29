import assert from "node:assert/strict";
import test from "node:test";
import { canAccessBookingPayment, ownsBookingPayment } from "../utils/bookingPaymentAccess.js";

const booking = { user: "customer-a", customer: "customer-a" };

test("a customer can only access payment details for their own booking", () => {
  assert.equal(canAccessBookingPayment(booking, { _id: "customer-a", role: "customer" }), true);
  assert.equal(canAccessBookingPayment(booking, { _id: "customer-b", role: "customer" }), false);
  assert.equal(ownsBookingPayment(booking, { _id: "customer-b" }), false);
});

test("authorized tenant payment staff can access a booking payment", () => {
  for (const role of ["admin", "tour_manager", "guide", "agent"]) {
    assert.equal(canAccessBookingPayment(booking, { _id: "staff", role }), true);
  }
});

test("payment ownership checks support populated and scalar customer references", () => {
  assert.equal(ownsBookingPayment({ user: { _id: "customer-a" } }, { _id: "customer-a" }), true);
  assert.equal(ownsBookingPayment({ customer: "customer-a" }, { _id: "customer-a" }), true);
  assert.equal(ownsBookingPayment(null, { _id: "customer-a" }), false);
});
