/**
 * Purpose: subscription Billing Integrity.test automated test. Main declarations: read.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import assert from "node:assert/strict";
// Load node:fs so this module can use its exported dependencies.
import fs from "node:fs";
// Load node:path so this module can use its exported dependencies.
import path from "node:path";
// Load node:test so this module can use its exported dependencies.
import test from "node:test";

// Declare root for use by the surrounding module or function.
const root = path.resolve(process.cwd());
// Declare read for use by the surrounding module or function.
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

// Perform the side effect or state update expressed on the following line.
test("platform subscription pricing is globally readable and writable", () => {
  // Declare controller for use by the surrounding module or function.
  const controller = read("controllers/platformBillingController.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /runWithTenant\(\{ role: "super_admin", bypass: true \}/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /SystemSetting\.findOne\(\{ tenantId: null, key: "platform" \}\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /tenantPlanStarterPriceKes/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /tenantPlanProfessionalPriceKes/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /tenantPlanBusinessPriceKes/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /tenantPlanEnterprisePriceKes/);
});

// Perform the side effect or state update expressed on the following line.
test("tenant billing exposes platform prices to the tenant UI", () => {
  // Declare service for use by the surrounding module or function.
  const service = read("services/tenantSubscriptionService.js");
  // Declare controller for use by the surrounding module or function.
  const controller = read("controllers/tenantSubscriptionController.js");
  // Declare client for use by the surrounding module or function.
  const client = read("../client/src/pages/admin/TenantBilling.jsx");
  // Perform the side effect or state update expressed on the following line.
  assert.match(service, /export const getTenantPlanPrices/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(service, /export const getTenantPlanPrice/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /const planPrices = await getTenantPlanPrices\(\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /planPrices,/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(client, /data\.planPrices/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(client, /Price not configured/);
});

// Perform the side effect or state update expressed on the following line.
test("subscription checkout uses only the platform configured amount", () => {
  // Declare service for use by the surrounding module or function.
  const service = read("services/tenantSubscriptionService.js");
  // Declare controller for use by the surrounding module or function.
  const controller = read("controllers/tenantSubscriptionController.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(service, /const paymentAmount = await getTenantPlanPrice\(normalizedPlan\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.doesNotMatch(service, /Number\(amount \|\| configuredAmount\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /const amount = await getTenantPlanPrice\(plan\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /The selected plan price is not configured/);
  // Perform the side effect or state update expressed on the following line.
  assert.doesNotMatch(controller, /req\.body\?\.amount/);
});

// Perform the side effect or state update expressed on the following line.
test("expired paid subscriptions enter a bounded grace period before suspension", () => {
  // Declare service for use by the surrounding module or function.
  const service = read("services/tenantSubscriptionService.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(service, /SUBSCRIPTION_GRACE_PERIOD_DAYS/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(service, /status: "past_due"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(service, /currentPeriodEndsAt: \{ \$lte: new Date\(now\.getTime\(\) - SUBSCRIPTION_GRACE_PERIOD_DAYS \* DAY_MS\) \}/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(service, /status: "suspended"/);
});

// Perform the side effect or state update expressed on the following line.
test("subscription callback verifies tenant, amount and receipt before activation", () => {
  // Declare callback for use by the surrounding module or function.
  const callback = read("controllers/subscriptionMpesaCallbackController.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(callback, /resolvedTenantId\(req\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(callback, /SubscriptionPayment\.findOne\(\{ tenantId, checkoutRequestID \}\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(callback, /Math\.round\(paidAmount\).*Math\.round\(payment\.amount\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(callback, /!receipt/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(callback, /activateTenantSubscription\(/);
});

// Perform the side effect or state update expressed on the following line.
test("M-Pesa callback route resolves tenant context and verifies integrity", () => {
  // Declare routes for use by the surrounding module or function.
  const routes = read("routes/mpesaRoutes.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(routes, /router\.post\("\/callback", validateMpesaCallbackPayload, resolveMpesaCallbackTenant, verifyMpesaCallbackIntegrity, subscriptionMpesaCallback\)/);
});

// Perform the side effect or state update expressed on the following line.
test("SuperAdmin billing API is exposed through protected routes", () => {
  // Declare routes for use by the surrounding module or function.
  const routes = read("routes/superAdminRoutes.js");
  // Declare api for use by the surrounding module or function.
  const api = read("../client/src/api/platformBillingApi.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(routes, /router\.get\("\/billing\/config", getPlatformBillingConfig\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(routes, /router\.put\("\/billing\/config", updatePlatformBillingConfig\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(api, /axios\.get\("\/superadmin\/billing\/config"\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(api, /axios\.put\("\/superadmin\/billing\/config"/);
});
