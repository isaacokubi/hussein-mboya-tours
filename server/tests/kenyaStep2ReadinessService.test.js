import test from "node:test";
import assert from "node:assert/strict";
import { buildKenyaReadinessChecks } from "../services/kenyaStep2ReadinessService.js";

const NOW = new Date("2026-09-11T00:00:00.000Z");
const compliantRecords = () => [
  { type: "TRA_LICENSE", status: "approved", issueDate: "2026-01-01", expiryDate: "2099-01-01T00:00:00.000Z" },
  { type: "ODPC_REGISTRATION", status: "approved", expiryDate: null },
  { type: "PRIVACY_POLICY", status: "approved" },
  { type: "DATA_RETENTION", status: "approved" },
  { type: "DPA_REVIEW", status: "approved" },
  { type: "ETIMS_ONBOARDING", status: "approved" },
];
const verifiedTax = {
  kraPin: "P000000000A",
  kraPinStatus: "verified",
  vatRegistered: true,
  vatNumber: "P051234567X",
  vatValidationStatus: "verified",
  etimsEnabled: true,
};

test("Kenya readiness passes only with verified tax and approved current compliance records", () => {
  const checks = buildKenyaReadinessChecks(verifiedTax, compliantRecords(), NOW);
  assert.equal(checks.every((item) => item.ok), true);
});

test("pending KRA PIN is not treated as verified", () => {
  const checks = buildKenyaReadinessChecks({ ...verifiedTax, kraPinStatus: "pending" }, compliantRecords(), NOW);
  assert.equal(checks.find((item) => item.key === "kra").ok, false);
});

test("VAT registration requires a verified VAT number", () => {
  const checks = buildKenyaReadinessChecks({ ...verifiedTax, vatValidationStatus: "pending" }, compliantRecords(), NOW);
  assert.equal(checks.find((item) => item.key === "vat").ok, false);
});

test("submitted TRA application is not treated as an approved licence", () => {
  const records = compliantRecords().map((record) => record.type === "TRA_LICENSE" ? { ...record, status: "submitted" } : record);
  const checks = buildKenyaReadinessChecks(verifiedTax, records, NOW);
  assert.equal(checks.find((item) => item.key === "tra").ok, false);
});

test("readiness rejects an expired or soon-to-expire TRA licence", () => {
  for (const expiryDate of ["2026-09-10T00:00:00.000Z", "2026-09-20T00:00:00.000Z"]) {
    const records = compliantRecords().map((record) => record.type === "TRA_LICENSE" ? { ...record, expiryDate } : record);
    const checks = buildKenyaReadinessChecks(verifiedTax, records, NOW);
    assert.equal(checks.find((item) => item.key === "tra").ok, false);
  }
});

test("missing TRA expiry date is not accepted as a current licence", () => {
  const records = compliantRecords().map((record) => record.type === "TRA_LICENSE" ? { ...record, expiryDate: null } : record);
  const checks = buildKenyaReadinessChecks(verifiedTax, records, NOW);
  assert.equal(checks.find((item) => item.key === "tra").ok, false);
});

test("expired or unapproved compliance records do not pass", () => {
  const records = compliantRecords().map((record) => record.type === "ODPC_REGISTRATION" ? { ...record, status: "submitted", expiryDate: "2026-09-10T00:00:00.000Z" } : record);
  const checks = buildKenyaReadinessChecks({ ...verifiedTax, etimsEnabled: false }, records, NOW);
  assert.equal(checks.find((item) => item.key === "odpc").ok, false);
  assert.equal(checks.find((item) => item.key === "privacy").ok, true);
});

test("eTIMS onboarding is required when eTIMS is enabled", () => {
  const records = compliantRecords().filter((record) => record.type !== "ETIMS_ONBOARDING");
  const checks = buildKenyaReadinessChecks(verifiedTax, records, NOW);
  assert.equal(checks.find((item) => item.key === "etims").ok, false);
});

test("VAT profile is not required when the tenant is not VAT registered", () => {
  const checks = buildKenyaReadinessChecks({ ...verifiedTax, vatRegistered: false, vatNumber: "", vatValidationStatus: "not_verified" }, compliantRecords(), NOW);
  assert.equal(checks.find((item) => item.key === "vat").ok, true);
});
