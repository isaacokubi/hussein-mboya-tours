import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createSuperAdminMpesaGatewayController } from "../controllers/superAdminMpesaGatewayController.js";
import { superAdminOnly } from "../middleware/superAdminOnly.js";
import { safeMpesaGatewayView, validateMpesaGatewaySettings } from "../services/mpesaGatewaySettings.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const tenantId = "507f1f77bcf86cd799439011";

const query = (value) => ({ select: () => ({ lean: async () => value }), lean: async () => value });
const response = () => ({ statusCode: 200, body: null, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } });

test("Platform Admin gateway API is mounted behind authentication and Super Admin authorization", () => {
  const routes = read("routes/superAdminRoutes.js");
  assert.match(routes, /router\.use\(protect, superAdminOnly\)/);
  assert.match(routes, /router\.get\("\/tenants\/:tenantId\/mpesa", getSuperAdminTenantMpesa\)/);
  assert.match(routes, /router\.put\("\/tenants\/:tenantId\/mpesa", saveSuperAdminTenantMpesa\)/);
  assert.match(routes, /router\.delete\("\/tenants\/:tenantId\/mpesa", disableSuperAdminTenantMpesa\)/);
});

test("the server-side guard rejects tenant admins and permits platform admins", () => {
  const denied = response();
  let continued = false;
  superAdminOnly({ user: { legacyRole: "admin" } }, denied, () => { continued = true; });
  assert.equal(denied.statusCode, 403);
  assert.equal(continued, false);
  const allowed = response();
  superAdminOnly({ user: { legacyRole: "super_admin" } }, allowed, () => { continued = true; });
  assert.equal(continued, true);
});

test("tenant selection is validated and gateway reads/writes include the selected tenant ID", async () => {
  const filters = [];
  let savedUpdate;
  const organization = { _id: tenantId, name: "Tenant A", slug: "tenant-a" };
  const organizations = { findById: (id) => { assert.equal(String(id), tenantId); return query(organization); } };
  const gateways = {
    findOne: (filter) => { filters.push(filter); return query(null); },
    findOneAndUpdate: (filter, update) => { filters.push(filter); savedUpdate = update; return query({ ...filter, environment: "sandbox", enabled: false, consumerKeyEncrypted: update.$set.consumerKeyEncrypted, consumerSecretEncrypted: update.$set.consumerSecretEncrypted, passkeyEncrypted: update.$set.passkeyEncrypted }); },
  };
  const controller = createSuperAdminMpesaGatewayController({ organizations, gateways, tenantScope: (_context, callback) => callback(), validateSettings: () => null, encrypt: (value) => `encrypted:${value}` });
  const res = response();
  await controller.save({ params: { tenantId }, body: { environment: "sandbox", enabled: false, callbackUrl: "https://stage.example.com/api/mpesa/callback", shortcode: "123456", consumerKey: "key", consumerSecret: "secret", passkey: "pass" }, user: { _id: "admin-id" } }, res, (error) => { throw error; });
  assert.equal(res.statusCode, 200);
  assert.ok(filters.length >= 2);
  assert.equal(savedUpdate.$set.sandboxConsumerKeyEncrypted, "encrypted:key");
  assert.equal(savedUpdate.$set.sandboxConsumerSecretEncrypted, "encrypted:secret");
  assert.equal(savedUpdate.$set.sandboxPasskeyEncrypted, "encrypted:pass");
  assert.equal("consumerKey" in savedUpdate.$set, false);
  assert.equal(JSON.stringify(res.body).includes("encrypted:key"), false);
  for (const filter of filters) {
    assert.equal(String(filter.tenantId), tenantId);
    assert.equal(filter.provider, "MPESA");
  }

  const invalidOrganizations = { findById: () => query(null) };
  const missingController = createSuperAdminMpesaGatewayController({ organizations: invalidOrganizations, gateways, tenantScope: (_context, callback) => callback() });
  const missing = response();
  await missingController.get({ params: { tenantId } }, missing, (error) => { throw error; });
  assert.equal(missing.statusCode, 404);
  const platformOrganization = { findById: () => query({ _id: tenantId, name: "Platform", slug: "platform", isSystem: true }) };
  const platformController = createSuperAdminMpesaGatewayController({ organizations: platformOrganization, gateways, tenantScope: (_context, callback) => callback() });
  const excluded = response();
  await platformController.get({ params: { tenantId } }, excluded, (error) => { throw error; });
  assert.equal(excluded.statusCode, 404);
  const platformSettingsController = createSuperAdminMpesaGatewayController({ organizations: { findById: () => query({ _id: tenantId, name: "Platform", slug: "platform-org", settings: { isPlatform: true } }) }, gateways, tenantScope: (_context, callback) => callback() });
  const platformSettings = response();
  await platformSettingsController.get({ params: { tenantId } }, platformSettings, (error) => { throw error; });
  assert.equal(platformSettings.statusCode, 404);
});

