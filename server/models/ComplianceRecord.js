/**
 * Purpose: Compliance Record database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

// Declare complianceRecordSchema for use by the surrounding module or function.
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

// Perform the side effect or state update expressed on the following line.
complianceRecordSchema.index({ tenantId: 1, type: 1 }, { unique: true });
// Perform the side effect or state update expressed on the following line.
complianceRecordSchema.index({ tenantId: 1, status: 1, expiryDate: 1 });
// Perform the side effect or state update expressed on the following line.
complianceRecordSchema.plugin(tenantPlugin);

export default mongoose.models.ComplianceRecord || mongoose.model("ComplianceRecord", complianceRecordSchema);
