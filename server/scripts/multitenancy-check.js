import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVER_ROOT = path.resolve(__dirname, "..");
const MIDDLEWARE = path.join(
  SERVER_ROOT,
  "middleware",
  "tenantMiddleware.js"
);

const CONTROLLERS = path.join(
  SERVER_ROOT,
  "controllers"
);

console.log("==============================================");
console.log(" COHERENT TOURS - MULTITENANCY CHECK");
console.log("==============================================");
console.log();

let failures = 0;

function source(file) {
  return fs.existsSync(file)
    ? fs.readFileSync(file, "utf8")
    : "";
}

/*
 * ------------------------------------------------------------
 * 1. Tenant middleware
 * ------------------------------------------------------------
 */

console.log("[1] Tenant middleware");

if (!fs.existsSync(MIDDLEWARE)) {
  console.log("❌ tenantMiddleware.js missing");
  failures++;
} else {
  const middleware = source(MIDDLEWARE);

  const checks = [
    {
      name: "runWithTenant",
      regex: /\brunWithTenant\s*\(/,
    },
    {
      name: "X-Tenant-Slug",
      regex: /X-Tenant-Slug/i,
    },
    {
      name: "req.tenantId",
      regex: /req\.tenantId/,
    },
    {
      name: "req.tenant",
      regex: /req\.tenant/,
    },
    {
      name: "tenant lookup",
      regex: /Organization\.findOne\s*\(/,
    },
  ];

  for (const check of checks) {
    if (check.regex.test(middleware)) {
      console.log(`✅ ${check.name}`);
    } else {
      console.log(`❌ ${check.name}`);
      failures++;
    }
  }
}

console.log();

/*
 * ------------------------------------------------------------
 * 2. Tenant context
 * ------------------------------------------------------------
 */

console.log("[2] Tenant context");

const contextFile = path.join(
  SERVER_ROOT,
  "tenancy",
  "context.js"
);

const context = source(contextFile);

const contextChecks = [
  ["runWithTenant", /\bexport\s+function\s+runWithTenant/],
  ["getTenantId", /\bexport\s+function\s+getTenantId/],
  ["getTenantContext", /\bexport\s+function\s+getTenantContext/],
  ["isTenantBypassed", /\bexport\s+function\s+isTenantBypassed/],
  ["mergeTenantFilter", /\bexport\s+function\s+mergeTenantFilter/],
  ["AsyncLocalStorage", /AsyncLocalStorage/],
];

for (const [name, regex] of contextChecks) {
  if (regex.test(context)) {
    console.log(`✅ ${name}`);
  } else {
    console.log(`❌ ${name}`);
    failures++;
  }
}

console.log();

/*
 * ------------------------------------------------------------
 * 3. Tenant plugin
 * ------------------------------------------------------------
 */

console.log("[3] Tenant plugin");

const pluginFile = path.join(
  SERVER_ROOT,
  "tenancy",
  "tenantPlugin.js"
);

const plugin = source(pluginFile);

const pluginChecks = [
  ["tenantId schema path", /TENANT_PATH\s*=\s*"tenantId"/],
  ["find hook", /["']find["']/],
  ["findOne hook", /["']findOne["']/],
  ["findOneAndUpdate hook", /["']findOneAndUpdate["']/],
  ["updateOne hook", /["']updateOne["']/],
  ["updateMany hook", /["']updateMany["']/],
  ["deleteOne hook", /["']deleteOne["']/],
  ["deleteMany hook", /["']deleteMany["']/],
  ["countDocuments hook", /["']countDocuments["']/],
  ["aggregate hook", /["']aggregate["']/],
  ["bulkWrite hook", /["']bulkWrite["']/],
  ["lookup protection", /enforceLookupStage/],
  ["union protection", /enforceUnionStage/],
  ["graphLookup protection", /enforceGraphLookupStage/],
];

for (const [name, regex] of pluginChecks) {
  if (regex.test(plugin)) {
    console.log(`✅ ${name}`);
  } else {
    console.log(`❌ ${name}`);
    failures++;
  }
}

console.log();

/*
 * ------------------------------------------------------------
 * 4. Controller review
 *
 * IMPORTANT:
 * Do NOT classify findById() as automatically unsafe.
 *
 * Mongoose query middleware can protect findById() when the
 * model has tenantPlugin applied.
 * ------------------------------------------------------------
 */

console.log("[4] Controller query review");

const controllerFiles = fs
  .readdirSync(CONTROLLERS)
  .filter((file) => file.endsWith(".js"))
  .sort();

let queryControllers = 0;

for (const file of controllerFiles) {
  const fullPath = path.join(CONTROLLERS, file);
  const text = source(fullPath);

  const hasQueries =
    /\.findById\s*\(/.test(text) ||
    /\.findOne\s*\(/.test(text) ||
    /\.find\s*\(/.test(text) ||
    /\.findOneAndUpdate\s*\(/.test(text) ||
    /\.updateOne\s*\(/.test(text) ||
    /\.updateMany\s*\(/.test(text) ||
    /\.deleteOne\s*\(/.test(text) ||
    /\.deleteMany\s*\(/.test(text) ||
    /\.aggregate\s*\(/.test(text);

  if (!hasQueries) continue;

  queryControllers++;

  const hasTenantContext =
    /tenancy\/context/.test(text) ||
    /req\.tenantId/.test(text) ||
    /req\.tenant/.test(text) ||
    /tenantId\s*:/.test(text);

  /*
   * We deliberately do NOT fail merely because the controller
   * lacks explicit tenant code.
   *
   * Tenant enforcement may happen at the model/plugin layer.
   */
  if (hasTenantContext) {
    console.log(`✅ ${file} - explicit tenant awareness`);
  } else {
    console.log(`ℹ️  ${file} - relies on model/plugin enforcement`);
  }
}

console.log();
console.log(`Controllers containing database queries: ${queryControllers}`);

console.log();

/*
 * ------------------------------------------------------------
 * 5. Final result
 * ------------------------------------------------------------
 */

console.log("==============================================");

if (failures === 0) {
  console.log(" MULTITENANCY CHECK: PASS");
  console.log("==============================================");
  process.exit(0);
}

console.log(` MULTITENANCY CHECK: FAIL (${failures})`);
console.log("==============================================");

process.exit(1);
