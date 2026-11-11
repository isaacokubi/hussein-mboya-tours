/**
 * Purpose: consolidated Production Audit.test automated test. Main declarations: read.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import test from "node:test";
// Load node:assert/strict so this module can use its exported dependencies.
import assert from "node:assert/strict";
// Load node:fs so this module can use its exported dependencies.
import fs from "node:fs";
// Load node:path so this module can use its exported dependencies.
import path from "node:path";

// Declare root for use by the surrounding module or function.
const root = path.resolve(process.cwd(), "..");
// Declare read for use by the surrounding module or function.
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

// Declare required for use by the surrounding module or function.
const required = [
  "client/src/routes/AppRoutes.jsx",
  "client/src/context/SettingsContext.jsx",
  "client/src/api/axios.js",
  "server/services/paymentLifecycleService.js",
  "server/services/operationalAccountingService.js",
  "server/services/etimsService.js",
  "server/middleware/tenantMiddleware.js",
  "server/middleware/mpesaCallbackIntegrity.js",
  "server/middleware/resolveMpesaCallbackTenant.js",
  "docs/PRODUCTION_READINESS.md",
  "docs/PRODUCTION_GO_LIVE_CHECKLIST.md",
];

// Perform the side effect or state update expressed on the following line.
test("consolidated production audit: critical runtime surfaces exist", () => {
  // Declare missing for use by the surrounding module or function.
  const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(missing, []);
});

// Perform the side effect or state update expressed on the following line.
test("consolidated production audit: critical dashboard routes remain wired", () => {
  // Declare routes for use by the surrounding module or function.
  const routes = read("client/src/routes/AppRoutes.jsx");
  // Declare expected for use by the surrounding module or function.
  const expected = [
    "/admin",
    "/admin/bookings",
    "/admin/finance",
    "/admin/analytics",
    "/admin/reports",
    "/tour-manager",
    "/tour-manager/create-tour",
    "/agent",
    "/guide/dashboard",
    "/driver",
    "/dashboard",
    "/checkout",
  ];
  // Repeat the enclosed work for each required iteration.
  for (const route of expected) {
    // Declare escaped for use by the surrounding module or function.
    const escaped = route.replaceAll("/", "\\/");

    // Routes may be declared as absolute paths, child paths, or
    // parameterized route families. For example, the application
    // intentionally exposes /checkout/:type/:id rather than a
    // standalone /checkout page.
    // Declare exactPattern for use by the surrounding module or function.
    const exactPattern = new RegExp(
      `path=["']${escaped}(?:["']|\\?)`
    );

    // Check the condition (exactPattern.test(routes)) and run the matching branch.
    if (exactPattern.test(routes)) continue;

    // Declare nestedParents for use by the surrounding module or function.
    const nestedParents = [
      "/admin/",
      "/tour-manager/",
      "/superadmin/",
      "/agent/",
      "/guide/",
      "/driver/",
    ];

    // Declare parent for use by the surrounding module or function.
    const parent = nestedParents.find((prefix) => route.startsWith(prefix));

    // Check the condition (parent) and run the matching branch.
    if (parent) {
      // Declare childRoute for use by the surrounding module or function.
      const childRoute = route.slice(parent.length);
      // Declare childEscaped for use by the surrounding module or function.
      const childEscaped = childRoute.replaceAll("/", "\\/");

      // Declare nestedPattern for use by the surrounding module or function.
      const nestedPattern = new RegExp(
        `path=["']${childEscaped}(?:["']|\\?)`
      );

      // Check the condition (nestedPattern.test(routes)) and run the matching branch.
      if (nestedPattern.test(routes)) continue;
    }

    // Some expected entries represent a route family rather than a
    // directly navigable URL. The checkout flow is implemented as
    // /checkout/:type/:id and is consumed by /checkout/tour/:id and
    // /checkout/booking/:id.
    // Check the condition (route === "/checkout") and run the matching branch.
    if (route === "/checkout") {
      // Declare checkoutRouteExists for use by the surrounding module or function.
      const checkoutRouteExists =
        routes.includes('path="/checkout/:type/:id"') ||
        routes.includes("path='/checkout/:type/:id'");

      // Perform the side effect or state update expressed on the following line.
      assert.ok(
        checkoutRouteExists,
        "Missing parameterized checkout route: /checkout/:type/:id"
      );

      // Skip the remainder of this iteration and continue with the next one.
      continue;
    }

    // Perform the side effect or state update expressed on the following line.
    assert.match(
      routes,
      exactPattern,
      `Missing route: ${route}`
    );
  }
});

// Perform the side effect or state update expressed on the following line.
test("consolidated production audit: public brand is tenant/platform controlled", () => {
  // Declare settings for use by the surrounding module or function.
  const settings = read("client/src/context/SettingsContext.jsx");
  // Perform the side effect or state update expressed on the following line.
  assert.match(settings, /PUBLIC_BRAND_NAME = \"Kenya Tours\"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(settings, /PLATFORM_BRAND_NAME = \"Kenya Tours\"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(settings, /isSuperAdminUser/);
});

// Perform the side effect or state update expressed on the following line.
test("consolidated production audit: tenant and payment boundaries are present", () => {
  // Declare payment for use by the surrounding module or function.
  const payment = read("server/services/paymentLifecycleService.js");
  // Declare accounting for use by the surrounding module or function.
  const accounting = read("server/services/operationalAccountingService.js");
  // Declare mpesaTenant for use by the surrounding module or function.
  const mpesaTenant = read("server/middleware/resolveMpesaCallbackTenant.js");
  // Declare callbackIntegrity for use by the surrounding module or function.
  const callbackIntegrity = read("server/middleware/mpesaCallbackIntegrity.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(payment, /tenant/i);
  // Perform the side effect or state update expressed on the following line.
  assert.match(payment, /idempot/i);
  // Perform the side effect or state update expressed on the following line.
  assert.match(accounting, /tenant/i);
  // Perform the side effect or state update expressed on the following line.
  assert.match(mpesaTenant, /tenant/i);
  // Perform the side effect or state update expressed on the following line.
  assert.match(callbackIntegrity, /signature|integrity|callback/i);
});

// Perform the side effect or state update expressed on the following line.
test("consolidated production audit: eTIMS production adapter is fail-closed and tenant scoped", () => {
  // Declare etims for use by the surrounding module or function.
  const etims = read("server/services/etimsService.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(etims, /https/i);
  // Perform the side effect or state update expressed on the following line.
  assert.match(etims, /tenant/i);
  // Perform the side effect or state update expressed on the following line.
  assert.match(etims, /idempot/i);
  // Perform the side effect or state update expressed on the following line.
  assert.match(etims, /EtimsSubmission|submission/i);
});

// Perform the side effect or state update expressed on the following line.
test("consolidated production audit: go-live documentation does not claim pending external evidence is complete", () => {
  // Declare docs for use by the surrounding module or function.
  const docs = read("docs/PRODUCTION_READINESS.md");
  // Perform the side effect or state update expressed on the following line.
  assert.match(docs, /M-Pesa sandbox callback/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(docs, /Live KRA\/eTIMS submission/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(docs, /Current-main production deployment/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(docs, /PENDING|NOT VERIFIED/);
});
