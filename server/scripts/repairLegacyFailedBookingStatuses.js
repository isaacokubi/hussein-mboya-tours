import { backgroundTenantFilter } from "../tenancy/backgroundTenantFilter.js";
import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";

/**
 * One-time migration for bookings created before the M-Pesa failure lifecycle
 * fix. Older callbacks could leave a booking as `pending` even though the
 * related Payment was already `failed`.
 *
 * Safety rules:
 * - Only bookings currently shown as pending/failed are considered.
 * - The latest payment attempt for a booking determines the migration.
 * - A booking is changed to `failed` only when its latest payment is failed.
 * - A booking with any later completed payment is never changed to failed.
 * - Default mode is DRY RUN. Pass --apply to write changes.
 *
 * Usage from server/:
 *   node scripts/repairLegacyFailedBookingStatuses.js
 *   node scripts/repairLegacyFailedBookingStatuses.js --apply
 */

const isApply = process.argv.includes("--apply");
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!mongoUri) {
  console.error("Missing MONGODB_URI/MONGO_URI environment variable.");
  process.exit(1);
}

const formatPayment = (payment) => ({
  id: payment._id?.toString(),
  booking: payment.booking?.toString(),
  status: payment.status,
  provider: payment.provider,
  method: payment.method,
  amount: payment.amount,
  failureReason: payment.failureReason || "",
  createdAt: payment.createdAt,
  updatedAt: payment.updatedAt,
});

try {
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB.");
  console.log(isApply ? "MODE: APPLY" : "MODE: DRY RUN");
  console.log("------------------------------------------------------------");

  const candidateBookings = await Booking.find({
    status: { $in: ["pending", "failed"] },
    paymentStatus: { $in: ["pending", "failed", "cancelled"] },
  })
    .select("_id bookingNumber status paymentStatus totalAmount balanceAmount user customer createdAt")
    .lean();

  if (!candidateBookings.length) {
    console.log("No candidate bookings found.");
    await mongoose.disconnect();
    process.exit(0);
  }

  const bookingIds = candidateBookings.map((booking) => booking._id);

  const payments = await Payment.find({
    booking: { $in: bookingIds },
  })
    .sort({ createdAt: -1, _id: -1 })
    .lean();

  const paymentsByBooking = new Map();
  for (const payment of payments) {
    const bookingId = payment.booking?.toString();
    if (!bookingId || paymentsByBooking.has(bookingId)) continue;
    paymentsByBooking.set(bookingId, payment);
  }

  let inspected = 0;
  let eligible = 0;
  let changed = 0;
  let skippedCompleted = 0;
  let skippedNonFailedLatest = 0;
  let skippedNoPayment = 0;

  for (const booking of candidateBookings) {
    inspected += 1;
    const bookingId = booking._id.toString();
    const latestPayment = paymentsByBooking.get(bookingId);

    if (!latestPayment) {
      skippedNoPayment += 1;
      continue;
    }

    // A completed payment is authoritative: never mark such a booking failed.
    if (latestPayment.status === "completed") {
      skippedCompleted += 1;
      continue;
    }

    // Only repair bookings whose latest payment attempt actually failed.
    if (latestPayment.status !== "failed") {
      skippedNonFailedLatest += 1;
      continue;
    }

    eligible += 1;

    console.log(`BOOKING ${booking.bookingNumber || bookingId}`);
    console.log(`  current: status=${booking.status}, paymentStatus=${booking.paymentStatus}`);
    console.log(`  latest payment:`);
    console.log(`    ${JSON.stringify(formatPayment(latestPayment))}`);
    console.log(`  action: status=failed, paymentStatus=failed`);

    if (isApply) {
      const result = await Booking.updateOne(
        {
          _id: booking._id,
          status: { $in: ["pending", "failed"] },
          paymentStatus: { $in: ["pending", "failed", "cancelled"] },
        },
        {
          $set: {
            status: "failed",
            paymentStatus: "failed",
          },
        },
      );

      if (result.modifiedCount === 1) {
        changed += 1;
      }
    }

    console.log("------------------------------------------------------------");
  }

  console.log("SUMMARY");
  console.log(`  inspected: ${inspected}`);
  console.log(`  eligible failed-payment bookings: ${eligible}`);
  console.log(`  changed: ${changed}`);
  console.log(`  skipped because latest payment completed: ${skippedCompleted}`);
  console.log(`  skipped because latest payment is not failed: ${skippedNonFailedLatest}`);
  console.log(`  skipped because no payment exists: ${skippedNoPayment}`);

  if (!isApply && eligible > 0) {
    console.log("");
    console.log("DRY RUN ONLY: no database records were changed.");
    console.log("Run with --apply to perform the migration.");
  }

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
} catch (error) {
  console.error("Legacy booking migration failed:");
  console.error(error);
  try {
    await mongoose.disconnect();
  } catch {
    // Ignore disconnect errors while handling the original failure.
  }
  process.exit(1);
}
