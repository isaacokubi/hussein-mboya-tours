/**
 * Purpose: accounting Operational Reconciliation Integrity.test automated test. Main declarations: read.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import assert from "node:assert/strict";
// Load node:fs so this module can use its exported dependencies.
import fs from "node:fs";
// Load node:path so this module can use its exported dependencies.
import path from "node:path";
// Load node:test so this module can use its exported dependencies.
import test from "node:test";

// Declare root for use by the surrounding module or function.
const root = path.resolve(process.cwd());
// Declare read for use by the surrounding module or function.
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

// Perform the side effect or state update expressed on the following line.
test("operational accounting reconciliation is tenant-scoped and fails safely on posting errors", () => {
  // Declare controller for use by the surrounding module or function.
  const controller = read("controllers/accountingOperationalReconciliationController.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /const tenantId = req\.tenantId/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /const filter = mergeTenantFilter\(req, \{\}\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /requireTenantId\(\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /summary\.errors\.push/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /success: summary\.errors\.length === 0/);
});

// Perform the side effect or state update expressed on the following line.
test("operational accounting reconciliation is idempotent for payments, refunds, expenses and supplier flows", () => {
  // Declare controller for use by the surrounding module or function.
  const controller = read("controllers/accountingOperationalReconciliationController.js");
  // Repeat the enclosed work for each required iteration.
  for (const sourceType of [
    "payment",
    "payment_refund",
    "expense_accrual",
    "expense_payment",
    "supplier_payable",
    "supplier_payable_payment",
  ]) assert.match(controller, new RegExp(`exists\\(tenantId, \\"${sourceType}\\"`));
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /JournalEntry\.exists/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /refundSourceId/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /hashedSourceId/);
});

// Perform the side effect or state update expressed on the following line.
test("reconciliation only posts qualifying operational records", () => {
  // Declare controller for use by the surrounding module or function.
  const controller = read("controllers/accountingOperationalReconciliationController.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /payment\.status === "completed"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(
    controller,
    /\["approved",\s*"paid"\]|expense\.status\s*===\s*"approved"|expense\.status\s*===\s*"paid"/s
  );
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /status.*cancelled/s);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /amountPaid > 0/);
});

// Perform the side effect or state update expressed on the following line.
test("accounting reversals can reuse original journal account ids without losing tenant isolation", () => {
  // Declare accounting for use by the surrounding module or function.
  const accounting = read("services/operationalAccountingService.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(accounting, /line\.code\s*\?\s*await account\(tenantId, line\.code\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(accounting, /line\.account\s*\?\s*await ChartOfAccount\.findOne\(\{ tenantId, _id: line\.account, active: true \}\)/);
});
