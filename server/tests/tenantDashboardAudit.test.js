import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../scripts/auditTenantDashboardData.js", import.meta.url), "utf8");
const seedSource = fs.readFileSync(new URL("../seeds/financialDashboardSeed.js", import.meta.url), "utf8");

test("tenant dashboard audit is restricted to the intended Atlas database", () => {
  assert.match(source, /EXPECTED_HOST = "cluster0\.cdtxzts\.mongodb\.net"/);
  assert.match(source, /EXPECTED_DATABASE = "husseindb"/);
  assert.match(source, /database !== EXPECTED_DATABASE/);
  assert.match(source, /TENANT_SLUGS = \["hussein-mboya", "amani-trails", "demo-safari"\]/);
});

test("tenant dashboard audit applies tenantId to each operational metric query", () => {
  assert.match(source, /countDocuments\(\{ tenantId, \.\.\.active, \.\.\.extra \}\)/);
  assert.match(source, /\$match: \{ tenantId, \.\.\.active \}/);
  assert.match(source, /\$match: \{ tenantId, status: "posted" \}/);
  assert.match(source, /"account\.tenantId": tenantId/);
});

test("tenant dashboard audit counts both TEST- and DEMO- synthetic booking references", () => {
  assert.match(source, /bookingNumber: \/\^\(\?:TEST\|DEMO\)-\/i/);
});

test("tenant dashboard audit contains no database mutation calls", () => {
  assert.doesNotMatch(source, /\.(?:deleteMany|deleteOne|updateMany|updateOne|findOneAndUpdate|insertMany|bulkWrite)\s*\(/);
  assert.match(source, /No records were inserted, updated, or deleted/);
});

test("tenant financial audit checks cross-tenant references across booking, payment, invoice and supplier operations", () => {
  for (const code of [
    "BOOKING_TOUR_TENANT", "PAYMENT_BOOKING_TENANT", "INVOICE_BOOKING_TENANT",
    "PO_SUPPLIER_TENANT", "EXPENSE_PO_TENANT", "PAYABLE_SUPPLIER_TENANT",
  ]) assert.ok(source.includes(code), `missing integrity check: ${code}`);
});

test("tenant financial audit reconciles booking and invoice balances against successful net payments", () => {
  assert.match(source, /BOOKING_PAYMENT_RECONCILIATION/);
  assert.match(source, /INVOICE_PAYMENT_RECONCILIATION/);
  assert.match(source, /netSuccessfulPaymentValueKsh/);
  assert.match(source, /refundedPaymentValueKsh/);
});

test("tenant financial audit validates balanced journals and tenant-owned chart accounts", () => {
  assert.match(source, /POSTED_JOURNAL_UNBALANCED/);
  assert.match(source, /JOURNAL_ACCOUNT_TENANT/);
  assert.match(source, /Math\.abs\(debit-credit\)/);
});

test("financial seed derives invoice and payment state from the same booking payment plan", () => {
  assert.match(seedSource, /const plan = \[booking\.paymentStatus, booking\.status, 0\];/);
  assert.doesNotMatch(seedSource, /const plan = paymentPlans\[i\];/);
});
