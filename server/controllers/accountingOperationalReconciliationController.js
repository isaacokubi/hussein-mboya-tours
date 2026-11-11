/**
 * Purpose: accounting Operational Reconciliation Controller HTTP controller. Main declarations: exists, hashedSourceId, refundSourceId, reconcileOperationalAccounting.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { publicErrorMessage } from "../utils/publicError.js";
// Load node:crypto so this module can use its exported dependencies.
import crypto from "node:crypto";
// Load ../models/Payment.js so this module can use its exported dependencies.
import Payment from "../models/Payment.js";
// Load ../models/Invoice.js so this module can use its exported dependencies.
import Invoice from "../models/Invoice.js";
// Load ../models/Expense.js so this module can use its exported dependencies.
import Expense from "../models/Expense.js";
// Load ../models/SupplierPayable.js so this module can use its exported dependencies.
import SupplierPayable from "../models/SupplierPayable.js";
// Load ../models/JournalEntry.js so this module can use its exported dependencies.
import JournalEntry from "../models/JournalEntry.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load ../services/operationalAccountingService.js so this module can use its exported dependencies.
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

// Declare exists for use by the surrounding module or function.
const exists = async (tenantId, sourceType, sourceId) =>
  JournalEntry.exists({ tenantId, sourceType, sourceId });

// Declare hashedSourceId for use by the surrounding module or function.
const hashedSourceId = (payable, amount, reference = "") =>
  crypto.createHash("sha256")
    .update(`${payable._id}:${String(reference || `SUPPLIER-${payable._id}-${amount}`).trim()}:${amount}`)
    .digest("hex")
    .slice(0, 24);

// Declare refundSourceId for use by the surrounding module or function.
const refundSourceId = (payment) => payment._id;

// Declare reconcileOperationalAccounting for use by the surrounding module or function.
export const reconcileOperationalAccounting = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = req.tenantId;
    // Declare filter for use by the surrounding module or function.
    const filter = mergeTenantFilter(req, {});
    // Declare summary for use by the surrounding module or function.
    const summary = {
      scanned: { payments: 0, refunds: 0, invoices: 0, expenses: 0, expensePayments: 0, supplierPayables: 0, supplierPayments: 0 },
      posted: { payments: 0, refunds: 0, invoices: 0, expenses: 0, expensePayments: 0, supplierPayables: 0, supplierPayments: 0 },
      alreadyPosted: { payments: 0, refunds: 0, invoices: 0, expenses: 0, expensePayments: 0, supplierPayables: 0, supplierPayments: 0 },
      errors: [],
    };

    // Declare payments for use by the surrounding module or function.
    const payments = await Payment.find(filter).sort({ createdAt: 1 }).lean();
    // Perform the side effect or state update expressed on the following line.
    summary.scanned.payments = payments.length;
    // Repeat the enclosed work for each required iteration.
    for (const payment of payments) {
      // Check the condition (payment.status === "completed" || payment.status === "refunded") and run the matching branch.
      if (payment.status === "completed" || payment.status === "refunded") {
        // Check the condition (await exists(tenantId, "payment", payment._id)) and run the matching branch.
        if (await exists(tenantId, "payment", payment._id)) summary.alreadyPosted.payments += 1;
        else {
          // Run this operation with a dedicated error-handling path for failures.
          try { await postPaymentToLedger(payment); summary.posted.payments += 1; }
          // Handle the error raised by the preceding protected operation.
          catch (error) { summary.errors.push({ type: "payment", id: String(payment._id), message: publicErrorMessage(error) }); }
        }
      }

      // Declare refundAmount for use by the surrounding module or function.
      const refundAmount = Number(payment.refundedAmount || 0);
      // Check the condition ((payment.refundStatus === "completed" || payment.status === "refunded") and run the matching branch.
      if ((payment.refundStatus === "completed" || payment.status === "refunded") && refundAmount > 0) {
        // Perform the side effect or state update expressed on the following line.
        summary.scanned.refunds += 1;
        // Declare reference for use by the surrounding module or function.
        const reference = String(payment.refundReference || `REFUND-${payment._id}-${refundAmount}`).trim();
        // Declare sourceId for use by the surrounding module or function.
        const sourceId = refundSourceId(payment);
        // Run this operation with a dedicated error-handling path for failures.
        try {
          // Declare alreadyPosted for use by the surrounding module or function.
          const alreadyPosted = await exists(tenantId, "payment_refund", sourceId);
          // Check the condition (alreadyPosted) and run the matching branch.
          if (alreadyPosted) summary.alreadyPosted.refunds += 1;
          else await postPaymentRefundToLedger(payment, refundAmount, reference);
          // Check the condition (!alreadyPosted) and run the matching branch.
          if (!alreadyPosted) summary.posted.refunds += 1;
        } catch (error) {
          // Perform the side effect or state update expressed on the following line.
          summary.errors.push({ type: "refund", id: String(payment._id), message: publicErrorMessage(error) });
        }
      }
    }

    // Reconcile issued invoices first so the AR control account is built from
    // the same operational invoice ledger used by AR aging.
    // Declare invoices for use by the surrounding module or function.
    const invoices = await Invoice.find({ ...filter, isDeleted: { $ne: true } }).sort({ createdAt: 1 }).lean();
    // Perform the side effect or state update expressed on the following line.
    summary.scanned.invoices = invoices.length;
    // Perform the side effect or state update expressed on the following line.
    summary.posted.invoices = 0;
    // Perform the side effect or state update expressed on the following line.
    summary.alreadyPosted.invoices = 0;
    // Repeat the enclosed work for each required iteration.
    for (const invoice of invoices) {
      // Check the condition (["draft", "cancelled"].includes(String(invoice.status || "").toLowerCa) and run the matching branch.
      if (["draft", "cancelled"].includes(String(invoice.status || "").toLowerCase())) continue;
      // Check the condition (await exists(tenantId, "invoice", invoice._id)) and run the matching branch.
      if (await exists(tenantId, "invoice", invoice._id)) summary.alreadyPosted.invoices += 1;
      else {
        // Run this operation with a dedicated error-handling path for failures.
        try { await postInvoiceToLedger(invoice); summary.posted.invoices += 1; }
        // Handle the error raised by the preceding protected operation.
        catch (error) { summary.errors.push({ type: "invoice", id: String(invoice._id), message: publicErrorMessage(error) }); }
      }
    }

    // Declare expenses for use by the surrounding module or function.
    const expenses = await Expense.find(filter).sort({ createdAt: 1 }).lean();
    // Perform the side effect or state update expressed on the following line.
    summary.scanned.expenses = expenses.length;
    // Repeat the enclosed work for each required iteration.
    for (const expense of expenses) {
      // Declare linkedPayable for use by the surrounding module or function.
      const linkedPayable = expense.purchaseOrder
        ? await SupplierPayable.findOne({ ...filter, purchaseOrder: expense.purchaseOrder, expense: expense._id }).lean()
        : expense.supplier
          ? await SupplierPayable.findOne({ ...filter, expense: expense._id }).lean()
          : null;
      // Check the condition (["approved", "paid"].includes(String(expense.status || "").toLowerCase) and run the matching branch.
      if (["approved", "paid"].includes(String(expense.status || "").toLowerCase()) && !linkedPayable) {
        // Check the condition (await exists(tenantId, "expense_accrual", expense._id)) and run the matching branch.
        if (await exists(tenantId, "expense_accrual", expense._id)) summary.alreadyPosted.expenses += 1;
        else {
          // Run this operation with a dedicated error-handling path for failures.
          try { await postExpenseToLedger(expense); summary.posted.expenses += 1; }
          // Handle the error raised by the preceding protected operation.
          catch (error) { summary.errors.push({ type: "expense", id: String(expense._id), message: publicErrorMessage(error) }); }
        }
      } else if (linkedPayable && await exists(tenantId, "expense_accrual", expense._id)) {
        // Declare original for use by the surrounding module or function.
        const original = await JournalEntry.findOne({ tenantId, sourceType: "expense_accrual", sourceId: expense._id }).lean();
        // Run this operation with a dedicated error-handling path for failures.
        try {
          // Perform the side effect or state update expressed on the following line.
          await reverseJournalOnce({
            tenantId,
            originalJournal: original,
            sourceType: "expense_accrual_reversal",
            sourceId: expense._id,
            description: `Reverse duplicate expense accrual for supplier payable ${linkedPayable.payableNumber || linkedPayable._id}`,
            reference: `REV-EXP-${expense._id}`,
          });
          // Perform the side effect or state update expressed on the following line.
          summary.posted.expenses += 1;
        } catch (error) {
          // Perform the side effect or state update expressed on the following line.
          summary.errors.push({ type: "expense_reversal", id: String(expense._id), message: publicErrorMessage(error) });
        }
      }
      // Check the condition (String(expense.status || "").toLowerCase() === "paid" && expense.suppl) and run the matching branch.
      if (String(expense.status || "").toLowerCase() === "paid" && expense.supplier) {
        // Perform the side effect or state update expressed on the following line.
        summary.scanned.expensePayments += 1;
        // Declare linkedPayable for use by the surrounding module or function.
        const linkedPayable = expense.purchaseOrder
          ? await SupplierPayable.findOne({ ...filter, purchaseOrder: expense.purchaseOrder, expense: expense._id }).lean()
          : await SupplierPayable.findOne({ ...filter, expense: expense._id }).lean();
        // Check the condition (!linkedPayable) and run the matching branch.
        if (!linkedPayable) {
          // Check the condition (await exists(tenantId, "expense_payment", expense._id)) and run the matching branch.
          if (await exists(tenantId, "expense_payment", expense._id)) summary.alreadyPosted.expensePayments += 1;
          else {
            // Run this operation with a dedicated error-handling path for failures.
            try { await postExpensePaymentToLedger(expense); summary.posted.expensePayments += 1; }
            // Handle the error raised by the preceding protected operation.
            catch (error) { summary.errors.push({ type: "expense_payment", id: String(expense._id), message: publicErrorMessage(error) }); }
          }
        } else if (await exists(tenantId, "expense_payment", expense._id)) {
          // Declare original for use by the surrounding module or function.
          const original = await JournalEntry.findOne({ tenantId, sourceType: "expense_payment", sourceId: expense._id }).lean();
          // Run this operation with a dedicated error-handling path for failures.
          try {
            // Perform the side effect or state update expressed on the following line.
            await reverseJournalOnce({
              tenantId,
              originalJournal: original,
              sourceType: "expense_payment_reversal",
              sourceId: expense._id,
              description: `Reverse duplicate expense payment; linked supplier payable is authoritative`,
              reference: `REV-EXP-PAY-${expense._id}`,
            });
            // Perform the side effect or state update expressed on the following line.
            summary.posted.expensePayments += 1;
          } catch (error) {
            // Perform the side effect or state update expressed on the following line.
            summary.errors.push({ type: "expense_payment_reversal", id: String(expense._id), message: publicErrorMessage(error) });
          }
        }
      }
    }

    // Declare payables for use by the surrounding module or function.
    const payables = await SupplierPayable.find(filter).sort({ createdAt: 1 }).lean();
    // Perform the side effect or state update expressed on the following line.
    summary.scanned.supplierPayables = payables.length;
    // Repeat the enclosed work for each required iteration.
    for (const payable of payables) {
      // Check the condition (String(payable.status || "").toLowerCase() !== "cancelled") and run the matching branch.
      if (String(payable.status || "").toLowerCase() !== "cancelled") {
        // Check the condition (await exists(tenantId, "supplier_payable", payable._id)) and run the matching branch.
        if (await exists(tenantId, "supplier_payable", payable._id)) summary.alreadyPosted.supplierPayables += 1;
        else {
          // Run this operation with a dedicated error-handling path for failures.
          try { await postSupplierPayableToLedger(payable); summary.posted.supplierPayables += 1; }
          // Handle the error raised by the preceding protected operation.
          catch (error) { summary.errors.push({ type: "supplier_payable", id: String(payable._id), message: publicErrorMessage(error) }); }
        }
      }

      // Declare amountPaid for use by the surrounding module or function.
      const amountPaid = Number(payable.amountPaid || 0);
      // Check the condition (amountPaid > 0) and run the matching branch.
      if (amountPaid > 0) {
        // Perform the side effect or state update expressed on the following line.
        summary.scanned.supplierPayments += 1;
        // Declare reference for use by the surrounding module or function.
        const reference = String(payable.paymentReference || `SUPPLIER-${payable._id}-${amountPaid}`).trim();
        // Declare sourceId for use by the surrounding module or function.
        const sourceId = hashedSourceId(payable, amountPaid, reference);
        // Check the condition (await exists(tenantId, "supplier_payable_payment", sourceId)) and run the matching branch.
        if (await exists(tenantId, "supplier_payable_payment", sourceId)) summary.alreadyPosted.supplierPayments += 1;
        else {
          // Run this operation with a dedicated error-handling path for failures.
          try { await postSupplierPaymentToLedger(payable, amountPaid, reference, payable.paymentMethod); summary.posted.supplierPayments += 1; }
          // Handle the error raised by the preceding protected operation.
          catch (error) { summary.errors.push({ type: "supplier_payment", id: String(payable._id), message: publicErrorMessage(error) }); }
        }
      }
    }

    // Return the result of res.json() to the caller.
    return res.json({ success: summary.errors.length === 0, tenantId, summary });
  } catch (error) {
    // Return the result of next() to the caller.
    return next(error);
  }
};
