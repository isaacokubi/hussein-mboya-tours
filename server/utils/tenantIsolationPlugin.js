// Import the canonical tenant plugin that enforces tenant-scoped database access.
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
// Apply tenant isolation to each Mongoose schema that owns tenantId.
export default function tenantIsolationPlugin(schema) {
  // Leave global schemas alone when they do not declare a tenantId path.
  if (!schema?.path?.("tenantId")) return;
  // Attach the canonical read/write tenant protections to tenant-owned schemas.
  tenantPlugin(schema);
}
