import assert from "node:assert/strict";
import test from "node:test";
import { createPrepareBookingForMpesa } from "../middleware/prepareBookingForMpesa.js";
import { runWithTenant } from "../tenancy/context.js";

test("M-Pesa preparation cannot repair a booking owned by another tenant", async () => {
  let observedFilter;
  let saved = false;
  let paymentCountRead = false;
  const middleware = createPrepareBookingForMpesa({
    BookingModel: { findOne: async (filter) => { observedFilter = filter; return null; } },
    PaymentModel: { countDocuments: async () => { paymentCountRead = true; return 0; } },
  });
  let nextCalled = false;

  await runWithTenant({ tenantId: "tenant-a" }, () => middleware(
    { body: { bookingId: "booking-from-tenant-b" } },
    {},
    (error) => { assert.ifError(error); nextCalled = true; },
  ));

  assert.deepEqual(observedFilter, { _id: "booking-from-tenant-b", tenantId: "tenant-a" });
  assert.equal(saved, false);
  assert.equal(paymentCountRead, false);
  assert.equal(nextCalled, true);
});

test("legacy booking repair scopes its completed-payment check to the active tenant", async () => {
  let bookingFilter;
  let paymentFilter;
  let saved = false;
  const booking = {
    _id: "booking-a",
    tenantId: "tenant-a",
    paymentStatus: "pending",
    status: "failed",
    totalAmount: 2500,
    depositAmount: 2500,
    balanceAmount: 0,
    async save() { saved = true; },
  };
  const middleware = createPrepareBookingForMpesa({
    BookingModel: { findOne: async (filter) => { bookingFilter = filter; return booking; } },
    PaymentModel: { countDocuments: async (filter) => { paymentFilter = filter; return 0; } },
  });

  await runWithTenant({ tenantId: "tenant-a" }, () => middleware(
    { body: { bookingId: "booking-a" } },
    {},
    (error) => assert.ifError(error),
  ));

  assert.deepEqual(bookingFilter, { _id: "booking-a", tenantId: "tenant-a" });
  assert.deepEqual(paymentFilter, { booking: "booking-a", status: "completed", tenantId: "tenant-a" });
  assert.equal(saved, true);
  assert.equal(booking.depositAmount, 0);
  assert.equal(booking.balanceAmount, 2500);
  assert.equal(booking.status, "pending");
});
