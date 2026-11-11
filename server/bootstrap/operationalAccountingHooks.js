/**
 * Purpose: operational Accounting Hooks server application module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import Payment from "../models/Payment.js";
// Load ../models/Expense.js so this module can use its exported dependencies.
import Expense from "../models/Expense.js";
// Load ../models/Invoice.js so this module can use its exported dependencies.
import Invoice from "../models/Invoice.js";
// Load ../models/SupplierPayable.js so this module can use its exported dependencies.
import SupplierPayable from "../models/SupplierPayable.js";
// Load ../services/operationalAccountingService.js so this module can use its exported dependencies.
import { postPaymentToLedger, postPaymentRefundToLedger, postExpenseToLedger, postExpensePaymentToLedger, postInvoiceToLedger, postSupplierPayableToLedger, postSupplierPaymentToLedger } from "../services/operationalAccountingService.js";
// Load ../services/invoiceLifecycleService.js so this module can use its exported dependencies.
import { syncInvoiceFromPayment } from "../services/invoiceLifecycleService.js";

// Check the condition (!Payment.schema.__operationalAccountingHookAttached) and run the matching branch.
if (!Payment.schema.__operationalAccountingHookAttached) {
  // Perform the side effect or state update expressed on the following line.
  Payment.schema.post("save", async function(doc) {
    // Declare session for use by the surrounding module or function.
    const session = typeof doc.$session === "function" ? doc.$session() : null;
    // Run this operation with a dedicated error-handling path for failures.
    try { await postPaymentToLedger(doc, { session }); } catch (error) { console.error("PAYMENT GL POSTING ERROR:", error.message); }
    // Run this operation with a dedicated error-handling path for failures.
    try { if (Number(doc.refundedAmount || 0) > 0 && (doc.refundStatus === "completed" || doc.status === "refunded")) await postPaymentRefundToLedger(doc, doc.refundedAmount, doc.refundReference, { session }); } catch (error) { console.error("PAYMENT REFUND GL POSTING ERROR:", error.message); }
    // Run this operation with a dedicated error-handling path for failures.
    try { if (doc.status === "completed") await syncInvoiceFromPayment(doc); } catch (error) { console.error("INVOICE PAYMENT SYNC ERROR:", error.message); }
  });
  // Perform the side effect or state update expressed on the following line.
  Payment.schema.__operationalAccountingHookAttached = true;
}

// Check the condition (!Expense.schema.__operationalAccountingHookAttached) and run the matching branch.
if (!Expense.schema.__operationalAccountingHookAttached) {
  // Perform the side effect or state update expressed on the following line.
  Expense.schema.post("save", async function(doc) {
    // Run this operation with a dedicated error-handling path for failures.
    try { await postExpenseToLedger(doc); } catch (error) { console.error("EXPENSE GL POSTING ERROR:", error.message); }
    // Run this operation with a dedicated error-handling path for failures.
    try { await postExpensePaymentToLedger(doc); } catch (error) { console.error("EXPENSE PAYMENT GL POSTING ERROR:", error.message); }
  });
  // Perform the side effect or state update expressed on the following line.
  Expense.schema.__operationalAccountingHookAttached = true;
}

// Check the condition (!Invoice.schema.__operationalAccountingHookAttached) and run the matching branch.
if (!Invoice.schema.__operationalAccountingHookAttached) {
  // Perform the side effect or state update expressed on the following line.
  Invoice.schema.post("save", async function(doc) {
    // Declare session for use by the surrounding module or function.
    const session = typeof doc.$session === "function" ? doc.$session() : null;
    // Run this operation with a dedicated error-handling path for failures.
    try { await postInvoiceToLedger(doc, { session }); } catch (error) { console.error("INVOICE GL POSTING ERROR:", error.message); }
  });
  // Perform the side effect or state update expressed on the following line.
  Invoice.schema.__operationalAccountingHookAttached = true;
}

// Check the condition (!SupplierPayable.schema.__operationalAccountingHookAttached) and run the matching branch.
if (!SupplierPayable.schema.__operationalAccountingHookAttached) {
  // Perform the side effect or state update expressed on the following line.
  SupplierPayable.schema.post("save", async function(doc) {
    // Run this operation with a dedicated error-handling path for failures.
    try { await postSupplierPayableToLedger(doc); } catch (error) { console.error("SUPPLIER PAYABLE GL POSTING ERROR:", error.message); }
    // Run this operation with a dedicated error-handling path for failures.
    try { if (Number(doc.amountPaid || 0) > 0) await postSupplierPaymentToLedger(doc, doc.amountPaid, doc.paymentReference, doc.paymentMethod); } catch (error) { console.error("SUPPLIER PAYMENT GL POSTING ERROR:", error.message); }
  });
  // Perform the side effect or state update expressed on the following line.
  SupplierPayable.schema.__operationalAccountingHookAttached = true;
}
