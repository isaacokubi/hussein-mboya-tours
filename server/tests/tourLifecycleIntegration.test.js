import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import Tour from "../models/Tour.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import JournalEntry from "../models/JournalEntry.js";
import { completeBookingPayment } from "../services/paymentLifecycleService.js";
import { cancelTourAndBookings } from "../services/tourCancellationService.js";
import { createBookingAtomically } from "../services/bookingCreationService.js";
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

    const payment = await Payment.create({
      tenantId,
      customer: new mongoose.Types.ObjectId(),
      user: new mongoose.Types.ObjectId(),
      booking: first._id,
      provider: "MPESA",
      method: "mpesa",
      paymentMethod: "MPESA",
      amount: 1000,
      currency: "KES",
      status: "pending",
    });

    const completedPayment = await completeBookingPayment({
      payment,
      booking: first,
      paymentData: { amount: 1000, paymentMethod: "MPESA", mpesaReceiptNumber: "CI-LIFECYCLE-001" },
    });
    assert.equal(completedPayment.booking.amountPaid, 1000);
    assert.equal(completedPayment.booking.balanceAmount, 0);
    assert.equal(completedPayment.payment.status, "completed");
    const paymentJournal = await JournalEntry.findOne({
      tenantId,
      sourceType: "payment",
      sourceId: completedPayment.payment._id,
      status: "posted",
    }).lean();
    assert.ok(paymentJournal, "completed payment must create a posted accounting journal inside the lifecycle transaction");
    assert.equal(
      Math.round(paymentJournal.lines.reduce((sum, line) => sum + Number(line.debit || 0), 0) * 100),
      Math.round(paymentJournal.lines.reduce((sum, line) => sum + Number(line.credit || 0), 0) * 100),
    );

    const cancelled = await cancelTourAndBookings({
      tourId: tour._id,
      reason: "Lifecycle integration cancellation",
      deleted: false,
    });
    assert.equal(cancelled.bookingsAffected, 1);
    assert.equal(cancelled.tour.status, "cancelled");

    const cancelledBooking = await Booking.findById(first._id).lean();
    assert.equal(cancelledBooking.status, "cancelled");
    assert.equal(cancelledBooking.refundStatus, "requested");
    assert.equal(cancelledBooking.refundAmount, 1000);

    const released = await Tour.findById(tour._id).lean();
    assert.equal(released.availability[0].bookedSlots, 0);
    assert.equal(released.available, false);

    await JournalEntry.deleteMany({ tenantId });
    await Payment.deleteMany({ tenantId });
    await Booking.deleteMany({ tenantId });
    await Tour.deleteMany({ tenantId });
  });
});

test.after(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});


test("payment completion rolls back financial state when accounting posting fails", { skip: !integrationEnabled }, async () => {
  if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_URI);
  const tenantId = new mongoose.Types.ObjectId();

  await runWithTenant({ tenantId, role: "manager" }, async () => {
    const booking = await Booking.create({
      tenantId,
      bookingNumber: "BK-ACCOUNTING-ROLLBACK",
      customer: new mongoose.Types.ObjectId(),
      tour: new mongoose.Types.ObjectId(),
      travelDate: new Date("2099-07-01T00:00:00.000Z"),
      numberOfGuests: 1,
      totalAmount: 1000,
      amountPaid: 0,
      balanceAmount: 1000,
      paymentStatus: "pending",
      status: "pending",
    });

    const payment = await Payment.create({
      tenantId,
      customer: booking.customer,
      user: new mongoose.Types.ObjectId(),
      booking: booking._id,
      provider: "MPESA",
      paymentMethod: "MPESA",
      amount: 1000,
      currency: "KES",
      status: "pending",
      transactionFee: 2000,
    });

    const original = await JournalEntry.countDocuments({ tenantId });

    await assert.rejects(
      () => completeBookingPayment({
        payment,
        booking,
        paymentData: { amount: 1000, paymentMethod: "MPESA" },
      }),
      /Payment fee cannot exceed the payment amount|Operational accounting/i,
    );

    const freshPayment = await Payment.findById(payment._id).lean();
    const freshBooking = await Booking.findById(booking._id).lean();
    assert.equal(freshPayment.status, "pending");
    assert.equal(freshBooking.amountPaid, 0);
    assert.equal(freshBooking.paymentStatus, "pending");
    assert.equal(await JournalEntry.countDocuments({ tenantId }), original);

    await JournalEntry.deleteMany({ tenantId });
    await Payment.deleteMany({ tenantId });
    await Booking.deleteMany({ tenantId });
  });
});
