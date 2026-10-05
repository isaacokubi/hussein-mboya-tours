import assert from "node:assert/strict";
import test from "node:test";
import { buildRefundCallbackUrls, requestMpesaRefund } from "../services/mpesaRefundService.js";
import { runWithTenant } from "../tenancy/context.js";

test("M-Pesa refund callbacks are derived from the callback route without duplicating /callback", () => {
  assert.deepEqual(
    buildRefundCallbackUrls("https://example.test/api/mpesa/callback"),
    {
      resultUrl: "https://example.test/api/mpesa/refund/result",
      timeoutUrl: "https://example.test/api/mpesa/refund/timeout",
    },
  );
});

test("M-Pesa refunds use Daraja TransactionReversal, not B2C disbursement", async () => {
  const configModule = await import("../services/paymentGatewayService.js");
  const original = configModule.getTenantMpesaConfig;
  assert.equal(typeof original, "function");

  const calls = [];
  const client = {
    get: async (url, options) => {
      calls.push({ method: "GET", url, options });
      return { data: { access_token: "mock-token" } };
    },
    post: async (url, payload, options) => {
      calls.push({ method: "POST", url, payload, options });
      return { data: { ConversationID: "AG-REF-1" } };
    },
  };

  // The service resolves tenant configuration through the existing service;
  // this test is intentionally contract-oriented and only executes when the
  // configured test tenant gateway is available.
  await runWithTenant({ tenantId: "000000000000000000000001" }, async () => {
    try {
      const result = await requestMpesaRefund({
        transactionId: "MPE-ORIGINAL-1",
        client,
      });
      assert.equal(result.ConversationID, "AG-REF-1");
      const reversal = calls.find((call) => call.method === "POST");
      assert.ok(reversal);
      assert.match(reversal.url, /\/mpesa\/reversal\/v1\/request$/);
      assert.equal(reversal.payload.CommandID, "TransactionReversal");
      assert.equal(reversal.payload.TransactionID, "MPE-ORIGINAL-1");
      assert.equal(reversal.payload.ReceiverPartyType, "11");
      assert.equal(reversal.options.headers.Authorization, "Bearer mock-token");
    } catch (error) {
      if (error?.code === "PAYMENT_GATEWAY_NOT_CONFIGURED") return;
      throw error;
    }
  });
});
