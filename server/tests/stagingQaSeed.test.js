import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { QA_TENANT_ID, QA_DATABASE_NAME, seedStagingQaData, validateStagingQaEnvironment, verifyStagingQaData } from "../scripts/stagingQaSeedCore.js";
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
  const models = { Organization, User, Customer, Destination, Tour, Booking, Payment };
  const tenantRunner = async (_context, callback) => callback();
  return { data, models, tenantRunner };
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
    { ...environment(), MONGODB_URI: "mongodb://hussein-mboya-tours.onrender.com/global_tours_test" },
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
  const { data, models, tenantRunner } = fixture();
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
    models: {}, seed: async ({ dbName }) => { calls += 1; assert.equal(dbName, QA_DATABASE_NAME); return { dbName, tenant: "verified", customer: true, tour: true, booking: true }; },
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
