import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODELS = path.resolve(__dirname, "../../models");

console.log("==============================================");
console.log(" COHERENT TOURS - MODEL TENANT AUDIT");
console.log("==============================================");
console.log();

const files = fs
  .readdirSync(MODELS)
  .filter((file) => file.endsWith(".js"))
  .sort();

let pluginCount = 0;
let tenantFieldCount = 0;
let reviewCount = 0;

for (const file of files) {
  const fullPath = path.join(MODELS, file);
  const source = fs.readFileSync(fullPath, "utf8");

  const hasTenantPlugin =
    /tenantPlugin\s*\(/.test(source) ||
    /tenantPlugin\.js/.test(source);

  const hasTenantId =
    /tenantId\s*:/.test(source);

  const isOrganization =
    file.toLowerCase() === "organization.js";

  if (hasTenantPlugin) pluginCount++;
  if (hasTenantId) tenantFieldCount++;

  if (isOrganization) {
    console.log(`🌐 ${file} - GLOBAL ORGANIZATION MODEL`);
    continue;
  }

  if (hasTenantPlugin) {
    console.log(`✅ ${file} - tenantPlugin`);
  } else if (hasTenantId) {
    console.log(`⚠️  ${file} - has tenantId but no visible tenantPlugin`);
    reviewCount++;
  } else {
    console.log(`ℹ️  ${file} - no visible tenantPlugin`);
  }
}

console.log();
console.log("==============================================");
console.log(`Models using tenantPlugin : ${pluginCount}`);
console.log(`Models containing tenantId: ${tenantFieldCount}`);
console.log(`Models requiring review   : ${reviewCount}`);
console.log("==============================================");
