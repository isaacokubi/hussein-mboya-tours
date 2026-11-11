/**
 * Purpose: first Tenant Provisioning Security.test automated test. Main declarations: read.
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

// Declare root for use by the surrounding module or function.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// Declare read for use by the surrounding module or function.
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

// Perform the side effect or state update expressed on the following line.
test("tenant and platform bootstrap cannot be invoked by an unauthenticated visitor", () => {
  // Declare app for use by the surrounding module or function.
  const app = read("app.js");
  // Declare authRoutes for use by the surrounding module or function.
  const authRoutes = read("routes/authRoutes.js");
  // Declare platformRoutes for use by the surrounding module or function.
  const platformRoutes = read("routes/superAdminRoutes.js");
  // Declare tenantRoutes for use by the surrounding module or function.
  const tenantRoutes = read("routes/tenantRoutes.js");
  // Declare packageRoutes for use by the surrounding module or function.
  const packageRoutes = read("routes/adminPackageRoutes.js");
  // Declare publicPackageRoutes for use by the surrounding module or function.
  const publicPackageRoutes = read("routes/publicPackageRoutes.js");
  // Declare apiRoutes for use by the surrounding module or function.
  const apiRoutes = read("routes/index.js");
  // Declare tenantMiddleware for use by the surrounding module or function.
  const tenantMiddleware = read("middleware/tenantMiddleware.js");

  // Perform the side effect or state update expressed on the following line.
  assert.doesNotMatch(app, /publicOnboardingRoutes|\/api\/public\/onboarding/);
  // Perform the side effect or state update expressed on the following line.
  assert.doesNotMatch(authRoutes, /bootstrapTenant|\/bootstrap/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(platformRoutes, /router\.use\(protect, superAdminOnly\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(platformRoutes, /router\.post\("\/tenants", createTenantWithAdmin\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(tenantRoutes, /router\.use\(protect, superAdminOnly\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(tenantRoutes, /router\.post\("\/", createTenant\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(tenantMiddleware, /requestedTenantSlug !== String\(tokenTenant\.slug/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(tenantMiddleware, /requestedTenantKey !== String\(tokenTenant\._id\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(packageRoutes, /router\.use\(resolveTenant, protect, adminMiddleware, authorize\("tour\.manage"\)\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(packageRoutes, /router\.post\("\/", createAdminPackage\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(apiRoutes, /router\.use\("\/admin\/packages", adminPackageRoutes\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(apiRoutes, /router\.use\("\/packages", publicPackageRoutes\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(publicPackageRoutes, /router\.use\(resolveTenant\)/);
});

// Perform the side effect or state update expressed on the following line.
test("production startup requires dedicated payment and webhook encryption secrets", () => {
  // Declare env for use by the surrounding module or function.
  const env = read("config/env.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(env, /for \(const key of \["PAYMENT_CREDENTIAL_ENCRYPTION_KEY", "WEBHOOK_SECRET_KEY"\]\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(env, /hasStrongSecret\(process\.env\[key\]\)/);
});

// Perform the side effect or state update expressed on the following line.
test("public tenant branding never returns arbitrary tenant settings", () => {
  // Declare branding for use by the surrounding module or function.
  const branding = read("controllers/tenantBrandingController.js");
  // Perform the side effect or state update expressed on the following line.
  assert.doesNotMatch(branding, /settings:\s*tenant\.settings/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(branding, /organization:\s*\{/);
  // Perform the side effect or state update expressed on the following line.
  assert.doesNotMatch(branding, /organization:\s*updated\s*\}/);
});

// Perform the side effect or state update expressed on the following line.
test("public tenant packages are rendered and production clients require a valid API base", () => {
  // Declare frontend for use by the surrounding module or function.
  const frontend = fs.readFileSync(path.resolve(root, "../client/src/components/home/PublicPackages.jsx"), "utf8");
  // Declare frontendApi for use by the surrounding module or function.
  const frontendApi = fs.readFileSync(path.resolve(root, "../client/src/api/axios.js"), "utf8");
  // Declare frontendSocket for use by the surrounding module or function.
  const frontendSocket = fs.readFileSync(path.resolve(root, "../client/src/api/apiUrls.js"), "utf8");
  // Perform the side effect or state update expressed on the following line.
  assert.match(frontend, /getPublicPackages/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(frontendApi, /Production VITE_API_URL must be an absolute HTTPS URL ending in \/api/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(frontendApi, /Production VITE_API_URL must use HTTPS and cannot target a local host/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(frontendApi, /parsed\.pathname\.replace/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(frontendApi, /!== "\/api"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(frontendSocket, /socket\.origin !== api\.origin/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(frontendSocket, /Production VITE_SOCKET_URL must be the HTTPS origin of VITE_API_URL/);
});
