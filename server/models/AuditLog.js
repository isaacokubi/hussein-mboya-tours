import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

const auditLogSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", index: true, default: null },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  action: {
    type: String, required: true, trim: true,
    enum: ["login","login_success","login_failed","mfa_challenge_created","mfa_verified","mfa_failed","logout","create","update","delete","restore","approve","reject","assign","payment","refund","download","export","import","view","other"],
    index: true,
  },
  resource: {
    type: String, required: true, trim: true,
    enum: ["User","Booking","Authentication","Security","Super Admin","Admin","Database","API Monitor","Audit Center","Tour","Vehicle","Staff","Payment","Quotation","Review","Wishlist","Notification","Role","Permission","Agent","Dashboard","System","Other"],
    index: true,
  },
  resourceId: { type: String, default: null, index: true },
  description: { type: String, trim: true, default: "" },
  status: { type: String, enum: ["success","failed","warning"], default: "success", index: true },
  severity: { type: String, enum: ["low","medium","high","critical"], default: "low" },
  ipAddress: { type: String, default: "" },
  userAgent: { type: String, default: "" },
  method: { type: String, default: "" },
  endpoint: { type: String, default: "" },
  requestId: { type: String, default: "", index: true },
  oldValues: { type: mongoose.Schema.Types.Mixed, default: null },
  newValues: { type: mongoose.Schema.Types.Mixed, default: null },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });
auditLogSchema.index({ severity: 1 });

auditLogSchema.statics.log = function (data) { return this.create(data); };

const tenantAuditLogSchema = auditLogSchema.plugin(tenantPlugin);
const AuditLog = mongoose.models.AuditLog || mongoose.model("AuditLog", tenantAuditLogSchema);

export default AuditLog;
