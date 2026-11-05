import assert from "node:assert/strict";
import test from "node:test";
import { getMpesaUrls, validateMpesaEnvironment } from "../config/mpesa.js";
import { initiateStkPush, normalizePhoneNumber } from "../services/mpesaService.js";
import { runWithTenant } from "../tenancy/context.js";

const config = {
  consumerKey: "offline-test-key",
  consumerSecret: "offline-test-secret",
  shortcode: "174379",
  passkey: "offline-test-passkey",
  callbackUrl: "https://callback.example.test/api/mpesa/callback",
  environment: "sandbox",
};

test("offline simulation keeps sandbox requests on Safaricom sandbox endpoints", () => {
  assert.match(getMpesaUrls("sandbox").auth, /^https:\/\/sandbox\.safaricom\.co\.ke\//);
  assert.match(getMpesaUrls("sandbox").stk, /^https:\/\/sandbox\.safaricom\.co\.ke\/mpesa\/stkpush\//);
  assert.throws(() => validateMpesaEnvironment("live"), /MPESA_ENVIRONMENT/);
});

test("offline simulation normalizes Kenyan mobile numbers and rejects invalid ones", async () => {
  await runWithTenant({ tenantId: "mpesa-offline-test" }, async () => {
    assert.equal(normalizePhoneNumber("0712 345 678"), "254712345678");
    assert.equal(normalizePhoneNumber("+254112345678"), "254112345678");
    assert.throws(() => normalizePhoneNumber("0201234567"), /Invalid Safaricom phone number/);
  });
});

test("offline simulation rejects zero-value payments before making provider calls", async () => {
  let providerCalls = 0;
  const client = {
    get: async () => { providerCalls += 1; throw new Error("must not call provider"); },
    post: async () => { providerCalls += 1; throw new Error("must not call provider"); },
  };
  await assert.rejects(
    initiateStkPush({ phone: "0712345678", amount: 0, bookingId: "offline-zero", config, client, companyName: "Offline Test" }),
    /Invalid payment amount/,
  );
  assert.equal(providerCalls, 0);
});

test("offline simulation rejects invalid phone numbers before requesting an access token", async () => {
  let providerCalls = 0;
  const client = {
    get: async () => { providerCalls += 1; throw new Error("must not call provider"); },
    post: async () => { providerCalls += 1; throw new Error("must not call provider"); },
  };
  await assert.rejects(
    runWithTenant({ tenantId: "mpesa-offline-test" }, () =>
      initiateStkPush({ phone: "0201234567", amount: 100, bookingId: "offline-invalid-phone", config, client, companyName: "Offline Test" }),
    ),
    /Invalid Safaricom phone number/,
  );
  assert.equal(providerCalls, 0);
});
