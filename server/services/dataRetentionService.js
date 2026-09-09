import BackgroundJob from "../models/BackgroundJob.js";
import WebhookDelivery from "../models/WebhookDelivery.js";
import PrivacyRequest from "../models/PrivacyRequest.js";

const days = (key, fallback) => {
  const value = Number(process.env[key] || fallback);
  return Number.isFinite(value) && value >= 1 ? Math.floor(value) : fallback;
};

const cutoff = (retentionDays) => new Date(Date.now() - retentionDays * 86400000);

/**
 * Performs conservative retention cleanup only for operational records whose
 * deletion does not remove financial, booking, customer, or tax evidence.
 * Business/financial records remain immutable and are governed by policy.
 */
export async function runDataRetentionSweep() {
  const operationalDays = days("OPERATIONAL_RECORD_RETENTION_DAYS", 365);
  const webhookDays = days("WEBHOOK_DELIVERY_RETENTION_DAYS", 180);
  const jobDays = days("BACKGROUND_JOB_RETENTION_DAYS", 90);
  const privacyDays = days("PRIVACY_REQUEST_RETENTION_DAYS", 730);

  const results = {};
  results.backgroundJobs = (await BackgroundJob.deleteMany({
    status: { $in: ["completed", "dead"] },
    updatedAt: { $lt: cutoff(jobDays) },
  })).deletedCount || 0;

  results.webhookDeliveries = (await WebhookDelivery.deleteMany({
    createdAt: { $lt: cutoff(webhookDays) },
    status: { $in: ["delivered", "failed"] },
  })).deletedCount || 0;

  results.privacyRequests = (await PrivacyRequest.deleteMany({
    status: { $in: ["completed", "rejected", "cancelled"] },
    updatedAt: { $lt: cutoff(privacyDays) },
  })).deletedCount || 0;

  return {
    ...results,
    policy: { operationalDays, webhookDays, jobDays, privacyDays },
    completedAt: new Date().toISOString(),
  };
}

export function startDataRetentionScheduler() {
  const intervalMs = Math.max(6 * 60 * 60 * 1000, Number(process.env.DATA_RETENTION_INTERVAL_MS || 24 * 60 * 60 * 1000));
  const run = async () => {
    try {
      const result = await runDataRetentionSweep();
      console.log("Data retention sweep completed:", result);
    } catch (error) {
      console.error("Data retention sweep failed:", error.message);
    }
  };
  const interval = setInterval(() => void run(), intervalMs);
  return { interval, run };
}
