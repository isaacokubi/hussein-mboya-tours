import { AsyncLocalStorage } from "async_hooks";

const tenantStorage = new AsyncLocalStorage();
const PLATFORM_ROLES = new Set(["super_admin", "super_admin"]);
const isPlatformRole = (role) => PLATFORM_ROLES.has(String(role || "").trim().toLowerCase());

/* Main tenant wrapper */
export function runWithTenant(context, callback) {
  const role = String(context?.role || "").trim().toLowerCase() || null;
  const platformOwner = isPlatformRole(role);
  return tenantStorage.run(
    {
      tenantId: platformOwner ? null : (context?.tenantId || null),
      role,
      tenant: platformOwner ? null : (context?.tenant || null),
      bypass: context?.bypass === true || platformOwner
    },
    callback
  );
}

/* Existing middleware compatibility */
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
    bypass: false
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
  if (context.tenantId && context.bypass !== true) {
    return { ...filter, tenantId: context.tenantId };
  }
  return filter;
}
