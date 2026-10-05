import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { buildRefundCallbackUrls } from "../services/mpesaRefundService.js";

const root = path.resolve(process.cwd());
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("M-Pesa refund callbacks are derived from the callback route without duplicating /callback", () => {
  assert.deepEqual(
    buildRefundCallbackUrls("https://example.test/api/mpesa/callback"),
    {
      resultUrl: "https://example.test/api/mpesa/refund/result",
      timeoutUrl: "https://example.test/api/mpesa/refund/timeout",
    },
  );
});

test("M-Pesa refund service uses Daraja TransactionReversal, not B2C disbursement", () => {
  const service = read("services/mpesaRefundService.js");
  const config = read("config/mpesa.js");

  assert.match(config, /reversal:/);
  assert.match(config, /\/mpesa\/reversal\/v1\/request/);
  assert.match(service, /urls\.reversal/);
  assert.match(service, /CommandID: "TransactionReversal"/);
  assert.match(service, /TransactionID: originalTransactionId/);
  assert.match(service, /ReceiverPartyType: "11"/);
  assert.doesNotMatch(service, /urls\.b2c/);
  assert.doesNotMatch(service, /CommandID: "BusinessPayment"/);
  assert.match(service, /ResultURL: resultUrl/);
  assert.match(service, /QueueTimeOutURL: timeoutUrl/);
});
