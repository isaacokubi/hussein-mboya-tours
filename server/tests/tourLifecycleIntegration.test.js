/**
 * Purpose: tour Lifecycle Integration.test automated test. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import test from "node:test";
// Load node:assert/strict so this module can use its exported dependencies.
import assert from "node:assert/strict";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Payment.js so this module can use its exported dependencies.
import Payment from "../models/Payment.js";
// Load ../models/JournalEntry.js so this module can use its exported dependencies.
import JournalEntry from "../models/JournalEntry.js";
// Load ../services/paymentLifecycleService.js so this module can use its exported dependencies.
import { completeBookingPayment } from "../services/paymentLifecycleService.js";
// Load ../services/tourCancellationService.js so this module can use its exported dependencies.
import { cancelTourAndBookings } from "../services/tourCancellationService.js";
// Load ../services/bookingCreationService.js so this module can use its exported dependencies.
import { createBookingAtomically } from "../services/bookingCreationService.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { runWithTenant } from "../tenancy/context.js";
// Load ./integrationMongoUri.js so this module can use its exported dependencies.
import { getDisposableIntegrationMongoUri } from "./integrationMongoUri.js";

// A configured URI alone is not permission to run destructive, transactional
// integration fixtures. CI opts in explicitly after starting its replica set.
// Declare integrationMongoUri for use by the surrounding module or function.
const integrationMongoUri = getDisposableIntegrationMongoUri();
// Declare integrationEnabled for use by the surrounding module or function.
const integrationEnabled = process.env.RUN_DATABASE_INTEGRATION_TESTS === "true" && Boolean(integrationMongoUri);

// Perform the side effect or state update expressed on the following line.
test("tour lifecycle atomically reserves dated capacity with booking creation and releases it transactionally", { skip: !integrationEnabled }, async () => {
  // Check the condition (mongoose.connection.readyState === 0) and run the matching branch.
  if (mongoose.connection.readyState === 0) await mongoose.connect(integrationMongoUri);
  // Declare tenantId for use by the surrounding module or function.
  const tenantId = new mongoose.Types.ObjectId();
  // Declare travelDate for use by the surrounding module or function.
  const travelDate = new Date("2099-06-15T00:00:00.000Z");

  // Perform the side effect or state update expressed on the following line.
  await runWithTenant({ tenantId, role: "manager" }, async () => {
    // Declare tour for use by the surrounding module or function.
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

    // Declare baseBooking for use by the surrounding module or function.
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

    // Declare first for use by the surrounding module or function.
    const first = await createBookingAtomically({ tourId: tour._id, travelers: 1, travelDate, bookingData: baseBooking });
    // Perform the side effect or state update expressed on the following line.
    assert.ok(first._id);

    // Declare reserved for use by the surrounding module or function.
    const reserved = await Tour.findById(tour._id).lean();
    // Perform the side effect or state update expressed on the following line.
    assert.equal(reserved.availability[0].bookedSlots, 1);

    // Perform the side effect or state update expressed on the following line.
    await assert.rejects(
      () => createBookingAtomically({
        tourId: tour._id,
        travelers: 1,
        travelDate,
        bookingData: { ...baseBooking, bookingNumber: "BK-INTEGRATION-SECOND" },
      }),
      /Not enough available tour slots/
    );

    // Perform the side effect or state update expressed on the following line.
    assert.equal(await Booking.countDocuments({ tenantId, tour: tour._id }), 1);

    // Declare payment for use by the surrounding module or function.
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

    // Declare completedPayment for use by the surrounding module or function.
    const completedPayment = await completeBookingPayment({
      payment,
      booking: first,
      paymentData: { amount: 1000, paymentMethod: "MPESA", mpesaReceiptNumber: "CI-LIFECYCLE-001" },
    });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(completedPayment.booking.amountPaid, 1000);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(completedPayment.booking.balanceAmount, 0);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(completedPayment.payment.status, "completed");
    // Declare paymentJournal for use by the surrounding module or function.
    const paymentJournal = await JournalEntry.findOne({
      tenantId,
      sourceType: "payment",
      sourceId: completedPayment.payment._id,
      status: "posted",
    }).lean();
    // Perform the side effect or state update expressed on the following line.
    assert.ok(paymentJournal, "completed payment must create a posted accounting journal inside the lifecycle transaction");
    // Perform the side effect or state update expressed on the following line.
    assert.equal(
      Math.round(paymentJournal.lines.reduce((sum, line) => sum + Number(line.debit || 0), 0) * 100),
      Math.round(paymentJournal.lines.reduce((sum, line) => sum + Number(line.credit || 0), 0) * 100),
    );

    // Declare journalCountBeforeReplay for use by the surrounding module or function.
    const journalCountBeforeReplay = await JournalEntry.countDocuments({
      tenantId, sourceType: "payment", sourceId: completedPayment.payment._id,
    });
    // Declare replayed for use by the surrounding module or function.
    const replayed = await completeBookingPayment({
      payment: completedPayment.payment,
      booking: completedPayment.booking,
      paymentData: { amount: 1000, paymentMethod: "MPESA", mpesaReceiptNumber: "CI-LIFECYCLE-001" },
    });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(replayed.alreadyCompleted, true, "replayed completion must be recognized as idempotent");
    // Perform the side effect or state update expressed on the following line.
    assert.equal(replayed.booking.amountPaid, 1000, "replay must not credit the booking twice");
    // Perform the side effect or state update expressed on the following line.
    assert.equal(await JournalEntry.countDocuments({
      tenantId, sourceType: "payment", sourceId: completedPayment.payment._id,
    }), journalCountBeforeReplay, "replay must not duplicate the payment journal");

    // A completed partial payment must be idempotent even though its booking remains unpaid.
    // Declare partialBooking for use by the surrounding module or function.
    const partialBooking = await Booking.create({
      tenantId, bookingNumber: "BK-PARTIAL-REPLAY", customer: new mongoose.Types.ObjectId(),
      tour: new mongoose.Types.ObjectId(), travelDate, numberOfGuests: 1, totalAmount: 2000,
      amountPaid: 0, balanceAmount: 2000, paymentStatus: "pending", status: "pending",
    });
    // Declare partialPayment for use by the surrounding module or function.
    const partialPayment = await Payment.create({
      tenantId, customer: partialBooking.customer, user: new mongoose.Types.ObjectId(),
      booking: partialBooking._id, provider: "MPESA", method: "mpesa",
      paymentMethod: "MPESA", amount: 1000, currency: "KES", status: "pending",
    });
    // Declare partialCompletion for use by the surrounding module or function.
    const partialCompletion = await completeBookingPayment({
      payment: partialPayment, booking: partialBooking,
      paymentData: { amount: 1000, paymentMethod: "MPESA", mpesaReceiptNumber: "CI-PARTIAL-001" },
    });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(partialCompletion.payment.status, "completed");
    // Perform the side effect or state update expressed on the following line.
    assert.equal(partialCompletion.booking.paymentStatus, "partial");
    // Perform the side effect or state update expressed on the following line.
    assert.equal(partialCompletion.booking.amountPaid, 1000);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(partialCompletion.booking.balanceAmount, 1000);
    // Declare partialJournalCount for use by the surrounding module or function.
    const partialJournalCount = await JournalEntry.countDocuments({
      tenantId, sourceType: "payment", sourceId: partialPayment._id,
    });
    // Declare partialReplay for use by the surrounding module or function.
    const partialReplay = await completeBookingPayment({
      payment: partialCompletion.payment, booking: partialCompletion.booking,
      paymentData: { amount: 1000, paymentMethod: "MPESA", mpesaReceiptNumber: "CI-PARTIAL-001" },
    });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(partialReplay.alreadyCompleted, true);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(partialReplay.booking.paymentStatus, "partial");
    // Perform the side effect or state update expressed on the following line.
    assert.equal(partialReplay.booking.amountPaid, 1000);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(partialReplay.booking.balanceAmount, 1000);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(await JournalEntry.countDocuments({
      tenantId, sourceType: "payment", sourceId: partialPayment._id,
    }), partialJournalCount);

    // Concurrent duplicate callbacks must produce one credit and one journal.
    // Declare concurrentBooking for use by the surrounding module or function.
    const concurrentBooking = await Booking.create({
      tenantId, bookingNumber: "BK-CONCURRENT-REPLAY", customer: new mongoose.Types.ObjectId(),
      tour: new mongoose.Types.ObjectId(), travelDate, numberOfGuests: 1, totalAmount: 2000,
      amountPaid: 0, balanceAmount: 2000, paymentStatus: "pending", status: "pending",
    });
    // Declare concurrentPayment for use by the surrounding module or function.
    const concurrentPayment = await Payment.create({
      tenantId, customer: concurrentBooking.customer, user: new mongoose.Types.ObjectId(),
      booking: concurrentBooking._id, provider: "MPESA", method: "mpesa",
      paymentMethod: "MPESA", amount: 1000, currency: "KES", status: "pending",
    });
    // Declare concurrentPayload for use by the surrounding module or function.
    const concurrentPayload = { paymentData: { amount: 1000, paymentMethod: "MPESA", mpesaReceiptNumber: "CI-CONCURRENT-001" } };
    // Declare concurrentResults for use by the surrounding module or function.
    const concurrentResults = await Promise.all([
      completeBookingPayment({ payment: concurrentPayment, booking: concurrentBooking, ...concurrentPayload }),
      completeBookingPayment({ payment: concurrentPayment, booking: concurrentBooking, ...concurrentPayload }),
    ]);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(concurrentResults.filter((result) => result.alreadyCompleted).length, 1);
    // Declare concurrentBookingAfter for use by the surrounding module or function.
    const concurrentBookingAfter = await Booking.findById(concurrentBooking._id).lean();
    // Declare concurrentPaymentAfter for use by the surrounding module or function.
    const concurrentPaymentAfter = await Payment.findById(concurrentPayment._id).lean();
    // Perform the side effect or state update expressed on the following line.
    assert.equal(concurrentPaymentAfter.status, "completed");
    // Perform the side effect or state update expressed on the following line.
    assert.equal(concurrentBookingAfter.paymentStatus, "partial");
    // Perform the side effect or state update expressed on the following line.
    assert.equal(concurrentBookingAfter.amountPaid, 1000);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(concurrentBookingAfter.balanceAmount, 1000);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(await JournalEntry.countDocuments({
      tenantId, sourceType: "payment", sourceId: concurrentPayment._id,
    }), 1);

    // Declare cancelled for use by the surrounding module or function.
    const cancelled = await cancelTourAndBookings({
      tourId: tour._id,
      reason: "Lifecycle integration cancellation",
      deleted: false,
    });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(cancelled.bookingsAffected, 1);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(cancelled.tour.status, "cancelled");

    // Declare cancelledBooking for use by the surrounding module or function.
    const cancelledBooking = await Booking.findById(first._id).lean();
    // Perform the side effect or state update expressed on the following line.
    assert.equal(cancelledBooking.status, "cancelled");
    // Perform the side effect or state update expressed on the following line.
    assert.equal(cancelledBooking.refundStatus, "requested");
    // Perform the side effect or state update expressed on the following line.
    assert.equal(cancelledBooking.refundAmount, 1000);

    // Declare released for use by the surrounding module or function.
    const released = await Tour.findById(tour._id).lean();
    // Perform the side effect or state update expressed on the following line.
    assert.equal(released.availability[0].bookedSlots, 0);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(released.available, false);

    // Perform the side effect or state update expressed on the following line.
    await JournalEntry.deleteMany({ tenantId });
    // Perform the side effect or state update expressed on the following line.
    await Payment.deleteMany({ tenantId });
    // Perform the side effect or state update expressed on the following line.
    await Booking.deleteMany({ tenantId });
    // Perform the side effect or state update expressed on the following line.
    await Tour.deleteMany({ tenantId });
  });
});

// Perform the side effect or state update expressed on the following line.
test.after(async () => {
  // Check the condition (mongoose.connection.readyState !== 0) and run the matching branch.
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});


// Perform the side effect or state update expressed on the following line.
test("payment completion rolls back financial state when accounting posting fails", { skip: !integrationEnabled }, async () => {
  // Check the condition (mongoose.connection.readyState === 0) and run the matching branch.
  if (mongoose.connection.readyState === 0) await mongoose.connect(integrationMongoUri);
  // Declare tenantId for use by the surrounding module or function.
  const tenantId = new mongoose.Types.ObjectId();

  // Perform the side effect or state update expressed on the following line.
  await runWithTenant({ tenantId, role: "manager" }, async () => {
    // Declare booking for use by the surrounding module or function.
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

    // Declare payment for use by the surrounding module or function.
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

    // Declare original for use by the surrounding module or function.
    const original = await JournalEntry.countDocuments({ tenantId });

    // Perform the side effect or state update expressed on the following line.
    await assert.rejects(
      () => completeBookingPayment({
        payment,
        booking,
        paymentData: { amount: 1000, paymentMethod: "MPESA" },
      }),
      /Payment fee cannot exceed the payment amount|Operational accounting/i,
    );

    // Declare freshPayment for use by the surrounding module or function.
    const freshPayment = await Payment.findById(payment._id).lean();
    // Declare freshBooking for use by the surrounding module or function.
    const freshBooking = await Booking.findById(booking._id).lean();
    // Perform the side effect or state update expressed on the following line.
    assert.equal(freshPayment.status, "pending");
    // Perform the side effect or state update expressed on the following line.
    assert.equal(freshBooking.amountPaid, 0);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(freshBooking.paymentStatus, "pending");
    // Perform the side effect or state update expressed on the following line.
    assert.equal(await JournalEntry.countDocuments({ tenantId }), original);

    // Perform the side effect or state update expressed on the following line.
    await JournalEntry.deleteMany({ tenantId });
    // Perform the side effect or state update expressed on the following line.
    await Payment.deleteMany({ tenantId });
    // Perform the side effect or state update expressed on the following line.
    await Booking.deleteMany({ tenantId });
  });
});
