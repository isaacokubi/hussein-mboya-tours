/**
 * Purpose: kenya Step2 Readiness Service.test automated test. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import test from "node:test";
// Load node:assert/strict so this module can use its exported dependencies.
import assert from "node:assert/strict";
// Load ../services/kenyaStep2ReadinessService.js so this module can use its exported dependencies.
import { buildKenyaReadinessChecks } from "../services/kenyaStep2ReadinessService.js";

// Perform the side effect or state update expressed on the following line.
test("Kenya readiness passes with complete compliant configuration", () => {
  // Declare records for use by the surrounding module or function.
  const records = [
    { type: "TRA_LICENSE", status: "approved", expiryDate: "2099-01-01T00:00:00.000Z" },
    { type: "ODPC_REGISTRATION", status: "approved", expiryDate: null },
    { type: "PRIVACY_POLICY", status: "approved" },
    { type: "DATA_RETENTION", status: "approved" },
    { type: "DPA_REVIEW", status: "approved" },
    { type: "ETIMS_ONBOARDING", status: "approved" },
  ];
  // Declare checks for use by the surrounding module or function.
  const checks = buildKenyaReadinessChecks({ kraPin: "P000000000A", kraPinStatus: "verified", vatRegistered: true, vatNumber: "P051234567X", etimsEnabled: true }, records, new Date("2026-09-11T00:00:00.000Z"));
  // Perform the side effect or state update expressed on the following line.
  assert.equal(checks.every((item) => item.ok), true);
});

// Perform the side effect or state update expressed on the following line.
test("Kenya readiness rejects an expired TRA licence", () => {
  // Declare records for use by the surrounding module or function.
  const records = [{ type: "TRA_LICENSE", status: "approved", expiryDate: "2026-09-10T00:00:00.000Z" }];
  // Declare checks for use by the surrounding module or function.
  const checks = buildKenyaReadinessChecks({ kraPin: "P000000000A", kraPinStatus: "verified", vatRegistered: false, etimsEnabled: false }, records, new Date("2026-09-11T00:00:00.000Z"));
  // Perform the side effect or state update expressed on the following line.
  assert.equal(checks.find((item) => item.key === "tra").ok, false);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(checks.find((item) => item.key === "privacy").ok, false);
});
