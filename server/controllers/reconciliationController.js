/**
 * Purpose: reconciliation Controller HTTP controller. Main declarations: money, getPaymentReconciliation.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load ../models/Payment.js so this module can use its exported dependencies.
import Payment from "../models/Payment.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Invoice.js so this module can use its exported dependencies.
import Invoice from "../models/Invoice.js";
// Load ../models/Commission.js so this module can use its exported dependencies.
import Commission from "../models/Commission.js";

// Declare money for use by the surrounding module or function.
const money = (value) => Number(Number(value || 0).toFixed(2));
// Declare activePaymentStatuses for use by the surrounding module or function.
const activePaymentStatuses = ["completed", "refunded"];
// Declare pendingPaymentStatuses for use by the surrounding module or function.
const pendingPaymentStatuses = ["pending", "processing"];
// Declare failedPaymentStatuses for use by the surrounding module or function.
const failedPaymentStatuses = ["failed", "cancelled"];

// Declare getPaymentReconciliation for use by the surrounding module or function.
export const getPaymentReconciliation = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = requireTenantId();
    // Declare [payments, bookings, invoices, commissions] for use by the surrounding module or function.
    const [payments, bookings, invoices, commissions] = await Promise.all([
      Payment.find(mergeTenantFilter({})).sort({ createdAt: -1 }).lean(),
      Booking.find(mergeTenantFilter({ isDeleted: { $ne: true } })).select("bookingNumber totalAmount depositAmount balanceAmount paymentStatus status agent commissionRate commissionAmount refundAmount refundStatus").lean(),
      Invoice.find(mergeTenantFilter({ isDeleted: { $ne: true } })).select("booking invoiceNumber totalAmount amountPaid balance status etimsStatus etimsInvoiceNumber buyerPin taxRate taxType").lean(),
      Commission.find(mergeTenantFilter({ isDeleted: { $ne: true } })).select("booking agent bookingAmount rate amount refundedAmount adjustmentAmount adjustmentStatus status").lean(),
    ]);

    // Declare bookingMap for use by the surrounding module or function.
    const bookingMap = new Map(bookings.map((booking) => [String(booking._id), booking]));
    // Declare invoiceMap for use by the surrounding module or function.
    const invoiceMap = new Map(invoices.map((invoice) => [String(invoice.booking), invoice]));
    // Declare commissionMap for use by the surrounding module or function.
    const commissionMap = new Map(commissions.map((commission) => [String(commission.booking), commission]));
    // Declare paymentGroups for use by the surrounding module or function.
    const paymentGroups = new Map();

    // Repeat the enclosed work for each required iteration.
    for (const payment of payments) {
      // Declare key for use by the surrounding module or function.
      const key = String(payment.booking || "");
      // Check the condition (!paymentGroups.has(key)) and run the matching branch.
      if (!paymentGroups.has(key)) paymentGroups.set(key, []);
      // Perform the side effect or state update expressed on the following line.
      paymentGroups.get(key).push(payment);
    }

    // Declare mismatches for use by the surrounding module or function.
    const mismatches = [];
    // Declare missingInvoices for use by the surrounding module or function.
    const missingInvoices = [];
    // Declare overpayments for use by the surrounding module or function.
    const overpayments = [];
    // Declare commissionAdjustments for use by the surrounding module or function.
    const commissionAdjustments = [];

    // Repeat the enclosed work for each required iteration.
    for (const booking of bookings) {
      // Declare key for use by the surrounding module or function.
      const key = String(booking._id);
      // Declare bookingPayments for use by the surrounding module or function.
      const bookingPayments = paymentGroups.get(key) || [];
      // Declare completedPayments for use by the surrounding module or function.
      const completedPayments = bookingPayments.filter((payment) => activePaymentStatuses.includes(payment.status));
      // Declare paidFromPayments for use by the surrounding module or function.
      const paidFromPayments = money(completedPayments.reduce((sum, payment) => sum + Math.max(0, Number(payment.amount || 0) - Number(payment.refundedAmount || 0)), 0));
      // Declare refundedFromPayments for use by the surrounding module or function.
      const refundedFromPayments = money(completedPayments.reduce((sum, payment) => sum + Math.max(0, Number(payment.refundedAmount || 0)), 0));
      // Declare totalAmount for use by the surrounding module or function.
      const totalAmount = money(booking.totalAmount);
      // Declare expectedPaid for use by the surrounding module or function.
      const expectedPaid = money(Math.min(totalAmount, paidFromPayments));
      // Declare expectedBalance for use by the surrounding module or function.
      const expectedBalance = money(Math.max(0, totalAmount - expectedPaid));
      // Declare storedPaid for use by the surrounding module or function.
      const storedPaid = money(booking.depositAmount);
      // Declare storedBalance for use by the surrounding module or function.
      const storedBalance = money(booking.balanceAmount);

      // Check the condition (Math.abs(storedPaid - expectedPaid) > 0.01 || Math.abs(storedBalance -) and run the matching branch.
      if (Math.abs(storedPaid - expectedPaid) > 0.01 || Math.abs(storedBalance - expectedBalance) > 0.01) {
        // Perform the side effect or state update expressed on the following line.
        mismatches.push({ type: "booking_payment", bookingId: booking._id, bookingNumber: booking.bookingNumber, expectedPaid, storedPaid, expectedBalance, storedBalance });
      }

      // Check the condition (paidFromPayments > totalAmount + 0.01) and run the matching branch.
      if (paidFromPayments > totalAmount + 0.01) {
        // Perform the side effect or state update expressed on the following line.
        overpayments.push({ type: "booking_overpayment", bookingId: booking._id, bookingNumber: booking.bookingNumber, totalAmount, paidFromPayments });
      }

      // Declare invoice for use by the surrounding module or function.
      const invoice = invoiceMap.get(key);
      // An invoice is required only when the booking has a qualifying financial payment.
      // Unpaid bookings are not invoice exceptions merely because they lack an invoice.
      // Check the condition (!invoice && completedPayments.length > 0) and run the matching branch.
      if (!invoice && completedPayments.length > 0) {
        // Perform the side effect or state update expressed on the following line.
        missingInvoices.push({ bookingId: booking._id, bookingNumber: booking.bookingNumber, totalAmount, paidAmount: paidFromPayments });
      } else if (invoice) {
        // Declare invoicePaid for use by the surrounding module or function.
        const invoicePaid = money(invoice.amountPaid);
        // Check the condition (Math.abs(invoicePaid - expectedPaid) > 0.01 || Math.abs(money(invoice.) and run the matching branch.
        if (Math.abs(invoicePaid - expectedPaid) > 0.01 || Math.abs(money(invoice.balance) - expectedBalance) > 0.01) {
          // Perform the side effect or state update expressed on the following line.
          mismatches.push({ type: "invoice_payment", bookingId: booking._id, bookingNumber: booking.bookingNumber, invoiceNumber: invoice.invoiceNumber, expectedPaid, invoicePaid, expectedBalance, invoiceBalance: money(invoice.balance) });
        }
        // Declare expectedInvoiceStatus for use by the surrounding module or function.
        const expectedInvoiceStatus = expectedPaid <= 0 ? (refundedFromPayments > 0 ? "refunded" : "pending") : expectedPaid >= totalAmount && totalAmount > 0 ? "paid" : "partial";
        // Check the condition (invoice.status !== expectedInvoiceStatus && !["draft", "cancelled", "o) and run the matching branch.
        if (invoice.status !== expectedInvoiceStatus && !["draft", "cancelled", "overdue"].includes(invoice.status)) {
          // Perform the side effect or state update expressed on the following line.
          mismatches.push({ type: "invoice_status", bookingId: booking._id, bookingNumber: booking.bookingNumber, invoiceNumber: invoice.invoiceNumber, expectedStatus: expectedInvoiceStatus, actualStatus: invoice.status });
        }
      }

      // Declare commission for use by the surrounding module or function.
      const commission = commissionMap.get(key);
      // Check the condition (commission) and run the matching branch.
      if (commission) {
        // Declare expectedCommission for use by the surrounding module or function.
        const expectedCommission = money(Math.max(0, Number(commission.amount || 0) - (refundedFromPayments * Number(commission.rate || 0)) / 100));
        // Declare actualNetCommission for use by the surrounding module or function.
        const actualNetCommission = money(Math.max(0, Number(commission.amount || 0) - Number(commission.refundedAmount || 0)));
        // Check the condition (Math.abs(expectedCommission - actualNetCommission) > 0.01) and run the matching branch.
        if (Math.abs(expectedCommission - actualNetCommission) > 0.01) {
          // Perform the side effect or state update expressed on the following line.
          commissionAdjustments.push({ bookingId: booking._id, bookingNumber: booking.bookingNumber, commissionId: commission._id, expectedNetCommission: expectedCommission, actualNetCommission, refundedFromPayments, adjustmentStatus: commission.adjustmentStatus });
        }
      }
    }

    // Only payments that represent actual or reversed financial activity are orphan exceptions.
    // Failed/cancelled attempts without a booking are operational noise, not reconciliation breaks.
    // Declare orphanPayments for use by the surrounding module or function.
    const orphanPayments = payments
      .filter((payment) => activePaymentStatuses.includes(payment.status) && (!payment.booking || !bookingMap.has(String(payment.booking))))
      .map((payment) => ({ paymentId: payment._id, transactionReference: payment.transactionReference || payment.mpesaReceiptNumber || payment.transactionId || "", status: payment.status, amount: money(payment.amount), refundedAmount: money(payment.refundedAmount) }));

    // Declare missingReceipts for use by the surrounding module or function.
    const missingReceipts = payments.filter((payment) => payment.status === "completed" && String(payment.provider || "").toUpperCase() === "MPESA" && !String(payment.mpesaReceiptNumber || "").trim());

    // Declare duplicateReferences for use by the surrounding module or function.
    const duplicateReferences = [];
    // Declare referenceMap for use by the surrounding module or function.
    const referenceMap = new Map();
    // Repeat the enclosed work for each required iteration.
    for (const payment of payments.filter((item) => activePaymentStatuses.includes(item.status))) {
      // Declare reference for use by the surrounding module or function.
      const reference = String(payment.mpesaReceiptNumber || payment.transactionReference || payment.transactionId || "").trim().toUpperCase();
      // Check the condition (!reference) and run the matching branch.
      if (!reference) continue;
      // Check the condition (referenceMap.has(reference)) and run the matching branch.
      if (referenceMap.has(reference)) duplicateReferences.push({ reference, paymentIds: [referenceMap.get(reference), payment._id] });
      else referenceMap.set(reference, payment._id);
    }

    // Declare summary for use by the surrounding module or function.
    const summary = {
      tenantId,
      totalPayments: payments.length,
      completedPayments: payments.filter((p) => p.status === "completed").length,
      pendingPayments: payments.filter((p) => pendingPaymentStatuses.includes(p.status)).length,
      failedPayments: payments.filter((p) => failedPaymentStatuses.includes(p.status)).length,
      refundedPayments: payments.filter((p) => p.status === "refunded").length,
      totalCollected: money(payments.filter((p) => activePaymentStatuses.includes(p.status)).reduce((sum, p) => sum + Math.max(0, Number(p.amount || 0) - Number(p.refundedAmount || 0)), 0)),
      totalRefunded: money(payments.reduce((sum, p) => sum + Math.max(0, Number(p.refundedAmount || 0)), 0)),
      missingInvoices: missingInvoices.length,
      bookingMismatches: mismatches.filter((m) => m.type === "booking_payment").length,
      invoiceMismatches: mismatches.filter((m) => m.type.startsWith("invoice_")).length,
      overpayments: overpayments.length,
      missingReceipts: missingReceipts.length,
      duplicateReferences: duplicateReferences.length,
      orphanPayments: orphanPayments.length,
      commissionAdjustments: commissionAdjustments.length,
    };

    // Return the result of res.json() to the caller.
    return res.json({
      success: true,
      data: {
        summary,
        mismatches,
        missingInvoices,
        overpayments,
        commissionAdjustments,
        orphanPayments,
        missingReceipts,
        duplicateReferences,
        payments,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};
