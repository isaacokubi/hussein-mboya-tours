import mongoose from "mongoose";
import env from "../config/env.js";
import Invoice from "../models/Invoice.js";
import Payment from "../models/Payment.js";
import Expense from "../models/Expense.js";
import CreditDebitNote from "../models/CreditDebitNote.js";
import Commission from "../models/Commission.js";

// These are indexes whose ownership/uniqueness changed from global to tenant-scoped.
// The tenant-scoped names are included too so a failed migration can be safely rerun.
const indexesToReplace = {
  invoices: [
    "booking_1",
    "invoiceNumber_1",
    "tenantId_1_booking_1",
    "tenantId_1_invoiceNumber_1",
  ],
  payments: [
    "provider_1_transactionReference_1",
    "checkoutRequestID_1",
    "checkoutRequestId_1",
    "mpesaReceiptNumber_1",
    "tenantId_1_provider_1_transactionReference_1",
    "tenantId_1_checkoutRequestID_1",
    "tenantId_1_checkoutRequestId_1",
    "tenantId_1_mpesaReceiptNumber_1",
  ],
  expenses: [
    "expenseNumber_1",
    "tenantId_1_expenseNumber_1",
  ],
  creditdebitnotes: [
    "noteNumber_1",
    "tenantId_1_noteNumber_1",
  ],
  commissions: [
    "booking_1",
    "tenantId_1_booking_1",
  ],
};

async function dropIfPresent(collectionName, names) {
  const collection = mongoose.connection.collection(collectionName);
  const indexes = await collection.listIndexes().toArray();
  const existing = new Set(indexes.map((index) => index.name));

  for (const name of names) {
    if (!existing.has(name)) continue;
    console.log(`Dropping replaceable index ${collectionName}.${name}`);
    await collection.dropIndex(name);
  }
}

async function main() {
  if (!env.MONGODB_URI) throw new Error("MONGODB_URI is not configured.");
  await mongoose.connect(env.MONGODB_URI);

  await dropIfPresent("invoices", indexesToReplace.invoices);
  await dropIfPresent("payments", indexesToReplace.payments);
  await dropIfPresent("expenses", indexesToReplace.expenses);
  await dropIfPresent("creditdebitnotes", indexesToReplace.creditdebitnotes);
  await dropIfPresent("commissions", indexesToReplace.commissions);

  await Invoice.createIndexes();
  await Payment.createIndexes();
  await Expense.createIndexes();
  await CreditDebitNote.createIndexes();
  await Commission.createIndexes();

  console.log("Tenant-scoped finance/payment indexes reconciled successfully.");
}

main()
  .catch((error) => {
    console.error("Tenant index reconciliation failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
