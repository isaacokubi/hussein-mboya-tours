/**
 * Purpose: mpesa Offline Simulation.test automated test. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import assert from "node:assert/strict";
// Load node:test so this module can use its exported dependencies.
import test from "node:test";
// Load ../config/mpesa.js so this module can use its exported dependencies.
import { getMpesaUrls, validateMpesaEnvironment } from "../config/mpesa.js";
// Load ../services/mpesaService.js so this module can use its exported dependencies.
import { initiateStkPush, normalizePhoneNumber } from "../services/mpesaService.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { runWithTenant } from "../tenancy/context.js";

// Declare config for use by the surrounding module or function.
const config = {
  consumerKey: "offline-test-key",
  consumerSecret: "offline-test-secret",
  shortcode: "174379",
  passkey: "offline-test-passkey",
  callbackUrl: "https://callback.example.test/api/mpesa/callback",
  environment: "sandbox",
};

// Perform the side effect or state update expressed on the following line.
test("offline simulation keeps sandbox requests on Safaricom sandbox endpoints", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.match(getMpesaUrls("sandbox").auth, /^https:\/\/sandbox\.safaricom\.co\.ke\//);
  // Perform the side effect or state update expressed on the following line.
  assert.match(getMpesaUrls("sandbox").stk, /^https:\/\/sandbox\.safaricom\.co\.ke\/mpesa\/stkpush\//);
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => validateMpesaEnvironment("live"), /MPESA_ENVIRONMENT/);
});

// Perform the side effect or state update expressed on the following line.
test("offline simulation normalizes Kenyan mobile numbers and rejects invalid ones", async () => {
  // Perform the side effect or state update expressed on the following line.
  await runWithTenant({ tenantId: "mpesa-offline-test" }, async () => {
    // Perform the side effect or state update expressed on the following line.
    assert.equal(normalizePhoneNumber("0712 345 678"), "254712345678");
    // Perform the side effect or state update expressed on the following line.
    assert.equal(normalizePhoneNumber("+254112345678"), "254112345678");
    // Perform the side effect or state update expressed on the following line.
    assert.throws(() => normalizePhoneNumber("0201234567"), /Invalid Safaricom phone number/);
  });
});

// Perform the side effect or state update expressed on the following line.
test("offline simulation rejects zero-value payments before making provider calls", async () => {
  // Declare providerCalls for use by the surrounding module or function.
  let providerCalls = 0;
  // Declare client for use by the surrounding module or function.
  const client = {
    get: async () => { providerCalls += 1; throw new Error("must not call provider"); },
    post: async () => { providerCalls += 1; throw new Error("must not call provider"); },
  };
  // Perform the side effect or state update expressed on the following line.
  await assert.rejects(
    initiateStkPush({ phone: "0712345678", amount: 0, bookingId: "offline-zero", config, client, companyName: "Offline Test" }),
    /Invalid payment amount/,
  );
  // Perform the side effect or state update expressed on the following line.
  assert.equal(providerCalls, 0);
});

// Perform the side effect or state update expressed on the following line.
test("offline simulation rejects invalid phone numbers before requesting an access token", async () => {
  // Declare providerCalls for use by the surrounding module or function.
  let providerCalls = 0;
  // Declare client for use by the surrounding module or function.
  const client = {
    get: async () => { providerCalls += 1; throw new Error("must not call provider"); },
    post: async () => { providerCalls += 1; throw new Error("must not call provider"); },
  };
  // Perform the side effect or state update expressed on the following line.
  await assert.rejects(
    runWithTenant({ tenantId: "mpesa-offline-test" }, () =>
      initiateStkPush({ phone: "0201234567", amount: 100, bookingId: "offline-invalid-phone", config, client, companyName: "Offline Test" }),
    ),
    /Invalid Safaricom phone number/,
  );
  // Perform the side effect or state update expressed on the following line.
  assert.equal(providerCalls, 0);
});
