/**
 * Purpose: Corporate Account database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

// Declare corporateAccountSchema for use by the surrounding module or function.
const corporateAccountSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  accountNumber: { type: String, trim: true },
  companyName: { type: String, required: true, trim: true, maxlength: 180 },
  kraPin: { type: String, trim: true, uppercase: true, default: "" },
  vatRegistered: { type: Boolean, default: false },
  billingContacts: [{ name: String, email: String, phone: String, title: String }],
  paymentTerms: { type: String, enum: ["immediate", "7_days", "14_days", "30_days", "60_days", "90_days", "staged"], default: "immediate" },
  creditLimit: { type: Number, min: 0, default: 0 },
  currentBalance: { type: Number, min: 0, default: 0 },
  preferredPaymentMethod: { type: String, enum: ["MPESA", "CARD", "BANK_TRANSFER", "CASH"], default: "BANK_TRANSFER" },
  requiresPurchaseOrder: { type: Boolean, default: false },
  status: { type: String, enum: ["active", "suspended", "closed"], default: "active", index: true },
  notes: { type: String, trim: true, default: "" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });

// Perform the side effect or state update expressed on the following line.
corporateAccountSchema.pre("validate", function(next) {
  // Check the condition (!this.accountNumber) and run the matching branch.
  if (!this.accountNumber) this.accountNumber = `CORP-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  // Check the condition (this.currentBalance > this.creditLimit && this.creditLimit > 0) and run the matching branch.
  if (this.currentBalance > this.creditLimit && this.creditLimit > 0) return next(new Error("Corporate account balance exceeds its credit limit."));
  // Perform the side effect or state update expressed on the following line.
  next();
});

// Perform the side effect or state update expressed on the following line.
corporateAccountSchema.index({ tenantId: 1, accountNumber: 1 }, { unique: true });
// Perform the side effect or state update expressed on the following line.
corporateAccountSchema.index({ tenantId: 1, companyName: 1 });
// Perform the side effect or state update expressed on the following line.
corporateAccountSchema.index({ tenantId: 1, kraPin: 1 });
// Perform the side effect or state update expressed on the following line.
corporateAccountSchema.plugin(tenantPlugin);
export default mongoose.models.CorporateAccount || mongoose.model("CorporateAccount", corporateAccountSchema);
