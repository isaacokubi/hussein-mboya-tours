/**
 * Purpose: tenant context async.test automated test. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import test from "node:test";
// Load node:assert/strict so this module can use its exported dependencies.
import assert from "node:assert/strict";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { getTenantContext, runWithTenant } from "../tenancy/context.js";

// Perform the side effect or state update expressed on the following line.
test("runWithTenant preserves platform bypass through async thenables", async () => {
  // Declare observed for use by the surrounding module or function.
  const observed = await runWithTenant(
    { role: "super_admin", tenantId: "should-not-be-used", bypass: false },
    async () => {
      // Perform the side effect or state update expressed on the following line.
      await new Promise((resolve) => setImmediate(resolve));
      // Return the result of getTenantContext() to the caller.
      return getTenantContext();
    },
  );

  // Perform the side effect or state update expressed on the following line.
  assert.equal(observed.role, "super_admin");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(observed.tenantId, null);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(observed.bypass, true);
});

// Perform the side effect or state update expressed on the following line.
test("runWithTenant keeps tenant context active until a returned thenable resolves", async () => {
  // Declare observed for use by the surrounding module or function.
  const observed = await runWithTenant(
    { role: "admin", tenantId: "tenant-123" },
    () => new Promise((resolve) => {
      // Perform the side effect or state update expressed on the following line.
      setImmediate(() => resolve(getTenantContext()));
    }),
  );

  // Perform the side effect or state update expressed on the following line.
  assert.equal(observed.role, "admin");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(observed.tenantId, "tenant-123");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(observed.bypass, false);
});
