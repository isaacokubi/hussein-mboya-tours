import assert from "node:assert/strict";
import test from "node:test";
import { getMpesaUrls, validateMpesaEnvironment } from "../config/mpesa.js";
import { generateAccessToken, initiateStkPush, normalizePhoneNumber } from "../services/mpesaService.js";
import { runWithTenant } from "../tenancy/context.js";

test("Daraja endpoints are selected by explicit sandbox and production modes", () => {
  assert.match(getMpesaUrls("sandbox").auth, /^https:\/\/sandbox\.safaricom\.co\.ke\//);
  assert.match(getMpesaUrls("sandbox").stk, /\/mpesa\/stkpush\/v1\/processrequest$/);
  assert.match(getMpesaUrls("production").auth, /^https:\/\/api\.safaricom\.co\.ke\//);
  assert.throws(() => validateMpesaEnvironment("live"), /MPESA_ENVIRONMENT/);
});

test("Daraja base URL configuration cannot cross environments or use insecure hosts", () => {
  const previous = process.env.MPESA_SANDBOX_BASE_URL;
  process.env.MPESA_SANDBOX_BASE_URL = "https://api.safaricom.co.ke";
  try { assert.throws(() => getMpesaUrls("sandbox"), /base URL is invalid/); }
  finally {
    if (previous === undefined) delete process.env.MPESA_SANDBOX_BASE_URL;
    else process.env.MPESA_SANDBOX_BASE_URL = previous;
  }
});

test("Kenyan mobile numbers normalize consistently and invalid numbers are rejected", async () => {
  await runWithTenant({ tenantId: "test-tenant" }, async () => {
    assert.equal(normalizePhoneNumber("0712 345 678"), "254712345678");
    assert.equal(normalizePhoneNumber("+254112345678"), "254112345678");
    assert.throws(() => normalizePhoneNumber("254201234567"), /Invalid Safaricom phone number/);
  });
});

const mockConfig = (suffix) => ({ consumerKey: `sandbox-key-${suffix}`, consumerSecret: `sandbox-secret-${suffix}`, shortcode: "174379", passkey: "sandbox-passkey", callbackUrl: "https://callback.example.test/api/mpesa/callback", environment: "sandbox" });

test("OAuth uses the Daraja client-credentials endpoint and Basic base64 authentication", async () => {
  const config = mockConfig("oauth");
  let observed;
  const client = { get: async (url, options) => { observed = { url, options }; return { data: { access_token: "mock-access-token", expires_in: "3600" } }; } };
  assert.equal(await generateAccessToken(config, client), "mock-access-token");
  assert.equal(observed.url, getMpesaUrls("sandbox").auth);
  assert.equal(observed.options.headers.Authorization, `Basic ${Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString("base64")}`);
  assert.equal(observed.options.timeout, 10000);
});

test("STK Push sends the Daraja payload and validates provider acceptance", async () => {
  const config = mockConfig("stk");
  const calls = [];
  const client = {
    get: async () => ({ data: { access_token: "mock-token", expires_in: 3600 } }),
    post: async (url, payload, options) => { calls.push({ url, payload, options }); return { data: { ResponseCode: "0", CheckoutRequestID: "ws_CO_mock", MerchantRequestID: "merchant_mock" } }; },
  };
  const result = await runWithTenant({ tenantId: "test-tenant" }, () => initiateStkPush({ phone: "0712345678", amount: 1200, bookingId: "booking-mock", config, client, companyName: "Test Tours" }));
  assert.equal(result.CheckoutRequestID, "ws_CO_mock");
  const [{ url, payload, options }] = calls;
  assert.equal(url, getMpesaUrls("sandbox").stk);
  assert.equal(payload.BusinessShortCode, config.shortcode);
  assert.equal(payload.TransactionType, "CustomerPayBillOnline");
  assert.equal(payload.Amount, 1200);
  assert.equal(payload.PartyA, "254712345678");
  assert.equal(payload.PartyB, config.shortcode);
  assert.equal(payload.PhoneNumber, "254712345678");
  assert.equal(payload.CallBackURL, config.callbackUrl);
  assert.equal(payload.AccountReference, "BOOKING-booking-mock");
  assert.match(payload.Password, /^[A-Za-z0-9+/]+=*$/);
  assert.equal(options.headers.Authorization, "Bearer mock-token");
});

test("OAuth and STK failures never include credentials or token values in logs/errors", async () => {
  const config = mockConfig("failure");
  const messages = [];
  const originalError = console.error;
  console.error = (...args) => messages.push(JSON.stringify(args));
  try {
    await assert.rejects(generateAccessToken(config, { get: async () => { throw Object.assign(new Error(config.consumerSecret), { response: { status: 401, data: { error: config.consumerSecret } } }); } }), /Unable to authenticate/);
    const client = {
      get: async () => ({ data: { access_token: "mock-token", expires_in: 3600 } }),
      post: async () => { throw Object.assign(new Error(config.passkey), { response: { status: 500, data: { errorMessage: config.passkey } } }); },
    };
    await assert.rejects(runWithTenant({ tenantId: "test-tenant" }, () => initiateStkPush({ phone: "0712345678", amount: 100, bookingId: "booking-failure", config, client, companyName: "Test Tours" })), /uncertain/);
  } finally { console.error = originalError; }
  const combined = messages.join(" ");
  assert.equal(combined.includes(config.consumerSecret), false);
  assert.equal(combined.includes(config.passkey), false);
});
