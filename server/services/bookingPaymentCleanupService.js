/**
 * Purpose: booking Payment Cleanup Service business-logic service. Main declarations: cancelExpiredPendingBookings.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Payment.js so this module can use its exported dependencies.
import Payment from "../models/Payment.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { runWithTenant } from "../tenancy/context.js";

// Declare PAYMENT_EXPIRY_REASON for use by the surrounding module or function.
const PAYMENT_EXPIRY_REASON =
  "M-Pesa payment request expired after 30 minutes without successful confirmation.";

// Declare BOOKING_EXPIRY_REASON for use by the surrounding module or function.
const BOOKING_EXPIRY_REASON =
  "Automatically cancelled after payment timeout.";

// Declare cancelExpiredPendingBookings for use by the surrounding module or function.
export const cancelExpiredPendingBookings = async () =>
  runWithTenant({ bypass: true }, async () => {
    // Declare cutoff for use by the surrounding module or function.
    const cutoff = new Date(Date.now() - 30 * 60 * 1000);

    // Declare expiredBookings for use by the surrounding module or function.
    const expiredBookings = await Booking.find({
      status: "pending",
      paymentStatus: "pending",
      createdAt: { $lt: cutoff },
    })
      .select("_id tenantId")
      .lean();

    // Declare cancelledBookings for use by the surrounding module or function.
    let cancelledBookings = 0;
    // Declare expiredPayments for use by the surrounding module or function.
    let expiredPayments = 0;

    // Repeat the enclosed work for each required iteration.
    for (const candidate of expiredBookings) {
      // Declare session for use by the surrounding module or function.
      const session = await mongoose.startSession();

      // Run this operation with a dedicated error-handling path for failures.
      try {
        // Declare transactionCancelled for use by the surrounding module or function.
        let transactionCancelled = false;
        // Declare transactionExpiredPayments for use by the surrounding module or function.
        let transactionExpiredPayments = 0;

        // Perform the side effect or state update expressed on the following line.
        await session.withTransaction(async () => {
          // Re-check the lifecycle state inside the transaction so a payment
          // callback or another worker cannot race this expiry operation.
          // Declare booking for use by the surrounding module or function.
          const booking = await Booking.findOne({
            _id: candidate._id,
            tenantId: candidate.tenantId,
            status: "pending",
            paymentStatus: "pending",
            createdAt: { $lt: cutoff },
          }).session(session);

          // Check the condition (!booking) and run the matching branch.
          if (!booking) return;

          // Declare payments for use by the surrounding module or function.
          const payments = await Payment.find({
            tenantId: candidate.tenantId,
            booking: booking._id,
            status: { $in: ["pending", "processing"] },
          }).session(session);

          // Declare now for use by the surrounding module or function.
          const now = new Date();

          // Repeat the enclosed work for each required iteration.
          for (const payment of payments) {
            // Perform the side effect or state update expressed on the following line.
            payment.status = "failed";
            // Perform the side effect or state update expressed on the following line.
            payment.failureReason =
              payment.failureReason || PAYMENT_EXPIRY_REASON;
            // Perform the side effect or state update expressed on the following line.
            payment.failedAt = payment.failedAt || now;
            // Perform the side effect or state update expressed on the following line.
            await payment.save({ session });
            // Perform the side effect or state update expressed on the following line.
            transactionExpiredPayments += 1;
          }

          // Perform the side effect or state update expressed on the following line.
          booking.status = "cancelled";
          // Perform the side effect or state update expressed on the following line.
          booking.paymentStatus = "cancelled";
          // Perform the side effect or state update expressed on the following line.
          booking.cancellationReason = BOOKING_EXPIRY_REASON;
          // Perform the side effect or state update expressed on the following line.
          booking.cancelledAt = booking.cancelledAt || now;

          // Perform the side effect or state update expressed on the following line.
          await booking.save({ session });
          // Perform the side effect or state update expressed on the following line.
          transactionCancelled = true;
        });

        // Check the condition (transactionCancelled) and run the matching branch.
        if (transactionCancelled) {
          // Perform the side effect or state update expressed on the following line.
          cancelledBookings += 1;
          // Perform the side effect or state update expressed on the following line.
          expiredPayments += transactionExpiredPayments;
        }
      } catch (error) {
        // Perform the side effect or state update expressed on the following line.
        console.error(
          `[PAYMENT CLEANUP ERROR] Booking ${candidate._id}: ${error.message}`
        );
      } finally {
        // Perform the side effect or state update expressed on the following line.
        await session.endSession().catch(() => {});
      }
    }

    // Check the condition (cancelledBookings > 0 || expiredPayments > 0) and run the matching branch.
    if (cancelledBookings > 0 || expiredPayments > 0) {
      // Perform the side effect or state update expressed on the following line.
      console.log(
        `[PAYMENT CLEANUP] Cancelled ${cancelledBookings} expired booking(s); ` +
        `expired ${expiredPayments} pending payment(s)`
      );
    }

    // Return the object assembled below to the caller.
    return {
      cancelledBookings,
      expiredPayments,
    };
  });
