import * as firestore from "../config/firestore.js";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

const websiteIntegrationEventSchema = new firestore.Schema(
  {
    tenantId: { type: firestore.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    integrationKey: { type: firestore.Schema.Types.ObjectId, ref: "WebsiteIntegrationKey", required: true, index: true },
    eventType: { type: String, enum: ["booking.created", "booking.duplicate", "booking.rejected"], required: true, index: true },
    externalBookingId: { type: String, trim: true, default: "" },
    booking: { type: firestore.Schema.Types.ObjectId, ref: "Booking", default: null, index: true },
    origin: { type: String, trim: true, default: "" },
    ip: { type: String, trim: true, default: "" },
    requestId: { type: String, trim: true, default: "" },
    payload: { type: firestore.Schema.Types.Mixed, default: {} },
    error: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

websiteIntegrationEventSchema.index({ tenantId: 1, externalBookingId: 1, eventType: 1 });
websiteIntegrationEventSchema.plugin(tenantPlugin);

export default firestore.models.WebsiteIntegrationEvent ||
  firestore.model("WebsiteIntegrationEvent", websiteIntegrationEventSchema);