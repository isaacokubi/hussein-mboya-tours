import ComplianceRecord from "../models/ComplianceRecord.js";
import TaxProfile from "../models/TaxProfile.js";
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";

const DAY_MS = 86400000;

export async function getKenyaStep2Readiness(req) {
  const tenantId = requireTenantId();
  const [tax, records] = await Promise.all([
    TaxProfile.findOne({ tenantId }).lean(),
    ComplianceRecord.find(mergeTenantFilter(req, {})).lean(),
  ]);
  const byType = new Map(records.map((record) => [record.type, record]));
  const now = Date.now();
  const dueSoon = (record) => record?.expiryDate && new Date(record.expiryDate).getTime() <= now + 30 * DAY_MS && new Date(record.expiryDate).getTime() >= now;
  const checks = [
    { key: "kra", label: "KRA tax profile", ok: Boolean(tax?.kraPin && ["verified", "pending"].includes(tax.kraPinStatus)) },
    { key: "vat", label: "VAT profile", ok: Boolean(tax?.vatRegistered ? tax.vatNumber : true) },
    { key: "tra", label: "TRA licence", ok: ["approved", "submitted"].includes(byType.get("TRA_LICENSE")?.status) && !dueSoon(byType.get("TRA_LICENSE")) },
    { key: "odpc", label: "ODPC registration", ok: ["approved", "submitted"].includes(byType.get("ODPC_REGISTRATION")?.status) && !dueSoon(byType.get("ODPC_REGISTRATION")) },
    { key: "privacy", label: "Privacy policy", ok: byType.get("PRIVACY_POLICY")?.status === "approved" },
    { key: "retention", label: "Data retention", ok: byType.get("DATA_RETENTION")?.status === "approved" },
    { key: "dpa", label: "DPA review", ok: byType.get("DPA_REVIEW")?.status === "approved" },
    { key: "etims", label: "eTIMS onboarding", ok: tax?.etimsEnabled ? byType.get("ETIMS_ONBOARDING")?.status === "approved" : true },
  ];
  const passed = checks.filter((check) => check.ok).length;
  return { ready: passed === checks.length, score: Math.round((passed / checks.length) * 100), checks, generatedAt: new Date().toISOString() };
}
