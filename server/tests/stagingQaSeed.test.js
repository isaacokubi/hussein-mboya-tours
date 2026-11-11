/**
 * Purpose: staging Qa Seed.test automated test. Main declarations: environment, same, fixture, makeModel, Model.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import test from "node:test";
// Load node:assert/strict so this module can use its exported dependencies.
import assert from "node:assert/strict";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../scripts/stagingQaSeedCore.js so this module can use its exported dependencies.
import { QA_TENANT_ID, QA_DATABASE_NAME, QA_SEED_MARKER_ID, runStagingQaSeedOnce, seedStagingQaData, validateStagingQaEnvironment, verifyStagingQaData } from "../scripts/stagingQaSeedCore.js";
// Load ../scripts/stagingQaStartupSeed.js so this module can use its exported dependencies.
import { runStagingQaStartupSeed } from "../scripts/stagingQaStartupSeed.js";
// Load ../routes/internal/stagingSuperAdminBootstrapRoutes.js so this module can use its exported dependencies.
import { createStagingQaSeedHandler } from "../routes/internal/stagingSuperAdminBootstrapRoutes.js";

// Declare environment for use by the surrounding module or function.
const environment = () => ({ NODE_ENV: "production", DEPLOYMENT_ENV: "staging", STAGING_DATABASE_NAME: QA_DATABASE_NAME, MONGODB_URI: "mongodb://staging-db.invalid:27017/global_tours_test" });
// Declare tenant for use by the surrounding module or function.
const tenant = { _id: new mongoose.Types.ObjectId(QA_TENANT_ID), slug: "staging-demo-tours" };
// Declare same for use by the surrounding module or function.
const same = (left, right) => String(left) === String(right);

// Define fixture; its parameters and body implement this operation.
function fixture() {
  // Declare data for use by the surrounding module or function.
  const data = new Map();
  // Declare makeModel for use by the surrounding module or function.
  const makeModel = (name) => {
    // Declare records for use by the surrounding module or function.
    const records = [];
    // Perform the side effect or state update expressed on the following line.
    data.set(name, records);
    // Define Model; its parameters and body implement this operation.
    function Model(fields) { Object.assign(this, fields); this._id = new mongoose.Types.ObjectId(); this.save = async () => { if (!records.includes(this)) records.push(this); return this; }; }
    // Perform the side effect or state update expressed on the following line.
    Model.findOne = async (filter) => records.find((item) => Object.entries(filter).every(([key, value]) => same(item[key], value))) || null;
    // Perform the side effect or state update expressed on the following line.
    Model.countDocuments = async (filter) => records.filter((item) => Object.entries(filter).every(([key, value]) => same(item[key], value))).length;
    // Perform the side effect or state update expressed on the following line.
    Model.collection = { findOne: async (filter) => records.find((item) => Object.entries(filter).every(([key, value]) => same(item[key], value))) || null, countDocuments: async (filter) => Model.countDocuments(filter) };
    // Return the value of Model to the caller.
    return Model;
  };
  // Declare Organization for use by the surrounding module or function.
  const Organization = { collection: { findOne: async (filter) => same(filter._id, tenant._id) && filter.slug === tenant.slug ? tenant : null } };
  // Declare User for use by the surrounding module or function.
  const User = makeModel("User"); User.findOne = async ({ email, tenantId }) => email === "staging-tenant-admin@example.com" && same(tenantId, QA_TENANT_ID) ? { tenantId } : null;
  // Declare Customer for use by the surrounding module or function.
  const Customer = makeModel("Customer"); const Destination = makeModel("Destination"); const Tour = makeModel("Tour"); const Booking = makeModel("Booking"); const Payment = makeModel("Payment");
  // Declare paymentOperations for use by the surrounding module or function.
  let paymentOperations = 0;
  // Perform the side effect or state update expressed on the following line.
  Payment.create = async () => { paymentOperations += 1; throw new Error("Payment creation must not be called by the QA fixture seed."); };
  // Declare models for use by the surrounding module or function.
  const models = { Organization, User, Customer, Destination, Tour, Booking, Payment };
  // Declare tenantRunner for use by the surrounding module or function.
  const tenantRunner = async (_context, callback) => callback();
  // Return the object assembled below to the caller.
  return { data, models, tenantRunner, get paymentOperations() { return paymentOperations; } };
}

// Perform the side effect or state update expressed on the following line.
test("staging QA target validation rejects unsafe or incomplete environments before connection", () => {
  // Declare invalid for use by the surrounding module or function.
  const invalid = [
    { ...environment(), NODE_ENV: "development" },
    { ...environment(), DEPLOYMENT_ENV: "production" },
    { ...environment(), STAGING_DATABASE_NAME: "" },
    { ...environment(), STAGING_DATABASE_NAME: "other" },
    { ...environment(), MONGODB_URI: "mongodb://staging-db.invalid:27017/other" },
    { ...environment(), MONGODB_URI: "mongodb://staging-db.invalid:27017/husseindb" },
    { ...environment(), MONGODB_URI: "" },
    { ...environment(), RENDER_EXTERNAL_HOSTNAME: "hussein-mboya-tours.onrender.com" },
  ];
  // Repeat the enclosed work for each required iteration.
  for (const env of invalid) assert.throws(() => validateStagingQaEnvironment(env));
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(validateStagingQaEnvironment(environment()), { dbName: "global_tours_test" });
});

// Perform the side effect or state update expressed on the following line.
test("requires the actual connected staging database identity", async () => {
  // Declare { models, tenantRunner } for use by the surrounding module or function.
  const { models, tenantRunner } = fixture();
  // Perform the side effect or state update expressed on the following line.
  await assert.rejects(seedStagingQaData({ environment: environment(), dbName: "husseindb", models, tenantRunner }), /Connected database/);
  // Perform the side effect or state update expressed on the following line.
  await assert.rejects(seedStagingQaData({ environment: environment(), dbName: "wrong", models, tenantRunner }), /Connected database/);
});

// Perform the side effect or state update expressed on the following line.
test("refuses a deterministic QA marker already owned by another tenant", async () => {
  // Declare { data, models, tenantRunner } for use by the surrounding module or function.
  const { data, models, tenantRunner } = fixture();
  // Perform the side effect or state update expressed on the following line.
  data.get("Customer").push({ _id: new mongoose.Types.ObjectId(), tenantId: new mongoose.Types.ObjectId(), email: "qa-staging-customer@example.com" });
  // Perform the side effect or state update expressed on the following line.
  await assert.rejects(seedStagingQaData({ environment: environment(), dbName: QA_DATABASE_NAME, models, tenantRunner }), /another tenant/);
});

// Perform the side effect or state update expressed on the following line.
test("seeds tenant-scoped records, valid references, and pending unpaid booking idempotently", async () => {
  // Declare fixtureData for use by the surrounding module or function.
  const fixtureData = fixture();
  // Declare { data, models, tenantRunner } for use by the surrounding module or function.
  const { data, models, tenantRunner } = fixtureData;
  // Declare args for use by the surrounding module or function.
  const args = { environment: environment(), dbName: QA_DATABASE_NAME, models, tenantRunner };
  // Declare first for use by the surrounding module or function.
  const first = await seedStagingQaData(args);
  // Declare second for use by the surrounding module or function.
  const second = await seedStagingQaData(args);
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual([first.customer, first.tour, first.booking], [true, true, true]);
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual([second.customer, second.tour, second.booking], [false, false, false]);
  // Repeat the enclosed work for each required iteration.
  for (const name of ["Customer", "Tour", "Booking"]) {
    // Perform the side effect or state update expressed on the following line.
    assert.equal(data.get(name).length, 1);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(String(data.get(name)[0].tenantId), QA_TENANT_ID);
  }
  // Declare [customer] for use by the surrounding module or function.
  const [customer] = data.get("Customer"); const [tour] = data.get("Tour"); const [booking] = data.get("Booking");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(String(booking.customer), String(customer._id));
  // Perform the side effect or state update expressed on the following line.
  assert.equal(String(booking.tour), String(tour._id));
  // Perform the side effect or state update expressed on the following line.
  assert.equal(booking.paymentStatus, "pending");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(booking.status, "pending");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(booking.amountPaid, 0);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(data.get("Payment").length, 0);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(fixtureData.paymentOperations, 0, "seed must not invoke a payment operation");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(data.get("User").length, 0, "existing tenant admin must not be created or modified");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(String(tour.tenantId), String(customer.tenantId));
});

// Perform the side effect or state update expressed on the following line.
test("verification checks tenant, references, payment state, and absence of successful payments", async () => {
  // Declare { models, tenantRunner } for use by the surrounding module or function.
  const { models, tenantRunner } = fixture();
  // Declare args for use by the surrounding module or function.
  const args = { environment: environment(), dbName: QA_DATABASE_NAME, models, tenantRunner };
  // Perform the side effect or state update expressed on the following line.
  await seedStagingQaData(args);
  // Perform the side effect or state update expressed on the following line.
  assert.equal((await verifyStagingQaData(args)).payment, "unpaid");
  // Perform the side effect or state update expressed on the following line.
  models.Payment.countDocuments = async () => 1;
  // Perform the side effect or state update expressed on the following line.
  await assert.rejects(verifyStagingQaData(args), /successful payment/);
});

// Perform the side effect or state update expressed on the following line.
test("HTTP trigger requires staging token, verifies the live database, and is one-shot", async () => {
  // Declare token for use by the surrounding module or function.
  const token = "qa-seed-test-token-with-at-least-32-characters";
  // Declare calls for use by the surrounding module or function.
  let calls = 0;
  // Declare handler for use by the surrounding module or function.
  const handler = createStagingQaSeedHandler({
    environment: { ...environment(), STAGING_QA_SEED_TOKEN: token },
    mongooseClient: { connection: { db: { databaseName: QA_DATABASE_NAME } } },
    models: {}, seed: async ({ mongooseClient }) => { calls += 1; assert.equal(mongooseClient.connection.db.databaseName, QA_DATABASE_NAME); return { dbName: QA_DATABASE_NAME, tenant: "verified", customer: true, tour: true, booking: true }; },
  });
  // Declare invoke for use by the surrounding module or function.
  const invoke = async (headerToken) => {
    // Declare result for use by the surrounding module or function.
    const result = { status: 200, body: null };
    // Declare res for use by the surrounding module or function.
    const res = { status(code) { result.status = code; return this; }, sendStatus(code) { result.status = code; return this; }, json(body) { result.body = body; return this; } };
    // Perform the side effect or state update expressed on the following line.
    await handler({ get: () => headerToken }, res);
    // Return the value of result to the caller.
    return result;
  };
  // Perform the side effect or state update expressed on the following line.
  assert.equal((await invoke(null)).status, 403);
  // Perform the side effect or state update expressed on the following line.
  assert.equal((await invoke(token)).status, 200);
  // Perform the side effect or state update expressed on the following line.
  assert.equal((await invoke(token)).status, 404);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(calls, 1);
});

// Perform the side effect or state update expressed on the following line.
test("startup seed is off unless explicitly enabled and cannot run in production deployment", async () => {
  // Declare calls for use by the surrounding module or function.
  let calls = 0;
  // Declare runOnce for use by the surrounding module or function.
  const runOnce = async () => { calls += 1; };
  // Repeat the enclosed work for each required iteration.
  for (const flag of [undefined, "false"]) {
    // Declare result for use by the surrounding module or function.
    const result = await runStagingQaStartupSeed({ environment: { ...environment(), STAGING_QA_SEED_ON_STARTUP: flag }, runOnce });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(result.enabled, false);
  }
  // Perform the side effect or state update expressed on the following line.
  await assert.rejects(runStagingQaStartupSeed({
    environment: { ...environment(), DEPLOYMENT_ENV: "production", STAGING_QA_SEED_ON_STARTUP: "true" }, runOnce,
  }), /only on the .* staging deployment/);
  // Perform the side effect or state update expressed on the following line.
  await assert.rejects(runStagingQaStartupSeed({
    environment: { ...environment(), NODE_ENV: "development", STAGING_QA_SEED_ON_STARTUP: "true" }, runOnce,
  }), /only on the .* staging deployment/);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(calls, 0);
});

// Perform the side effect or state update expressed on the following line.
test("enabled startup seed validates guards and calls the fixed one-shot seed", async () => {
  // Declare calls for use by the surrounding module or function.
  let calls = 0;
  // Declare runOnce for use by the surrounding module or function.
  const runOnce = async ({ models, environment: actual }) => {
    // Perform the side effect or state update expressed on the following line.
    calls += 1;
    // Perform the side effect or state update expressed on the following line.
    assert.equal(actual, valid);
    // Perform the side effect or state update expressed on the following line.
    assert.ok(models.Organization);
    // Return the object assembled below to the caller.
    return { seeded: true, alreadyComplete: false };
  };
  // Declare valid for use by the surrounding module or function.
  const valid = { ...environment(), STAGING_QA_SEED_ON_STARTUP: "true" };
  // Declare result for use by the surrounding module or function.
  const result = await runStagingQaStartupSeed({ environment: valid, runOnce });
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(result, { enabled: true, seeded: true, alreadyComplete: false });
  // Repeat the enclosed work for each required iteration.
  for (const invalid of [
    { ...valid, STAGING_DATABASE_NAME: "wrong" },
    { ...valid, MONGODB_URI: "" },
    { ...valid, MONGODB_URI: "mongodb://staging-db.invalid/global_tours_test".replace("global_tours_test", "wrong") },
    { ...valid, MONGODB_URI: "mongodb://staging-db.invalid/husseindb" },
    { ...valid, RENDER_EXTERNAL_HOSTNAME: "hussein-mboya-tours.onrender.com" },
  ]) await assert.rejects(runStagingQaStartupSeed({ environment: invalid, runOnce }));
  // Perform the side effect or state update expressed on the following line.
  assert.equal(calls, 1);
});

// Perform the side effect or state update expressed on the following line.
test("startup seed records a durable marker only after seed and verification, and is idempotent", async () => {
  // Declare markers for use by the surrounding module or function.
  const markers = new Map();
  // Declare mongooseClient for use by the surrounding module or function.
  const mongooseClient = { connection: { db: {
    databaseName: QA_DATABASE_NAME,
    collection: () => ({
      findOne: async (filter) => markers.get(filter._id) || null,
      insertOne: async (marker) => { if (markers.has(marker._id)) throw Object.assign(new Error("duplicate"), { code: 11000 }); markers.set(marker._id, marker); },
    }),
  } } };
  // Declare seeds for use by the surrounding module or function.
  let seeds = 0; let verifications = 0;
  // Declare args for use by the surrounding module or function.
  const args = {
    environment: environment(), mongooseClient, models: {},
    seed: async () => { seeds += 1; },
    verify: async () => { verifications += 1; },
  };
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(await runStagingQaSeedOnce(args), { seeded: true, alreadyComplete: false });
  // Perform the side effect or state update expressed on the following line.
  assert.equal(markers.get(QA_SEED_MARKER_ID).databaseName, QA_DATABASE_NAME);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(markers.get(QA_SEED_MARKER_ID).tenantId, QA_TENANT_ID);
  // Perform the side effect or state update expressed on the following line.
  assert.ok(markers.get(QA_SEED_MARKER_ID).completedAt);
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(await runStagingQaSeedOnce(args), { seeded: false, alreadyComplete: true });
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual([seeds, verifications], [1, 1]);
});

// Perform the side effect or state update expressed on the following line.
test("failed seed or verification never marks completion and fails enabled startup", async () => {
  // Declare markers for use by the surrounding module or function.
  const markers = new Map();
  // Declare mongooseClient for use by the surrounding module or function.
  const mongooseClient = { connection: { db: {
    databaseName: QA_DATABASE_NAME,
    collection: () => ({ findOne: async (filter) => markers.get(filter._id) || null, insertOne: async (marker) => markers.set(marker._id, marker) }),
  } } };
  // Perform the side effect or state update expressed on the following line.
  await assert.rejects(runStagingQaSeedOnce({ environment: environment(), mongooseClient, models: {}, seed: async () => { throw new Error("fixture failure"); } }), /fixture failure/);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(markers.has(QA_SEED_MARKER_ID), false);
  // Perform the side effect or state update expressed on the following line.
  await assert.rejects(runStagingQaSeedOnce({ environment: environment(), mongooseClient, models: {}, seed: async () => {}, verify: async () => { throw new Error("verification failure"); } }), /verification failure/);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(markers.has(QA_SEED_MARKER_ID), false);
  // Perform the side effect or state update expressed on the following line.
  await assert.rejects(runStagingQaStartupSeed({
    environment: { ...environment(), STAGING_QA_SEED_ON_STARTUP: "true" },
    runOnce: async () => { throw new Error("seed failure"); },
  }), /seed failure/);
});

// Perform the side effect or state update expressed on the following line.
test("startup seed refuses a connected database other than the exact staging database", async () => {
  // Declare mongooseClient for use by the surrounding module or function.
  const mongooseClient = { connection: { db: { databaseName: "husseindb", collection() { throw new Error("must not read marker"); } } } };
  // Perform the side effect or state update expressed on the following line.
  await assert.rejects(runStagingQaSeedOnce({ environment: environment(), mongooseClient, models: {} }), /Connected database/);
});

// Perform the side effect or state update expressed on the following line.
test("startup seed refuses an existing marker owned by a different target", async () => {
  // Declare mongooseClient for use by the surrounding module or function.
  const mongooseClient = { connection: { db: {
    databaseName: QA_DATABASE_NAME,
    collection: () => ({ findOne: async () => ({ _id: QA_SEED_MARKER_ID, tenantId: "another-tenant", databaseName: QA_DATABASE_NAME }) }),
  } } };
  // Perform the side effect or state update expressed on the following line.
  await assert.rejects(runStagingQaSeedOnce({ environment: environment(), mongooseClient, models: {} }), /unexpected target/);
});
