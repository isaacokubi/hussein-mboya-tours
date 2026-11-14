import assert from "node:assert/strict";
import test from "node:test";
import { runWithTenant } from "../tenancy/context.js";
import {
  generateAccessToken,
  generatePassword,
  generateTimestamp,
  initiateStkPush,
  normalizePhoneNumber,
} from "../services/mpesaService.js";

const tenant = { tenantId: "mpesa-sandbox-test-tenant" };
const config = {
  consumerKey: "sandbox-consumer-key-test-suite",
  consumerSecret: "sandbox-consumer-secret-test-suite",
  shortcode: "174379",
  passkey: "sandbox-passkey-test-suite",
  callbackUrl: "https://hussein-mboya-tours.onrender.com/api/mpesa/callback",
  environment: "sandbox",
  source: "automated-test",
};

test("Kenyan Safaricom phone numbers normalize to international format", () => {
  runWithTenant(tenant, () => {
    assert.equal(normalizePhoneNumber("0712345678"), "254712345678");
    assert.equal(normalizePhoneNumber("0112345678"), "254112345678");
    assert.equal(normalizePhoneNumber("+254712345678"), "254712345678");
    assert.equal(normalizePhoneNumber("254712345678"), "254712345678");
    for (const invalid of ["", "070000000", "254012345678", "1234567890", "2547123456789"]) {
      assert.throws(() => normalizePhoneNumber(invalid), { code: "INVALID_MPESA_PHONE" });
    }
  });
});

test("Daraja timestamp and STK password follow the shortcode + passkey + timestamp contract", () => {
  const timestamp = generateTimestamp();
  assert.match(timestamp, /^\\d{14}$/);
  const expected = Buffer.from(`${config.shortcode}${config.passkey}${timestamp}`).toString("base64");
  assert.equal(generatePassword(timestamp, config), expected);
  assert.throws(() => generatePassword(timestamp), /configuration/i);
});

test("Sandbox OAuth sends Basic credentials and caches a valid access token", async () => {
  const calls = [];
  const client = {
    get: async (url, options) => {
      calls.push({ url, options });
      return { data: { access_token: "sandbox-token-test", expires_in: 3600 } };
    },
  };
  const result = await runWithTenant(tenant, () => generateAccessToken(config, client));
  assert.equal(result, "sandbox-token-test");
  assert.equal(calls.length, 1);
  assert.match(calls[0].url, /sandbox/);
  assert.equal(calls[0].options.headers.Authorization, `Basic ${Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString("base64")}`);
});

test("STK Push sends the expected Sandbox request and accepts only a complete provider response", async () => {
  const calls = [];
  const client = {
    get: async (url, options) => {
      calls.push({ method: "GET", url, options });
      return { data: { access_token: "stk-sandbox-token", expires_in: 3600 } };
    },
    post: async (url, payload, options) => {
      calls.push({ method: "POST", url, payload, options });
      return { data: { ResponseCode: "0", MerchantRequestID: "merchant-test-1", CheckoutRequestID: "checkout-test-1", ResponseDescription: "Success" } };
    },
  };
  const response = await runWithTenant(tenant, () => initiateStkPush({
    phone: "0712345678",
    amount: 1250,
    bookingId: "booking-test-1",
    config: { ...config, consumerKey: "unique-stk-key", consumerSecret: "unique-stk-secret" },
    client,
    companyName: "Hussein Mboya Tours",
  }));
  const request = calls.find((call) => call.method === "POST");
  assert.match(request.url, /sandbox/);
  assert.equal(request.payload.BusinessShortCode, "174379");
  assert.equal(request.payload.TransactionType, "CustomerPayBillOnline");
  assert.equal(request.payload.Amount, 1250);
  assert.equal(request.payload.PartyA, "254712345678");
  assert.equal(request.payload.PartyB, "174379");
  assert.equal(request.payload.PhoneNumber, "254712345678");
  assert.equal(request.payload.CallBackURL, config.callbackUrl);
  assert.equal(request.payload.AccountReference, "BOOKING-booking-test-1");
  assert.equal(request.options.headers.Authorization, "Bearer stk-sandbox-token");
  assert.equal(response.CheckoutRequestID, "checkout-test-1");
});

test("STK Push rejects invalid amount, invalid phone, and incomplete provider responses", async () => {
  await assert.rejects(() => runWithTenant(tenant, () => initiateStkPush({
    phone: "0712345678", amount: 0, bookingId: "booking-1", config, client: {},
  })), { code: "INVALID_MPESA_AMOUNT" });

  await assert.rejects(() => runWithTenant(tenant, () => initiateStkPush({
    phone: "070000000", amount: 100, bookingId: "booking-2", config, client: {},
  })), { code: "INVALID_MPESA_PHONE" });

  const client = {
    get: async () => ({ data: { access_token: "invalid-response-token", expires_in: 3600 } }),
    post: async () => ({ data: { ResponseCode: "0", CheckoutRequestID: "missing-merchant-id" } }),
  };
  await assert.rejects(() => runWithTenant(tenant, () => initiateStkPush({
    phone: "0712345678", amount: 100, bookingId: "booking-3",
    config: { ...config, consumerKey: "unique-invalid-key", consumerSecret: "unique-invalid-secret" }, client,
  })), { code: "MPESA_REQUEST_UNCERTAIN" });
});

test("STK provider rejection is surfaced as a safe provider error without leaking provider details", async () => {
  const client = {
    get: async () => ({ data: { access_token: "rejection-token", expires_in: 3600 } }),
    post: async () => { throw Object.assign(new Error("private provider detail"), { response: { status: 400, data: { errorMessage: "private provider detail" } } }); },
  };
  await assert.rejects(
    () => runWithTenant(tenant, () => initiateStkPush({
      phone: "0712345678", amount: 100, bookingId: "booking-4",
      config: { ...config, consumerKey: "unique-reject-key", consumerSecret: "unique-reject-secret" }, client,
    })),
    (error) => error.code === "MPESA_PROVIDER_REJECTED"
      && error.status === 400
      && !error.message.includes("private provider detail"),
  );
});
