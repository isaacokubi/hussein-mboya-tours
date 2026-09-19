import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(process.cwd());
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("operational accounting reconciliation is tenant-scoped and fails safely on posting errors", () => {
  const controller = read("controllers/accountingOperationalReconciliationController.js");
  assert.match(controller, /const tenantId = req\.tenantId/);
  assert.match(controller, /const filter = mergeTenantFilter\(req, \{\}\)/);
  assert.match(controller, /requireTenantId\(\)/);
  assert.match(controller, /summary\.errors\.push/);
  assert.match(controller, /success: summary\.errors\.length === 0/);
});

test("operational accounting reconciliation is idempotent for payments, refunds, expenses and supplier flows", () => {
  const controller = read("controllers/accountingOperationalReconciliationController.js");
  for (const sourceType of [
    "payment",
    "payment_refund",
    "expense_accrual",
    "expense_payment",
    "supplier_payable",
    "supplier_payable_payment",
  ]) assert.match(controller, new RegExp(`exists\\(tenantId, \\"${sourceType}\\"`));
  assert.match(controller, /JournalEntry\.exists/);
  assert.match(controller, /refundSourceId/);
  assert.match(controller, /hashedSourceId/);
});

test("reconciliation only posts qualifying operational records", () => {
  const controller = read("controllers/accountingOperationalReconciliationController.js");
  assert.match(controller, /payment\.status === "completed"/);
  assert.match(
    controller,
    /\["approved",\s*"paid"\]|expense\.status\s*===\s*"approved"|expense\.status\s*===\s*"paid"/s
  );
  assert.match(controller, /status.*cancelled/s);
  assert.match(controller, /amountPaid > 0/);
});
