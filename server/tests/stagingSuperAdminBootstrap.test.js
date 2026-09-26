import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { STAGING_SUPERADMIN_DATABASE_NAME, validateStagingSuperAdminBootstrapTarget } from "../config/mongoConfig.js";
import { bootstrapStagingSuperAdmin } from "../services/onboardingService.js";

const validTarget = {
  nodeEnv: "production",
  deploymentEnv: "staging",
  stagingDatabaseName: "global_tours_test",
  uri: "mongodb://127.0.0.1:27017/global_tours_test",
};

test("staging bootstrap target rejects production mode and non-staging deployment", () => {
  assert.throws(() => validateStagingSuperAdminBootstrapTarget({ ...validTarget, nodeEnv: "development" }), /requires NODE_ENV=production/);
  assert.throws(() => validateStagingSuperAdminBootstrapTarget({ ...validTarget, deploymentEnv: "production" }), /refuses production deployment mode/);
  assert.throws(() => validateStagingSuperAdminBootstrapTarget({ ...validTarget, deploymentEnv: "other" }), /requires DEPLOYMENT_ENV=staging/);
});

test("staging bootstrap target requires the exact staging database and rejects husseindb", () => {
  assert.equal(STAGING_SUPERADMIN_DATABASE_NAME, "global_tours_test");
  assert.throws(() => validateStagingSuperAdminBootstrapTarget({ ...validTarget, stagingDatabaseName: "" }), /STAGING_DATABASE_NAME=global_tours_test/);
  assert.throws(() => validateStagingSuperAdminBootstrapTarget({ ...validTarget, stagingDatabaseName: "other_db" }), /STAGING_DATABASE_NAME=global_tours_test/);
  assert.throws(() => validateStagingSuperAdminBootstrapTarget({ ...validTarget, uri: "mongodb://127.0.0.1:27017/husseindb" }), /never target the production database/);
  assert.equal(validateStagingSuperAdminBootstrapTarget(validTarget), true);
});

test("staging bootstrap service creates a tenantless platform account and skips an existing SuperAdmin", async () => {
  const created = [];
  const withPlatformContext = async (_context, callback) => callback();
  const userModel = {
    findOne: () => ({ lean: async () => null }),
    create: async (data) => {
      created.push(data);
      return { ...data, _id: "platform-user-id" };
    },
    deleteOne: async () => ({ deletedCount: 1 }),
  };
  const dependencies = {
    count: async () => 0,
    userModel,
    ensureRoles: async () => ({ superadmin: { _id: "superadmin-role-id" } }),
    withPlatformContext,
  };
  const result = await bootstrapStagingSuperAdmin({
    name: "Staging Admin", email: "staging@example.invalid", phone: "0712345678", password: "StrongPassword42",
  }, dependencies);

  assert.equal(result.created, true);
  assert.equal(result.superAdmin.tenantId, null);
  assert.equal(created.length, 1);
  assert.equal(created[0].role, "super_admin");
  assert.equal(created[0].status, "active");
  assert.equal(created[0].isVerified, true);
  assert.equal(created[0].tenantId, null);

  let createCalled = false;
  const existingResult = await bootstrapStagingSuperAdmin({}, {
    ...dependencies,
    count: async () => 1,
    userModel: { ...userModel, create: async () => { createCalled = true; } },
  });
  assert.deepEqual(existingResult, { created: false, reason: "exists" });
  assert.equal(createCalled, false);
});

test("staging bootstrap validates lowercase as well as uppercase, number, and length", async () => {
  await assert.rejects(bootstrapStagingSuperAdmin({
    name: "Staging Admin", email: "staging@example.invalid", phone: "0712345678", password: "UPPERCASE1234",
  }, { count: async () => 0 }), /lowercase/);
});

test("staging bootstrap command cannot invoke tenant or business creation", () => {
  const script = fs.readFileSync(new URL("../scripts/bootstrapStagingSuperAdmin.js", import.meta.url), "utf8");
  assert.match(script, /validateStagingSuperAdminBootstrapTarget/);
  assert.match(script, /mongoose\.connection\.db\?\.databaseName/);
  assert.doesNotMatch(script, /Organization|createTenant|Destination\.create|Tour\.create|Booking\.create|mpesa|stkpush/i);
  assert.match(fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"), /bootstrap:staging-superadmin/);
});
