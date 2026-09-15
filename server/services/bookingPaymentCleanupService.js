import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import { runWithTenant } from "../tenancy/context.js";

const PAYMENT_EXPIRY_REASON =
  "M-Pesa payment request expired after 30 minutes without successful confirmation.";

const BOOKING_EXPIRY_REASON =
  "Automatically cancelled after payment timeout.";

export const cancelExpiredPendingBookings = async () =>
  runWithTenant({ bypass: true }, async () => {
    const cutoff = new Date(Date.now() - 30 * 60 * 1000);

    const expiredBookings = await Booking.find({
      status: "pending",
      paymentStatus: "pending",
      createdAt: { $lt: cutoff },
    })
      .select("_id tenantId")
      .lean();

    let cancelledBookings = 0;
    let expiredPayments = 0;

    for (const candidate of expiredBookings) {
      const session = await mongoose.startSession();

      try {
        let transactionCancelled = false;
        let transactionExpiredPayments = 0;

        await session.withTransaction(async () => {
          // Re-check the lifecycle state inside the transaction so a payment
          // callback or another worker cannot race this expiry operation.
          const booking = await Booking.findOne({
            _id: candidate._id,
            tenantId: candidate.tenantId,
            status: "pending",
            paymentStatus: "pending",
            createdAt: { $lt: cutoff },
          }).session(session);

          if (!booking) return;

          const payments = await Payment.find({
            tenantId: candidate.tenantId,
            booking: booking._id,
            status: { $in: ["pending", "processing"] },
          }).session(session);

          const now = new Date();

          for (const payment of payments) {
            payment.status = "failed";
            payment.failureReason =
              payment.failureReason || PAYMENT_EXPIRY_REASON;
            payment.failedAt = payment.failedAt || now;
            await payment.save({ session });
            transactionExpiredPayments += 1;
          }

          booking.status = "cancelled";
          booking.paymentStatus = "cancelled";
          booking.cancellationReason = BOOKING_EXPIRY_REASON;
          booking.cancelledAt = booking.cancelledAt || now;

          await booking.save({ session });
          transactionCancelled = true;
        });

        if (transactionCancelled) {
          cancelledBookings += 1;
          expiredPayments += transactionExpiredPayments;
        }
      } catch (error) {
        console.error(
          `[PAYMENT CLEANUP ERROR] Booking ${candidate._id}: ${error.message}`
        );
      } finally {
        await session.endSession().catch(() => {});
      }
    }

    if (cancelledBookings > 0 || expiredPayments > 0) {
      console.log(
        `[PAYMENT CLEANUP] Cancelled ${cancelledBookings} expired booking(s); ` +
        `expired ${expiredPayments} pending payment(s)`
      );
    }

    return {
      cancelledBookings,
      expiredPayments,
    };
  });
