/**
 * Purpose: production readiness check operational script. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import "dotenv/config";
// Load node:fs so this module can use its exported dependencies.
import fs from "node:fs";

// Declare requiredFiles for use by the surrounding module or function.
const requiredFiles = [
  "config/env.js",
  "app.js",
  "server.js",
  "startup/readiness.js",
  "tests/healthReadiness.test.js",
  "models/Organization.js",
  "models/Payment.js",
  "models/Invoice.js",
  "models/TaxProfile.js",
  "models/TaxRule.js",
  "models/WithholdingTax.js",
  "models/Expense.js",
  "models/CreditDebitNote.js",
  "models/PaymentLink.js",
  "models/Supplier.js",
  "models/PurchaseOrder.js",
  "models/TourCost.js",
  "models/SupplierPayable.js",
  "models/CorporateAccount.js",
  "models/FixedAsset.js",
  "models/FinanceBudget.js",
  "models/AccountingPeriod.js",
  "models/ChartOfAccount.js",
  "models/JournalEntry.js",
  "models/Subscription.js",
  "models/SubscriptionPayment.js",
  "models/ComplianceRecord.js",
  "models/PrivacyRequest.js",
  "models/BackgroundJob.js",
  "models/WebhookDelivery.js",
  "middleware/tenantMiddleware.js",
  "middleware/permissionMiddleware.js",
  "middleware/integrationAuth.js",
  "middleware/resourceTenantGuard.js",
  "middleware/bookingCommercialGuard.js",
  "middleware/resolveMpesaCallbackTenant.js",
  "middleware/mpesaCallbackIntegrity.js",
  "tenancy/tenantPlugin.js",
  "services/taxEngineService.js",
  "services/operationalAccountingService.js",
  "services/financeLifecycleService.js",
  "services/operationsService.js",
  "services/jobQueueService.js",
  "services/jobWorkerService.js",
  "services/etimsService.js",
  "services/etimsNoteService.js",
  "services/webhookDeliveryService.js",
  "services/dataRetentionService.js",
  "services/tenantSubscriptionService.js",
  "bootstrap/operationalAccountingHooks.js",
  "controllers/creditDebitNoteController.js",
  "controllers/paymentLinkController.js",
  "controllers/expenseLifecycleController.js",
  "controllers/withholdingTaxController.js",
  "controllers/accountingReportsController.js",
  "controllers/managementAccountingController.js",
  "controllers/subscriptionMpesaCallbackController.js",
  "routes/creditDebitNoteRoutes.js",
  "routes/paymentLinkRoutes.js",
  "routes/accountingRoutes.js",
  "routes/mpesaRoutes.js",
  "routes/superAdminRoutes.js",
  "scripts/bootstrapFirstSuperAdmin.js",
  "scripts/reconcileTenantIndexes.js",
];

// Declare missing for use by the surrounding module or function.
const missing = requiredFiles.filter((file) => !fs.existsSync(file));
// Check the condition (missing.length) and run the matching branch.
if (missing.length) {
  // Perform the side effect or state update expressed on the following line.
  console.error("Missing production files:", missing.join(", "));
  // Perform the side effect or state update expressed on the following line.
  process.exit(1);
}

// Declare envTemplate for use by the surrounding module or function.
const envTemplate = fs.readFileSync(".env.example", "utf8");
// Declare requiredEnv for use by the surrounding module or function.
const requiredEnv = ["MONGODB_URI", "MONGODB_SERVER_SELECTION_TIMEOUT_MS", "MONGODB_STARTUP_MIGRATION_TIMEOUT_MS", "JWT_SECRET"];
// Declare missingTemplate for use by the surrounding module or function.
const missingTemplate = requiredEnv.filter((key) => !new RegExp(`^${key}=`, "m").test(envTemplate));
// Check the condition (missingTemplate.length) and run the matching branch.
if (missingTemplate.length) {
  // Perform the side effect or state update expressed on the following line.
  console.error("Missing environment template variables:", missingTemplate.join(", "));
  // Perform the side effect or state update expressed on the following line.
  process.exit(1);
}

// This application supports multiple active tenant organizations.
// A single DEFAULT_TENANT_ID / DEFAULT_PUBLIC_TENANT_SLUG is therefore
// optional rather than a mandatory production configuration. Tenant
// resolution is handled by tenantMiddleware.js using authenticated tenant
// claims, tenant headers, host/origin mapping, login identity, or an
// explicitly configured public tenant slug.
//
// Production must never rely on the single-tenant development fallback.

// Declare packageJson for use by the surrounding module or function.
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
// Declare requiredScripts for use by the surrounding module or function.
const requiredScripts = ["check:all", "test", "check:production", "reconcile:tenant-indexes", "bootstrap:first"];
// Declare missingScripts for use by the surrounding module or function.
const missingScripts = requiredScripts.filter((name) => !packageJson.scripts?.[name]);
// Check the condition (missingScripts.length) and run the matching branch.
if (missingScripts.length) {
  // Perform the side effect or state update expressed on the following line.
  console.error("Missing required server scripts:", missingScripts.join(", "));
  // Perform the side effect or state update expressed on the following line.
  process.exit(1);
}

// Declare releaseDocs for use by the surrounding module or function.
const releaseDocs = [
  "docs/STEP3_PRODUCTION_RELEASE_RUNBOOK.md",
  "docs/EXTERNAL_WEBSITE_CONNECTOR.md",
  "docs/COMMERCIAL_READINESS_IMPLEMENTATION_STATUS.md",
  "docs/PRODUCTION_GO_LIVE_CHECKLIST.md",
  "docs/PUBLIC_TENANT_ONBOARDING.md",
];
// Declare missingReleaseDocs for use by the surrounding module or function.
const missingReleaseDocs = releaseDocs.filter((file) => !fs.existsSync(`../${file}`));
// Check the condition (missingReleaseDocs.length) and run the matching branch.
if (missingReleaseDocs.length) {
  // Perform the side effect or state update expressed on the following line.
  console.error("Missing release documentation:", missingReleaseDocs.join(", "));
  // Perform the side effect or state update expressed on the following line.
  process.exit(1);
}

// Declare goLiveChecklist for use by the surrounding module or function.
const goLiveChecklist = fs.readFileSync("../docs/PRODUCTION_GO_LIVE_CHECKLIST.md", "utf8");
// Declare evidenceFlags for use by the surrounding module or function.
const evidenceFlags = [
  "PRODUCTION_BACKUP_VERIFIED",
  "PRODUCTION_MONITORING_VERIFIED",
  "PRODUCTION_PAYMENT_VERIFIED",
  "PRODUCTION_ETIMS_VERIFIED",
  "PRODUCTION_RESTORE_TESTED",
  "PRODUCTION_WEBHOOKS_VERIFIED",
];
// Declare missingDocumentedEvidence for use by the surrounding module or function.
const missingDocumentedEvidence = evidenceFlags.filter((key) => !goLiveChecklist.includes(key));
// Check the condition (missingDocumentedEvidence.length) and run the matching branch.
if (missingDocumentedEvidence.length) {
  // Perform the side effect or state update expressed on the following line.
  console.error("Go-live checklist is missing external evidence gates:", missingDocumentedEvidence.join(", "));
  // Perform the side effect or state update expressed on the following line.
  process.exit(1);
}

// Declare runtimeValidation for use by the surrounding module or function.
const runtimeValidation = process.env.PRODUCTION_READINESS_RUNTIME === "true";
// Check the condition (runtimeValidation) and run the matching branch.
if (runtimeValidation) {
  // Declare missingRuntime for use by the surrounding module or function.
  const missingRuntime = requiredEnv.filter((key) => !process.env[key]);
  // Multi-tenant deployments do not require an arbitrary default tenant.
  // A default public tenant may still be configured when explicitly needed.
  // Declare production for use by the surrounding module or function.
  const production = process.env.NODE_ENV === "production";
  // Declare securityKeys for use by the surrounding module or function.
  const securityKeys = ["PAYMENT_CREDENTIAL_ENCRYPTION_KEY", "WEBHOOK_SECRET_KEY"];
  // Declare weakSecurityKeys for use by the surrounding module or function.
  const weakSecurityKeys = securityKeys.filter((key) => production && String(process.env[key] || "").length < 32);
  // Declare unsafeFallback for use by the surrounding module or function.
  const unsafeFallback = production && String(process.env.ALLOW_SINGLE_TENANT_DEV_FALLBACK || "false").toLowerCase() === "true";
  // Declare globalMpesaFallback for use by the surrounding module or function.
  const globalMpesaFallback = production && String(process.env.ALLOW_GLOBAL_MPESA_FALLBACK || "false").toLowerCase() === "true";
  // Declare devMfa for use by the surrounding module or function.
  const devMfa = production && String(process.env.MFA_DEV_MODE || "false").toLowerCase() === "true";
  // Declare jwt for use by the surrounding module or function.
  const jwt = String(process.env.JWT_SECRET || "");
  // Declare weakJwt for use by the surrounding module or function.
  const weakJwt = production && (jwt.length < 32 || new Set(jwt).size < 12);
  // Declare origins for use by the surrounding module or function.
  const origins = String(process.env.CLIENT_ORIGINS || process.env.CLIENT_URL || "").split(",").map((value) => value.trim()).filter(Boolean);
  // Declare insecureOrigins for use by the surrounding module or function.
  const insecureOrigins = production && origins.some((origin) => !/^https:\/\//i.test(origin));
  // Declare platformHost for use by the surrounding module or function.
  const platformHost = String(process.env.PLATFORM_HOST || "").trim();
  // Declare missingPlatformHost for use by the surrounding module or function.
  const missingPlatformHost = production && !platformHost;
  // Declare placeholderHost for use by the surrounding module or function.
  const placeholderHost = production && /^(your-domain\.com|localhost|127\.0\.0\.1)$/i.test(platformHost);
  // Declare paymentKeyRequired for use by the surrounding module or function.
  const paymentKeyRequired = production;
  // Declare weakPaymentKey for use by the surrounding module or function.
  const weakPaymentKey = paymentKeyRequired && String(process.env.PAYMENT_CREDENTIAL_ENCRYPTION_KEY || "").length < 32;
  // Declare etimsConfigured for use by the surrounding module or function.
  const etimsConfigured = production && Boolean(process.env.ETIMS_ADAPTER_URL || process.env.ETIMS_ADAPTER_TOKEN);
  // Declare missingEtimsKey for use by the surrounding module or function.
  const missingEtimsKey = etimsConfigured && String(process.env.ETIMS_CREDENTIAL_ENCRYPTION_KEY || "").length < 32;
  // Declare missingEvidence for use by the surrounding module or function.
  const missingEvidence = production ? evidenceFlags.filter((key) => String(process.env[key] || "false").toLowerCase() !== "true") : [];
  // Declare errors for use by the surrounding module or function.
  const errors = [];

  // Check the condition (missingRuntime.length) and run the matching branch.
  if (missingRuntime.length) errors.push(`Missing runtime production environment variables: ${missingRuntime.join(", ")}`);
  // No default-tenant runtime error: tenant resolution is intentionally multi-tenant.
  // Check the condition (weakSecurityKeys.length) and run the matching branch.
  if (weakSecurityKeys.length) errors.push(`Production security keys must be at least 32 characters: ${weakSecurityKeys.join(", ")}`);
  // Check the condition (unsafeFallback) and run the matching branch.
  if (unsafeFallback) errors.push("ALLOW_SINGLE_TENANT_DEV_FALLBACK must be false in production.");
  // Check the condition (globalMpesaFallback) and run the matching branch.
  if (globalMpesaFallback) errors.push("ALLOW_GLOBAL_MPESA_FALLBACK must be false in production; configure M-Pesa per tenant.");
  // Check the condition (devMfa) and run the matching branch.
  if (devMfa) errors.push("MFA_DEV_MODE must be false in production.");
  // Check the condition (weakJwt) and run the matching branch.
  if (weakJwt) errors.push("JWT_SECRET must be at least 32 characters and contain sufficient character diversity in production.");
  // Check the condition (insecureOrigins) and run the matching branch.
  if (insecureOrigins) errors.push("CLIENT_URL/CLIENT_ORIGINS must use HTTPS in production.");
  // Check the condition (invalidPlatformHost) and run the matching branch.
  if (invalidPlatformHost) errors.push("PLATFORM_HOST must be a valid hostname when configured.");
  // Check the condition (weakPaymentKey) and run the matching branch.
  if (weakPaymentKey) errors.push("PAYMENT_CREDENTIAL_ENCRYPTION_KEY must be at least 32 characters when payment credentials are configured in production.");
  // Check the condition (missingEtimsKey) and run the matching branch.
  if (missingEtimsKey) errors.push("ETIMS_CREDENTIAL_ENCRYPTION_KEY must be at least 32 characters when eTIMS is configured in production.");
  // Check the condition (missingEvidence.length) and run the matching branch.
  if (missingEvidence.length) errors.push(`Production evidence gates are incomplete: ${missingEvidence.join(", ")}. Verify the external control before enabling production.`);

  // Check the condition (errors.length) and run the matching branch.
  if (errors.length) {
    // Perform the side effect or state update expressed on the following line.
    errors.forEach((error) => console.error(error));
    // Perform the side effect or state update expressed on the following line.
    process.exit(1);
  }
}

// Perform the side effect or state update expressed on the following line.
console.log("Production readiness contract passed");
// Perform the side effect or state update expressed on the following line.
console.log(`Runtime environment validation: ${runtimeValidation ? "enabled" : "CI/static mode"}`);
// Check the condition (!runtimeValidation) and run the matching branch.
if (!runtimeValidation) console.log("Launch certification is still blocked until external production evidence gates are verified in the deployment environment.");
// Check the condition (runtimeValidation && process.env.NODE_ENV === "production") and run the matching branch.
if (runtimeValidation && process.env.NODE_ENV === "production") console.log("External production evidence gates: verified");
