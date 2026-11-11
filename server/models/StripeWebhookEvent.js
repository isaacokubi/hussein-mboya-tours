/**
 * Purpose: Stripe Webhook Event database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

// Declare schema for use by the surrounding module or function.
const schema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  eventId: { type: String, required: true, trim: true },
  eventType: { type: String, required: true, trim: true },
  payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", default: null },
  status: { type: String, enum: ["received", "processing", "processed", "ignored", "failed"], default: "received" },
  processedAt: { type: Date, default: null },
}, { timestamps: true });

// Perform the side effect or state update expressed on the following line.
schema.index({ tenantId: 1, eventId: 1 }, { unique: true });
// Perform the side effect or state update expressed on the following line.
schema.plugin(tenantPlugin);

export default mongoose.models.StripeWebhookEvent || mongoose.model("StripeWebhookEvent", schema);
