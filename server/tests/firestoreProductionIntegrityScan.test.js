import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd(), "..");
const script = path.join(root, "server", "scripts", "firestoreProductionIntegrityScan.js");

test("Firestore production integrity scan is read-only and tenant-aware", () => {
  const source = fs.readFileSync(script, "utf8");
  assert.match(source, /runIntegrityScan/);
  assert.match(source, /readOnly:\s*true/);
  for (const marker of ["unknown_tenant_id", "payment_booking_cross_tenant", "invoice_booking_cross_tenant", "booking_deposit_mismatch", "invoice_amount_paid_mismatch", "duplicate_payment_provider_reference", "unbalanced_posted_journal"]) {
    assert.match(source, new RegExp(marker));
  }
  assert.doesNotMatch(source, /\.set\(/);
  assert.doesNotMatch(source, /\.update\(/);
  assert.doesNotMatch(source, /\.delete\(/);
});

test("production documentation requires the Firestore integrity scan", () => {
  const checklist = fs.readFileSync(path.join(root, "docs", "PRODUCTION_GO_LIVE_CHECKLIST.md"), "utf8");
  assert.match(checklist, /Firestore production integrity\/reconciliation scan/i);
  assert.match(checklist, /PRODUCTION_DATA_INTEGRITY_VERIFIED=true/);
});

test("readiness documentation uses the current Firestore runtime", () => {
  const source = fs.readFileSync(path.join(root, "docs", "PRODUCTION_READINESS.md"), "utf8");
  assert.match(source, /Firestore integrity\/reconciliation scan/i);
  assert.doesNotMatch(source, /read-only production MongoDB integrity\/reconciliation scan/i);
});

test("stored queue contains an executable integrity scan command", () => {
  const queue = fs.readFileSync(path.join(root, "docs", "STORED_TEST_EXECUTION_QUEUE.md"), "utf8");
  assert.match(queue, /npm run audit:firestore-integrity/);
  assert.match(queue, /PRODUCTION_DATA_INTEGRITY_VERIFIED=true/);
});
