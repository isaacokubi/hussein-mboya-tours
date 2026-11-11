/**
 * Purpose: data Retention Service business-logic service. Main declarations: days, cutoff, runDataRetentionSweep, startDataRetentionScheduler, run.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import BackgroundJob from "../models/BackgroundJob.js";
// Load ../models/WebhookDelivery.js so this module can use its exported dependencies.
import WebhookDelivery from "../models/WebhookDelivery.js";
// Load ../models/PrivacyRequest.js so this module can use its exported dependencies.
import PrivacyRequest from "../models/PrivacyRequest.js";

// Declare days for use by the surrounding module or function.
const days = (key, fallback) => {
  // Declare value for use by the surrounding module or function.
  const value = Number(process.env[key] || fallback);
  // Return the expression shown below to the caller.
  return Number.isFinite(value) && value >= 1 ? Math.floor(value) : fallback;
};

// Declare cutoff for use by the surrounding module or function.
const cutoff = (retentionDays) => new Date(Date.now() - retentionDays * 86400000);

/**
 * Performs conservative retention cleanup only for operational records whose
 * deletion does not remove financial, booking, customer, or tax evidence.
 * Business/financial records remain immutable and are governed by policy.
 */
// Define runDataRetentionSweep; its parameters and body implement this operation.
export async function runDataRetentionSweep() {
  // Declare operationalDays for use by the surrounding module or function.
  const operationalDays = days("OPERATIONAL_RECORD_RETENTION_DAYS", 365);
  // Declare webhookDays for use by the surrounding module or function.
  const webhookDays = days("WEBHOOK_DELIVERY_RETENTION_DAYS", 180);
  // Declare jobDays for use by the surrounding module or function.
  const jobDays = days("BACKGROUND_JOB_RETENTION_DAYS", 90);
  // Declare privacyDays for use by the surrounding module or function.
  const privacyDays = days("PRIVACY_REQUEST_RETENTION_DAYS", 730);

  // Declare results for use by the surrounding module or function.
  const results = {};
  // Perform the side effect or state update expressed on the following line.
  results.backgroundJobs = (await BackgroundJob.deleteMany({
    status: { $in: ["completed", "dead"] },
    updatedAt: { $lt: cutoff(jobDays) },
  })).deletedCount || 0;

  // Perform the side effect or state update expressed on the following line.
  results.webhookDeliveries = (await WebhookDelivery.deleteMany({
    createdAt: { $lt: cutoff(webhookDays) },
    status: { $in: ["delivered", "failed"] },
  })).deletedCount || 0;

  // Perform the side effect or state update expressed on the following line.
  results.privacyRequests = (await PrivacyRequest.deleteMany({
    status: { $in: ["completed", "rejected", "cancelled"] },
    updatedAt: { $lt: cutoff(privacyDays) },
  })).deletedCount || 0;

  // Return the object assembled below to the caller.
  return {
    ...results,
    policy: { operationalDays, webhookDays, jobDays, privacyDays },
    completedAt: new Date().toISOString(),
  };
}

// Define startDataRetentionScheduler; its parameters and body implement this operation.
export function startDataRetentionScheduler() {
  // Declare intervalMs for use by the surrounding module or function.
  const intervalMs = Math.max(6 * 60 * 60 * 1000, Number(process.env.DATA_RETENTION_INTERVAL_MS || 24 * 60 * 60 * 1000));
  // Declare run for use by the surrounding module or function.
  const run = async () => {
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Declare result for use by the surrounding module or function.
      const result = await runDataRetentionSweep();
      // Perform the side effect or state update expressed on the following line.
      console.log("Data retention sweep completed:", result);
    } catch (error) {
      // Perform the side effect or state update expressed on the following line.
      console.error("Data retention sweep failed:", error.message);
    }
  };
  // Declare interval for use by the surrounding module or function.
  const interval = setInterval(() => void run(), intervalMs);
  // Return the object assembled below to the caller.
  return { interval, run };
}
