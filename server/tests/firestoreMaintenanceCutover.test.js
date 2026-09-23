import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

test("Phase 8 maintenance tooling is Firestore-based", () => {
  const repair = read("services/tenantIndexRepair.js");
  const ledger = read("scripts/migrateBookingPaymentLedger.js");
  const orphan = read("scripts/migrateOrphanStaffToTenant.js");
  const pkg = JSON.parse(read("package.json"));

  assert.doesNotMatch(repair, /mongoose/);
  assert.doesNotMatch(ledger, /mongoose|MONGO_URI|MONGODB_URI/);
  assert.doesNotMatch(orphan, /mongoose|MONGO_URI|MONGODB_URI/);
  assert.match(ledger, /config\\/firestore\\.js/);
  assert.match(ledger, /runWithTenant/);
  assert.match(ledger, /DRY_RUN/);
  assert.match(ledger, /skippedMissingTenant/);
  assert.match(orphan, /FIREBASE_PROJECT_ID/);
  assert.match(orphan, /CONFIRM_ORPHAN_STAFF_MIGRATION/);
  assert.match(orphan, /Staff\\.updateMany/);
  assert.equal(pkg.scripts["migrate:booking-ledger"], "node scripts/migrateBookingPaymentLedger.js");
  assert.equal(pkg.scripts["migrate:orphan-staff"], "node scripts/migrateOrphanStaffToTenant.js");
});

test("booking ledger calculation preserves payment and deposit rules", async () => {
  const { calculateBookingLedger } = await import("../scripts/migrateBookingPaymentLedger.js");
  const result = calculateBookingLedger({
    booking: { totalAmount: 100000, paymentStatus: "partial", amountPaid: 0, depositAmount: 0 },
    payments: [
      { amount: 60000, refundedAmount: 10000, status: "completed" },
      { amount: 20000, refundedAmount: 0, status: "completed" },
    ],
    tour: { depositRequired: 25, depositType: "percentage" },
  });
  assert.deepEqual(result, { amountPaid: 70000, depositAmount: 25000, balanceAmount: 30000, paymentStatus: "partial" });
});