import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

const privacyRequestSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  requestNumber: { type: String, trim: true },
  type: { type: String, enum: ["access", "correction", "deletion", "portability", "objection", "restriction"], required: true, index: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null, index: true },
  requesterName: { type: String, trim: true, required: true },
  requesterEmail: { type: String, lowercase: true, trim: true, default: "" },
  requesterPhone: { type: String, trim: true, default: "" },
  status: { type: String, enum: ["received", "identity_verification", "in_progress", "completed", "rejected", "cancelled"], default: "received", index: true },
  receivedAt: { type: Date, default: Date.now },
  dueAt: { type: Date, default: null, index: true },
  completedAt: { type: Date, default: null },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  resolutionNotes: { type: String, trim: true, default: "" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });

privacyRequestSchema.pre("save", function(next) { if (!this.requestNumber) this.requestNumber = `DSR-${Date.now()}-${Math.floor(Math.random() * 10000)}`; if (!this.dueAt) this.dueAt = new Date(new Date(this.receivedAt).getTime() + 30 * 86400000); if (this.status === "completed" && !this.completedAt) this.completedAt = new Date(); next(); });
privacyRequestSchema.index({ tenantId: 1, requestNumber: 1 }, { unique: true });
privacyRequestSchema.index({ tenantId: 1, requesterEmail: 1, status: 1 });
privacyRequestSchema.plugin(tenantPlugin);
export default mongoose.models.PrivacyRequest || mongoose.model("PrivacyRequest", privacyRequestSchema);
