import mongoose from "mongoose";
import env from "../config/env.js";
import Invoice from "../models/Invoice.js";
import Payment from "../models/Payment.js";
import Expense from "../models/Expense.js";
import CreditDebitNote from "../models/CreditDebitNote.js";
import Commission from "../models/Commission.js";
import Supplier from "../models/Supplier.js";
import PurchaseOrder from "../models/PurchaseOrder.js";
import TourCost from "../models/TourCost.js";
import SupplierPayable from "../models/SupplierPayable.js";
import CorporateAccount from "../models/CorporateAccount.js";
import ChartOfAccount from "../models/ChartOfAccount.js";
import JournalEntry from "../models/JournalEntry.js";
import TaxRule from "../models/TaxRule.js";
import ComplianceRecord from "../models/ComplianceRecord.js";
import PrivacyRequest from "../models/PrivacyRequest.js";
import BackgroundJob from "../models/BackgroundJob.js";

const indexesToReplace={invoices:["booking_1","invoiceNumber_1","tenantId_1_booking_1","tenantId_1_invoiceNumber_1"],payments:["provider_1_transactionReference_1","checkoutRequestID_1","checkoutRequestId_1","mpesaReceiptNumber_1","tenantId_1_provider_1_transactionReference_1","tenantId_1_checkoutRequestID_1","tenantId_1_checkoutRequestId_1","tenantId_1_mpesaReceiptNumber_1"],expenses:["expenseNumber_1","tenantId_1_expenseNumber_1"],creditdebitnotes:["noteNumber_1","tenantId_1_noteNumber_1"],commissions:["booking_1","tenantId_1_booking_1"]};
async function dropIfPresent(collectionName,names){const collection=mongoose.connection.collection(collectionName);const indexes=await collection.listIndexes().toArray();const existing=new Set(indexes.map((index)=>index.name));for(const name of names)if(existing.has(name)){console.log(`Dropping replaceable index ${collectionName}.${name}`);await collection.dropIndex(name);}}
async function main(){if(!env.MONGODB_URI)throw new Error("MONGODB_URI is not configured.");await mongoose.connect(env.MONGODB_URI);await dropIfPresent("invoices",indexesToReplace.invoices);await dropIfPresent("payments",indexesToReplace.payments);await dropIfPresent("expenses",indexesToReplace.expenses);await dropIfPresent("creditdebitnotes",indexesToReplace.creditdebitnotes);await dropIfPresent("commissions",indexesToReplace.commissions);await Promise.all([Invoice.createIndexes(),Payment.createIndexes(),Expense.createIndexes(),CreditDebitNote.createIndexes(),Commission.createIndexes(),Supplier.createIndexes(),PurchaseOrder.createIndexes(),TourCost.createIndexes(),SupplierPayable.createIndexes(),CorporateAccount.createIndexes(),ChartOfAccount.createIndexes(),JournalEntry.createIndexes(),TaxRule.createIndexes(),ComplianceRecord.createIndexes(),PrivacyRequest.createIndexes(),BackgroundJob.createIndexes()]);console.log("Tenant-scoped finance, accounting, tax, operations and compliance indexes reconciled successfully.");}
main().catch((error)=>{console.error("Tenant index reconciliation failed:",error.message);process.exitCode=1;}).finally(async()=>{await mongoose.disconnect();});
