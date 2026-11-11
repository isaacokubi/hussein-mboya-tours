/**
 * Purpose: tenant Isolation Plugin server application module. Main declarations: tenantIsolationPlugin.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
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
// Define tenantIsolationPlugin; its parameters and body implement this operation.
export default function tenantIsolationPlugin(schema) {
  // Check the condition (!schema?.path?.("tenantId")) and run the matching branch.
  if (!schema?.path?.("tenantId")) return;
  // Perform the side effect or state update expressed on the following line.
  tenantPlugin(schema);
}
