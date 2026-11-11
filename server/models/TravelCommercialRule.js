/**
 * Purpose: Travel Commercial Rule database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

// Declare travelCommercialRuleSchema for use by the surrounding module or function.
const travelCommercialRuleSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  type: { type: String, enum: ["dynamic_price", "park_fee", "loyalty", "referral"], required: true, index: true },
  name: { type: String, required: true, trim: true },
  active: { type: Boolean, default: true, index: true },
  priority: { type: Number, default: 0 },
  conditions: { type: mongoose.Schema.Types.Mixed, default: {} },
  action: { type: mongoose.Schema.Types.Mixed, default: {} },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true, minimize: false });

// Perform the side effect or state update expressed on the following line.
travelCommercialRuleSchema.index({ tenantId: 1, type: 1, active: 1, priority: -1 });
// Perform the side effect or state update expressed on the following line.
travelCommercialRuleSchema.plugin(tenantPlugin);

export default mongoose.models.TravelCommercialRule || mongoose.model("TravelCommercialRule", travelCommercialRuleSchema);
