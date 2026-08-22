import { AsyncLocalStorage } from "async_hooks";

const tenantStorage = new AsyncLocalStorage();

/*
 Main tenant wrapper
*/
export function runWithTenant(context, callback) {
  return tenantStorage.run(
    {
      tenantId: context?.tenantId || null,
      role: context?.role || null,
      tenant: context?.tenant || null,
      bypass:
        context?.bypass === true ||
        context?.role === "super_admin"
    },
    callback
  );
}

/*
 Existing middleware compatibility
*/
export function setTenantContext(context) {
  const store = tenantStorage.getStore();

  if (store) {
    store.tenantId = context?.tenantId || null;
    store.role = context?.role || null;
    store.tenant = context?.tenant || null;
    store.bypass =
      context?.bypass === true ||
      context?.role === "super_admin";
  }
}

/*
 Current context
*/
export function getTenantContext() {
  return tenantStorage.getStore() || {
    tenantId: null,
    role: null,
    tenant: null,
    bypass: false
  };
}

/*
 Require a resolved tenant for tenant-scoped operations.
 Throws instead of silently continuing with an unscoped query.
*/
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

/*
 Legacy function
 Used by tenantPlugin.js
*/
export function getTenantId() {
  const context = getTenantContext();
  return context.tenantId || null;
}

/*
 Legacy bypass checker
 Used by tenantPlugin.js
*/
export function isTenantBypassed() {
  const context = getTenantContext();
  return context.bypass === true;
}

/*
 Compatibility helper
 Used by controllers/services that need tenant-aware filters
*/
export function mergeTenantFilter(filter = {}) {
  const context = getTenantContext();

  if (
    context.tenantId &&
    context.bypass !== true
  ) {
    return {
      ...filter,
      tenantId: context.tenantId
    };
  }

  return filter;
}
