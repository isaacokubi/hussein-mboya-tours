import dotenv from "dotenv";
import * as firestore from "../config/firestore.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Tour from "../models/Tour.js";
import { runWithTenant } from "../tenancy/context.js";

dotenv.config({ path: "./server/.env" });
dotenv.config();

const round = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

export function calculateBookingLedger({ booking, payments = [], tour = null }) {
  const totalAmount = Math.max(0, Number(booking?.totalAmount || 0));
  let paid = payments.reduce(
    (sum, payment) => sum + Math.max(0, Number(payment.amount || 0) - Number(payment.refundedAmount || 0)),
    0,
  );
  if (paid <= 0 && booking?.paymentStatus === "paid") paid = totalAmount;
  paid = Math.min(totalAmount, round(paid));

  let depositAmount = Number(booking?.depositAmount || 0);
  if (tour) {
    const configured = Number(tour.depositRequired || 0);
    depositAmount = String(tour.depositType || "fixed").toLowerCase() === "percentage"
      ? round(Math.min(totalAmount, totalAmount * configured / 100))
      : round(Math.min(totalAmount, configured));
  }

  const balanceAmount = Math.max(0, round(totalAmount - paid));
  const paymentStatus = paid >= totalAmount && totalAmount > 0
    ? "paid"
    : paid > 0
      ? "partial"
      : booking?.paymentStatus;

  return { amountPaid: paid, depositAmount, balanceAmount, paymentStatus };
}

export async function migrateBookingPaymentLedger({ dryRun = false } = {}) {
  await firestore.connectFirestore();
  const bookings = await Booking.find({}).lean();
  let processed = 0;
  let changed = 0;
  let skippedMissingTenant = 0;

  for (const booking of bookings) {
    if (!booking.tenantId) {
      skippedMissingTenant += 1;
      continue;
    }

    await runWithTenant({ tenantId: booking.tenantId }, async () => {
      const payments = await Payment.find({
        booking: booking._id,
        status: { $in: ["completed", "refunded"] },
      }).select("amount refundedAmount").lean();

      const tour = booking.tour
        ? await Tour.findById(booking.tour).select("depositRequired depositType").lean()
        : null;

      const next = calculateBookingLedger({ booking, payments, tour });
      const before = JSON.stringify({
        amountPaid: Number(booking.amountPaid || 0),
        balanceAmount: Number(booking.balanceAmount || 0),
        depositAmount: Number(booking.depositAmount || 0),
        paymentStatus: booking.paymentStatus,
      });
      const after = JSON.stringify(next);

      processed += 1;
      if (before !== after) {
        changed += 1;
        if (!dryRun) {
          await Booking.updateOne(
            { _id: booking._id, tenantId: booking.tenantId },
            { $set: next },
          );
        }
      }
    });
  }

  return { processed, changed, skippedMissingTenant, dryRun };
}

const run = async () => {
  const result = await migrateBookingPaymentLedger({
    dryRun: String(process.env.DRY_RUN || "false").toLowerCase() === "true",
  });
  console.log(JSON.stringify(result, null, 2));
  await firestore.connection.close();
};

if (import.meta.url === `file://${process.argv[1]}`) {
  run().catch(async (error) => {
    console.error("Booking payment ledger migration failed:", error);
    try { await firestore.connection.close(); } catch {}
    process.exitCode = 1;
  });
}
