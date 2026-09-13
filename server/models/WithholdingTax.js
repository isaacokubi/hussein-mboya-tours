import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

const withholdingTaxSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  payee: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", default: null, index: true },
  payeeName: { type: String, trim: true, required: true },
  payeePin: { type: String, trim: true, uppercase: true, default: "" },
  sourceType: { type: String, enum: ["supplier_payment", "expense", "commission", "other"], default: "supplier_payment", index: true },
  sourceId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
  reference: { type: String, trim: true, required: true },
  description: { type: String, trim: true, default: "" },
  taxType: { type: String, trim: true, default: "WHT" },
  taxPeriod: { type: String, trim: true, required: true, match: /^\\d{4}-(0[1-9]|1[0-2])$/ },
  baseAmount: { type: Number, min: 0, required: true },
  rate: { type: Number, min: 0, max: 100, required: true },
  taxAmount: { type: Number, min: 0, required: true },
  currency: { type: String, uppercase: true, default: "KES" },
  status: { type: String, enum: ["accrued", "remitted", "cancelled"], default: "accrued", index: true },
  certificateNumber: { type: String, trim: true, default: "" },
  paymentReference: { type: String, trim: true, default: "" },
  remittedAt: { type: Date, default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });

withholdingTaxSchema.index({ tenantId: 1, reference: 1 }, { unique: true });
withholdingTaxSchema.index({ tenantId: 1, taxPeriod: 1, status: 1 });
withholdingTaxSchema.plugin(tenantPlugin);
export default mongoose.models.WithholdingTax || mongoose.model("WithholdingTax", withholdingTaxSchema);
