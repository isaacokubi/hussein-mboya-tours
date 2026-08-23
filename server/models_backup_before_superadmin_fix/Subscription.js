import mongoose from "mongoose";
import tenantIsolationPlugin from "../utils/tenantIsolationPlugin.js";
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";

const subscriptionSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, unique: true, index: true },
  plan: { type: String, enum: ["starter", "professional", "business", "enterprise"], default: "starter" },
  status: { type: String, enum: ["trialing", "active", "past_due", "cancelled", "expired"], default: "trialing", index: true },
  provider: { type: String, enum: ["internal", "stripe", "mpesa", "manual"], default: "internal" },
  providerSubscriptionId: { type: String, default: "", trim: true },
  seats: { type: Number, default: 5, min: 1 },
  trialStartsAt: { type: Date, required: true },
  trialEndsAt: { type: Date, required: true },
  currentPeriodStartsAt: { type: Date, default: null },
  currentPeriodEndsAt: { type: Date, default: null },
  cancelledAt: { type: Date, default: null },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

subscriptionSchema.index({ tenantId: 1, status: 1 });
subscriptionSchema.index({ trialEndsAt: 1, status: 1 });








subscriptionSchema.plugin(tenantIsolationPlugin);
export default mongoose.models.Subscription || mongoose.model("Subscription", subscriptionSchema);
