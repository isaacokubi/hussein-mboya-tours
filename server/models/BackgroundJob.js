import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

const backgroundJobSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  type: { type: String, required: true, trim: true, index: true },
  status: { type: String, enum: ["queued", "running", "completed", "failed", "dead"], default: "queued", index: true },
  payload: { type: mongoose.Schema.Types.Mixed, default: {} },
  idempotencyKey: { type: String, trim: true, required: true },
  attempts: { type: Number, min: 0, default: 0 },
  maxAttempts: { type: Number, min: 1, max: 20, default: 8 },
  availableAt: { type: Date, default: Date.now, index: true },
  lockedAt: { type: Date, default: null },
  lockedBy: { type: String, default: "" },
  completedAt: { type: Date, default: null },
  lastError: { type: String, trim: true, default: "" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });

backgroundJobSchema.index({ tenantId: 1, idempotencyKey: 1 }, { unique: true });
backgroundJobSchema.index({ status: 1, availableAt: 1, lockedAt: 1 });
backgroundJobSchema.plugin(tenantPlugin);

export default mongoose.models.BackgroundJob || mongoose.model("BackgroundJob", backgroundJobSchema);
