import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

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

etimsSubmissionSchema.index({ tenantId: 1, documentType: 1, documentId: 1, attempt: 1 }, { unique: true });
etimsSubmissionSchema.index({ tenantId: 1, idempotencyKey: 1 });
etimsSubmissionSchema.plugin(tenantPlugin);

export default mongoose.models.EtimsSubmission || mongoose.model("EtimsSubmission", etimsSubmissionSchema);
