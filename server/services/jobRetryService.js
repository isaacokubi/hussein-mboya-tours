import BackgroundJob from "../models/BackgroundJob.js";

export async function retryDeadJob({ tenantId, idempotencyKey }) {
  return BackgroundJob.findOneAndUpdate(
    { tenantId, idempotencyKey, status: "dead" },
    { $set: { status: "queued", attempts: 0, availableAt: new Date(), lockedAt: null, lockedBy: "", lastError: "", completedAt: null } },
    { new: true },
  );
}
