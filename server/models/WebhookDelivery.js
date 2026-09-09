import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

const webhookDeliverySchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  webhookId: { type: mongoose.Schema.Types.ObjectId, ref: "Webhook", required: true, index: true },
  event: { type: String, required: true, trim: true, index: true },
  eventId: { type: String, required: true, trim: true, index: true },
  attempt: { type: Number, min: 1, default: 1 },
  status: { type: String, enum: ["pending", "delivered", "failed"], default: "pending", index: true },
  httpStatus: { type: Number, default: null },
  response: { type: String, trim: true, default: "" },
  error: { type: String, trim: true, default: "" },
  requestHash: { type: String, trim: true, default: "" },
  deliveredAt: { type: Date, default: null },
  nextRetryAt: { type: Date, default: null },
}, { timestamps: true });

webhookDeliverySchema.index({ tenantId: 1, webhookId: 1, eventId: 1, attempt: 1 }, { unique: true });
webhookDeliverySchema.plugin(tenantPlugin);

export default mongoose.models.WebhookDelivery || mongoose.model("WebhookDelivery", webhookDeliverySchema);
