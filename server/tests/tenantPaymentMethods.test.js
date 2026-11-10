import assert from "node:assert/strict";
import test from "node:test";
import { isTenantPaymentMethodAvailable, normalizeTenantPaymentMethod, isStripeRuntimeEnvironmentValid } from "../services/tenantPaymentMethods.js";
import { createCashPaymentHandler } from "../controllers/cashPaymentController.js";

// Assemble the illustrative live-mode key so repository secret scanners do not
// mistake test input for a committed credential.
const liveExampleKey = ["sk", "live", "example"].join("_");

test("normalizes payment method aliases used by booking flows", () => {
  assert.equal(normalizeTenantPaymentMethod("M-Pesa"), "MPESA");
  assert.equal(normalizeTenantPaymentMethod("Stripe"), "CARD");
  assert.equal(normalizeTenantPaymentMethod("bank"), "BANK_TRANSFER");
});

test("tenant method availability requires both enablement and usable configuration", () => {
  assert.equal(isTenantPaymentMethodAvailable({ enableMpesa: true }, "MPESA"), true);
  assert.equal(isTenantPaymentMethodAvailable({ enableMpesa: false }, "MPESA"), false);
  assert.equal(isTenantPaymentMethodAvailable({ enableStripe: true }, "CARD", {}), false);
  assert.equal(isTenantPaymentMethodAvailable({ enableStripe: true }, "CARD", { NODE_ENV: "development", STRIPE_SECRET_KEY: "sk_test_example", STRIPE_WEBHOOK_SECRET: "configured" }), true);
  assert.equal(isTenantPaymentMethodAvailable({ enableStripe: true }, "CARD", { NODE_ENV: "production", STRIPE_SECRET_KEY: "sk_test_example", STRIPE_WEBHOOK_SECRET: "configured" }), false);
  assert.equal(isTenantPaymentMethodAvailable({ enableStripe: true }, "CARD", { NODE_ENV: "production", STRIPE_SECRET_KEY: liveExampleKey, STRIPE_WEBHOOK_SECRET: "configured" }), true);
  assert.equal(isTenantPaymentMethodAvailable({ enableBankTransfer: true, bankName: "Bank", bankAccountName: "Safari Ltd", bankAccountNumber: "123456789" }, "BANK_TRANSFER"), false);
  assert.equal(isTenantPaymentMethodAvailable({ enableBankTransfer: true, bankName: "Bank", bankAccountName: "Safari Ltd", bankAccountNumber: "123456789", bankInstructions: "Use booking reference." }, "BANK_TRANSFER"), true);
  assert.equal(isTenantPaymentMethodAvailable({ enableBankTransfer: true, bankName: "Bank", bankAccountName: "Safari Ltd", bankAccountNumber: "123456789", bankInstructions: "" }, "BANK_TRANSFER"), false);
  assert.equal(isTenantPaymentMethodAvailable({ enableBankTransfer: true, bankName: "Bank", bankAccountName: "Safari Ltd", bankAccountNumber: "" }, "BANK_TRANSFER"), false);
  assert.equal(isTenantPaymentMethodAvailable({ enableCash: true, cashCollectionLocation: "Nairobi office", cashInstructions: "Pay at reception" }, "CASH"), true);
  assert.equal(isTenantPaymentMethodAvailable({ enableCash: true, cashCollectionLocation: "", cashInstructions: "Pay at reception" }, "CASH"), false);
});

test("PayPal requires an OAuth-validated tenant config and supported currency", () => {
  assert.equal(isTenantPaymentMethodAvailable({ enablePaypal: true, currency: "USD" }, "PAYPAL"), false);
  assert.equal(isTenantPaymentMethodAvailable({ paypalAvailable: true, currency: "KES" }, "PAYPAL"), false);
  assert.equal(isTenantPaymentMethodAvailable({ paypalAvailable: true, currency: "USD" }, "PAYPAL"), true);
});

test("Stripe test and live keys are isolated from the wrong runtime environment", () => {
  assert.equal(isStripeRuntimeEnvironmentValid({ NODE_ENV: "development", STRIPE_SECRET_KEY: "sk_test_example" }), true);
  assert.equal(isStripeRuntimeEnvironmentValid({ NODE_ENV: "production", STRIPE_SECRET_KEY: "sk_test_example" }), false);
  assert.equal(isStripeRuntimeEnvironmentValid({ NODE_ENV: "production", DEPLOYMENT_ENV: "staging", STRIPE_SECRET_KEY: "sk_test_example" }), true);
  assert.equal(isStripeRuntimeEnvironmentValid({ NODE_ENV: "development", STRIPE_SECRET_KEY: liveExampleKey }), false);
});


