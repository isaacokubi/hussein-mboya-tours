/**
 * Purpose: tenant Model Contract Check operational script. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import fs from "node:fs";
// Load node:path so this module can use its exported dependencies.
import path from "node:path";
// Load node:url so this module can use its exported dependencies.
import { fileURLToPath } from "node:url";

// Declare root for use by the surrounding module or function.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../models");
// Declare allowedGlobalTenantLookup for use by the surrounding module or function.
const allowedGlobalTenantLookup = new Set(["WebsiteIntegrationKey"]);
// Declare failures for use by the surrounding module or function.
const failures = [];

// Repeat the enclosed work for each required iteration.
for (const file of fs.readdirSync(root).filter((name) => name.endsWith(".js")).sort()) {
  // Declare fullPath for use by the surrounding module or function.
  const fullPath = path.join(root, file);
  // Declare source for use by the surrounding module or function.
  const source = fs.readFileSync(fullPath, "utf8");
  // Check the condition (!/\btenantId\s*:/.test(source)) and run the matching branch.
  if (!/\btenantId\s*:/.test(source)) continue;

  // Declare modelName for use by the surrounding module or function.
  const modelName = file.replace(/\.js$/, "");
  // Check the condition (allowedGlobalTenantLookup.has(modelName)) and run the matching branch.
  if (allowedGlobalTenantLookup.has(modelName)) continue;

  // Check the condition (!source.includes('from "../tenancy/tenantPlugin.js"')) and run the matching branch.
  if (!source.includes('from "../tenancy/tenantPlugin.js"')) {
    // Perform the side effect or state update expressed on the following line.
    failures.push(`${modelName}: declares tenantId but does not import tenantPlugin`);
    // Skip the remainder of this iteration and continue with the next one.
    continue;
  }

  // Check the condition (!source.includes("tenantPlugin(") && !source.includes(".plugin(tenantP) and run the matching branch.
  if (!source.includes("tenantPlugin(") && !source.includes(".plugin(tenantPlugin")) {
    // Perform the side effect or state update expressed on the following line.
    failures.push(`${modelName}: declares tenantId but does not apply tenantPlugin before model compilation`);
  }
}

// Perform the side effect or state update expressed on the following line.
console.log("Tenant model contract:");
// Check the condition (failures.length) and run the matching branch.
if (failures.length) {
  // Repeat the enclosed work for each required iteration.
  for (const failure of failures) console.error(`FAIL ${failure}`);
  // Perform the side effect or state update expressed on the following line.
  process.exit(1);
}
// Perform the side effect or state update expressed on the following line.
console.log("PASS every tenant-scoped model explicitly applies tenantPlugin.");
// Perform the side effect or state update expressed on the following line.
console.log("PASS WebsiteIntegrationKey is the only documented pre-tenant global key-lookup exception.");
