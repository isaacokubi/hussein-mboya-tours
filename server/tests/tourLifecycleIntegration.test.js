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
import { getDisposableIntegrationMongoUri } from "./integrationMongoUri.js";

// A configured URI alone is not permission to run destructive, transactional
// integration fixtures. CI opts in explicitly after starting its replica set.
const integrationMongoUri = getDisposableIntegrationMongoUri();
const integrationEnabled = process.env.RUN_DATABASE_INTEGRATION_TESTS === "true" && Boolean(integrationMongoUri);

test("tour lifecycle atomically reserves dated capacity with booking creation and releases it transactionally", { skip: !integrationEnabled }, async () => {
  if (mongoose.connection.readyState === 0) await mongoose.connect(integrationMongoUri);
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

    const journalCountBeforeReplay = await JournalEntry.countDocuments({
      tenantId, sourceType: "payment", sourceId: completedPayment.payment._id,
    });
    const replayed = await completeBookingPayment({
      payment: completedPayment.payment,
      booking: completedPayment.booking,
      paymentData: { amount: 1000, paymentMethod: "MPESA", mpesaReceiptNumber: "CI-LIFECYCLE-001" },
    });
    assert.equal(replayed.alreadyCompleted, true, "replayed completion must be recognized as idempotent");
    assert.equal(replayed.booking.amountPaid, 1000, "replay must not credit the booking twice");
    assert.equal(await JournalEntry.countDocuments({
      tenantId, sourceType: "payment", sourceId: completedPayment.payment._id,
    }), journalCountBeforeReplay, "replay must not duplicate the payment journal");

    // A completed partial payment must be idempotent even though the booking
    // itself is not fully paid yet.
    const partialBooking = await Booking.create({
      tenantId,
      bookingNumber: "BK-PARTIAL-REPLAY",
      customer: new mongoose.Types.ObjectId(),
      // Keep this payment-only fixture outside the tour being cancelled below.
      tour: new mongoose.Types.ObjectId(),
      travelDate,
      numberOfGuests: 1,
      totalAmount: 2000,
      amountPaid: 0,
      balanceAmount: 2000,
      paymentStatus: "pending",
      status: "pending",
    });
    const partialPayment = await Payment.create({
      tenantId,
      customer: partialBooking.customer,
      user: new mongoose.Types.ObjectId(),
      booking: partialBooking._id,
      provider: "MPESA",
      method: "mpesa",
      paymentMethod: "MPESA",
      amount: 1000,
      currency: "KES",
      status: "pending",
    });
    const partialCompletion = await completeBookingPayment({
      payment: partialPayment,
      booking: partialBooking,
      paymentData: { amount: 1000, paymentMethod: "MPESA", mpesaReceiptNumber: "CI-PARTIAL-001" },
    });
    assert.equal(partialCompletion.payment.status, "completed");
    assert.equal(partialCompletion.booking.paymentStatus, "partial");
    assert.equal(partialCompletion.booking.amountPaid, 1000);
    assert.equal(partialCompletion.booking.balanceAmount, 1000);

    const partialJournalCount = await JournalEntry.countDocuments({
      tenantId, sourceType: "payment", sourceId: partialPayment._id,
    });
    const partialReplay = await completeBookingPayment({
      payment: partialCompletion.payment,
      booking: partialCompletion.booking,
      paymentData: { amount: 1000, paymentMethod: "MPESA", mpesaReceiptNumber: "CI-PARTIAL-001" },
    });
    assert.equal(partialReplay.alreadyCompleted, true, "replaying a completed partial payment must be recognized");
    assert.equal(partialReplay.booking.paymentStatus, "partial", "replay must not falsely mark a partially paid booking as paid");
    assert.equal(partialReplay.booking.amountPaid, 1000, "replay must not credit a partial payment twice");
    assert.equal(partialReplay.booking.balanceAmount, 1000, "replay must preserve the outstanding balance");
    assert.equal(await JournalEntry.countDocuments({
      tenantId, sourceType: "payment", sourceId: partialPayment._id,
    }), partialJournalCount, "partial payment replay must not duplicate its accounting journal");

    // Two identical provider callbacks can arrive at nearly the same time.
    // MongoDB transaction retries must make one completion win and the other
    // observe the completed payment without applying a second financial credit.
    const concurrentBooking = await Booking.create({
      tenantId,
      bookingNumber: "BK-CONCURRENT-REPLAY",
      customer: new mongoose.Types.ObjectId(),
      tour: new mongoose.Types.ObjectId(),
      travelDate,
      numberOfGuests: 1,
      totalAmount: 2000,
      amountPaid: 0,
      balanceAmount: 2000,
      paymentStatus: "pending",
      status: "pending",
    });
    const concurrentPayment = await Payment.create({
      tenantId,
      customer: concurrentBooking.customer,
      user: new mongoose.Types.ObjectId(),
      booking: concurrentBooking._id,
      provider: "MPESA",
      method: "mpesa",
      paymentMethod: "MPESA",
      amount: 1000,
      currency: "KES",
      status: "pending",
    });
    const concurrentPayload = {
      paymentData: { amount: 1000, paymentMethod: "MPESA", mpesaReceiptNumber: "CI-CONCURRENT-001" },
    };
    const concurrentResults = await Promise.all([
      completeBookingPayment({ payment: concurrentPayment, booking: concurrentBooking, ...concurrentPayload }),
      completeBookingPayment({ payment: concurrentPayment, booking: concurrentBooking, ...concurrentPayload }),
    ]);
    assert.equal(concurrentResults.filter((result) => result.alreadyCompleted).length, 1,
      "exactly one concurrent callback must be recognized as a replay");
    const concurrentBookingAfter = await Booking.findById(concurrentBooking._id).lean();
    const concurrentPaymentAfter = await Payment.findById(concurrentPayment._id).lean();
    assert.equal(concurrentPaymentAfter.status, "completed");
    assert.equal(concurrentBookingAfter.paymentStatus, "partial");
    assert.equal(concurrentBookingAfter.amountPaid, 1000, "concurrent callback must credit the booking only once");
    assert.equal(concurrentBookingAfter.balanceAmount, 1000);
    assert.equal(await JournalEntry.countDocuments({
      tenantId, sourceType: "payment", sourceId: concurrentPayment._id,
    }), 1, "concurrent callback must create exactly one accounting journal");

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
  if (mongoose.connection.readyState === 0) await mongoose.connect(integrationMongoUri);
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
