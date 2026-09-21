import crypto from "node:crypto";
import Payment from "../models/Payment.js";
import Invoice from "../models/Invoice.js";
import Expense from "../models/Expense.js";
import SupplierPayable from "../models/SupplierPayable.js";
import JournalEntry from "../models/JournalEntry.js";
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import {
  postPaymentToLedger,
  postPaymentRefundToLedger,
  postInvoiceToLedger,
  postExpenseToLedger,
  postExpensePaymentToLedger,
  postSupplierPayableToLedger,
  postSupplierPaymentToLedger,
  reverseJournalOnce,
} from "../services/operationalAccountingService.js";

const exists = async (tenantId, sourceType, sourceId) =>
  JournalEntry.exists({ tenantId, sourceType, sourceId });

const hashedSourceId = (payable, amount, reference = "") =>
  crypto.createHash("sha256")
    .update(`${payable._id}:${String(reference || `SUPPLIER-${payable._id}-${amount}`).trim()}:${amount}`)
    .digest("hex")
    .slice(0, 24);

const refundSourceId = (payment) => payment._id;

export const reconcileOperationalAccounting = async (req, res, next) => {
  requireTenantId();
  try {
    const tenantId = req.tenantId;
    const filter = mergeTenantFilter(req, {});
    const summary = {
      scanned: { payments: 0, refunds: 0, invoices: 0, expenses: 0, expensePayments: 0, supplierPayables: 0, supplierPayments: 0 },
      posted: { payments: 0, refunds: 0, invoices: 0, expenses: 0, expensePayments: 0, supplierPayables: 0, supplierPayments: 0 },
      alreadyPosted: { payments: 0, refunds: 0, invoices: 0, expenses: 0, expensePayments: 0, supplierPayables: 0, supplierPayments: 0 },
      errors: [],
    };

    const payments = await Payment.find(filter).sort({ createdAt: 1 }).lean();
    summary.scanned.payments = payments.length;
    for (const payment of payments) {
      if (payment.status === "completed" || payment.status === "refunded") {
        if (await exists(tenantId, "payment", payment._id)) summary.alreadyPosted.payments += 1;
        else {
          try { await postPaymentToLedger(payment); summary.posted.payments += 1; }
          catch (error) { summary.errors.push({ type: "payment", id: String(payment._id), message: error.message }); }
        }
      }

      const refundAmount = Number(payment.refundedAmount || 0);
      if ((payment.refundStatus === "completed" || payment.status === "refunded") && refundAmount > 0) {
        summary.scanned.refunds += 1;
        const reference = String(payment.refundReference || `REFUND-${payment._id}-${refundAmount}`).trim();
        const sourceId = refundSourceId(payment);
        try {
          const alreadyPosted = await exists(tenantId, "payment_refund", sourceId);
          if (alreadyPosted) summary.alreadyPosted.refunds += 1;
          else await postPaymentRefundToLedger(payment, refundAmount, reference);
          if (!alreadyPosted) summary.posted.refunds += 1;
        } catch (error) {
          summary.errors.push({ type: "refund", id: String(payment._id), message: error.message });
        }
      }
    }

    // Reconcile issued invoices first so the AR control account is built from
    // the same operational invoice ledger used by AR aging.
    const invoices = await Invoice.find({ ...filter, isDeleted: { $ne: true } }).sort({ createdAt: 1 }).lean();
    summary.scanned.invoices = invoices.length;
    summary.posted.invoices = 0;
    summary.alreadyPosted.invoices = 0;
    for (const invoice of invoices) {
      if (["draft", "cancelled"].includes(String(invoice.status || "").toLowerCase())) continue;
      if (await exists(tenantId, "invoice", invoice._id)) summary.alreadyPosted.invoices += 1;
      else {
        try { await postInvoiceToLedger(invoice); summary.posted.invoices += 1; }
        catch (error) { summary.errors.push({ type: "invoice", id: String(invoice._id), message: error.message }); }
      }
    }

    const expenses = await Expense.find(filter).sort({ createdAt: 1 }).lean();
    summary.scanned.expenses = expenses.length;
    for (const expense of expenses) {
      const linkedPayable = expense.purchaseOrder
        ? await SupplierPayable.findOne({ ...filter, purchaseOrder: expense.purchaseOrder, expense: expense._id }).lean()
        : expense.supplier
          ? await SupplierPayable.findOne({ ...filter, expense: expense._id }).lean()
          : null;
      if (["approved", "paid"].includes(String(expense.status || "").toLowerCase()) && !linkedPayable) {
        if (await exists(tenantId, "expense_accrual", expense._id)) summary.alreadyPosted.expenses += 1;
        else {
          try { await postExpenseToLedger(expense); summary.posted.expenses += 1; }
          catch (error) { summary.errors.push({ type: "expense", id: String(expense._id), message: error.message }); }
        }
      } else if (linkedPayable && await exists(tenantId, "expense_accrual", expense._id)) {
        const original = await JournalEntry.findOne({ tenantId, sourceType: "expense_accrual", sourceId: expense._id }).lean();
        try {
          await reverseJournalOnce({
            tenantId,
            originalJournal: original,
            sourceType: "expense_accrual_reversal",
            sourceId: expense._id,
            description: `Reverse duplicate expense accrual for supplier payable ${linkedPayable.payableNumber || linkedPayable._id}`,
            reference: `REV-EXP-${expense._id}`,
          });
          summary.posted.expenses += 1;
        } catch (error) {
          summary.errors.push({ type: "expense_reversal", id: String(expense._id), message: error.message });
        }
      }
      if (String(expense.status || "").toLowerCase() === "paid" && expense.supplier) {
        summary.scanned.expensePayments += 1;
        const linkedPayable = expense.purchaseOrder
          ? await SupplierPayable.findOne({ ...filter, purchaseOrder: expense.purchaseOrder, expense: expense._id }).lean()
          : await SupplierPayable.findOne({ ...filter, expense: expense._id }).lean();
        if (!linkedPayable) {
          if (await exists(tenantId, "expense_payment", expense._id)) summary.alreadyPosted.expensePayments += 1;
          else {
            try { await postExpensePaymentToLedger(expense); summary.posted.expensePayments += 1; }
            catch (error) { summary.errors.push({ type: "expense_payment", id: String(expense._id), message: error.message }); }
          }
        } else if (await exists(tenantId, "expense_payment", expense._id)) {
          const original = await JournalEntry.findOne({ tenantId, sourceType: "expense_payment", sourceId: expense._id }).lean();
          try {
            await reverseJournalOnce({
              tenantId,
              originalJournal: original,
              sourceType: "expense_payment_reversal",
              sourceId: expense._id,
              description: `Reverse duplicate expense payment; linked supplier payable is authoritative`,
              reference: `REV-EXP-PAY-${expense._id}`,
            });
            summary.posted.expensePayments += 1;
          } catch (error) {
            summary.errors.push({ type: "expense_payment_reversal", id: String(expense._id), message: error.message });
          }
        }
      }
    }

    const payables = await SupplierPayable.find(filter).sort({ createdAt: 1 }).lean();
    summary.scanned.supplierPayables = payables.length;
    for (const payable of payables) {
      if (String(payable.status || "").toLowerCase() !== "cancelled") {
        if (await exists(tenantId, "supplier_payable", payable._id)) summary.alreadyPosted.supplierPayables += 1;
        else {
          try { await postSupplierPayableToLedger(payable); summary.posted.supplierPayables += 1; }
          catch (error) { summary.errors.push({ type: "supplier_payable", id: String(payable._id), message: error.message }); }
        }
      }

      const amountPaid = Number(payable.amountPaid || 0);
      if (amountPaid > 0) {
        summary.scanned.supplierPayments += 1;
        const reference = String(payable.paymentReference || `SUPPLIER-${payable._id}-${amountPaid}`).trim();
        const sourceId = hashedSourceId(payable, amountPaid, reference);
        if (await exists(tenantId, "supplier_payable_payment", sourceId)) summary.alreadyPosted.supplierPayments += 1;
        else {
          try { await postSupplierPaymentToLedger(payable, amountPaid, reference, payable.paymentMethod); summary.posted.supplierPayments += 1; }
          catch (error) { summary.errors.push({ type: "supplier_payment", id: String(payable._id), message: error.message }); }
        }
      }
    }

    return res.json({ success: summary.errors.length === 0, tenantId, summary });
  } catch (error) {
    return next(error);
  }
};
