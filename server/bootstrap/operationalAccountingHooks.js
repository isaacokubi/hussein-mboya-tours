import Payment from "../models/Payment.js";
import { postPaymentToLedger } from "../services/operationalAccountingService.js";

if (!Payment.schema.__operationalAccountingHookAttached) {
  Payment.schema.post("save", async function (doc) {
    try { await postPaymentToLedger(doc); }
    catch (error) { console.error("PAYMENT GL POSTING ERROR:", error.message); }
  });
  Payment.schema.__operationalAccountingHookAttached = true;
}
