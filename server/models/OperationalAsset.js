import * as firestore from "../config/firestore.js";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

const operationalAssetSchema = new firestore.Schema({
  tenantId: { type: firestore.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  type: { type: String, enum: ["vehicle", "driver", "guide", "room", "transfer", "park_fee", "voucher", "traveller_document", "incident"], required: true, index: true },
  name: { type: String, required: true, trim: true },
  code: { type: String, trim: true, index: true },
  status: { type: String, enum: ["active", "available", "inactive", "pending", "completed", "cancelled", "expired"], default: "active", index: true },
  bookingId: { type: firestore.Schema.Types.ObjectId, ref: "Booking", index: true },
  tourId: { type: firestore.Schema.Types.ObjectId, ref: "Tour", index: true },
  assignedTo: { type: firestore.Schema.Types.ObjectId, ref: "User", index: true },
  startAt: Date,
  endAt: Date,
  metadata: { type: firestore.Schema.Types.Mixed, default: {} },
  notes: { type: String, trim: true, default: "" },
  createdBy: { type: firestore.Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: firestore.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true, minimize: false });

operationalAssetSchema.index({ tenantId: 1, type: 1, status: 1, startAt: 1 });
operationalAssetSchema.index({ tenantId: 1, code: 1 }, { unique: true, sparse: true });

operationalAssetSchema.plugin(tenantPlugin);

export default firestore.models.OperationalAsset || firestore.model("OperationalAsset", operationalAssetSchema);
