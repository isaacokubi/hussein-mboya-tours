import test from "node:test";
import assert from "node:assert/strict";
import { createCustomerBookingWithReservations } from "../services/customerBookingReservation.js";

const harness = (overrides = {}) => {
  const calls = [];
  const defaults = {
    tourId: "tour-1", guests: 2, travelDate: "2030-06-01", corporateAccountId: "corp-1", totalAmount: 125,
    reserveSlots: async () => calls.push("reserve-slots"),
    releaseSlots: async () => calls.push("release-slots"),
    reserveCorporateCredit: async () => { calls.push("reserve-credit"); return true; },
    releaseCorporateCredit: async () => calls.push("release-credit"),
    createBooking: async () => { calls.push("create-booking"); return { _id: "booking-1" }; },
    onCompensationError: (kind) => calls.push(`compensation-error:${kind}`),
  };
  return { calls, args: { ...defaults, ...overrides } };
};

test("slot reservation failure leaves corporate credit and booking untouched", async () => {
  const error = new Error("capacity race");
  const { calls, args } = harness({ reserveSlots: async () => { calls.push("reserve-slots"); throw error; } });
  await assert.rejects(createCustomerBookingWithReservations(args), error);
  assert.deepEqual(calls, ["reserve-slots"]);
});

test("corporate credit update failure releases previously reserved slots", async () => {
  const { calls, args } = harness({ reserveCorporateCredit: async () => { calls.push("reserve-credit"); return null; } });
  await assert.rejects(createCustomerBookingWithReservations(args), { status: 409, message: /credit was no longer available/ });
  assert.deepEqual(calls, ["reserve-slots", "reserve-credit", "release-slots"]);
});

test("a rejected corporate credit update releases slots and preserves the update error", async () => {
  const error = new Error("credit update rejected before write");
  const { calls, args } = harness({ reserveCorporateCredit: async () => { calls.push("reserve-credit"); throw error; } });
  await assert.rejects(createCustomerBookingWithReservations(args), error);
  assert.deepEqual(calls, ["reserve-slots", "reserve-credit", "release-slots"]);
});

test("booking creation failure compensates both slot and corporate credit reservations", async () => {
  const error = new Error("booking insert failed");
  const { calls, args } = harness({ createBooking: async () => { calls.push("create-booking"); throw error; } });
  await assert.rejects(createCustomerBookingWithReservations(args), error);
  assert.deepEqual(calls, ["reserve-slots", "reserve-credit", "create-booking", "release-slots", "release-credit"]);
});

test("a failed compensation is reported while the original booking error is preserved", async () => {
  const original = new Error("booking insert failed");
  const { calls, args } = harness({
    createBooking: async () => { calls.push("create-booking"); throw original; },
    releaseSlots: async () => { calls.push("release-slots"); throw new Error("slot rollback failed"); },
    onCompensationError: (kind) => calls.push(`compensation-error:${kind}`),
  });
  await assert.rejects(createCustomerBookingWithReservations(args), original);
  assert.deepEqual(calls, ["reserve-slots", "reserve-credit", "create-booking", "release-slots", "compensation-error:capacity", "release-credit"]);
});

test("successful booking keeps both reservations", async () => {
  const { calls, args } = harness();
  assert.deepEqual(await createCustomerBookingWithReservations(args), { _id: "booking-1" });
  assert.deepEqual(calls, ["reserve-slots", "reserve-credit", "create-booking"]);
});
