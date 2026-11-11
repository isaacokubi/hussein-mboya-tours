/**
 * Purpose: mpesa Configuration.test automated test. Main declarations: mockConfig.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import assert from "node:assert/strict";
// Load node:test so this module can use its exported dependencies.
import test from "node:test";
// Load ../config/mpesa.js so this module can use its exported dependencies.
import { getMpesaUrls, validateMpesaEnvironment } from "../config/mpesa.js";
// Load ../services/mpesaService.js so this module can use its exported dependencies.
import { generateAccessToken, initiateStkPush, normalizePhoneNumber } from "../services/mpesaService.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { runWithTenant } from "../tenancy/context.js";

// Perform the side effect or state update expressed on the following line.
test("Daraja endpoints are selected by explicit sandbox and production modes", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.match(getMpesaUrls("sandbox").auth, /^https:\/\/sandbox\.safaricom\.co\.ke\//);
  // Perform the side effect or state update expressed on the following line.
  assert.match(getMpesaUrls("sandbox").stk, /\/mpesa\/stkpush\/v1\/processrequest$/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(getMpesaUrls("sandbox").reversal, /\/mpesa\/reversal\/v1\/request$/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(getMpesaUrls("production").auth, /^https:\/\/api\.safaricom\.co\.ke\//);
  // Perform the side effect or state update expressed on the following line.
  assert.throws(() => validateMpesaEnvironment("live"), /MPESA_ENVIRONMENT/);
});

// Perform the side effect or state update expressed on the following line.
test("Daraja base URL configuration cannot cross environments or use insecure hosts", () => {
  // Declare previous for use by the surrounding module or function.
  const previous = process.env.MPESA_SANDBOX_BASE_URL;
  // Perform the side effect or state update expressed on the following line.
  process.env.MPESA_SANDBOX_BASE_URL = "https://api.safaricom.co.ke";
  // Run this operation with a dedicated error-handling path for failures.
  try { assert.throws(() => getMpesaUrls("sandbox"), /base URL is invalid/); }
  finally {
    // Check the condition (previous === undefined) and run the matching branch.
    if (previous === undefined) delete process.env.MPESA_SANDBOX_BASE_URL;
    else process.env.MPESA_SANDBOX_BASE_URL = previous;
  }
});

// Perform the side effect or state update expressed on the following line.
test("Kenyan mobile numbers normalize consistently and invalid numbers are rejected", async () => {
  // Perform the side effect or state update expressed on the following line.
  await runWithTenant({ tenantId: "test-tenant" }, async () => {
    // Perform the side effect or state update expressed on the following line.
    assert.equal(normalizePhoneNumber("0712 345 678"), "254712345678");
    // Perform the side effect or state update expressed on the following line.
    assert.equal(normalizePhoneNumber("+254112345678"), "254112345678");
    // Perform the side effect or state update expressed on the following line.
    assert.equal(normalizePhoneNumber("254708374149"), "254708374149");
    // Perform the side effect or state update expressed on the following line.
    assert.throws(() => normalizePhoneNumber("254201234567"), (error) => error.message === "Invalid Safaricom phone number." && error.status === 400 && error.code === "INVALID_MPESA_PHONE");
    // Perform the side effect or state update expressed on the following line.
    assert.throws(() => normalizePhoneNumber(""), (error) => error.message === "Phone number is required." && error.status === 400 && error.code === "INVALID_MPESA_PHONE");
  });
});

// Declare mockConfig for use by the surrounding module or function.
const mockConfig = (suffix) => ({ consumerKey: `sandbox-key-${suffix}`, consumerSecret: `sandbox-secret-${suffix}`, shortcode: "174379", passkey: "sandbox-passkey", callbackUrl: "https://callback.example.test/api/mpesa/callback", environment: "sandbox" });

// Perform the side effect or state update expressed on the following line.
test("OAuth uses the Daraja client-credentials endpoint and Basic base64 authentication", async () => {
  // Declare config for use by the surrounding module or function.
  const config = mockConfig("oauth");
  // Declare observed for use by the surrounding module or function.
  let observed;
  // Declare client for use by the surrounding module or function.
  const client = { get: async (url, options) => { observed = { url, options }; return { data: { access_token: "mock-access-token", expires_in: "3600" } }; } };
  // Perform the side effect or state update expressed on the following line.
  assert.equal(await generateAccessToken(config, client), "mock-access-token");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(observed.url, getMpesaUrls("sandbox").auth);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(observed.options.headers.Authorization, `Basic ${Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString("base64")}`);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(observed.options.timeout, 10000);
});

// Perform the side effect or state update expressed on the following line.
test("STK Push sends the Daraja payload and validates provider acceptance", async () => {
  // Declare config for use by the surrounding module or function.
  const config = mockConfig("stk");
  // Declare calls for use by the surrounding module or function.
  const calls = [];
  // Declare client for use by the surrounding module or function.
  const client = {
    get: async () => ({ data: { access_token: "mock-token", expires_in: 3600 } }),
    post: async (url, payload, options) => { calls.push({ url, payload, options }); return { data: { ResponseCode: "0", CheckoutRequestID: "ws_CO_mock", MerchantRequestID: "merchant_mock" } }; },
  };
  // Declare result for use by the surrounding module or function.
  const result = await runWithTenant({ tenantId: "test-tenant" }, () => initiateStkPush({ phone: "254708374149", amount: 1200, bookingId: "booking-mock", config, client, companyName: "Test Tours" }));
  // Perform the side effect or state update expressed on the following line.
  assert.equal(result.CheckoutRequestID, "ws_CO_mock");
  // Declare [{ url, payload, options }] for use by the surrounding module or function.
  const [{ url, payload, options }] = calls;
  // Perform the side effect or state update expressed on the following line.
  assert.equal(url, getMpesaUrls("sandbox").stk);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(payload.BusinessShortCode, config.shortcode);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(payload.TransactionType, "CustomerPayBillOnline");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(payload.Amount, 1200);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(payload.PartyA, "254708374149");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(payload.PartyB, config.shortcode);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(payload.PhoneNumber, "254708374149");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(payload.CallBackURL, config.callbackUrl);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(payload.AccountReference, "BOOKING-booking-mock");
  // Perform the side effect or state update expressed on the following line.
  assert.match(payload.Password, /^[A-Za-z0-9+/]+=*$/);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(options.headers.Authorization, "Bearer mock-token");
});

// Perform the side effect or state update expressed on the following line.
test("STK initiation rejects fractional, unsafe, and non-positive amounts before provider requests", async () => {
  // Declare config for use by the surrounding module or function.
  const config = mockConfig("invalid-amount");
  // Declare requests for use by the surrounding module or function.
  let requests = 0;
  // Declare client for use by the surrounding module or function.
  const client = {
    get: async () => { requests += 1; return { data: { access_token: "mock-token", expires_in: 3600 } }; },
    post: async () => { requests += 1; return { data: {} }; },
  };

  // Repeat the enclosed work for each required iteration.
  for (const amount of [0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, "not-an-amount"]) {
    // Perform the side effect or state update expressed on the following line.
    await assert.rejects(
      runWithTenant({ tenantId: "test-tenant" }, () => initiateStkPush({ phone: "0712345678", amount, bookingId: "booking-invalid", config, client, companyName: "Test Tours" })),
      (error) => error.status === 400 && error.code === "INVALID_MPESA_AMOUNT",
    );
  }

  // Perform the side effect or state update expressed on the following line.
  assert.equal(requests, 0);
});

// Perform the side effect or state update expressed on the following line.
test("OAuth and STK failures never include credentials or token values in logs/errors", async () => {
  // Declare config for use by the surrounding module or function.
  const config = mockConfig("failure");
  // Declare messages for use by the surrounding module or function.
  const messages = [];
  // Declare originalError for use by the surrounding module or function.
  const originalError = console.error;
  // Perform the side effect or state update expressed on the following line.
  console.error = (...args) => messages.push(JSON.stringify(args));
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    await assert.rejects(generateAccessToken(config, { get: async () => { throw Object.assign(new Error(config.consumerSecret), { response: { status: 401, data: { error: config.consumerSecret } } }); } }), /Unable to authenticate/);
    // Declare client for use by the surrounding module or function.
    const client = {
      get: async () => ({ data: { access_token: "mock-token", expires_in: 3600 } }),
      post: async () => { throw Object.assign(new Error(config.passkey), { response: { status: 500, data: { errorMessage: config.passkey } } }); },
    };
    // Perform the side effect or state update expressed on the following line.
    await assert.rejects(runWithTenant({ tenantId: "test-tenant" }, () => initiateStkPush({ phone: "0712345678", amount: 100, bookingId: "booking-failure", config, client, companyName: "Test Tours" })), /uncertain/);
  } finally { console.error = originalError; }
  // Declare combined for use by the surrounding module or function.
  const combined = messages.join(" ");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(combined.includes(config.consumerSecret), false);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(combined.includes(config.passkey), false);
});
