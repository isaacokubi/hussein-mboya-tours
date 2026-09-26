import test from "node:test";
import assert from "node:assert/strict";
import { PRODUCTION_DATABASE_NAME, validateProductionMongoUri } from "../config/mongoConfig.js";
import { assertRequiredEnvironment } from "../config/envValidation.js";
import { getDisposableIntegrationMongoUri } from "./integrationMongoUri.js";

process.env.NODE_ENV = "test";
process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/mongo_config_test";
process.env.JWT_SECRET = "ci-only-test-secret";

test("production MongoDB target is the existing husseindb database", () => {
  assert.equal(PRODUCTION_DATABASE_NAME, "husseindb");
  assert.equal(validateProductionMongoUri("mongodb+srv://cluster.example/husseindb?retryWrites=true&w=majority"), true);
  assert.equal(validateProductionMongoUri("mongodb://localhost:27017/husseindb?tls=true"), true);
});

test("production MongoDB target rejects a missing or different database without echoing the URI", () => {
  for (const uri of [undefined, "mongodb+srv://host.example/", "mongodb://localhost:27017/otherdb"]) {
    assert.throws(() => validateProductionMongoUri(uri), (error) => {
      assert.equal(error.message.includes("<password>"), false);
      assert.equal(error.message.includes("host.example"), false);
      return true;
    });
  }
});

test("production MongoDB target rejects non-MongoDB and malformed connection strings safely", () => {
  assert.throws(() => validateProductionMongoUri("https://example/husseindb"), /mongodb:\/\/ or mongodb\+srv:\/\//);
  assert.throws(() => validateProductionMongoUri("mongodb+srv://cluster.example/%ZZ"), (error) => {
    assert.equal(error.message.includes("<password>"), false);
    assert.equal(error.message.includes("cluster.example"), false);
    return true;
  });
});

test("application configuration fails safely when MONGODB_URI is missing", () => {
  assert.throws(() => assertRequiredEnvironment({ MONGO_URI: "mongodb://localhost/test", JWT_SECRET: "present" }), {
    message: "Missing required environment variable: MONGODB_URI",
  });
  assert.throws(() => assertRequiredEnvironment({ MONGODB_URI: "", JWT_SECRET: "present" }), {
    message: "Missing required environment variable: MONGODB_URI",
  });
});

test("lifecycle integration requires a dedicated disposable URI and rejects production husseindb", () => {
  assert.equal(getDisposableIntegrationMongoUri({}), null);
  assert.throws(() => getDisposableIntegrationMongoUri({
    LIFECYCLE_TEST_MONGODB_URI: "mongodb+srv://cluster.example/husseindb",
  }), /never husseindb/);
  assert.equal(getDisposableIntegrationMongoUri({
    LIFECYCLE_TEST_MONGODB_URI: "mongodb+srv://cluster.example/disposable_lifecycle_test",
  }), "mongodb+srv://cluster.example/disposable_lifecycle_test");
});

test("MongoDB connection failures never log the connection string", async () => {
  const [{ default: mongoose }, { default: connectDatabase }] = await Promise.all([
    import("mongoose"),
    import("../config/database.js"),
  ]);
  const originalConnect = mongoose.connect;
  const originalError = console.error;
  const logged = [];
  const credentialBearingUri = "mongodb+srv://<username>:<password>@<cluster-host>/husseindb";

  mongoose.connect = async () => {
    throw Object.assign(new Error(`Connection failed for ${credentialBearingUri}`), { code: "ECONNREFUSED" });
  };
  console.error = (...args) => logged.push(args.join(" "));

  try {
    await assert.rejects(connectDatabase());
  } finally {
    mongoose.connect = originalConnect;
    console.error = originalError;
  }

  assert.equal(logged.length, 1);
  assert.equal(logged.join(" ").includes(credentialBearingUri), false);
  assert.equal(logged.join(" ").includes("<password>"), false);
});
