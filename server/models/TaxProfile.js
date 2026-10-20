// Import Mongoose to define and validate tax profile records.
import mongoose from "mongoose";
// Apply tenant isolation to tax settings so each organization has its own profile.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

// Define the tax/VAT/eTIMS configuration for one tenant.
const taxProfileSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, unique: true, index: true }, // Owning tenant; one tax profile per organization.
  kraPin: { type: String, trim: true, uppercase: true, default: "" }, // Kenyan Revenue Authority PIN.
  kraPinStatus: { type: String, enum: ["not_verified", "verified", "invalid", "pending"], default: "not_verified" }, // Verification state of the KRA PIN.
  kraPinVerifiedAt: { type: Date, default: null }, // Time the KRA PIN was verified.
  vatRegistered: { type: Boolean, default: false }, // Whether the business is VAT registered.
  vatNumber: { type: String, trim: true, uppercase: true, default: "" }, // VAT registration identifier.
  vatValidationStatus: { type: String, enum: ["not_verified", "verified", "invalid", "pending"], default: "not_verified" }, // Verification state of the VAT number.
  vatValidatedAt: { type: Date, default: null }, // Time the VAT number was validated.
  defaultVatRate: { type: Number, min: 0, max: 100, default: 16 }, // Default VAT percentage for taxable invoices.
  taxRegime: { type: String, enum: ["VAT", "ZERO_RATED", "EXEMPT", "NON_VAT"], default: "VAT" }, // Tax regime applied to the tenant.
  etimsEnabled: { type: Boolean, default: false }, // Whether electronic tax invoice submission is enabled.
  etimsSolution: { type: String, enum: ["ONLINE", "CLIENT", "VSCU", "OSCU", "ECITIZEN", "OTHER", ""], default: "" }, // Type of eTIMS integration used.
  etimsEnvironment: { type: String, enum: ["sandbox", "production"], default: "sandbox" }, // eTIMS environment used for submissions.
  etimsDeviceId: { type: String, trim: true, default: "" }, // Fiscal device identifier used in invoice references.
  etimsBranchId: { type: String, trim: true, default: "" }, // Tax branch identifier.
  etimsBranchName: { type: String, trim: true, default: "Head Office" }, // Human-readable branch name.
  etimsTillId: { type: String, trim: true, default: "" }, // Till identifier when required by the integration.
  etimsInvoicePrefix: { type: String, trim: true, default: "INV" }, // Prefix used for invoice numbers.
  etimsCredentialRef: { type: String, trim: true, default: "" }, // Reference to protected eTIMS credentials, not the secret itself.
  etimsAdapterUrl: { type: String, trim: true, default: "" }, // Endpoint of the configured eTIMS adapter.
  etimsLastSyncedAt: { type: Date, default: null }, // Time of the last successful eTIMS synchronization.
  etimsLastError: { type: String, trim: true, default: "" }, // Most recent eTIMS error message.
  etimsRetryCount: { type: Number, default: 0, min: 0 }, // Number of retries attempted for eTIMS submission.
  etimsNextRetryAt: { type: Date, default: null }, // Scheduled time for the next retry.
  complianceNotes: { type: String, trim: true, default: "" }, // Internal tax/compliance notes.
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // User who last updated the tax profile.
}, { timestamps: true }); // Automatically maintain creation and update timestamps.

// Normalize tax identifiers and keep VAT registration aligned with the selected tax regime before saving.
taxProfileSchema.pre("save", function(next) {
  // Trim and uppercase the KRA PIN to avoid formatting-only differences.
  this.kraPin = String(this.kraPin || "").trim().toUpperCase();
  // Trim and uppercase the VAT number.
  this.vatNumber = String(this.vatNumber || "").trim().toUpperCase();
  // Ensure the branch name has a usable default value.
  this.etimsBranchName = String(this.etimsBranchName || "Head Office").trim();
  // A tenant that is not VAT registered cannot remain on the VAT regime.
  if (!this.vatRegistered && this.taxRegime === "VAT") this.taxRegime = "NON_VAT";
  // A VAT-registered tenant should not remain on the non-VAT regime.
  if (this.vatRegistered && this.taxRegime === "NON_VAT") this.taxRegime = "VAT";
  // Continue the Mongoose save lifecycle.
  next();
});

// Apply tenant protections to the schema before registration.
taxProfileSchema.plugin(tenantPlugin);

// Reuse the registered model during reloads or register the TaxProfile model.
const TaxProfile = mongoose.models.TaxProfile || mongoose.model("TaxProfile", taxProfileSchema);
// Export the model for invoice/eTIMS services.
export default TaxProfile;
