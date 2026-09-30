import assert from "node:assert/strict";
import test from "node:test";
import DatabaseBackup from "../models/DatabaseBackup.js";
import { listPlatformDatabaseBackups } from "../controllers/superAdminBackupController.js";
import superAdminRoutes from "../routes/superAdminRoutes.js";

test("DatabaseBackup exports the registered Mongoose model", () => {
  assert.equal(typeof DatabaseBackup.find, "function");
  assert.equal(typeof DatabaseBackup.collection.find, "function");
  assert.equal(DatabaseBackup.modelName, "DatabaseBackup");
  assert.equal(DatabaseBackup.collection.collectionName, "databasebackups");
});

test("platform backup listing queries null-tenant records newest-first with a 50 item cap", async () => {
  const collection = DatabaseBackup.collection;
  const originalFind = collection.find;
  const calls = {};
  const expected = [{ _id: "newest" }, { _id: "older" }];

  collection.find = (filter) => {
    calls.filter = filter;
    return {
      sort(value) {
        calls.sort = value;
        return this;
      },
      limit(value) {
        calls.limit = value;
        return this;
      },
      async toArray() {
        return expected;
      },
    };
  };

  try {
    let statusCode = 200;
    let payload;
    const response = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(value) {
        payload = value;
        return this;
      },
    };

    await listPlatformDatabaseBackups({}, response);

    assert.equal(statusCode, 200);
    assert.deepEqual(calls.filter, { tenantId: null });
    assert.deepEqual(calls.sort, { createdAt: -1 });
    assert.equal(calls.limit, 50);
    assert.deepEqual(payload, { success: true, backups: expected, count: 2, scope: "platform" });
  } finally {
    collection.find = originalFind;
  }
});

test("platform backup list route remains behind authentication and super-admin authorization", () => {
  assert.equal(superAdminRoutes.stack[0].handle.name, "protect");
  assert.equal(superAdminRoutes.stack[1].handle.name, "superAdminOnly");

  const route = superAdminRoutes.stack.find((layer) => layer.route?.path === "/database/backups");
  assert.ok(route);
  assert.equal(route.route.methods.get, true);
});
