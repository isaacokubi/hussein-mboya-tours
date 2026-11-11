/**
 * Purpose: super Admin Tenant Mpesa.test automated test. Main declarations: read, query, response, makeController, run.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import assert from "node:assert/strict";
// Load node:fs so this module can use its exported dependencies.
import fs from "node:fs";
// Load node:path so this module can use its exported dependencies.
import path from "node:path";
// Load node:test so this module can use its exported dependencies.
import test from "node:test";
// Load node:url so this module can use its exported dependencies.
import { fileURLToPath } from "node:url";
// Load ../controllers/superAdminMpesaGatewayController.js so this module can use its exported dependencies.
import { createSuperAdminMpesaGatewayController } from "../controllers/superAdminMpesaGatewayController.js";
// Load ../middleware/superAdminOnly.js so this module can use its exported dependencies.
import { superAdminOnly } from "../middleware/superAdminOnly.js";
// Load ../services/mpesaGatewaySettings.js so this module can use its exported dependencies.
import { safeMpesaGatewayView, validateMpesaGatewaySettings } from "../services/mpesaGatewaySettings.js";

// Declare root for use by the surrounding module or function.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// Declare read for use by the surrounding module or function.
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
// Declare tenantId for use by the surrounding module or function.
const tenantId = "507f1f77bcf86cd799439011";

// Declare query for use by the surrounding module or function.
const query = (value) => ({ select: () => ({ lean: async () => value }), lean: async () => value });
// Declare response for use by the surrounding module or function.
const response = () => ({ statusCode: 200, body: null, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } });

// Perform the side effect or state update expressed on the following line.
test("Platform Admin gateway API is mounted behind authentication and Super Admin authorization", () => {
  // Declare routes for use by the surrounding module or function.
  const routes = read("routes/superAdminRoutes.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(routes, /router\.use\(protect, superAdminOnly\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(routes, /router\.get\("\/tenants\/:tenantId\/mpesa", getSuperAdminTenantMpesa\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(routes, /router\.put\("\/tenants\/:tenantId\/mpesa", saveSuperAdminTenantMpesa\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(routes, /router\.delete\("\/tenants\/:tenantId\/mpesa", disableSuperAdminTenantMpesa\)/);
});

// Perform the side effect or state update expressed on the following line.
test("the server-side guard rejects tenant admins and permits platform admins", () => {
  // Declare denied for use by the surrounding module or function.
  const denied = response();
  // Declare continued for use by the surrounding module or function.
  let continued = false;
  // Perform the side effect or state update expressed on the following line.
  superAdminOnly({ user: { legacyRole: "admin" } }, denied, () => { continued = true; });
  // Perform the side effect or state update expressed on the following line.
  assert.equal(denied.statusCode, 403);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(continued, false);
  // Declare allowed for use by the surrounding module or function.
  const allowed = response();
  // Perform the side effect or state update expressed on the following line.
  superAdminOnly({ user: { legacyRole: "super_admin" } }, allowed, () => { continued = true; });
  // Perform the side effect or state update expressed on the following line.
  assert.equal(continued, true);
});

// Perform the side effect or state update expressed on the following line.
test("tenant selection is validated and gateway reads/writes include the selected tenant ID", async () => {
  // Declare filters for use by the surrounding module or function.
  const filters = [];
  // Declare savedUpdate for use by the surrounding module or function.
  let savedUpdate;
  // Declare organization for use by the surrounding module or function.
  const organization = { _id: tenantId, name: "Tenant A", slug: "tenant-a" };
  // Declare organizations for use by the surrounding module or function.
  const organizations = { findById: (id) => { assert.equal(String(id), tenantId); return query(organization); } };
  // Declare gateways for use by the surrounding module or function.
  const gateways = {
    findOne: (filter) => { filters.push(filter); return query(null); },
    findOneAndUpdate: (filter, update) => { filters.push(filter); savedUpdate = update; return query({ ...filter, environment: "sandbox", enabled: false, consumerKeyEncrypted: update.$set.consumerKeyEncrypted, consumerSecretEncrypted: update.$set.consumerSecretEncrypted, passkeyEncrypted: update.$set.passkeyEncrypted }); },
  };
  // Declare controller for use by the surrounding module or function.
  const controller = createSuperAdminMpesaGatewayController({ organizations, gateways, tenantScope: (_context, callback) => callback(), validateSettings: () => null, encrypt: (value) => `encrypted:${value}` });
  // Declare res for use by the surrounding module or function.
  const res = response();
  // Perform the side effect or state update expressed on the following line.
  await controller.save({ params: { tenantId }, body: { environment: "sandbox", enabled: false, callbackUrl: "https://stage.example.com/api/mpesa/callback", shortcode: "123456", consumerKey: "key", consumerSecret: "secret", passkey: "pass" }, user: { _id: "admin-id" } }, res, (error) => { throw error; });
  // Perform the side effect or state update expressed on the following line.
  assert.equal(res.statusCode, 200);
  // Perform the side effect or state update expressed on the following line.
  assert.ok(filters.length >= 2);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(savedUpdate.$set.sandboxConsumerKeyEncrypted, "encrypted:key");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(savedUpdate.$set.sandboxConsumerSecretEncrypted, "encrypted:secret");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(savedUpdate.$set.sandboxPasskeyEncrypted, "encrypted:pass");
  // Perform the side effect or state update expressed on the following line.
  assert.equal("consumerKey" in savedUpdate.$set, false);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(JSON.stringify(res.body).includes("encrypted:key"), false);
  // Repeat the enclosed work for each required iteration.
  for (const filter of filters) {
    // Perform the side effect or state update expressed on the following line.
    assert.equal(String(filter.tenantId), tenantId);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(filter.provider, "MPESA");
  }

  // Declare invalidOrganizations for use by the surrounding module or function.
  const invalidOrganizations = { findById: () => query(null) };
  // Declare missingController for use by the surrounding module or function.
  const missingController = createSuperAdminMpesaGatewayController({ organizations: invalidOrganizations, gateways, tenantScope: (_context, callback) => callback() });
  // Declare missing for use by the surrounding module or function.
  const missing = response();
  // Perform the side effect or state update expressed on the following line.
  await missingController.get({ params: { tenantId } }, missing, (error) => { throw error; });
  // Perform the side effect or state update expressed on the following line.
  assert.equal(missing.statusCode, 404);
  // Declare platformOrganization for use by the surrounding module or function.
  const platformOrganization = { findById: () => query({ _id: tenantId, name: "Platform", slug: "platform", isSystem: true }) };
  // Declare platformController for use by the surrounding module or function.
  const platformController = createSuperAdminMpesaGatewayController({ organizations: platformOrganization, gateways, tenantScope: (_context, callback) => callback() });
  // Declare excluded for use by the surrounding module or function.
  const excluded = response();
  // Perform the side effect or state update expressed on the following line.
  await platformController.get({ params: { tenantId } }, excluded, (error) => { throw error; });
  // Perform the side effect or state update expressed on the following line.
  assert.equal(excluded.statusCode, 404);
  // Declare platformSettingsController for use by the surrounding module or function.
  const platformSettingsController = createSuperAdminMpesaGatewayController({ organizations: { findById: () => query({ _id: tenantId, name: "Platform", slug: "platform-org", settings: { isPlatform: true } }) }, gateways, tenantScope: (_context, callback) => callback() });
  // Declare platformSettings for use by the surrounding module or function.
  const platformSettings = response();
  // Perform the side effect or state update expressed on the following line.
  await platformSettingsController.get({ params: { tenantId } }, platformSettings, (error) => { throw error; });
  // Perform the side effect or state update expressed on the following line.
  assert.equal(platformSettings.statusCode, 404);
});

// Perform the side effect or state update expressed on the following line.
test("an enabled gateway cannot be saved without all required tenant credentials", async () => {
  // Declare organizations for use by the surrounding module or function.
  const organizations = { findById: () => query({ _id: tenantId, name: "Tenant A", slug: "tenant-a" }) };
  // Declare persisted for use by the surrounding module or function.
  let persisted = false;
  // Declare gateways for use by the surrounding module or function.
  const gateways = {
    findOne: () => query(null),
    findOneAndUpdate: () => { persisted = true; return query({}); },
  };
  // Declare controller for use by the surrounding module or function.
  const controller = createSuperAdminMpesaGatewayController({ organizations, gateways, tenantScope: (_context, callback) => callback(), validateSettings: () => null });
  // Declare res for use by the surrounding module or function.
  const res = response();
  // Perform the side effect or state update expressed on the following line.
  await controller.save({ params: { tenantId }, body: { environment: "production", enabled: true, shortcode: "123456", callbackUrl: "https://api.example.com/api/mpesa/callback" } }, res, (error) => { throw error; });
  // Perform the side effect or state update expressed on the following line.
  assert.equal(res.statusCode, 400);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(persisted, false);
});

// Perform the side effect or state update expressed on the following line.
test("gateway rejects non-text credential values before persistence", async () => {
  // Declare persisted for use by the surrounding module or function.
  let persisted = false;
  // Declare controller for use by the surrounding module or function.
  const controller = createSuperAdminMpesaGatewayController({
    organizations: { findById: () => query({ _id: tenantId, name: "Tenant A", slug: "tenant-a" }) },
    gateways: { findOne: () => query(null), findOneAndUpdate: () => { persisted = true; return query({}); } },
    tenantScope: (_context, callback) => callback(),
  });
  // Declare res for use by the surrounding module or function.
  const res = response();
  // Perform the side effect or state update expressed on the following line.
  await controller.save({ params: { tenantId }, body: { environment: "sandbox", enabled: false, consumerSecret: { value: "do-not-coerce" } } }, res, (error) => { throw error; });
  // Perform the side effect or state update expressed on the following line.
  assert.equal(res.statusCode, 400);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(persisted, false);
});

// Perform the side effect or state update expressed on the following line.
test("gateway API only returns secret-presence flags, never encrypted credential values", async () => {
  // Declare encrypted for use by the surrounding module or function.
  const encrypted = "ciphertext-must-not-return";
  // Declare organizations for use by the surrounding module or function.
  const organizations = { findById: () => query({ _id: tenantId, name: "Tenant A", slug: "tenant-a" }) };
  // Declare gateways for use by the surrounding module or function.
  const gateways = { findOne: () => query({
    _id: "config-id", tenantId, provider: "MPESA", environment: "sandbox", enabled: false,
    shortcode: "123456", callbackUrl: "https://stage.example.com/api/mpesa/callback",
    consumerKeyEncrypted: encrypted, consumerSecretEncrypted: encrypted, passkeyEncrypted: encrypted,
  }) };
  // Declare controller for use by the surrounding module or function.
  const controller = createSuperAdminMpesaGatewayController({ organizations, gateways, tenantScope: (_context, callback) => callback() });
  // Declare res for use by the surrounding module or function.
  const res = response();
  // Perform the side effect or state update expressed on the following line.
  await controller.get({ params: { tenantId } }, res, (error) => { throw error; });
  // Declare serialized for use by the surrounding module or function.
  const serialized = JSON.stringify(res.body);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(serialized.includes(encrypted), false);
  // Perform the side effect or state update expressed on the following line.
  assert.equal("consumerKeyEncrypted" in res.body.data, false);
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(res.body.data.secretsConfigured, { consumerKey: true, consumerSecret: true, passkey: true });
});

// Perform the side effect or state update expressed on the following line.
test("sandbox callbacks use the explicitly configured sandbox host or an explicitly shared production route", () => {
  // Declare productionCallbackUrl for use by the surrounding module or function.
  const productionCallbackUrl = "https://hussein-mboya-tours.onrender.com/api/mpesa/callback";
  // Declare shared for use by the surrounding module or function.
  const shared = { productionCallbackUrl, sandboxCallbackUrl: productionCallbackUrl };
  // Perform the side effect or state update expressed on the following line.
  assert.equal(validateMpesaGatewaySettings({ environment: "sandbox", callbackUrl: `  ${productionCallbackUrl}  ` }, shared), null);
  // Perform the side effect or state update expressed on the following line.
  assert.match(validateMpesaGatewaySettings({ environment: "sandbox", callbackUrl: "https://api.example.com/api/mpesa/callback" }, { ...shared, sandboxCallbackUrl: "https://sandbox-api.example.com/api/mpesa/callback" }), /must match the configured Sandbox host/);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(validateMpesaGatewaySettings({ environment: "sandbox", callbackUrl: "https://sandbox-api.example.com/api/mpesa/callback" }, { ...shared, sandboxCallbackUrl: "https://sandbox-api.example.com/api/mpesa/callback" }), null);
  // Perform the side effect or state update expressed on the following line.
  assert.match(validateMpesaGatewaySettings({ environment: "sandbox", callbackUrl: "http://stage.example.com/api/mpesa/callback" }, shared), /public HTTPS/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(validateMpesaGatewaySettings({ environment: "sandbox", callbackUrl: "https://localhost/api/mpesa/callback" }, shared), /public HTTPS/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(validateMpesaGatewaySettings({ environment: "sandbox", callbackUrl: "https://10.0.0.12/api/mpesa/callback" }, { ...shared, sandboxCallbackUrl: "https://10.0.0.12/api/mpesa/callback" }), /public HTTPS/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(validateMpesaGatewaySettings({ environment: "sandbox", callbackUrl: "https://stage.example.com:8443/api/mpesa/callback" }, { ...shared, sandboxCallbackUrl: "https://stage.example.com:8443/api/mpesa/callback" }), /public HTTPS/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(validateMpesaGatewaySettings({ environment: "sandbox", callbackUrl: "https://stage.example.com/api/mpesa/callback?tenant=x" }, { ...shared, sandboxCallbackUrl: "https://stage.example.com/api/mpesa/callback" }), /public HTTPS/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(validateMpesaGatewaySettings({ environment: "sandbox", callbackUrl: "https://stage.example.com/other" }, shared), /ending in \/api\/mpesa\/callback/);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(validateMpesaGatewaySettings({ environment: "production", callbackUrl: productionCallbackUrl }, { productionCallbackUrl }), null);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(validateMpesaGatewaySettings({ environment: "production", callbackUrl: ` ${productionCallbackUrl} ` }, { productionCallbackUrl }), null);
  // Perform the side effect or state update expressed on the following line.
  assert.match(validateMpesaGatewaySettings({ environment: "qa", callbackUrl: productionCallbackUrl }, { productionCallbackUrl }), /Environment must be/);
});

// Perform the side effect or state update expressed on the following line.
test("sandbox callback host comes from explicit sandbox deployment config and defaults to the shared production callback", async () => {
  // Declare { getSandboxMpesaCallbackUrl } for use by the surrounding module or function.
  const { getSandboxMpesaCallbackUrl } = await import("../services/mpesaGatewaySettings.js");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(getSandboxMpesaCallbackUrl({ MPESA_SANDBOX_CALLBACK_URL: " https://sandbox-api.example.com/api/mpesa/callback ", MPESA_PRODUCTION_CALLBACK_URL: "https://api.example.com/api/mpesa/callback" }), "https://sandbox-api.example.com/api/mpesa/callback");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(getSandboxMpesaCallbackUrl({ MPESA_PRODUCTION_CALLBACK_URL: "https://api.example.com/api/mpesa/callback" }), "https://api.example.com/api/mpesa/callback");
});

// Perform the side effect or state update expressed on the following line.
test("tenant Admin settings and runtime share the callback safety validator without falling back to global callbacks", () => {
  // Declare adminController for use by the surrounding module or function.
  const adminController = read("controllers/paymentGatewayController.js");
  // Declare paymentService for use by the surrounding module or function.
  const paymentService = read("services/paymentGatewayService.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(adminController, /validateMpesaGatewaySettings\(/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(paymentService, /validateMpesaGatewaySettings\(/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(paymentService, /callbackUrl: environmentSettings\.callbackUrl/);
});

// Perform the side effect or state update expressed on the following line.
test("safe gateway view reports credential presence without exposing stored secrets", () => {
  // Declare view for use by the surrounding module or function.
  const view = safeMpesaGatewayView({ environment: "sandbox", consumerKeyEncrypted: "cipher", consumerSecretEncrypted: "cipher", passkeyEncrypted: "cipher" });
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(view.secretsConfigured, { consumerKey: true, consumerSecret: true, passkey: true });
  // Perform the side effect or state update expressed on the following line.
  assert.equal(Object.keys(view).some((key) => key.endsWith("Encrypted") || key === "consumerKey" || key === "consumerSecret" || key === "passkey"), false);
});

// Perform the side effect or state update expressed on the following line.
test("Platform Admin page is reachable from tenant management and masks credentials", () => {
  // Declare routes for use by the surrounding module or function.
  const routes = read("../client/src/routes/AppRoutes.jsx");
  // Declare tenants for use by the surrounding module or function.
  const tenants = fs.readFileSync(path.resolve(root, "../client/src/pages/superadmin/SuperAdminTenants.jsx"), "utf8");
  // Declare page for use by the surrounding module or function.
  const page = fs.readFileSync(path.resolve(root, "../client/src/pages/superadmin/SuperAdminTenantMpesa.jsx"), "utf8");
  // Perform the side effect or state update expressed on the following line.
  assert.match(routes, /superadmin\/tenants\/:tenantId\/mpesa/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(tenants, /M-Pesa settings/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(page, /type="password"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(page, /leave blank to retain/i);
});

// Perform the side effect or state update expressed on the following line.
test("configuration validation uses environment-specific OAuth only and sanitizes every outcome", async () => {
  // Declare organization for use by the surrounding module or function.
  const organization = { _id: tenantId, name: "Tenant A", slug: "tenant-a" };
  // Declare config for use by the surrounding module or function.
  const config = { tenantId, provider: "MPESA", environment: "sandbox", sandboxShortcode: "123456", sandboxCallbackUrl: "https://stage.example.com/api/mpesa/callback", sandboxConsumerKeyEncrypted: "key-cipher", sandboxConsumerSecretEncrypted: "secret-cipher", sandboxPasskeyEncrypted: "pass-cipher", productionConsumerKeyEncrypted: "prod-only" };
  // Declare requestedUrl for use by the surrounding module or function.
  let requestedUrl; let requestOptions; let postCalls = 0;
  // Declare makeController for use by the surrounding module or function.
  const makeController = (http, stored = config) => createSuperAdminMpesaGatewayController({
    organizations: { findById: () => query(organization) }, gateways: { findOne: () => query(stored) },
    tenantScope: (_context, callback) => callback(), decrypt: (value) => ({ "key-cipher": "consumer-key", "secret-cipher": "consumer-secret", "pass-cipher": "passkey", "prod-key": "prod-consumer-key", "prod-secret": "prod-consumer-secret", "prod-pass": "prod-passkey" })[value] || "",
    validateSettings: () => null, http, now: () => new Date("2026-10-29T00:00:00.000Z"),
  });
  // Declare run for use by the surrounding module or function.
  const run = async (controller, environment = "sandbox") => {
    // Declare res for use by the surrounding module or function.
    const res = response();
    // Perform the side effect or state update expressed on the following line.
    await controller.validate({ params: { tenantId }, body: { environment } }, res, (error) => { throw error; });
    // Return the data value to the caller.
    return res.body.data;
  };
  // Declare success for use by the surrounding module or function.
  const success = await run(makeController({ get: async (url, options) => { requestedUrl = url; requestOptions = options; return { data: { access_token: "private-token" } }; }, post: async () => { postCalls += 1; } }));
  // Perform the side effect or state update expressed on the following line.
  assert.equal(success.status, "connected");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(success.remoteVerified, true);
  // Perform the side effect or state update expressed on the following line.
  assert.match(requestedUrl, /^https:\/\/sandbox\.safaricom\.co\.ke\/oauth\//);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(requestOptions.timeout, 8000);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(postCalls, 0);
  // Perform the side effect or state update expressed on the following line.
  assert.doesNotMatch(JSON.stringify(success), /private-token|consumer-key|consumer-secret/);

  // Declare missing for use by the surrounding module or function.
  const missing = await run(makeController({ get: async () => { throw new Error("must not call provider"); } }, { ...config, sandboxPasskeyEncrypted: "" }));
  // Perform the side effect or state update expressed on the following line.
  assert.equal(missing.status, "incomplete");
  // Declare invalid for use by the surrounding module or function.
  const invalid = await run(makeController({ get: async () => { throw Object.assign(new Error("Authorization: secret"), { response: { status: 401, data: { secret: "private" } } }); } }));
  // Perform the side effect or state update expressed on the following line.
  assert.equal(invalid.status, "invalid_credentials");
  // Perform the side effect or state update expressed on the following line.
  assert.doesNotMatch(JSON.stringify(invalid), /secret|private|Authorization/);
  // Declare timeout for use by the surrounding module or function.
  const timeout = await run(makeController({ get: async () => { throw Object.assign(new Error("private raw detail"), { code: "ECONNABORTED" }); } }));
  // Perform the side effect or state update expressed on the following line.
  assert.equal(timeout.status, "unverified");
  // Perform the side effect or state update expressed on the following line.
  assert.doesNotMatch(JSON.stringify(timeout), /private raw detail/);
  // Declare providerError for use by the surrounding module or function.
  const providerError = await run(makeController({ get: async () => { throw Object.assign(new Error("private"), { response: { status: 503, data: { consumerSecret: "private" } } }); } }));
  // Perform the side effect or state update expressed on the following line.
  assert.equal(providerError.status, "provider_error");
  // Perform the side effect or state update expressed on the following line.
  assert.doesNotMatch(JSON.stringify(providerError), /private|consumerSecret/);
  // Declare productionConfig for use by the surrounding module or function.
  const productionConfig = { ...config, productionShortcode: "654321", productionCallbackUrl: "https://live.example.com/api/mpesa/callback", productionConsumerKeyEncrypted: "prod-key", productionConsumerSecretEncrypted: "prod-secret", productionPasskeyEncrypted: "prod-pass" };
  // Declare production for use by the surrounding module or function.
  const production = await run(makeController({ get: async (url) => { requestedUrl = url; return { data: { access_token: "x" } }; } }, productionConfig), "production");
  // Perform the side effect or state update expressed on the following line.
  assert.match(requestedUrl, /^https:\/\/api\.safaricom\.co\.ke\/oauth\//);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(production.status, "connected");
  // Declare noProductionSecrets for use by the surrounding module or function.
  const noProductionSecrets = await run(makeController({ get: async () => { throw new Error("sandbox credentials must not be used"); } }), "production");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(noProductionSecrets.status, "incomplete", "sandbox secrets cannot satisfy production validation");
});
