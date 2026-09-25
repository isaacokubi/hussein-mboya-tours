import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { randomBytes } from "node:crypto";

const testMongoUri = process.env.FIRST_TENANT_TEST_MONGODB_URI;

const isolatedTestDatabaseUri = (baseUri) => {
  const uri = new URL(baseUri);
  const sourceDatabase = decodeURIComponent(uri.pathname.replace(/^\//, ""));
  if (sourceDatabase !== "global_tours_test") {
    throw new Error("FIRST_TENANT_TEST_MONGODB_URI must use global_tours_test as its Atlas source connection.");
  }
  const databaseName = `fta_${process.pid}_${randomBytes(8).toString("hex")}`;
  uri.pathname = `/${databaseName}`;
  return { uri: uri.toString(), databaseName };
};

test("first tenant provisioning, tenant-admin access, public catalogue and cross-tenant denial", { skip: !testMongoUri }, async (t) => {
  const { uri: isolatedUri, databaseName } = isolatedTestDatabaseUri(testMongoUri);
  if (!/^fta_[0-9]+_[a-f0-9]{16}$/.test(databaseName)) throw new Error("Unsafe first-tenant test database name.");
  process.env.MONGODB_URI = isolatedUri;
  process.env.JWT_SECRET ||= "first-tenant-ci-secret-only";
  process.env.NODE_ENV = "test";
  process.env.ALLOW_GLOBAL_MPESA_FALLBACK = "false";
  process.env.ALLOW_SINGLE_TENANT_DEV_FALLBACK = "false";
  process.env.DEFAULT_PUBLIC_TENANT_SLUG = "";
  process.env.PUBLIC_TENANT_SLUG = "";
  process.env.MFA_DEV_MODE = "false";
  process.env.MFA_ENABLED = "false";
  assert.equal(process.env.ALLOW_GLOBAL_MPESA_FALLBACK, "false");
  assert.equal(process.env.ALLOW_SINGLE_TENANT_DEV_FALLBACK, "false");
  assert.equal(process.env.MFA_DEV_MODE, "false");

  const mongooseModule = await import("mongoose");
  const mongoose = mongooseModule.default;
  // Keep unrelated model auto-indexing from materializing hundreds of collections
  // in a fresh Atlas database. The acceptance flow exercises provisioning and
  // tenant isolation; it does not certify every model index.
  mongoose.set("autoIndex", false);
  const [appModule, onboarding, userModel, organizationModel, context, paymentService, readiness] = await Promise.all([
    import("../app.js"), import("../services/onboardingService.js"),
    import("../models/User.js"), import("../models/Organization.js"),
    import("../tenancy/context.js"), import("../services/paymentGatewayService.js"), import("../startup/readiness.js"),
  ]);
  const app = appModule.default;
  const { assertSupportedMongoVersion } = await import("../utils/mongodbVersion.js");
  const User = userModel.default;
  const Organization = organizationModel.default;
  const server = http.createServer(app);
  let owner;
  let firstTenant;
  let secondTenant;
  const ownerPassword = `Platform-${randomBytes(24).toString("hex")}1A`;
  const tenantAdminPassword = `Tenant-${randomBytes(24).toString("hex")}1A`;
  const customerPassword = `Customer-${randomBytes(24).toString("hex")}1A`;

  try {
    await mongoose.connect(isolatedUri);
    const buildInfo = await mongoose.connection.db.admin().command({ buildInfo: 1 });
    assertSupportedMongoVersion(buildInfo.version);
    const roles = await onboarding.ensureSystemRoles();
    owner = await context.runWithTenant({ role: "super_admin", bypass: true }, () => User.create({
      name: "Acceptance Platform Owner", email: "platform-owner@acceptance.invalid", phone: "0712345001",
      password: ownerPassword, role: "super_admin", legacyRole: "super_admin", roleId: roles.superadmin._id,
      tenantId: null, status: "active", isVerified: true,
    }));
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
      adminPhone: suffix === "a" ? "0712345004" : "0712345005", adminPassword: tenantAdminPassword,
      plan: "starter", country: "Kenya", timezone: "Africa/Nairobi", currency: "KES",
    });

    const ownerLogin = await call("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: owner.email, password: ownerPassword }),
    });
    assert.equal(ownerLogin.status, 200, "platform owner can authenticate through the public login route");
    const ownerLoginData = await ownerLogin.json();
    const ownerToken = ownerLoginData.token;
    assert.equal(ownerLoginData.user.role, "super_admin");
    const ownerMe = await call("/api/auth/me", { token: ownerToken });
    assert.equal(ownerMe.status, 200, "platform owner /me resolves authenticated profile");
    assert.equal((await ownerMe.json()).user.email, owner.email);
    const publicCreate = await call("/api/superadmin/tenants", { method: "POST", body: JSON.stringify(tenantInput("public")) });
    assert.equal(publicCreate.status, 401, "anonymous visitors cannot provision a tenant");

    const firstResponse = await call("/api/superadmin/tenants", { method: "POST", token: ownerToken, body: JSON.stringify(tenantInput("a")) });
    assert.equal(firstResponse.status, 201);
    const firstData = await firstResponse.json();
    firstTenant = firstData.tenant;
    assert.equal(firstTenant.slug, "acceptance-safaris-a");
    assert.equal(firstData.admin.roleId.name, "admin");
    assert.equal(String(firstData.admin.tenantId), String(firstTenant._id));
    const unselectedPublicBranding = await call("/api/tenant/branding");
    assert.equal(unselectedPublicBranding.status, 404, "public requests do not silently select the only existing tenant");

    const adminLoginResponse = await call("/api/auth/login", {
      method: "POST", tenantSlug: firstTenant.slug,
      body: JSON.stringify({ email: "admin-a@acceptance.invalid", password: tenantAdminPassword }),
    });
    assert.equal(adminLoginResponse.status, 200);
    const adminLogin = await adminLoginResponse.json();
    const adminToken = adminLogin.token;
    assert.equal(adminLogin.user.role, "admin");
    assert.equal(String(adminLogin.user.tenantId), String(firstTenant._id));
    const adminMe = await call("/api/auth/me", { token: adminToken });
    assert.equal(adminMe.status, 200, "tenant admin /me resolves authenticated profile");
    const adminMeTenantId = (await adminMe.json()).user.tenantId;
    assert.equal(String(adminMeTenantId?._id || adminMeTenantId), String(firstTenant._id));

    const tenantAdminProvision = await call("/api/superadmin/tenants", { method: "POST", token: adminToken, body: JSON.stringify(tenantInput("forbidden")) });
    assert.equal(tenantAdminProvision.status, 403, "a tenant Admin cannot provision another tenant");

    const dashboard = await call("/api/admin/dashboard", { token: adminToken });
    assert.equal(dashboard.status, 200, "the tenant Admin can reach its dashboard");
    const platformTenants = await call("/api/superadmin/tenants", { token: adminToken });
    assert.equal(platformTenants.status, 403, "tenant Admin cannot list platform tenants");
    const platformBilling = await call("/api/superadmin/billing/config", { token: adminToken });
    assert.equal(platformBilling.status, 403, "tenant Admin cannot access platform payment credentials");

    const brandingUpdate = await call("/api/tenant/branding", {
      method: "PUT", token: adminToken,
      body: JSON.stringify({
        name: "Acceptance Safaris A", logoUrl: "https://images.example.invalid/acceptance.png",
        brandColors: { primary: "#123456" },
        settings: { homepageSections: { tours: true }, privateMarker: "must-not-be-public" },
      }),
    });
    assert.equal(brandingUpdate.status, 200);
    assert.equal(JSON.stringify(await brandingUpdate.json()).includes("must-not-be-public"), false);
    const branding = await call("/api/tenant/branding", { tenantSlug: firstTenant.slug });
    assert.equal(branding.status, 200);
    const brandingPayload = await branding.json();
    assert.equal(brandingPayload.branding.name, "Acceptance Safaris A");
    assert.equal(brandingPayload.branding.brandColors.primary, "#123456");
    assert.equal(Object.hasOwn(brandingPayload.branding, "settings"), false);
    assert.equal(JSON.stringify(brandingPayload).includes("must-not-be-public"), false);
    const publicSettings = await call("/api/settings/public", { tenantSlug: firstTenant.slug });
    assert.equal(publicSettings.status, 200);
    const publicSettingsPayload = await publicSettings.json();
    assert.equal(publicSettingsPayload.settings.companyName, "Acceptance Safaris A");
    assert.equal(JSON.stringify(publicSettingsPayload).includes("must-not-be-public"), false,
      "public settings expose only an allowlist of settings data");

    const destinationResponse = await call("/api/admin/destinations", {
      method: "POST", token: adminToken,
      body: JSON.stringify({ name: "Acceptance Coast", slug: "acceptance-coast", description: "Acceptance test destination", country: "Kenya", city: "Mombasa" }),
    });
    assert.equal(destinationResponse.status, 201);
    const destination = (await destinationResponse.json()).destination;

    const futureTourDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const tourResponse = await call("/api/admin/tours", {
      method: "POST", token: adminToken,
      body: JSON.stringify({
        title: "Acceptance Coast Tour", description: "A disposable published tour for API acceptance.",
        destination: destination._id, country: "Kenya", location: "Mombasa",
        date: futureTourDate, startDate: futureTourDate, durationDays: 2,
        capacity: 10,
        availabilitySettings: { totalSlots: 10, bookedSlots: 0, waitlistEnabled: false },
        price: 25000, discountPrice: 25000, status: "upcoming", published: true, available: true,
      }),
    });
    assert.equal(tourResponse.status, 201);
    const tour = (await tourResponse.json()).tour;
    assert.equal(String(tour.tenantId), String(firstTenant._id));

    for (const invalidPackage of [
      { title: "", description: "Description", destination: "Coast", category: "Safari", duration: "2 days", basePrice: 100, agentPrice: 90 },
      { title: "Bad price", description: "Description", destination: "Coast", category: "Safari", duration: "2 days", basePrice: -1, agentPrice: 90 },
      { title: "Bad duration", description: "Description", destination: "Coast", category: "Safari", duration: "0 days", basePrice: 100, agentPrice: 90 },
      { title: "Bad status", description: "Description", destination: "Coast", category: "Safari", duration: "2 days", basePrice: 100, agentPrice: 90, status: "published" },
      { title: "Bad published", description: "Description", destination: "Coast", category: "Safari", duration: "2 days", basePrice: 100, agentPrice: 90, published: "true" },
    ]) {
      const invalidResponse = await call("/api/admin/packages", {
        method: "POST", token: adminToken, body: JSON.stringify(invalidPackage),
      });
      assert.equal(invalidResponse.status, 400, "invalid package creation is rejected");
    }
    const packageResponse = await call("/api/admin/packages", {
      method: "POST", token: adminToken,
      body: JSON.stringify({
        title: "Acceptance Safari Package", description: "A disposable acceptance safari.", destination: "Acceptance Coast",
        category: "Safari", duration: "2 days", numberOfDays: 2, basePrice: 25000, agentPrice: 22500,
        status: "draft", published: false,
      }),
    });
    assert.equal(packageResponse.status, 201);
    const draftPackage = (await packageResponse.json()).package;
    const draftCatalogue = await call("/api/packages", { tenantSlug: firstTenant.slug });
    assert.equal((await draftCatalogue.json()).packages.some((item) => item._id === draftPackage._id), false);
    const publishPackage = await call(`/api/admin/packages/${draftPackage._id}`, {
      method: "PUT", token: adminToken, body: JSON.stringify({ status: "active", published: true }),
    });
    assert.equal(publishPackage.status, 200);
    const createdPackage = (await publishPackage.json()).package;

    const publicCatalogue = await call("/api/destinations", { tenantSlug: firstTenant.slug });
    assert.equal(publicCatalogue.status, 200);
    assert.ok((await publicCatalogue.json()).data.some((item) => item.slug === destination.slug));
    const publicPackages = await call("/api/packages", { tenantSlug: firstTenant.slug });
    assert.equal(publicPackages.status, 200);
    assert.ok((await publicPackages.json()).packages.some((item) => item._id === createdPackage._id));
    const publicTours = await call("/api/tours", { tenantSlug: firstTenant.slug });
    assert.equal(publicTours.status, 200);
    assert.ok((await publicTours.json()).data.some((item) => item._id === tour._id));

    for (const invalidUpdate of [
      { status: "unknown" },
      { published: "true" },
      { basePrice: -1 },
      { duration: "0 days" },
      { title: "   " },
      { slug: "!!!" },
    ]) {
      const invalidResponse = await call(`/api/admin/packages/${createdPackage._id}`, {
        method: "PUT", token: adminToken, body: JSON.stringify(invalidUpdate),
      });
      assert.equal(invalidResponse.status, 400, `invalid partial package update is rejected: ${Object.keys(invalidUpdate)[0]}`);
    }
    const unchangedPackageResponse = await call("/api/admin/packages", { token: adminToken });
    const unchangedPackage = (await unchangedPackageResponse.json()).packages.find((item) => item._id === createdPackage._id);
    assert.equal(unchangedPackage.title, "Acceptance Safari Package");
    assert.equal(unchangedPackage.basePrice, 25000);
    assert.equal(unchangedPackage.published, true);

    const customerRegistration = await call("/api/auth/register", {
      method: "POST", tenantSlug: firstTenant.slug,
      body: JSON.stringify({ name: "Acceptance Customer", email: "customer-a@acceptance.invalid", phone: "0712345010", password: customerPassword }),
    });
    assert.equal(customerRegistration.status, 201);
    const tenantIdCustomerLogin = await call("/api/auth/login", {
      method: "POST", headers: { "X-Tenant-ID": String(firstTenant._id) },
      body: JSON.stringify({ email: "customer-a@acceptance.invalid", password: customerPassword }),
    });
    assert.equal(tenantIdCustomerLogin.status, 200, "X-Tenant-ID selects the owning tenant for login");
    const customerLogin = await call("/api/auth/login", {
      method: "POST", tenantSlug: firstTenant.slug,
      body: JSON.stringify({ email: "customer-a@acceptance.invalid", password: customerPassword }),
    });
    assert.equal(customerLogin.status, 200);
    const customerLoginData = await customerLogin.json();
    assert.equal(customerLoginData.mfaRequired, undefined, "development MFA bypass is disabled for acceptance");
    assert.equal(customerLoginData.devPin, undefined, "no development MFA PIN is exposed");
    assert.equal(process.env.MFA_DEV_MODE, "false");
    const customerToken = customerLoginData.token;
    assert.ok(customerToken);
    const autoResolvedCustomerLogin = await call("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "customer-a@acceptance.invalid", password: customerPassword }),
    });
    assert.equal(autoResolvedCustomerLogin.status, 200, "a unique local customer login resolves its owning tenant when no selector is supplied");
    assert.equal(String((await autoResolvedCustomerLogin.json()).user.tenantId), String(firstTenant._id));
    const customerMe = await call("/api/auth/me", { token: customerToken });
    assert.equal(customerMe.status, 200);
    const customerUser = (await customerMe.json()).user;
    const tenantCustomers = await call("/api/admin/customers", { token: adminToken });
    assert.ok((await tenantCustomers.json()).customers.some((item) => item._id === customerUser._id));

    const bookingResponse = await call("/api/bookings", {
      method: "POST", token: customerToken,
      body: JSON.stringify({
        tour: tour._id, travelDate: futureTourDate, numberOfGuests: 1,
        travelers: [{ name: "Acceptance Traveler", email: "traveler-a@acceptance.invalid" }],
        paymentMethod: "BANK_TRANSFER", contact: { name: "Acceptance Customer", email: "customer-a@acceptance.invalid", phone: "0712345010" },
      }),
    });
    assert.equal(bookingResponse.status, 201, JSON.stringify(await bookingResponse.clone().json()));
    const booking = (await bookingResponse.json()).booking;
    assert.equal(String(booking.tenantId), String(firstTenant._id));
    assert.equal(String(booking.user), String(customerUser._id));
    assert.equal(booking.paymentStatus, "pending", "acceptance creates no real payment");
    const bookingRetrieval = await call(`/api/bookings/${booking._id}`, { token: customerToken });
    assert.equal(bookingRetrieval.status, 200, "customer can retrieve its own booking");
    assert.equal((await bookingRetrieval.json()).data.booking._id, booking._id);

    const tenantABookings = await call("/api/admin/bookings", { token: adminToken });
    assert.ok((await tenantABookings.json()).bookings.some((item) => item._id === booking._id));

    // A pending ledger fixture proves payment listing and object reads are tenant scoped
    // without contacting a payment provider or claiming a successful transaction.
    const Payment = (await import("../models/Payment.js")).default;
    const payment = await context.runWithTenant({ tenantId: firstTenant._id, tenant: firstTenant, bypass: false }, () => Payment.create({
      tenantId: firstTenant._id, customer: customerUser._id, user: customerUser._id, booking: booking._id,
      provider: "BANK", method: "bank", paymentMethod: "BANK_TRANSFER", amount: 25000, status: "pending",
    }));
    const tenantAPayments = await call("/api/admin/payments", { token: adminToken });
    assert.ok((await tenantAPayments.json()).payments.some((item) => item._id === String(payment._id)));

    const secondResponse = await call("/api/superadmin/tenants", { method: "POST", token: ownerToken, body: JSON.stringify(tenantInput("b")) });
    assert.equal(secondResponse.status, 201);
    secondTenant = (await secondResponse.json()).tenant;

    const secondCustomerRegistration = await call("/api/auth/register", {
      method: "POST", tenantSlug: secondTenant.slug,
      body: JSON.stringify({ name: "Acceptance Customer B", email: "customer-b@acceptance.invalid", phone: "0712345011", password: customerPassword }),
    });
    assert.equal(secondCustomerRegistration.status, 201, "a customer can register in Tenant B");
    const secondCustomerLogin = await call("/api/auth/login", {
      method: "POST", tenantSlug: secondTenant.slug,
      body: JSON.stringify({ email: "customer-b@acceptance.invalid", password: customerPassword }),
    });
    assert.equal(secondCustomerLogin.status, 200, "Tenant B customer can authenticate in Tenant B");
    const secondCustomerToken = (await secondCustomerLogin.json()).token;

    const unresolvedPublicTenant = await call("/api/tenant/branding", { tenantSlug: "not-a-real-tenant" });
    assert.equal(unresolvedPublicTenant.status, 404, "an invalid explicit tenant selector cannot fall back to an existing tenant");
    const invalidTenantLogin = await call("/api/auth/login", {
      method: "POST", tenantSlug: "not-a-real-tenant",
      body: JSON.stringify({ email: "customer-a@acceptance.invalid", password: customerPassword }),
    });
    assert.equal(invalidTenantLogin.status, 404, "login rejects an invalid explicit tenant");
    const mismatchedTenantIdLogin = await call("/api/auth/login", {
      method: "POST", tenantSlug: firstTenant.slug,
      headers: { "X-Tenant-ID": String(secondTenant._id) },
      body: JSON.stringify({ email: "customer-a@acceptance.invalid", password: customerPassword }),
    });
    assert.equal(mismatchedTenantIdLogin.status, 404, "conflicting tenant selectors are rejected");
    const authenticatedWrongTenant = await call("/api/auth/me", { token: customerToken, tenantSlug: secondTenant.slug });
    assert.equal(authenticatedWrongTenant.status, 404, "an existing Tenant A JWT cannot select Tenant B");
    const jwtCannotSelectOtherTenantDuringLogin = await call("/api/auth/login", {
      method: "POST", token: customerToken, tenantSlug: secondTenant.slug,
      body: JSON.stringify({ email: "customer-a@acceptance.invalid", password: customerPassword }),
    });
    assert.equal(jwtCannotSelectOtherTenantDuringLogin.status, 404, "a Tenant A JWT cannot bypass Tenant B selection during login");
    const authenticatedRightTenant = await call("/api/auth/me", { token: secondCustomerToken, tenantSlug: secondTenant.slug });
    assert.equal(authenticatedRightTenant.status, 200, "an existing Tenant B JWT works in Tenant B");

    const forgedSelector = await call("/api/destinations", { token: adminToken, tenantSlug: secondTenant.slug });
    assert.equal(forgedSelector.status, 404, "a tenant token cannot be retargeted by a forged tenant slug");

    const secondAdminLogin = await call("/api/auth/login", {
      method: "POST", tenantSlug: secondTenant.slug,
      body: JSON.stringify({ email: "admin-b@acceptance.invalid", password: tenantAdminPassword }),
    });
    assert.equal(secondAdminLogin.status, 200);
    const secondAdminToken = (await secondAdminLogin.json()).token;
    const crossTenantDestination = await call(`/api/admin/destinations/${destination._id}`, { token: secondAdminToken });
    assert.equal(crossTenantDestination.status, 404, "tenant B cannot read tenant A's destination");
    const crossTenantCustomerLogin = await call("/api/auth/login", {
      method: "POST", tenantSlug: secondTenant.slug,
      body: JSON.stringify({ email: "customer-a@acceptance.invalid", password: customerPassword }),
    });
    assert.equal(crossTenantCustomerLogin.status, 401, "a customer account cannot authenticate in another tenant");
    const crossTenantTour = await call(`/api/admin/tours/${tour._id}`, { token: secondAdminToken });
    assert.equal(crossTenantTour.status, 404, "tenant B cannot read tenant A's tour");
    const crossTenantCustomer = await call(`/api/admin/customers/${customerUser._id}`, { token: secondAdminToken });
    assert.equal(crossTenantCustomer.status, 404, "tenant B cannot read tenant A's customer");
    const crossTenantBooking = await call(`/api/admin/bookings/${booking._id}`, { token: secondAdminToken });
    assert.equal(crossTenantBooking.status, 404, "tenant B cannot read tenant A's booking");
    const crossTenantPackageUpdate = await call(`/api/admin/packages/${createdPackage._id}`, {
      method: "PUT", token: secondAdminToken, body: JSON.stringify({ title: "Cross tenant update" }),
    });
    assert.equal(crossTenantPackageUpdate.status, 404, "tenant B cannot mutate a package owned by tenant A");
    const crossTenantUserList = await call("/api/admin/users", { token: secondAdminToken });
    const userListPayload = await crossTenantUserList.json();
    if (crossTenantUserList.status === 200) {
      assert.equal(JSON.stringify(userListPayload).includes("admin-a@acceptance.invalid"), false);
    } else {
      assert.equal(crossTenantUserList.status, 403);
      assert.equal(userListPayload.code, "PLAN_FEATURE_LOCKED", "the starter plan blocks user management before any cross-tenant data is returned");
    }
    const crossTenantUserUpdate = await call(`/api/admin/users/${customerUser._id}`, {
      method: "PUT", token: secondAdminToken, body: JSON.stringify({ name: "Cross tenant mutation" }),
    });
    if (crossTenantUserUpdate.status === 403) {
      assert.equal((await crossTenantUserUpdate.json()).code, "PLAN_FEATURE_LOCKED");
    } else {
      assert.equal(crossTenantUserUpdate.status, 404, "tenant B cannot mutate a user owned by tenant A");
    }
    const originalCustomer = await context.runWithTenant(
      { tenantId: firstTenant._id, tenant: firstTenant },
      () => User.findById(customerUser._id).lean(),
    );
    assert.equal(originalCustomer.name, "Acceptance Customer", "a blocked or cross-tenant update leaves Tenant A's user unchanged");
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
    const tenantBTours = await call("/api/tours", { tenantSlug: secondTenant.slug });
    assert.equal(tenantBTours.status, 200);
    assert.equal((await tenantBTours.json()).data.some((item) => item._id === tour._id), false);
    const tenantBBranding = await call("/api/tenant/branding", { tenantSlug: secondTenant.slug });
    assert.equal(tenantBBranding.status, 200);
    assert.notEqual((await tenantBBranding.json()).branding.name, "Acceptance Safaris A");
    const tenantBSettings = await call("/api/settings/public", { tenantSlug: secondTenant.slug });
    assert.equal(tenantBSettings.status, 200);
    assert.notEqual((await tenantBSettings.json()).settings.companyName, "Acceptance Safaris A");
    const tenantBBookings = await call("/api/admin/bookings", { token: secondAdminToken });
    assert.equal(tenantBBookings.status, 200);
    assert.equal((await tenantBBookings.json()).bookings.some((item) => item._id === booking._id), false);
    const tenantBPayments = await call("/api/admin/payments", { token: secondAdminToken });
    assert.equal(tenantBPayments.status, 200);
    assert.equal((await tenantBPayments.json()).payments.some((item) => item._id === String(payment._id)), false,
      "tenant B payment listings do not expose tenant A booking payments");
    const crossTenantPayment = await call(`/api/admin/payments/${payment._id}`, { token: secondAdminToken });
    assert.equal(crossTenantPayment.status, 404, "tenant B cannot read tenant A's payment");

    await assert.rejects(
      context.runWithTenant({ tenantId: firstTenant._id, tenant: firstTenant, bypass: false }, () => paymentService.getTenantMpesaConfig()),
      (error) => error.status === 503 && error.code === "PAYMENT_GATEWAY_NOT_CONFIGURED",
      "missing tenant M-Pesa configuration fails safely without global credentials",
    );
  } finally {
    if (server.listening) await new Promise((resolve) => server.close(resolve));
    if (mongoose.connection.readyState !== 0) {
      if (mongoose.connection.name !== databaseName) throw new Error("Refusing to clean an unexpected first-tenant test database.");
      const collections = await mongoose.connection.db.listCollections({}, { nameOnly: true }).toArray();
      await Promise.all(collections.map(({ name }) => mongoose.connection.db.collection(name).drop()));
    }
    await mongoose.disconnect().catch(() => {});
  }
  t.diagnostic("Disposable first-tenant API flow exercised; no provider payment was initiated.");
});
