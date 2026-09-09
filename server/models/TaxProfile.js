import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

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

taxProfileSchema.pre("save", function(next) {
  this.kraPin = String(this.kraPin || "").trim().toUpperCase();
  this.vatNumber = String(this.vatNumber || "").trim().toUpperCase();
  this.etimsBranchName = String(this.etimsBranchName || "Head Office").trim();
  if (!this.vatRegistered && this.taxRegime === "VAT") this.taxRegime = "NON_VAT";
  if (this.vatRegistered && this.taxRegime === "NON_VAT") this.taxRegime = "VAT";
  next();
});

taxProfileSchema.methods.recordEtimsFailure = function(message = "") {
  this.etimsRetryCount = Number(this.etimsRetryCount || 0) + 1;
  this.etimsLastError = String(message || "").trim();
  const delayMinutes = Math.min(1440, 5 * (2 ** Math.min(this.etimsRetryCount - 1, 8)));
  this.etimsNextRetryAt = new Date(Date.now() + delayMinutes * 60 * 1000);
  return this.save();
};

taxProfileSchema.plugin(tenantPlugin);
export default mongoose.models.TaxProfile || mongoose.model("TaxProfile", taxProfileSchema);
