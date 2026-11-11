/**
 * Purpose: compliance Expiry Service business-logic service. Main declarations: buildComplianceExpiryUpdates, syncComplianceExpiry, startComplianceExpiryScheduler, run.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import ComplianceRecord from "../models/ComplianceRecord.js";

// Declare DAY_MS for use by the surrounding module or function.
const DAY_MS = 24 * 60 * 60 * 1000;
// Declare INTERVAL_MS for use by the surrounding module or function.
const INTERVAL_MS = 6 * 60 * 60 * 1000;

// Define buildComplianceExpiryUpdates; its parameters and body implement this operation.
export function buildComplianceExpiryUpdates(records, now = new Date()) {
  // Declare timestamp for use by the surrounding module or function.
  const timestamp = new Date(now).getTime();
  // Declare soon for use by the surrounding module or function.
  const soon = timestamp + 30 * DAY_MS;
  // Return the result of records.map() to the caller.
  return records.map((record) => {
    // Check the condition (!record || ["closed", "expired"].includes(record.status)) and run the matching branch.
    if (!record || ["closed", "expired"].includes(record.status)) return null;
    // Check the condition (!record.expiryDate) and run the matching branch.
    if (!record.expiryDate) return null;
    // Declare expiry for use by the surrounding module or function.
    const expiry = new Date(record.expiryDate).getTime();
    // Check the condition (!Number.isFinite(expiry)) and run the matching branch.
    if (!Number.isFinite(expiry)) return null;
    // Check the condition (expiry < timestamp) and run the matching branch.
    if (expiry < timestamp) return "expired";
    // Check the condition (expiry <= soon && ["approved", "submitted"].includes(record.status)) and run the matching branch.
    if (expiry <= soon && ["approved", "submitted"].includes(record.status)) return "action_required";
    // Return the expression shown below to the caller.
    return null;
  });
}

// Define syncComplianceExpiry; its parameters and body implement this operation.
export async function syncComplianceExpiry() {
  // Declare now for use by the surrounding module or function.
  const now = new Date();
  // Declare soon for use by the surrounding module or function.
  const soon = new Date(now.getTime() + 30 * DAY_MS);

  // Perform the side effect or state update expressed on the following line.
  await ComplianceRecord.updateMany(
    { expiryDate: { $lt: now }, status: { $nin: ["expired", "closed"] } },
    { $set: { status: "expired" } },
  );

  // Perform the side effect or state update expressed on the following line.
  await ComplianceRecord.updateMany(
    { expiryDate: { $gte: now, $lte: soon }, status: { $in: ["approved", "submitted"] } },
    { $set: { status: "action_required" } },
  );

  // Return the expression shown below to the caller.
  return true;
}

// Define startComplianceExpiryScheduler; its parameters and body implement this operation.
export function startComplianceExpiryScheduler() {
  // Declare run for use by the surrounding module or function.
  const run = () => syncComplianceExpiry().catch((error) => {
    // Perform the side effect or state update expressed on the following line.
    console.error("Compliance expiry synchronization failed:", error.message);
  });
  // Declare interval for use by the surrounding module or function.
  const interval = setInterval(run, INTERVAL_MS);
  // Return the object assembled below to the caller.
  return { interval, run };
}
