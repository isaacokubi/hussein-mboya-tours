/**
 * Purpose: kenya Step2 Readiness Service business-logic service. Main declarations: buildKenyaReadinessChecks, expiryState, activeLicence, getKenyaStep2Readiness.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import ComplianceRecord from "../models/ComplianceRecord.js";
// Load ../models/TaxProfile.js so this module can use its exported dependencies.
import TaxProfile from "../models/TaxProfile.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";

// Declare DAY_MS for use by the surrounding module or function.
const DAY_MS = 86400000;

// Define buildKenyaReadinessChecks; its parameters and body implement this operation.
export function buildKenyaReadinessChecks(tax, records, now = new Date()) {
  // Declare byType for use by the surrounding module or function.
  const byType = new Map(records.map((record) => [record.type, record]));
  // Declare timestamp for use by the surrounding module or function.
  const timestamp = new Date(now).getTime();
  // Declare expiryState for use by the surrounding module or function.
  const expiryState = (record) => {
    // Check the condition (!record?.expiryDate) and run the matching branch.
    if (!record?.expiryDate) return { expired: false, dueSoon: false };
    // Declare expiry for use by the surrounding module or function.
    const expiry = new Date(record.expiryDate).getTime();
    // Check the condition (!Number.isFinite(expiry)) and run the matching branch.
    if (!Number.isFinite(expiry)) return { expired: true, dueSoon: false };
    // Return the object assembled below to the caller.
    return { expired: expiry < timestamp, dueSoon: expiry >= timestamp && expiry <= timestamp + 30 * DAY_MS };
  };
  // Declare activeLicence for use by the surrounding module or function.
  const activeLicence = (type) => {
    // Declare record for use by the surrounding module or function.
    const record = byType.get(type);
    // Declare state for use by the surrounding module or function.
    const state = expiryState(record);
    // Return the result of Boolean() to the caller.
    return Boolean(record && ["approved", "submitted"].includes(record.status) && !state.expired && !state.dueSoon);
  };
  // Return the collection assembled below to the caller.
  return [
    { key: "kra", label: "KRA tax profile", ok: Boolean(tax?.kraPin && ["verified", "pending"].includes(tax.kraPinStatus)) },
    { key: "vat", label: "VAT profile", ok: Boolean(tax?.vatRegistered ? tax.vatNumber : true) },
    { key: "tra", label: "TRA licence", ok: activeLicence("TRA_LICENSE") },
    { key: "odpc", label: "ODPC registration", ok: activeLicence("ODPC_REGISTRATION") },
    { key: "privacy", label: "Privacy policy", ok: byType.get("PRIVACY_POLICY")?.status === "approved" },
    { key: "retention", label: "Data retention", ok: byType.get("DATA_RETENTION")?.status === "approved" },
    { key: "dpa", label: "DPA review", ok: byType.get("DPA_REVIEW")?.status === "approved" },
    { key: "etims", label: "eTIMS onboarding", ok: tax?.etimsEnabled ? byType.get("ETIMS_ONBOARDING")?.status === "approved" : true },
  ];
}

// Define getKenyaStep2Readiness; its parameters and body implement this operation.
export async function getKenyaStep2Readiness(req) {
  // Declare tenantId for use by the surrounding module or function.
  const tenantId = requireTenantId();
  // Declare [tax, records] for use by the surrounding module or function.
  const [tax, records] = await Promise.all([
    TaxProfile.findOne({ tenantId }).lean(),
    ComplianceRecord.find(mergeTenantFilter(req, {})).lean(),
  ]);
  // Declare checks for use by the surrounding module or function.
  const checks = buildKenyaReadinessChecks(tax, records);
  // Declare passed for use by the surrounding module or function.
  const passed = checks.filter((check) => check.ok).length;
  // Return the object assembled below to the caller.
  return { ready: passed === checks.length, score: Math.round((passed / checks.length) * 100), checks, generatedAt: new Date().toISOString() };
}
