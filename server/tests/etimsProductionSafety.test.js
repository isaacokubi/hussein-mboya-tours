/**
 * Purpose: etims Production Safety.test automated test. Main declarations: read.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import assert from "node:assert/strict";
// Load node:fs so this module can use its exported dependencies.
import fs from "node:fs";
// Load node:path so this module can use its exported dependencies.
import path from "node:path";
// Load node:test so this module can use its exported dependencies.
import test from "node:test";
// Load ../services/etimsService.js so this module can use its exported dependencies.
import { getEtimsConfirmation } from "../services/etimsService.js";
// Load ../services/etimsNoteService.js so this module can use its exported dependencies.
import { getEtimsNoteConfirmation } from "../services/etimsNoteService.js";

// Declare root for use by the surrounding module or function.
const root = path.resolve(process.cwd());
// Declare read for use by the surrounding module or function.
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

// Perform the side effect or state update expressed on the following line.
test("eTIMS production submissions require HTTPS and reject private/local adapter targets", () => {
  // Declare service for use by the surrounding module or function.
  const service = read("services/etimsService.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(service, /process\.env\.NODE_ENV === "production"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(service, /parsed\.protocol !== "https:"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(service, /private or local address/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(service, /metadata\.google\.internal/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(service, /host\.docker\.internal/);
});

// Perform the side effect or state update expressed on the following line.
test("eTIMS submissions are tenant-scoped, idempotent and durably audited", () => {
  // Declare service for use by the surrounding module or function.
  const service = read("services/etimsService.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(service, /Invoice\.findOne\(\{ tenantId: payload\.tenantId/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(service, /TaxProfile\.findOne\(\{ tenantId: payload\.tenantId/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(service, /EtimsCredential\.findOne\(\{ tenantId, environment \}/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(service, /const idempotencyKey = `etims-invoice:\$\{invoiceId\}`/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(service, /x-idempotency-key/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(service, /EtimsSubmission\.create/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(service, /error\?\.code !== 11000/);
});

// Perform the side effect or state update expressed on the following line.
test("eTIMS does not fabricate a tax receipt when no adapter is configured", () => {
  // Declare service for use by the surrounding module or function.
  const service = read("services/etimsService.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(service, /No eTIMS adapter is configured/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(service, /certified OSCU\/VSCU adapter/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(service, /invoice\.etimsStatus = "failed"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(service, /invoice\.etimsLastError/);
});

// Perform the side effect or state update expressed on the following line.
test("eTIMS adapter failures retain retry state and successful responses persist official identifiers", () => {
  // Declare service for use by the surrounding module or function.
  const service = read("services/etimsService.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(service, /invoice\.etimsNextRetryAt/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(service, /Math\.min\(1440/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(service, /etimsInvoiceNumber/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(service, /etimsReceiptNumber/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(service, /etimsUniqueRegisterIdentifier/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(service, /etimsQrCode/);
});

// Perform the side effect or state update expressed on the following line.
test("eTIMS success requires explicit provider confirmation and official references", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.equal(getEtimsConfirmation(false, { success: true, invoiceNumber: "INV-1", receiptNumber: "R-1" }), null);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(getEtimsConfirmation(true, {}), null);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(getEtimsConfirmation(true, { success: false, invoiceNumber: "INV-1", receiptNumber: "R-1" }), null);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(getEtimsConfirmation(true, { success: true, invoiceNumber: "INV-1" }), null);
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(
    getEtimsConfirmation(true, { success: true, etimsInvoiceNumber: "INV-1", uir: "UIR-1", qrCode: "qr" }),
    { invoiceNumber: "INV-1", receiptReference: "UIR-1", uniqueRegisterIdentifier: "UIR-1", qrCode: "qr" },
  );
});

// Perform the side effect or state update expressed on the following line.
test("eTIMS credit/debit note success requires explicit provider references", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.equal(getEtimsNoteConfirmation(false, { success: true, reference: "NOTE-1", receiptNumber: "R-1" }), null);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(getEtimsNoteConfirmation(true, {}), null);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(getEtimsNoteConfirmation(true, { success: true, reference: "NOTE-1" }), null);
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(
    getEtimsNoteConfirmation(true, { success: true, etimsReference: "NOTE-1", etimsReceiptNumber: "R-1" }),
    { reference: "NOTE-1", receiptNumber: "R-1" },
  );
});

// Perform the side effect or state update expressed on the following line.
test("eTIMS retry policy distinguishes transient provider failures from permanent validation failures", () => {
  // Declare service for use by the surrounding module or function.
  const service = read("services/etimsService.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(service, /code === 408 \|\| code === 429 \|\| code >= 500/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(service, /const retryable = !response\.ok && isRetryableEtimsHttpStatus\(response\.status\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(service, /invoice\.etimsNextRetryAt = retryable \? nextEtimsRetryAt/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(service, /if \(retryable\) throw new Error/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(service, /etimsStatus:\s*"failed",\s*etimsNextRetryAt:\s*\{\s*\$ne:\s*null,\s*\$lte:\s*new Date\(\)\s*\}/);
});

// Perform the side effect or state update expressed on the following line.
test("eTIMS network failures persist failed state and bounded retry timing", () => {
  // Declare service for use by the surrounding module or function.
  const service = read("services/etimsService.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(service, /invoice\.etimsStatus = "failed";/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(service, /invoice\.etimsLastError = String\(error\?\.message/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(service, /invoice\.etimsNextRetryAt = nextEtimsRetryAt/);
});
