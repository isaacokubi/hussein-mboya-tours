import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

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

chartOfAccountSchema.index({ tenantId: 1, code: 1 }, { unique: true });
chartOfAccountSchema.index({ tenantId: 1, type: 1, active: 1 });
chartOfAccountSchema.plugin(tenantPlugin);

export default mongoose.models.ChartOfAccount || mongoose.model("ChartOfAccount", chartOfAccountSchema);
