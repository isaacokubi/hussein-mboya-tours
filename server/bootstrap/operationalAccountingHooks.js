import Payment from "../models/Payment.js";
import Expense from "../models/Expense.js";
import Invoice from "../models/Invoice.js";
import { postPaymentToLedger, postExpenseToLedger, postInvoiceToLedger } from "../services/operationalAccountingService.js";

if (!Payment.schema.__operationalAccountingHookAttached) {
  Payment.schema.post("save", async function (doc) {
    try { await postPaymentToLedger(doc); } catch (error) { console.error("PAYMENT GL POSTING ERROR:", error.message); }
  });
  Payment.schema.__operationalAccountingHookAttached = true;
}

if (!Expense.schema.__operationalAccountingHookAttached) {
  Expense.schema.post("save", async function (doc) {
    try { await postExpenseToLedger(doc); } catch (error) { console.error("EXPENSE GL POSTING ERROR:", error.message); }
  });
  Expense.schema.__operationalAccountingHookAttached = true;
}

if (!Invoice.schema.__operationalAccountingHookAttached) {
  Invoice.schema.post("save", async function (doc) {
    try { await postInvoiceToLedger(doc); } catch (error) { console.error("INVOICE GL POSTING ERROR:", error.message); }
  });
  Invoice.schema.__operationalAccountingHookAttached = true;
}
