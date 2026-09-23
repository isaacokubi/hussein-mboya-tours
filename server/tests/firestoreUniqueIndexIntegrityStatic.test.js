import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), "utf8");

test("Firestore compatibility layer persists schema indexes and enforces unique indexes before writes", () => {
  const source = read("config/firestore.js");
  assert.match(source, /this\._indexes=\[\]/);
  assert.match(source, /index\(fields=\{\}, options=\{\}\)/);
  assert.match(source, /enforceUniqueIndexes\(schema, name, data, options\.session, this\._id\)/);
  assert.match(source, /error\.code = 11000/);
});

test("Payment model declares tenant-scoped provider uniqueness contracts", () => {
  const source = read("models/Payment.js");
  for (const marker of [
    "paymentSchema.index({ tenantId: 1, provider: 1, transactionReference: 1 }",
    "paymentSchema.index({ tenantId: 1, checkoutRequestID: 1 }",
    "paymentSchema.index({ tenantId: 1, mpesaReceiptNumber: 1 }",
    "paymentSchema.index({ tenantId: 1, callbackEventId: 1 }",
  ]) {
    assert.ok(source.includes(marker), `missing payment uniqueness contract: ${marker}`);
  }
});
