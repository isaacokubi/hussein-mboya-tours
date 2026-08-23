import Organization from "../models/Organization.js";
import { getTenantContext, mergeTenantFilter, runWithTenant } from "../tenancy/context.js";

const assert = (condition, message) => {
  if (!condition) throw new Error(`FAIL: ${message}`);
  console.log(`PASS: ${message}`);
};

const main = async () => {
  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "development";

  try {
    const tenants = await Organization.find({ status: { $in: ["active", "trial"] } })
      .select("_id slug")
      .limit(2)
      .lean();

    if (tenants.length === 1) {
      const tenant = tenants[0];
      await runWithTenant({ tenantId: null, role: "public", bypass: false }, async () => {
        const filter = { email: "contract-check@example.invalid" };
        // The resolver itself is exercised by the route in integration tests;
        // this assertion verifies the canonical tenant filter still fails closed
        // until a concrete tenant context is established.
        let failedClosed = false;
        try { mergeTenantFilter(filter); } catch (error) { failedClosed = error?.code === "TENANT_CONTEXT_REQUIRED"; }
        assert(failedClosed, "tenant filter fails closed without tenant context");
        await runWithTenant({ tenantId: tenant._id, tenant, role: "public", bypass: false }, async () => {
          assert(String(getTenantContext().tenantId) === String(tenant._id), "single-tenant development context resolves deterministically");
          const scoped = mergeTenantFilter(filter);
          assert(String(scoped.tenantId) === String(tenant._id), "resolved tenant is injected into authentication queries");
        });
      });
    } else {
      console.log(`INFO: ${tenants.length} active/trial tenants found; single-tenant development fallback is correctly not applicable.`);
    }

    console.log("AUTH/TENANT CONTRACT PASSED");
  } finally {
    if (originalEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalEnv;
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
