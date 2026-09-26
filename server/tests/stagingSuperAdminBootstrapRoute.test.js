import test from "node:test";
import assert from "node:assert/strict";
import { createStagingSuperAdminBootstrapHandler } from "../routes/internal/stagingSuperAdminBootstrapRoutes.js";

const token = "test-only-staging-trigger-token-value-123456789";
const validEnvironment = () => ({
  NODE_ENV: "production",
  DEPLOYMENT_ENV: "staging",
  STAGING_DATABASE_NAME: "global_tours_test",
  MONGODB_URI: "mongodb://staging.invalid:27017/global_tours_test",
  STAGING_BOOTSTRAP_TRIGGER_TOKEN: token,
  BOOTSTRAP_STAGING_SUPERADMIN_NAME: "Staging Platform Admin",
  BOOTSTRAP_STAGING_SUPERADMIN_EMAIL: "staging-admin@example.invalid",
  BOOTSTRAP_STAGING_SUPERADMIN_PHONE: "0712345678",
  BOOTSTRAP_STAGING_SUPERADMIN_PASSWORD: "A-Strong-Password-42",
});

async function callHandler(handler, { headerToken, body, queryToken } = {}) {
  const result = { status: 200, body: undefined };
  const response = {
    status(code) { result.status = code; return this; },
    sendStatus(code) { result.status = code; return this; },
    json(payload) { result.body = payload; return this; },
  };
  const request = {
    body,
    query: queryToken ? { token: queryToken } : {},
    get(name) { return name.toLowerCase() === "x-staging-bootstrap-token" ? headerToken : undefined; },
  };
  await handler(request, response);
  return result;
}

const fakeMongoose = ({ databaseName = "global_tours_test" } = {}) => {
  const calls = { uri: null, closed: false, models: [] };
  return {
    calls,
    createConnection(uri) {
      calls.uri = uri;
      return {
        db: { databaseName },
        asPromise: async () => {},
        model(name, schema) { calls.models.push(name); return { modelName: name, schema }; },
        close: async () => { calls.closed = true; },
      };
    },
  };
};

test("production and non-staging deployment are hidden before connecting", async () => {
  for (const environment of [
    { ...validEnvironment(), DEPLOYMENT_ENV: "production" },
    { ...validEnvironment(), NODE_ENV: "development" },
    { ...validEnvironment(), DEPLOYMENT_ENV: "preview" },
  ]) {
    const mongooseClient = fakeMongoose();
    let bootstrapCalled = false;
    const handler = createStagingSuperAdminBootstrapHandler({ environment, mongooseClient, bootstrap: async () => { bootstrapCalled = true; } });
    assert.equal((await callHandler(handler, { headerToken: token })).status, 404);
    assert.equal(mongooseClient.calls.uri, null);
    assert.equal(bootstrapCalled, false);
  }
});

test("missing and incorrect header tokens are rejected without connection or bootstrap", async () => {
  for (const headerToken of [undefined, "incorrect-token-value-which-is-long-enough"]) {
    const mongooseClient = fakeMongoose();
    let bootstrapCalled = false;
    const handler = createStagingSuperAdminBootstrapHandler({
      environment: validEnvironment(), mongooseClient,
      bootstrap: async () => { bootstrapCalled = true; },
    });
    const response = await callHandler(handler, { headerToken });
    assert.equal(response.status, 403);
    assert.doesNotMatch(JSON.stringify(response.body), new RegExp(token));
    assert.equal(mongooseClient.calls.uri, null);
    assert.equal(bootstrapCalled, false);
  }
});

test("staging database guards reject husseindb in config and URI", async () => {
  for (const environment of [
    { ...validEnvironment(), STAGING_DATABASE_NAME: "husseindb" },
    { ...validEnvironment(), MONGODB_URI: "mongodb://staging.invalid:27017/husseindb" },
  ]) {
    const mongooseClient = fakeMongoose();
    let bootstrapCalled = false;
    const handler = createStagingSuperAdminBootstrapHandler({ environment, mongooseClient, bootstrap: async () => { bootstrapCalled = true; } });
    assert.equal((await callHandler(handler, { headerToken: token })).status, 404);
    assert.equal(mongooseClient.calls.uri, null);
    assert.equal(bootstrapCalled, false);
  }
});

