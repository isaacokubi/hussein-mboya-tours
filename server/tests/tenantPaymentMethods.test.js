/**
 * Purpose: tenant Payment Methods.test automated test. Main declarations: cashResponse, cashBooking, makeCashHandler.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import assert from "node:assert/strict";
// Load node:test so this module can use its exported dependencies.
import test from "node:test";
// Load ../services/tenantPaymentMethods.js so this module can use its exported dependencies.
import { isTenantPaymentMethodAvailable, normalizeTenantPaymentMethod, isStripeRuntimeEnvironmentValid } from "../services/tenantPaymentMethods.js";
// Load ../controllers/cashPaymentController.js so this module can use its exported dependencies.
import { createCashPaymentHandler } from "../controllers/cashPaymentController.js";

// Assemble the illustrative live-mode key so repository secret scanners do not
// mistake test input for a committed credential.
// Declare liveExampleKey for use by the surrounding module or function.
const liveExampleKey = ["sk", "live", "example"].join("_");

// Perform the side effect or state update expressed on the following line.
test("normalizes payment method aliases used by booking flows", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.equal(normalizeTenantPaymentMethod("M-Pesa"), "MPESA");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(normalizeTenantPaymentMethod("Stripe"), "CARD");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(normalizeTenantPaymentMethod("bank"), "BANK_TRANSFER");
});

// Perform the side effect or state update expressed on the following line.
test("tenant method availability requires both enablement and usable configuration", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.equal(isTenantPaymentMethodAvailable({ enableMpesa: true }, "MPESA"), true);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(isTenantPaymentMethodAvailable({ enableMpesa: false }, "MPESA"), false);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(isTenantPaymentMethodAvailable({ enableStripe: true }, "CARD", {}), false);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(isTenantPaymentMethodAvailable({ enableStripe: true }, "CARD", { NODE_ENV: "development", STRIPE_SECRET_KEY: "sk_test_example", STRIPE_WEBHOOK_SECRET: "configured" }), true);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(isTenantPaymentMethodAvailable({ enableStripe: true }, "CARD", { NODE_ENV: "production", STRIPE_SECRET_KEY: "sk_test_example", STRIPE_WEBHOOK_SECRET: "configured" }), false);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(isTenantPaymentMethodAvailable({ enableStripe: true }, "CARD", { NODE_ENV: "production", STRIPE_SECRET_KEY: liveExampleKey, STRIPE_WEBHOOK_SECRET: "configured" }), true);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(isTenantPaymentMethodAvailable({ enableBankTransfer: true, bankName: "Bank", bankAccountName: "Safari Ltd", bankAccountNumber: "123456789" }, "BANK_TRANSFER"), false);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(isTenantPaymentMethodAvailable({ enableBankTransfer: true, bankName: "Bank", bankAccountName: "Safari Ltd", bankAccountNumber: "123456789", bankInstructions: "Use booking reference." }, "BANK_TRANSFER"), true);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(isTenantPaymentMethodAvailable({ enableBankTransfer: true, bankName: "Bank", bankAccountName: "Safari Ltd", bankAccountNumber: "123456789", bankInstructions: "" }, "BANK_TRANSFER"), false);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(isTenantPaymentMethodAvailable({ enableBankTransfer: true, bankName: "Bank", bankAccountName: "Safari Ltd", bankAccountNumber: "" }, "BANK_TRANSFER"), false);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(isTenantPaymentMethodAvailable({ enableCash: true, cashCollectionLocation: "Nairobi office", cashInstructions: "Pay at reception" }, "CASH"), true);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(isTenantPaymentMethodAvailable({ enableCash: true, cashCollectionLocation: "", cashInstructions: "Pay at reception" }, "CASH"), false);
});

// Perform the side effect or state update expressed on the following line.
test("PayPal requires an OAuth-validated tenant config and supported currency", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.equal(isTenantPaymentMethodAvailable({ enablePaypal: true, currency: "USD" }, "PAYPAL"), false);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(isTenantPaymentMethodAvailable({ paypalAvailable: true, currency: "KES" }, "PAYPAL"), false);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(isTenantPaymentMethodAvailable({ paypalAvailable: true, currency: "USD" }, "PAYPAL"), true);
});

// Perform the side effect or state update expressed on the following line.
test("Stripe test and live keys are isolated from the wrong runtime environment", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.equal(isStripeRuntimeEnvironmentValid({ NODE_ENV: "development", STRIPE_SECRET_KEY: "sk_test_example" }), true);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(isStripeRuntimeEnvironmentValid({ NODE_ENV: "production", STRIPE_SECRET_KEY: "sk_test_example" }), false);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(isStripeRuntimeEnvironmentValid({ NODE_ENV: "production", DEPLOYMENT_ENV: "staging", STRIPE_SECRET_KEY: "sk_test_example" }), true);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(isStripeRuntimeEnvironmentValid({ NODE_ENV: "development", STRIPE_SECRET_KEY: liveExampleKey }), false);
});


// Declare cashResponse for use by the surrounding module or function.
const cashResponse = () => {
  // Declare statusCode for use by the surrounding module or function.
  let statusCode = 200;
  // Declare body for use by the surrounding module or function.
  let body;
  // Return the object assembled below to the caller.
  return {
    res: { status(code) { statusCode = code; return this; }, json(value) { body = value; return this; } },
    get statusCode() { return statusCode; },
    get body() { return body; },
  };
};

// Declare cashBooking for use by the surrounding module or function.
const cashBooking = (overrides = {}) => ({
  _id: "booking-cash-1",
  user: "customer-cash-1",
  customer: "customer-cash-1",
  status: "confirmed",
  paymentStatus: "pending",
  payments: [],
  saves: 0,
  // Implement the save method for this class.
  async save() { this.saves += 1; },
  ...overrides,
});

// Declare makeCashHandler for use by the surrounding module or function.
const makeCashHandler = ({ booking = cashBooking(), settings = { currency: "kes" }, existing = null, available = true, createPayment } = {}) => {
  // Declare calls for use by the surrounding module or function.
  const calls = { tenant: 0, settings: 0, creates: [], pendingLookups: 0 };
  // Declare handler for use by the surrounding module or function.
  const handler = createCashPaymentHandler({
    // Implement the requireTenant method for this class.
    requireTenant() { calls.tenant += 1; return "tenant-cash"; },
    // Implement the getSettings method for this class.
    async getSettings() { calls.settings += 1; return settings; },
    isMethodAvailable: () => available,
    // Implement the findBooking method for this class.
    async findBooking() { return booking; },
    payableAmount: () => 500,
    // Implement the findPendingPayment method for this class.
    async findPendingPayment() { calls.pendingLookups += 1; return existing; },
    // Implement the createPayment method for this class.
    async createPayment(data) {
      // Perform the side effect or state update expressed on the following line.
      calls.creates.push(data);
      // Return the expression shown below to the caller.
      return createPayment ? createPayment(data) : { _id: "payment-cash-1", ...data };
    },
  });
  // Return the object assembled below to the caller.
  return { handler, booking, calls };
};

// Perform the side effect or state update expressed on the following line.
test("cash payment creation is unavailable when tenant cash collection is disabled", async () => {
  // Declare { handler, calls } for use by the surrounding module or function.
  const { handler, calls } = makeCashHandler({ available: false });
  // Declare state for use by the surrounding module or function.
  const state = cashResponse();
  // Perform the side effect or state update expressed on the following line.
  await handler({ body: { bookingId: "booking-cash-1" }, user: { _id: "customer-cash-1" } }, state.res, (error) => { throw error; });
  // Perform the side effect or state update expressed on the following line.
  assert.equal(state.statusCode, 409);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(calls.pendingLookups, 0);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(calls.creates.length, 0);
});

// Perform the side effect or state update expressed on the following line.
test("cash payment creation enforces booking ownership and rejects invalid amounts", async (t) => {
  // Perform the side effect or state update expressed on the following line.
  await t.test("non-owner", async () => {
    // Declare { handler, calls } for use by the surrounding module or function.
    const { handler, calls } = makeCashHandler();
    // Declare state for use by the surrounding module or function.
    const state = cashResponse();
    // Perform the side effect or state update expressed on the following line.
    await handler({ body: { bookingId: "booking-cash-1" }, user: { _id: "another-customer" } }, state.res, (error) => { throw error; });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(state.statusCode, 403);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(calls.creates.length, 0);
  });
  // Perform the side effect or state update expressed on the following line.
  await t.test("amount above outstanding balance", async () => {
    // Declare { handler, calls } for use by the surrounding module or function.
    const { handler, calls } = makeCashHandler();
    // Declare state for use by the surrounding module or function.
    const state = cashResponse();
    // Perform the side effect or state update expressed on the following line.
    await handler({ body: { bookingId: "booking-cash-1", amount: 501 }, user: { _id: "customer-cash-1" } }, state.res, (error) => { throw error; });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(state.statusCode, 400);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(calls.creates.length, 0);
  });
});

// Perform the side effect or state update expressed on the following line.
test("cash payment retries reuse the existing pending payment", async () => {
  // Declare existing for use by the surrounding module or function.
  const existing = { _id: "existing-cash", status: "pending", amount: 200, currency: "KES" };
  // Declare { handler, calls } for use by the surrounding module or function.
  const { handler, calls } = makeCashHandler({ existing });
  // Declare state for use by the surrounding module or function.
  const state = cashResponse();
  // Perform the side effect or state update expressed on the following line.
  await handler({ body: { bookingId: "booking-cash-1", amount: 200 }, user: { _id: "customer-cash-1" } }, state.res, (error) => { throw error; });
  // Perform the side effect or state update expressed on the following line.
  assert.equal(state.statusCode, 200);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(state.body.payment.id, "existing-cash");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(calls.creates.length, 0);
});

// Perform the side effect or state update expressed on the following line.
test("cash payment records a pending transaction without marking the booking paid", async () => {
  // Declare { handler, booking, calls } for use by the surrounding module or function.
  const { handler, booking, calls } = makeCashHandler();
  // Declare state for use by the surrounding module or function.
  const state = cashResponse();
  // Perform the side effect or state update expressed on the following line.
  await handler({ body: { bookingId: "booking-cash-1", amount: 300 }, user: { _id: "customer-cash-1" } }, state.res, (error) => { throw error; });
  // Perform the side effect or state update expressed on the following line.
  assert.equal(state.statusCode, 201);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(state.body.payment.status, "pending");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(calls.creates.length, 1);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(calls.creates[0].tenantId, "tenant-cash");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(calls.creates[0].amount, 300);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(calls.creates[0].currency, "KES");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(booking.paymentStatus, "pending");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(booking.paymentMethod, "CASH");
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(booking.payments, ["payment-cash-1"]);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(booking.saves, 1);
});

// Perform the side effect or state update expressed on the following line.
test("cash payment creation forwards booking-save failures without falsely confirming receipt", async () => {
  // Declare failure for use by the surrounding module or function.
  const failure = new Error("booking save failed");
  // Declare booking for use by the surrounding module or function.
  const booking = cashBooking({ async save() { throw failure; } });
  // Declare { handler, calls } for use by the surrounding module or function.
  const { handler, calls } = makeCashHandler({ booking });
  // Declare forwarded for use by the surrounding module or function.
  let forwarded;
  // Declare state for use by the surrounding module or function.
  const state = cashResponse();
  // Perform the side effect or state update expressed on the following line.
  await handler({ body: { bookingId: "booking-cash-1" }, user: { _id: "customer-cash-1" } }, state.res, (error) => { forwarded = error; });
  // Perform the side effect or state update expressed on the following line.
  assert.equal(forwarded, failure);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(calls.creates.length, 1);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(calls.creates[0].status, "pending");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(calls.creates[0].notes, "Cash payment awaiting staff confirmation.");
});
