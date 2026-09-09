import mongoose from "mongoose";

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

travelCommercialRuleSchema.index({ tenantId: 1, type: 1, active: 1, priority: -1 });
export default mongoose.models.TravelCommercialRule || mongoose.model("TravelCommercialRule", travelCommercialRuleSchema);
