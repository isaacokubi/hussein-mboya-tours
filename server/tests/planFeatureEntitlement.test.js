import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(process.cwd());
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("subscription plans have explicit commercial feature entitlements", () => {
  const service = read("services/planFeatureService.js");
  for (const plan of ["starter", "professional", "business", "enterprise"]) assert.match(service, new RegExp(`${plan}:`));
  assert.match(service, /billing/); assert.match(service, /etims/); assert.match(service, /ai/); assert.match(service, /developer_platform/);
  assert.match(service, /custom_domain/); assert.match(service, /sso/); assert.match(service, /white_label/); assert.match(service, /dedicated_support/);
});

test("tenant APIs enforce plan entitlements server-side", () => {
  const middleware = read("middleware/planFeatureMiddleware.js"); const routes = read("routes/index.js");
  assert.match(middleware, /PLAN_FEATURE_LOCKED/); assert.match(middleware, /getPlanFeaturesForTenant/); assert.match(routes, /router\.use\(enforcePlanFeature\)/);
});

test("SuperAdmin can configure plan feature entitlements", () => {
  const controller = read("controllers/platformBillingController.js"); const routes = read("routes/superAdminRoutes.js"); const model = read("models/SystemSetting.js");
  assert.match(model, /subscriptionPlanFeatures/); assert.match(controller, /validatePlanFeatures/); assert.match(controller, /subscriptionPlanFeatures/); assert.match(routes, /billing\/features/);
});

test("tenant subscription response exposes the active plan feature set", () => {
  const controller = read("controllers/tenantSubscriptionController.js");
  assert.match(controller, /getTenantPlanFeatures/); assert.match(controller, /features,/); assert.match(controller, /featureCatalog/);
});
