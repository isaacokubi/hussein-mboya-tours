import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

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

corporateAccountSchema.pre("validate", function(next) {
  if (!this.accountNumber) this.accountNumber = `CORP-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  if (this.currentBalance > this.creditLimit && this.creditLimit > 0) return next(new Error("Corporate account balance exceeds its credit limit."));
  next();
});

corporateAccountSchema.index({ tenantId: 1, accountNumber: 1 }, { unique: true });
corporateAccountSchema.index({ tenantId: 1, companyName: 1 });
corporateAccountSchema.index({ tenantId: 1, kraPin: 1 });
corporateAccountSchema.plugin(tenantPlugin);
export default mongoose.models.CorporateAccount || mongoose.model("CorporateAccount", corporateAccountSchema);
