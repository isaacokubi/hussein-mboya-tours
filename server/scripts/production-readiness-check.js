import fs from "node:fs";

const requiredFiles = [
  "config/env.js", "app.js", "server.js", "models/Organization.js", "models/Payment.js", "models/Invoice.js", "models/TaxProfile.js", "models/Expense.js", "models/CreditDebitNote.js", "models/Supplier.js", "models/PurchaseOrder.js", "models/TourCost.js", "models/SupplierPayable.js", "models/CorporateAccount.js", "models/ChartOfAccount.js", "models/JournalEntry.js", "models/ComplianceRecord.js", "models/PrivacyRequest.js", "models/BackgroundJob.js", "middleware/tenantMiddleware.js", "middleware/permissionMiddleware.js", "middleware/integrationAuth.js", "middleware/resourceTenantGuard.js", "middleware/bookingCommercialGuard.js", "tenancy/tenantPlugin.js", "services/operationsService.js", "services/jobQueueService.js", "services/jobWorkerService.js", "services/etimsService.js", "scripts/reconcileTenantIndexes.js"
];

const missing = requiredFiles.filter((file) => !fs.existsSync(file));
if (missing.length) { console.error("Missing production files:", missing.join(", ")); process.exit(1); }

const envTemplate = fs.readFileSync(".env.example", "utf8");
const requiredEnv = ["MONGODB_URI", "JWT_SECRET"];
const missingTemplate = requiredEnv.filter((key) => !new RegExp(`^${key}=`, "m").test(envTemplate));
if (missingTemplate.length) { console.error("Missing environment template variables:", missingTemplate.join(", ")); process.exit(1); }
const hasDefaultTenantTemplate = /^DEFAULT_TENANT_ID=/m.test(envTemplate) || /^DEFAULT_PUBLIC_TENANT_SLUG=/m.test(envTemplate);
if (!hasDefaultTenantTemplate) { console.error("Missing default tenant configuration: DEFAULT_TENANT_ID or DEFAULT_PUBLIC_TENANT_SLUG"); process.exit(1); }
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const requiredScripts = ["check:all", "test", "reconcile:tenant-indexes"];
const missingScripts = requiredScripts.filter((name) => !packageJson.scripts?.[name]);
if (missingScripts.length) { console.error("Missing required server scripts:", missingScripts.join(", ")); process.exit(1); }
if (process.env.PRODUCTION_READINESS_RUNTIME === "true") {
  const missingRuntime = requiredEnv.filter((key) => !process.env[key]); const hasDefaultTenantRuntime = Boolean(process.env.DEFAULT_TENANT_ID || process.env.DEFAULT_PUBLIC_TENANT_SLUG);
  if (missingRuntime.length || !hasDefaultTenantRuntime) { if (missingRuntime.length) console.error("Missing runtime production environment variables:", missingRuntime.join(", ")); if (!hasDefaultTenantRuntime) console.error("Missing runtime default tenant configuration: DEFAULT_TENANT_ID or DEFAULT_PUBLIC_TENANT_SLUG"); process.exit(1); }
}
console.log("Production readiness check passed"); console.log(`Runtime environment validation: ${process.env.PRODUCTION_READINESS_RUNTIME === "true" ? "enabled" : "CI/static mode"}`);
