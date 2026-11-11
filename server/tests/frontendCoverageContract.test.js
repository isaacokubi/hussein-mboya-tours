/**
 * Purpose: frontend Coverage Contract.test automated test. Main declarations: exists, read, hasRoute.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import test from "node:test";
// Load node:assert/strict so this module can use its exported dependencies.
import assert from "node:assert/strict";
// Load node:fs so this module can use its exported dependencies.
import fs from "node:fs";
// Load node:path so this module can use its exported dependencies.
import path from "node:path";
// Load node:url so this module can use its exported dependencies.
import { fileURLToPath } from "node:url";

// Declare here for use by the surrounding module or function.
const here = path.dirname(fileURLToPath(import.meta.url));
// Declare root for use by the surrounding module or function.
const root = path.resolve(here, "../..");
// Declare client for use by the surrounding module or function.
const client = path.join(root, "client/src");
// Declare exists for use by the surrounding module or function.
const exists = (r) => fs.existsSync(path.join(client, r));
// Declare read for use by the surrounding module or function.
const read = (r) => fs.readFileSync(path.join(client, r), "utf8");
// Declare routeSource for use by the surrounding module or function.
const routeSource = read("routes/AppRoutes.jsx");
// Declare sidebarSource for use by the surrounding module or function.
const sidebarSource = read("components/admin/AdminSidebar.jsx");
// Declare hasRoute for use by the surrounding module or function.
const hasRoute = (p) => routeSource.includes(`path="${p}"`) || routeSource.includes(`path='${p}'`);

// Declare requiredUiFiles for use by the surrounding module or function.
const requiredUiFiles = [
  "pages/admin/AdminCompliance.jsx",
  "pages/admin/OperationsDashboard.jsx",
  "components/admin/TravelOperationsCenter.jsx",
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

// Perform the side effect or state update expressed on the following line.
test("frontend coverage: every production-critical backend capability has a UI surface", () => {
  // Repeat the enclosed work for each required iteration.
  for (const file of requiredUiFiles) assert.equal(exists(file), true, `Missing frontend UI file: ${file}`);
});

// Perform the side effect or state update expressed on the following line.
test("frontend coverage: Kenya compliance and eTIMS are visible", () => {
  // Declare s for use by the surrounding module or function.
  const s = read("pages/admin/AdminCompliance.jsx");
  // Repeat the enclosed work for each required iteration.
  for (const m of ["KRA tax profile", "eTIMS", "Credit / debit notes", "Compliance controls"]) assert.match(s, new RegExp(m.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")));
  // Perform the side effect or state update expressed on the following line.
  assert.ok(hasRoute("/admin"), "Admin route must exist");
  // Perform the side effect or state update expressed on the following line.
  assert.match(routeSource, /path="compliance"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(sidebarSource, /Compliance & eTIMS/);
});

// Perform the side effect or state update expressed on the following line.
test("frontend coverage: tenant payment gateways are configurable from the UI", () => {
  // Declare s for use by the surrounding module or function.
  const s = read("components/admin/PaymentGatewayCenter.jsx");
  // Repeat the enclosed work for each required iteration.
  for (const m of ["M-Pesa", "Stripe", "PayPal", "PESAPAL", "Bank transfer", "Save securely", "encrypted"]) assert.match(s, new RegExp(m, "i"));
  // Perform the side effect or state update expressed on the following line.
  assert.match(read("pages/admin/PlatformArchitecture.jsx"), /PaymentGatewayCenter/);
});

// Perform the side effect or state update expressed on the following line.
test("frontend coverage: authorized external website integrations are visible", () => {
  // Declare s for use by the surrounding module or function.
  const s = read("pages/admin/AdminSettings.jsx");
  // Declare d for use by the surrounding module or function.
  const d = read("components/admin/DeveloperPlatformCenter.jsx");
  // Repeat the enclosed work for each required iteration.
  for (const m of ["listWebsiteIntegrations", "createWebsiteIntegration", "revokeWebsiteIntegration"]) assert.match(s, new RegExp(m));
  // Repeat the enclosed work for each required iteration.
  for (const m of ["Developer API keys", "Webhooks"]) assert.match(d, new RegExp(m));
  // Perform the side effect or state update expressed on the following line.
  assert.match(read("pages/admin/PlatformArchitecture.jsx"), /DeveloperPlatformCenter/);
});

// Perform the side effect or state update expressed on the following line.
test("frontend coverage: privacy governance is customer-facing and operational", () => {
  // Declare p for use by the surrounding module or function.
  const p = read("pages/PolicyPage.jsx");
  // Declare a for use by the surrounding module or function.
  const a = read("pages/admin/PrivacyRequests.jsx");
  // Perform the side effect or state update expressed on the following line.
  assert.match(p, /Exercise your data rights/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(p, /createPrivacyRequest/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(a, /Data-subject requests/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(a, /resolution notes/i);
  // Perform the side effect or state update expressed on the following line.
  assert.match(read("pages/admin/PlatformArchitecture.jsx"), /PrivacyRequests/);
});

// Perform the side effect or state update expressed on the following line.
test("frontend coverage: finance lifecycle, payments, accounting and reconciliation have screens", () => {
  // Declare s for use by the surrounding module or function.
  const s = (read("pages/admin/finance/AdminFinance.jsx") + read("components/admin/FinanceLifecycleCenter.jsx")).toLowerCase();
  // Repeat the enclosed work for each required iteration.
  for (const m of ["payment", "invoice", "credit", "debit", "ledger", "reconciliation"]) assert.match(s, new RegExp(m));
  // Perform the side effect or state update expressed on the following line.
  assert.match(routeSource, /path="finance"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(routeSource, /path="finance\/transactions"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(routeSource, /path="finance\/reconciliation"/);
});

// Perform the side effect or state update expressed on the following line.
test("admin navigation honors the server-reported tenant plan for finance and insight features", () => {
  // Declare layout for use by the surrounding module or function.
  const layout = read("layouts/AdminLayout.jsx");
  // Perform the side effect or state update expressed on the following line.
  assert.match(layout, /return permissionLinks\.filter\(\(\[, , , , feature\]\) => !feature \|\| planFeatures\.includes\(feature\)\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(layout, /setPlanFeatures\(\[\]\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.doesNotMatch(layout, /FINANCE_FEATURES|INSIGHT_FEATURES/);
});

// Perform the side effect or state update expressed on the following line.
test("guide dashboard exposes navigation to the assigned-tours route", () => {
  // Declare guideDashboard for use by the surrounding module or function.
  const guideDashboard = read("pages/guide/TourGuideDashboard.jsx");
  // Perform the side effect or state update expressed on the following line.
  assert.match(routeSource, /path="\/guide\/assigned-tours"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(guideDashboard, /to="\/guide\/assigned-tours">Assigned Tours/);
});

// Perform the side effect or state update expressed on the following line.
test("frontend coverage: operations, corporate, supplier and accommodation workflows are visible", () => {
  // Declare s for use by the surrounding module or function.
  const s = (read("pages/admin/OperationsDashboard.jsx") + read("components/admin/OperationsActionCenter.jsx") + read("components/admin/TravelOperationsCenter.jsx")).toLowerCase();
  // Repeat the enclosed work for each required iteration.
  for (const m of ["supplier", "corporate", "purchase", "room", "accommodation", "transfer", "totalcost", "unitcost"]) assert.match(s, new RegExp(m));
  // Perform the side effect or state update expressed on the following line.
  assert.match(routeSource, /path="operations"/);
});

// Perform the side effect or state update expressed on the following line.
test("frontend coverage: travel execution backend is directly usable from the UI", () => {
  // Declare s for use by the surrounding module or function.
  const s = read("components/admin/TravelOperationsCenter.jsx");
  // Repeat the enclosed work for each required iteration.
  for (const m of ["Schedule operation", "Operational record", "Commercial rule", "createTravelOperation", "createOperationalAsset", "createTravelRule", "updateTravelOperation", "updateOperationalAsset", "updateTravelRule", "deleteTravelOperation", "deleteOperationalAsset", "deleteTravelRule"]) assert.match(s, new RegExp(m.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")));
  // Perform the side effect or state update expressed on the following line.
  assert.match(read("api/travelOperationsApi.js"), /\/operations|\/operational-assets/);
});

// Perform the side effect or state update expressed on the following line.
test("frontend coverage: authentication, security, RBAC and audit controls have UI", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.match(read("pages/CustomerMfa.jsx"), /4-digit PIN|PIN/i);
  // Perform the side effect or state update expressed on the following line.
  assert.match(read("pages/superadmin/SuperAdminSecurity.jsx"), /security/i);
  // Perform the side effect or state update expressed on the following line.
  assert.match(read("pages/superadmin/SuperAdminAudit.jsx"), /audit/i);
  // Perform the side effect or state update expressed on the following line.
  assert.match(read("pages/rbac/RolesPage.jsx"), /role|permission/i);
  // Perform the side effect or state update expressed on the following line.
  assert.match(routeSource, /path="audit"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(routeSource, /path="security"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(routeSource, /path="rbac"/);
});

// Perform the side effect or state update expressed on the following line.
test("platform sessions do not inherit a public tenant fallback", () => {
  // Declare axios for use by the surrounding module or function.
  const axios = read("api/axios.js");
  // Declare auth for use by the surrounding module or function.
  const auth = read("context/AuthContext.jsx");
  // Perform the side effect or state update expressed on the following line.
  assert.match(axios, /storedRole[\s\S]*?\["super_admin", "superadmin"\][\s\S]*?return ""/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(auth, /\["super_admin", "superadmin"\][\s\S]*?return null/);
});

// Perform the side effect or state update expressed on the following line.
test("frontend coverage: reliability and tenant administration are visible", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.match(read("pages/admin/AdminSystemHealth.jsx"), /System Health/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(read("pages/admin/TenantBilling.jsx"), /M-Pesa|Subscription|Billing/i);
  // Perform the side effect or state update expressed on the following line.
  assert.match(read("pages/admin/AdminSettings.jsx"), /Tenant Administration|website connector|Website connector/i);
  // Perform the side effect or state update expressed on the following line.
  assert.match(routeSource, /path="system-health"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(routeSource, /path="billing"/);
});