test("an enabled gateway cannot be saved without all required tenant credentials", async () => {
  const organizations = { findById: () => query({ _id: tenantId, name: "Tenant A", slug: "tenant-a" }) };
  let persisted = false;
  const gateways = {
    findOne: () => query(null),
    findOneAndUpdate: () => { persisted = true; return query({}); },
  };
  const controller = createSuperAdminMpesaGatewayController({ organizations, gateways, tenantScope: (_context, callback) => callback(), validateSettings: () => null });
  const res = response();
  await controller.save({ params: { tenantId }, body: { environment: "production", enabled: true, shortcode: "123456", callbackUrl: "https://api.example.com/api/mpesa/callback" } }, res, (error) => { throw error; });
  assert.equal(res.statusCode, 400);
  assert.equal(persisted, false);
});

test("gateway rejects non-text credential values before persistence", async () => {
  let persisted = false;
  const controller = createSuperAdminMpesaGatewayController({
    organizations: { findById: () => query({ _id: tenantId, name: "Tenant A", slug: "tenant-a" }) },
    gateways: { findOne: () => query(null), findOneAndUpdate: () => { persisted = true; return query({}); } },
    tenantScope: (_context, callback) => callback(),
  });
  const res = response();
  await controller.save({ params: { tenantId }, body: { environment: "sandbox", enabled: false, consumerSecret: { value: "do-not-coerce" } } }, res, (error) => { throw error; });
  assert.equal(res.statusCode, 400);
  assert.equal(persisted, false);
});

test("gateway API only returns secret-presence flags, never encrypted credential values", async () => {
  const encrypted = "ciphertext-must-not-return";
  const organizations = { findById: () => query({ _id: tenantId, name: "Tenant A", slug: "tenant-a" }) };
  const gateways = { findOne: () => query({
    _id: "config-id", tenantId, provider: "MPESA", environment: "sandbox", enabled: false,
    shortcode: "123456", callbackUrl: "https://stage.example.com/api/mpesa/callback",
    consumerKeyEncrypted: encrypted, consumerSecretEncrypted: encrypted, passkeyEncrypted: encrypted,
  }) };
  const controller = createSuperAdminMpesaGatewayController({ organizations, gateways, tenantScope: (_context, callback) => callback() });
  const res = response();
  await controller.get({ params: { tenantId } }, res, (error) => { throw error; });
  const serialized = JSON.stringify(res.body);
  assert.equal(serialized.includes(encrypted), false);
  assert.equal("consumerKeyEncrypted" in res.body.data, false);
  assert.deepEqual(res.body.data.secretsConfigured, { consumerKey: true, consumerSecret: true, passkey: true });
});

test("sandbox callbacks require a valid public callback and cannot use the production callback host", () => {
  const productionCallbackUrl = "https://api.example.com/api/mpesa/callback";
  assert.match(validateMpesaGatewaySettings({ environment: "sandbox", callbackUrl: "https://api.example.com/api/mpesa/callback" }, { productionCallbackUrl }), /production callback host/);
  assert.match(validateMpesaGatewaySettings({ environment: "sandbox", callbackUrl: "https://api.example.com:8443/api/mpesa/callback" }, { productionCallbackUrl }), /production callback host/);
  assert.match(validateMpesaGatewaySettings({ environment: "sandbox", callbackUrl: "http://stage.example.com/api/mpesa/callback" }, { productionCallbackUrl }), /public HTTPS/);
  assert.match(validateMpesaGatewaySettings({ environment: "sandbox", callbackUrl: "https://localhost/api/mpesa/callback" }, { productionCallbackUrl }), /public HTTPS/);
  assert.match(validateMpesaGatewaySettings({ environment: "sandbox", callbackUrl: "https://stage.example.com/other" }, { productionCallbackUrl }), /ending in \/api\/mpesa\/callback/);
  assert.equal(validateMpesaGatewaySettings({ environment: "sandbox", callbackUrl: "https://stage.example.com/api/mpesa/callback" }, { productionCallbackUrl }), null);
  assert.equal(validateMpesaGatewaySettings({ environment: "production", callbackUrl: productionCallbackUrl }, { productionCallbackUrl }), null);
  assert.match(validateMpesaGatewaySettings({ environment: "qa", callbackUrl: productionCallbackUrl }, { productionCallbackUrl }), /Environment must be/);
});

