import assert from "node:assert/strict";
import test from "node:test";
import { isTenantPaymentMethodAvailable, normalizeTenantPaymentMethod } from "../services/tenantPaymentMethods.js";

test("normalizes payment method aliases used by booking flows", () => {
  assert.equal(normalizeTenantPaymentMethod("M-Pesa"), "MPESA");
  assert.equal(normalizeTenantPaymentMethod("Stripe"), "CARD");
  assert.equal(normalizeTenantPaymentMethod("bank"), "BANK_TRANSFER");
});

test("tenant method availability requires both enablement and usable configuration", () => {
  assert.equal(isTenantPaymentMethodAvailable({ enableMpesa: true }, "MPESA"), true);
  assert.equal(isTenantPaymentMethodAvailable({ enableMpesa: false }, "MPESA"), false);
  assert.equal(isTenantPaymentMethodAvailable({ enableStripe: true }, "CARD", {}), false);
  assert.equal(isTenantPaymentMethodAvailable({ enableStripe: true }, "CARD", { STRIPE_SECRET_KEY: "configured" }), true);
  assert.equal(isTenantPaymentMethodAvailable({ enableBankTransfer: true, bankName: "Bank", bankAccountName: "Safari Ltd", bankAccountNumber: "123456789" }, "BANK_TRANSFER"), false);
  assert.equal(isTenantPaymentMethodAvailable({ enableBankTransfer: true, bankName: "Bank", bankAccountName: "Safari Ltd", bankAccountNumber: "123456789", bankInstructions: "Use booking reference." }, "BANK_TRANSFER"), true);
  assert.equal(isTenantPaymentMethodAvailable({ enableBankTransfer: true, bankName: "Bank", bankAccountName: "Safari Ltd", bankAccountNumber: "123456789", bankInstructions: "" }, "BANK_TRANSFER"), false);
  assert.equal(isTenantPaymentMethodAvailable({ enableBankTransfer: true, bankName: "Bank", bankAccountName: "Safari Ltd", bankAccountNumber: "" }, "BANK_TRANSFER"), false);
  assert.equal(isTenantPaymentMethodAvailable({ enableCash: true, cashCollectionLocation: "Nairobi office", cashInstructions: "Pay at reception" }, "CASH"), true);
  assert.equal(isTenantPaymentMethodAvailable({ enableCash: true, cashCollectionLocation: "", cashInstructions: "Pay at reception" }, "CASH"), false);
});

test("PayPal remains unavailable until a verified order, capture, and webhook lifecycle exists", () => {
  assert.equal(isTenantPaymentMethodAvailable({ enablePaypal: true }, "PAYPAL"), false);
});
