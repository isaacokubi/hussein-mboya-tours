/**
 * Purpose: super Admin Backup Listing.test automated test. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import assert from "node:assert/strict";
// Load node:test so this module can use its exported dependencies.
import test from "node:test";

// This controller/route contract test does not connect to MongoDB. Set isolated
// test-only configuration before dynamically importing modules that validate
// the server environment; never depend on a developer's ignored .env file.
// Perform the side effect or state update expressed on the following line.
process.env.NODE_ENV = "test";
// Perform the side effect or state update expressed on the following line.
process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/backup_listing_test";
// Perform the side effect or state update expressed on the following line.
process.env.JWT_SECRET = "ci-only-test-secret";

// Declare [ { default: DatabaseBackup }, { listPlatformDatabaseBackups }, { default: superAdminRoutes }, ] for use by the surrounding module or function.
const [
  { default: DatabaseBackup },
  { listPlatformDatabaseBackups },
  { default: superAdminRoutes },
] = await Promise.all([
  import("../models/DatabaseBackup.js"),
  import("../controllers/superAdminBackupController.js"),
  import("../routes/superAdminRoutes.js"),
]);

// Perform the side effect or state update expressed on the following line.
test("DatabaseBackup exports the registered Mongoose model", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.equal(typeof DatabaseBackup.find, "function");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(typeof DatabaseBackup.collection.find, "function");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(DatabaseBackup.modelName, "DatabaseBackup");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(DatabaseBackup.collection.collectionName, "databasebackups");
});

// Perform the side effect or state update expressed on the following line.
test("platform backup listing queries null-tenant records newest-first with a 50 item cap", async () => {
  // Declare collection for use by the surrounding module or function.
  const collection = DatabaseBackup.collection;
  // Declare originalFind for use by the surrounding module or function.
  const originalFind = collection.find;
  // Declare calls for use by the surrounding module or function.
  const calls = {};
  // Declare expected for use by the surrounding module or function.
  const expected = [{ _id: "newest" }, { _id: "older" }];

  // Perform the side effect or state update expressed on the following line.
  collection.find = (filter) => {
    // Perform the side effect or state update expressed on the following line.
    calls.filter = filter;
    // Return the object assembled below to the caller.
    return {
      // Implement the sort method for this class.
      sort(value) {
        // Perform the side effect or state update expressed on the following line.
        calls.sort = value;
        // Return the expression shown below to the caller.
        return this;
      },
      // Implement the limit method for this class.
      limit(value) {
        // Perform the side effect or state update expressed on the following line.
        calls.limit = value;
        // Return the expression shown below to the caller.
        return this;
      },
      // Implement the toArray method for this class.
      async toArray() {
        // Return the value of expected to the caller.
        return expected;
      },
    };
  };

  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare statusCode for use by the surrounding module or function.
    let statusCode = 200;
    // Declare payload for use by the surrounding module or function.
    let payload;
    // Declare response for use by the surrounding module or function.
    const response = {
      // Implement the status method for this class.
      status(code) {
        // Perform the side effect or state update expressed on the following line.
        statusCode = code;
        // Return the expression shown below to the caller.
        return this;
      },
      // Implement the json method for this class.
      json(value) {
        // Perform the side effect or state update expressed on the following line.
        payload = value;
        // Return the expression shown below to the caller.
        return this;
      },
    };

    // Perform the side effect or state update expressed on the following line.
    await listPlatformDatabaseBackups({}, response);

    // Perform the side effect or state update expressed on the following line.
    assert.equal(statusCode, 200);
    // Perform the side effect or state update expressed on the following line.
    assert.deepEqual(calls.filter, { tenantId: null });
    // Perform the side effect or state update expressed on the following line.
    assert.deepEqual(calls.sort, { createdAt: -1 });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(calls.limit, 50);
    // Perform the side effect or state update expressed on the following line.
    assert.deepEqual(payload, { success: true, backups: expected, count: 2, scope: "platform" });
  } finally {
    // Perform the side effect or state update expressed on the following line.
    collection.find = originalFind;
  }
});

// Perform the side effect or state update expressed on the following line.
test("platform backup list route remains behind authentication and super-admin authorization", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.equal(superAdminRoutes.stack[0].handle.name, "protect");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(superAdminRoutes.stack[1].handle.name, "superAdminOnly");

  // Declare route for use by the surrounding module or function.
  const route = superAdminRoutes.stack.find((layer) => layer.route?.path === "/database/backups");
  // Perform the side effect or state update expressed on the following line.
  assert.ok(route);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(route.route.methods.get, true);
});
