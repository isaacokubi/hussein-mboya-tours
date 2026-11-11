/**
 * Purpose: mongo Config.test automated test. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import test from "node:test";
// Load node:assert/strict so this module can use its exported dependencies.
import assert from "node:assert/strict";
// Load ../config/mongoConfig.js so this module can use its exported dependencies.
import {
  PRODUCTION_DATABASE_NAME,
  validateDeploymentMongoUri,
  validateProductionMongoUri,
  validateStagingMongoUri,
} from "../config/mongoConfig.js";
// Load ../config/envValidation.js so this module can use its exported dependencies.
import { assertRequiredEnvironment } from "../config/envValidation.js";
// Load ./integrationMongoUri.js so this module can use its exported dependencies.
import { getDisposableIntegrationMongoUri } from "./integrationMongoUri.js";

// Perform the side effect or state update expressed on the following line.
process.env.NODE_ENV = "test";
// Perform the side effect or state update expressed on the following line.
process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/mongo_config_test";
// Perform the side effect or state update expressed on the following line.
process.env.JWT_SECRET = "ci-only-test-secret";

// Perform the side effect or state update expressed on the following line.
test("production MongoDB target is the existing husseindb database", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.equal(PRODUCTION_DATABASE_NAME, "husseindb");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(validateProductionMongoUri("mongodb+srv://cluster.example/husseindb?retryWrites=true&w=majority"), true);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(validateProductionMongoUri("mongodb://localhost:27017/husseindb?tls=true"), true);
});

// Perform the side effect or state update expressed on the following line.
test("production MongoDB target rejects a missing or different database without echoing the URI", () => {
  // Repeat the enclosed work for each required iteration.
  for (const uri of [undefined, "mongodb+srv://host.example/", "mongodb://localhost:27017/otherdb"]) {
    // Perform the side effect or state update expressed on the following line.
    assert.throws(() => validateProductionMongoUri(uri), (error) => {
      // Perform the side effect or state update expressed on the following line.
      assert.equal(error.message.includes("<password>"), false);
      // Perform the side effect or state update expressed on the following line.
      assert.equal(error.message.includes("host.example"), false);
      // Return the expression shown below to the caller.
      return true;
    });
  }
});

// Perform the side effect or state update expressed on the following line.
test("production MongoDB target rejects non-MongoDB and malformed connection strings safely", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => validateProductionMongoUri("https://example/husseindb"), /mongodb:\/\/ or mongodb\+srv:\/\//);
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => validateProductionMongoUri("mongodb+srv://cluster.example/%ZZ"), (error) => {
    // Perform the side effect or state update expressed on the following line.
    assert.equal(error.message.includes("<password>"), false);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(error.message.includes("cluster.example"), false);
    // Return the expression shown below to the caller.
    return true;
  });
});

// Perform the side effect or state update expressed on the following line.
test("staging MongoDB target requires the designated database and refuses production", () => {
  // Declare testUri for use by the surrounding module or function.
  const testUri = "mongodb+srv://cluster.example/atlas_test_db?retryWrites=true&w=majority";
  // Perform the side effect or state update expressed on the following line.
  assert.equal(validateStagingMongoUri(testUri, "atlas_test_db"), true);
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => validateStagingMongoUri(testUri, "another_test_db"), /STAGING_DATABASE_NAME/);
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => validateStagingMongoUri(testUri, ""), /STAGING_DATABASE_NAME is required/);
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => validateStagingMongoUri(testUri, PRODUCTION_DATABASE_NAME), /must not be the production database/);
  // Perform the side effect or state update expressed on the following line.
  assert.throws(
    () => validateStagingMongoUri("mongodb+srv://cluster.example/husseindb", "atlas_test_db"),
    /must never target the production database/,
  );
});

// Perform the side effect or state update expressed on the following line.
test("staging deployment keeps NODE_ENV production and reuses production database validation by default", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.equal(validateDeploymentMongoUri({
    nodeEnv: "production",
    deploymentEnv: "staging",
    uri: "mongodb+srv://cluster.example/atlas_test_db",
    stagingDatabaseName: "atlas_test_db",
  }), true);
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => validateDeploymentMongoUri({
    nodeEnv: "staging",
    deploymentEnv: "staging",
    uri: "mongodb+srv://cluster.example/atlas_test_db",
    stagingDatabaseName: "atlas_test_db",
  }), /NODE_ENV=staging is unsupported/);
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => validateDeploymentMongoUri({
    nodeEnv: "development",
    deploymentEnv: "staging",
    uri: "mongodb+srv://cluster.example/atlas_test_db",
    stagingDatabaseName: "atlas_test_db",
  }), /Staging requires NODE_ENV=production/);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(validateDeploymentMongoUri({
    nodeEnv: "production",
    deploymentEnv: "production",
    uri: "mongodb+srv://cluster.example/husseindb",
  }), true);
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => validateDeploymentMongoUri({
    nodeEnv: "production",
    deploymentEnv: "production",
    uri: "mongodb+srv://cluster.example/atlas_test_db",
  }), /must explicitly target the husseindb database/);
});

// Perform the side effect or state update expressed on the following line.
test("application configuration fails safely when MONGODB_URI is missing", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => assertRequiredEnvironment({ MONGO_URI: "mongodb://localhost/test", JWT_SECRET: "present" }), {
    message: "Missing required environment variable: MONGODB_URI",
  });
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => assertRequiredEnvironment({ MONGODB_URI: "", JWT_SECRET: "present" }), {
    message: "Missing required environment variable: MONGODB_URI",
  });
});

// Perform the side effect or state update expressed on the following line.
test("lifecycle integration requires an explicit disposable URI and opt-in for husseindb", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.equal(getDisposableIntegrationMongoUri({}), null);
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => getDisposableIntegrationMongoUri({
    LIFECYCLE_TEST_MONGODB_URI: "mongodb+srv://cluster.example/husseindb",
  }), /ALLOW_HUSSEINDB_TEST_DATABASE=true/);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(getDisposableIntegrationMongoUri({
    LIFECYCLE_TEST_MONGODB_URI: "mongodb+srv://cluster.example/husseindb",
    ALLOW_HUSSEINDB_TEST_DATABASE: "true",
  }), "mongodb+srv://cluster.example/husseindb");
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => getDisposableIntegrationMongoUri({
    LIFECYCLE_TEST_MONGODB_URI: "mongodb+srv://cluster.example/production",
  }), /clearly identify a disposable test database/);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(getDisposableIntegrationMongoUri({
    LIFECYCLE_TEST_MONGODB_URI: "mongodb+srv://cluster.example/disposable_lifecycle_test",
  }), "mongodb+srv://cluster.example/disposable_lifecycle_test");
});

// Perform the side effect or state update expressed on the following line.
test("MongoDB connection failures never log the connection string", async () => {
  // Declare [{ default: mongoose }, { default: connectDatabase }] for use by the surrounding module or function.
  const [{ default: mongoose }, { default: connectDatabase }] = await Promise.all([
    import("mongoose"),
    import("../config/database.js"),
  ]);
  // Declare originalConnect for use by the surrounding module or function.
  const originalConnect = mongoose.connect;
  // Declare originalError for use by the surrounding module or function.
  const originalError = console.error;
  // Declare logged for use by the surrounding module or function.
  const logged = [];
  // Declare credentialBearingUri for use by the surrounding module or function.
  const credentialBearingUri = "mongodb+srv://<username>:<password>@<cluster-host>/husseindb";

  // Perform the side effect or state update expressed on the following line.
  mongoose.connect = async () => {
    // Stop the current operation by raising the result of Object.assign().
    throw Object.assign(new Error(`Connection failed for ${credentialBearingUri}`), { code: "ECONNREFUSED" });
  };
  // Perform the side effect or state update expressed on the following line.
  console.error = (...args) => logged.push(args.join(" "));

  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    await assert.rejects(connectDatabase());
  } finally {
    // Perform the side effect or state update expressed on the following line.
    mongoose.connect = originalConnect;
    // Perform the side effect or state update expressed on the following line.
    console.error = originalError;
  }

  // Perform the side effect or state update expressed on the following line.
  assert.equal(logged.length, 1);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(logged.join(" ").includes(credentialBearingUri), false);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(logged.join(" ").includes("<password>"), false);
});
