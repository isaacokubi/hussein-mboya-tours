import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";

const testMongoUri = process.env.FIRST_TENANT_TEST_MONGODB_URI;

test("first tenant provisioning, tenant-admin access, public catalogue and cross-tenant denial", { skip: !testMongoUri }, async (t) => {
  process.env.MONGODB_URI = testMongoUri;
  process.env.JWT_SECRET ||= "first-tenant-ci-secret-only";
  process.env.NODE_ENV = "test";
  process.env.ALLOW_GLOBAL_MPESA_FALLBACK = "false";

  const [mongooseModule, appModule, onboarding, userModel, organizationModel, tokenModule, context, paymentService, readiness] = await Promise.all([
    import("mongoose"), import("../app.js"), import("../services/onboardingService.js"),
    import("../models/User.js"), import("../models/Organization.js"), import("../utils/generateToken.js"),
    import("../tenancy/context.js"), import("../services/paymentGatewayService.js"), import("../startup/readiness.js"),
  ]);
  const mongoose = mongooseModule.default;
  const app = appModule.default;
  const User = userModel.default;
  const Organization = organizationModel.default;
  const server = http.createServer(app);
  let owner;
  let firstTenant;
  let secondTenant;

  try {
    await mongoose.connect(testMongoUri);
    await mongoose.connection.dropDatabase();
    const roles = await onboarding.ensureSystemRoles();
    owner = await context.runWithTenant({ role: "super_admin", bypass: true }, () => User.create({
      name: "Acceptance Platform Owner", email: "platform-owner@acceptance.invalid", phone: "0712345001",
      password: "PlatformOwnerPass123", role: "super_admin", legacyRole: "super_admin", roleId: roles.superadmin._id,
      tenantId: null, status: "active", isVerified: true,
    }));
    const ownerToken = tokenModule.default({ _id: owner._id, role: "super_admin", roleId: roles.superadmin._id, email: owner.email, tenantId: null });
    readiness.setStartupPhase("ready");
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const origin = `http://127.0.0.1:${server.address().port}`;
    const call = (url, { token, tenantSlug, ...options } = {}) => fetch(`${origin}${url}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(tenantSlug ? { "X-Tenant-Slug": tenantSlug } : {}),
        ...options.headers,
      },
    });
    const tenantInput = (suffix) => ({
      companyName: `Acceptance Safaris ${suffix}`, slug: `acceptance-safaris-${suffix}`,
      companyEmail: `office-${suffix}@acceptance.invalid`, companyPhone: suffix === "a" ? "0712345002" : "0712345003",
      adminName: `Tenant Admin ${suffix.toUpperCase()}`, adminEmail: `admin-${suffix}@acceptance.invalid`,
      adminPhone: suffix === "a" ? "0712345004" : "0712345005", adminPassword: "TenantAdminPass123",
      plan: "starter", country: "Kenya", timezone: "Africa/Nairobi", currency: "KES",
    });

    const publicCreate = await call("/api/superadmin/tenants", { method: "POST", body: JSON.stringify(tenantInput("public")) });
    assert.equal(publicCreate.status, 401, "anonymous visitors cannot provision a tenant");

    const firstResponse = await call("/api/superadmin/tenants", { method: "POST", token: ownerToken, body: JSON.stringify(tenantInput("a")) });
    assert.equal(firstResponse.status, 201);
    const firstData = await firstResponse.json();
    firstTenant = firstData.tenant;
    assert.equal(firstTenant.slug, "acceptance-safaris-a");
    assert.equal(firstData.admin.roleId.name, "admin");
    assert.equal(String(firstData.admin.tenantId), String(firstTenant._id));

    const adminLoginResponse = await call("/api/auth/login", {
      method: "POST", tenantSlug: firstTenant.slug,
      body: JSON.stringify({ email: "admin-a@acceptance.invalid", password: "TenantAdminPass123" }),
    });
    assert.equal(adminLoginResponse.status, 200);
    const adminLogin = await adminLoginResponse.json();
    const adminToken = adminLogin.token;
    assert.equal(adminLogin.user.role, "admin");
    assert.equal(String(adminLogin.user.tenantId), String(firstTenant._id));

    const tenantAdminProvision = await call("/api/superadmin/tenants", { method: "POST", token: adminToken, body: JSON.stringify(tenantInput("forbidden")) });
    assert.equal(tenantAdminProvision.status, 403, "a tenant Admin cannot provision another tenant");

    const dashboard = await call("/api/admin/dashboard", { token: adminToken });
    assert.equal(dashboard.status, 200, "the tenant Admin can reach its dashboard");

    const destinationResponse = await call("/api/admin/destinations", {
      method: "POST", token: adminToken,
      body: JSON.stringify({ name: "Acceptance Coast", slug: "acceptance-coast", country: "Kenya", city: "Mombasa" }),
    });
    assert.equal(destinationResponse.status, 201);
    const destination = (await destinationResponse.json()).destination;

    const packageResponse = await call("/api/admin/packages", {
      method: "POST", token: adminToken,
      body: JSON.stringify({
        title: "Acceptance Safari Package", description: "A disposable acceptance safari.", destination: "Acceptance Coast",
        category: "Safari", duration: "2 days", numberOfDays: 2, basePrice: 25000, agentPrice: 22500,
        status: "active", published: true,
      }),
    });
    assert.equal(packageResponse.status, 201);
    const createdPackage = (await packageResponse.json()).package;

    const publicCatalogue = await call("/api/destinations", { tenantSlug: firstTenant.slug });
    assert.equal(publicCatalogue.status, 200);
    assert.ok((await publicCatalogue.json()).data.some((item) => item.slug === destination.slug));
    const publicPackages = await call("/api/packages", { tenantSlug: firstTenant.slug });
    assert.equal(publicPackages.status, 200);
    assert.ok((await publicPackages.json()).packages.some((item) => item._id === createdPackage._id));

    const secondResponse = await call("/api/superadmin/tenants", { method: "POST", token: ownerToken, body: JSON.stringify(tenantInput("b")) });
    assert.equal(secondResponse.status, 201);
    secondTenant = (await secondResponse.json()).tenant;

    const forgedSelector = await call("/api/destinations", { token: adminToken, tenantSlug: secondTenant.slug });
    assert.equal(forgedSelector.status, 404, "a tenant token cannot be retargeted by a forged tenant slug");

    const secondAdminLogin = await call("/api/auth/login", {
      method: "POST", tenantSlug: secondTenant.slug,
      body: JSON.stringify({ email: "admin-b@acceptance.invalid", password: "TenantAdminPass123" }),
    });
    assert.equal(secondAdminLogin.status, 200);
    const secondAdminToken = (await secondAdminLogin.json()).token;
    const crossTenantMutation = await call(`/api/admin/destinations/${destination._id}`, {
      method: "PUT", token: secondAdminToken,
      body: JSON.stringify({ name: "Stolen Coast" }),
    });
    assert.equal(crossTenantMutation.status, 404, "tenant B cannot mutate tenant A's destination");

    const tenantBCatalogue = await call("/api/destinations", { tenantSlug: secondTenant.slug });
    assert.equal(tenantBCatalogue.status, 200);
    assert.equal((await tenantBCatalogue.json()).data.some((item) => item.slug === destination.slug), false);
    const tenantBPackages = await call("/api/admin/packages", { token: secondAdminToken });
    assert.equal(tenantBPackages.status, 200);
    assert.equal((await tenantBPackages.json()).packages.some((item) => item._id === createdPackage._id), false);
    const tenantBPublicPackages = await call("/api/packages", { tenantSlug: secondTenant.slug });
    assert.equal(tenantBPublicPackages.status, 200);
    assert.equal((await tenantBPublicPackages.json()).packages.some((item) => item._id === createdPackage._id), false);

    await assert.rejects(
      context.runWithTenant({ tenantId: firstTenant._id, tenant: firstTenant, bypass: false }, () => paymentService.getTenantMpesaConfig()),
      (error) => error.status === 503 && error.code === "PAYMENT_GATEWAY_NOT_CONFIGURED",
      "missing tenant M-Pesa configuration fails safely without global credentials",
    );
  } finally {
    if (server.listening) await new Promise((resolve) => server.close(resolve));
    if (mongoose.connection.readyState !== 0) await mongoose.connection.dropDatabase().catch(() => {});
    await mongoose.disconnect().catch(() => {});
  }
  t.diagnostic("Disposable first-tenant API flow exercised; no provider payment was initiated.");
});
