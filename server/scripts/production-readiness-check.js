import fs from "node:fs";

const requiredFiles=["config/env.js","app.js","server.js","models/Organization.js","models/Payment.js","models/Invoice.js","models/TaxProfile.js","models/TaxRule.js","models/Expense.js","models/CreditDebitNote.js","models/PaymentLink.js","models/Supplier.js","models/PurchaseOrder.js","models/TourCost.js","models/SupplierPayable.js","models/CorporateAccount.js","models/ChartOfAccount.js","models/JournalEntry.js","models/ComplianceRecord.js","models/PrivacyRequest.js","models/BackgroundJob.js","models/WebhookDelivery.js","middleware/tenantMiddleware.js","middleware/permissionMiddleware.js","middleware/integrationAuth.js","middleware/resourceTenantGuard.js","middleware/bookingCommercialGuard.js","tenancy/tenantPlugin.js","services/taxEngineService.js","services/operationalAccountingService.js","services/financeLifecycleService.js","services/operationsService.js","services/jobQueueService.js","services/jobWorkerService.js","services/etimsService.js","services/etimsNoteService.js","services/webhookDeliveryService.js","bootstrap/operationalAccountingHooks.js","controllers/creditDebitNoteController.js","controllers/paymentLinkController.js","routes/creditDebitNoteRoutes.js","routes/paymentLinkRoutes.js","scripts/reconcileTenantIndexes.js"];
const missing=requiredFiles.filter((file)=>!fs.existsSync(file));
if(missing.length){console.error("Missing production files:",missing.join(", "));process.exit(1);}

const envTemplate=fs.readFileSync(".env.example","utf8");
const requiredEnv=["MONGODB_URI","JWT_SECRET"];
const missingTemplate=requiredEnv.filter((key)=>!new RegExp(`^${key}=`,`m`).test(envTemplate));
if(missingTemplate.length){console.error("Missing environment template variables:",missingTemplate.join(", "));process.exit(1);}
const hasDefaultTenantTemplate=/^DEFAULT_TENANT_ID=/m.test(envTemplate)||/^DEFAULT_PUBLIC_TENANT_SLUG=/m.test(envTemplate);
if(!hasDefaultTenantTemplate){console.error("Missing default tenant configuration: DEFAULT_TENANT_ID or DEFAULT_PUBLIC_TENANT_SLUG");process.exit(1);}

const packageJson=JSON.parse(fs.readFileSync("package.json","utf8"));
const requiredScripts=["check:all","test","reconcile:tenant-indexes"];
const missingScripts=requiredScripts.filter((name)=>!packageJson.scripts?.[name]);
if(missingScripts.length){console.error("Missing required server scripts:",missingScripts.join(", "));process.exit(1);}

const runtimeValidation = process.env.PRODUCTION_READINESS_RUNTIME === "true";
if(runtimeValidation){
  const missingRuntime=requiredEnv.filter((key)=>!process.env[key]);
  const hasDefaultTenantRuntime=Boolean(process.env.DEFAULT_TENANT_ID||process.env.DEFAULT_PUBLIC_TENANT_SLUG);
  const production = process.env.NODE_ENV === "production";
  const securityKeys = ["ETIMS_CREDENTIAL_ENCRYPTION_KEY", "WEBHOOK_SECRET_KEY"];
  const weakSecurityKeys = securityKeys.filter((key)=>production && String(process.env[key] || "").length < 32);
  const unsafeFallback = production && String(process.env.ALLOW_SINGLE_TENANT_DEV_FALLBACK || "false").toLowerCase() === "true";
  const globalMpesaFallback = production && String(process.env.ALLOW_GLOBAL_MPESA_FALLBACK || "false").toLowerCase() === "true";
  const devMfa = production && String(process.env.MFA_DEV_MODE || "false").toLowerCase() === "true";
  const jwt = String(process.env.JWT_SECRET || "");
  const weakJwt = production && (jwt.length < 32 || new Set(jwt).size < 12);
  const origins = String(process.env.CLIENT_ORIGINS || process.env.CLIENT_URL || "").split(",").map((value)=>value.trim()).filter(Boolean);
  const insecureOrigins = production && origins.some((origin)=>!/^https:\/\//i.test(origin));
  const placeholderHost = production && /^(your-domain\.com|localhost|127\.0\.0\.1)$/i.test(String(process.env.PLATFORM_HOST || "").trim());
  const paymentKeyRequired = production && (Boolean(process.env.PAYMENT_CREDENTIAL_ENCRYPTION_KEY) || Boolean(process.env.MPESA_CONSUMER_KEY) || Boolean(process.env.MPESA_CONSUMER_SECRET) || Boolean(process.env.MPESA_PASSKEY));
  const weakPaymentKey = paymentKeyRequired && String(process.env.PAYMENT_CREDENTIAL_ENCRYPTION_KEY || "").length < 32;
  const etimsConfigured = production && Boolean(process.env.ETIMS_ADAPTER_URL || process.env.ETIMS_ADAPTER_TOKEN);
  const missingEtimsKey = etimsConfigured && String(process.env.ETIMS_CREDENTIAL_ENCRYPTION_KEY || "").length < 32;
  const errors=[];
  if(missingRuntime.length) errors.push(`Missing runtime production environment variables: ${missingRuntime.join(", ")}`);
  if(!hasDefaultTenantRuntime) errors.push("Missing runtime default tenant configuration: DEFAULT_TENANT_ID or DEFAULT_PUBLIC_TENANT_SLUG");
  if(weakSecurityKeys.length) errors.push(`Production security keys must be at least 32 characters: ${weakSecurityKeys.join(", ")}`);
  if(unsafeFallback) errors.push("ALLOW_SINGLE_TENANT_DEV_FALLBACK must be false in production.");
  if(globalMpesaFallback) errors.push("ALLOW_GLOBAL_MPESA_FALLBACK must be false in production; configure M-Pesa per tenant.");
  if(devMfa) errors.push("MFA_DEV_MODE must be false in production.");
  if(weakJwt) errors.push("JWT_SECRET must be at least 32 characters and contain sufficient character diversity in production.");
  if(insecureOrigins) errors.push("CLIENT_URL/CLIENT_ORIGINS must use HTTPS in production.");
  if(placeholderHost) errors.push("PLATFORM_HOST must be a real production hostname, not a development placeholder.");
  if(weakPaymentKey) errors.push("PAYMENT_CREDENTIAL_ENCRYPTION_KEY must be at least 32 characters when payment credentials are configured in production.");
  if(missingEtimsKey) errors.push("ETIMS_CREDENTIAL_ENCRYPTION_KEY must be at least 32 characters when eTIMS is configured in production.");
  if(errors.length){errors.forEach((error)=>console.error(error));process.exit(1);}
}

console.log("Production readiness check passed");
console.log(`Runtime environment validation: ${runtimeValidation?"enabled":"CI/static mode"}`);
