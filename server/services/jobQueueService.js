/**
 * Purpose: job Queue Service business-logic service. Main declarations: hashKey, enqueueJob, claimNextJob, completeJob, failJob.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import crypto from "crypto";
// Load ../models/BackgroundJob.js so this module can use its exported dependencies.
import BackgroundJob from "../models/BackgroundJob.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { requireTenantId } from "../tenancy/context.js";

// Declare hashKey for use by the surrounding module or function.
const hashKey = (value) => crypto.createHash("sha256").update(String(value)).digest("hex");

// Define enqueueJob; its parameters and body implement this operation.
export async function enqueueJob(type, payload = {}, options = {}) {
  // Declare tenantId for use by the surrounding module or function.
  const tenantId = options.tenantId || requireTenantId();
  // Declare idempotencyKey for use by the surrounding module or function.
  const idempotencyKey = options.idempotencyKey || `${type}:${hashKey(JSON.stringify(payload))}`;
  // Declare update for use by the surrounding module or function.
  const update = {
    $setOnInsert: {
      tenantId,
      type,
      payload,
      idempotencyKey,
      maxAttempts: Number(options.maxAttempts || 8),
      createdBy: options.createdBy || null,
      status: "queued",
      availableAt: options.availableAt || new Date(),
    },
  };
  // Return the result of BackgroundJob.findOneAndUpdate() to the caller.
  return BackgroundJob.findOneAndUpdate({ tenantId, idempotencyKey }, update, { upsert: true, new: true, setDefaultsOnInsert: true });
}

// Define claimNextJob; its parameters and body implement this operation.
export async function claimNextJob(workerId, types = []) {
  // Declare now for use by the surrounding module or function.
  const now = new Date();
  // Declare staleBefore for use by the surrounding module or function.
  const staleBefore = new Date(Date.now() - 10 * 60 * 1000);
  // Declare query for use by the surrounding module or function.
  const query = {
    $or: [
      { status: "queued", availableAt: { $lte: now } },
      { status: "running", lockedAt: { $lte: staleBefore } },
    ],
  };
  // Check the condition (types.length) and run the matching branch.
  if (types.length) query.type = { $in: types };
  // Return the result of BackgroundJob.findOneAndUpdate() to the caller.
  return BackgroundJob.findOneAndUpdate(query, { $set: { status: "running", lockedAt: now, lockedBy: workerId }, $inc: { attempts: 1 } }, { sort: { availableAt: 1, createdAt: 1 }, new: true });
}

// Define completeJob; its parameters and body implement this operation.
export async function completeJob(job) {
  // Perform the side effect or state update expressed on the following line.
  job.status = "completed";
  // Perform the side effect or state update expressed on the following line.
  job.completedAt = new Date();
  // Perform the side effect or state update expressed on the following line.
  job.lockedAt = null;
  // Perform the side effect or state update expressed on the following line.
  job.lockedBy = "";
  // Perform the side effect or state update expressed on the following line.
  job.lastError = "";
  // Return the result of job.save() to the caller.
  return job.save();
}

// Define failJob; its parameters and body implement this operation.
export async function failJob(job, error) {
  // Declare message for use by the surrounding module or function.
  const message = String(error?.message || error || "Job failed").slice(0, 2000);
  // Perform the side effect or state update expressed on the following line.
  job.lastError = message;
  // Perform the side effect or state update expressed on the following line.
  job.lockedAt = null;
  // Perform the side effect or state update expressed on the following line.
  job.lockedBy = "";
  // Check the condition (job.attempts >= job.maxAttempts) and run the matching branch.
  if (job.attempts >= job.maxAttempts) {
    // Perform the side effect or state update expressed on the following line.
    job.status = "dead";
  } else {
    // Perform the side effect or state update expressed on the following line.
    job.status = "queued";
    // Declare delayMinutes for use by the surrounding module or function.
    const delayMinutes = Math.min(1440, 2 ** Math.min(job.attempts, 9));
    // Perform the side effect or state update expressed on the following line.
    job.availableAt = new Date(Date.now() + delayMinutes * 60 * 1000);
  }
  // Return the result of job.save() to the caller.
  return job.save();
}
