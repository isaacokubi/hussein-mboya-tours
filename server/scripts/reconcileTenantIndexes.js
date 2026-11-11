/**
 * Purpose: reconcile Tenant Indexes operational script. Main declarations: dropIfPresent, main.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../config/env.js so this module can use its exported dependencies.
import env from "../config/env.js";
// Load ../models/Invoice.js so this module can use its exported dependencies.
import Invoice from "../models/Invoice.js";
// Load ../models/Payment.js so this module can use its exported dependencies.
import Payment from "../models/Payment.js";
// Load ../models/Expense.js so this module can use its exported dependencies.
import Expense from "../models/Expense.js";
// Load ../models/CreditDebitNote.js so this module can use its exported dependencies.
import CreditDebitNote from "../models/CreditDebitNote.js";
// Load ../models/Commission.js so this module can use its exported dependencies.
import Commission from "../models/Commission.js";
// Load ../models/Supplier.js so this module can use its exported dependencies.
import Supplier from "../models/Supplier.js";
// Load ../models/PurchaseOrder.js so this module can use its exported dependencies.
import PurchaseOrder from "../models/PurchaseOrder.js";
// Load ../models/TourCost.js so this module can use its exported dependencies.
import TourCost from "../models/TourCost.js";
// Load ../models/SupplierPayable.js so this module can use its exported dependencies.
import SupplierPayable from "../models/SupplierPayable.js";
// Load ../models/CorporateAccount.js so this module can use its exported dependencies.
import CorporateAccount from "../models/CorporateAccount.js";
// Load ../models/ChartOfAccount.js so this module can use its exported dependencies.
import ChartOfAccount from "../models/ChartOfAccount.js";
// Load ../models/JournalEntry.js so this module can use its exported dependencies.
import JournalEntry from "../models/JournalEntry.js";
// Load ../models/TaxRule.js so this module can use its exported dependencies.
import TaxRule from "../models/TaxRule.js";
// Load ../models/ComplianceRecord.js so this module can use its exported dependencies.
import ComplianceRecord from "../models/ComplianceRecord.js";
// Load ../models/PrivacyRequest.js so this module can use its exported dependencies.
import PrivacyRequest from "../models/PrivacyRequest.js";
// Load ../models/BackgroundJob.js so this module can use its exported dependencies.
import BackgroundJob from "../models/BackgroundJob.js";
// Load ../models/PaymentLink.js so this module can use its exported dependencies.
import PaymentLink from "../models/PaymentLink.js";
// Load ../models/ApiKey.js so this module can use its exported dependencies.
import ApiKey from "../models/ApiKey.js";
// Load ../models/Webhook.js so this module can use its exported dependencies.
import Webhook from "../models/Webhook.js";
// Declare indexesToReplace for use by the surrounding module or function.
const indexesToReplace={invoices:["booking_1","invoiceNumber_1","tenantId_1_booking_1","tenantId_1_invoiceNumber_1"],payments:["provider_1_transactionReference_1","checkoutRequestID_1","checkoutRequestId_1","mpesaReceiptNumber_1","tenantId_1_provider_1_transactionReference_1","tenantId_1_checkoutRequestID_1","tenantId_1_checkoutRequestId_1","tenantId_1_mpesaReceiptNumber_1"],expenses:["expenseNumber_1","tenantId_1_expenseNumber_1"],creditdebitnotes:["noteNumber_1","tenantId_1_noteNumber_1"],commissions:["booking_1","tenantId_1_booking_1"]};
// Define dropIfPresent; its parameters and body implement this operation.
async function dropIfPresent(collectionName,names){const collection=mongoose.connection.collection(collectionName);const indexes=await collection.listIndexes().toArray();const existing=new Set(indexes.map(index=>index.name));for(const name of names)if(existing.has(name)){console.log(`Dropping replaceable index ${collectionName}.${name}`);await collection.dropIndex(name);}}
// Define main; its parameters and body implement this operation.
async function main(){if(!env.MONGODB_URI)throw new Error("MONGODB_URI is not configured.");await mongoose.connect(env.MONGODB_URI);await dropIfPresent("invoices",indexesToReplace.invoices);await dropIfPresent("payments",indexesToReplace.payments);await dropIfPresent("expenses",indexesToReplace.expenses);await dropIfPresent("creditdebitnotes",indexesToReplace.creditdebitnotes);await dropIfPresent("commissions",indexesToReplace.commissions);await Promise.all([Invoice.createIndexes(),Payment.createIndexes(),Expense.createIndexes(),CreditDebitNote.createIndexes(),Commission.createIndexes(),Supplier.createIndexes(),PurchaseOrder.createIndexes(),TourCost.createIndexes(),SupplierPayable.createIndexes(),CorporateAccount.createIndexes(),ChartOfAccount.createIndexes(),JournalEntry.createIndexes(),TaxRule.createIndexes(),ComplianceRecord.createIndexes(),PrivacyRequest.createIndexes(),BackgroundJob.createIndexes(),PaymentLink.createIndexes(),ApiKey.createIndexes(),Webhook.createIndexes()]);console.log("Tenant-scoped finance, accounting, tax, operations, compliance, payment-link and developer indexes reconciled successfully.");}
// Perform the side effect or state update expressed on the following line.
main().catch(error=>{console.error("Tenant index reconciliation failed:",error.message);process.exitCode=1;}).finally(async()=>{await mongoose.disconnect();});
