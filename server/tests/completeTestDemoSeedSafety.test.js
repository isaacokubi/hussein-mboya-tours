import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { safeTarget, assertSeedConfirmation, getTestPassword, NAMESPACE, TEST_PASSWORD_ENV } from "../seeds/completeTestDemoSeed.js";
import AccountingPeriod from "../models/AccountingPeriod.js";
import WithholdingTax from "../models/WithholdingTax.js";

const original = { env: process.env.NODE_ENV, uri: process.env.MONGODB_URI, global: process.env.ALLOW_GLOBAL_MPESA_FALLBACK, single: process.env.ALLOW_SINGLE_TENANT_DEV_FALLBACK, confirm: process.env.CONFIRM_TEST_SEED, password: process.env.TEST_DEMO_SEED_PASSWORD, atlas: process.env.ALLOW_ATLAS_DEMO_SEED };
function configure({ nodeEnv = "test", db = "global_tours_test", host = "127.0.0.1", globalFallback = "false", singleFallback = "false" } = {}) {
  process.env.NODE_ENV = nodeEnv;
  process.env.MONGODB_URI = `mongodb://${host}:27017/${db}`;
  process.env.ALLOW_GLOBAL_MPESA_FALLBACK = globalFallback;
  process.env.ALLOW_SINGLE_TENANT_DEV_FALLBACK = singleFallback;
}
test.after(() => {
  for (const [key, value] of [["NODE_ENV", original.env], ["MONGODB_URI", original.uri], ["ALLOW_GLOBAL_MPESA_FALLBACK", original.global], ["ALLOW_SINGLE_TENANT_DEV_FALLBACK", original.single], ["CONFIRM_TEST_SEED", original.confirm], ["TEST_DEMO_SEED_PASSWORD", original.password], ["ALLOW_ATLAS_DEMO_SEED", original.atlas]]) {
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
});

test("complete test seed requires the environment password and preserves supported overrides", () => {
  assert.equal(NAMESPACE, "TEST-SEED-GLOBAL-TOURS-2026");
  assert.equal(TEST_PASSWORD_ENV, "SEED_DEMO_PASSWORD");
  delete process.env.TEST_DEMO_SEED_PASSWORD;
  delete process.env.SEED_DEMO_PASSWORD;
  assert.throws(() => getTestPassword(), /SEED_DEMO_PASSWORD is required/);
  process.env.SEED_DEMO_PASSWORD = "UnitDemoPass2785!";
  assert.equal(getTestPassword(), "UnitDemoPass2785!");
  delete process.env.SEED_DEMO_PASSWORD;
  process.env.TEST_DEMO_SEED_PASSWORD = "operator supplied disposable test value";
  assert.equal(getTestPassword(), "operator supplied disposable test value");
});
test("seed guard accepts explicitly named disposable database outside production", () => {
  configure();
  assert.equal(safeTarget().dbName, "global_tours_test");
});
test("seed guard refuses production environment", () => {
  configure({ nodeEnv: "production" });
  assert.throws(() => safeTarget(), /NODE_ENV=production/);
});
test("seed guard refuses database without test/demo namespace", () => {
  configure({ db: "husseindb" });
  assert.throws(() => safeTarget(), /not explicitly test\/demo\/disposable/);
});
test("seed guard refuses remote databases even with a disposable-looking name", () => {
  configure({ db: "global_tours_test", host: "cluster0.example.mongodb.net" });
  assert.throws(() => safeTarget(), /host must be loopback/);
});
test("Atlas opt-in allows only the dedicated global_tours_test database", () => {
  process.env.ALLOW_ATLAS_DEMO_SEED = "YES";
  configure({ db: "global_tours_test", host: "cluster0.cdtxzts.mongodb.net" });
  assert.deepEqual(safeTarget(), { dbName: "global_tours_test", host: "cluster0.cdtxzts.mongodb.net" });
  configure({ db: "husseindb", host: "cluster0.cdtxzts.mongodb.net" });
  assert.throws(() => safeTarget(), /not explicitly test\/demo\/disposable/);
  configure({ db: "global_tours_test", host: "other-cluster.mongodb.net" });
  assert.throws(() => safeTarget(), /host must be loopback/);
  configure({ db: "production", host: "cluster0.example.mongodb.net" });
  assert.throws(() => safeTarget(), /explicit Atlas staging-seed opt-in/);
});
test("seed guard refuses production-looking host or deployment configuration", () => {
  configure({ db: "production_test" });
  assert.throws(() => safeTarget(), /production-looking configuration/);
});
test("seed guard refuses unsafe global and single-tenant payment fallbacks", () => {
  configure({ globalFallback: "true" });
  assert.throws(() => safeTarget(), /unsafe M-Pesa fallback/);
  configure({ singleFallback: "true" });
  assert.throws(() => safeTarget(), /unsafe M-Pesa fallback/);
});
test("seed requires explicit confirmation", () => {
  delete process.env.CONFIRM_TEST_SEED;
  assert.throws(() => assertSeedConfirmation(), /CONFIRM_TEST_SEED=YES/);
  process.env.CONFIRM_TEST_SEED = "YES";
  assert.doesNotThrow(() => assertSeedConfirmation());
});
test("accounting and withholding tax models accept a valid TEST accounting period", () => {
  const accountingPeriod = new AccountingPeriod({ tenantId: new mongoose.Types.ObjectId(), period: "2026-09" });
  const withholdingTax = new WithholdingTax({ tenantId: new mongoose.Types.ObjectId(), payeeName: "TEST supplier", reference: "TEST-WHT-001", taxPeriod: "2026-09", baseAmount: 10000, rate: 5, taxAmount: 500 });
  assert.equal(accountingPeriod.validateSync(), undefined);
  assert.equal(withholdingTax.validateSync(), undefined);
  assert.ok(AccountingPeriod.schema.path("period").options.match.test("2026-09"));
  assert.ok(!AccountingPeriod.schema.path("period").options.match.test("26-09"));
  assert.ok(WithholdingTax.schema.path("taxPeriod").options.match.test("2026-09"));
  assert.ok(!WithholdingTax.schema.path("taxPeriod").options.match.test("2026-13"));
});
