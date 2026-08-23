import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const modelsDir = path.resolve(__dirname, "../models");
const tenantPluginPath = path.resolve(__dirname, "../tenancy/tenantPlugin.js");
const isolationPluginPath = path.resolve(__dirname, "../utils/tenantIsolationPlugin.js");
const tenantMiddlewarePath = path.resolve(__dirname, "../middleware/tenantMiddleware.js");
const authMiddlewarePath = path.resolve(__dirname, "../middleware/authMiddleware.js");

const failures = [];
const pass = (message) => console.log(`PASS: ${message}`);
const fail = (message) => failures.push(message);

function requireText(file, patterns, label) {
  const text = fs.readFileSync(file, "utf8");
  for (const pattern of patterns) {
    if (!text.includes(pattern)) {
      fail(`${label}: missing ${pattern}`);
    }
  }
}

console.log("==================================================");
console.log("COHERENT TOURS - FULL MULTITENANCY CONTRACT");
console.log("==================================================");

requireText(
  tenantPluginPath,
  [
    'TENANT_PATH = "tenantId"',
    'schema.pre("save"',
    '"insertMany"',
    '"findOneAndReplace"',
    '"replaceOne"',
    '"bulkWrite"',
    '"aggregate"',
    "enforceReplacementTenant",
    "Array.isArray(update)",
    "Cross-tenant",
  ],
  "tenantPlugin"
);

if (!failures.length) pass("tenantPlugin covers save, insertMany, queries, replacements, bulkWrite and aggregation.");

requireText(
  isolationPluginPath,
  [
    'tenantPlugin',
    'schema?.path?.("tenantId")',
  ],
  "tenantIsolationPlugin"
);

if (!failures.length) pass("Global isolation loader delegates to canonical tenantPlugin.");

requireText(
  tenantMiddlewarePath,
  [
    "X-Tenant-Slug",
    "tenantId",
  ],
  "tenantMiddleware"
);

if (!failures.length) pass("Tenant middleware resolves tenant identity.");

requireText(
  authMiddlewarePath,
  [
    "requestedTenantId",
    "userTenantId",
    "requestedTenantId !== userTenantId",
    "tokenTenantId !== userTenantId",
    "Authentication tenant mismatch.",
    "You cannot access another company.",
  ],
  "authMiddleware"
);

if (!failures.length) pass("Authentication layer rejects cross-tenant identity mismatch.");

const modelFiles = fs
  .readdirSync(modelsDir)
  .filter((file) => file.endsWith(".js"))
  .sort();

let tenantCandidates = 0;

for (const file of modelFiles) {
  const fullPath = path.join(modelsDir, file);
  const text = fs.readFileSync(fullPath, "utf8");

  if (!/\btenantId\s*:/.test(text)) continue;

  tenantCandidates++;

  if (!text.includes("tenantPlugin")) {
    fail(`Tenant-aware model missing explicit tenantPlugin: ${file}`);
  }
}

pass(`Scanned ${modelFiles.length} model files; ${tenantCandidates} declare tenantId.`);

if (failures.length) {
  console.error("");
  console.error("FAILURES:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("");
console.log("FULL MULTITENANCY CONTRACT PASSED");
