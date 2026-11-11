/**
 * Purpose: Etims Submission database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

// Declare etimsSubmissionSchema for use by the surrounding module or function.
const etimsSubmissionSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  documentType: { type: String, enum: ["invoice", "credit", "debit"], required: true, index: true },
  documentId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  documentNumber: { type: String, trim: true, default: "" },
  attempt: { type: Number, min: 1, required: true },
  status: { type: String, enum: ["pending", "synced", "failed"], required: true, index: true },
  idempotencyKey: { type: String, trim: true, required: true },
  httpStatus: { type: Number, min: 100, max: 599, default: null },
  requestHash: { type: String, trim: true, default: "" },
  response: { type: mongoose.Schema.Types.Mixed, default: {} },
  error: { type: String, trim: true, default: "" },
  etimsInvoiceNumber: { type: String, trim: true, default: "" },
  etimsReceiptNumber: { type: String, trim: true, default: "" },
  etimsReference: { type: String, trim: true, default: "" },
  uniqueRegisterIdentifier: { type: String, trim: true, default: "" },
  qrCode: { type: String, trim: true, default: "" },
  submittedAt: { type: Date, default: null },
}, { timestamps: true });

// Perform the side effect or state update expressed on the following line.
etimsSubmissionSchema.index({ tenantId: 1, documentType: 1, documentId: 1, attempt: 1 }, { unique: true });
// Perform the side effect or state update expressed on the following line.
etimsSubmissionSchema.index({ tenantId: 1, idempotencyKey: 1 });
// Perform the side effect or state update expressed on the following line.
etimsSubmissionSchema.plugin(tenantPlugin);

export default mongoose.models.EtimsSubmission || mongoose.model("EtimsSubmission", etimsSubmissionSchema);
