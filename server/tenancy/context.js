import { AsyncLocalStorage } from "async_hooks";

const tenantStorage = new AsyncLocalStorage();
const PLATFORM_ROLES = new Set(["super_admin", "superadmin"]);
const isPlatformRole = (role) => PLATFORM_ROLES.has(String(role || "").trim().toLowerCase());

const normalizeTenantId = (value) => {
  if (value == null || value === "") return null;
  if (typeof value === "string") return value;
  if (value?._id) return String(value._id);
  return String(value);
};

/**
 * Run work inside an isolated tenant context and keep that context active
 * until async/thenable work returned by the callback has actually completed.
 */
export async function runWithTenant(context, callback) {
  const role = String(context?.role || "").trim().toLowerCase() || null;
  const platformOwner = isPlatformRole(role);
  const store = {
    tenantId: platformOwner ? null : normalizeTenantId(context?.tenantId),
    role,
    tenant: platformOwner ? null : (context?.tenant || null),
    bypass: context?.bypass === true || platformOwner,
  };

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

  store.tenantId = platformOwner
    ? null
    : normalizeTenantId(context?.tenantId || store.tenantId);
  store.role = role;
  store.tenant = platformOwner ? null : (context?.tenant || store.tenant || null);
  store.bypass = context?.bypass === true || platformOwner;

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

/**
 * Merge the active tenant into a Mongo filter.
 *
 * Preferred usage:
 *   mergeTenantFilter({ status: "active" })
 *
 * Legacy controllers may still call:
 *   mergeTenantFilter(req, { status: "active" })
 *
 * Never spread the Express request object into a Mongo query. Apart from being
 * unnecessary, req contains circular references and causes Mongoose/MongoDB
 * to throw "Cannot convert circular structure to BSON".
 */
export function mergeTenantFilter(filter = {}, maybeFilter) {
  const context = getTenantContext();
  const effectiveFilter = maybeFilter === undefined ? filter : maybeFilter;

  if (context.bypass === true) return { ...(effectiveFilter || {}) };
  if (!context.tenantId) {
    const error = new Error("Tenant context is required");
    error.status = 400;
    error.code = "TENANT_CONTEXT_REQUIRED";
    throw error;
  }

  return { ...(effectiveFilter || {}), tenantId: context.tenantId };
}
