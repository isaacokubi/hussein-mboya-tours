import crypto from "node:crypto";
import Payment from "../models/Payment.js";
import Expense from "../models/Expense.js";
import JournalEntry from "../models/JournalEntry.js";
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import {
  postPaymentToLedger,
  postPaymentRefundToLedger,
  postExpenseToLedger,
  postExpensePaymentToLedger,
} from "../services/operationalAccountingService.js";

const exists = async (tenantId, sourceType, sourceId) =>
  JournalEntry.exists({ tenantId, sourceType, sourceId });

const refundSourceId = (payment, amount, reference = "") =>
  crypto.createHash("sha256")
    .update(`${payment._id}:${String(reference || `REFUND-${payment._id}-${amount}`).trim()}:${amount}`)
    .digest("hex")
    .slice(0, 24);

export const reconcileOperationalAccounting = async (req, res, next) => {
  requireTenantId();
  try {
    const tenantId = req.tenantId;
    const filter = mergeTenantFilter(req, {});
    const summary = {
      scanned: { payments: 0, refunds: 0, expenses: 0, expensePayments: 0 },
      posted: { payments: 0, refunds: 0, expenses: 0, expensePayments: 0 },
      alreadyPosted: { payments: 0, refunds: 0, expenses: 0, expensePayments: 0 },
      errors: [],
    };

    const payments = await Payment.find(filter).sort({ createdAt: 1 }).lean();
    summary.scanned.payments = payments.length;
    for (const payment of payments) {
      if (payment.status === "completed") {
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
        const sourceId = refundSourceId(payment, refundAmount, reference);
        if (await exists(tenantId, "payment_refund", sourceId)) summary.alreadyPosted.refunds += 1;
        else {
          try { await postPaymentRefundToLedger(payment, refundAmount, reference); summary.posted.refunds += 1; }
          catch (error) { summary.errors.push({ type: "refund", id: String(payment._id), message: error.message }); }
        }
      }
    }

    const expenses = await Expense.find(filter).sort({ createdAt: 1 }).lean();
    summary.scanned.expenses = expenses.length;
    for (const expense of expenses) {
      if (["approved", "paid"].includes(String(expense.status || "").toLowerCase())) {
        if (await exists(tenantId, "expense_accrual", expense._id)) summary.alreadyPosted.expenses += 1;
        else {
          try { await postExpenseToLedger(expense); summary.posted.expenses += 1; }
          catch (error) { summary.errors.push({ type: "expense", id: String(expense._id), message: error.message }); }
        }
      }
      if (String(expense.status || "").toLowerCase() === "paid" && expense.supplier) {
        summary.scanned.expensePayments += 1;
        if (await exists(tenantId, "expense_payment", expense._id)) summary.alreadyPosted.expensePayments += 1;
        else {
          try { await postExpensePaymentToLedger(expense); summary.posted.expensePayments += 1; }
          catch (error) { summary.errors.push({ type: "expense_payment", id: String(expense._id), message: error.message }); }
        }
      }
    }

    return res.json({ success: summary.errors.length === 0, tenantId, summary });
  } catch (error) {
    return next(error);
  }
};
