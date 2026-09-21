import test from "node:test";
import assert from "node:assert/strict";
import { normalizeRole } from "../utils/roleUtils.js";

test("normalizes legacy staff role aliases to canonical RBAC names", () => {
  const cases = new Map([
    ["administrator", "admin"],
    ["superadmin", "super_admin"],
    ["tour manager", "tour_manager"],
    ["travel-agent", "agent"],
    ["tour guide", "tour_guide"],
    ["driver", "driver"],
    ["customer", "customer"],
  ]);

  for (const [input, expected] of cases) {
    assert.equal(normalizeRole(input), expected, input);
  }
});

test("normalization is stable for canonical names", () => {
  for (const role of ["admin", "super_admin", "tour_manager", "agent", "tour_guide", "driver", "customer"]) {
    assert.equal(normalizeRole(role), role);
  }
});