test("tenant Admin settings and runtime share the callback safety validator without falling back to global callbacks", () => {
  const adminController = read("controllers/paymentGatewayController.js");
  const paymentService = read("services/paymentGatewayService.js");
  assert.match(adminController, /validateMpesaGatewaySettings\(/);
  assert.match(paymentService, /validateMpesaGatewaySettings\(/);
  assert.match(paymentService, /callbackUrl: environmentSettings\.callbackUrl/);
});

test("safe gateway view reports credential presence without exposing stored secrets", () => {
  const view = safeMpesaGatewayView({ environment: "sandbox", consumerKeyEncrypted: "cipher", consumerSecretEncrypted: "cipher", passkeyEncrypted: "cipher" });
  assert.deepEqual(view.secretsConfigured, { consumerKey: true, consumerSecret: true, passkey: true });
  assert.equal(Object.keys(view).some((key) => key.endsWith("Encrypted") || key === "consumerKey" || key === "consumerSecret" || key === "passkey"), false);
});

test("Platform Admin page is reachable from tenant management and masks credentials", () => {
  const routes = read("../client/src/routes/AppRoutes.jsx");
  const tenants = fs.readFileSync(path.resolve(root, "../client/src/pages/superadmin/SuperAdminTenants.jsx"), "utf8");
  const page = fs.readFileSync(path.resolve(root, "../client/src/pages/superadmin/SuperAdminTenantMpesa.jsx"), "utf8");
  assert.match(routes, /superadmin\/tenants\/:tenantId\/mpesa/);
  assert.match(tenants, /M-Pesa settings/);
  assert.match(page, /type="password"/);
  assert.match(page, /leave blank to retain/i);
});

test("configuration validation uses environment-specific OAuth only and sanitizes every outcome", async () => {
  const organization = { _id: tenantId, name: "Tenant A", slug: "tenant-a" };
  const config = { tenantId, provider: "MPESA", environment: "sandbox", sandboxShortcode: "123456", sandboxCallbackUrl: "https://stage.example.com/api/mpesa/callback", sandboxConsumerKeyEncrypted: "key-cipher", sandboxConsumerSecretEncrypted: "secret-cipher", sandboxPasskeyEncrypted: "pass-cipher", productionConsumerKeyEncrypted: "prod-only" };
  let requestedUrl; let requestOptions; let postCalls = 0;
  const makeController = (http, stored = config) => createSuperAdminMpesaGatewayController({
    organizations: { findById: () => query(organization) }, gateways: { findOne: () => query(stored) },
    tenantScope: (_context, callback) => callback(), decrypt: (value) => ({ "key-cipher": "consumer-key", "secret-cipher": "consumer-secret", "pass-cipher": "passkey", "prod-key": "prod-consumer-key", "prod-secret": "prod-consumer-secret", "prod-pass": "prod-passkey" })[value] || "",
    validateSettings: () => null, http, now: () => new Date("2026-10-29T00:00:00.000Z"),
  });
  const run = async (controller, environment = "sandbox") => {
    const res = response();
    await controller.validate({ params: { tenantId }, body: { environment } }, res, (error) => { throw error; });
    return res.body.data;
  };
  const success = await run(makeController({ get: async (url, options) => { requestedUrl = url; requestOptions = options; return { data: { access_token: "private-token" } }; }, post: async () => { postCalls += 1; } }));
  assert.equal(success.status, "connected");
  assert.equal(success.remoteVerified, true);
  assert.match(requestedUrl, /^https:\/\/sandbox\.safaricom\.co\.ke\/oauth\//);
  assert.equal(requestOptions.timeout, 8000);
  assert.equal(postCalls, 0);
  assert.doesNotMatch(JSON.stringify(success), /private-token|consumer-key|consumer-secret/);

  const missing = await run(makeController({ get: async () => { throw new Error("must not call provider"); } }, { ...config, sandboxPasskeyEncrypted: "" }));
  assert.equal(missing.status, "incomplete");
  const invalid = await run(makeController({ get: async () => { throw Object.assign(new Error("Authorization: secret"), { response: { status: 401, data: { secret: "private" } } }); } }));
  assert.equal(invalid.status, "invalid_credentials");
  assert.doesNotMatch(JSON.stringify(invalid), /secret|private|Authorization/);
  const timeout = await run(makeController({ get: async () => { throw Object.assign(new Error("private raw detail"), { code: "ECONNABORTED" }); } }));
  assert.equal(timeout.status, "unverified");
  assert.doesNotMatch(JSON.stringify(timeout), /private raw detail/);
  const providerError = await run(makeController({ get: async () => { throw Object.assign(new Error("private"), { response: { status: 503, data: { consumerSecret: "private" } } }); } }));
  assert.equal(providerError.status, "provider_error");
  assert.doesNotMatch(JSON.stringify(providerError), /private|consumerSecret/);
  const productionConfig = { ...config, productionShortcode: "654321", productionCallbackUrl: "https://live.example.com/api/mpesa/callback", productionConsumerKeyEncrypted: "prod-key", productionConsumerSecretEncrypted: "prod-secret", productionPasskeyEncrypted: "prod-pass" };
  const production = await run(makeController({ get: async (url) => { requestedUrl = url; return { data: { access_token: "x" } }; } }, productionConfig), "production");
  assert.match(requestedUrl, /^https:\/\/api\.safaricom\.co\.ke\/oauth\//);
  assert.equal(production.status, "connected");
  const noProductionSecrets = await run(makeController({ get: async () => { throw new Error("sandbox credentials must not be used"); } }), "production");
  assert.equal(noProductionSecrets.status, "incomplete", "sandbox secrets cannot satisfy production validation");
});
