import * as firestore from "../config/firestore.js";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

const invoiceSequenceSchema = new firestore.Schema({
  tenantId: { type: firestore.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  branchId: { type: String, trim: true, default: "HQ" },
  deviceId: { type: String, trim: true, default: "MAIN" },
  prefix: { type: String, trim: true, default: "INV" },
  nextNumber: { type: Number, min: 1, default: 1 },
}, { timestamps: true });

invoiceSequenceSchema.index({ tenantId: 1, branchId: 1, deviceId: 1, prefix: 1 }, { unique: true });
invoiceSequenceSchema.plugin(tenantPlugin);

export default firestore.models.InvoiceSequence || firestore.model("InvoiceSequence", invoiceSequenceSchema);
