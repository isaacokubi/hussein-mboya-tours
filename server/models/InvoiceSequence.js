/**
 * Purpose: Invoice Sequence database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

// Declare invoiceSequenceSchema for use by the surrounding module or function.
const invoiceSequenceSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  branchId: { type: String, trim: true, default: "HQ" },
  deviceId: { type: String, trim: true, default: "MAIN" },
  prefix: { type: String, trim: true, default: "INV" },
  nextNumber: { type: Number, min: 1, default: 1 },
}, { timestamps: true });

// Perform the side effect or state update expressed on the following line.
invoiceSequenceSchema.index({ tenantId: 1, branchId: 1, deviceId: 1, prefix: 1 }, { unique: true });
// Perform the side effect or state update expressed on the following line.
invoiceSequenceSchema.plugin(tenantPlugin);

export default mongoose.models.InvoiceSequence || mongoose.model("InvoiceSequence", invoiceSequenceSchema);
