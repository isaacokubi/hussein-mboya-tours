/**
 * Purpose: context tenant-isolation module. Main declarations: isPlatformRole, normalizeTenantId, runWithTenant, setTenantContext, getTenantContext.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { AsyncLocalStorage } from "async_hooks";

// Declare tenantStorage for use by the surrounding module or function.
const tenantStorage = new AsyncLocalStorage();
// Declare PLATFORM_ROLES for use by the surrounding module or function.
const PLATFORM_ROLES = new Set(["super_admin", "superadmin"]);
// Declare isPlatformRole for use by the surrounding module or function.
const isPlatformRole = (role) => PLATFORM_ROLES.has(String(role || "").trim().toLowerCase());

// Declare normalizeTenantId for use by the surrounding module or function.
const normalizeTenantId = (value) => {
  // Check the condition (value == null || value === "") and run the matching branch.
  if (value == null || value === "") return null;
  // Check the condition (typeof value === "string") and run the matching branch.
  if (typeof value === "string") return value;
  // Check the condition (value?._id) and run the matching branch.
  if (value?._id) return String(value._id);
  // Return the result of String() to the caller.
  return String(value);
};

/**
 * Run work inside an isolated tenant context and keep that context active
 * until async/thenable work returned by the callback has actually completed.
 */
// Define runWithTenant; its parameters and body implement this operation.
export async function runWithTenant(context, callback) {
  // Declare role for use by the surrounding module or function.
  const role = String(context?.role || "").trim().toLowerCase() || null;
  // Declare platformOwner for use by the surrounding module or function.
  const platformOwner = isPlatformRole(role);
  // Declare store for use by the surrounding module or function.
  const store = {
    tenantId: platformOwner ? null : normalizeTenantId(context?.tenantId),
    role,
    tenant: platformOwner ? null : (context?.tenant || null),
    bypass: context?.bypass === true || platformOwner,
  };

  // Check the condition (platformOwner) and run the matching branch.
  if (platformOwner) {
    // Perform the side effect or state update expressed on the following line.
    tenantStorage.enterWith(store);
    // Return the completed the result of callback() operation to the caller.
    return await callback();
  }

  // Return the result of tenantStorage.run() to the caller.
  return tenantStorage.run(store, async () => await callback());
}

// Define setTenantContext; its parameters and body implement this operation.
export function setTenantContext(context) {
  // Declare current for use by the surrounding module or function.
  const current = tenantStorage.getStore();
  // Declare role for use by the surrounding module or function.
  const role = String(context?.role || current?.role || "").trim().toLowerCase() || null;
  // Declare platformOwner for use by the surrounding module or function.
  const platformOwner = isPlatformRole(role);
  // Declare store for use by the surrounding module or function.
  const store = current || {};

  // Perform the side effect or state update expressed on the following line.
  store.tenantId = platformOwner
    ? null
    : normalizeTenantId(context?.tenantId || store.tenantId);
  // Perform the side effect or state update expressed on the following line.
  store.role = role;
  // Perform the side effect or state update expressed on the following line.
  store.tenant = platformOwner ? null : (context?.tenant || store.tenant || null);
  // Perform the side effect or state update expressed on the following line.
  store.bypass = context?.bypass === true || platformOwner;

  // Check the condition (!current) and run the matching branch.
  if (!current) tenantStorage.enterWith(store);
}

// Define getTenantContext; its parameters and body implement this operation.
export function getTenantContext() {
  // Return the expression shown below to the caller.
  return tenantStorage.getStore() || {
    tenantId: null,
    role: null,
    tenant: null,
    bypass: false,
  };
}

// Define requireTenantId; its parameters and body implement this operation.
export function requireTenantId() {
  // Declare { tenantId } for use by the surrounding module or function.
  const { tenantId } = getTenantContext();
  // Check the condition (!tenantId) and run the matching branch.
  if (!tenantId) {
    // Declare error for use by the surrounding module or function.
    const error = new Error("Tenant context is required");
    // Perform the side effect or state update expressed on the following line.
    error.status = 400;
    // Perform the side effect or state update expressed on the following line.
    error.code = "TENANT_CONTEXT_REQUIRED";
    // Stop the current operation by raising the value of error.
    throw error;
  }
  // Return the value of tenantId to the caller.
  return tenantId;
}

// Define getTenantId; its parameters and body implement this operation.
export function getTenantId() {
  // Return the expression shown below to the caller.
  return getTenantContext().tenantId || null;
}

// Define isTenantBypassed; its parameters and body implement this operation.
export function isTenantBypassed() {
  // Return the expression shown below to the caller.
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
// Define mergeTenantFilter; its parameters and body implement this operation.
export function mergeTenantFilter(filter = {}, maybeFilter) {
  // Declare context for use by the surrounding module or function.
  const context = getTenantContext();
  // Declare effectiveFilter for use by the surrounding module or function.
  const effectiveFilter = maybeFilter === undefined ? filter : maybeFilter;

  // Check the condition (context.bypass === true) and run the matching branch.
  if (context.bypass === true) return { ...(effectiveFilter || {}) };
  // Check the condition (!context.tenantId) and run the matching branch.
  if (!context.tenantId) {
    // Declare error for use by the surrounding module or function.
    const error = new Error("Tenant context is required");
    // Perform the side effect or state update expressed on the following line.
    error.status = 400;
    // Perform the side effect or state update expressed on the following line.
    error.code = "TENANT_CONTEXT_REQUIRED";
    // Stop the current operation by raising the value of error.
    throw error;
  }

  // Return the object assembled below to the caller.
  return { ...(effectiveFilter || {}), tenantId: context.tenantId };
}
