/**
 * Purpose: complete Test Demo Seed Safety.test automated test. Main declarations: configure.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import test from "node:test";
// Load node:assert/strict so this module can use its exported dependencies.
import assert from "node:assert/strict";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../seeds/completeTestDemoSeed.js so this module can use its exported dependencies.
import { safeTarget, assertSeedConfirmation, getTestPassword, NAMESPACE, TEST_PASSWORD_ENV } from "../seeds/completeTestDemoSeed.js";
// Load ../models/AccountingPeriod.js so this module can use its exported dependencies.
import AccountingPeriod from "../models/AccountingPeriod.js";
// Load ../models/WithholdingTax.js so this module can use its exported dependencies.
import WithholdingTax from "../models/WithholdingTax.js";

// Declare original for use by the surrounding module or function.
const original = { env: process.env.NODE_ENV, uri: process.env.MONGODB_URI, global: process.env.ALLOW_GLOBAL_MPESA_FALLBACK, single: process.env.ALLOW_SINGLE_TENANT_DEV_FALLBACK, confirm: process.env.CONFIRM_TEST_SEED, password: process.env.TEST_DEMO_SEED_PASSWORD, atlas: process.env.ALLOW_ATLAS_DEMO_SEED, production: process.env.ALLOW_PRODUCTION_TEST_SEED, productionConfirm: process.env.CONFIRM_PRODUCTION_TEST_SEED };
// Define configure; its parameters and body implement this operation.
function configure({ nodeEnv = "test", db = "global_tours_test", host = "127.0.0.1", globalFallback = "false", singleFallback = "false" } = {}) {
  // Perform the side effect or state update expressed on the following line.
  process.env.NODE_ENV = nodeEnv;
  // Perform the side effect or state update expressed on the following line.
  process.env.MONGODB_URI = `mongodb://${host}:27017/${db}`;
  // Perform the side effect or state update expressed on the following line.
  process.env.ALLOW_GLOBAL_MPESA_FALLBACK = globalFallback;
  // Perform the side effect or state update expressed on the following line.
  process.env.ALLOW_SINGLE_TENANT_DEV_FALLBACK = singleFallback;
}
// Perform the side effect or state update expressed on the following line.
test.after(() => {
  // Repeat the enclosed work for each required iteration.
  for (const [key, value] of [["NODE_ENV", original.env], ["MONGODB_URI", original.uri], ["ALLOW_GLOBAL_MPESA_FALLBACK", original.global], ["ALLOW_SINGLE_TENANT_DEV_FALLBACK", original.single], ["CONFIRM_TEST_SEED", original.confirm], ["TEST_DEMO_SEED_PASSWORD", original.password], ["ALLOW_ATLAS_DEMO_SEED", original.atlas], ["ALLOW_PRODUCTION_TEST_SEED", original.production], ["CONFIRM_PRODUCTION_TEST_SEED", original.productionConfirm]]) {
    // Check the condition (value === undefined) and run the matching branch.
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
});

// Perform the side effect or state update expressed on the following line.
test("complete test seed requires the environment password and preserves supported overrides", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.equal(NAMESPACE, "TEST-SEED-GLOBAL-TOURS-2026");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(TEST_PASSWORD_ENV, "SEED_DEMO_PASSWORD");
  // Perform the side effect or state update expressed on the following line.
  delete process.env.TEST_DEMO_SEED_PASSWORD;
  // Perform the side effect or state update expressed on the following line.
  delete process.env.SEED_DEMO_PASSWORD;
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => getTestPassword(), /SEED_DEMO_PASSWORD is required/);
  // Perform the side effect or state update expressed on the following line.
  process.env.SEED_DEMO_PASSWORD = "UnitDemoPass2785!";
  // Perform the side effect or state update expressed on the following line.
  assert.equal(getTestPassword(), "UnitDemoPass2785!");
  // Perform the side effect or state update expressed on the following line.
  delete process.env.SEED_DEMO_PASSWORD;
  // Perform the side effect or state update expressed on the following line.
  process.env.TEST_DEMO_SEED_PASSWORD = "operator supplied disposable test value";
  // Perform the side effect or state update expressed on the following line.
  assert.equal(getTestPassword(), "operator supplied disposable test value");
});
// Perform the side effect or state update expressed on the following line.
test("seed guard accepts explicitly named disposable database outside production", () => {
  // Perform the side effect or state update expressed on the following line.
  configure();
  // Perform the side effect or state update expressed on the following line.
  assert.equal(safeTarget().dbName, "global_tours_test");
});
// Perform the side effect or state update expressed on the following line.
test("seed guard refuses production environment", () => {
  // Perform the side effect or state update expressed on the following line.
  configure({ nodeEnv: "production" });
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => safeTarget(), /NODE_ENV=production/);
});
// Perform the side effect or state update expressed on the following line.
test("seed guard refuses the application database", () => {
  // Perform the side effect or state update expressed on the following line.
  configure({ db: "husseindb" });
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => safeTarget(), /application database husseindb/);
});
// Perform the side effect or state update expressed on the following line.
test("seed guard refuses remote databases even with a disposable-looking name", () => {
  // Perform the side effect or state update expressed on the following line.
  configure({ db: "global_tours_test", host: "cluster0.example.mongodb.net" });
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => safeTarget(), /host must be loopback/);
});
// Perform the side effect or state update expressed on the following line.
test("Atlas seed opt-in is restricted to the disposable global_tours_test database", () => {
  // Perform the side effect or state update expressed on the following line.
  process.env.ALLOW_ATLAS_DEMO_SEED = "YES";
  // Perform the side effect or state update expressed on the following line.
  configure({ db: "global_tours_test", host: "cluster0.cdtxzts.mongodb.net" });
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(safeTarget(), { dbName: "global_tours_test", host: "cluster0.cdtxzts.mongodb.net" });
  // Perform the side effect or state update expressed on the following line.
  configure({ db: "husseindb", host: "cluster0.cdtxzts.mongodb.net" });
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => safeTarget(), /application database husseindb/);
  // Perform the side effect or state update expressed on the following line.
  configure({ db: "global_tours_test", host: "other-cluster.mongodb.net" });
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => safeTarget(), /host must be loopback/);
  // Perform the side effect or state update expressed on the following line.
  configure({ db: "production", host: "cluster0.example.mongodb.net" });
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => safeTarget(), /exact Atlas staging or production-test opt-in/);
});
// Perform the side effect or state update expressed on the following line.
test("seed guard refuses production-looking host or deployment configuration", () => {
  // Perform the side effect or state update expressed on the following line.
  configure({ db: "production_test" });
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => safeTarget(), /production-looking configuration/);
});
// Perform the side effect or state update expressed on the following line.
test("seed guard refuses unsafe global and single-tenant payment fallbacks", () => {
  // Perform the side effect or state update expressed on the following line.
  configure({ globalFallback: "true" });
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => safeTarget(), /unsafe M-Pesa fallback/);
  // Perform the side effect or state update expressed on the following line.
  configure({ singleFallback: "true" });
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => safeTarget(), /unsafe M-Pesa fallback/);
});
// Perform the side effect or state update expressed on the following line.
test("seed requires explicit confirmation", () => {
  // Perform the side effect or state update expressed on the following line.
  delete process.env.CONFIRM_TEST_SEED;
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => assertSeedConfirmation(), /CONFIRM_TEST_SEED=YES/);
  // Perform the side effect or state update expressed on the following line.
  process.env.CONFIRM_TEST_SEED = "YES";
  // Perform the side effect or state update expressed on the following line.
  assert.doesNotThrow(() => assertSeedConfirmation());
});
// Perform the side effect or state update expressed on the following line.
test("accounting and withholding tax models accept a valid TEST accounting period", () => {
  // Declare accountingPeriod for use by the surrounding module or function.
  const accountingPeriod = new AccountingPeriod({ tenantId: new mongoose.Types.ObjectId(), period: "2026-09" });
  // Declare withholdingTax for use by the surrounding module or function.
  const withholdingTax = new WithholdingTax({ tenantId: new mongoose.Types.ObjectId(), payeeName: "TEST supplier", reference: "TEST-WHT-001", taxPeriod: "2026-09", baseAmount: 10000, rate: 5, taxAmount: 500 });
  // Perform the side effect or state update expressed on the following line.
  assert.equal(accountingPeriod.validateSync(), undefined);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(withholdingTax.validateSync(), undefined);
  // Perform the side effect or state update expressed on the following line.
  assert.ok(AccountingPeriod.schema.path("period").options.match.test("2026-09"));
  // Perform the side effect or state update expressed on the following line.
  assert.ok(!AccountingPeriod.schema.path("period").options.match.test("26-09"));
  // Perform the side effect or state update expressed on the following line.
  assert.ok(WithholdingTax.schema.path("taxPeriod").options.match.test("2026-09"));
  // Perform the side effect or state update expressed on the following line.
  assert.ok(!WithholdingTax.schema.path("taxPeriod").options.match.test("2026-13"));
});

// Perform the side effect or state update expressed on the following line.
test("production database seed requires exact host, database, and two-part explicit authorization", () => {
  // Perform the side effect or state update expressed on the following line.
  configure({ db: "husseindb", host: "cluster0.cdtxzts.mongodb.net" });
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => safeTarget(), /without the exact production-test authorization/);
  // Perform the side effect or state update expressed on the following line.
  process.env.ALLOW_PRODUCTION_TEST_SEED = "YES";
  // Perform the side effect or state update expressed on the following line.
  process.env.CONFIRM_PRODUCTION_TEST_SEED = "YES_SEED_HUSSEINDB_DISPOSABLE_DATA";
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(safeTarget(), { dbName: "husseindb", host: "cluster0.cdtxzts.mongodb.net" });
  // Perform the side effect or state update expressed on the following line.
  delete process.env.CONFIRM_PRODUCTION_TEST_SEED;
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => safeTarget(), /without the exact production-test authorization/);
  // Perform the side effect or state update expressed on the following line.
  process.env.CONFIRM_PRODUCTION_TEST_SEED = "YES_SEED_HUSSEINDB_DISPOSABLE_DATA";
  // Perform the side effect or state update expressed on the following line.
  assertSeedConfirmation();
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => safeTarget({ dbName: "husseindb", host: "other.mongodb.net" }), /without the exact production-test authorization/);
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => safeTarget({ dbName: "otherdb", host: "cluster0.cdtxzts.mongodb.net" }), /host must be loopback/);
  // Perform the side effect or state update expressed on the following line.
  process.env.NODE_ENV = "production";
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => safeTarget(), /NODE_ENV=production/);
});
