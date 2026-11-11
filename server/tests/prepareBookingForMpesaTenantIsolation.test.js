/**
 * Purpose: prepare Booking For Mpesa Tenant Isolation.test automated test. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import assert from "node:assert/strict";
// Load node:test so this module can use its exported dependencies.
import test from "node:test";
// Load ../middleware/prepareBookingForMpesa.js so this module can use its exported dependencies.
import { createPrepareBookingForMpesa } from "../middleware/prepareBookingForMpesa.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { runWithTenant } from "../tenancy/context.js";

// Perform the side effect or state update expressed on the following line.
test("M-Pesa preparation cannot repair a booking owned by another tenant", async () => {
  // Declare observedFilter for use by the surrounding module or function.
  let observedFilter;
  // Declare saved for use by the surrounding module or function.
  let saved = false;
  // Declare paymentCountRead for use by the surrounding module or function.
  let paymentCountRead = false;
  // Declare middleware for use by the surrounding module or function.
  const middleware = createPrepareBookingForMpesa({
    BookingModel: { findOne: async (filter) => { observedFilter = filter; return null; } },
    PaymentModel: { countDocuments: async () => { paymentCountRead = true; return 0; } },
  });
  // Declare nextCalled for use by the surrounding module or function.
  let nextCalled = false;

  // Perform the side effect or state update expressed on the following line.
  await runWithTenant({ tenantId: "tenant-a" }, () => middleware(
    { body: { bookingId: "booking-from-tenant-b" } },
    {},
    (error) => { assert.ifError(error); nextCalled = true; },
  ));

  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(observedFilter, { _id: "booking-from-tenant-b", tenantId: "tenant-a" });
  // Perform the side effect or state update expressed on the following line.
  assert.equal(saved, false);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(paymentCountRead, false);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(nextCalled, true);
});

// Perform the side effect or state update expressed on the following line.
test("legacy booking repair scopes its completed-payment check to the active tenant", async () => {
  // Declare bookingFilter for use by the surrounding module or function.
  let bookingFilter;
  // Declare paymentFilter for use by the surrounding module or function.
  let paymentFilter;
  // Declare saved for use by the surrounding module or function.
  let saved = false;
  // Declare booking for use by the surrounding module or function.
  const booking = {
    _id: "booking-a",
    tenantId: "tenant-a",
    paymentStatus: "pending",
    status: "failed",
    totalAmount: 2500,
    depositAmount: 2500,
    balanceAmount: 0,
    // Implement the save method for this class.
    async save() { saved = true; },
  };
  // Declare middleware for use by the surrounding module or function.
  const middleware = createPrepareBookingForMpesa({
    BookingModel: { findOne: async (filter) => { bookingFilter = filter; return booking; } },
    PaymentModel: { countDocuments: async (filter) => { paymentFilter = filter; return 0; } },
  });

  // Perform the side effect or state update expressed on the following line.
  await runWithTenant({ tenantId: "tenant-a" }, () => middleware(
    { body: { bookingId: "booking-a" } },
    {},
    (error) => assert.ifError(error),
  ));

  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(bookingFilter, { _id: "booking-a", tenantId: "tenant-a" });
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(paymentFilter, { booking: "booking-a", status: "completed", tenantId: "tenant-a" });
  // Perform the side effect or state update expressed on the following line.
  assert.equal(saved, true);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(booking.depositAmount, 0);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(booking.balanceAmount, 2500);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(booking.status, "pending");
});
