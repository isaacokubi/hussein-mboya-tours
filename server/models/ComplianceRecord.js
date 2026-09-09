import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

const complianceRecordSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  type: {
    type: String,
    enum: ["TRA_LICENSE", "ODPC_REGISTRATION", "PRIVACY_POLICY", "DATA_RETENTION", "DPA_REVIEW", "BREACH_RESPONSE", "KRA_TAX_PROFILE", "ETIMS_ONBOARDING"],
    required: true,
    index: true,
  },
  status: { type: String, enum: ["not_started", "in_progress", "submitted", "approved", "expired", "action_required", "closed"], default: "not_started", index: true },
  referenceNumber: { type: String, trim: true, default: "" },
  authority: { type: String, trim: true, default: "" },
  issueDate: { type: Date, default: null },
  expiryDate: { type: Date, default: null, index: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  notes: { type: String, trim: true, default: "" },
  documents: [{ name: String, url: String, type: String, uploadedAt: { type: Date, default: Date.now } }],
  lastReviewedAt: { type: Date, default: null },
  nextReviewAt: { type: Date, default: null, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });

complianceRecordSchema.index({ tenantId: 1, type: 1 }, { unique: true });
complianceRecordSchema.index({ tenantId: 1, status: 1, expiryDate: 1 });
complianceRecordSchema.plugin(tenantPlugin);

export default mongoose.models.ComplianceRecord || mongoose.model("ComplianceRecord", complianceRecordSchema);
