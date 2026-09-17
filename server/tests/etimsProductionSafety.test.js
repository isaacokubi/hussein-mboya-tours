import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(process.cwd());
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("eTIMS production submissions require HTTPS and reject private/local adapter targets", () => {
  const service = read("services/etimsService.js");
  assert.match(service, /process\.env\.NODE_ENV === "production"/);
  assert.match(service, /parsed\.protocol !== "https:"/);
  assert.match(service, /private or local address/);
  assert.match(service, /metadata\.google\.internal/);
  assert.match(service, /host\.docker\.internal/);
});

test("eTIMS submissions are tenant-scoped, idempotent and durably audited", () => {
  const service = read("services/etimsService.js");
  assert.match(service, /Invoice\.findOne\(\{ tenantId: payload\.tenantId/);
  assert.match(service, /TaxProfile\.findOne\(\{ tenantId: payload\.tenantId/);
  assert.match(service, /EtimsCredential\.findOne\(\{ tenantId, environment \}/);
  assert.match(service, /const idempotencyKey = `etims-invoice:\$\{invoiceId\}`/);
  assert.match(service, /x-idempotency-key/);
  assert.match(service, /EtimsSubmission\.create/);
  assert.match(service, /error\?\.code !== 11000/);
});

test("eTIMS does not fabricate a tax receipt when no adapter is configured", () => {
  const service = read("services/etimsService.js");
  assert.match(service, /No eTIMS adapter is configured/);
  assert.match(service, /certified OSCU\/VSCU adapter/);
  assert.match(service, /invoice\.etimsStatus = "failed"/);
  assert.match(service, /invoice\.etimsLastError/);
});

test("eTIMS adapter failures retain retry state and successful responses persist official identifiers", () => {
  const service = read("services/etimsService.js");
  assert.match(service, /invoice\.etimsNextRetryAt/);
  assert.match(service, /Math\.min\(1440/);
  assert.match(service, /etimsInvoiceNumber/);
  assert.match(service, /etimsReceiptNumber/);
  assert.match(service, /etimsUniqueRegisterIdentifier/);
  assert.match(service, /etimsQrCode/);
});
