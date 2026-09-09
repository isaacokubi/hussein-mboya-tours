import crypto from "crypto";
import BackgroundJob from "../models/BackgroundJob.js";
import { requireTenantId } from "../tenancy/context.js";

const hashKey = (value) => crypto.createHash("sha256").update(String(value)).digest("hex");

export async function enqueueJob(type, payload = {}, options = {}) {
  const tenantId = options.tenantId || requireTenantId();
  const idempotencyKey = options.idempotencyKey || `${type}:${hashKey(JSON.stringify(payload))}`;
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
  return BackgroundJob.findOneAndUpdate({ tenantId, idempotencyKey }, update, { upsert: true, new: true, setDefaultsOnInsert: true });
}

export async function claimNextJob(workerId, types = []) {
  const now = new Date();
  const staleBefore = new Date(Date.now() - 10 * 60 * 1000);
  const query = {
    $or: [
      { status: "queued", availableAt: { $lte: now } },
      { status: "running", lockedAt: { $lte: staleBefore } },
    ],
  };
  if (types.length) query.type = { $in: types };
  return BackgroundJob.findOneAndUpdate(query, { $set: { status: "running", lockedAt: now, lockedBy: workerId }, $inc: { attempts: 1 } }, { sort: { availableAt: 1, createdAt: 1 }, new: true });
}

export async function completeJob(job) {
  job.status = "completed";
  job.completedAt = new Date();
  job.lockedAt = null;
  job.lockedBy = "";
  job.lastError = "";
  return job.save();
}

export async function failJob(job, error) {
  const message = String(error?.message || error || "Job failed").slice(0, 2000);
  job.lastError = message;
  job.lockedAt = null;
  job.lockedBy = "";
  if (job.attempts >= job.maxAttempts) {
    job.status = "dead";
  } else {
    job.status = "queued";
    const delayMinutes = Math.min(1440, 2 ** Math.min(job.attempts, 9));
    job.availableAt = new Date(Date.now() + delayMinutes * 60 * 1000);
  }
  return job.save();
}
