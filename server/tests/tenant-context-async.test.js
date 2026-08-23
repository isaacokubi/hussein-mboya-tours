import test from "node:test";
import assert from "node:assert/strict";
import { getTenantContext, runWithTenant } from "../tenancy/context.js";

test("runWithTenant preserves platform bypass through async thenables", async () => {
  const observed = await runWithTenant(
    { role: "super_admin", tenantId: "should-not-be-used", bypass: false },
    async () => {
      await new Promise((resolve) => setImmediate(resolve));
      return getTenantContext();
    },
  );

  assert.equal(observed.role, "super_admin");
  assert.equal(observed.tenantId, null);
  assert.equal(observed.bypass, true);
});

test("runWithTenant keeps tenant context active until a returned thenable resolves", async () => {
  const observed = await runWithTenant(
    { role: "admin", tenantId: "tenant-123" },
    () => new Promise((resolve) => {
      setImmediate(() => resolve(getTenantContext()));
    }),
  );

  assert.equal(observed.role, "admin");
  assert.equal(observed.tenantId, "tenant-123");
  assert.equal(observed.bypass, false);
});
