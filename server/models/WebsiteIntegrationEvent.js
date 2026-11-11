/**
 * Purpose: Website Integration Event database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

// Declare websiteIntegrationEventSchema for use by the surrounding module or function.
const websiteIntegrationEventSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    integrationKey: { type: mongoose.Schema.Types.ObjectId, ref: "WebsiteIntegrationKey", required: true, index: true },
    eventType: { type: String, enum: ["booking.created", "booking.duplicate", "booking.rejected"], required: true, index: true },
    externalBookingId: { type: String, trim: true, default: "" },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null, index: true },
    origin: { type: String, trim: true, default: "" },
    ip: { type: String, trim: true, default: "" },
    requestId: { type: String, trim: true, default: "" },
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
    error: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

// Perform the side effect or state update expressed on the following line.
websiteIntegrationEventSchema.index({ tenantId: 1, externalBookingId: 1, eventType: 1 });
// Perform the side effect or state update expressed on the following line.
websiteIntegrationEventSchema.plugin(tenantPlugin);

export default mongoose.models.WebsiteIntegrationEvent ||
  mongoose.model("WebsiteIntegrationEvent", websiteIntegrationEventSchema);