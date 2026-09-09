import mongoose from "mongoose";

const operationalAssetSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  type: { type: String, enum: ["vehicle", "driver", "guide", "room", "transfer", "park_fee", "voucher", "traveller_document", "incident"], required: true, index: true },
  name: { type: String, required: true, trim: true },
  code: { type: String, trim: true, index: true },
  status: { type: String, enum: ["active", "available", "inactive", "pending", "completed", "cancelled", "expired"], default: "active", index: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", index: true },
  tourId: { type: mongoose.Schema.Types.ObjectId, ref: "Tour", index: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  startAt: Date,
  endAt: Date,
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  notes: { type: String, trim: true, default: "" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true, minimize: false });

operationalAssetSchema.index({ tenantId: 1, type: 1, status: 1, startAt: 1 });
operationalAssetSchema.index({ tenantId: 1, code: 1 }, { unique: true, sparse: true });

export default mongoose.models.OperationalAsset || mongoose.model("OperationalAsset", operationalAssetSchema);
