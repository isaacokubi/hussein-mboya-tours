import test from "node:test";
import assert from "node:assert/strict";
import * as firestore from "../config/firestore.js";
import Tour from "../models/Tour.js";
import Booking from "../models/Booking.js";
import { createBookingAtomically } from "../services/bookingCreationService.js";
import { runWithTenant } from "../tenancy/context.js";

const integrationEnabled = Boolean(
  process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_EMULATOR_HOST
);

const fixture = async () => {
  const tenantId = firestore.Types.ObjectId();
  const travelDate = new Date("2099-06-15T00:00:00.000Z");

  const tour = await Tour.create({
    tenantId,
    title: "Firestore Transaction Integrity Tour",
    description: "Deterministic transaction fixture",
    destination: firestore.Types.ObjectId(),
    country: "Kenya",
    location: "Amboseli",
    date: travelDate,
    startDate: travelDate,
    durationDays: 2,
    capacity: 1,
    price: 1000,
    availability: [{ date: travelDate, totalSlots: 1, bookedSlots: 0 }],
    availabilitySettings: { totalSlots: 1, bookedSlots: 0, waitlistEnabled: false },
    published: true,
    available: true,
    status: "upcoming",
  });

  return { tenantId, travelDate, tour };
};

test(
  "booking creation commits capacity reservation and booking in one Firestore transaction",
  { skip: !integrationEnabled },
  async () => {
    const { tenantId, travelDate, tour } = await fixture();

    await runWithTenant({ tenantId, role: "manager" }, async () => {
      const booking = await createBookingAtomically({
        tourId: tour._id,
        travelers: 1,
        travelDate,
        bookingData: {
          tenantId,
          tour: tour._id,
          travelDate,
          numberOfGuests: 1,
          totalAmount: 1000,
          depositAmount: 0,
          amountPaid: 0,
          balanceAmount: 1000,
          paymentStatus: "pending",
          status: "pending",
          bookingSource: "integration-test",
        },
      });

      assert.ok(booking?._id);

      const freshTour = await Tour.findById(tour._id).lean();
      const bookings = await Booking.find({ tenantId, tour: tour._id }).lean();

      assert.equal(freshTour.availability[0].bookedSlots, 1);
      assert.equal(bookings.length, 1);
      assert.equal(bookings[0]._id, booking._id);

      await Booking.deleteMany({ tenantId });
      await Tour.deleteMany({ tenantId });
    });
  }
);

test(
  "booking creation rolls back capacity when the booking write fails inside the transaction",
  { skip: !integrationEnabled },
  async () => {
    const { tenantId, travelDate, tour } = await fixture();
    const originalCreate = Booking.create;

    await runWithTenant({ tenantId, role: "manager" }, async () => {
      Booking.create = async () => {
        throw new Error("forced booking write failure");
      };

      try {
        await assert.rejects(
          () =>
            createBookingAtomically({
              tourId: tour._id,
              travelers: 1,
              travelDate,
              bookingData: {
                tenantId,
                tour: tour._id,
                travelDate,
                numberOfGuests: 1,
                totalAmount: 1000,
                paymentStatus: "pending",
                status: "pending",
              },
            }),
          /forced booking write failure/
        );
      } finally {
        Booking.create = originalCreate;
      }

      const freshTour = await Tour.findById(tour._id).lean();
      const bookings = await Booking.find({ tenantId, tour: tour._id }).lean();

      assert.equal(freshTour.availability[0].bookedSlots, 0);
      assert.equal(bookings.length, 0);

      await Tour.deleteMany({ tenantId });
    });
  }
);

test.after(async () => {
  if (firestore.connection?.close) await firestore.connection.close();
});
