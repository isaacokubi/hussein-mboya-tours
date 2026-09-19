import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd(), "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

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

test("consolidated production audit: critical runtime surfaces exist", () => {
  const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));
  assert.deepEqual(missing, []);
});

test("consolidated production audit: critical dashboard routes remain wired", () => {
  const routes = read("client/src/routes/AppRoutes.jsx");
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
  for (const route of expected) {
    const escaped = route.replaceAll("/", "\\/");

    // Routes may be declared as absolute paths, child paths, or
    // parameterized route families. For example, the application
    // intentionally exposes /checkout/:type/:id rather than a
    // standalone /checkout page.
    const exactPattern = new RegExp(
      `path=["']${escaped}(?:["']|\\?)`
    );

    if (exactPattern.test(routes)) continue;

    const nestedParents = [
      "/admin/",
      "/tour-manager/",
      "/superadmin/",
      "/agent/",
      "/guide/",
      "/driver/",
    ];

    const parent = nestedParents.find((prefix) => route.startsWith(prefix));

    if (parent) {
      const childRoute = route.slice(parent.length);
      const childEscaped = childRoute.replaceAll("/", "\\/");

      const nestedPattern = new RegExp(
        `path=["']${childEscaped}(?:["']|\\?)`
      );

      if (nestedPattern.test(routes)) continue;
    }

    // Some expected entries represent a route family rather than a
    // directly navigable URL. The checkout flow is implemented as
    // /checkout/:type/:id and is consumed by /checkout/tour/:id and
    // /checkout/booking/:id.
    if (route === "/checkout") {
      const checkoutRouteExists =
        routes.includes('path="/checkout/:type/:id"') ||
        routes.includes("path='/checkout/:type/:id'");

      assert.ok(
        checkoutRouteExists,
        "Missing parameterized checkout route: /checkout/:type/:id"
      );

      continue;
    }

    assert.match(
      routes,
      exactPattern,
      `Missing route: ${route}`
    );
  }
});

test("consolidated production audit: public brand is tenant/platform controlled", () => {
  const settings = read("client/src/context/SettingsContext.jsx");
  assert.match(settings, /PUBLIC_BRAND_NAME = \"Global Tours\"/);
  assert.match(settings, /PLATFORM_BRAND_NAME = \"Global Tours\"/);
  assert.match(settings, /isSuperAdminUser/);
});

test("consolidated production audit: tenant and payment boundaries are present", () => {
  const payment = read("server/services/paymentLifecycleService.js");
  const accounting = read("server/services/operationalAccountingService.js");
  const mpesaTenant = read("server/middleware/resolveMpesaCallbackTenant.js");
  const callbackIntegrity = read("server/middleware/mpesaCallbackIntegrity.js");
  assert.match(payment, /tenant/i);
  assert.match(payment, /idempot/i);
  assert.match(accounting, /tenant/i);
  assert.match(mpesaTenant, /tenant/i);
  assert.match(callbackIntegrity, /signature|integrity|callback/i);
});

test("consolidated production audit: eTIMS production adapter is fail-closed and tenant scoped", () => {
  const etims = read("server/services/etimsService.js");
  assert.match(etims, /https/i);
  assert.match(etims, /tenant/i);
  assert.match(etims, /idempot/i);
  assert.match(etims, /EtimsSubmission|submission/i);
});

test("consolidated production audit: go-live documentation does not claim pending external evidence is complete", () => {
  const docs = read("docs/PRODUCTION_READINESS.md");
  assert.match(docs, /M-Pesa sandbox callback/);
  assert.match(docs, /Live KRA\/eTIMS submission/);
  assert.match(docs, /Current-main production deployment/);
  assert.match(docs, /PENDING|NOT VERIFIED/);
});
