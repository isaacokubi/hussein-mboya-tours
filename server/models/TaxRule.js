/**
 * Purpose: Tax Rule database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

// Declare taxRuleSchema for use by the surrounding module or function.
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

// Perform the side effect or state update expressed on the following line.
taxRuleSchema.index({ tenantId: 1, code: 1 }, { unique: true });
// Perform the side effect or state update expressed on the following line.
taxRuleSchema.index({ tenantId: 1, isActive: 1, effectiveFrom: 1 });
// Perform the side effect or state update expressed on the following line.
taxRuleSchema.plugin(tenantPlugin);
export default mongoose.models.TaxRule || mongoose.model("TaxRule", taxRuleSchema);
