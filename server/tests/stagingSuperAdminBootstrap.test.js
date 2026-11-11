/**
 * Purpose: staging Super Admin Bootstrap.test automated test. Main declarations: withPlatformContext.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import test from "node:test";
// Load node:assert/strict so this module can use its exported dependencies.
import assert from "node:assert/strict";
// Load node:fs so this module can use its exported dependencies.
import fs from "node:fs";
// Load ../config/mongoConfig.js so this module can use its exported dependencies.
import { STAGING_SUPERADMIN_DATABASE_NAME, validateStagingSuperAdminBootstrapTarget } from "../config/mongoConfig.js";
// Load ../services/onboardingService.js so this module can use its exported dependencies.
import { bootstrapStagingSuperAdmin } from "../services/onboardingService.js";

// Declare validTarget for use by the surrounding module or function.
const validTarget = {
  nodeEnv: "production",
  deploymentEnv: "staging",
  stagingDatabaseName: "global_tours_test",
  uri: "mongodb://127.0.0.1:27017/global_tours_test",
};

// Perform the side effect or state update expressed on the following line.
test("staging bootstrap target rejects production mode and non-staging deployment", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => validateStagingSuperAdminBootstrapTarget({ ...validTarget, nodeEnv: "development" }), /requires NODE_ENV=production/);
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => validateStagingSuperAdminBootstrapTarget({ ...validTarget, deploymentEnv: "production" }), /refuses production deployment mode/);
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => validateStagingSuperAdminBootstrapTarget({ ...validTarget, deploymentEnv: "other" }), /requires DEPLOYMENT_ENV=staging/);
});

// Perform the side effect or state update expressed on the following line.
test("staging bootstrap target requires the exact staging database and rejects husseindb", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.equal(STAGING_SUPERADMIN_DATABASE_NAME, "global_tours_test");
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => validateStagingSuperAdminBootstrapTarget({ ...validTarget, stagingDatabaseName: "" }), /STAGING_DATABASE_NAME=global_tours_test/);
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => validateStagingSuperAdminBootstrapTarget({ ...validTarget, stagingDatabaseName: "other_db" }), /STAGING_DATABASE_NAME=global_tours_test/);
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => validateStagingSuperAdminBootstrapTarget({ ...validTarget, uri: "mongodb://127.0.0.1:27017/husseindb" }), /never target the production database/);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(validateStagingSuperAdminBootstrapTarget(validTarget), true);
});

// Perform the side effect or state update expressed on the following line.
test("staging bootstrap service creates a tenantless platform account and skips an existing SuperAdmin", async () => {
  // Declare created for use by the surrounding module or function.
  const created = [];
  // Declare withPlatformContext for use by the surrounding module or function.
  const withPlatformContext = async (_context, callback) => callback();
  // Declare userModel for use by the surrounding module or function.
  const userModel = {
    findOne: () => ({ lean: async () => null }),
    create: async (data) => {
      // Perform the side effect or state update expressed on the following line.
      created.push(data);
      // Return the object assembled below to the caller.
      return { ...data, _id: "platform-user-id" };
    },
    deleteOne: async () => ({ deletedCount: 1 }),
  };
  // Declare dependencies for use by the surrounding module or function.
  const dependencies = {
    count: async () => 0,
    userModel,
    ensureRoles: async () => ({ superadmin: { _id: "superadmin-role-id" } }),
    withPlatformContext,
  };
  // Declare result for use by the surrounding module or function.
  const result = await bootstrapStagingSuperAdmin({
    name: "Staging Admin", email: "staging@example.invalid", phone: "0712345678", password: "StrongPassword42",
  }, dependencies);

  // Perform the side effect or state update expressed on the following line.
  assert.equal(result.created, true);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(result.superAdmin.tenantId, null);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(created.length, 1);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(created[0].role, "super_admin");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(created[0].status, "active");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(created[0].isVerified, true);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(created[0].tenantId, null);

  // Declare createCalled for use by the surrounding module or function.
  let createCalled = false;
  // Declare existingResult for use by the surrounding module or function.
  const existingResult = await bootstrapStagingSuperAdmin({}, {
    ...dependencies,
    count: async () => 1,
    userModel: { ...userModel, create: async () => { createCalled = true; } },
  });
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(existingResult, { created: false, reason: "exists" });
  // Perform the side effect or state update expressed on the following line.
  assert.equal(createCalled, false);
});

// Perform the side effect or state update expressed on the following line.
test("staging bootstrap validates lowercase as well as uppercase, number, and length", async () => {
  // Perform the side effect or state update expressed on the following line.
  await assert.rejects(bootstrapStagingSuperAdmin({
    name: "Staging Admin", email: "staging@example.invalid", phone: "0712345678", password: "UPPERCASE1234",
  }, { count: async () => 0 }), /lowercase/);
});

// Perform the side effect or state update expressed on the following line.
test("staging bootstrap command cannot invoke tenant or business creation", () => {
  // Declare script for use by the surrounding module or function.
  const script = fs.readFileSync(new URL("../scripts/bootstrapStagingSuperAdmin.js", import.meta.url), "utf8");
  // Perform the side effect or state update expressed on the following line.
  assert.match(script, /validateStagingSuperAdminBootstrapTarget/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(script, /mongoose\.connection\.db\?\.databaseName/);
  // Perform the side effect or state update expressed on the following line.
  assert.doesNotMatch(script, /Organization|createTenant|Destination\.create|Tour\.create|Booking\.create|mpesa|stkpush/i);
  // Perform the side effect or state update expressed on the following line.
  assert.match(fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"), /bootstrap:staging-superadmin/);
});
