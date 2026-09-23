import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(here, "..");
const read = (relative) => fs.readFileSync(path.join(serverRoot, relative), "utf8");

test("M-Pesa STK initiation persists a pending payment before calling the provider", () => {
  const source = read("controllers/mpesaController.js");
  const createIndex = source.indexOf("const pendingPayment=await Payment.create");
  const providerIndex = source.indexOf("initiateStkPush({phone:customerPhone");
  assert.ok(createIndex >= 0, "STK flow must create a durable payment before provider initiation");
  assert.ok(providerIndex > createIndex, "provider initiation must occur after durable payment creation");
  assert.match(source, /transactionReference=\`MPESA-STK-\$\{crypto\.randomUUID\(\)\}\`/);
});

test("M-Pesa STK failures persist a failed payment state", () => {
  const source = read("controllers/mpesaController.js");
  assert.match(source, /pendingPayment\.status="failed"/);
  assert.match(source, /pendingPayment\.failureReason=error\.message/);
  assert.match(source, /pendingPayment\.failedAt=new Date\(\)/);
});

test("M-Pesa duplicate initiation remains blocked by tenant-scoped pending or processing payment", () => {
  const source = read("controllers/mpesaController.js");
  assert.match(
    source,
    /Payment\.findOne\(mergeTenantFilter\(req,\{booking:booking\._id,status:\{\$in:\["pending","processing"\]\}\}\)\)/
  );
});

test("payment model retains tenant-scoped provider idempotency indexes", () => {
  const source = read("models/Payment.js");
  for (const marker of [
    'paymentSchema.index({ tenantId: 1, checkoutRequestID: 1 }',
    'paymentSchema.index({ tenantId: 1, mpesaReceiptNumber: 1 }',
    'paymentSchema.index({ tenantId: 1, callbackEventId: 1 }',
    'paymentSchema.index({ tenantId: 1, provider: 1, transactionReference: 1 }'
  ]) assert.ok(source.includes(marker), `missing payment uniqueness contract: ${marker}`);
});

test("M-Pesa callback stores provider identifiers through the central lifecycle", () => {
  const source = read("controllers/mpesaController.js");
  assert.match(source, /checkoutRequestID/);
  assert.match(source, /mpesaReceiptNumber/);
  assert.match(source, /merchantRequestID/);
  assert.match(source, /completeBookingPayment\(/);
  assert.match(source, /failBookingPayment\(/);
});

test("production evidence still requires real payment and reconciliation verification", () => {
  const checklist = fs.readFileSync(path.resolve(serverRoot, "../docs/PRODUCTION_GO_LIVE_CHECKLIST.md"), "utf8");
  assert.match(checklist, /PRODUCTION_PAYMENT_VERIFIED=true/);
  assert.match(checklist, /Run tenant-isolated payment, refund and reconciliation tests/);
  assert.match(checklist, /Do not mark an evidence flag true unless the corresponding external test was actually completed/);
});
