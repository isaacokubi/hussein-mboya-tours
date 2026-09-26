import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { createStagingTenantAdminPasswordResetHandler } from "../routes/internal/stagingSuperAdminBootstrapRoutes.js";
import User from "../models/User.js";
import { runWithTenant } from "../tenancy/context.js";

const token = "test-only-reset-token-that-is-at-least-32-characters";
const targetTenant = "6ab82dce30c1fd52b9dc3e80";
const password = "New-Staging-Password-42";
const validEnvironment = () => ({
  NODE_ENV: "production",
  DEPLOYMENT_ENV: "staging",
  STAGING_DATABASE_NAME: "global_tours_test",
  MONGODB_URI: "mongodb://staging.invalid:27017/global_tours_test",
  STAGING_TENANT_ADMIN_RESET_TOKEN: token,
  STAGING_TENANT_ADMIN_EMAIL: "staging-tenant-admin@example.com",
  STAGING_TENANT_ADMIN_TENANT_ID: targetTenant,
});

function setup({ environment = validEnvironment(), databaseName = "global_tours_test", rawUser } = {}) {
  const state = { uri: null, closed: false, saved: 0, found: null, doc: null };
  const raw = rawUser || {
    _id: new mongoose.Types.ObjectId(),
    email: "staging-tenant-admin@example.com",
    tenantId: new mongoose.Types.ObjectId(targetTenant),
    password: "old-hash",
    passwordResetCodeHash: "pending", passwordResetExpiresAt: new Date(), passwordResetAttempts: 4,
    loginPinHash: "pending", loginPinExpiresAt: new Date(), loginPinAttempts: 3, loginPinLastSentAt: new Date(),
    loginAttempts: 5, lockUntil: new Date(Date.now() + 60_000),
  };
  const mongooseClient = {
    createConnection(uri) {
      state.uri = uri;
      return {
        db: { databaseName }, asPromise: async () => {}, close: async () => { state.closed = true; },
        model() {
          return {
            collection: { findOne: async (filter) => { state.found = filter; return raw; } },
            hydrate(document) {
              const doc = { ...document, save: async () => { state.saved += 1; } };
              state.doc = doc;
              return doc;
            },
          };
        },
      };
    },
  };
  const handler = createStagingTenantAdminPasswordResetHandler({
    environment, mongooseClient, userSchema: {}, objectIdFactory: (value) => value,
  });
  return { state, handler };
}

async function call(handler, { headerToken = token, body = { password } } = {}) {
  const result = { status: 200, body: null };
  const response = {
    status(code) { result.status = code; return this; },
    sendStatus(code) { result.status = code; return this; },
    json(value) { result.body = value; return this; },
  };
  await handler({ body, get: (name) => name.toLowerCase() === "x-staging-tenant-admin-reset-token" ? headerToken : undefined }, response);
  return result;
}

test("production, wrong deployment, and wrong database configuration fail before connecting", async () => {
  for (const environment of [
    { ...validEnvironment(), DEPLOYMENT_ENV: "production" },
    { ...validEnvironment(), NODE_ENV: "development" },
    { ...validEnvironment(), STAGING_DATABASE_NAME: "other_database" },
    { ...validEnvironment(), MONGODB_URI: "mongodb://staging.invalid:27017/other_database" },
    { ...validEnvironment(), MONGODB_URI: "mongodb://staging.invalid:27017/husseindb" },
  ]) {
    const { state, handler } = setup({ environment });
    assert.equal((await call(handler)).status, 404);
    assert.equal(state.uri, null);
  }
});

test("actual husseindb identity fails closed and closes the connection", async () => {
  const { state, handler } = setup({ databaseName: "husseindb" });
  assert.equal((await call(handler)).status, 404);
  assert.equal(state.saved, 0);
  assert.equal(state.closed, true);
});

test("wrong configured identity or database user identity cannot be changed", async () => {
  for (const environment of [
    { ...validEnvironment(), STAGING_TENANT_ADMIN_EMAIL: "other@example.com" },
    { ...validEnvironment(), STAGING_TENANT_ADMIN_TENANT_ID: "6ab82dce30c1fd52b9dc3e81" },
  ]) {
    const { state, handler } = setup({ environment });
    assert.equal((await call(handler)).status, 404);
    assert.equal(state.uri, null);
  }
  for (const rawUser of [
    { email: "other@example.com", tenantId: targetTenant },
    { email: "staging-tenant-admin@example.com", tenantId: "6ab82dce30c1fd52b9dc3e81" },
  ]) {
    const { state, handler } = setup({ rawUser });
    assert.equal((await call(handler)).status, 404);
    assert.equal(state.saved, 0);
  }
});

test("missing token is rejected before connection", async () => {
  const { state, handler } = setup();
  assert.equal((await call(handler, { headerToken: null })).status, 403);
  assert.equal(state.uri, null);
});

test("successful reset touches the exact tenant account and clears recovery and lock state", async () => {
  const { state, handler } = setup();
  const response = await call(handler);
  assert.deepEqual(response, { status: 200, body: { success: true, reset: true } });
  assert.equal(state.found.email, "staging-tenant-admin@example.com");
  assert.equal(state.found.tenantId, targetTenant);
  assert.equal(state.doc.email, "staging-tenant-admin@example.com");
  assert.equal(String(state.doc.tenantId), targetTenant);
  assert.equal(state.doc.password, password);
  assert.equal(state.doc.passwordResetCodeHash, "");
  assert.equal(state.doc.passwordResetExpiresAt, null);
  assert.equal(state.doc.passwordResetAttempts, 0);
  assert.equal(state.doc.loginPinHash, "");
  assert.equal(state.doc.loginPinExpiresAt, null);
  assert.equal(state.doc.loginPinAttempts, 0);
  assert.equal(state.doc.loginPinLastSentAt, null);
  assert.equal(state.doc.loginAttempts, 0);
  assert.equal(state.doc.lockUntil, null);
  assert.equal(state.saved, 1);
  assert.equal(state.closed, true);
});

test("User save hook hashes the reset password", async () => {
  const document = new User({ name: "Test", email: "test@example.com", phone: "0712345678", password, tenantId: targetTenant });
  await runWithTenant({ tenantId: targetTenant, role: "admin", bypass: false }, () => new Promise((resolve, reject) => User.schema.s.hooks.execPre("save", document, (error) => error ? reject(error) : resolve())));
  assert.notEqual(document.password, password);
  assert.equal(await bcrypt.compare(password, document.password), true);
});

test("successful reset is one-shot and does not expose supplied credentials", async () => {
  const { state, handler } = setup();
  const first = await call(handler);
  const second = await call(handler);
  assert.equal(first.status, 200);
  assert.equal(second.status, 404);
  assert.equal(state.saved, 1);
  assert.doesNotMatch(JSON.stringify(first.body), new RegExp(password));
  assert.doesNotMatch(JSON.stringify(first.body), new RegExp(token));
});
