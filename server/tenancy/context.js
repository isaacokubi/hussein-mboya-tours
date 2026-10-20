// Import async-local storage, which preserves request context across asynchronous callbacks.
import { AsyncLocalStorage } from "async_hooks";

// Create the isolated storage container used to hold the active tenant per async flow.
const tenantStorage = new AsyncLocalStorage();
// Identify the platform-wide roles that are allowed to operate outside one tenant.
const PLATFORM_ROLES = new Set(["super_admin", "superadmin"]);
// Normalize a role label and check whether it belongs to the platform-wide role set.
const isPlatformRole = (role) => PLATFORM_ROLES.has(String(role || "").trim().toLowerCase());

// Convert supported tenant identifiers into strings, or null when no identifier exists.
const normalizeTenantId = (value) => {
  // Treat null and empty-string identifiers as absent tenant context.
  if (value == null || value === "") return null;
  // Keep an already-string identifier unchanged.
  if (typeof value === "string") return value;
  // Extract the database identifier from populated Mongoose-like documents.
  if (value?._id) return String(value._id);
  // Convert other primitive/object identifiers to a stable string representation.
  return String(value);
};

/**
 * Run work inside an isolated tenant context and keep that context active
 * until async/thenable work returned by the callback has actually completed.
 */
export async function runWithTenant(context, callback) {
  // Normalize the role so platform-role comparisons are consistent.
  const role = String(context?.role || "").trim().toLowerCase() || null;
  // Identify whether this execution belongs to a platform-wide administrator.
  const platformOwner = isPlatformRole(role);
  // Build the complete context object that will be visible to downstream services.
  const store = {
    // Platform owners intentionally have no single tenant ID; other users keep their normalized tenant ID.
    tenantId: platformOwner ? null : normalizeTenantId(context?.tenantId),
    // Store the normalized role for permission and query decisions.
    role,
    // Keep the tenant record only for tenant-scoped users.
    tenant: platformOwner ? null : (context?.tenant || null),
    // Permit explicit bypass only when requested, or when the role is platform-wide.
    bypass: context?.bypass === true || platformOwner,
  };

  // Platform-wide operations establish the context for the current async execution.
  if (platformOwner) {
    // Enter the platform context so tenant-aware helpers can recognize the approved bypass.
    tenantStorage.enterWith(store);
    // Run and await the callback while that platform context is active.
    return await callback();
  }

  // Run ordinary tenant work in an isolated async scope so requests do not share tenant state.
  return tenantStorage.run(store, async () => await callback());
}

// Update the active context when middleware has resolved additional identity information.
export function setTenantContext(context) {
  // Read the existing async-local context, if this request already established one.
  const current = tenantStorage.getStore();
  // Prefer the new role, falling back to the active role when none was supplied.
  const role = String(context?.role || current?.role || "").trim().toLowerCase() || null;
  // Re-evaluate platform status using the effective role.
  const platformOwner = isPlatformRole(role);
  // Reuse the current context object when possible so the active async scope sees updates.
  const store = current || {};

  // Platform users have no tenant; other users use the new ID or retain the existing ID.
  store.tenantId = platformOwner
    ? null
    : normalizeTenantId(context?.tenantId || store.tenantId);
  // Store the effective role in the current context.
  store.role = role;
  // Keep tenant details for tenant-scoped users while preventing platform users inheriting a tenant.
  store.tenant = platformOwner ? null : (context?.tenant || store.tenant || null);
  // Preserve explicit bypass or enable it for a platform-wide role.
  store.bypass = context?.bypass === true || platformOwner;

  // Establish a context when no async-local store existed before this call.
  if (!current) tenantStorage.enterWith(store);
}

// Return the active tenant context, or a safe empty context when none has been established.
export function getTenantContext() {
  // Use the async-local store when available; otherwise return non-bypassed defaults.
  return tenantStorage.getStore() || {
    tenantId: null, // No tenant is selected by default.
    role: null, // No role is assumed by default.
    tenant: null, // No tenant document is attached by default.
    bypass: false, // Never allow tenant bypass by default.
  };
}

// Require a tenant identifier before running a tenant-scoped database operation.
export function requireTenantId() {
  // Read the tenant identifier from the current request's isolated context.
  const { tenantId } = getTenantContext();
  // Reject missing tenant context rather than allowing an unscoped query.
  if (!tenantId) {
    // Create an error that the HTTP error middleware can translate into a response.
    const error = new Error("Tenant context is required");
    // Mark the error as a client/context problem.
    error.status = 400;
    // Attach a stable machine-readable code for callers and logs.
    error.code = "TENANT_CONTEXT_REQUIRED";
    // Stop the operation because a safe tenant boundary cannot be established.
    throw error;
  }
  // Return the required tenant ID to the caller.
  return tenantId;
}

// Return the current tenant ID, or null if no tenant is selected.
export function getTenantId() {
  // Read from the context and normalize missing values to null.
  return getTenantContext().tenantId || null;
}

// Report whether the current context explicitly allows tenant isolation to be bypassed.
export function isTenantBypassed() {
  // Only a strict boolean true is accepted as an active bypass.
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
  // Read the active tenant and bypass status for this asynchronous request.
  const context = getTenantContext();
  // Support both the preferred filter-only signature and the legacy two-argument signature.
  const effectiveFilter = maybeFilter === undefined ? filter : maybeFilter;

  // Platform-wide callers may query across tenants, but receive a fresh filter object.
  if (context.bypass === true) return { ...(effectiveFilter || {}) };
  // Deny tenant-scoped queries if no tenant has been established.
  if (!context.tenantId) {
    // Create an explicit error rather than silently returning an unscoped filter.
    const error = new Error("Tenant context is required");
    // Provide the HTTP status expected by error handling.
    error.status = 400;
    // Provide a stable code for logs and clients.
    error.code = "TENANT_CONTEXT_REQUIRED";
    // Abort before a database query can run without tenant isolation.
    throw error;
  }

  // Copy the requested filters and enforce the active tenant ID last, overriding any caller-supplied tenantId.
  return { ...(effectiveFilter || {}), tenantId: context.tenantId };
}
