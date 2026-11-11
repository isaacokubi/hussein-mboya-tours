/**
 * Purpose: Webhook Delivery database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

// Declare webhookDeliverySchema for use by the surrounding module or function.
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

// Perform the side effect or state update expressed on the following line.
webhookDeliverySchema.index({ tenantId: 1, webhookId: 1, eventId: 1, attempt: 1 }, { unique: true });
// Perform the side effect or state update expressed on the following line.
webhookDeliverySchema.plugin(tenantPlugin);

export default mongoose.models.WebhookDelivery || mongoose.model("WebhookDelivery", webhookDeliverySchema);
