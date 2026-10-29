import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

const schema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  eventId: { type: String, required: true, trim: true },
  eventType: { type: String, required: true, trim: true },
  payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", default: null },
  status: { type: String, enum: ["received", "processing", "processed", "ignored", "failed"], default: "received" },
  processedAt: { type: Date, default: null },
}, { timestamps: true });

schema.index({ tenantId: 1, eventId: 1 }, { unique: true });
schema.plugin(tenantPlugin);

export default mongoose.models.StripeWebhookEvent || mongoose.model("StripeWebhookEvent", schema);
