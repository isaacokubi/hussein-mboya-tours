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
    // Store only the scalar tenant id in AsyncLocalStorage. Keeping a
    // Mongoose ObjectId/document here can leak query/runtime state into BSON
    // serialization when tenant filters are later composed by middleware.
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
