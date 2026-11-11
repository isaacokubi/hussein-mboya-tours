/**
 * Purpose: Accounting Subledger database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

// Declare accountingSubledgerSchema for use by the surrounding module or function.
const accountingSubledgerSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  type: { type: String, enum: ["inventory", "payroll", "accrual", "prepayment", "fx"], required: true, index: true },
  reference: { type: String, required: true, trim: true },
  transactionDate: { type: Date, default: Date.now, index: true },
  description: { type: String, required: true, trim: true, maxlength: 300 },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: "KES", uppercase: true, trim: true },
  exchangeRate: { type: Number, default: 1, min: 0 },
  baseAmount: { type: Number, min: 0 },
  quantity: { type: Number, default: 0 },
  unitCost: { type: Number, default: 0, min: 0 },
  accountCode: { type: String, trim: true, default: "" },
  contraAccountCode: { type: String, trim: true, default: "" },
  status: { type: String, enum: ["draft", "posted", "settled", "reversed"], default: "draft", index: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  journalEntry: { type: mongoose.Schema.Types.ObjectId, ref: "JournalEntry", default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  postedAt: { type: Date, default: null },
}, { timestamps: true });

// Perform the side effect or state update expressed on the following line.
accountingSubledgerSchema.index({ tenantId: 1, type: 1, reference: 1 }, { unique: true });
// Perform the side effect or state update expressed on the following line.
accountingSubledgerSchema.index({ tenantId: 1, type: 1, transactionDate: -1 });
// Perform the side effect or state update expressed on the following line.
accountingSubledgerSchema.plugin(tenantPlugin);

export default mongoose.models.AccountingSubledger || mongoose.model("AccountingSubledger", accountingSubledgerSchema);
