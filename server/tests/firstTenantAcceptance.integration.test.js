/**
 * Purpose: first Tenant Acceptance.integration.test automated test. Main declarations: isolatedTestDatabaseUri, call, tenantInput.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import test from "node:test";
// Load node:assert/strict so this module can use its exported dependencies.
import assert from "node:assert/strict";
// Load node:http so this module can use its exported dependencies.
import http from "node:http";
// Load node:crypto so this module can use its exported dependencies.
import { randomBytes } from "node:crypto";

// Declare testMongoUri for use by the surrounding module or function.
const testMongoUri = process.env.FIRST_TENANT_TEST_MONGODB_URI;

// Declare isolatedTestDatabaseUri for use by the surrounding module or function.
const isolatedTestDatabaseUri = (baseUri) => {
  // Declare uri for use by the surrounding module or function.
  const uri = new URL(baseUri);
  // Declare sourceDatabase for use by the surrounding module or function.
  const sourceDatabase = decodeURIComponent(uri.pathname.replace(/^\//, ""));
  // Check the condition (sourceDatabase !== "global_tours_test") and run the matching branch.
  if (sourceDatabase !== "global_tours_test") {
    // Stop the current operation by raising a new Error instance.
    throw new Error("FIRST_TENANT_TEST_MONGODB_URI must use global_tours_test as its Atlas source connection.");
  }
  // Declare databaseName for use by the surrounding module or function.
  const databaseName = `fta_${process.pid}_${randomBytes(8).toString("hex")}`;
  // Perform the side effect or state update expressed on the following line.
  uri.pathname = `/${databaseName}`;
  // Return the object assembled below to the caller.
  return { uri: uri.toString(), databaseName };
};

// Perform the side effect or state update expressed on the following line.
test("first tenant provisioning, tenant-admin access, public catalogue and cross-tenant denial", { skip: !testMongoUri }, async (t) => {
  // Declare { uri: isolatedUri, databaseName } for use by the surrounding module or function.
  const { uri: isolatedUri, databaseName } = isolatedTestDatabaseUri(testMongoUri);
  // Check the condition (!/^fta_[0-9]+_[a-f0-9]{16}$/.test(databaseName)) and run the matching branch.
  if (!/^fta_[0-9]+_[a-f0-9]{16}$/.test(databaseName)) throw new Error("Unsafe first-tenant test database name.");
  // Perform the side effect or state update expressed on the following line.
  process.env.MONGODB_URI = isolatedUri;
  // Perform the side effect or state update expressed on the following line.
  process.env.JWT_SECRET ||= "first-tenant-ci-secret-only";
  // Perform the side effect or state update expressed on the following line.
  process.env.NODE_ENV = "test";
  // Perform the side effect or state update expressed on the following line.
  process.env.ALLOW_GLOBAL_MPESA_FALLBACK = "false";
  // Perform the side effect or state update expressed on the following line.
  process.env.ALLOW_SINGLE_TENANT_DEV_FALLBACK = "false";
  // Perform the side effect or state update expressed on the following line.
  process.env.DEFAULT_PUBLIC_TENANT_SLUG = "";
  // Perform the side effect or state update expressed on the following line.
  process.env.PUBLIC_TENANT_SLUG = "";
  // Perform the side effect or state update expressed on the following line.
  process.env.MFA_DEV_MODE = "false";
  // Perform the side effect or state update expressed on the following line.
  process.env.MFA_ENABLED = "false";
  // Declare stagingFrontendOrigin for use by the surrounding module or function.
  const stagingFrontendOrigin = "https://hussein-mboya-tours-2-l3m78h6fz-isaacokubis-projects.vercel.app";
  // Perform the side effect or state update expressed on the following line.
  process.env.CLIENT_ORIGINS = stagingFrontendOrigin;
  // Perform the side effect or state update expressed on the following line.
  assert.equal(process.env.ALLOW_GLOBAL_MPESA_FALLBACK, "false");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(process.env.ALLOW_SINGLE_TENANT_DEV_FALLBACK, "false");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(process.env.MFA_DEV_MODE, "false");

  // Declare mongooseModule for use by the surrounding module or function.
  const mongooseModule = await import("mongoose");
  // Declare mongoose for use by the surrounding module or function.
  const mongoose = mongooseModule.default;
  // Keep unrelated model auto-indexing from materializing hundreds of collections
  // in a fresh Atlas database. The acceptance flow exercises provisioning and
  // tenant isolation; it does not certify every model index.
  // Perform the side effect or state update expressed on the following line.
  mongoose.set("autoIndex", false);
  // Declare [appModule, onboarding, userModel, organizationModel, context, paymentService, readiness] for use by the surrounding module or function.
  const [appModule, onboarding, userModel, organizationModel, context, paymentService, readiness] = await Promise.all([
    import("../app.js"), import("../services/onboardingService.js"),
    import("../models/User.js"), import("../models/Organization.js"),
    import("../tenancy/context.js"), import("../services/paymentGatewayService.js"), import("../startup/readiness.js"),
  ]);
  // Declare app for use by the surrounding module or function.
  const app = appModule.default;
  // Declare { assertSupportedMongoVersion } for use by the surrounding module or function.
  const { assertSupportedMongoVersion } = await import("../utils/mongodbVersion.js");
  // Declare User for use by the surrounding module or function.
  const User = userModel.default;
  // Declare Organization for use by the surrounding module or function.
  const Organization = organizationModel.default;
  // Declare server for use by the surrounding module or function.
  const server = http.createServer(app);
  // Declare owner for use by the surrounding module or function.
  let owner;
  // Declare firstTenant for use by the surrounding module or function.
  let firstTenant;
  // Declare secondTenant for use by the surrounding module or function.
  let secondTenant;
  // Declare ownerPassword for use by the surrounding module or function.
  const ownerPassword = `Platform-${randomBytes(24).toString("hex")}1A`;
  // Declare tenantAdminPassword for use by the surrounding module or function.
  const tenantAdminPassword = `Tenant-${randomBytes(24).toString("hex")}1A`;
  // Declare customerPassword for use by the surrounding module or function.
  const customerPassword = `Customer-${randomBytes(24).toString("hex")}1A`;

  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    await mongoose.connect(isolatedUri);
    // Declare buildInfo for use by the surrounding module or function.
    const buildInfo = await mongoose.connection.db.admin().command({ buildInfo: 1 });
    // Perform the side effect or state update expressed on the following line.
    assertSupportedMongoVersion(buildInfo.version);
    // Declare roles for use by the surrounding module or function.
    const roles = await onboarding.ensureSystemRoles();
    // Perform the side effect or state update expressed on the following line.
    owner = await context.runWithTenant({ role: "super_admin", bypass: true }, () => User.create({
      name: "Acceptance Platform Owner", email: "platform-owner@acceptance.invalid", phone: "0712345001",
      password: ownerPassword, role: "super_admin", legacyRole: "super_admin", roleId: roles.superadmin._id,
      tenantId: null, status: "active", isVerified: true,
    }));
    // Perform the side effect or state update expressed on the following line.
    readiness.setStartupPhase("ready");
    // Perform the side effect or state update expressed on the following line.
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    // Declare origin for use by the surrounding module or function.
    const origin = `http://127.0.0.1:${server.address().port}`;
    // Declare loginClientIps for use by the surrounding module or function.
    const loginClientIps = new Map();
    // Declare call for use by the surrounding module or function.
    const call = (url, { token, tenantSlug, ...options } = {}) => {
      // Declare headers for use by the surrounding module or function.
      const headers = {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(tenantSlug ? { "X-Tenant-Slug": tenantSlug } : {}),
        ...options.headers,
      };
      // Check the condition (url === "/api/auth/login" && options.method !== "OPTIONS") and run the matching branch.
      if (url === "/api/auth/login" && options.method !== "OPTIONS") {
        // Declare email for use by the surrounding module or function.
        let email = "unknown-login-client";
        // Run this operation with a dedicated error-handling path for failures.
        try { email = JSON.parse(options.body || "{}").email || email; } catch { /* malformed-login tests still use a stable client key */ }
        // Check the condition (!loginClientIps.has(email)) and run the matching branch.
        if (!loginClientIps.has(email)) loginClientIps.set(email, `198.51.100.${loginClientIps.size + 1}`);
        // Each synthetic account represents a separate client in this acceptance flow.
        // Keep the production per-IP login limit enabled while the test covers multiple identities.
        // Perform the side effect or state update expressed on the following line.
        headers["X-Forwarded-For"] = loginClientIps.get(email);
      }
      // Return the result of fetch() to the caller.
      return fetch(`${origin}${url}`, { ...options, headers });
    };
    // Declare tenantInput for use by the surrounding module or function.
    const tenantInput = (suffix, plan = "starter") => ({
      companyName: `Acceptance Safaris ${suffix}`, slug: `acceptance-safaris-${suffix}`,
      companyEmail: `office-${suffix}@acceptance.invalid`, companyPhone: suffix === "a" ? "0712345002" : "0712345003",
      adminName: `Tenant Admin ${suffix.toUpperCase()}`, adminEmail: `admin-${suffix}@acceptance.invalid`,
      adminPhone: suffix === "a" ? "0712345004" : "0712345005", adminPassword: tenantAdminPassword,
      plan, country: "Kenya", timezone: "Africa/Nairobi", currency: "KES",
    });

    // Declare stagingPreflight for use by the surrounding module or function.
    const stagingPreflight = await call("/api/auth/login", {
      method: "OPTIONS",
      headers: {
        Origin: stagingFrontendOrigin,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
      },
    });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(stagingPreflight.status, 204, "staging preflight is answered by CORS before tenant resolution");
    // Perform the side effect or state update expressed on the following line.
    assert.equal(stagingPreflight.headers.get("access-control-allow-origin"), stagingFrontendOrigin);
    // Declare unrelatedPreflight for use by the surrounding module or function.
    const unrelatedPreflight = await call("/api/auth/login", {
      method: "OPTIONS",
      headers: {
        Origin: "https://unrelated.invalid",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
      },
    });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(unrelatedPreflight.headers.get("access-control-allow-origin"), null, "unrelated origins receive no CORS permission");

    // Declare unknownStagingLogin for use by the surrounding module or function.
    const unknownStagingLogin = await call("/api/auth/login", {
      method: "POST",
      headers: { Origin: stagingFrontendOrigin },
      body: JSON.stringify({ email: "unknown@acceptance.invalid", password: "invalid-test-password" }),
    });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(unknownStagingLogin.status, 401, "configured platform origin reaches normal credential validation");
    // Perform the side effect or state update expressed on the following line.
    assert.notEqual((await unknownStagingLogin.json()).message, "Tenant not found.");

    // Declare ownerLogin for use by the surrounding module or function.
    const ownerLogin = await call("/api/auth/login", {
      method: "POST",
      headers: { Origin: stagingFrontendOrigin },
      body: JSON.stringify({ email: owner.email, password: ownerPassword }),
    });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(ownerLogin.status, 200, "platform owner can authenticate through the public login route");
    // Declare ownerLoginData for use by the surrounding module or function.
    const ownerLoginData = await ownerLogin.json();
    // Declare ownerToken for use by the surrounding module or function.
    const ownerToken = ownerLoginData.token;
    // Perform the side effect or state update expressed on the following line.
    assert.equal(ownerLoginData.user.role, "super_admin");
    // Perform the side effect or state update expressed on the following line.
    assert.equal(ownerLoginData.user.tenantId, null, "platform login never assigns a tenant context");
    // Declare aliasOwner for use by the surrounding module or function.
    const aliasOwner = await context.runWithTenant({ role: "superadmin", bypass: true }, () => User.create({
      name: "Acceptance Alias Owner", email: "platform-alias@acceptance.invalid", phone: "0712345012",
      password: ownerPassword, role: "superadmin", legacyRole: "superadmin", roleId: roles.superadmin._id,
      tenantId: null, status: "active", isVerified: true,
    }));
    // Declare aliasOwnerLogin for use by the surrounding module or function.
    const aliasOwnerLogin = await call("/api/auth/login", {
      method: "POST",
      headers: { Origin: stagingFrontendOrigin },
      body: JSON.stringify({ email: aliasOwner.email, password: ownerPassword }),
    });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(aliasOwnerLogin.status, 200, "the superadmin role alias follows the global authentication path");
    // Declare aliasOwnerData for use by the surrounding module or function.
    const aliasOwnerData = await aliasOwnerLogin.json();
    // Perform the side effect or state update expressed on the following line.
    assert.equal(aliasOwnerData.user.role, "superadmin");
    // Perform the side effect or state update expressed on the following line.
    assert.equal(aliasOwnerData.user.tenantId, null);
    // Declare ownerMe for use by the surrounding module or function.
    const ownerMe = await call("/api/auth/me", { token: ownerToken });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(ownerMe.status, 200, "platform owner /me resolves authenticated profile");
    // Perform the side effect or state update expressed on the following line.
    assert.equal((await ownerMe.json()).user.email, owner.email);
    // Declare publicCreate for use by the surrounding module or function.
    const publicCreate = await call("/api/superadmin/tenants", { method: "POST", body: JSON.stringify(tenantInput("public")) });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(publicCreate.status, 401, "anonymous visitors cannot provision a tenant");

    // Declare firstResponse for use by the surrounding module or function.
    const firstResponse = await call("/api/superadmin/tenants", { method: "POST", token: ownerToken, body: JSON.stringify(tenantInput("a", "professional")) });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(firstResponse.status, 201);
    // Declare firstData for use by the surrounding module or function.
    const firstData = await firstResponse.json();
    // Perform the side effect or state update expressed on the following line.
    firstTenant = firstData.tenant;
    // Perform the side effect or state update expressed on the following line.
    assert.equal(firstTenant.slug, "acceptance-safaris-a");
    // Perform the side effect or state update expressed on the following line.
    assert.equal(firstData.admin.roleId.name, "admin");
    // Perform the side effect or state update expressed on the following line.
    assert.equal(String(firstData.admin.tenantId), String(firstTenant._id));
    // Declare unselectedPublicBranding for use by the surrounding module or function.
    const unselectedPublicBranding = await call("/api/tenant/branding");
    // Perform the side effect or state update expressed on the following line.
    assert.equal(unselectedPublicBranding.status, 404, "public requests do not silently select the only existing tenant");

    // Declare adminLoginResponse for use by the surrounding module or function.
    const adminLoginResponse = await call("/api/auth/login", {
      method: "POST", tenantSlug: firstTenant.slug,
      body: JSON.stringify({ email: "admin-a@acceptance.invalid", password: tenantAdminPassword }),
    });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(adminLoginResponse.status, 200);
    // Declare adminLogin for use by the surrounding module or function.
    const adminLogin = await adminLoginResponse.json();
    // Declare adminToken for use by the surrounding module or function.
    const adminToken = adminLogin.token;
    // Perform the side effect or state update expressed on the following line.
    assert.equal(adminLogin.user.role, "admin");
    // Perform the side effect or state update expressed on the following line.
    assert.equal(String(adminLogin.user.tenantId), String(firstTenant._id));
    // Declare adminMe for use by the surrounding module or function.
    const adminMe = await call("/api/auth/me", { token: adminToken });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(adminMe.status, 200, "tenant admin /me resolves authenticated profile");
    // Declare adminMeTenantId for use by the surrounding module or function.
    const adminMeTenantId = (await adminMe.json()).user.tenantId;
    // Perform the side effect or state update expressed on the following line.
    assert.equal(String(adminMeTenantId?._id || adminMeTenantId), String(firstTenant._id));

    // Declare tenantAdminProvision for use by the surrounding module or function.
    const tenantAdminProvision = await call("/api/superadmin/tenants", { method: "POST", token: adminToken, body: JSON.stringify(tenantInput("forbidden")) });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(tenantAdminProvision.status, 403, "a tenant Admin cannot provision another tenant");

    // Declare dashboard for use by the surrounding module or function.
    const dashboard = await call("/api/admin/dashboard", { token: adminToken });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(dashboard.status, 200, "the tenant Admin can reach its dashboard");
    // Declare platformTenants for use by the surrounding module or function.
    const platformTenants = await call("/api/superadmin/tenants", { token: adminToken });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(platformTenants.status, 403, "tenant Admin cannot list platform tenants");
    // Declare platformBilling for use by the surrounding module or function.
    const platformBilling = await call("/api/superadmin/billing/config", { token: adminToken });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(platformBilling.status, 403, "tenant Admin cannot access platform payment credentials");

    // Declare brandingUpdate for use by the surrounding module or function.
    const brandingUpdate = await call("/api/tenant/branding", {
      method: "PUT", token: adminToken,
      body: JSON.stringify({
        name: "Acceptance Safaris A", logoUrl: "https://images.example.invalid/acceptance.png",
        brandColors: { primary: "#123456" },
        settings: { homepageSections: { tours: true }, privateMarker: "must-not-be-public" },
      }),
    });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(brandingUpdate.status, 200);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(JSON.stringify(await brandingUpdate.json()).includes("must-not-be-public"), false);
    // Declare branding for use by the surrounding module or function.
    const branding = await call("/api/tenant/branding", { tenantSlug: firstTenant.slug });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(branding.status, 200);
    // Declare brandingPayload for use by the surrounding module or function.
    const brandingPayload = await branding.json();
    // Perform the side effect or state update expressed on the following line.
    assert.equal(brandingPayload.branding.name, "Acceptance Safaris A");
    // Perform the side effect or state update expressed on the following line.
    assert.equal(brandingPayload.branding.brandColors.primary, "#123456");
    // Perform the side effect or state update expressed on the following line.
    assert.equal(Object.hasOwn(brandingPayload.branding, "settings"), false);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(JSON.stringify(brandingPayload).includes("must-not-be-public"), false);
    // Declare publicSettings for use by the surrounding module or function.
    const publicSettings = await call("/api/settings/public", { tenantSlug: firstTenant.slug });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(publicSettings.status, 200);
    // Declare publicSettingsPayload for use by the surrounding module or function.
    const publicSettingsPayload = await publicSettings.json();
    // Perform the side effect or state update expressed on the following line.
    assert.equal(publicSettingsPayload.settings.companyName, "Acceptance Safaris A");
    // Perform the side effect or state update expressed on the following line.
    assert.equal(JSON.stringify(publicSettingsPayload).includes("must-not-be-public"), false,
      "public settings expose only an allowlist of settings data");

    // Declare destinationResponse for use by the surrounding module or function.
    const destinationResponse = await call("/api/admin/destinations", {
      method: "POST", token: adminToken,
      body: JSON.stringify({ name: "Acceptance Coast", slug: "acceptance-coast", description: "Acceptance test destination", country: "Kenya", city: "Mombasa" }),
    });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(destinationResponse.status, 201);
    // Declare destination for use by the surrounding module or function.
    const destination = (await destinationResponse.json()).destination;

    // Declare futureTourDate for use by the surrounding module or function.
    const futureTourDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    // Declare tourResponse for use by the surrounding module or function.
    const tourResponse = await call("/api/admin/tours", {
      method: "POST", token: adminToken,
      body: JSON.stringify({
        title: "Acceptance Coast Tour", description: "A disposable published tour for API acceptance.",
        destination: destination._id, country: "Kenya", location: "Mombasa",
        date: futureTourDate, startDate: futureTourDate, durationDays: 2,
        capacity: 10,
        availability: [{ date: futureTourDate, totalSlots: 10, bookedSlots: 0 }],
        availabilitySettings: { totalSlots: 10, bookedSlots: 0, waitlistEnabled: false },
        price: 25000, discountPrice: 25000, status: "upcoming", published: true, available: true,
      }),
    });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(tourResponse.status, 201);
    // Declare tour for use by the surrounding module or function.
    const tour = (await tourResponse.json()).tour;
    // Perform the side effect or state update expressed on the following line.
    assert.equal(String(tour.tenantId), String(firstTenant._id));

    // Declare operationsSummary for use by the surrounding module or function.
    const operationsSummary = await call("/api/tourmanager/copilot/summary", { token: adminToken });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(operationsSummary.status, 200, "tenant Admin can read its own Operations Copilot summary");
    // Declare operationsSummaryData for use by the surrounding module or function.
    const operationsSummaryData = (await operationsSummary.json()).data;
    // Perform the side effect or state update expressed on the following line.
    assert.ok(operationsSummaryData.trips.some((trip) => trip.id === String(tour._id)));
    // Declare quoteDraft for use by the surrounding module or function.
    const quoteDraft = await call("/api/tourmanager/copilot/quote-draft", {
      method: "POST", token: adminToken,
      body: JSON.stringify({ tourId: String(tour._id), travelerCount: 2 }),
    });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(quoteDraft.status, 200, "tenant Admin can calculate a non-persisted quote from its own tour");
    // Perform the side effect or state update expressed on the following line.
    assert.equal((await quoteDraft.json()).data.total, 50000);

    // Repeat the enclosed work for each required iteration.
    for (const invalidPackage of [
      { title: "", description: "Description", destination: "Coast", category: "Safari", duration: "2 days", basePrice: 100, agentPrice: 90 },
      { title: "Bad price", description: "Description", destination: "Coast", category: "Safari", duration: "2 days", basePrice: -1, agentPrice: 90 },
      { title: "Bad duration", description: "Description", destination: "Coast", category: "Safari", duration: "0 days", basePrice: 100, agentPrice: 90 },
      { title: "Bad status", description: "Description", destination: "Coast", category: "Safari", duration: "2 days", basePrice: 100, agentPrice: 90, status: "published" },
      { title: "Bad published", description: "Description", destination: "Coast", category: "Safari", duration: "2 days", basePrice: 100, agentPrice: 90, published: "true" },
    ]) {
      // Declare invalidResponse for use by the surrounding module or function.
      const invalidResponse = await call("/api/admin/packages", {
        method: "POST", token: adminToken, body: JSON.stringify(invalidPackage),
      });
      // Perform the side effect or state update expressed on the following line.
      assert.equal(invalidResponse.status, 400, "invalid package creation is rejected");
    }
    // Declare packageResponse for use by the surrounding module or function.
    const packageResponse = await call("/api/admin/packages", {
      method: "POST", token: adminToken,
      body: JSON.stringify({
        title: "Acceptance Safari Package", description: "A disposable acceptance safari.", destination: "Acceptance Coast",
        category: "Safari", duration: "2 days", numberOfDays: 2, basePrice: 25000, agentPrice: 22500,
        status: "draft", published: false,
      }),
    });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(packageResponse.status, 201);
    // Declare draftPackage for use by the surrounding module or function.
    const draftPackage = (await packageResponse.json()).package;
    // Declare draftCatalogue for use by the surrounding module or function.
    const draftCatalogue = await call("/api/packages", { tenantSlug: firstTenant.slug });
    // Perform the side effect or state update expressed on the following line.
    assert.equal((await draftCatalogue.json()).packages.some((item) => item._id === draftPackage._id), false);
    // Declare publishPackage for use by the surrounding module or function.
    const publishPackage = await call(`/api/admin/packages/${draftPackage._id}`, {
      method: "PUT", token: adminToken, body: JSON.stringify({ status: "active", published: true }),
    });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(publishPackage.status, 200);
    // Declare createdPackage for use by the surrounding module or function.
    const createdPackage = (await publishPackage.json()).package;

    // Declare publicCatalogue for use by the surrounding module or function.
    const publicCatalogue = await call("/api/destinations", { tenantSlug: firstTenant.slug });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(publicCatalogue.status, 200);
    // Perform the side effect or state update expressed on the following line.
    assert.ok((await publicCatalogue.json()).data.some((item) => item.slug === destination.slug));
    // Declare publicPackages for use by the surrounding module or function.
    const publicPackages = await call("/api/packages", { tenantSlug: firstTenant.slug });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(publicPackages.status, 200);
    // Perform the side effect or state update expressed on the following line.
    assert.ok((await publicPackages.json()).packages.some((item) => item._id === createdPackage._id));
    // Declare publicTours for use by the surrounding module or function.
    const publicTours = await call("/api/tours", { tenantSlug: firstTenant.slug });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(publicTours.status, 200);
    // Perform the side effect or state update expressed on the following line.
    assert.ok((await publicTours.json()).data.some((item) => item._id === tour._id));

    // Repeat the enclosed work for each required iteration.
    for (const invalidUpdate of [
      { status: "unknown" },
      { published: "true" },
      { basePrice: -1 },
      { duration: "0 days" },
      { title: "   " },
      { slug: "!!!" },
    ]) {
      // Declare invalidResponse for use by the surrounding module or function.
      const invalidResponse = await call(`/api/admin/packages/${createdPackage._id}`, {
        method: "PUT", token: adminToken, body: JSON.stringify(invalidUpdate),
      });
      // Perform the side effect or state update expressed on the following line.
      assert.equal(invalidResponse.status, 400, `invalid partial package update is rejected: ${Object.keys(invalidUpdate)[0]}`);
    }
    // Declare unchangedPackageResponse for use by the surrounding module or function.
    const unchangedPackageResponse = await call("/api/admin/packages", { token: adminToken });
    // Declare unchangedPackage for use by the surrounding module or function.
    const unchangedPackage = (await unchangedPackageResponse.json()).packages.find((item) => item._id === createdPackage._id);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(unchangedPackage.title, "Acceptance Safari Package");
    // Perform the side effect or state update expressed on the following line.
    assert.equal(unchangedPackage.basePrice, 25000);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(unchangedPackage.published, true);

    // Declare customerRegistration for use by the surrounding module or function.
    const customerRegistration = await call("/api/auth/register", {
      method: "POST", tenantSlug: firstTenant.slug,
      body: JSON.stringify({ name: "Acceptance Customer", email: "customer-a@acceptance.invalid", phone: "0712345010", password: customerPassword }),
    });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(customerRegistration.status, 201);
    // Declare tenantIdCustomerLogin for use by the surrounding module or function.
    const tenantIdCustomerLogin = await call("/api/auth/login", {
      method: "POST", headers: { "X-Tenant-ID": String(firstTenant._id) },
      body: JSON.stringify({ email: "customer-a@acceptance.invalid", password: customerPassword }),
    });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(tenantIdCustomerLogin.status, 200, "X-Tenant-ID selects the owning tenant for login");
    // Declare customerLogin for use by the surrounding module or function.
    const customerLogin = await call("/api/auth/login", {
      method: "POST", tenantSlug: firstTenant.slug,
      body: JSON.stringify({ email: "customer-a@acceptance.invalid", password: customerPassword }),
    });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(customerLogin.status, 200);
    // Declare customerLoginData for use by the surrounding module or function.
    const customerLoginData = await customerLogin.json();
    // Perform the side effect or state update expressed on the following line.
    assert.equal(customerLoginData.mfaRequired, undefined, "development MFA bypass is disabled for acceptance");
    // Perform the side effect or state update expressed on the following line.
    assert.equal(customerLoginData.devPin, undefined, "no development MFA PIN is exposed");
    // Perform the side effect or state update expressed on the following line.
    assert.equal(process.env.MFA_DEV_MODE, "false");
    // Declare customerToken for use by the surrounding module or function.
    const customerToken = customerLoginData.token;
    // Perform the side effect or state update expressed on the following line.
    assert.ok(customerToken);
    // Declare customerOperationsSummary for use by the surrounding module or function.
    const customerOperationsSummary = await call("/api/tourmanager/copilot/summary", { token: customerToken });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(customerOperationsSummary.status, 403, "customer cannot read manager-only Operations Copilot data");
    // Declare autoResolvedCustomerLogin for use by the surrounding module or function.
    const autoResolvedCustomerLogin = await call("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "customer-a@acceptance.invalid", password: customerPassword }),
    });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(autoResolvedCustomerLogin.status, 200, "a unique local customer login resolves its owning tenant when no selector is supplied");
    // Perform the side effect or state update expressed on the following line.
    assert.equal(String((await autoResolvedCustomerLogin.json()).user.tenantId), String(firstTenant._id));
    // Declare customerMe for use by the surrounding module or function.
    const customerMe = await call("/api/auth/me", { token: customerToken });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(customerMe.status, 200);
    // Declare customerUser for use by the surrounding module or function.
    const customerUser = (await customerMe.json()).user;
    // Declare tenantCustomers for use by the surrounding module or function.
    const tenantCustomers = await call("/api/admin/customers", { token: adminToken });
    // Perform the side effect or state update expressed on the following line.
    assert.ok((await tenantCustomers.json()).customers.some((item) => item._id === customerUser._id));

    // Declare bookingResponse for use by the surrounding module or function.
    const bookingResponse = await call("/api/bookings", {
      method: "POST", token: customerToken,
      body: JSON.stringify({
        tour: tour._id, travelDate: futureTourDate, numberOfGuests: 1,
        travelers: [{ name: "Acceptance Traveler", email: "traveler-a@acceptance.invalid" }],
        // Booking creation does not initiate a provider payment; use the
        // explicitly available tenant method in the fresh-tenant defaults.
        paymentMethod: "MPESA", contact: { name: "Acceptance Customer", email: "customer-a@acceptance.invalid", phone: "0712345010" },
      }),
    });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(bookingResponse.status, 201, JSON.stringify(await bookingResponse.clone().json()));
    // Declare booking for use by the surrounding module or function.
    const booking = (await bookingResponse.json()).booking;
    // Perform the side effect or state update expressed on the following line.
    assert.equal(String(booking.tenantId), String(firstTenant._id));
    // Perform the side effect or state update expressed on the following line.
    assert.equal(String(booking.user), String(customerUser._id));
    // Perform the side effect or state update expressed on the following line.
    assert.equal(booking.paymentStatus, "pending", "acceptance creates no real payment");
    // Declare bookingRetrieval for use by the surrounding module or function.
    const bookingRetrieval = await call(`/api/bookings/${booking._id}`, { token: customerToken });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(bookingRetrieval.status, 200, "customer can retrieve its own booking");
    // Perform the side effect or state update expressed on the following line.
    assert.equal((await bookingRetrieval.json()).data.booking._id, booking._id);

    // Declare tenantABookings for use by the surrounding module or function.
    const tenantABookings = await call("/api/admin/bookings", { token: adminToken });
    // Perform the side effect or state update expressed on the following line.
    assert.ok((await tenantABookings.json()).bookings.some((item) => item._id === booking._id));

    // A pending ledger fixture proves payment listing and object reads are tenant scoped
    // without contacting a payment provider or claiming a successful transaction.
    // Declare Payment for use by the surrounding module or function.
    const Payment = (await import("../models/Payment.js")).default;
    // Declare payment for use by the surrounding module or function.
    const payment = await context.runWithTenant({ tenantId: firstTenant._id, tenant: firstTenant, bypass: false }, () => Payment.create({
      tenantId: firstTenant._id, customer: customerUser._id, user: customerUser._id, booking: booking._id,
      provider: "BANK", method: "bank", paymentMethod: "BANK_TRANSFER", amount: 25000, status: "pending",
    }));
    // Declare tenantAPayments for use by the surrounding module or function.
    const tenantAPayments = await call("/api/admin/payments", { token: adminToken });
    // Perform the side effect or state update expressed on the following line.
    assert.ok((await tenantAPayments.json()).payments.some((item) => item._id === String(payment._id)));

    // Declare secondResponse for use by the surrounding module or function.
    const secondResponse = await call("/api/superadmin/tenants", { method: "POST", token: ownerToken, body: JSON.stringify(tenantInput("b", "professional")) });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(secondResponse.status, 201);
    // Perform the side effect or state update expressed on the following line.
    secondTenant = (await secondResponse.json()).tenant;

    // Declare secondCustomerRegistration for use by the surrounding module or function.
    const secondCustomerRegistration = await call("/api/auth/register", {
      method: "POST", tenantSlug: secondTenant.slug,
      body: JSON.stringify({ name: "Acceptance Customer B", email: "customer-b@acceptance.invalid", phone: "0712345011", password: customerPassword }),
    });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(secondCustomerRegistration.status, 201, "a customer can register in Tenant B");
    // Perform the side effect or state update expressed on the following line.
    await context.runWithTenant({ tenantId: secondTenant._id, tenant: secondTenant, bypass: false }, () => User.create({
      name: "Shared Email Customer B", email: "customer-a@acceptance.invalid", phone: "0712345013",
      password: customerPassword, role: "customer", legacyRole: "customer", tenantId: secondTenant._id,
      status: "active", isVerified: true,
    }));
    // Declare ambiguousTenantLogin for use by the surrounding module or function.
    const ambiguousTenantLogin = await call("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "customer-a@acceptance.invalid", password: customerPassword }),
    });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(ambiguousTenantLogin.status, 409, "a tenant user shared across companies requires an explicit tenant selection");
    // Perform the side effect or state update expressed on the following line.
    assert.equal((await ambiguousTenantLogin.json()).code, "TENANT_SELECTION_REQUIRED");
    // Declare secondCustomerLogin for use by the surrounding module or function.
    const secondCustomerLogin = await call("/api/auth/login", {
      method: "POST", tenantSlug: secondTenant.slug,
      body: JSON.stringify({ email: "customer-b@acceptance.invalid", password: customerPassword }),
    });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(secondCustomerLogin.status, 200, "Tenant B customer can authenticate in Tenant B");
    // Declare secondCustomerToken for use by the surrounding module or function.
    const secondCustomerToken = (await secondCustomerLogin.json()).token;

    // Declare unresolvedPublicTenant for use by the surrounding module or function.
    const unresolvedPublicTenant = await call("/api/tenant/branding", { tenantSlug: "not-a-real-tenant" });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(unresolvedPublicTenant.status, 404, "an invalid explicit tenant selector cannot fall back to an existing tenant");
    // Declare invalidTenantLogin for use by the surrounding module or function.
    const invalidTenantLogin = await call("/api/auth/login", {
      method: "POST", tenantSlug: "not-a-real-tenant",
      body: JSON.stringify({ email: "customer-a@acceptance.invalid", password: customerPassword }),
    });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(invalidTenantLogin.status, 404, "login rejects an invalid explicit tenant");
    // Declare mismatchedTenantIdLogin for use by the surrounding module or function.
    const mismatchedTenantIdLogin = await call("/api/auth/login", {
      method: "POST", tenantSlug: firstTenant.slug,
      headers: { "X-Tenant-ID": String(secondTenant._id) },
      body: JSON.stringify({ email: "customer-a@acceptance.invalid", password: customerPassword }),
    });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(mismatchedTenantIdLogin.status, 404, "conflicting tenant selectors are rejected");
    // Declare authenticatedWrongTenant for use by the surrounding module or function.
    const authenticatedWrongTenant = await call("/api/auth/me", { token: customerToken, tenantSlug: secondTenant.slug });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(authenticatedWrongTenant.status, 404, "an existing Tenant A JWT cannot select Tenant B");
    // Declare tenantACredentialsRejectedInTenantB for use by the surrounding module or function.
    const tenantACredentialsRejectedInTenantB = await call("/api/auth/login", {
      method: "POST", token: customerToken, tenantSlug: secondTenant.slug,
      body: JSON.stringify({ email: "admin-a@acceptance.invalid", password: tenantAdminPassword }),
    });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(tenantACredentialsRejectedInTenantB.status, 401, "Tenant A credentials cannot authenticate through Tenant B login");
    // Declare authenticatedRightTenant for use by the surrounding module or function.
    const authenticatedRightTenant = await call("/api/auth/me", { token: secondCustomerToken, tenantSlug: secondTenant.slug });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(authenticatedRightTenant.status, 200, "an existing Tenant B JWT works in Tenant B");

    // Declare forgedSelector for use by the surrounding module or function.
    const forgedSelector = await call("/api/destinations", { token: adminToken, tenantSlug: secondTenant.slug });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(forgedSelector.status, 404, "a tenant token cannot be retargeted by a forged tenant slug");

    // Declare secondAdminLogin for use by the surrounding module or function.
    const secondAdminLogin = await call("/api/auth/login", {
      method: "POST", tenantSlug: secondTenant.slug,
      body: JSON.stringify({ email: "admin-b@acceptance.invalid", password: tenantAdminPassword }),
    });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(secondAdminLogin.status, 200);
    // Declare secondAdminToken for use by the surrounding module or function.
    const secondAdminToken = (await secondAdminLogin.json()).token;
    // Declare tenantBOperationsSummary for use by the surrounding module or function.
    const tenantBOperationsSummary = await call("/api/tourmanager/copilot/summary", { token: secondAdminToken });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(tenantBOperationsSummary.status, 200);
    // Declare tenantBOperationsData for use by the surrounding module or function.
    const tenantBOperationsData = (await tenantBOperationsSummary.json()).data;
    // Perform the side effect or state update expressed on the following line.
    assert.equal(tenantBOperationsData.trips.some((trip) => trip.id === String(tour._id)), false,
      "Tenant B Operations Copilot summary does not include Tenant A tours");
    // Perform the side effect or state update expressed on the following line.
    assert.equal(JSON.stringify(tenantBOperationsData).includes("customer-a@acceptance.invalid"), false,
      "Tenant B Operations Copilot summary does not expose Tenant A booking contact data");
    // Declare crossTenantQuoteDraft for use by the surrounding module or function.
    const crossTenantQuoteDraft = await call("/api/tourmanager/copilot/quote-draft", {
      method: "POST", token: secondAdminToken,
      body: JSON.stringify({ tourId: String(tour._id), travelerCount: 2 }),
    });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(crossTenantQuoteDraft.status, 404, "Tenant B cannot build a quote from Tenant A's tour");
    // Declare crossTenantDestination for use by the surrounding module or function.
    const crossTenantDestination = await call(`/api/admin/destinations/${destination._id}`, { token: secondAdminToken });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(crossTenantDestination.status, 404, "tenant B cannot read tenant A's destination");
    // Declare crossTenantCustomerLogin for use by the surrounding module or function.
    const crossTenantCustomerLogin = await call("/api/auth/login", {
      method: "POST", tenantSlug: secondTenant.slug,
      body: JSON.stringify({ email: "customer-a@acceptance.invalid", password: customerPassword }),
    });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(crossTenantCustomerLogin.status, 401, "a customer account cannot authenticate in another tenant");
    // Declare crossTenantTour for use by the surrounding module or function.
    const crossTenantTour = await call(`/api/admin/tours/${tour._id}`, { token: secondAdminToken });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(crossTenantTour.status, 404, "tenant B cannot read tenant A's tour");
    // Declare crossTenantCustomer for use by the surrounding module or function.
    const crossTenantCustomer = await call(`/api/admin/customers/${customerUser._id}`, { token: secondAdminToken });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(crossTenantCustomer.status, 404, "tenant B cannot read tenant A's customer");
    // Declare crossTenantBooking for use by the surrounding module or function.
    const crossTenantBooking = await call(`/api/admin/bookings/${booking._id}`, { token: secondAdminToken });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(crossTenantBooking.status, 404, "tenant B cannot read tenant A's booking");
    // Declare crossTenantPackageUpdate for use by the surrounding module or function.
    const crossTenantPackageUpdate = await call(`/api/admin/packages/${createdPackage._id}`, {
      method: "PUT", token: secondAdminToken, body: JSON.stringify({ title: "Cross tenant update" }),
    });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(crossTenantPackageUpdate.status, 404, "tenant B cannot mutate a package owned by tenant A");
    // Declare crossTenantUserList for use by the surrounding module or function.
    const crossTenantUserList = await call("/api/admin/users", { token: secondAdminToken });
    // Declare userListPayload for use by the surrounding module or function.
    const userListPayload = await crossTenantUserList.json();
    // Check the condition (crossTenantUserList.status === 200) and run the matching branch.
    if (crossTenantUserList.status === 200) {
      // Perform the side effect or state update expressed on the following line.
      assert.equal(JSON.stringify(userListPayload).includes("admin-a@acceptance.invalid"), false);
    } else {
      // Perform the side effect or state update expressed on the following line.
      assert.equal(crossTenantUserList.status, 403);
      // Perform the side effect or state update expressed on the following line.
      assert.equal(userListPayload.code, "PLAN_FEATURE_LOCKED", "the starter plan blocks user management before any cross-tenant data is returned");
    }
    // Declare crossTenantUserUpdate for use by the surrounding module or function.
    const crossTenantUserUpdate = await call(`/api/admin/users/${customerUser._id}`, {
      method: "PUT", token: secondAdminToken, body: JSON.stringify({ name: "Cross tenant mutation" }),
    });
    // Check the condition (crossTenantUserUpdate.status === 403) and run the matching branch.
    if (crossTenantUserUpdate.status === 403) {
      // Perform the side effect or state update expressed on the following line.
      assert.equal((await crossTenantUserUpdate.json()).code, "PLAN_FEATURE_LOCKED");
    } else {
      // Perform the side effect or state update expressed on the following line.
      assert.equal(crossTenantUserUpdate.status, 404, "tenant B cannot mutate a user owned by tenant A");
    }
    // Declare originalCustomer for use by the surrounding module or function.
    const originalCustomer = await context.runWithTenant(
      { tenantId: firstTenant._id, tenant: firstTenant },
      () => User.findById(customerUser._id).lean(),
    );
    // Perform the side effect or state update expressed on the following line.
    assert.equal(originalCustomer.name, "Acceptance Customer", "a blocked or cross-tenant update leaves Tenant A's user unchanged");
    // Declare crossTenantMutation for use by the surrounding module or function.
    const crossTenantMutation = await call(`/api/admin/destinations/${destination._id}`, {
      method: "PUT", token: secondAdminToken,
      body: JSON.stringify({ name: "Stolen Coast" }),
    });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(crossTenantMutation.status, 404, "tenant B cannot mutate tenant A's destination");

    // Declare tenantBCatalogue for use by the surrounding module or function.
    const tenantBCatalogue = await call("/api/destinations", { tenantSlug: secondTenant.slug });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(tenantBCatalogue.status, 200);
    // Perform the side effect or state update expressed on the following line.
    assert.equal((await tenantBCatalogue.json()).data.some((item) => item.slug === destination.slug), false);
    // Declare tenantBPackages for use by the surrounding module or function.
    const tenantBPackages = await call("/api/admin/packages", { token: secondAdminToken });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(tenantBPackages.status, 200);
    // Perform the side effect or state update expressed on the following line.
    assert.equal((await tenantBPackages.json()).packages.some((item) => item._id === createdPackage._id), false);
    // Declare tenantBPublicPackages for use by the surrounding module or function.
    const tenantBPublicPackages = await call("/api/packages", { tenantSlug: secondTenant.slug });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(tenantBPublicPackages.status, 200);
    // Perform the side effect or state update expressed on the following line.
    assert.equal((await tenantBPublicPackages.json()).packages.some((item) => item._id === createdPackage._id), false);
    // Declare tenantBTours for use by the surrounding module or function.
    const tenantBTours = await call("/api/tours", { tenantSlug: secondTenant.slug });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(tenantBTours.status, 200);
    // Perform the side effect or state update expressed on the following line.
    assert.equal((await tenantBTours.json()).data.some((item) => item._id === tour._id), false);
    // Declare tenantBBranding for use by the surrounding module or function.
    const tenantBBranding = await call("/api/tenant/branding", { tenantSlug: secondTenant.slug });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(tenantBBranding.status, 200);
    // Perform the side effect or state update expressed on the following line.
    assert.notEqual((await tenantBBranding.json()).branding.name, "Acceptance Safaris A");
    // Declare tenantBSettings for use by the surrounding module or function.
    const tenantBSettings = await call("/api/settings/public", { tenantSlug: secondTenant.slug });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(tenantBSettings.status, 200);
    // Perform the side effect or state update expressed on the following line.
    assert.notEqual((await tenantBSettings.json()).settings.companyName, "Acceptance Safaris A");
    // Declare tenantBBookings for use by the surrounding module or function.
    const tenantBBookings = await call("/api/admin/bookings", { token: secondAdminToken });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(tenantBBookings.status, 200);
    // Perform the side effect or state update expressed on the following line.
    assert.equal((await tenantBBookings.json()).bookings.some((item) => item._id === booking._id), false);
    // Declare tenantBPayments for use by the surrounding module or function.
    const tenantBPayments = await call("/api/admin/payments", { token: secondAdminToken });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(tenantBPayments.status, 200);
    // Perform the side effect or state update expressed on the following line.
    assert.equal((await tenantBPayments.json()).payments.some((item) => item._id === String(payment._id)), false,
      "tenant B payment listings do not expose tenant A booking payments");
    // Declare crossTenantPayment for use by the surrounding module or function.
    const crossTenantPayment = await call(`/api/admin/payments/${payment._id}`, { token: secondAdminToken });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(crossTenantPayment.status, 404, "tenant B cannot read tenant A's payment");

    // Perform the side effect or state update expressed on the following line.
    await assert.rejects(
      context.runWithTenant({ tenantId: firstTenant._id, tenant: firstTenant, bypass: false }, () => paymentService.getTenantMpesaConfig()),
      (error) => error.status === 503 && error.code === "PAYMENT_GATEWAY_NOT_CONFIGURED",
      "missing tenant M-Pesa configuration fails safely without global credentials",
    );
  } finally {
    // Check the condition (server.listening) and run the matching branch.
    if (server.listening) await new Promise((resolve) => server.close(resolve));
    // Check the condition (mongoose.connection.readyState !== 0) and run the matching branch.
    if (mongoose.connection.readyState !== 0) {
      // Check the condition (mongoose.connection.name !== databaseName) and run the matching branch.
      if (mongoose.connection.name !== databaseName) throw new Error("Refusing to clean an unexpected first-tenant test database.");
      // Declare collections for use by the surrounding module or function.
      const collections = await mongoose.connection.db.listCollections({}, { nameOnly: true }).toArray();
      // Perform the side effect or state update expressed on the following line.
      await Promise.all(collections.map(({ name }) => mongoose.connection.db.collection(name).drop()));
    }
    // Perform the side effect or state update expressed on the following line.
    await mongoose.disconnect().catch(() => {});
  }
  // Perform the side effect or state update expressed on the following line.
  t.diagnostic("Disposable first-tenant API flow exercised; no provider payment was initiated.");
});
