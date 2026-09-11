import test from "node:test";
import assert from "node:assert/strict";
import { buildKenyaReadinessChecks } from "../services/kenyaStep2ReadinessService.js";

test("Kenya readiness passes with complete compliant configuration", () => {
  const records = [
    { type: "TRA_LICENSE", status: "approved", expiryDate: "2099-01-01T00:00:00.000Z" },
    { type: "ODPC_REGISTRATION", status: "approved", expiryDate: null },
    { type: "PRIVACY_POLICY", status: "approved" },
    { type: "DATA_RETENTION", status: "approved" },
    { type: "DPA_REVIEW", status: "approved" },
    { type: "ETIMS_ONBOARDING", status: "approved" },
  ];
  const checks = buildKenyaReadinessChecks({ kraPin: "P000000000A", kraPinStatus: "verified", vatRegistered: true, vatNumber: "P051234567X", etimsEnabled: true }, records, new Date("2026-09-11T00:00:00.000Z"));
  assert.equal(checks.every((item) => item.ok), true);
});

test("Kenya readiness does not mark an expired licence as due-soon", () => {
  const records = [{ type: "TRA_LICENSE", status: "approved", expiryDate: "2026-09-10T00:00:00.000Z" }];
  const checks = buildKenyaReadinessChecks({ kraPin: "P000000000A", kraPinStatus: "verified", vatRegistered: false, etimsEnabled: false }, records, new Date("2026-09-11T00:00:00.000Z"));
  assert.equal(checks.find((item) => item.key === "tra").ok, true);
  assert.equal(checks.find((item) => item.key === "privacy").ok, false);
});
