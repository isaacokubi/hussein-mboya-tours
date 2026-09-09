import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

const tourCostSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  tour: { type: mongoose.Schema.Types.ObjectId, ref: "Tour", required: true, index: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null, index: true },
  category: { type: String, enum: ["accommodation", "transport", "guide", "driver", "activity", "supplier", "park", "meals", "miscellaneous"], required: true, index: true },
  description: { type: String, required: true, trim: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", default: null },
  purchaseOrder: { type: mongoose.Schema.Types.ObjectId, ref: "PurchaseOrder", default: null },
  quantity: { type: Number, min: 0, default: 1 },
  unitCost: { type: Number, min: 0, required: true },
  taxAmount: { type: Number, min: 0, default: 0 },
  totalCost: { type: Number, min: 0, default: 0 },
  costDate: { type: Date, default: Date.now },
  status: { type: String, enum: ["estimated", "committed", "actual", "cancelled"], default: "estimated", index: true },
  notes: { type: String, trim: true, default: "" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });

tourCostSchema.pre("validate", function(next) {
  this.totalCost = Math.round(((this.quantity || 0) * (this.unitCost || 0) + (this.taxAmount || 0)) * 100) / 100;
  next();
});
tourCostSchema.index({ tenantId: 1, tour: 1, category: 1, status: 1 });
tourCostSchema.plugin(tenantPlugin);
export default mongoose.models.TourCost || mongoose.model("TourCost", tourCostSchema);
