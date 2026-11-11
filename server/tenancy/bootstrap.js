/**
 * Purpose: bootstrap tenant-isolation module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ./tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "./tenantPlugin.js";

// Declare excluded for use by the surrounding module or function.
const excluded = new Set([
  "Organization",
  "Permission",
  "Currency"
]);

// Check the condition (!mongoose.__tenantBootstrapApplied) and run the matching branch.
if (!mongoose.__tenantBootstrapApplied) {

  // Perform the side effect or state update expressed on the following line.
  mongoose.plugin((schema, options) => {

    // Declare modelName for use by the surrounding module or function.
    const modelName = options?.collection || schema.options?.collection;

    // Check the condition (!modelName) and run the matching branch.
    if (!modelName) return;

    // Check the condition (excluded.has(modelName)) and run the matching branch.
    if (excluded.has(modelName)) return;

    // Check the condition (!schema.path("tenantId")) and run the matching branch.
    if (!schema.path("tenantId")) return;

    // Perform the side effect or state update expressed on the following line.
    schema.plugin(tenantPlugin);

  });

  // Perform the side effect or state update expressed on the following line.
  mongoose.__tenantBootstrapApplied = true;

}
