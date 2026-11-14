import ComplianceRecord from "../models/ComplianceRecord.js";
import TaxProfile from "../models/TaxProfile.js";
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";

const DAY_MS = 86400000;

export function buildKenyaReadinessChecks(tax, records = [], now = new Date()) {
  const byType = new Map(records.map((record) => [record.type, record]));
  const timestamp = new Date(now).getTime();
  const expiryState = (record) => {
    if (!record?.expiryDate) return { expired: false, dueSoon: false };
    const expiry = new Date(record.expiryDate).getTime();
    if (!Number.isFinite(expiry)) return { expired: true, dueSoon: false };
    return {
      expired: expiry < timestamp,
      dueSoon: expiry >= timestamp && expiry <= timestamp + 30 * DAY_MS,
    };
  };
  const approvedRecord = (type, { requireExpiry = false } = {}) => {
    const record = byType.get(type);
    const expiry = expiryState(record);
    return Boolean(
      record?.status === "approved" &&
      (!requireExpiry || Boolean(record.expiryDate)) &&
      !expiry.expired &&
      !expiry.dueSoon
    );
  };

  return [
    { key: "kra", label: "KRA tax profile", ok: Boolean(tax?.kraPin && tax.kraPinStatus === "verified") },
    {
      key: "vat",
      label: "VAT profile",
      ok: Boolean(!tax?.vatRegistered || (tax.vatNumber && tax.vatValidationStatus === "verified")),
    },
    { key: "tra", label: "TRA licence", ok: approvedRecord("TRA_LICENSE", { requireExpiry: true }) },
    { key: "odpc", label: "ODPC registration", ok: approvedRecord("ODPC_REGISTRATION") },
    { key: "privacy", label: "Privacy policy", ok: approvedRecord("PRIVACY_POLICY") },
    { key: "retention", label: "Data retention", ok: approvedRecord("DATA_RETENTION") },
    { key: "dpa", label: "DPA review", ok: approvedRecord("DPA_REVIEW") },
    { key: "etims", label: "eTIMS onboarding", ok: Boolean(!tax?.etimsEnabled || approvedRecord("ETIMS_ONBOARDING")) },
  ];
}

export async function getKenyaStep2Readiness(req) {
  const tenantId = requireTenantId();
  const [tax, records] = await Promise.all([
    TaxProfile.findOne({ tenantId }).lean(),
    ComplianceRecord.find(mergeTenantFilter(req, {})).lean(),
  ]);
  const checks = buildKenyaReadinessChecks(tax, records);
  const passed = checks.filter((check) => check.ok).length;
  return {
    ready: passed === checks.length,
    score: Math.round((passed / checks.length) * 100),
    checks,
    generatedAt: new Date().toISOString(),
  };
}
