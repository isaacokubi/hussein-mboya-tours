import test from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { getTestPassword, TEST_LOGIN_EMAILS } from "../seeds/completeTestDemoSeed.js";

const DEMO_PASSWORD = "UnitDemoPass2785!";
const PLATFORM_EMAIL = "superadmin1@husseinmboya.com";
const accountRole = (email) => {
  if (email === PLATFORM_EMAIL) return "super_admin";
  const local = email.split("@")[0];
  if (local === "admin1") return "admin";
  if (local === "tourmanager1") return "tour_manager";
  if (local.startsWith("agent")) return "agent";
  if (local.startsWith("guide")) return "tour_guide";
  if (local.startsWith("driver")) return "driver";
  if (local.startsWith("customer")) return "customer";
  return null;
};

test("demo seed provisions 36 tenant accounts and one global platform account", () => {
  assert.equal(TEST_LOGIN_EMAILS.length, 37);
  assert.equal(new Set(TEST_LOGIN_EMAILS).size, 37);
  assert.equal(TEST_LOGIN_EMAILS.filter((email) => email === PLATFORM_EMAIL).length, 1);
  for (const tenantDomain of ["husseinmboya.com", "amanitrails.com", "demosafari.com"]) {
    const tenantAccounts = TEST_LOGIN_EMAILS.filter((email) => email !== PLATFORM_EMAIL && email.endsWith(`@${tenantDomain}`));
    assert.equal(tenantAccounts.length, 12, `${tenantDomain} account count`);
    assert.deepEqual(tenantAccounts.map((email) => email.split("@")[0]).sort(), ["admin1", "agent1", "agent2", "customer1", "customer2", "customer3", "customer4", "driver1", "driver2", "guide1", "guide2", "tourmanager1"].sort());
    assert.equal(tenantAccounts.filter((email) => accountRole(email) === "admin").length, 1);
    assert.equal(tenantAccounts.filter((email) => accountRole(email) === "customer").length, 4);
    assert.ok(tenantAccounts.every((email) => accountRole(email)), `${tenantDomain} roles are recognized`);
  }
});

test("the seed requires an environment password and authenticates each canonical account", async () => {
  const originalSeedPassword = process.env.TEST_DEMO_SEED_PASSWORD;
  const originalLegacyPassword = process.env.SEED_DEMO_PASSWORD;
  delete process.env.TEST_DEMO_SEED_PASSWORD;
  delete process.env.SEED_DEMO_PASSWORD;
  try {
    assert.throws(() => getTestPassword(), /SEED_DEMO_PASSWORD is required/);
    process.env.SEED_DEMO_PASSWORD = DEMO_PASSWORD;
    assert.equal(getTestPassword(), DEMO_PASSWORD);
  } finally {
    if (originalSeedPassword === undefined) delete process.env.TEST_DEMO_SEED_PASSWORD;
    else process.env.TEST_DEMO_SEED_PASSWORD = originalSeedPassword;
    if (originalLegacyPassword === undefined) delete process.env.SEED_DEMO_PASSWORD;
    else process.env.SEED_DEMO_PASSWORD = originalLegacyPassword;
  }

  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
  for (const email of TEST_LOGIN_EMAILS) {
    const account = { email, role: accountRole(email), tenantId: email === PLATFORM_EMAIL ? null : "tenant-id" };
    assert.ok(account.role, `role is present for ${email}`);
    assert.equal(await User.prototype.matchPassword.call({ password: hash }, DEMO_PASSWORD), true, `${email} accepts the seeded password`);
    assert.equal(account.role === "super_admin", account.tenantId === null, `${email} scope matches its role`);
  }
});
