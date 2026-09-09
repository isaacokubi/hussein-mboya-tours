import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

const taxRuleSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  code: { type: String, required: true, trim: true, uppercase: true },
  name: { type: String, required: true, trim: true },
  taxType: { type: String, enum: ["VAT", "ZERO_RATED", "EXEMPT", "NON_VAT", "WITHHOLDING", "LEVY", "OTHER"], default: "VAT" },
  rate: { type: Number, required: true, min: 0, max: 100 },
  inclusive: { type: Boolean, default: false },
  appliesTo: [{ type: String, trim: true }],
  effectiveFrom: { type: Date, default: Date.now },
  effectiveTo: { type: Date, default: null },
  isActive: { type: Boolean, default: true, index: true },
  notes: { type: String, trim: true, default: "" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });

taxRuleSchema.index({ tenantId: 1, code: 1 }, { unique: true });
taxRuleSchema.index({ tenantId: 1, isActive: 1, effectiveFrom: 1 });
taxRuleSchema.plugin(tenantPlugin);
export default mongoose.models.TaxRule || mongoose.model("TaxRule", taxRuleSchema);
