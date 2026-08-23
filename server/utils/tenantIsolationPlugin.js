import { tenantPlugin } from "../tenancy/tenantPlugin.js";

/**
 * Global safety loader for schemas that explicitly declare tenantId.
 *
 * The previous implementation only added read/aggregate filters. That left
 * tenant-aware schemas without tenantPlugin vulnerable to incomplete write
 * protection. The canonical tenantPlugin now owns both read and write
 * isolation.
 *
 * Schemas that do not declare tenantId are intentionally untouched so global
 * collections such as permissions, currencies and organizations remain
 * global.
 */
export default function tenantIsolationPlugin(schema) {
  if (!schema?.path?.("tenantId")) return;
  tenantPlugin(schema);
}
