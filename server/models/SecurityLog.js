import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

const securityLogSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", index: true, default: null },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    email: { type: String, trim: true, lowercase: true, default: "" },
    action: {
      type: String,
      required: true,
      enum: [
        "login_success", "login_failed", "logout", "register",
        "password_changed", "password_reset", "password_reset_requested",
        "account_locked", "account_unlocked", "account_created", "account_updated",
        "account_deleted", "role_changed", "permission_changed", "token_revoked",
        "admin_action", "suspicious_request", "unauthorized_access", "file_upload", "api_access",
        "mfa_challenge_created", "mfa_login_success", "mfa_login_failed"
      ],
      index: true,
    },
    ipAddress: { type: String, default: "", trim: true, index: true },
    userAgent: { type: String, default: "", trim: true },
    method: { type: String, default: "" },
    endpoint: { type: String, default: "" },
    status: { type: String, enum: ["success", "failed", "warning"], default: "success", index: true },
    severity: { type: String, enum: ["low", "medium", "high", "critical"], default: "low", index: true },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    country: { type: String, default: "" },
    city: { type: String, default: "" },
  },
  { timestamps: true }
);

securityLogSchema.index({ user: 1, createdAt: -1 });
securityLogSchema.index({ email: 1, createdAt: -1 });
securityLogSchema.index({ action: 1, createdAt: -1 });
securityLogSchema.index({ ipAddress: 1, createdAt: -1 });
securityLogSchema.index({ severity: 1, createdAt: -1 });
securityLogSchema.index({ status: 1, createdAt: -1 });

securityLogSchema.statics.logEvent = function ({
  user = null, email = "", action, ipAddress = "", userAgent = "", method = "",
  endpoint = "", status = "success", severity = "low", details = {}, country = "", city = "",
  tenantId = null,
}) {
  return this.create({ user, email, action, ipAddress, userAgent, method, endpoint, status, severity, details, country, city, tenantId });
};

const tenantSecurityLogSchema = securityLogSchema.plugin(tenantPlugin);
const SecurityLog = mongoose.models.SecurityLog || mongoose.model("SecurityLog", tenantSecurityLogSchema);

export default SecurityLog;
