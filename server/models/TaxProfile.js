import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

const taxProfileSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, unique: true, index: true },
  kraPin: { type: String, trim: true, uppercase: true, default: "" },
  vatRegistered: { type: Boolean, default: false },
  vatNumber: { type: String, trim: true, uppercase: true, default: "" },
  defaultVatRate: { type: Number, min: 0, max: 100, default: 16 },
  taxRegime: { type: String, enum: ["VAT", "ZERO_RATED", "EXEMPT", "NON_VAT"], default: "VAT" },
  etimsEnabled: { type: Boolean, default: false },
  etimsSolution: { type: String, enum: ["ONLINE", "CLIENT", "VSCU", "OSCU", "ECITIZEN", "OTHER", ""], default: "" },
  etimsDeviceId: { type: String, trim: true, default: "" },
  etimsInvoicePrefix: { type: String, trim: true, default: "INV" },
  etimsLastSyncedAt: { type: Date, default: null },
  complianceNotes: { type: String, trim: true, default: "" },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });

taxProfileSchema.plugin(tenantPlugin);
export default mongoose.models.TaxProfile || mongoose.model("TaxProfile", taxProfileSchema);
