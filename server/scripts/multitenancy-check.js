import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(scriptDir, "..");
const repoRoot = path.resolve(serverRoot, "..");
const required = ["models/Organization.js", "middleware/tenantMiddleware.js", "tenancy/context.js", "tenancy/tenantPlugin.js", "tenancy/bootstrap.js", "controllers/tenantController.js", "routes/tenantRoutes.js"];
const failures = required.filter((file) => !fs.existsSync(path.join(serverRoot, file))).map((file) => `missing: ${file}`);

if (failures.length) {
  console.error("Multi-tenancy check: FAIL");
  console.error(failures.join("\n"));
  process.exit(1);
}

const middleware = fs.readFileSync(path.join(serverRoot, "middleware/tenantMiddleware.js"), "utf8");
const auth = fs.readFileSync(path.join(serverRoot, "middleware/authMiddleware.js"), "utf8");
const axios = fs.readFileSync(path.join(repoRoot, "client/src/api/axios.js"), "utf8");
const routes = fs.readFileSync(path.join(serverRoot, "routes/index.js"), "utf8");
if (!middleware.includes("X-Tenant-ID") || !middleware.includes("X-Tenant-Slug")) failures.push("tenant middleware header resolution missing");
if (!auth.includes("tenantId") || !auth.includes("Authentication tenant mismatch")) failures.push("auth tenant isolation checks missing");
if (!axios.includes("X-Tenant-ID") || !axios.includes("X-Tenant-Slug")) failures.push("client tenant propagation missing");
if (!routes.includes('router.use("/tenants", tenantRoutes)')) failures.push("tenant routes not mounted");
if (failures.length) { console.error("Multi-tenancy check: FAIL"); console.error(failures.join("\n")); process.exit(1); }
console.log("Multi-tenancy check: PASS");
