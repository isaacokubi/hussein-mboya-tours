import Payment from "../models/Payment.js";
import Expense from "../models/Expense.js";
import Invoice from "../models/Invoice.js";
import SupplierPayable from "../models/SupplierPayable.js";
import { postPaymentToLedger, postPaymentRefundToLedger, postExpenseToLedger, postExpensePaymentToLedger, postInvoiceToLedger, postSupplierPayableToLedger, postSupplierPaymentToLedger } from "../services/operationalAccountingService.js";
import { syncInvoiceFromPayment } from "../services/invoiceLifecycleService.js";

if (!Payment.schema.__operationalAccountingHookAttached) {
  Payment.schema.post("save", async function(doc) {
    const session = typeof doc.$session === "function" ? doc.$session() : null;
    try { await postPaymentToLedger(doc, { session }); } catch (error) { console.error("PAYMENT GL POSTING ERROR:", error.message); }
    try { if (Number(doc.refundedAmount || 0) > 0 && (doc.refundStatus === "completed" || doc.status === "refunded")) await postPaymentRefundToLedger(doc, doc.refundedAmount, doc.refundReference, { session }); } catch (error) { console.error("PAYMENT REFUND GL POSTING ERROR:", error.message); }
    try { if (doc.status === "completed") await syncInvoiceFromPayment(doc); } catch (error) { console.error("INVOICE PAYMENT SYNC ERROR:", error.message); }
  });
  Payment.schema.__operationalAccountingHookAttached = true;
}

if (!Expense.schema.__operationalAccountingHookAttached) {
  Expense.schema.post("save", async function(doc) {
    try { await postExpenseToLedger(doc); } catch (error) { console.error("EXPENSE GL POSTING ERROR:", error.message); }
    try { await postExpensePaymentToLedger(doc); } catch (error) { console.error("EXPENSE PAYMENT GL POSTING ERROR:", error.message); }
  });
  Expense.schema.__operationalAccountingHookAttached = true;
}

if (!Invoice.schema.__operationalAccountingHookAttached) {
  Invoice.schema.post("save", async function(doc) {
    const session = typeof doc.$session === "function" ? doc.$session() : null;
    try { await postInvoiceToLedger(doc, { session }); } catch (error) { console.error("INVOICE GL POSTING ERROR:", error.message); }
  });
  Invoice.schema.__operationalAccountingHookAttached = true;
}

if (!SupplierPayable.schema.__operationalAccountingHookAttached) {
  SupplierPayable.schema.post("save", async function(doc) {
    try { await postSupplierPayableToLedger(doc); } catch (error) { console.error("SUPPLIER PAYABLE GL POSTING ERROR:", error.message); }
    try { if (Number(doc.amountPaid || 0) > 0) await postSupplierPaymentToLedger(doc, doc.amountPaid, doc.paymentReference, doc.paymentMethod); } catch (error) { console.error("SUPPLIER PAYMENT GL POSTING ERROR:", error.message); }
  });
  SupplierPayable.schema.__operationalAccountingHookAttached = true;
}
