import mongoose from "mongoose";
import env from "../config/env.js";
import Invoice from "../models/Invoice.js";
import Payment from "../models/Payment.js";
import Expense from "../models/Expense.js";
import CreditDebitNote from "../models/CreditDebitNote.js";

const legacyIndexes = {
  invoices: ["booking_1", "invoiceNumber_1"],
  payments: [
    "provider_1_transactionReference_1",
    "checkoutRequestID_1",
    "checkoutRequestId_1",
    "mpesaReceiptNumber_1",
  ],
  expenses: ["expenseNumber_1"],
  creditdebitnotes: ["noteNumber_1"],
};

async function dropIfPresent(collectionName, names) {
  const collection = mongoose.connection.collection(collectionName);
  const indexes = await collection.listIndexes().toArray();
  const existing = new Set(indexes.map((index) => index.name));
  for (const name of names) {
    if (!existing.has(name)) continue;
    console.log(`Dropping legacy index ${collectionName}.${name}`);
    await collection.dropIndex(name);
  }
}

async function main() {
  if (!env.MONGODB_URI) throw new Error("MONGODB_URI is not configured.");
  await mongoose.connect(env.MONGODB_URI);

  await dropIfPresent("invoices", legacyIndexes.invoices);
  await dropIfPresent("payments", legacyIndexes.payments);
  await dropIfPresent("expenses", legacyIndexes.expenses);
  await dropIfPresent("creditdebitnotes", legacyIndexes.creditdebitnotes);

  await Promise.all([
    Invoice.createIndexes(),
    Payment.createIndexes(),
    Expense.createIndexes(),
    CreditDebitNote.createIndexes(),
  ]);

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
