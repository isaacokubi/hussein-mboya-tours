import { AsyncLocalStorage } from "async_hooks";

const tenantStorage = new AsyncLocalStorage();
const PLATFORM_ROLES = new Set(["super_admin", "superadmin"]);
const isPlatformRole = (role) => PLATFORM_ROLES.has(String(role || "").trim().toLowerCase());

/**
 * Run work inside an isolated tenant context and keep that context active
 * until async/thenable work returned by the callback has actually completed.
 *
 * A platform context is also promoted to the current request store before the
 * child scope is entered. This is important for authentication: the global
 * SuperAdmin is resolved inside a bypass scope, but the rest of the same
 * request (password verification, login bookkeeping, audit/security logs and
 * the final save) must continue to see that platform bypass. Promoting only
 * the child scope would cause the bypass to disappear when the callback
 * resolves and tenant-scoped models would throw "Tenant context is required".
 */
export function runWithTenant(context, callback) {
  const role = String(context?.role || "").trim().toLowerCase() || null;
  const platformOwner = isPlatformRole(role);
  const parentStore = tenantStorage.getStore();

  const store = {
    tenantId: platformOwner ? null : (context?.tenantId || null),
    role,
    tenant: platformOwner ? null : (context?.tenant || null),
    bypass: context?.bypass === true || platformOwner,
  };

  // If this is already running inside a request context, keep the platform
  // bypass active after the child AsyncLocalStorage scope completes. Never
  // promote ordinary tenant contexts, which preserves tenant isolation.
  if (parentStore && platformOwner) {
    parentStore.tenantId = null;
    parentStore.role = role;
    parentStore.tenant = null;
    parentStore.bypass = true;
  }

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
