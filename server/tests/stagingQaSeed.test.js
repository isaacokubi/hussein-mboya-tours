import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { QA_TENANT_ID, QA_DATABASE_NAME, QA_SEED_MARKER_ID, runStagingQaSeedOnce, seedStagingQaData, validateStagingQaEnvironment, verifyStagingQaData } from "../scripts/stagingQaSeedCore.js";
import { runStagingQaStartupSeed } from "../scripts/stagingQaStartupSeed.js";
import { createStagingQaSeedHandler } from "../routes/internal/stagingSuperAdminBootstrapRoutes.js";

const environment = () => ({ NODE_ENV: "production", DEPLOYMENT_ENV: "staging", STAGING_DATABASE_NAME: QA_DATABASE_NAME, MONGODB_URI: "mongodb://staging-db.invalid:27017/global_tours_test" });
const tenant = { _id: new mongoose.Types.ObjectId(QA_TENANT_ID), slug: "staging-demo-tours" };
const same = (left, right) => String(left) === String(right);

function fixture() {
  const data = new Map();
  const makeModel = (name) => {
    const records = [];
    data.set(name, records);
    function Model(fields) { Object.assign(this, fields); this._id = new mongoose.Types.ObjectId(); this.save = async () => { if (!records.includes(this)) records.push(this); return this; }; }
    Model.findOne = async (filter) => records.find((item) => Object.entries(filter).every(([key, value]) => same(item[key], value))) || null;
    Model.countDocuments = async (filter) => records.filter((item) => Object.entries(filter).every(([key, value]) => same(item[key], value))).length;
    Model.collection = { findOne: async (filter) => records.find((item) => Object.entries(filter).every(([key, value]) => same(item[key], value))) || null, countDocuments: async (filter) => Model.countDocuments(filter) };
    return Model;
  };
  const Organization = { collection: { findOne: async (filter) => same(filter._id, tenant._id) && filter.slug === tenant.slug ? tenant : null } };
  const User = makeModel("User"); User.findOne = async ({ email, tenantId }) => email === "staging-tenant-admin@example.com" && same(tenantId, QA_TENANT_ID) ? { tenantId } : null;
  const Customer = makeModel("Customer"); const Destination = makeModel("Destination"); const Tour = makeModel("Tour"); const Booking = makeModel("Booking"); const Payment = makeModel("Payment");
  let paymentOperations = 0;
  Payment.create = async () => { paymentOperations += 1; throw new Error("Payment creation must not be called by the QA fixture seed."); };
  const models = { Organization, User, Customer, Destination, Tour, Booking, Payment };
  const tenantRunner = async (_context, callback) => callback();
  return { data, models, tenantRunner, get paymentOperations() { return paymentOperations; } };
}

test("staging QA target validation rejects unsafe or incomplete environments before connection", () => {
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
  for (const env of invalid) assert.throws(() => validateStagingQaEnvironment(env));
  assert.deepEqual(validateStagingQaEnvironment(environment()), { dbName: "global_tours_test" });
});

test("requires the actual connected staging database identity", async () => {
  const { models, tenantRunner } = fixture();
  await assert.rejects(seedStagingQaData({ environment: environment(), dbName: "husseindb", models, tenantRunner }), /Connected database/);
  await assert.rejects(seedStagingQaData({ environment: environment(), dbName: "wrong", models, tenantRunner }), /Connected database/);
});

test("refuses a deterministic QA marker already owned by another tenant", async () => {
  const { data, models, tenantRunner } = fixture();
  data.get("Customer").push({ _id: new mongoose.Types.ObjectId(), tenantId: new mongoose.Types.ObjectId(), email: "qa-staging-customer@example.com" });
  await assert.rejects(seedStagingQaData({ environment: environment(), dbName: QA_DATABASE_NAME, models, tenantRunner }), /another tenant/);
});

