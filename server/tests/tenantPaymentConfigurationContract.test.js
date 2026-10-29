import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("payment center exposes tenant payment methods and PayPal order configuration", async () => {
  const page = await read("../../client/src/pages/admin/MpesaConfiguration.jsx");
  const center = await read("../../client/src/components/admin/PaymentGatewayCenter.jsx");
  for (const text of ["M-Pesa", "Bank transfer", "Card payments", "Cash", "PayPal"]) assert.ok(page.includes(text), `missing payment center content: ${text}`);
  for (const text of ["clientSecret", "webhookId", "PAYPAL", "Validate configuration"]) assert.ok(center.includes(text), `missing PayPal center content: ${text}`);
  assert.match(page, /<PaymentGatewayCenter mpesaOnly\s*\/>/);
  assert.match(page, /providerOnly="PAYPAL"/);
});

test("checkout only offers tenant methods made available by public settings and keeps manual methods pending", async () => {
  const checkout = await read("../../client/src/pages/Checkout.jsx");
  assert.match(checkout, /settings\?\.enableBankTransfer === true/);
  assert.match(checkout, /settings\?\.enableCash === true/);
  assert.match(checkout, /method === "BANK_TRANSFER"/);
  assert.match(checkout, /method === "CASH"/);
  assert.match(checkout, /Cash payment is pending staff confirmation/);
});

test("server checks tenant method availability before booking/payment initiation and only advertises validated PayPal", async () => {
  const bookings = await read("../controllers/customerBookingController.js");
  const stripe = await read("../controllers/stripeController.js");
  const cash = await read("../controllers/cashPaymentController.js");
  const settings = await read("../controllers/settingsController.js");
  assert.match(bookings, /isTenantPaymentMethodAvailable\(tenantSettings, normalizedPaymentMethod\)/);
  assert.match(stripe, /isTenantPaymentMethodAvailable\(tenantSettings, "CARD"\)/);
  assert.match(stripe, /isTenantPaymentMethodAvailable\(tenantSettings, "BANK_TRANSFER"\)/);
  assert.match(cash, /isTenantPaymentMethodAvailable\(settings, "CASH"\)/);
  assert.match(settings, /enablePaypal: paypalAvailable, paypalAvailable/);
  assert.match(settings, /enableMpesa: Boolean\(tenantSettings\?\.enableMpesa !== false && mpesaReady\)/, "configured tenant gateway and tenant payment setting must be the checkout availability source; stale legacy Organization feature flags must not hide a configured method");
  assert.doesNotMatch(settings, /enableMpesa: Boolean\([^\n]*tenant\.features\?\./);
  assert.match(settings, /paypalEnvironment\.validatedAt/);
  assert.match(settings, /sandboxLifecycleVerifiedAt/);
  assert.match(settings, /isPaypalCurrencySupported/);
});

test("manual cash and bank receipt completion is tenant-scoped and records authorized staff metadata", async () => {
  const controller = await read("../controllers/adminPaymentController.js");
  assert.match(controller, /Payment\.findOne\(mergeTenantFilter\(req, \{ _id: req\.params\.id \}\)\)/);
  assert.match(controller, /confirmedBy: req\.user\?\._id/);
  assert.match(controller, /This manual payment has already been confirmed/);
  assert.match(controller, /cashReceiptRequired/);
});

test("M-Pesa and Stripe validation endpoints are authenticated, rate limited and do not create payment requests", async () => {
  const routes = await read("../routes/paymentGatewayRoutes.js");
  const controller = await read("../controllers/paymentGatewayController.js");
  assert.match(routes, /router\.use\(resolveTenant, protect, authorize\("settings\.manage"\)\)/);
  assert.match(routes, /MPESA\/validate.*rateLimit/);
  assert.match(routes, /STRIPE\/validate.*rateLimit/);
  assert.match(routes, /PAYPAL\/validate.*rateLimit/);
  assert.match(controller.match(/export const validateMpesaGateway[\s\S]*?export const validateStripeGateway/)?.[0] || "", /axios\.get\(getMpesaUrls\(environment\)\.auth/);
  assert.match(controller.match(/export const validateStripeGateway[\s\S]*$/)?.[0] || "", /v1\/account/);
  assert.doesNotMatch(controller.match(/export const validateStripeGateway[\s\S]*$/)?.[0] || "", /paymentIntents|checkout\/sessions|initiateMpesa/);
});

test("payment initiation endpoints apply per-IP request limits", async () => {
  const mpesaRoutes = await read("../routes/mpesaRoutes.js");
  const stripeRoutes = await read("../routes/stripeRoutes.js");
  assert.match(mpesaRoutes, /\/stkpush", protect, paymentInitiationLimit/);
  assert.match(stripeRoutes, /\/checkout",paymentInitiationLimit/);
  assert.match(stripeRoutes, /\/bank-transfer",paymentInitiationLimit/);
});


test("tour booking creation permits PayPal when tenant configuration marks it available", async () => {
  const bookings = await read("../controllers/customerBookingController.js");
  assert.doesNotMatch(bookings, /normalizedPaymentMethod === "PAYPAL"[\s\S]{0,160}PayPal checkout is not available yet/);
  assert.match(bookings, /isTenantPaymentMethodAvailable\(tenantSettings, normalizedPaymentMethod\)/);
  const checkout = await read("../../client/src/pages/Checkout.jsx");
  assert.match(checkout, /method === "PAYPAL"\) return \{ method, bookingId, response: await createPaypalOrder/);
  assert.match(checkout, /queryKey: \["public-system-settings", window.location.host\]/);
});
