import * as firestore from "../config/firestore.js";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

const travelCommercialRuleSchema = new firestore.Schema({
  tenantId: { type: firestore.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  type: { type: String, enum: ["dynamic_price", "park_fee", "loyalty", "referral"], required: true, index: true },
  name: { type: String, required: true, trim: true },
  active: { type: Boolean, default: true, index: true },
  priority: { type: Number, default: 0 },
  conditions: { type: firestore.Schema.Types.Mixed, default: {} },
  action: { type: firestore.Schema.Types.Mixed, default: {} },
  metadata: { type: firestore.Schema.Types.Mixed, default: {} },
}, { timestamps: true, minimize: false });

travelCommercialRuleSchema.index({ tenantId: 1, type: 1, active: 1, priority: -1 });
travelCommercialRuleSchema.plugin(tenantPlugin);

export default firestore.models.TravelCommercialRule || firestore.model("TravelCommercialRule", travelCommercialRuleSchema);
