import mongoose from "mongoose";
import dotenv from "dotenv";
import Organization from "../models/Organization.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Invoice from "../models/Invoice.js";
import Commission from "../models/Commission.js";
import { runWithTenant } from "../tenancy/context.js";

dotenv.config();

const round = (value) => Math.round(Number(value || 0) * 100) / 100;

const syncBooking = async (booking, payments) => {
  const totalAmount = round(booking.totalAmount);
  const netPaid = round(payments.reduce((sum, payment) => sum + Math.max(0, Number(payment.amount || 0) - Number(payment.refundedAmount || 0)), 0));
  const totalRefunded = round(payments.reduce((sum, payment) => sum + Math.max(0, Number(payment.refundedAmount || 0)), 0));
  const depositAmount = round(Math.min(totalAmount, netPaid));
  const balanceAmount = round(Math.max(0, totalAmount - depositAmount));

  const paymentStatus = totalRefunded >= totalAmount && totalAmount > 0
    ? "refunded"
    : depositAmount >= totalAmount && totalAmount > 0
      ? "paid"
      : depositAmount > 0
        ? "partial"
        : "pending";

  const status = paymentStatus === "refunded" ? "refunded" : booking.status === "refunded" ? "pending" : booking.status;
  const update = {};
  if (round(booking.depositAmount) !== depositAmount) update.depositAmount = depositAmount;
  if (round(booking.balanceAmount) !== balanceAmount) update.balanceAmount = balanceAmount;
  if (booking.paymentStatus !== paymentStatus) update.paymentStatus = paymentStatus;
  if (totalRefunded > 0 && round(booking.refundAmount) !== totalRefunded) update.refundAmount = totalRefunded;
  if (totalRefunded > 0 && booking.refundStatus !== "completed") update.refundStatus = "completed";
  if (status !== booking.status) update.status = status;

  if (Object.keys(update).length) await Booking.updateOne({ _id: booking._id }, { $set: update });
  return { changed: Object.keys(update).length > 0, netPaid, totalRefunded };
};

const syncInvoice = async (invoice, netPaid, totalRefunded) => {
  if (!invoice) return false;
  const totalAmount = round(invoice.totalAmount);
  const amountPaid = round(Math.min(totalAmount, Math.max(0, netPaid)));
  const balance = round(Math.max(0, totalAmount - amountPaid));
  const status = amountPaid <= 0 ? (totalRefunded > 0 ? "refunded" : "pending") : amountPaid >= totalAmount && totalAmount > 0 ? "paid" : "partial";
  const update = {};
  if (round(invoice.amountPaid) !== amountPaid) update.amountPaid = amountPaid;
  if (round(invoice.balance) !== balance) update.balance = balance;
  if (invoice.status !== status && !["draft", "cancelled", "overdue"].includes(invoice.status)) update.status = status;
  if (!Object.keys(update).length) return false;
  await Invoice.updateOne({ _id: invoice._id }, { $set: update });
  return true;
};

const syncCommission = async (commission, totalRefunded) => {
  if (!commission) return false;
  const amount = round(commission.amount);
  const rate = Number(commission.rate || 0);
  const refundedAmount = round(Math.min(amount, (totalRefunded * rate) / 100));
  const update = {
    refundedAmount,
    adjustmentAmount: refundedAmount,
    adjustmentStatus: refundedAmount > 0 ? "posted" : "none",
    adjustmentAt: refundedAmount > 0 ? new Date() : null,
  };
  if (refundedAmount > 0) update.financeNotes = `Commission adjustment posted: KES ${refundedAmount.toFixed(2)} due to booking refund.`;
  const changed = round(commission.refundedAmount) !== refundedAmount || round(commission.adjustmentAmount) !== refundedAmount || commission.adjustmentStatus !== update.adjustmentStatus;
  if (changed) await Commission.updateOne({ _id: commission._id }, { $set: update });
  return changed;
};

const repairTenant = async (tenant) => runWithTenant({ tenantId: tenant._id, tenant, role: "admin" }, async () => {
  const bookings = await Booking.find({ isDeleted: { $ne: true } }).select("_id tenantId totalAmount depositAmount balanceAmount paymentStatus status refundAmount refundStatus").lean();
  let bookingChanges = 0;
  let invoiceChanges = 0;
  let commissionChanges = 0;

  for (const booking of bookings) {
    const payments = await Payment.find({ booking: booking._id, status: { $in: ["completed", "refunded"] } }).select("amount refundedAmount status").lean();
    if (!payments.length) continue;

    const result = await syncBooking(booking, payments);
    if (result.changed) bookingChanges += 1;

    const [invoice, commission] = await Promise.all([
      Invoice.findOne({ booking: booking._id, isDeleted: { $ne: true } }).select("_id tenantId totalAmount amountPaid balance status").lean(),
      Commission.findOne({ booking: booking._id, isDeleted: { $ne: true } }).select("_id tenantId amount rate refundedAmount adjustmentAmount adjustmentStatus").lean(),
    ]);
    if (await syncInvoice(invoice, result.netPaid, result.totalRefunded)) invoiceChanges += 1;
    if (await syncCommission(commission, result.totalRefunded)) commissionChanges += 1;
  }

  return { tenantId: String(tenant._id), tenantName: tenant.name, bookingChanges, invoiceChanges, commissionChanges };
});

const main = async () => {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required.");
  await mongoose.connect(process.env.MONGODB_URI);

  const tenants = await Organization.find({ isDeleted: { $ne: true } }).select("_id name").lean();
  const results = [];
  for (const tenant of tenants) results.push(await repairTenant(tenant));

  console.log(JSON.stringify({
    success: true,
    tenantsProcessed: results.length,
    bookingChanges: results.reduce((sum, item) => sum + item.bookingChanges, 0),
    invoiceChanges: results.reduce((sum, item) => sum + item.invoiceChanges, 0),
    commissionChanges: results.reduce((sum, item) => sum + item.commissionChanges, 0),
    tenants: results,
  }, null, 2));
};

main().catch((error) => {
  console.error(`Financial reconciliation repair failed: ${error.message}`);
  process.exitCode = 1;
}).finally(async () => {
  await mongoose.disconnect().catch(() => {});
});
