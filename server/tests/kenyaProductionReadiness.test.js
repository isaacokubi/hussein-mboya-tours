import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(process.cwd());
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("Kenya readiness contract includes tenant tax, payment and eTIMS modules", () => {
  const required = [
    "models/TaxProfile.js","models/TaxRule.js","models/WithholdingTax.js",
    "models/EtimsCredential.js","models/EtimsSubmission.js","models/CreditDebitNote.js",
    "services/taxEngineService.js","services/mpesaService.js",
    "services/paymentLifecycleService.js","services/etimsService.js",
    "services/operationalAccountingService.js","services/financeLifecycleService.js"
  ];
  for (const file of required) assert.equal(fs.existsSync(path.join(root, file)), true, "Missing " + file);
});

test("tax engine supports Kenya VAT categories and KES", () => {
  const source = read("services/taxEngineService.js");
  for (const marker of ["STANDARD","ZERO_RATED","EXEMPT","NON_VAT","currency: \"KES\"","defaultVatRate"]) assert.ok(source.includes(marker), "Missing " + marker);
});

test("M-Pesa service enforces tenant context and Kenyan phone normalization", () => {
  const source = read("services/mpesaService.js");
  for (const marker of ["requireTenantId","254[17]","CustomerPayBillOnline","callbackUrl"]) assert.ok(source.includes(marker), "Missing " + marker);
});

test("payment model has tenant-scoped duplicate-provider protections", () => {
  const source = read("models/Payment.js");
  for (const marker of ["tenantId","transactionReference","checkoutRequestID","mpesaReceiptNumber","callbackEventId","unique: true"]) assert.ok(source.includes(marker), "Missing " + marker);
});

test("eTIMS submission model records idempotency and attempt history", () => {
  const source = read("models/EtimsSubmission.js");
  for (const marker of ["tenantId","attempt","idempotencyKey","requestHash","status","documentId"]) assert.ok(source.includes(marker), "Missing " + marker);
});

test("eTIMS service blocks unsafe adapter targets and uses idempotency", () => {
  const source = read("services/etimsService.js");
  for (const marker of ["private or local address","Production eTIMS adapter must use HTTPS","x-idempotency-key","etims-invoice:","retry"]) assert.ok(source.includes(marker), "Missing " + marker);
});

test("production evidence checklist requires external verification", () => {
  const checklist = fs.readFileSync(path.join(root, "../docs/PRODUCTION_GO_LIVE_CHECKLIST.md"), "utf8");
  for (const key of ["PRODUCTION_PAYMENT_VERIFIED=true","PRODUCTION_ETIMS_VERIFIED=true","PRODUCTION_WEBHOOKS_VERIFIED=true","PRODUCTION_BACKUP_VERIFIED=true","PRODUCTION_RESTORE_TESTED=true","PRODUCTION_MONITORING_VERIFIED=true"]) assert.ok(checklist.includes(key), "Missing " + key);
});

test("production evidence cannot be claimed without the real external test", () => {
  const checklist = fs.readFileSync(path.join(root, "../docs/PRODUCTION_GO_LIVE_CHECKLIST.md"), "utf8");
  assert.ok(checklist.includes("Do not mark an evidence flag true unless the corresponding external test was actually completed."));
});