test("seeds tenant-scoped records, valid references, and pending unpaid booking idempotently", async () => {
  const fixtureData = fixture();
  const { data, models, tenantRunner } = fixtureData;
  const args = { environment: environment(), dbName: QA_DATABASE_NAME, models, tenantRunner };
  const first = await seedStagingQaData(args);
  const second = await seedStagingQaData(args);
  assert.deepEqual([first.customer, first.tour, first.booking], [true, true, true]);
  assert.deepEqual([second.customer, second.tour, second.booking], [false, false, false]);
  for (const name of ["Customer", "Tour", "Booking"]) {
    assert.equal(data.get(name).length, 1);
    assert.equal(String(data.get(name)[0].tenantId), QA_TENANT_ID);
  }
  const [customer] = data.get("Customer"); const [tour] = data.get("Tour"); const [booking] = data.get("Booking");
  assert.equal(String(booking.customer), String(customer._id));
  assert.equal(String(booking.tour), String(tour._id));
  assert.equal(booking.paymentStatus, "pending");
  assert.equal(booking.status, "pending");
  assert.equal(booking.amountPaid, 0);
  assert.equal(data.get("Payment").length, 0);
  assert.equal(fixtureData.paymentOperations, 0, "seed must not invoke a payment operation");
  assert.equal(data.get("User").length, 0, "existing tenant admin must not be created or modified");
  assert.equal(String(tour.tenantId), String(customer.tenantId));
});

test("verification checks tenant, references, payment state, and absence of successful payments", async () => {
  const { models, tenantRunner } = fixture();
  const args = { environment: environment(), dbName: QA_DATABASE_NAME, models, tenantRunner };
  await seedStagingQaData(args);
  assert.equal((await verifyStagingQaData(args)).payment, "unpaid");
  models.Payment.countDocuments = async () => 1;
  await assert.rejects(verifyStagingQaData(args), /successful payment/);
});

test("HTTP trigger requires staging token, verifies the live database, and is one-shot", async () => {
  const token = "qa-seed-test-token-with-at-least-32-characters";
  let calls = 0;
  const handler = createStagingQaSeedHandler({
    environment: { ...environment(), STAGING_QA_SEED_TOKEN: token },
    mongooseClient: { connection: { db: { databaseName: QA_DATABASE_NAME } } },
    models: {}, seed: async ({ mongooseClient }) => { calls += 1; assert.equal(mongooseClient.connection.db.databaseName, QA_DATABASE_NAME); return { dbName: QA_DATABASE_NAME, tenant: "verified", customer: true, tour: true, booking: true }; },
  });
  const invoke = async (headerToken) => {
    const result = { status: 200, body: null };
    const res = { status(code) { result.status = code; return this; }, sendStatus(code) { result.status = code; return this; }, json(body) { result.body = body; return this; } };
    await handler({ get: () => headerToken }, res);
    return result;
  };
  assert.equal((await invoke(null)).status, 403);
  assert.equal((await invoke(token)).status, 200);
  assert.equal((await invoke(token)).status, 404);
  assert.equal(calls, 1);
});

test("startup seed is off unless explicitly enabled and cannot run in production deployment", async () => {
  let calls = 0;
  const runOnce = async () => { calls += 1; };
  for (const flag of [undefined, "false"]) {
    const result = await runStagingQaStartupSeed({ environment: { ...environment(), STAGING_QA_SEED_ON_STARTUP: flag }, runOnce });
    assert.equal(result.enabled, false);
  }
  await assert.rejects(runStagingQaStartupSeed({
    environment: { ...environment(), DEPLOYMENT_ENV: "production", STAGING_QA_SEED_ON_STARTUP: "true" }, runOnce,
  }), /only on the .* staging deployment/);
  await assert.rejects(runStagingQaStartupSeed({
    environment: { ...environment(), NODE_ENV: "development", STAGING_QA_SEED_ON_STARTUP: "true" }, runOnce,
  }), /only on the .* staging deployment/);
  assert.equal(calls, 0);
});

