import ComplianceRecord from "../models/ComplianceRecord.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const INTERVAL_MS = 6 * 60 * 60 * 1000;

export function buildComplianceExpiryUpdates(records, now = new Date()) {
  const timestamp = new Date(now).getTime();
  const soon = timestamp + 30 * DAY_MS;
  return records.map((record) => {
    if (!record || ["closed", "expired"].includes(record.status)) return null;
    if (!record.expiryDate) return null;
    const expiry = new Date(record.expiryDate).getTime();
    if (!Number.isFinite(expiry)) return null;
    if (expiry < timestamp) return "expired";
    if (expiry <= soon && ["approved", "submitted"].includes(record.status)) return "action_required";
    return null;
  });
}

export async function syncComplianceExpiry() {
  const now = new Date();
  const soon = new Date(now.getTime() + 30 * DAY_MS);

  await ComplianceRecord.updateMany(
    { expiryDate: { $lt: now }, status: { $nin: ["expired", "closed"] } },
    { $set: { status: "expired" } },
  );

  await ComplianceRecord.updateMany(
    { expiryDate: { $gte: now, $lte: soon }, status: { $in: ["approved", "submitted"] } },
    { $set: { status: "action_required" } },
  );

  return true;
}

export function startComplianceExpiryScheduler() {
  const run = () => syncComplianceExpiry().catch((error) => {
    console.error("Compliance expiry synchronization failed:", error.message);
  });
  const interval = setInterval(run, INTERVAL_MS);
  return { interval, run };
}