const cashResponse = () => {
  let statusCode = 200;
  let body;
  return {
    res: { status(code) { statusCode = code; return this; }, json(value) { body = value; return this; } },
    get statusCode() { return statusCode; },
    get body() { return body; },
  };
};

const cashBooking = (overrides = {}) => ({
  _id: "booking-cash-1",
  user: "customer-cash-1",
  customer: "customer-cash-1",
  status: "confirmed",
  paymentStatus: "pending",
  payments: [],
  saves: 0,
  async save() { this.saves += 1; },
  ...overrides,
});

const makeCashHandler = ({ booking = cashBooking(), settings = { currency: "kes" }, existing = null, available = true, createPayment } = {}) => {
  const calls = { tenant: 0, settings: 0, creates: [], pendingLookups: 0 };
  const handler = createCashPaymentHandler({
    requireTenant() { calls.tenant += 1; return "tenant-cash"; },
    async getSettings() { calls.settings += 1; return settings; },
    isMethodAvailable: () => available,
    async findBooking() { return booking; },
    payableAmount: () => 500,
    async findPendingPayment() { calls.pendingLookups += 1; return existing; },
    async createPayment(data) {
      calls.creates.push(data);
      return createPayment ? createPayment(data) : { _id: "payment-cash-1", ...data };
    },
  });
  return { handler, booking, calls };
};

test("cash payment creation is unavailable when tenant cash collection is disabled", async () => {
  const { handler, calls } = makeCashHandler({ available: false });
  const state = cashResponse();
  await handler({ body: { bookingId: "booking-cash-1" }, user: { _id: "customer-cash-1" } }, state.res, (error) => { throw error; });
  assert.equal(state.statusCode, 409);
  assert.equal(calls.pendingLookups, 0);
  assert.equal(calls.creates.length, 0);
});

test("cash payment creation enforces booking ownership and rejects invalid amounts", async (t) => {
  await t.test("non-owner", async () => {
    const { handler, calls } = makeCashHandler();
    const state = cashResponse();
    await handler({ body: { bookingId: "booking-cash-1" }, user: { _id: "another-customer" } }, state.res, (error) => { throw error; });
    assert.equal(state.statusCode, 403);
    assert.equal(calls.creates.length, 0);
  });
  await t.test("amount above outstanding balance", async () => {
    const { handler, calls } = makeCashHandler();
    const state = cashResponse();
    await handler({ body: { bookingId: "booking-cash-1", amount: 501 }, user: { _id: "customer-cash-1" } }, state.res, (error) => { throw error; });
    assert.equal(state.statusCode, 400);
    assert.equal(calls.creates.length, 0);
  });
});

test("cash payment retries reuse the existing pending payment", async () => {
  const existing = { _id: "existing-cash", status: "pending", amount: 200, currency: "KES" };
  const { handler, calls } = makeCashHandler({ existing });
  const state = cashResponse();
  await handler({ body: { bookingId: "booking-cash-1", amount: 200 }, user: { _id: "customer-cash-1" } }, state.res, (error) => { throw error; });
  assert.equal(state.statusCode, 200);
  assert.equal(state.body.payment.id, "existing-cash");
  assert.equal(calls.creates.length, 0);
});

test("cash payment records a pending transaction without marking the booking paid", async () => {
  const { handler, booking, calls } = makeCashHandler();
  const state = cashResponse();
  await handler({ body: { bookingId: "booking-cash-1", amount: 300 }, user: { _id: "customer-cash-1" } }, state.res, (error) => { throw error; });
  assert.equal(state.statusCode, 201);
  assert.equal(state.body.payment.status, "pending");
  assert.equal(calls.creates.length, 1);
  assert.equal(calls.creates[0].tenantId, "tenant-cash");
  assert.equal(calls.creates[0].amount, 300);
  assert.equal(calls.creates[0].currency, "KES");
  assert.equal(booking.paymentStatus, "pending");
  assert.equal(booking.paymentMethod, "CASH");
  assert.deepEqual(booking.payments, ["payment-cash-1"]);
  assert.equal(booking.saves, 1);
});

test("cash payment creation forwards booking-save failures without falsely confirming receipt", async () => {
  const failure = new Error("booking save failed");
  const booking = cashBooking({ async save() { throw failure; } });
  const { handler, calls } = makeCashHandler({ booking });
  let forwarded;
  const state = cashResponse();
  await handler({ body: { bookingId: "booking-cash-1" }, user: { _id: "customer-cash-1" } }, state.res, (error) => { forwarded = error; });
  assert.equal(forwarded, failure);
  assert.equal(calls.creates.length, 1);
  assert.equal(calls.creates[0].status, "pending");
  assert.equal(calls.creates[0].notes, "Cash payment awaiting staff confirmation.");
});
