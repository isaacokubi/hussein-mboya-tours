import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../models");
const allowedGlobalTenantLookup = new Set(["WebsiteIntegrationKey"]);
const failures = [];

for (const file of fs.readdirSync(root).filter((name) => name.endsWith(".js")).sort()) {
  const fullPath = path.join(root, file);
  const source = fs.readFileSync(fullPath, "utf8");
  if (!/\btenantId\s*:/.test(source)) continue;

  const modelName = file.replace(/\.js$/, "");
  if (allowedGlobalTenantLookup.has(modelName)) continue;

  if (!source.includes('from "../tenancy/tenantPlugin.js"')) {
    failures.push(`${modelName}: declares tenantId but does not import tenantPlugin`);
    continue;
  }

  if (!source.includes("tenantPlugin(") && !source.includes(".plugin(tenantPlugin")) {
    failures.push(`${modelName}: declares tenantId but does not apply tenantPlugin before model compilation`);
  }
}

console.log("Tenant model contract:");
if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}
console.log("PASS every tenant-scoped model explicitly applies tenantPlugin.");
console.log("PASS WebsiteIntegrationKey is the only documented pre-tenant global key-lookup exception.");
