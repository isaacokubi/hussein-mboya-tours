/**
 * Purpose: tenant Payment Configuration Contract.test automated test. Main declarations: read.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import assert from "node:assert/strict";
// Load node:fs/promises so this module can use its exported dependencies.
import { readFile } from "node:fs/promises";
// Load node:test so this module can use its exported dependencies.
import test from "node:test";

// Declare read for use by the surrounding module or function.
const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

// Perform the side effect or state update expressed on the following line.
test("payment center exposes tenant payment methods and PayPal order configuration", async () => {
  // Declare page for use by the surrounding module or function.
  const page = await read("../../client/src/pages/admin/MpesaConfiguration.jsx");
  // Declare center for use by the surrounding module or function.
  const center = await read("../../client/src/components/admin/PaymentGatewayCenter.jsx");
  // Repeat the enclosed work for each required iteration.
  for (const text of ["M-Pesa", "Bank transfer", "Card payments", "Cash", "PayPal"]) assert.ok(page.includes(text), `missing payment center content: ${text}`);
  // Repeat the enclosed work for each required iteration.
  for (const text of ["clientSecret", "webhookId", "PAYPAL", "Validate configuration"]) assert.ok(center.includes(text), `missing PayPal center content: ${text}`);
  // Perform the side effect or state update expressed on the following line.
  assert.match(page, /<PaymentGatewayCenter mpesaOnly\s*\/>/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(page, /providerOnly="PAYPAL"/);
});

// Perform the side effect or state update expressed on the following line.
test("checkout only offers tenant methods made available by public settings and keeps manual methods pending", async () => {
  // Declare checkout for use by the surrounding module or function.
  const checkout = await read("../../client/src/pages/Checkout.jsx");
  // Perform the side effect or state update expressed on the following line.
  assert.match(checkout, /settings\?\.enableBankTransfer === true/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(checkout, /settings\?\.enableCash === true/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(checkout, /method === "BANK_TRANSFER"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(checkout, /method === "CASH"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(checkout, /Cash payment is pending staff confirmation/);
});

// Perform the side effect or state update expressed on the following line.
test("server checks tenant method availability before booking/payment initiation and only advertises validated PayPal", async () => {
  // Declare bookings for use by the surrounding module or function.
  const bookings = await read("../controllers/customerBookingController.js");
  // Declare stripe for use by the surrounding module or function.
  const stripe = await read("../controllers/stripeController.js");
  // Declare cash for use by the surrounding module or function.
  const cash = await read("../controllers/cashPaymentController.js");
  // Declare settings for use by the surrounding module or function.
  const settings = await read("../controllers/settingsController.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(bookings, /isTenantPaymentMethodAvailable\(tenantSettings, normalizedPaymentMethod\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(stripe, /isTenantPaymentMethodAvailable\(tenantSettings, "CARD"\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(stripe, /isTenantPaymentMethodAvailable\(tenantSettings, "BANK_TRANSFER"\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(cash, /isMethodAvailable = isTenantPaymentMethodAvailable/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(cash, /isMethodAvailable\(settings, "CASH"\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(settings, /enablePaypal: paypalAvailable, paypalAvailable/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(settings, /enableMpesa: Boolean\(tenantSettings\?\.enableMpesa !== false && mpesaReady\)/, "configured tenant gateway and tenant payment setting must be the checkout availability source; stale legacy Organization feature flags must not hide a configured method");
  // Perform the side effect or state update expressed on the following line.
  assert.doesNotMatch(settings, /enableMpesa: Boolean\([^\n]*tenant\.features\?\./);
  // Perform the side effect or state update expressed on the following line.
  assert.match(settings, /paypalEnvironment\.validatedAt/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(settings, /sandboxLifecycleVerifiedAt/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(settings, /isPaypalCurrencySupported/);
});

// Perform the side effect or state update expressed on the following line.
test("manual cash and bank receipt completion is tenant-scoped and records authorized staff metadata", async () => {
  // Declare controller for use by the surrounding module or function.
  const controller = await read("../controllers/adminPaymentController.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /Payment\.findOne\(mergeTenantFilter\(req, \{ _id: req\.params\.id \}\)\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /confirmedBy: req\.user\?\._id/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /This manual payment has already been confirmed/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /cashReceiptRequired/);
});

// Perform the side effect or state update expressed on the following line.
test("M-Pesa and Stripe validation endpoints are authenticated, rate limited and do not create payment requests", async () => {
  // Declare routes for use by the surrounding module or function.
  const routes = await read("../routes/paymentGatewayRoutes.js");
  // Declare controller for use by the surrounding module or function.
  const controller = await read("../controllers/paymentGatewayController.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(routes, /router\.use\(resolveTenant, protect, authorize\("settings\.manage"\)\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(routes, /MPESA\/validate.*rateLimit/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(routes, /STRIPE\/validate.*rateLimit/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(routes, /PAYPAL\/validate.*rateLimit/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller.match(/export const validateMpesaGateway[\s\S]*?export const validateStripeGateway/)?.[0] || "", /axios\.get\(getMpesaUrls\(environment\)\.auth/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller.match(/export const validateStripeGateway[\s\S]*$/)?.[0] || "", /v1\/account/);
  // Perform the side effect or state update expressed on the following line.
  assert.doesNotMatch(controller.match(/export const validateStripeGateway[\s\S]*$/)?.[0] || "", /paymentIntents|checkout\/sessions|initiateMpesa/);
});

// Perform the side effect or state update expressed on the following line.
test("payment initiation endpoints apply per-IP request limits", async () => {
  // Declare mpesaRoutes for use by the surrounding module or function.
  const mpesaRoutes = await read("../routes/mpesaRoutes.js");
  // Declare stripeRoutes for use by the surrounding module or function.
  const stripeRoutes = await read("../routes/stripeRoutes.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(mpesaRoutes, /\/stkpush", protect, paymentInitiationLimit/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(stripeRoutes, /\/checkout",paymentInitiationLimit/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(stripeRoutes, /\/bank-transfer",paymentInitiationLimit/);
});


// Perform the side effect or state update expressed on the following line.
test("tour booking creation permits PayPal when tenant configuration marks it available", async () => {
  // Declare bookings for use by the surrounding module or function.
  const bookings = await read("../controllers/customerBookingController.js");
  // Perform the side effect or state update expressed on the following line.
  assert.doesNotMatch(bookings, /normalizedPaymentMethod === "PAYPAL"[\s\S]{0,160}PayPal checkout is not available yet/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(bookings, /isTenantPaymentMethodAvailable\(tenantSettings, normalizedPaymentMethod\)/);
  // Declare checkout for use by the surrounding module or function.
  const checkout = await read("../../client/src/pages/Checkout.jsx");
  // Perform the side effect or state update expressed on the following line.
  assert.match(checkout, /method === "PAYPAL"\) return \{ method, bookingId, response: await createPaypalOrder/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(checkout, /queryKey: \["public-system-settings", window.location.host\]/);
});

// Perform the side effect or state update expressed on the following line.
test("single-day tour checkout ignores stale endDate and uses durationDays as canonical range", async () => {
  // Declare dateRange for use by the surrounding module or function.
  const dateRange = await read("../../client/src/lib/dateRange.js");
  // Declare middleware for use by the surrounding module or function.
  const middleware = await read("../middleware/validateBookingTravelDate.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(dateRange, /getDurationDays\(tour\.durationDays, tour\.durationDetails\?\.days, tour\.duration\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(dateRange, /durationDays > 1 && storedEnd >= min/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(middleware, /end = new Date\(start\);[\s\S]{0,120}end\.setDate\(end\.getDate\(\) \+ days - 1\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(middleware, /Duration is authoritative/);
});
