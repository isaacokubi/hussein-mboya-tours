import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());
const resetPath = path.join(root, "scripts/reset-and-seed-demo.js");
const seedPath = path.join(root, "seeds/globalToursTestSeed.js");
const packagePath = path.join(root, "package.json");

test("demo reset is Firestore-native and fail-closed", () => {
  const source = fs.readFileSync(resetPath, "utf8");
  assert.match(source, /config\/firestore\.js/);
  assert.match(source, /FIREBASE_PROJECT_ID/);
  assert.match(source, /CONFIRM_DEMO_RESET/);
  assert.match(source, /known synthetic Global Tours catalog only/);
  assert.doesNotMatch(source, /from ["']mongoose["']/);
  assert.doesNotMatch(source, /MONGODB_URI|MONGODB_URL|mongoose\./);
  assert.doesNotMatch(source, /dropDatabase|listCollections|collection\(/);
  assert.match(source, /organizationsPreserved: true/);
  assert.match(source, /usersPreserved: true/);
  assert.match(source, /bookingsPreserved: true/);
  assert.match(source, /paymentsPreserved: true/);
});

test("global test seed is Firestore-native", () => {
  const source = fs.readFileSync(seedPath, "utf8");
  assert.match(source, /config\/firestore\.js/);
  assert.match(source, /FIREBASE_PROJECT_ID/);
  assert.doesNotMatch(source, /MONGODB_URI|MONGODB_URL|mongoose/);
});

test("demo reset is registered as an explicit package command", () => {
  const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
  assert.equal(pkg.scripts["reset:demo"], "node scripts/reset-and-seed-demo.js");
});
