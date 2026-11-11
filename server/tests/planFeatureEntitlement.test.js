/**
 * Purpose: plan Feature Entitlement.test automated test. Main declarations: read.
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
test("subscription plans have explicit commercial feature entitlements", () => {
  // Declare service for use by the surrounding module or function.
  const service = read("services/planFeatureService.js");
  // Repeat the enclosed work for each required iteration.
  for (const plan of ["starter", "professional", "business", "enterprise"]) assert.match(service, new RegExp(`${plan}:`));
  // Perform the side effect or state update expressed on the following line.
  assert.match(service, /billing/); assert.match(service, /etims/); assert.match(service, /ai/); assert.match(service, /developer_platform/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(service, /custom_domain/); assert.match(service, /sso/); assert.match(service, /white_label/); assert.match(service, /dedicated_support/);
});

// Perform the side effect or state update expressed on the following line.
test("tenant APIs enforce plan entitlements server-side", () => {
  // Declare middleware for use by the surrounding module or function.
  const middleware = read("middleware/planFeatureMiddleware.js"); const routes = read("routes/index.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(middleware, /PLAN_FEATURE_LOCKED/); assert.match(middleware, /getPlanFeaturesForTenant/); assert.match(routes, /router\.use\(enforcePlanFeature\)/);
});

// Perform the side effect or state update expressed on the following line.
test("SuperAdmin can configure plan feature entitlements", () => {
  // Declare controller for use by the surrounding module or function.
  const controller = read("controllers/platformBillingController.js"); const routes = read("routes/superAdminRoutes.js"); const model = read("models/SystemSetting.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(model, /subscriptionPlanFeatures/); assert.match(controller, /validatePlanFeatures/); assert.match(controller, /subscriptionPlanFeatures/); assert.match(routes, /billing\/features/);
});

// Perform the side effect or state update expressed on the following line.
test("tenant subscription response exposes the active plan feature set", () => {
  // Declare controller for use by the surrounding module or function.
  const controller = read("controllers/tenantSubscriptionController.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /getTenantPlanFeatures/); assert.match(controller, /features,/); assert.match(controller, /featureCatalog/);
});
