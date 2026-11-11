/**
 * Purpose: Supplier database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

// Declare supplierSchema for use by the surrounding module or function.
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

// Perform the side effect or state update expressed on the following line.
supplierSchema.pre("validate", function(next) {
  // Check the condition (!this.supplierNumber) and run the matching branch.
  if (!this.supplierNumber) this.supplierNumber = `SUP-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  // Perform the side effect or state update expressed on the following line.
  next();
});

// Perform the side effect or state update expressed on the following line.
supplierSchema.index({ tenantId: 1, supplierNumber: 1 }, { unique: true });
// Perform the side effect or state update expressed on the following line.
supplierSchema.index({ tenantId: 1, legalName: 1 });
// Perform the side effect or state update expressed on the following line.
supplierSchema.plugin(tenantPlugin);
export default mongoose.models.Supplier || mongoose.model("Supplier", supplierSchema);
