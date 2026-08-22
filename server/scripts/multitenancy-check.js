import fs from "node:fs";
import path from "node:path";

const serverRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const repoRoot = path.resolve(serverRoot, "..");
const modelDir = path.join(serverRoot, "models");
const excluded = new Set(["Organization.js", "Permission.js", "Currency.js"]);
const failures = [];
for (const file of fs.readdirSync(modelDir).filter((name) => name.endsWith(".js"))) {
  const source = fs.readFileSync(path.join(modelDir, file), "utf8");
  if (!source.includes("mongoose.model(")) continue;
  if (excluded.has(file)) continue;
  if (!source.includes("tenantPlugin")) failures.push(`${file}: tenantPlugin import missing`);
  if (!source.includes("plugin(tenantPlugin)")) failures.push(`${file}: tenantPlugin registration missing`);
}

const middleware = fs.readFileSync(path.join(serverRoot, "middleware/tenantMiddleware.js"), "utf8");
const auth = fs.readFileSync(path.join(serverRoot, "middleware/authMiddleware.js"), "utf8");
const axios = fs.readFileSync(path.join(repoRoot, "client/src/api/axios.js"), "utf8");
const routes = fs.readFileSync(path.join(serverRoot, "routes/index.js"), "utf8");
if (!middleware.includes("X-Tenant-ID") || !middleware.includes("X-Tenant-Slug")) failures.push("tenant middleware: tenant header resolution missing");
if (!auth.includes("tenantId") || !auth.includes("tenant mismatch")) failures.push("auth middleware: tenant isolation checks missing");
if (!axios.includes("X-Tenant-ID") || !axios.includes("X-Tenant-Slug")) failures.push("client axios: tenant header propagation missing");
if (!routes.includes('router.use("/tenants", tenantRoutes)')) failures.push("tenant API routes not mounted");

if (failures.length) {
  console.error("Multi-tenancy check: FAIL");
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Multi-tenancy check: PASS");
console.log(`Tenant-aware model files checked: ${fs.readdirSync(modelDir).filter((name) => name.endsWith(".js") && !excluded.has(name)).length}`);