test("missing bootstrap identity environment values keep the trigger unavailable", async () => {
  const environment = validEnvironment();
  delete environment.BOOTSTRAP_STAGING_SUPERADMIN_PASSWORD;
  const mongooseClient = fakeMongoose();
  let bootstrapCalled = false;
  const handler = createStagingSuperAdminBootstrapHandler({
    environment, mongooseClient,
    bootstrap: async () => { bootstrapCalled = true; },
  });
  assert.equal((await callHandler(handler, { headerToken: token })).status, 404);
  assert.equal(mongooseClient.calls.uri, null);
  assert.equal(bootstrapCalled, false);
});

test("wrong connected database identity is hidden and its connection is closed", async () => {
  const mongooseClient = fakeMongoose({ databaseName: "husseindb" });
  let bootstrapCalled = false;
  const handler = createStagingSuperAdminBootstrapHandler({
    environment: validEnvironment(), mongooseClient,
    bootstrap: async () => { bootstrapCalled = true; },
  });
  const response = await callHandler(handler, { headerToken: token });
  assert.equal(response.status, 404);
  assert.equal(bootstrapCalled, false);
  assert.equal(mongooseClient.calls.closed, true);
});

test("valid trigger uses only environment credentials, ignores body credentials, and closes its staging connection", async () => {
  const environment = validEnvironment();
  const mongooseClient = fakeMongoose();
  const serviceCalls = [];
  const handler = createStagingSuperAdminBootstrapHandler({
    environment, mongooseClient,
    bootstrap: async (identity, dependencies) => {
      serviceCalls.push({ identity, dependencies });
      return { created: true, superAdmin: { tenantId: null } };
    },
  });
  const response = await callHandler(handler, {
    headerToken: token,
    body: { name: "attacker", email: "attacker@example.invalid", phone: "0000000000", password: "attacker" },
  });
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { success: true, created: true });

  assert.equal(mongooseClient.calls.uri, environment.MONGODB_URI);
  assert.equal(mongooseClient.calls.closed, true);
  assert.deepEqual(mongooseClient.calls.models, ["User", "Role", "Permission"]);
  assert.deepEqual(serviceCalls[0].identity, {
    name: environment.BOOTSTRAP_STAGING_SUPERADMIN_NAME,
    email: environment.BOOTSTRAP_STAGING_SUPERADMIN_EMAIL,
    phone: environment.BOOTSTRAP_STAGING_SUPERADMIN_PHONE,
    password: environment.BOOTSTRAP_STAGING_SUPERADMIN_PASSWORD,
  });
  assert.notEqual(serviceCalls[0].identity.name, "attacker");
});

test("an existing platform SuperAdmin returns safe exists status and the trigger becomes one-shot", async () => {
  const mongooseClient = fakeMongoose();
  let bootstrapCalls = 0;
  const handler = createStagingSuperAdminBootstrapHandler({
    environment: validEnvironment(), mongooseClient,
    bootstrap: async () => { bootstrapCalls += 1; return { created: false, reason: "exists" }; },
  });
  const first = await callHandler(handler, { headerToken: token });
  assert.equal(first.status, 200);
  assert.deepEqual(first.body, { success: true, created: false, reason: "exists" });
  const second = await callHandler(handler, { headerToken: token });
  assert.equal(second.status, 404);
  assert.equal(bootstrapCalls, 1);
});

test("endpoint never accepts credentials in URL and requires the dedicated header", async () => {
  const mongooseClient = fakeMongoose();
  let bootstrapCalled = false;
  const handler = createStagingSuperAdminBootstrapHandler({
    environment: validEnvironment(), mongooseClient,
    bootstrap: async () => { bootstrapCalled = true; return { created: true }; },
  });
  const response = await callHandler(handler, { queryToken: token });
  assert.equal(response.status, 403);
  assert.doesNotMatch(JSON.stringify(response.body), /should-not-be-used|password|token/i);
  assert.equal(bootstrapCalled, false);
});
