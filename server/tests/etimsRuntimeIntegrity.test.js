import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(process.cwd());
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("eTIMS creates the submission audit before selecting OSCU or adapter mode", () => {
  const source = read("services/etimsService.js");
  const auditMarker = "const audit = await createSubmissionAudit(";
  const oscuMarker = 'if (String(profile.etimsSolution || "").toUpperCase() === "OSCU") {';
  assert.ok(source.indexOf(auditMarker) >= 0);
  assert.ok(source.indexOf(auditMarker) < source.indexOf(oscuMarker), "audit must exist before OSCU execution");
  assert.equal((source.match(/const audit = await createSubmissionAudit\\(\\{/g) || []).length, 1, "audit must be created exactly once per submission attempt");
});

test("eTIMS OSCU success persists the real KRA payload hash and audit result", () => {
  const source = read("services/etimsService.js");
  for (const marker of [
    "if (result.payload) audit.requestHash = crypto.createHash",
    'audit.status = "synced"',
    "audit.etimsInvoiceNumber",
    "audit.etimsReceiptNumber",
    "audit.uniqueRegisterIdentifier",
    "audit.qrCode",
    "await Promise.all([invoice.save(), audit.save()])",
  ]) assert.ok(source.includes(marker), "Missing " + marker);
});

test("eTIMS OSCU failure persists the failure audit and retry schedule", () => {
  const source = read("services/etimsService.js");
  for (const marker of [
    'audit.status = "failed"',
    "audit.error = invoice.etimsLastError",
    "audit.response = error?.kraResponse || {}",
    "invoice.etimsNextRetryAt",
  ]) assert.ok(source.includes(marker), "Missing " + marker);
});

test("eTIMS adapter mode keeps one durable audit identity and request hash", () => {
  const source = read("services/etimsService.js");
  for (const marker of [
    "const idempotencyKey = `etims-invoice:${invoice._id}`",
    "const requestHash = crypto.createHash",
    "audit.requestHash = requestHash",
    '"x-idempotency-key": idempotencyKey',
    "createSubmissionAudit",
  ]) assert.ok(source.includes(marker), "Missing " + marker);
});

test("Phase 14 does not certify live KRA evidence in source", () => {
  const checklist = fs.readFileSync(path.join(root, "../docs/PRODUCTION_GO_LIVE_CHECKLIST.md"), "utf8");
  assert.ok(checklist.includes("PRODUCTION_ETIMS_VERIFIED=true"));
  assert.ok(checklist.includes("Do not mark an evidence flag true unless the corresponding external test was actually completed."));
});
