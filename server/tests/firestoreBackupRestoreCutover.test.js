import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";

const root = path.resolve(process.cwd());
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("Firestore backup script is database-runtime native", () => {
  const source = read("scripts/firestoreBackup.js");
  assert.match(source, /firebase-admin/);
  assert.match(source, /getFirestore/);
  assert.match(source, /global-tours-firestore-backup-v1/);
  assert.doesNotMatch(source, /mongoose|mongodump|MONGODB_BACKUP_URI|MONGODB_URI/);
});

test("Firestore restore script is isolated and checksum-protected", () => {
  const source = read("scripts/firestoreRestore.js");
  assert.match(source, /RESTORE_TARGET_ISOLATED/);
  assert.match(source, /PRODUCTION_FIREBASE_PROJECT_ID/);
  assert.match(source, /projectId === productionProjectId/);
  assert.match(source, /Backup checksum verification failed/);
  assert.match(source, /tenant-isolation validation failed/);
  assert.doesNotMatch(source, /mongorestore|MONGODB_RESTORE_URI|MONGODB_URI/);
});

test("production backup workflow targets Firestore, not the retired Mongo runtime", () => {
  const source = read("../.github/workflows/production-backup.yml");
  assert.match(source, /Production Firestore Backup/);
  assert.match(source, /PRODUCTION_FIREBASE_PROJECT_ID/);
  assert.match(source, /PRODUCTION_FIREBASE_SERVICE_ACCOUNT_JSON/);
  assert.match(source, /BACKUP_ENCRYPTION_PASSPHRASE/);
  assert.match(source, /firestoreBackup\.js/);
  assert.match(source, /production-firestore-backup-/);
  assert.doesNotMatch(source, /MongoDB|MONGODB_|mongodump|mongo:8/);
});

test("restore drill enforces a separate Firebase project", () => {
  const source = read("../.github/workflows/production-restore-drill.yml");
  assert.match(source, /Production Firestore Backup/);
  assert.match(source, /RESTORE_FIREBASE_PROJECT_ID/);
  assert.match(source, /PRODUCTION_FIREBASE_PROJECT_ID/);
  assert.match(source, /RESTORE_TARGET_ISOLATED/);
  assert.match(source, /firestoreRestore\.js/);
  assert.doesNotMatch(source, /MongoDB|MONGODB_|mongorestore|mongo:8/);
});

test("platform backup administration no longer uses Mongo-style collection APIs", () => {
  const source = read("controllers/superAdminBackupController.js");
  assert.match(source, /DatabaseBackup\.create/);
  assert.match(source, /DatabaseBackup\.find/);
  assert.doesNotMatch(source, /\.collection\.(insertOne|findOne|deleteOne)/);
});
