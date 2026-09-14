import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(process.cwd());
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("platform subscription pricing is globally readable and writable", () => {
  const controller = read("controllers/platformBillingController.js");
  assert.match(controller, /runWithTenant\(\{ role: "super_admin", bypass: true \}/);
  assert.match(controller, /SystemSetting\.findOne\(\{ tenantId: null, key: "platform" \}\)/);
  assert.match(controller, /tenantPlanStarterPriceKes/);
  assert.match(controller, /tenantPlanProfessionalPriceKes/);
  assert.match(controller, /tenantPlanBusinessPriceKes/);
  assert.match(controller, /tenantPlanEnterprisePriceKes/);
});

test("tenant billing exposes platform prices to the tenant UI", () => {
  const service = read("services/tenantSubscriptionService.js");
  const controller = read("controllers/tenantSubscriptionController.js");
  const client = read("../client/src/pages/admin/TenantBilling.jsx");
  assert.match(service, /export const getTenantPlanPrices/);
  assert.match(service, /export const getTenantPlanPrice/);
  assert.match(controller, /const planPrices = await getTenantPlanPrices\(\)/);
  assert.match(controller, /planPrices,/);
  assert.match(client, /data\.planPrices/);
  assert.match(client, /Price not configured/);
});

test("subscription checkout uses only the platform configured amount", () => {
  const service = read("services/tenantSubscriptionService.js");
  const controller = read("controllers/tenantSubscriptionController.js");
  assert.match(service, /const paymentAmount = await getTenantPlanPrice\(normalizedPlan\)/);
  assert.doesNotMatch(service, /Number\(amount \|\| configuredAmount\)/);
  assert.match(controller, /const amount = await getTenantPlanPrice\(plan\)/);
  assert.match(controller, /The selected plan price is not configured/);
  assert.doesNotMatch(controller, /req\.body\?\.amount/);
});

test("expired paid subscriptions enter a bounded grace period before suspension", () => {
  const service = read("services/tenantSubscriptionService.js");
  assert.match(service, /SUBSCRIPTION_GRACE_PERIOD_DAYS/);
  assert.match(service, /status: "past_due"/);
  assert.match(service, /currentPeriodEndsAt: \{ \$lte: new Date\(now\.getTime\(\) - SUBSCRIPTION_GRACE_PERIOD_DAYS \* DAY_MS\) \}/);
  assert.match(service, /status: "suspended"/);
});

test("subscription callback verifies tenant, amount and receipt before activation", () => {
  const callback = read("controllers/subscriptionMpesaCallbackController.js");
  assert.match(callback, /resolvedTenantId\(req\)/);
  assert.match(callback, /SubscriptionPayment\.findOne\(\{ tenantId, checkoutRequestID \}\)/);
  assert.match(callback, /Math\.round\(paidAmount\).*Math\.round\(payment\.amount\)/);
  assert.match(callback, /!receipt/);
  assert.match(callback, /activateTenantSubscription\(/);
});

test("M-Pesa callback route resolves tenant context and verifies integrity", () => {
  const routes = read("routes/mpesaRoutes.js");
  assert.match(routes, /router\.post\("\/callback", resolveMpesaCallbackTenant, verifyMpesaCallbackIntegrity, subscriptionMpesaCallback\)/);
});

test("SuperAdmin billing API is exposed through protected routes", () => {
  const routes = read("routes/superAdminRoutes.js");
  const api = read("../client/src/api/platformBillingApi.js");
  assert.match(routes, /router\.get\("\/billing\/config", getPlatformBillingConfig\)/);
  assert.match(routes, /router\.put\("\/billing\/config", updatePlatformBillingConfig\)/);
  assert.match(api, /axios\.get\("\/superadmin\/billing\/config"\)/);
  assert.match(api, /axios\.put\("\/superadmin\/billing\/config"/);
});
