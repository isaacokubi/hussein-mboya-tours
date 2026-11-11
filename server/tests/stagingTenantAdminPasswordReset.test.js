/**
 * Purpose: staging Tenant Admin Password Reset.test automated test. Main declarations: validEnvironment, setup, call.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import test from "node:test";
// Load node:assert/strict so this module can use its exported dependencies.
import assert from "node:assert/strict";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load bcryptjs so this module can use its exported dependencies.
import bcrypt from "bcryptjs";
// Load ../routes/internal/stagingSuperAdminBootstrapRoutes.js so this module can use its exported dependencies.
import { createStagingTenantAdminPasswordResetHandler } from "../routes/internal/stagingSuperAdminBootstrapRoutes.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { runWithTenant } from "../tenancy/context.js";

// Declare token for use by the surrounding module or function.
const token = "test-only-reset-token-that-is-at-least-32-characters";
// Declare targetTenant for use by the surrounding module or function.
const targetTenant = "6ab82dce30c1fd52b9dc3e80";
// Declare password for use by the surrounding module or function.
const password = "New-Staging-Password-42";
// Declare validEnvironment for use by the surrounding module or function.
const validEnvironment = () => ({
  NODE_ENV: "production",
  DEPLOYMENT_ENV: "staging",
  STAGING_DATABASE_NAME: "global_tours_test",
  MONGODB_URI: "mongodb://staging.invalid:27017/global_tours_test",
  STAGING_TENANT_ADMIN_RESET_TOKEN: token,
  STAGING_TENANT_ADMIN_EMAIL: "staging-tenant-admin@example.com",
  STAGING_TENANT_ADMIN_TENANT_ID: targetTenant,
});

// Define setup; its parameters and body implement this operation.
function setup({ environment = validEnvironment(), databaseName = "global_tours_test", rawUser } = {}) {
  // Declare state for use by the surrounding module or function.
  const state = { uri: null, closed: false, saved: 0, found: null, doc: null };
  // Declare raw for use by the surrounding module or function.
  const raw = rawUser || {
    _id: new mongoose.Types.ObjectId(),
    email: "staging-tenant-admin@example.com",
    tenantId: new mongoose.Types.ObjectId(targetTenant),
    password: "old-hash",
    passwordResetCodeHash: "pending", passwordResetExpiresAt: new Date(), passwordResetAttempts: 4,
    loginPinHash: "pending", loginPinExpiresAt: new Date(), loginPinAttempts: 3, loginPinLastSentAt: new Date(),
    loginAttempts: 5, lockUntil: new Date(Date.now() + 60_000),
  };
  // Declare mongooseClient for use by the surrounding module or function.
  const mongooseClient = {
    // Implement the createConnection method for this class.
    createConnection(uri) {
      // Perform the side effect or state update expressed on the following line.
      state.uri = uri;
      // Return the object assembled below to the caller.
      return {
        db: { databaseName }, asPromise: async () => {}, close: async () => { state.closed = true; },
        // Implement the model method for this class.
        model() {
          // Return the object assembled below to the caller.
          return {
            collection: { findOne: async (filter) => { state.found = filter; return raw; } },
            // Implement the hydrate method for this class.
            hydrate(document) {
              // Declare doc for use by the surrounding module or function.
              const doc = { ...document, save: async () => { state.saved += 1; } };
              // Perform the side effect or state update expressed on the following line.
              state.doc = doc;
              // Return the value of doc to the caller.
              return doc;
            },
          };
        },
      };
    },
  };
  // Declare handler for use by the surrounding module or function.
  const handler = createStagingTenantAdminPasswordResetHandler({
    environment, mongooseClient, userSchema: {}, objectIdFactory: (value) => value,
  });
  // Return the object assembled below to the caller.
  return { state, handler };
}

// Define call; its parameters and body implement this operation.
async function call(handler, { headerToken = token, body = { password } } = {}) {
  // Declare result for use by the surrounding module or function.
  const result = { status: 200, body: null };
  // Declare response for use by the surrounding module or function.
  const response = {
    // Implement the status method for this class.
    status(code) { result.status = code; return this; },
    // Implement the sendStatus method for this class.
    sendStatus(code) { result.status = code; return this; },
    // Implement the json method for this class.
    json(value) { result.body = value; return this; },
  };
  // Perform the side effect or state update expressed on the following line.
  await handler({ body, get: (name) => name.toLowerCase() === "x-staging-tenant-admin-reset-token" ? headerToken : undefined }, response);
  // Return the value of result to the caller.
  return result;
}

// Perform the side effect or state update expressed on the following line.
test("production, wrong deployment, and wrong database configuration fail before connecting", async () => {
  // Repeat the enclosed work for each required iteration.
  for (const environment of [
    { ...validEnvironment(), DEPLOYMENT_ENV: "production" },
    { ...validEnvironment(), NODE_ENV: "development" },
    { ...validEnvironment(), STAGING_DATABASE_NAME: "other_database" },
    { ...validEnvironment(), MONGODB_URI: "mongodb://staging.invalid:27017/other_database" },
    { ...validEnvironment(), MONGODB_URI: "mongodb://staging.invalid:27017/husseindb" },
  ]) {
    // Declare { state, handler } for use by the surrounding module or function.
    const { state, handler } = setup({ environment });
    // Perform the side effect or state update expressed on the following line.
    assert.equal((await call(handler)).status, 404);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(state.uri, null);
  }
});

// Perform the side effect or state update expressed on the following line.
test("actual husseindb identity fails closed and closes the connection", async () => {
  // Declare { state, handler } for use by the surrounding module or function.
  const { state, handler } = setup({ databaseName: "husseindb" });
  // Perform the side effect or state update expressed on the following line.
  assert.equal((await call(handler)).status, 404);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(state.saved, 0);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(state.closed, true);
});

// Perform the side effect or state update expressed on the following line.
test("wrong configured identity or database user identity cannot be changed", async () => {
  // Repeat the enclosed work for each required iteration.
  for (const environment of [
    { ...validEnvironment(), STAGING_TENANT_ADMIN_EMAIL: "other@example.com" },
    { ...validEnvironment(), STAGING_TENANT_ADMIN_TENANT_ID: "6ab82dce30c1fd52b9dc3e81" },
  ]) {
    // Declare { state, handler } for use by the surrounding module or function.
    const { state, handler } = setup({ environment });
    // Perform the side effect or state update expressed on the following line.
    assert.equal((await call(handler)).status, 404);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(state.uri, null);
  }
  // Repeat the enclosed work for each required iteration.
  for (const rawUser of [
    { email: "other@example.com", tenantId: targetTenant },
    { email: "staging-tenant-admin@example.com", tenantId: "6ab82dce30c1fd52b9dc3e81" },
  ]) {
    // Declare { state, handler } for use by the surrounding module or function.
    const { state, handler } = setup({ rawUser });
    // Perform the side effect or state update expressed on the following line.
    assert.equal((await call(handler)).status, 404);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(state.saved, 0);
  }
});

// Perform the side effect or state update expressed on the following line.
test("missing token is rejected before connection", async () => {
  // Declare { state, handler } for use by the surrounding module or function.
  const { state, handler } = setup();
  // Perform the side effect or state update expressed on the following line.
  assert.equal((await call(handler, { headerToken: null })).status, 403);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(state.uri, null);
});

// Perform the side effect or state update expressed on the following line.
test("successful reset touches the exact tenant account and clears recovery and lock state", async () => {
  // Declare { state, handler } for use by the surrounding module or function.
  const { state, handler } = setup();
  // Declare response for use by the surrounding module or function.
  const response = await call(handler);
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(response, { status: 200, body: { success: true, reset: true } });
  // Perform the side effect or state update expressed on the following line.
  assert.equal(state.found.email, "staging-tenant-admin@example.com");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(state.found.tenantId, targetTenant);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(state.doc.email, "staging-tenant-admin@example.com");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(String(state.doc.tenantId), targetTenant);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(state.doc.password, password);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(state.doc.passwordResetCodeHash, "");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(state.doc.passwordResetExpiresAt, null);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(state.doc.passwordResetAttempts, 0);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(state.doc.loginPinHash, "");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(state.doc.loginPinExpiresAt, null);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(state.doc.loginPinAttempts, 0);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(state.doc.loginPinLastSentAt, null);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(state.doc.loginAttempts, 0);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(state.doc.lockUntil, null);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(state.saved, 1);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(state.closed, true);
});

// Perform the side effect or state update expressed on the following line.
test("User save hook hashes the reset password", async () => {
  // Declare document for use by the surrounding module or function.
  const document = new User({ name: "Test", email: "test@example.com", phone: "0712345678", password, tenantId: targetTenant });
  // Perform the side effect or state update expressed on the following line.
  await runWithTenant({ tenantId: targetTenant, role: "admin", bypass: false }, () => new Promise((resolve, reject) => User.schema.s.hooks.execPre("save", document, (error) => error ? reject(error) : resolve())));
  // Perform the side effect or state update expressed on the following line.
  assert.notEqual(document.password, password);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(await bcrypt.compare(password, document.password), true);
});

// Perform the side effect or state update expressed on the following line.
test("successful reset is one-shot and does not expose supplied credentials", async () => {
  // Declare { state, handler } for use by the surrounding module or function.
  const { state, handler } = setup();
  // Declare first for use by the surrounding module or function.
  const first = await call(handler);
  // Declare second for use by the surrounding module or function.
  const second = await call(handler);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(first.status, 200);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(second.status, 404);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(state.saved, 1);
  // Perform the side effect or state update expressed on the following line.
  assert.doesNotMatch(JSON.stringify(first.body), new RegExp(password));
  // Perform the side effect or state update expressed on the following line.
  assert.doesNotMatch(JSON.stringify(first.body), new RegExp(token));
});
