import ComplianceRecord from "../models/ComplianceRecord.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const INTERVAL_MS = 6 * 60 * 60 * 1000;

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
