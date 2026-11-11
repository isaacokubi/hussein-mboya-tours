/**
 * Purpose: repair Financial Reconciliation operational script. Main declarations: round, syncBooking, syncInvoice, syncCommission, repairTenant.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load dotenv so this module can use its exported dependencies.
import dotenv from "dotenv";
// Load ../models/Organization.js so this module can use its exported dependencies.
import Organization from "../models/Organization.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Payment.js so this module can use its exported dependencies.
import Payment from "../models/Payment.js";
// Load ../models/Invoice.js so this module can use its exported dependencies.
import Invoice from "../models/Invoice.js";
// Load ../models/Commission.js so this module can use its exported dependencies.
import Commission from "../models/Commission.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { runWithTenant } from "../tenancy/context.js";

// Perform the side effect or state update expressed on the following line.
dotenv.config();

// Declare round for use by the surrounding module or function.
const round = (value) => Math.round(Number(value || 0) * 100) / 100;

// Declare syncBooking for use by the surrounding module or function.
const syncBooking = async (booking, payments) => {
  // Declare totalAmount for use by the surrounding module or function.
  const totalAmount = round(booking.totalAmount);
  // Declare netPaid for use by the surrounding module or function.
  const netPaid = round(payments.reduce((sum, payment) => sum + Math.max(0, Number(payment.amount || 0) - Number(payment.refundedAmount || 0)), 0));
  // Declare totalRefunded for use by the surrounding module or function.
  const totalRefunded = round(payments.reduce((sum, payment) => sum + Math.max(0, Number(payment.refundedAmount || 0)), 0));
  // Declare depositAmount for use by the surrounding module or function.
  const depositAmount = round(Math.min(totalAmount, netPaid));
  // Declare balanceAmount for use by the surrounding module or function.
  const balanceAmount = round(Math.max(0, totalAmount - depositAmount));

  // Declare paymentStatus for use by the surrounding module or function.
  const paymentStatus = totalRefunded >= totalAmount && totalAmount > 0
    ? "refunded"
    : depositAmount >= totalAmount && totalAmount > 0
      ? "paid"
      : depositAmount > 0
        ? "partial"
        : "pending";

  // Declare status for use by the surrounding module or function.
  const status = paymentStatus === "refunded" ? "refunded" : booking.status === "refunded" ? "pending" : booking.status;
  // Declare update for use by the surrounding module or function.
  const update = {};
  // Check the condition (round(booking.depositAmount) !== depositAmount) and run the matching branch.
  if (round(booking.depositAmount) !== depositAmount) update.depositAmount = depositAmount;
  // Check the condition (round(booking.balanceAmount) !== balanceAmount) and run the matching branch.
  if (round(booking.balanceAmount) !== balanceAmount) update.balanceAmount = balanceAmount;
  // Check the condition (booking.paymentStatus !== paymentStatus) and run the matching branch.
  if (booking.paymentStatus !== paymentStatus) update.paymentStatus = paymentStatus;
  // Check the condition (totalRefunded > 0 && round(booking.refundAmount) !== totalRefunded) and run the matching branch.
  if (totalRefunded > 0 && round(booking.refundAmount) !== totalRefunded) update.refundAmount = totalRefunded;
  // Check the condition (totalRefunded > 0 && booking.refundStatus !== "completed") and run the matching branch.
  if (totalRefunded > 0 && booking.refundStatus !== "completed") update.refundStatus = "completed";
  // Check the condition (status !== booking.status) and run the matching branch.
  if (status !== booking.status) update.status = status;

  // Check the condition (Object.keys(update).length) and run the matching branch.
  if (Object.keys(update).length) await Booking.updateOne({ _id: booking._id }, { $set: update });
  // Return the object assembled below to the caller.
  return { changed: Object.keys(update).length > 0, netPaid, totalRefunded };
};

// Declare syncInvoice for use by the surrounding module or function.
const syncInvoice = async (invoice, netPaid, totalRefunded) => {
  // Check the condition (!invoice) and run the matching branch.
  if (!invoice) return false;
  // Declare totalAmount for use by the surrounding module or function.
  const totalAmount = round(invoice.totalAmount);
  // Declare amountPaid for use by the surrounding module or function.
  const amountPaid = round(Math.min(totalAmount, Math.max(0, netPaid)));
  // Declare balance for use by the surrounding module or function.
  const balance = round(Math.max(0, totalAmount - amountPaid));
  // Declare status for use by the surrounding module or function.
  const status = amountPaid <= 0 ? (totalRefunded > 0 ? "refunded" : "pending") : amountPaid >= totalAmount && totalAmount > 0 ? "paid" : "partial";
  // Declare update for use by the surrounding module or function.
  const update = {};
  // Check the condition (round(invoice.amountPaid) !== amountPaid) and run the matching branch.
  if (round(invoice.amountPaid) !== amountPaid) update.amountPaid = amountPaid;
  // Check the condition (round(invoice.balance) !== balance) and run the matching branch.
  if (round(invoice.balance) !== balance) update.balance = balance;
  // Check the condition (invoice.status !== status && !["draft", "cancelled", "overdue"].includ) and run the matching branch.
  if (invoice.status !== status && !["draft", "cancelled", "overdue"].includes(invoice.status)) update.status = status;
  // Check the condition (!Object.keys(update).length) and run the matching branch.
  if (!Object.keys(update).length) return false;
  // Perform the side effect or state update expressed on the following line.
  await Invoice.updateOne({ _id: invoice._id }, { $set: update });
  // Return the expression shown below to the caller.
  return true;
};

// Declare syncCommission for use by the surrounding module or function.
const syncCommission = async (commission, totalRefunded) => {
  // Check the condition (!commission) and run the matching branch.
  if (!commission) return false;
  // Declare amount for use by the surrounding module or function.
  const amount = round(commission.amount);
  // Declare rate for use by the surrounding module or function.
  const rate = Number(commission.rate || 0);
  // Declare refundedAmount for use by the surrounding module or function.
  const refundedAmount = round(Math.min(amount, (totalRefunded * rate) / 100));
  // Declare update for use by the surrounding module or function.
  const update = {
    refundedAmount,
    adjustmentAmount: refundedAmount,
    adjustmentStatus: refundedAmount > 0 ? "posted" : "none",
    adjustmentAt: refundedAmount > 0 ? new Date() : null,
  };
  // Check the condition (refundedAmount > 0) and run the matching branch.
  if (refundedAmount > 0) update.financeNotes = `Commission adjustment posted: KES ${refundedAmount.toFixed(2)} due to booking refund.`;
  // Declare changed for use by the surrounding module or function.
  const changed = round(commission.refundedAmount) !== refundedAmount || round(commission.adjustmentAmount) !== refundedAmount || commission.adjustmentStatus !== update.adjustmentStatus;
  // Check the condition (changed) and run the matching branch.
  if (changed) await Commission.updateOne({ _id: commission._id }, { $set: update });
  // Return the value of changed to the caller.
  return changed;
};

// Declare repairTenant for use by the surrounding module or function.
const repairTenant = async (tenant) => runWithTenant({ tenantId: tenant._id, tenant, role: "admin" }, async () => {
  // Declare bookings for use by the surrounding module or function.
  const bookings = await Booking.find({ isDeleted: { $ne: true } }).select("_id tenantId user customer totalAmount depositAmount balanceAmount paymentStatus status refundAmount refundStatus createdAt updatedAt").lean();
  // Declare bookingChanges for use by the surrounding module or function.
  let bookingChanges = 0;
  // Declare invoiceChanges for use by the surrounding module or function.
  let invoiceChanges = 0;
  // Declare commissionChanges for use by the surrounding module or function.
  let commissionChanges = 0;

  // Repeat the enclosed work for each required iteration.
  for (const booking of bookings) {
    // Declare payments for use by the surrounding module or function.
    let payments = await Payment.find({ booking: booking._id, status: { $in: ["completed", "refunded"] } }).select("amount refundedAmount status").lean();

    // A booking can legitimately be marked paid by an admin/import while the
    // payment ledger is missing. Reconcile the missing cash entry before
    // calculating booking, invoice and commission balances.
    // Check the condition (booking.paymentStatus === "paid" && Number(booking.totalAmount || 0) >) and run the matching branch.
    if (booking.paymentStatus === "paid" && Number(booking.totalAmount || 0) > 0 && (booking.user || booking.customer)) {
      // Declare netPaid for use by the surrounding module or function.
      const netPaid = round(payments.reduce((sum, payment) => sum + Math.max(0, Number(payment.amount || 0) - Number(payment.refundedAmount || 0)), 0));
      // Declare outstanding for use by the surrounding module or function.
      const outstanding = round(Math.max(0, Number(booking.totalAmount || 0) - netPaid));
      // Check the condition (outstanding > 0) and run the matching branch.
      if (outstanding > 0) {
        // Declare paymentMethod for use by the surrounding module or function.
        const paymentMethod = String(booking.paymentMethod || "MPESA").toUpperCase();
        // Declare provider for use by the surrounding module or function.
        const provider = paymentMethod === "BANK_TRANSFER" ? "BANK" : ["CARD", "PAYPAL", "MPESA", "CASH"].includes(paymentMethod) ? paymentMethod : "CASH";
        // Declare createdPayment for use by the surrounding module or function.
        const createdPayment = await Payment.create({
          tenantId: tenant._id,
          customer: booking.user || booking.customer,
          user: booking.user || undefined,
          booking: booking._id,
          provider,
          method: paymentMethod === "BANK_TRANSFER" ? "bank" : paymentMethod.toLowerCase(),
          paymentMethod,
          amount: outstanding,
          currency: "KES",
          status: "completed",
          transactionReference: booking.paymentReference || ("RECONCILE-PAID-" + booking.bookingNumber + "-" + Date.now()),
          transactionId: booking.transactionId || "",
          mpesaReceiptNumber: booking.mpesaReceipt || "",
          paidAt: booking.updatedAt || booking.createdAt || new Date(),
          notes: "Financial reconciliation: completed payment created for paid booking with missing ledger entry.",
        });
        // Perform the side effect or state update expressed on the following line.
        payments = [...payments, { amount: createdPayment.amount, refundedAmount: createdPayment.refundedAmount, status: createdPayment.status }];
      }
    }

    // Check the condition (!payments.length) and run the matching branch.
    if (!payments.length) continue;

    // Declare result for use by the surrounding module or function.
    const result = await syncBooking(booking, payments);
    // Check the condition (result.changed) and run the matching branch.
    if (result.changed) bookingChanges += 1;

    // Declare [invoice, commission] for use by the surrounding module or function.
    const [invoice, commission] = await Promise.all([
      Invoice.findOne({ booking: booking._id, isDeleted: { $ne: true } }).select("_id tenantId totalAmount amountPaid balance status").lean(),
      Commission.findOne({ booking: booking._id, isDeleted: { $ne: true } }).select("_id tenantId amount rate refundedAmount adjustmentAmount adjustmentStatus").lean(),
    ]);
    // Check the condition (await syncInvoice(invoice, result.netPaid, result.totalRefunded)) and run the matching branch.
    if (await syncInvoice(invoice, result.netPaid, result.totalRefunded)) invoiceChanges += 1;
    // Check the condition (await syncCommission(commission, result.totalRefunded)) and run the matching branch.
    if (await syncCommission(commission, result.totalRefunded)) commissionChanges += 1;
  }

  // Return the object assembled below to the caller.
  return { tenantId: String(tenant._id), tenantName: tenant.name, bookingChanges, invoiceChanges, commissionChanges };
});

// Declare main for use by the surrounding module or function.
const main = async () => {
  // Check the condition (!process.env.MONGODB_URI) and run the matching branch.
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required.");
  // Perform the side effect or state update expressed on the following line.
  await mongoose.connect(process.env.MONGODB_URI);

  // Declare tenants for use by the surrounding module or function.
  const tenants = await Organization.find({ isDeleted: { $ne: true } }).select("_id name").lean();
  // Declare results for use by the surrounding module or function.
  const results = [];
  // Repeat the enclosed work for each required iteration.
  for (const tenant of tenants) results.push(await repairTenant(tenant));

  // Perform the side effect or state update expressed on the following line.
  console.log(JSON.stringify({
    success: true,
    tenantsProcessed: results.length,
    bookingChanges: results.reduce((sum, item) => sum + item.bookingChanges, 0),
    invoiceChanges: results.reduce((sum, item) => sum + item.invoiceChanges, 0),
    commissionChanges: results.reduce((sum, item) => sum + item.commissionChanges, 0),
    tenants: results,
  }, null, 2));
};

// Perform the side effect or state update expressed on the following line.
main().catch((error) => {
  // Perform the side effect or state update expressed on the following line.
  console.error(`Financial reconciliation repair failed: ${error.message}`);
  // Perform the side effect or state update expressed on the following line.
  process.exitCode = 1;
}).finally(async () => {
  // Perform the side effect or state update expressed on the following line.
  await mongoose.disconnect().catch(() => {});
});
