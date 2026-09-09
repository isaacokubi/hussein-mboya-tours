import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

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

websiteIntegrationEventSchema.index({ tenantId: 1, externalBookingId: 1, eventType: 1 });
websiteIntegrationEventSchema.plugin(tenantPlugin);

export default mongoose.models.WebsiteIntegrationEvent ||
  mongoose.model("WebsiteIntegrationEvent", websiteIntegrationEventSchema);