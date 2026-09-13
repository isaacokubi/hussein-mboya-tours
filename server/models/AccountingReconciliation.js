import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

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

accountingReconciliationSchema.index({ tenantId: 1, sourceType: 1, externalReference: 1 }, { unique: true });
accountingReconciliationSchema.index({ tenantId: 1, status: 1, transactionDate: -1 });
accountingReconciliationSchema.plugin(tenantPlugin);

export default mongoose.models.AccountingReconciliation || mongoose.model("AccountingReconciliation", accountingReconciliationSchema);
