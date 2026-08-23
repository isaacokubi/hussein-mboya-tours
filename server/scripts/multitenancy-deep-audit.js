import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverDir = path.resolve(__dirname, "..");
const modelsDir = path.join(serverDir, "models");
const globalModels = new Map([
  ["Organization.js", "organizations"],
  ["Permission.js", "permissions"],
  ["Currency.js", "currencies"],
]);
const applicationDirs = new Set(["controllers", "services", "routes", "middleware", "socket"]);

const failures = [];
const warnings = [];
const pass = (message) => console.log(`PASS: ${message}`);
const fail = (message) => failures.push(message);
const warn = (message) => warnings.push(message);

function read(relativePath) {
  return fs.readFileSync(path.join(serverDir, relativePath), "utf8");
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (entry.isFile() && full.endsWith(".js")) files.push(full);
  }
  return files;
}

console.log("==================================================");
console.log("COHERENT TOURS - DEEP MULTITENANCY STATIC AUDIT");
console.log("==================================================");

const tenantPlugin = read("tenancy/tenantPlugin.js");
const context = read("tenancy/context.js");
const auth = read("middleware/authMiddleware.js");
const middleware = read("middleware/tenantMiddleware.js");
const isolationPlugin = read("utils/tenantIsolationPlugin.js");

for (const pattern of [
  'options.global === true',
  'schema.pre("save"',
  '"insertMany"',
  '"findOneAndDelete"',
  '"findOneAndReplace"',
  '"replaceOne"',
  '"distinct"',
  '"bulkWrite"',
  '"aggregate"',
  'enforceLookupStage',
  'enforceUnionStage',
  'enforceGraphLookupStage',
  'estimatedDocumentCount',
]) {
  if (!tenantPlugin.includes(pattern)) fail(`tenantPlugin missing required contract: ${pattern}`);
}
if (!failures.length) pass("Canonical tenantPlugin covers writes, replacements, deletes, distinct, bulkWrite and aggregation.");

for (const pattern of [
  'if (context.bypass === true)',
  'if (!context.tenantId)',
  'TENANT_CONTEXT_REQUIRED',
  'return { ...filter, tenantId: context.tenantId }',
]) {
  if (!context.includes(pattern)) fail(`tenant context missing fail-closed contract: ${pattern}`);
}
if (!failures.length) pass("mergeTenantFilter fails closed without tenant context and permits explicit bypass only.");

for (const pattern of [
  'requestedTenantId !== userTenantId',
  'tokenTenantId !== userTenantId',
  'Authentication tenant mismatch.',
  'You cannot access another company.',
]) {
  if (!auth.includes(pattern)) fail(`authMiddleware missing tenant-boundary check: ${pattern}`);
}
if (!failures.length) pass("Authentication binds the session to the database tenant and rejects cross-tenant requests.");

for (const pattern of ["X-Tenant-Slug", "tenantId", "Organization"]) {
  if (!middleware.includes(pattern)) fail(`tenantMiddleware missing tenant resolution contract: ${pattern}`);
}
if (!failures.length) pass("Tenant middleware resolves tenant identity from the organization registry.");

if (!isolationPlugin.includes("tenantPlugin") || !isolationPlugin.includes('schema?.path?.("tenantId")')) {
  fail("Legacy tenantIsolationPlugin is not delegating to canonical tenantPlugin.");
} else {
  pass("Legacy isolation loader delegates to the canonical tenantPlugin.");
}

const modelFiles = fs.readdirSync(modelsDir).filter((file) => file.endsWith(".js")).sort();
let tenantAware = 0;

for (const file of modelFiles) {
  const text = fs.readFileSync(path.join(modelsDir, file), "utf8");
  const declaresTenant = /\btenantId\s*:/.test(text);
  const usesPlugin = text.includes("tenantPlugin");

  if (declaresTenant) {
    tenantAware += 1;
    if (!usesPlugin) fail(`Tenant-aware model missing tenantPlugin: ${file}`);
  }
}
pass(`Scanned ${modelFiles.length} model files; ${tenantAware} explicitly declare tenantId.`);

for (const [file, collection] of globalModels) {
  const text = fs.readFileSync(path.join(modelsDir, file), "utf8");
  if (!text.includes("tenantPlugin") || !text.includes("tenantPlugin(") || !text.includes("{ global: true }")) {
    fail(`Global model ${file} must use tenantPlugin(schema, { global: true }).`);
  }
  if (!tenantPlugin.includes(`"${collection}"`)) {
    fail(`Global collection ${collection} is missing from canonical global collection policy.`);
  }
}
if (!failures.length) pass("Organization, Permission and Currency are explicitly platform-global and excluded from tenant filtering/index partitioning.");

const sourceFiles = walk(serverDir).filter((file) => !file.includes(`${path.sep}node_modules${path.sep}`));
const dangerousNativeQueries = [];
const unsafeEstimatedCounts = [];
const directLegacyPluginUse = [];
const bypassSites = [];

for (const file of sourceFiles) {
  const relative = path.relative(serverDir, file).replaceAll(path.sep, "/");
  const topLevelDir = relative.split("/")[0];
  const text = fs.readFileSync(file, "utf8");

  // Native collection access is only a tenant-isolation risk in application
  // request paths. Maintenance, migration, backup and regression scripts are
  // intentionally excluded because they operate with explicit administrative
  // scope and are covered by separate checks.
  if (applicationDirs.has(topLevelDir) && /\.collection\s*\(|\.db\s*\.collection\s*\(/.test(text)) {
    const hasTenantGuard = /tenantFilter\s*\(/.test(text) || /tenantId\s*:/.test(text) || /mergeTenantFilter\s*\(/.test(text);
    if (!hasTenantGuard) dangerousNativeQueries.push(relative);
  }

  if (applicationDirs.has(topLevelDir) && /\.estimatedDocumentCount\s*\(/.test(text)) {
    unsafeEstimatedCounts.push(relative);
  }

  if (topLevelDir === "models" && text.includes("tenantIsolationPlugin") && !relative.endsWith("utils/tenantIsolationPlugin.js")) {
    directLegacyPluginUse.push(relative);
  }

  if (text.includes("bypass: true")) bypassSites.push(relative);
}

if (dangerousNativeQueries.length) {
  for (const file of dangerousNativeQueries) fail(`Unguarded native MongoDB collection access in application code: ${file}`);
} else {
  pass("No unguarded native MongoDB collection access was detected in application request paths.");
}

if (unsafeEstimatedCounts.length) {
  for (const file of unsafeEstimatedCounts) fail(`estimatedDocumentCount usage in application request path: ${file}`);
} else {
  pass("No estimatedDocumentCount usage detected in application request paths.");
}

if (directLegacyPluginUse.length) {
  for (const file of directLegacyPluginUse) fail(`Direct legacy tenantIsolationPlugin use detected in active model: ${file}`);
} else {
  pass("No active application model directly uses the legacy isolation plugin.");
}

if (bypassSites.length) {
  warn(`Explicit tenant bypass sites detected (${bypassSites.length}); these require platform-owner authorization review.`);
}

if (failures.length) {
  console.error("\nFAILURES:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

if (warnings.length) {
  console.log("\nWARNINGS:");
  for (const warning of warnings) console.log(`- ${warning}`);
}

console.log("\nDEEP MULTITENANCY STATIC AUDIT PASSED");
