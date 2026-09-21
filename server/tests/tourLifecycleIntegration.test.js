import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import Tour from "../models/Tour.js";
import Booking from "../models/Booking.js";
import { createBookingAtomically } from "../services/bookingCreationService.js";
import { releaseSlots } from "../services/inventoryService.js";
import { runWithTenant } from "../tenancy/context.js";

const integrationEnabled = Boolean(process.env.MONGODB_URI);

test("tour lifecycle atomically reserves dated capacity with booking creation and releases it transactionally", { skip: !integrationEnabled }, async () => {
  if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_URI);
  const tenantId = new mongoose.Types.ObjectId();
  const travelDate = new Date("2099-06-15T00:00:00.000Z");

  await runWithTenant({ tenantId, role: "manager" }, async () => {
    const tour = await Tour.create({
      tenantId,
      title: "Lifecycle Integration Tour",
      description: "Deterministic integration fixture",
      destination: new mongoose.Types.ObjectId(),
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

    const baseBooking = {
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
      bookingSource: "api",
    };

    const first = await createBookingAtomically({ tourId: tour._id, travelers: 1, travelDate, bookingData: baseBooking });
    assert.ok(first._id);

    const reserved = await Tour.findById(tour._id).lean();
    assert.equal(reserved.availability[0].bookedSlots, 1);

    await assert.rejects(
      () => createBookingAtomically({
        tourId: tour._id,
        travelers: 1,
        travelDate,
        bookingData: { ...baseBooking, bookingNumber: "BK-INTEGRATION-SECOND" },
      }),
      /Not enough available tour slots/
    );

    assert.equal(await Booking.countDocuments({ tenantId, tour: tour._id }), 1);

    await releaseSlots(tour._id, 1, travelDate);
    const released = await Tour.findById(tour._id).lean();
    assert.equal(released.availability[0].bookedSlots, 0);

    await Booking.deleteMany({ tenantId });
    await Tour.deleteMany({ tenantId });
  });
});

test.after(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});
