/**
 * Purpose: Background Job database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

// Declare backgroundJobSchema for use by the surrounding module or function.
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

// Perform the side effect or state update expressed on the following line.
backgroundJobSchema.index({ tenantId: 1, idempotencyKey: 1 }, { unique: true });
// Perform the side effect or state update expressed on the following line.
backgroundJobSchema.index({ status: 1, availableAt: 1, lockedAt: 1 });
// Perform the side effect or state update expressed on the following line.
backgroundJobSchema.plugin(tenantPlugin);

export default mongoose.models.BackgroundJob || mongoose.model("BackgroundJob", backgroundJobSchema);
