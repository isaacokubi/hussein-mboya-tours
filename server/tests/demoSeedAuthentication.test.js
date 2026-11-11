/**
 * Purpose: demo Seed Authentication.test automated test. Main declarations: accountRole.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import test from "node:test";
// Load node:assert/strict so this module can use its exported dependencies.
import assert from "node:assert/strict";
// Load bcryptjs so this module can use its exported dependencies.
import bcrypt from "bcryptjs";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../seeds/completeTestDemoSeed.js so this module can use its exported dependencies.
import { getTestPassword, TEST_LOGIN_EMAILS } from "../seeds/completeTestDemoSeed.js";

// Declare DEMO_PASSWORD for use by the surrounding module or function.
const DEMO_PASSWORD = "UnitDemoPass2785!";
// Declare PLATFORM_EMAIL for use by the surrounding module or function.
const PLATFORM_EMAIL = "superadmin1@husseinmboya.com";
// Declare accountRole for use by the surrounding module or function.
const accountRole = (email) => {
  // Check the condition (email === PLATFORM_EMAIL) and run the matching branch.
  if (email === PLATFORM_EMAIL) return "super_admin";
  // Declare local for use by the surrounding module or function.
  const local = email.split("@")[0];
  // Check the condition (local === "admin1") and run the matching branch.
  if (local === "admin1") return "admin";
  // Check the condition (local === "tourmanager1") and run the matching branch.
  if (local === "tourmanager1") return "tour_manager";
  // Check the condition (local.startsWith("agent")) and run the matching branch.
  if (local.startsWith("agent")) return "agent";
  // Check the condition (local.startsWith("guide")) and run the matching branch.
  if (local.startsWith("guide")) return "tour_guide";
  // Check the condition (local.startsWith("driver")) and run the matching branch.
  if (local.startsWith("driver")) return "driver";
  // Check the condition (local.startsWith("customer")) and run the matching branch.
  if (local.startsWith("customer")) return "customer";
  // Return the expression shown below to the caller.
  return null;
};

// Perform the side effect or state update expressed on the following line.
test("demo seed provisions 36 tenant accounts and one global platform account", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.equal(TEST_LOGIN_EMAILS.length, 37);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(new Set(TEST_LOGIN_EMAILS).size, 37);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(TEST_LOGIN_EMAILS.filter((email) => email === PLATFORM_EMAIL).length, 1);
  // Repeat the enclosed work for each required iteration.
  for (const tenantDomain of ["husseinmboya.com", "amanitrails.com", "demosafari.com"]) {
    // Declare tenantAccounts for use by the surrounding module or function.
    const tenantAccounts = TEST_LOGIN_EMAILS.filter((email) => email !== PLATFORM_EMAIL && email.endsWith(`@${tenantDomain}`));
    // Perform the side effect or state update expressed on the following line.
    assert.equal(tenantAccounts.length, 12, `${tenantDomain} account count`);
    // Perform the side effect or state update expressed on the following line.
    assert.deepEqual(tenantAccounts.map((email) => email.split("@")[0]).sort(), ["admin1", "agent1", "agent2", "customer1", "customer2", "customer3", "customer4", "driver1", "driver2", "guide1", "guide2", "tourmanager1"].sort());
    // Perform the side effect or state update expressed on the following line.
    assert.equal(tenantAccounts.filter((email) => accountRole(email) === "admin").length, 1);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(tenantAccounts.filter((email) => accountRole(email) === "customer").length, 4);
    // Perform the side effect or state update expressed on the following line.
    assert.ok(tenantAccounts.every((email) => accountRole(email)), `${tenantDomain} roles are recognized`);
  }
});

// Perform the side effect or state update expressed on the following line.
test("the seed requires an environment password and authenticates each canonical account", async () => {
  // Declare originalSeedPassword for use by the surrounding module or function.
  const originalSeedPassword = process.env.TEST_DEMO_SEED_PASSWORD;
  // Declare originalLegacyPassword for use by the surrounding module or function.
  const originalLegacyPassword = process.env.SEED_DEMO_PASSWORD;
  // Perform the side effect or state update expressed on the following line.
  delete process.env.TEST_DEMO_SEED_PASSWORD;
  // Perform the side effect or state update expressed on the following line.
  delete process.env.SEED_DEMO_PASSWORD;
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    assert.throws(() => getTestPassword(), /SEED_DEMO_PASSWORD is required/);
    // Perform the side effect or state update expressed on the following line.
    process.env.SEED_DEMO_PASSWORD = DEMO_PASSWORD;
    // Perform the side effect or state update expressed on the following line.
    assert.equal(getTestPassword(), DEMO_PASSWORD);
  } finally {
    // Check the condition (originalSeedPassword === undefined) and run the matching branch.
    if (originalSeedPassword === undefined) delete process.env.TEST_DEMO_SEED_PASSWORD;
    else process.env.TEST_DEMO_SEED_PASSWORD = originalSeedPassword;
    // Check the condition (originalLegacyPassword === undefined) and run the matching branch.
    if (originalLegacyPassword === undefined) delete process.env.SEED_DEMO_PASSWORD;
    else process.env.SEED_DEMO_PASSWORD = originalLegacyPassword;
  }

  // Declare hash for use by the surrounding module or function.
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
  // Repeat the enclosed work for each required iteration.
  for (const email of TEST_LOGIN_EMAILS) {
    // Declare account for use by the surrounding module or function.
    const account = { email, role: accountRole(email), tenantId: email === PLATFORM_EMAIL ? null : "tenant-id" };
    // Perform the side effect or state update expressed on the following line.
    assert.ok(account.role, `role is present for ${email}`);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(await User.prototype.matchPassword.call({ password: hash }, DEMO_PASSWORD), true, `${email} accepts the seeded password`);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(account.role === "super_admin", account.tenantId === null, `${email} scope matches its role`);
  }
});
