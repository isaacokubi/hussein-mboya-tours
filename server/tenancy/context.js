import { AsyncLocalStorage } from "async_hooks";

const tenantStorage = new AsyncLocalStorage();
const PLATFORM_ROLES = new Set(["super_admin", "superadmin"]);
const isPlatformRole = (role) => PLATFORM_ROLES.has(String(role || "").trim().toLowerCase());

/**
 * Run work inside an isolated tenant context and keep that context active
 * until async/thenable work returned by the callback has actually completed.
 *
 * Platform contexts are entered into the current execution context instead of
 * being limited to a child AsyncLocalStorage scope. Authentication resolves a
 * global SuperAdmin inside this helper and then continues with password
 * verification, saves, audit/security logging and token creation. Those later
 * operations must still see the platform bypass after this function returns.
 */
export async function runWithTenant(context, callback) {
  const role = String(context?.role || "").trim().toLowerCase() || null;
  const platformOwner = isPlatformRole(role);
  const store = {
    tenantId: platformOwner ? null : (context?.tenantId || null),
    role,
    tenant: platformOwner ? null : (context?.tenant || null),
    bypass: context?.bypass === true || platformOwner,
  };

  // A platform owner is global rather than tenant-scoped. Enter the platform
  // store directly so the authenticated request retains the bypass after the
  // callback resolves. Ordinary tenant contexts remain isolated in run().
  if (platformOwner) {
    tenantStorage.enterWith(store);
    return await callback();
  }

  return tenantStorage.run(store, async () => await callback());
}

export function setTenantContext(context) {
  const current = tenantStorage.getStore();
  const role = String(context?.role || current?.role || "").trim().toLowerCase() || null;
  const platformOwner = isPlatformRole(role);
  const store = current || {};

  store.tenantId = platformOwner ? null : (context?.tenantId || null);
  store.role = role;
  store.tenant = platformOwner ? null : (context?.tenant || null);
  store.bypass = context?.bypass === true || platformOwner;

  // setTenantContext may be called after a temporary lookup scope has ended.
  // Enter the store when no ALS context exists so the current request can
  // continue safely with the resolved tenant/platform context.
  if (!current) tenantStorage.enterWith(store);
}

export function getTenantContext() {
  return tenantStorage.getStore() || {
    tenantId: null,
    role: null,
    tenant: null,
    bypass: false,
  };
}

export function requireTenantId() {
  const { tenantId } = getTenantContext();
  if (!tenantId) {
    const error = new Error("Tenant context is required");
    error.status = 400;
    error.code = "TENANT_CONTEXT_REQUIRED";
    throw error;
  }
  return tenantId;
}

export function getTenantId() {
  return getTenantContext().tenantId || null;
}

export function isTenantBypassed() {
  return getTenantContext().bypass === true;
}

export function mergeTenantFilter(filter = {}) {
  const context = getTenantContext();

  if (context.bypass === true) return { ...filter };
  if (!context.tenantId) {
    const error = new Error("Tenant context is required");
    error.status = 400;
    error.code = "TENANT_CONTEXT_REQUIRED";
    throw error;
  }

  return { ...filter, tenantId: context.tenantId };
}
