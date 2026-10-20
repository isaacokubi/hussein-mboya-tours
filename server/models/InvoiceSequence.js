// Import Mongoose to define the invoice-number counter collection.
import mongoose from "mongoose";
// Import tenant isolation so each organization maintains its own invoice sequence.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

// Store the next invoice sequence separately for each tenant/branch/device/prefix combination.
const invoiceSequenceSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true }, // Organization that owns this counter.
  branchId: { type: String, trim: true, default: "HQ" }, // Tax/accounting branch identifier.
  deviceId: { type: String, trim: true, default: "MAIN" }, // Fiscal device identifier.
  prefix: { type: String, trim: true, default: "INV" }, // Prefix used for generated invoice numbers.
  nextNumber: { type: Number, min: 1, default: 1 }, // Counter value incremented atomically when a number is allocated.
}, { timestamps: true }); // Track when the counter record was created or updated.

// Ensure each tenant branch/device/prefix combination has exactly one sequence record.
invoiceSequenceSchema.index({ tenantId: 1, branchId: 1, deviceId: 1, prefix: 1 }, { unique: true });

// Apply tenant-scoped query/write protections before registering the model.
invoiceSequenceSchema.plugin(tenantPlugin);

// Export the existing model when already registered, otherwise create it.
export default mongoose.models.InvoiceSequence || mongoose.model("InvoiceSequence", invoiceSequenceSchema);
