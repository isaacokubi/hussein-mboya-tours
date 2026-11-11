/**
 * Purpose: Chart Of Account database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

// Declare chartOfAccountSchema for use by the surrounding module or function.
const chartOfAccountSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  code: { type: String, required: true, trim: true, uppercase: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  type: { type: String, enum: ["asset", "liability", "equity", "revenue", "expense"], required: true, index: true },
  subtype: { type: String, trim: true, default: "" },
  currency: { type: String, uppercase: true, default: "KES" },
  active: { type: Boolean, default: true, index: true },
  system: { type: Boolean, default: false },
  description: { type: String, trim: true, default: "" },
}, { timestamps: true });

// Perform the side effect or state update expressed on the following line.
chartOfAccountSchema.index({ tenantId: 1, code: 1 }, { unique: true });
// Perform the side effect or state update expressed on the following line.
chartOfAccountSchema.index({ tenantId: 1, type: 1, active: 1 });
// Perform the side effect or state update expressed on the following line.
chartOfAccountSchema.plugin(tenantPlugin);

export default mongoose.models.ChartOfAccount || mongoose.model("ChartOfAccount", chartOfAccountSchema);
