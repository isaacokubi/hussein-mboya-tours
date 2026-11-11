/**
 * Purpose: Credit Debit Note database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

// Declare creditDebitNoteSchema for use by the surrounding module or function.
const creditDebitNoteSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  noteNumber: { type: String, trim: true },
  type: { type: String, enum: ["credit", "debit"], required: true },
  originalInvoice: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice", required: true },
  originalInvoiceNumber: { type: String, trim: true, required: true },
  originalEtimsInvoiceNumber: { type: String, trim: true, default: "" },
  etimsSolution: { type: String, trim: true, default: "" },
  reason: { type: String, trim: true, required: true },
  amount: { type: Number, min: 0, required: true },
  taxAmount: { type: Number, min: 0, default: 0 },
  totalAmount: { type: Number, min: 0, required: true },
  taxRate: { type: Number, min: 0, max: 100, default: 0 },
  status: { type: String, enum: ["draft", "issued", "cancelled"], default: "draft", index: true },
  etimsStatus: { type: String, enum: ["not_submitted", "pending", "synced", "failed"], default: "not_submitted" },
  etimsReference: { type: String, trim: true, default: "" },
  etimsReceiptNumber: { type: String, trim: true, default: "" },
  etimsLastError: { type: String, trim: true, default: "" },
  etimsSubmissionAttempts: { type: Number, default: 0, min: 0 },
  etimsLastAttemptAt: { type: Date, default: null },
  etimsSubmittedAt: { type: Date, default: null },
  etimsResponse: { type: mongoose.Schema.Types.Mixed, default: {} },
  issuedAt: { type: Date, default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });

// Perform the side effect or state update expressed on the following line.
creditDebitNoteSchema.pre("save", function(next) {
  // Check the condition (!this.noteNumber) and run the matching branch.
  if (!this.noteNumber) this.noteNumber = `${this.type === "credit" ? "CN" : "DN"}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  // Check the condition (this.status === "issued" && !this.issuedAt) and run the matching branch.
  if (this.status === "issued" && !this.issuedAt) this.issuedAt = new Date();
  // Perform the side effect or state update expressed on the following line.
  next();
});

// Perform the side effect or state update expressed on the following line.
creditDebitNoteSchema.index({ tenantId: 1, noteNumber: 1 }, { unique: true });
// Perform the side effect or state update expressed on the following line.
creditDebitNoteSchema.index({ tenantId: 1, originalInvoice: 1, createdAt: -1 });
// Perform the side effect or state update expressed on the following line.
creditDebitNoteSchema.index({ tenantId: 1, etimsStatus: 1, createdAt: -1 });
// Perform the side effect or state update expressed on the following line.
creditDebitNoteSchema.plugin(tenantPlugin);

export default mongoose.models.CreditDebitNote || mongoose.model("CreditDebitNote", creditDebitNoteSchema);
