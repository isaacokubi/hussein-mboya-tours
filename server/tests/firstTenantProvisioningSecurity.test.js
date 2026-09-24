import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("tenant and platform bootstrap cannot be invoked by an unauthenticated visitor", () => {
  const app = read("app.js");
  const authRoutes = read("routes/authRoutes.js");
  const platformRoutes = read("routes/superAdminRoutes.js");
  const tenantRoutes = read("routes/tenantRoutes.js");
  const packageRoutes = read("routes/adminPackageRoutes.js");
  const publicPackageRoutes = read("routes/publicPackageRoutes.js");
  const apiRoutes = read("routes/index.js");
  const tenantMiddleware = read("middleware/tenantMiddleware.js");

  assert.doesNotMatch(app, /publicOnboardingRoutes|\/api\/public\/onboarding/);
  assert.doesNotMatch(authRoutes, /bootstrapTenant|\/bootstrap/);
  assert.match(platformRoutes, /router\.use\(protect, superAdminOnly\)/);
  assert.match(platformRoutes, /router\.post\("\/tenants", createTenantWithAdmin\)/);
  assert.match(tenantRoutes, /router\.use\(protect, superAdminOnly\)/);
  assert.match(tenantRoutes, /router\.post\("\/", createTenant\)/);
  assert.match(tenantMiddleware, /requestedTenantSlug !== String\(tokenTenant\.slug/);
  assert.match(tenantMiddleware, /requestedTenantKey !== String\(tokenTenant\._id\)/);
  assert.match(packageRoutes, /router\.use\(resolveTenant, protect, adminMiddleware, authorize\("tour\.manage"\)\)/);
  assert.match(packageRoutes, /router\.post\("\/", createAdminPackage\)/);
  assert.match(apiRoutes, /router\.use\("\/admin\/packages", adminPackageRoutes\)/);
  assert.match(apiRoutes, /router\.use\("\/packages", publicPackageRoutes\)/);
  assert.match(publicPackageRoutes, /router\.use\(resolveTenant\)/);
});

test("production startup requires dedicated payment and webhook encryption secrets", () => {
  const env = read("config/env.js");
  assert.match(env, /for \(const key of \["PAYMENT_CREDENTIAL_ENCRYPTION_KEY", "WEBHOOK_SECRET_KEY"\]\)/);
  assert.match(env, /hasStrongSecret\(process\.env\[key\]\)/);
});

test("public tenant branding never returns arbitrary tenant settings", () => {
  const branding = read("controllers/tenantBrandingController.js");
  assert.doesNotMatch(branding, /settings:\s*tenant\.settings/);
  assert.match(branding, /organization:\s*\{/);
  assert.doesNotMatch(branding, /organization:\s*updated\s*\}/);
});

test("public tenant packages are rendered and production clients require a valid API base", () => {
  const frontend = fs.readFileSync(path.resolve(root, "../client/src/components/home/PublicPackages.jsx"), "utf8");
  const frontendApi = fs.readFileSync(path.resolve(root, "../client/src/api/axios.js"), "utf8");
  const frontendSocket = fs.readFileSync(path.resolve(root, "../client/src/api/apiUrls.js"), "utf8");
  assert.match(frontend, /getPublicPackages/);
  assert.match(frontendApi, /Production VITE_API_URL must be an absolute HTTPS URL ending in \/api/);
  assert.match(frontendApi, /Production VITE_API_URL must use HTTPS and cannot target a local host/);
  assert.match(frontendApi, /parsed\.pathname\.replace/);
  assert.match(frontendApi, /!== "\/api"/);
  assert.match(frontendSocket, /socket\.origin !== api\.origin/);
  assert.match(frontendSocket, /Production VITE_SOCKET_URL must be the HTTPS origin of VITE_API_URL/);
});
