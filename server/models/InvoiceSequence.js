import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

const invoiceSequenceSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  branchId: { type: String, trim: true, default: "HQ" },
  deviceId: { type: String, trim: true, default: "MAIN" },
  prefix: { type: String, trim: true, default: "INV" },
  nextNumber: { type: Number, min: 1, default: 1 },
}, { timestamps: true });

invoiceSequenceSchema.index({ tenantId: 1, branchId: 1, deviceId: 1, prefix: 1 }, { unique: true });
invoiceSequenceSchema.plugin(tenantPlugin);

export default mongoose.models.InvoiceSequence || mongoose.model("InvoiceSequence", invoiceSequenceSchema);
