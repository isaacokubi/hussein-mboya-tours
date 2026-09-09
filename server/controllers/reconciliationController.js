import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";
import Invoice from "../models/Invoice.js";
import Commission from "../models/Commission.js";

const money = (value) => Number(Number(value || 0).toFixed(2));
const activePaymentStatuses = ["completed", "refunded"];

export const getPaymentReconciliation = async (req, res, next) => {
  try {
    const tenantId = requireTenantId();
    const [payments, bookings, invoices, commissions] = await Promise.all([
      Payment.find(mergeTenantFilter({})).sort({ createdAt: -1 }).lean(),
      Booking.find(mergeTenantFilter({ isDeleted: { $ne: true } })).select("bookingNumber totalAmount depositAmount balanceAmount paymentStatus status agent commissionRate commissionAmount refundAmount refundStatus").lean(),
      Invoice.find(mergeTenantFilter({ isDeleted: { $ne: true } })).select("booking invoiceNumber totalAmount amountPaid balance status etimsStatus etimsInvoiceNumber buyerPin taxRate taxType").lean(),
      Commission.find(mergeTenantFilter({ isDeleted: { $ne: true } })).select("booking agent bookingAmount rate amount refundedAmount adjustmentAmount adjustmentStatus status").lean(),
    ]);

    const bookingMap = new Map(bookings.map((booking) => [String(booking._id), booking]));
    const invoiceMap = new Map(invoices.map((invoice) => [String(invoice.booking), invoice]));
    const commissionMap = new Map(commissions.map((commission) => [String(commission.booking), commission]));
    const paymentGroups = new Map();

    for (const payment of payments) {
      const key = String(payment.booking || "");
      if (!paymentGroups.has(key)) paymentGroups.set(key, []);
      paymentGroups.get(key).push(payment);
    }

    const mismatches = [];
    const missingInvoices = [];
    const overpayments = [];
    const commissionAdjustments = [];

    for (const booking of bookings) {
      const key = String(booking._id);
      const bookingPayments = paymentGroups.get(key) || [];
      const completedPayments = bookingPayments.filter((payment) => activePaymentStatuses.includes(payment.status));
      const paidFromPayments = money(completedPayments.reduce((sum, payment) => sum + Math.max(0, Number(payment.amount || 0) - Number(payment.refundedAmount || 0)), 0));
      const refundedFromPayments = money(completedPayments.reduce((sum, payment) => sum + Math.max(0, Number(payment.refundedAmount || 0)), 0));
      const totalAmount = money(booking.totalAmount);
      const expectedPaid = money(Math.min(totalAmount, paidFromPayments));
      const expectedBalance = money(Math.max(0, totalAmount - expectedPaid));
      const storedPaid = money(booking.depositAmount);
      const storedBalance = money(booking.balanceAmount);

      if (Math.abs(storedPaid - expectedPaid) > 0.01 || Math.abs(storedBalance - expectedBalance) > 0.01) {
        mismatches.push({ type: "booking_payment", bookingId: booking._id, bookingNumber: booking.bookingNumber, expectedPaid, storedPaid, expectedBalance, storedBalance });
      }

      if (paidFromPayments > totalAmount + 0.01) {
        overpayments.push({ type: "booking_overpayment", bookingId: booking._id, bookingNumber: booking.bookingNumber, totalAmount, paidFromPayments });
      }

      const invoice = invoiceMap.get(key);
      if (!invoice) {
        missingInvoices.push({ bookingId: booking._id, bookingNumber: booking.bookingNumber, totalAmount });
      } else {
        const invoicePaid = money(invoice.amountPaid);
        if (Math.abs(invoicePaid - expectedPaid) > 0.01 || Math.abs(money(invoice.balance) - expectedBalance) > 0.01) {
          mismatches.push({ type: "invoice_payment", bookingId: booking._id, bookingNumber: booking.bookingNumber, invoiceNumber: invoice.invoiceNumber, expectedPaid, invoicePaid, expectedBalance, invoiceBalance: money(invoice.balance) });
        }
        const expectedInvoiceStatus = expectedPaid <= 0 ? (refundedFromPayments > 0 ? "refunded" : "pending") : expectedPaid >= totalAmount ? "paid" : "partial";
        if (invoice.status !== expectedInvoiceStatus && !["draft", "cancelled", "overdue"].includes(invoice.status)) {
          mismatches.push({ type: "invoice_status", bookingId: booking._id, bookingNumber: booking.bookingNumber, invoiceNumber: invoice.invoiceNumber, expectedStatus: expectedInvoiceStatus, actualStatus: invoice.status });
        }
      }

      const commission = commissionMap.get(key);
      if (commission) {
        const expectedCommission = money(Math.max(0, Number(commission.amount || 0) - (refundedFromPayments * Number(commission.rate || 0)) / 100));
        const actualNetCommission = money(Math.max(0, Number(commission.amount || 0) - Number(commission.refundedAmount || 0)));
        if (Math.abs(expectedCommission - actualNetCommission) > 0.01) {
          commissionAdjustments.push({ bookingId: booking._id, bookingNumber: booking.bookingNumber, commissionId: commission._id, expectedNetCommission: expectedCommission, actualNetCommission, refundedFromPayments, adjustmentStatus: commission.adjustmentStatus });
        }
      }
    }

    const orphanPayments = payments.filter((payment) => !payment.booking || !bookingMap.has(String(payment.booking))).map((payment) => ({ paymentId: payment._id, transactionReference: payment.transactionReference || payment.mpesaReceiptNumber || payment.transactionId || "", status: payment.status }));
    const missingReceipts = payments.filter((payment) => payment.status === "completed" && String(payment.provider || "").toUpperCase() === "MPESA" && !String(payment.mpesaReceiptNumber || "").trim());
    const duplicateReferences = [];
    const referenceMap = new Map();
    for (const payment of payments.filter((item) => activePaymentStatuses.includes(item.status))) {
      const reference = String(payment.mpesaReceiptNumber || payment.transactionReference || payment.transactionId || "").trim().toUpperCase();
      if (!reference) continue;
      if (referenceMap.has(reference)) duplicateReferences.push({ reference, paymentIds: [referenceMap.get(reference), payment._id] });
      else referenceMap.set(reference, payment._id);
    }

    const summary = {
      tenantId,
      totalPayments: payments.length,
      completedPayments: payments.filter((p) => p.status === "completed").length,
      pendingPayments: payments.filter((p) => ["pending", "processing"].includes(p.status)).length,
      failedPayments: payments.filter((p) => ["failed", "cancelled"].includes(p.status)).length,
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
    next(error);
  }
};
