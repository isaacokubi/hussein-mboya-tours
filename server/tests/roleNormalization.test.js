/**
 * Purpose: role Normalization.test automated test. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import test from "node:test";
// Load node:assert/strict so this module can use its exported dependencies.
import assert from "node:assert/strict";
// Load ../utils/roleUtils.js so this module can use its exported dependencies.
import { normalizeRole } from "../utils/roleUtils.js";

// Perform the side effect or state update expressed on the following line.
test("normalizes legacy staff role aliases to canonical RBAC names", () => {
  // Declare cases for use by the surrounding module or function.
  const cases = new Map([
    ["administrator", "admin"],
    ["superadmin", "super_admin"],
    ["tour manager", "tour_manager"],
    ["travel-agent", "agent"],
    ["tour guide", "tour_guide"],
    ["driver", "driver"],
    ["customer", "customer"],
  ]);

  // Repeat the enclosed work for each required iteration.
  for (const [input, expected] of cases) {
    // Perform the side effect or state update expressed on the following line.
    assert.equal(normalizeRole(input), expected, input);
  }
});

// Perform the side effect or state update expressed on the following line.
test("normalization is stable for canonical names", () => {
  // Repeat the enclosed work for each required iteration.
  for (const role of ["admin", "super_admin", "tour_manager", "agent", "tour_guide", "driver", "customer"]) {
    // Perform the side effect or state update expressed on the following line.
    assert.equal(normalizeRole(role), role);
  }
});
