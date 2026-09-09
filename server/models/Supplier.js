import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

const supplierSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  supplierNumber: { type: String, trim: true },
  legalName: { type: String, required: true, trim: true, maxlength: 160 },
  tradingName: { type: String, trim: true, default: "" },
  category: { type: String, enum: ["accommodation", "transport", "guide", "driver", "activity", "park", "airline", "restaurant", "equipment", "other"], default: "other", index: true },
  kraPin: { type: String, trim: true, uppercase: true, default: "" },
  vatRegistered: { type: Boolean, default: false },
  contacts: [{ name: String, email: String, phone: String, role: String }],
  address: { type: String, trim: true, default: "" },
  paymentTermsDays: { type: Number, min: 0, max: 365, default: 0 },
  bankDetails: { bankName: String, accountName: String, accountNumber: String, branch: String },
  mpesaPaybill: { type: String, trim: true, default: "" },
  status: { type: String, enum: ["active", "inactive", "blocked"], default: "active", index: true },
  notes: { type: String, trim: true, default: "" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });

supplierSchema.pre("validate", function(next) {
  if (!this.supplierNumber) this.supplierNumber = `SUP-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  next();
});

supplierSchema.index({ tenantId: 1, supplierNumber: 1 }, { unique: true });
supplierSchema.index({ tenantId: 1, legalName: 1 });
supplierSchema.plugin(tenantPlugin);
export default mongoose.models.Supplier || mongoose.model("Supplier", supplierSchema);
