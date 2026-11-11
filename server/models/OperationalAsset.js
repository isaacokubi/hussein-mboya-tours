/**
 * Purpose: Operational Asset database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

// Declare operationalAssetSchema for use by the surrounding module or function.
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

// Perform the side effect or state update expressed on the following line.
operationalAssetSchema.index({ tenantId: 1, type: 1, status: 1, startAt: 1 });
// Perform the side effect or state update expressed on the following line.
operationalAssetSchema.index({ tenantId: 1, code: 1 }, { unique: true, sparse: true });

// Perform the side effect or state update expressed on the following line.
operationalAssetSchema.plugin(tenantPlugin);

export default mongoose.models.OperationalAsset || mongoose.model("OperationalAsset", operationalAssetSchema);
