import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(scriptDir, "..");
const repoRoot = path.resolve(serverRoot, "..");
const required = [
  "models/Organization.js",
  "middleware/tenantMiddleware.js",
  "middleware/authMiddleware.js",
  "middleware/resolveMpesaCallbackTenant.js",
  "middleware/resolveMpesaRefundTenant.js",
  "tenancy/context.js",
  "tenancy/tenantPlugin.js",
  "tenancy/bootstrap.js",
  "controllers/tenantController.js",
  "routes/tenantRoutes.js",
  "routes/mpesaRoutes.js",
  "socket/socketManager.js",
];

const failures = required.filter((file) => !fs.existsSync(path.join(serverRoot, file))).map((file) => `missing: ${file}`);

const read = (file) => fs.readFileSync(path.join(serverRoot, file), "utf8");
const middleware = read("middleware/tenantMiddleware.js");
const auth = read("middleware/authMiddleware.js");
const plugin = read("tenancy/tenantPlugin.js");
const socket = read("socket/socketManager.js");
const mpesaRoutes = read("routes/mpesaRoutes.js");
const axios = fs.readFileSync(path.join(repoRoot, "client/src/api/axios.js"), "utf8");
const routes = fs.readFileSync(path.join(serverRoot, "routes/index.js"), "utf8");

const contracts = [
  [middleware.includes("X-Tenant-ID") && middleware.includes("X-Tenant-Slug"), "tenant middleware header resolution missing"],
  [middleware.includes("runWithTenant"), "tenant context is not request-scoped"],
  [auth.includes("tenantId") && auth.includes("Authentication tenant mismatch"), "auth tenant isolation checks missing"],
  [plugin.includes("Tenant context is required for tenant-scoped data access"), "tenant plugin is fail-open when context is absent"],
  [plugin.includes("insertMany") && plugin.includes("bulkWrite"), "bulk write tenant protection missing"],
  [plugin.includes("estimatedDocumentCount"), "estimated count guard missing"],
  [plugin.includes("$lookup") && plugin.includes("$unionWith") && plugin.includes("$graphLookup"), "aggregation cross-tenant guards missing"],
  [socket.includes("tenantId") && socket.includes("tenant:"), "socket tenant isolation missing"],
  [mpesaRoutes.includes("resolveMpesaCallbackTenant") && mpesaRoutes.includes("resolveMpesaRefundTenant"), "payment callback tenant resolution missing"],
  [axios.includes("X-Tenant-ID") && axios.includes("X-Tenant-Slug"), "client tenant propagation missing"],
  [routes.includes('router.use("/tenants", tenantRoutes)'), "tenant routes not mounted"],
];

for (const [ok, message] of contracts) if (!ok) failures.push(message);

if (failures.length) {
  console.error("Multi-tenancy check: FAIL");
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Multi-tenancy check: PASS");
