import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const client = path.join(root, "client/src");

const exists = (relative) => fs.existsSync(path.join(client, relative));
const read = (relative) => fs.readFileSync(path.join(client, relative), "utf8");
const routeSource = read("routes/AppRoutes.jsx");
const sidebarSource = read("components/admin/AdminSidebar.jsx");

const requiredUiFiles = [
  "pages/admin/AdminCompliance.jsx",
  "pages/admin/OperationsDashboard.jsx",
  "pages/admin/finance/AdminFinance.jsx",
  "components/admin/FinanceLifecycleCenter.jsx",
  "components/admin/DeveloperPlatformCenter.jsx",
  "components/admin/PaymentGatewayCenter.jsx",
  "pages/admin/PrivacyRequests.jsx",
  "pages/admin/AdminSystemHealth.jsx",
  "pages/admin/TenantBilling.jsx",
  "pages/superadmin/SuperAdminAudit.jsx",
  "pages/superadmin/SuperAdminSecurity.jsx",
  "pages/rbac/RolesPage.jsx",
  "pages/CustomerMfa.jsx",
  "pages/Checkout.jsx",
  "pages/PaymentStatus.jsx",
];

test("frontend coverage: every production-critical backend capability has a UI surface", () => {
  for (const file of requiredUiFiles) assert.equal(exists(file), true, `Missing frontend UI file: ${file}`);
});

test("frontend coverage: Kenya compliance and eTIMS are visible", () => {
  const source = read("pages/admin/AdminCompliance.jsx");
  for (const marker of ["KRA tax profile", "eTIMS", "Credit / debit notes", "Compliance controls"]) assert.match(source, new RegExp(marker.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")));
  assert.match(routeSource, /path=\"\/admin\/compliance\"/);
  assert.match(sidebarSource, /Compliance & eTIMS/);
});

test("frontend coverage: tenant payment gateways are configurable from the UI", () => {
  const source = read("components/admin/PaymentGatewayCenter.jsx");
  for (const marker of ["M-Pesa", "Stripe", "PayPal", "PESAPAL", "Bank transfer", "Save securely", "encrypted"]) assert.match(source, new RegExp(marker, "i"));
  const platform = read("pages/admin/PlatformArchitecture.jsx");
  assert.match(platform, /PaymentGatewayCenter/);
});

test("frontend coverage: authorized external website integrations are visible", () => {
  const settings = read("pages/admin/AdminSettings.jsx");
  const developer = read("components/admin/DeveloperPlatformCenter.jsx");
  assert.match(settings, /listWebsiteIntegrations/);
  assert.match(settings, /createWebsiteIntegration/);
  assert.match(settings, /revokeWebsiteIntegration/);
  assert.match(developer, /Developer API keys/);
  assert.match(developer, /Webhooks/);
  assert.match(read("pages/admin/PlatformArchitecture.jsx"), /DeveloperPlatformCenter/);
});

test("frontend coverage: privacy governance is customer-facing and operational", () => {
  const publicPolicy = read("pages/PolicyPage.jsx");
  const admin = read("pages/admin/PrivacyRequests.jsx");
  assert.match(publicPolicy, /Exercise your data rights/);
  assert.match(publicPolicy, /createPrivacyRequest/);
  assert.match(admin, /Data-subject requests/);
  assert.match(admin, /resolution notes/i);
  assert.match(read("pages/admin/PlatformArchitecture.jsx"), /PrivacyRequests/);
});

test("frontend coverage: finance lifecycle, payments, accounting and reconciliation have screens", () => {
  const finance = read("pages/admin/finance/AdminFinance.jsx");
  const lifecycle = read("components/admin/FinanceLifecycleCenter.jsx");
  for (const marker of ["Payment", "Invoice", "credit", "debit", "ledger", "reconciliation"]) assert.match((finance + lifecycle).toLowerCase(), new RegExp(marker.toLowerCase()));
  assert.match(routeSource, /path=\"\/admin\/finance\"/);
  assert.match(routeSource, /path=\"\/admin\/finance\/transactions\"/);
  assert.match(routeSource, /path=\"\/admin\/finance\/reconciliation\"/);
});

test("frontend coverage: operations, corporate, supplier and accommodation workflows are visible", () => {
  const source = read("pages/admin/OperationsDashboard.jsx");
  for (const marker of ["supplier", "corporate", "purchase", "accommodation", "service"]) assert.match(source.toLowerCase(), new RegExp(marker));
  assert.match(routeSource, /path=\"\/admin\/operations\"/);
});

test("frontend coverage: authentication, security, RBAC and audit controls have UI", () => {
  assert.match(read("pages/CustomerMfa.jsx"), /4-digit PIN|PIN/i);
  assert.match(read("pages/superadmin/SuperAdminSecurity.jsx"), /security/i);
  assert.match(read("pages/superadmin/SuperAdminAudit.jsx"), /audit/i);
  assert.match(read("pages/rbac/RolesPage.jsx"), /role|permission/i);
  assert.match(routeSource, /path=\"\/superadmin\/audit\"/);
  assert.match(routeSource, /path=\"\/superadmin\/security\"/);
  assert.match(routeSource, /path=\"\/admin\/rbac\"/);
});

test("frontend coverage: reliability and tenant administration are visible", () => {
  assert.match(read("pages/admin/AdminSystemHealth.jsx"), /System Health/);
  assert.match(read("pages/admin/TenantBilling.jsx"), /M-Pesa|Subscription|Billing/i);
  assert.match(read("pages/admin/AdminSettings.jsx"), /Tenant Administration|website connector|Website connector/i);
  assert.match(routeSource, /path=\"\/admin\/system-health\"/);
  assert.match(routeSource, /path=\"\/admin\/billing\"/);
});
