import { AsyncLocalStorage } from "node:async_hooks";

const storage = new AsyncLocalStorage();

export function getTenantContext() { return storage.getStore() || null; }
export function setTenantContext(context) {
  const current = storage.getStore() || {};
  storage.enterWith({ ...current, ...context });
  return getTenantContext();
}
export function runWithTenant(context, callback) { return storage.run({ ...context }, callback); }
export function getTenantId() {
  const value = getTenantContext()?.tenantId;
  return value ? String(value) : null;
}
export function isTenantBypassed() { return Boolean(getTenantContext()?.bypass); }
