/**
 * Purpose: Tax Profile database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

// Declare taxProfileSchema for use by the surrounding module or function.
const taxProfileSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, unique: true, index: true },
  kraPin: { type: String, trim: true, uppercase: true, default: "" },
  kraPinStatus: { type: String, enum: ["not_verified", "verified", "invalid", "pending"], default: "not_verified" },
  kraPinVerifiedAt: { type: Date, default: null },
  vatRegistered: { type: Boolean, default: false },
  vatNumber: { type: String, trim: true, uppercase: true, default: "" },
  vatValidationStatus: { type: String, enum: ["not_verified", "verified", "invalid", "pending"], default: "not_verified" },
  vatValidatedAt: { type: Date, default: null },
  defaultVatRate: { type: Number, min: 0, max: 100, default: 16 },
  taxRegime: { type: String, enum: ["VAT", "ZERO_RATED", "EXEMPT", "NON_VAT"], default: "VAT" },
  etimsEnabled: { type: Boolean, default: false },
  etimsSolution: { type: String, enum: ["ONLINE", "CLIENT", "VSCU", "OSCU", "ECITIZEN", "OTHER", ""], default: "" },
  etimsEnvironment: { type: String, enum: ["sandbox", "production"], default: "sandbox" },
  etimsDeviceId: { type: String, trim: true, default: "" },
  etimsBranchId: { type: String, trim: true, default: "" },
  etimsBranchName: { type: String, trim: true, default: "Head Office" },
  etimsTillId: { type: String, trim: true, default: "" },
  etimsInvoicePrefix: { type: String, trim: true, default: "INV" },
  etimsCredentialRef: { type: String, trim: true, default: "" },
  etimsAdapterUrl: { type: String, trim: true, default: "" },
  etimsLastSyncedAt: { type: Date, default: null },
  etimsLastError: { type: String, trim: true, default: "" },
  etimsRetryCount: { type: Number, default: 0, min: 0 },
  etimsNextRetryAt: { type: Date, default: null },
  complianceNotes: { type: String, trim: true, default: "" },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });

// Perform the side effect or state update expressed on the following line.
taxProfileSchema.pre("save", function(next) {
  // Perform the side effect or state update expressed on the following line.
  this.kraPin = String(this.kraPin || "").trim().toUpperCase();
  // Perform the side effect or state update expressed on the following line.
  this.vatNumber = String(this.vatNumber || "").trim().toUpperCase();
  // Perform the side effect or state update expressed on the following line.
  this.etimsBranchName = String(this.etimsBranchName || "Head Office").trim();
  // Check the condition (!this.vatRegistered && this.taxRegime === "VAT") and run the matching branch.
  if (!this.vatRegistered && this.taxRegime === "VAT") this.taxRegime = "NON_VAT";
  // Check the condition (this.vatRegistered && this.taxRegime === "NON_VAT") and run the matching branch.
  if (this.vatRegistered && this.taxRegime === "NON_VAT") this.taxRegime = "VAT";
  // Perform the side effect or state update expressed on the following line.
  next();
});

// Perform the side effect or state update expressed on the following line.
taxProfileSchema.methods.recordEtimsFailure = function(message = "") {
  // Perform the side effect or state update expressed on the following line.
  this.etimsRetryCount = Number(this.etimsRetryCount || 0) + 1;
  // Perform the side effect or state update expressed on the following line.
  this.etimsLastError = String(message || "").trim();
  // Declare delayMinutes for use by the surrounding module or function.
  const delayMinutes = Math.min(1440, 5 * (2 ** Math.min(this.etimsRetryCount - 1, 8)));
  // Perform the side effect or state update expressed on the following line.
  this.etimsNextRetryAt = new Date(Date.now() + delayMinutes * 60 * 1000);
  // Return the result of this.save() to the caller.
  return this.save();
};

// Perform the side effect or state update expressed on the following line.
taxProfileSchema.plugin(tenantPlugin);
export default mongoose.models.TaxProfile || mongoose.model("TaxProfile", taxProfileSchema);
