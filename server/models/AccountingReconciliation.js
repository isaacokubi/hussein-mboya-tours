/**
 * Purpose: Accounting Reconciliation database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

// Declare accountingReconciliationSchema for use by the surrounding module or function.
const accountingReconciliationSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  sourceType: { type: String, enum: ["bank", "mpesa", "card", "gateway", "cash", "tax", "supplier", "customer"], required: true, index: true },
  externalReference: { type: String, required: true, trim: true },
  transactionDate: { type: Date, default: Date.now, index: true },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: "KES", uppercase: true, trim: true },
  accountCode: { type: String, trim: true, default: "" },
  journalEntry: { type: mongoose.Schema.Types.ObjectId, ref: "JournalEntry", default: null },
  status: { type: String, enum: ["unmatched", "matched", "exception", "void"], default: "unmatched", index: true },
  notes: { type: String, trim: true, maxlength: 1000, default: "" },
  matchedAt: { type: Date, default: null },
  matchedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });

// Perform the side effect or state update expressed on the following line.
accountingReconciliationSchema.index({ tenantId: 1, sourceType: 1, externalReference: 1 }, { unique: true });
// Perform the side effect or state update expressed on the following line.
accountingReconciliationSchema.index({ tenantId: 1, status: 1, transactionDate: -1 });
// Perform the side effect or state update expressed on the following line.
accountingReconciliationSchema.plugin(tenantPlugin);

export default mongoose.models.AccountingReconciliation || mongoose.model("AccountingReconciliation", accountingReconciliationSchema);
