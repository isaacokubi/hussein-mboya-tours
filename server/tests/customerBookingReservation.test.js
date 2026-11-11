/**
 * Purpose: customer Booking Reservation.test automated test. Main declarations: harness.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import test from "node:test";
// Load node:assert/strict so this module can use its exported dependencies.
import assert from "node:assert/strict";
// Load ../services/customerBookingReservation.js so this module can use its exported dependencies.
import { createCustomerBookingWithReservations } from "../services/customerBookingReservation.js";

// Declare harness for use by the surrounding module or function.
const harness = (overrides = {}) => {
  // Declare calls for use by the surrounding module or function.
  const calls = [];
  // Declare defaults for use by the surrounding module or function.
  const defaults = {
    tourId: "tour-1", guests: 2, travelDate: "2030-06-01", corporateAccountId: "corp-1", totalAmount: 125,
    reserveSlots: async () => calls.push("reserve-slots"),
    releaseSlots: async () => calls.push("release-slots"),
    reserveCorporateCredit: async () => { calls.push("reserve-credit"); return true; },
    releaseCorporateCredit: async () => calls.push("release-credit"),
    createBooking: async () => { calls.push("create-booking"); return { _id: "booking-1" }; },
    onCompensationError: (kind) => calls.push(`compensation-error:${kind}`),
  };
  // Return the object assembled below to the caller.
  return { calls, args: { ...defaults, ...overrides } };
};

// Perform the side effect or state update expressed on the following line.
test("slot reservation failure leaves corporate credit and booking untouched", async () => {
  // Declare error for use by the surrounding module or function.
  const error = new Error("capacity race");
  // Declare { calls, args } for use by the surrounding module or function.
  const { calls, args } = harness({ reserveSlots: async () => { calls.push("reserve-slots"); throw error; } });
  // Perform the side effect or state update expressed on the following line.
  await assert.rejects(createCustomerBookingWithReservations(args), error);
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(calls, ["reserve-slots"]);
});

// Perform the side effect or state update expressed on the following line.
test("corporate credit update failure releases previously reserved slots", async () => {
  // Declare { calls, args } for use by the surrounding module or function.
  const { calls, args } = harness({ reserveCorporateCredit: async () => { calls.push("reserve-credit"); return null; } });
  // Perform the side effect or state update expressed on the following line.
  await assert.rejects(createCustomerBookingWithReservations(args), { status: 409, message: /credit was no longer available/ });
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(calls, ["reserve-slots", "reserve-credit", "release-slots"]);
});

// Perform the side effect or state update expressed on the following line.
test("a rejected corporate credit update releases slots and preserves the update error", async () => {
  // Declare error for use by the surrounding module or function.
  const error = new Error("credit update rejected before write");
  // Declare { calls, args } for use by the surrounding module or function.
  const { calls, args } = harness({ reserveCorporateCredit: async () => { calls.push("reserve-credit"); throw error; } });
  // Perform the side effect or state update expressed on the following line.
  await assert.rejects(createCustomerBookingWithReservations(args), error);
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(calls, ["reserve-slots", "reserve-credit", "release-slots"]);
});

// Perform the side effect or state update expressed on the following line.
test("booking creation failure compensates both slot and corporate credit reservations", async () => {
  // Declare error for use by the surrounding module or function.
  const error = new Error("booking insert failed");
  // Declare { calls, args } for use by the surrounding module or function.
  const { calls, args } = harness({ createBooking: async () => { calls.push("create-booking"); throw error; } });
  // Perform the side effect or state update expressed on the following line.
  await assert.rejects(createCustomerBookingWithReservations(args), error);
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(calls, ["reserve-slots", "reserve-credit", "create-booking", "release-slots", "release-credit"]);
});

// Perform the side effect or state update expressed on the following line.
test("a failed compensation is reported while the original booking error is preserved", async () => {
  // Declare original for use by the surrounding module or function.
  const original = new Error("booking insert failed");
  // Declare { calls, args } for use by the surrounding module or function.
  const { calls, args } = harness({
    createBooking: async () => { calls.push("create-booking"); throw original; },
    releaseSlots: async () => { calls.push("release-slots"); throw new Error("slot rollback failed"); },
    onCompensationError: (kind) => calls.push(`compensation-error:${kind}`),
  });
  // Perform the side effect or state update expressed on the following line.
  await assert.rejects(createCustomerBookingWithReservations(args), original);
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(calls, ["reserve-slots", "reserve-credit", "create-booking", "release-slots", "compensation-error:capacity", "release-credit"]);
});

// Perform the side effect or state update expressed on the following line.
test("successful booking keeps both reservations", async () => {
  // Declare { calls, args } for use by the surrounding module or function.
  const { calls, args } = harness();
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(await createCustomerBookingWithReservations(args), { _id: "booking-1" });
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(calls, ["reserve-slots", "reserve-credit", "create-booking"]);
});
