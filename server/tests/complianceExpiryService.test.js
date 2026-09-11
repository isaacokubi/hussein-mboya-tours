import test from "node:test";
import assert from "node:assert/strict";
import { buildComplianceExpiryUpdates } from "../services/complianceExpiryService.js";

test("compliance expiry rules mark expired records and 30-day records for action", () => {
  const now = new Date("2026-09-11T00:00:00.000Z");
  const result = buildComplianceExpiryUpdates([
    { status: "approved", expiryDate: "2026-09-10T00:00:00.000Z" },
    { status: "approved", expiryDate: "2026-09-25T00:00:00.000Z" },
    { status: "approved", expiryDate: "2026-11-01T00:00:00.000Z" },
    { status: "closed", expiryDate: "2026-09-01T00:00:00.000Z" },
  ], now);

  assert.deepEqual(result, ["expired", "action_required", null, null]);
});
