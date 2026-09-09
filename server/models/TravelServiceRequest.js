import mongoose from "mongoose";

const { Schema } = mongoose;

const TravelServiceRequestSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
  booking: { type: Schema.Types.ObjectId, ref: "Booking", index: true },
  customer: { type: Schema.Types.ObjectId, ref: "User", index: true },
  type: { type: String, enum: ["airport_transfer", "accommodation", "rooming_list", "travel_document", "insurance", "manifest", "incident", "schedule", "cancellation", "special_service"], required: true, index: true },
  status: { type: String, enum: ["open", "in_progress", "awaiting_customer", "resolved", "cancelled"], default: "open", index: true },
  priority: { type: String, enum: ["low", "normal", "high", "urgent"], default: "normal", index: true },
  title: { type: String, required: true, trim: true, maxlength: 180 },
  description: { type: String, trim: true, maxlength: 5000 },
  requestedDate: Date,
  dueDate: Date,
  assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
  location: { type: String, trim: true, maxlength: 300 },
  contactPhone: { type: String, trim: true, maxlength: 30 },
  metadata: { type: Schema.Types.Mixed, default: {} },
  resolution: { type: String, trim: true, maxlength: 5000 },
  resolvedAt: Date,
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

TravelServiceRequestSchema.index({ tenantId: 1, type: 1, status: 1, requestedDate: 1 });
TravelServiceRequestSchema.index({ tenantId: 1, booking: 1, createdAt: -1 });

export default mongoose.models.TravelServiceRequest || mongoose.model("TravelServiceRequest", TravelServiceRequestSchema);
