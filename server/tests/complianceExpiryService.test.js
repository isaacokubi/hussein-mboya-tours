/**
 * Purpose: compliance Expiry Service.test automated test. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import test from "node:test";
// Load node:assert/strict so this module can use its exported dependencies.
import assert from "node:assert/strict";
// Load ../services/complianceExpiryService.js so this module can use its exported dependencies.
import { buildComplianceExpiryUpdates } from "../services/complianceExpiryService.js";

// Perform the side effect or state update expressed on the following line.
test("compliance expiry rules mark expired records and 30-day records for action", () => {
  // Declare now for use by the surrounding module or function.
  const now = new Date("2026-09-11T00:00:00.000Z");
  // Declare result for use by the surrounding module or function.
  const result = buildComplianceExpiryUpdates([
    { status: "approved", expiryDate: "2026-09-10T00:00:00.000Z" },
    { status: "approved", expiryDate: "2026-09-25T00:00:00.000Z" },
    { status: "approved", expiryDate: "2026-11-01T00:00:00.000Z" },
    { status: "closed", expiryDate: "2026-09-01T00:00:00.000Z" },
  ], now);

  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(result, ["expired", "action_required", null, null]);
});
