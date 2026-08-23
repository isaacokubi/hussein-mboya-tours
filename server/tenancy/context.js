import { AsyncLocalStorage } from "async_hooks";

const tenantStorage = new AsyncLocalStorage();
const PLATFORM_ROLES = new Set(["super_admin", "superadmin"]);
const isPlatformRole = (role) => PLATFORM_ROLES.has(String(role || "").trim().toLowerCase());

/**
 * Run work inside an isolated tenant context and keep that context active
 * until async/thenable work returned by the callback has actually completed.
 *
 * This distinction is important with Mongoose: returning a Query directly
 * from AsyncLocalStorage.run() exits the ALS scope before the query executes,
 * which can cause a platform SuperAdmin query to inherit the public tenant
 * context and incorrectly return no user.
 */
export function runWithTenant(context, callback) {
  const role = String(context?.role || "").trim().toLowerCase() || null;
  const platformOwner = isPlatformRole(role);
  const store = {
    tenantId: platformOwner ? null : (context?.tenantId || null),
    role,
    tenant: platformOwner ? null : (context?.tenant || null),
    bypass: context?.bypass === true || platformOwner,
  };

  return tenantStorage.run(store, async () => await callback());
}

export function setTenantContext(context) {
  const store = tenantStorage.getStore();
  if (store) {
    const role = String(context?.role || store.role || "").trim().toLowerCase() || null;
    const platformOwner = isPlatformRole(role);
    store.tenantId = platformOwner ? null : (context?.tenantId || null);
    store.role = role;
    store.tenant = platformOwner ? null : (context?.tenant || null);
    store.bypass = context?.bypass === true || platformOwner;
  }
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
