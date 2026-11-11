/**
 * Purpose: tenant Dashboard Audit.test automated test. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import test from "node:test";
// Load node:assert/strict so this module can use its exported dependencies.
import assert from "node:assert/strict";
// Load node:fs so this module can use its exported dependencies.
import fs from "node:fs";

// Declare source for use by the surrounding module or function.
const source = fs.readFileSync(new URL("../scripts/auditTenantDashboardData.js", import.meta.url), "utf8");
// Declare seedSource for use by the surrounding module or function.
const seedSource = fs.readFileSync(new URL("../seeds/financialDashboardSeed.js", import.meta.url), "utf8");

// Perform the side effect or state update expressed on the following line.
test("tenant dashboard audit is restricted to the intended Atlas database", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /EXPECTED_HOST = "cluster0\.cdtxzts\.mongodb\.net"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /EXPECTED_DATABASE = "husseindb"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /database !== EXPECTED_DATABASE/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /TENANT_SLUGS = \["hussein-mboya", "amani-trails", "demo-safari"\]/);
});

// Perform the side effect or state update expressed on the following line.
test("tenant dashboard audit applies tenantId to each operational metric query", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /countDocuments\(\{ tenantId, \.\.\.active, \.\.\.extra \}\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /\$match: \{ tenantId, \.\.\.active \}/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /\$match: \{ tenantId, status: "posted" \}/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /"account\.tenantId": tenantId/);
});

// Perform the side effect or state update expressed on the following line.
test("tenant dashboard audit counts both TEST- and DEMO- synthetic booking references", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /bookingNumber: \/\^\(\?:TEST\|DEMO\)-\/i/);
});

// Perform the side effect or state update expressed on the following line.
test("tenant dashboard audit contains no database mutation calls", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.doesNotMatch(source, /\.(?:deleteMany|deleteOne|updateMany|updateOne|findOneAndUpdate|insertMany|bulkWrite)\s*\(/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /No records were inserted, updated, or deleted/);
});

// Perform the side effect or state update expressed on the following line.
test("tenant financial audit checks cross-tenant references across booking, payment, invoice and supplier operations", () => {
  // Repeat the enclosed work for each required iteration.
  for (const code of [
    "BOOKING_TOUR_TENANT", "PAYMENT_BOOKING_TENANT", "INVOICE_BOOKING_TENANT",
    "PO_SUPPLIER_TENANT", "EXPENSE_PO_TENANT", "PAYABLE_SUPPLIER_TENANT",
  ]) assert.ok(source.includes(code), `missing integrity check: ${code}`);
});

// Perform the side effect or state update expressed on the following line.
test("tenant financial audit reconciles booking and invoice balances against successful net payments", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /BOOKING_PAYMENT_RECONCILIATION/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /INVOICE_PAYMENT_RECONCILIATION/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /netSuccessfulPaymentValueKsh/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /refundedPaymentValueKsh/);
});

// Perform the side effect or state update expressed on the following line.
test("tenant financial audit validates balanced journals and tenant-owned chart accounts", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /POSTED_JOURNAL_UNBALANCED/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /JOURNAL_ACCOUNT_TENANT/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /Math\.abs\(debit-credit\)/);
});

// Perform the side effect or state update expressed on the following line.
test("tenant financial audit reconciles invoice revenue postings and refund journals", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /INVOICE_REVENUE_POSTING/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /REFUND_JOURNAL_ACCOUNTING/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /receivableDebit > 0\.01/);
});

// Perform the side effect or state update expressed on the following line.
test("financial seed derives invoice and payment state from the same booking payment plan", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.match(seedSource, /const plan = \[booking\.paymentStatus, booking\.status, 0\];/);
  // Perform the side effect or state update expressed on the following line.
  assert.doesNotMatch(seedSource, /const plan = paymentPlans\[i\];/);
});
