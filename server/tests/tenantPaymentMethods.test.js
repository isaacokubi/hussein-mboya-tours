import assert from "node:assert/strict";
import test from "node:test";
import { isTenantPaymentMethodAvailable, normalizeTenantPaymentMethod, isStripeRuntimeEnvironmentValid } from "../services/tenantPaymentMethods.js";

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
  assert.equal(isTenantPaymentMethodAvailable({ enableStripe: true }, "CARD", { NODE_ENV: "production", STRIPE_SECRET_KEY: "sk_live_example", STRIPE_WEBHOOK_SECRET: "configured" }), true);
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
  assert.equal(isStripeRuntimeEnvironmentValid({ NODE_ENV: "development", STRIPE_SECRET_KEY: "sk_live_example" }), false);
});
