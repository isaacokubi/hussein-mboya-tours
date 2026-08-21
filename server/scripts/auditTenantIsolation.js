import mongoose from "mongoose";
import { getTenantContext } from "../tenancy/context.js";

/**
 * Multitenancy verification helper.
 * Run this after loading the application environment to confirm
 * tenant context behaviour before production release.
 */

function assert(condition, message) {
  if (!condition) throw new Error(`TENANT AUDIT FAILED: ${message}`);
}

export async function runTenantIsolationAudit() {
  const context = getTenantContext();

  assert(
    Object.prototype.hasOwnProperty.call(context, "tenantId"),
    "tenant context must expose tenantId"
  );

  assert(
    Object.prototype.hasOwnProperty.call(context, "bypass"),
    "tenant context must expose bypass flag"
  );

  console.log("Tenant context structure OK");
  console.log({
    tenantId: context.tenantId,
    role: context.role,
    bypass: context.bypass,
  });

  return true;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await mongoose.disconnect().catch(() => {});
  await runTenantIsolationAudit();
}
