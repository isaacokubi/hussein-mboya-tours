import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

for (const file of [
  "tests/tourLifecycleIntegration.test.js",
  "tests/hospitalityPaymentLifecycleIntegration.test.js",
]) {
  test(`Phase 11 ${file} targets Firestore emulator`, () => {
    const source = read(file);
    assert.match(source, /FIRESTORE_EMULATOR_HOST|FIREBASE_EMULATOR_HOST/);
    assert.match(source, /connectFirestore\(\)/);
    assert.doesNotMatch(source, /MONGODB_URI|firestore\.connect\(/);
    assert.doesNotMatch(source, /new firestore\.Types\.ObjectId/);
  });
}
