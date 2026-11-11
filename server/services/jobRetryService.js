/**
 * Purpose: job Retry Service business-logic service. Main declarations: retryDeadJob.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import BackgroundJob from "../models/BackgroundJob.js";

// Define retryDeadJob; its parameters and body implement this operation.
export async function retryDeadJob({ tenantId, idempotencyKey }) {
  // Return the result of BackgroundJob.findOneAndUpdate() to the caller.
  return BackgroundJob.findOneAndUpdate(
    { tenantId, idempotencyKey, status: "dead" },
    { $set: { status: "queued", attempts: 0, availableAt: new Date(), lockedAt: null, lockedBy: "", lastError: "", completedAt: null } },
    { new: true },
  );
}
