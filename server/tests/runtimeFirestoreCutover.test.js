import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(here, "..");

const runtimeFiles = [
  "middleware/errorMiddleware.js",
  "controllers/tenantController.js",
  "middleware/resourceTenantGuard.js",
  "controllers/tourManagerController.js",
  "controllers/agentCustomerController.js",
  "controllers/tourManagerBookingController.js",
  "controllers/bootstrapController.js",
  "services/bookingCreationService.js",
];

test("Phase 7 runtime request paths do not import Mongoose", () => {
  for (const relative of runtimeFiles) {
    const file = path.join(serverRoot, relative);
    const source = fs.readFileSync(file, "utf8");
    assert.doesNotMatch(
      source,
      /import\s+(?:\*\s+as\s+)?mongoose\s+from\s+["']mongoose["']/,
      `Mongoose import remains in ${relative}`
    );
  }
});

test("Phase 7 Firestore ObjectId compatibility is used by request-path ID validation", () => {
  for (const relative of [
    "controllers/tenantController.js",
    "middleware/resourceTenantGuard.js",
    "controllers/agentCustomerController.js",
    "controllers/tourManagerBookingController.js",
  ]) {
    const source = fs.readFileSync(path.join(serverRoot, relative), "utf8");
    assert.match(source, /Types\.ObjectId\.isValid/);
  }
});

test("Phase 7 bootstrap transaction uses the Firestore adapter", () => {
  const source = fs.readFileSync(path.join(serverRoot, "controllers/bootstrapController.js"), "utf8");
  assert.match(source, /import \* as firestore from ["']\.\.\/config\/firestore\.js["']/);
  assert.match(source, /firestore\.startSession\(\)/);
  assert.doesNotMatch(source, /mongoose\./);
});

test("Phase 7 error handling is runtime-database neutral", () => {
  const source = fs.readFileSync(path.join(serverRoot, "middleware/errorMiddleware.js"), "utf8");
  assert.doesNotMatch(source, /mongoose\./);
  assert.match(source, /err\?\.name === ["']ValidationError["']/);
  assert.match(source, /err\?\.name === ["']CastError["']/);
});