test("enabled startup seed validates guards and calls the fixed one-shot seed", async () => {
  let calls = 0;
  const runOnce = async ({ models, environment: actual }) => {
    calls += 1;
    assert.equal(actual, valid);
    assert.ok(models.Organization);
    return { seeded: true, alreadyComplete: false };
  };
  const valid = { ...environment(), STAGING_QA_SEED_ON_STARTUP: "true" };
  const result = await runStagingQaStartupSeed({ environment: valid, runOnce });
  assert.deepEqual(result, { enabled: true, seeded: true, alreadyComplete: false });
  for (const invalid of [
    { ...valid, STAGING_DATABASE_NAME: "wrong" },
    { ...valid, MONGODB_URI: "" },
    { ...valid, MONGODB_URI: "mongodb://staging-db.invalid/global_tours_test".replace("global_tours_test", "wrong") },
    { ...valid, MONGODB_URI: "mongodb://staging-db.invalid/husseindb" },
    { ...valid, RENDER_EXTERNAL_HOSTNAME: "hussein-mboya-tours.onrender.com" },
  ]) await assert.rejects(runStagingQaStartupSeed({ environment: invalid, runOnce }));
  assert.equal(calls, 1);
});

test("startup seed records a durable marker only after seed and verification, and is idempotent", async () => {
  const markers = new Map();
  const mongooseClient = { connection: { db: {
    databaseName: QA_DATABASE_NAME,
    collection: () => ({
      findOne: async (filter) => markers.get(filter._id) || null,
      insertOne: async (marker) => { if (markers.has(marker._id)) throw Object.assign(new Error("duplicate"), { code: 11000 }); markers.set(marker._id, marker); },
    }),
  } } };
  let seeds = 0; let verifications = 0;
  const args = {
    environment: environment(), mongooseClient, models: {},
    seed: async () => { seeds += 1; },
    verify: async () => { verifications += 1; },
  };
  assert.deepEqual(await runStagingQaSeedOnce(args), { seeded: true, alreadyComplete: false });
  assert.equal(markers.get(QA_SEED_MARKER_ID).databaseName, QA_DATABASE_NAME);
  assert.equal(markers.get(QA_SEED_MARKER_ID).tenantId, QA_TENANT_ID);
  assert.ok(markers.get(QA_SEED_MARKER_ID).completedAt);
  assert.deepEqual(await runStagingQaSeedOnce(args), { seeded: false, alreadyComplete: true });
  assert.deepEqual([seeds, verifications], [1, 1]);
});

test("failed seed or verification never marks completion and fails enabled startup", async () => {
  const markers = new Map();
  const mongooseClient = { connection: { db: {
    databaseName: QA_DATABASE_NAME,
    collection: () => ({ findOne: async (filter) => markers.get(filter._id) || null, insertOne: async (marker) => markers.set(marker._id, marker) }),
  } } };
  await assert.rejects(runStagingQaSeedOnce({ environment: environment(), mongooseClient, models: {}, seed: async () => { throw new Error("fixture failure"); } }), /fixture failure/);
  assert.equal(markers.has(QA_SEED_MARKER_ID), false);
  await assert.rejects(runStagingQaSeedOnce({ environment: environment(), mongooseClient, models: {}, seed: async () => {}, verify: async () => { throw new Error("verification failure"); } }), /verification failure/);
  assert.equal(markers.has(QA_SEED_MARKER_ID), false);
  await assert.rejects(runStagingQaStartupSeed({
    environment: { ...environment(), STAGING_QA_SEED_ON_STARTUP: "true" },
    runOnce: async () => { throw new Error("seed failure"); },
  }), /seed failure/);
});

test("startup seed refuses a connected database other than the exact staging database", async () => {
  const mongooseClient = { connection: { db: { databaseName: "husseindb", collection() { throw new Error("must not read marker"); } } } };
  await assert.rejects(runStagingQaSeedOnce({ environment: environment(), mongooseClient, models: {} }), /Connected database/);
});

test("startup seed refuses an existing marker owned by a different target", async () => {
  const mongooseClient = { connection: { db: {
    databaseName: QA_DATABASE_NAME,
    collection: () => ({ findOne: async () => ({ _id: QA_SEED_MARKER_ID, tenantId: "another-tenant", databaseName: QA_DATABASE_NAME }) }),
  } } };
  await assert.rejects(runStagingQaSeedOnce({ environment: environment(), mongooseClient, models: {} }), /unexpected target/);
});
