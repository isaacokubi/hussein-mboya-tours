# Source explanation: server/controllers/paypalController.js

**Source:** [server/controllers/paypalController.js](../../../server/controllers/paypalController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `crypto` from `node:crypto`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Organization` from `../models/Organization.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Organization.js](../../../server/models/Organization.js)
- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `PaymentGatewayConfig` from `../models/PaymentGatewayConfig.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/PaymentGatewayConfig.js](../../../server/models/PaymentGatewayConfig.js)
- `PaypalWebhookEvent` from `../models/PaypalWebhookEvent.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/PaypalWebhookEvent.js](../../../server/models/PaypalWebhookEvent.js)
- `getPaypalEnvironmentSettings`, `normalizePaypalEnvironment`, `paypalApiRequest`, `verifyPaypalWebhook` from `../services/paypalService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/paypalService.js](../../../server/services/paypalService.js)
- `completeBookingPayment`, `getPayableBookingAmount`, `userOwnsBooking` from `../services/paymentLifecycleService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/paymentLifecycleService.js](../../../server/services/paymentLifecycleService.js)
- `getSystemSettings` from `../services/settingsService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/settingsService.js](../../../server/services/settingsService.js)
- `mergeTenantFilter`, `requireTenantId`, `runWithTenant` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `amountValue` — lines 14–14

Parameters: `amount`, `currency`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `currentTenantId` — lines 15–15

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `loadActiveConfig` — lines 17–32

Parameters: `tenantId`, `arg2 (defaulted)`.
Persistent operations detected: PaymentGatewayConfig.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 18:** `const config = await PaymentGatewayConfig.findOne({ tenantId, provider: "PAYPAL" }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 19:** `const environment = normalizePaypalEnvironment(requestedEnvironment || config?.environment);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `const selected = getPaypalEnvironmentSettings(config || {}, environment);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `if (!config || !environment || requireEnabled && !config.enabled || !selected.configured || !selected.validatedAt) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 22:** `const error = new Error("PayPal is not configured and validated for this tenant environment.");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `throw error;` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 26:** `if (environment === "production" && !config.sandboxLifecycleVerifiedAt) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 27:** `const error = new Error("PayPal Production is unavailable until a complete Sandbox payment lifecycle has been verified.");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 29:** `throw error;` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 31:** `return { config, provider: { ...selected, environment } };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `trustedClientUrl` — lines 34–40

Parameters: none.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 35:** `const value = String(process.env.CLIENT_URL || "").trim().replace(/\/+$/, "");` — Reads runtime/build configuration; never expose secret values through logs or browser-bundled variables.
- **Line 36:** `const parsed = new URL(value);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 38:** `if (process.env.NODE_ENV === "production" && parsed.protocol !== "https:") throw new Error("Client URL must use HTTPS in production.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 39:** `return value;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getPayable` — lines 42–46

Parameters: `booking`, `settings`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 43:** `const amount = Number(getPayableBookingAmount(booking));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 44:** `const currency = String(booking.currency || settings?.currency || "").trim().toUpperCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 45:** `return { amount, currency };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `createPaypalOrder` — lines 48–103

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user. Persistent operations detected: Booking.findOne, Payment.findOne, Payment.create; verify tenant/ownership filters in the exact query. 10 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 14 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 49:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 50:** `const tenantId = currentTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 51:** `const settings = await getSystemSettings(req);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 52:** `if (settings.paypalAvailable !== true) return res.status(409).json({ success: false, message: "PayPal is disabled or not validated for this tenant." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 53:** `const bookingId = String(req.body?.bookingId || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 54:** `if (!bookingId || !req.user?._id) return res.status(400).json({ success: false, message: "A booking ID and authenticated customer are required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 55:** `const booking = await Booking.findOne(mergeTenantFilter({ _id: bookingId }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 56:** `if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 57:** `if (!userOwnsBooking(booking, req.user)) return res.status(403).json({ success: false, message: "You cannot pay this booking." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 58:** `if (booking.isDeleted || ["cancelled", "refunded"].includes(String(booking.status).toLowerCase()) || booking.paymentStatus === "paid") return res.status(409).json({ success: false, message: "This booking cannot receive a` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 59:** `const { amount, currency } = await getPayable(booking, settings);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 60:** `if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ success: false, message: "No amount is due for this booking." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 61:** `if (!PAYPAL_PAYMENT_CURRENCIES.has(currency)) return res.status(409).json({ success: false, message: \`PayPal does not support this tenant's configured payment currency (${currency || "unknown"}).\` });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 62:** `const existing = await Payment.findOne(mergeTenantFilter({ booking: booking._id, provider: "PAYPAL", status: { $in: ["pending", "processing"] } })).sort({ createdAt: -1 });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 63:** `if (existing?.providerOrderId && existing?.providerApprovalUrl) return res.status(200).json({ success: true, orderId: existing.providerOrderId, url: existing.providerApprovalUrl, status: existing.status, reused: true });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 64:** `if (existing) return res.status(409).json({ success: false, message: "A PayPal order is already being processed. Refresh payment status before retrying." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 66:** `const { provider } = await loadActiveConfig(tenantId);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 67:** `const payment = await Payment.create({ tenantId, customer: req.user._id, user: req.user._id, booking: booking._id, provider: "PAYPAL", method: "paypal", paymentMethod: "PAYPAL", amount, currency, providerEnvironment: pro` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `verifyOrderForPayment` — lines 105–112

Parameters: `provider`, `orderId`, `payment`, `providerSettings`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 106:** `const order = await paypalApiRequest(provider, \`/v2/checkout/orders/${encodeURIComponent(orderId)}\`, { method: "GET" });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 107:** `const unit = order?.purchase_units?.find((item) => String(item.custom_id || "") === String(payment._id));` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 108:** `const orderAmount = unit?.amount;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 109:** `if (!unit || String(order.id) !== String(payment.providerOrderId) || String(orderAmount?.currency_code || "").toUpperCase() !== String(payment.currency).toUpperCase() || Number(orderAmount?.value) !== Number(payment.amou` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 110:** `if (providerSettings.merchantId && String(unit?.payee?.merchant_id || "") !== String(providerSettings.merchantId)) throw new Error("PayPal order merchant does not match the configured merchant.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 111:** `return order;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `capturePaypalOrder` — lines 114–148

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user. Persistent operations detected: Payment.findOne, Booking.findOne; verify tenant/ownership filters in the exact query. 7 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 10 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 115:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 116:** `const tenantId = currentTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 117:** `const orderId = String(req.body?.orderId || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 118:** `if (!orderId || orderId.length > 80) return res.status(400).json({ success: false, message: "A valid PayPal order ID is required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 119:** `const payment = await Payment.findOne(mergeTenantFilter({ provider: "PAYPAL", providerOrderId: orderId }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 120:** `if (!payment) return res.status(404).json({ success: false, message: "PayPal order not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 121:** `if (payment.customer && String(payment.customer) !== String(req.user?._id)) return res.status(403).json({ success: false, message: "This PayPal order belongs to another customer." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 122:** `const booking = await Booking.findOne(mergeTenantFilter({ _id: payment.booking }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 123:** `if (!booking || !userOwnsBooking(booking, req.user)) return res.status(404).json({ success: false, message: "Booking not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 124:** `if (payment.status === "completed") return res.json({ success: true, paid: true, alreadyCompleted: true });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 125:** `const { config, provider } = await loadActiveConfig(tenantId, { requireEnabled: false, environment: payment.providerEnvironment || "sandbox" });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 126:** `await verifyOrderForPayment(provider, orderId, payment, provider);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 127:** `const captured = await paypalApiRequest(provider, \`/v2/checkout/orders/${encodeURIComponent(orderId)}/capture\`, { method: "POST", requestId: \`capture-${payment._id}\`, body: {} });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 128:** `const capture = captured?.purchase_units?.flatMap((unit) => unit?.payments?.captures || []).find((item) => item.status === "COMPLETED");` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 129:** `if (!capture && ["VOIDED", "DECLINED"].includes(String(captured?.status || "").toUpperCase())) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 132:** `if (payment.status === "failed") payment.failedAt = new Date();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 133:** `await payment.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 134:** `return res.status(409).json({ success: false, paid: false, status: payment.status, message: "PayPal did not complete the payment." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `paypalWebhook` — lines 150–217

Parameters: `req`, `res`.
Reads request/component inputs: req.params, req.body. Persistent operations detected: Organization.findById, PaymentGatewayConfig.findOne, PaypalWebhookEvent.create, PaypalWebhookEvent.findOne, Payment.findOne, Booking.findOne, PaymentGatewayConfig.updateOne; verify tenant/ownership filters in the exact query. 23 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 17 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 151:** `const tenantId = String(req.params?.tenantId || "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 152:** `const environment = normalizePaypalEnvironment(req.params?.environment);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 153:** `if (!/^[a-f\d]{24}$/i.test(tenantId) || !environment || !req.body?.id || !req.body?.event_type) return res.status(400).json({ success: false });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 154:** `let event;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 155:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 156:** `const tenant = await Organization.findById(tenantId).select("_id").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 157:** `const gateway = await PaymentGatewayConfig.findOne({ tenantId, provider: "PAYPAL" }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 158:** `const selected = getPaypalEnvironmentSettings(gateway || {}, environment);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 159:** `if (!tenant || !selected.configured) return res.status(404).json({ success: false });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 160:** `const verified = await verifyPaypalWebhook({ config: { ...selected, environment }, headers: req.headers, event: req.body });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 161:** `if (!verified) return res.status(400).json({ success: false, message: "Webhook signature was not verified." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 162:** `const eventId = String(req.body.id).slice(0, 160);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 163:** `const eventType = String(req.body.event_type).slice(0, 160);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 164:** `const leaseCutoff = new Date(Date.now() - 5 * 60 * 1000);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 166:** `if (!event) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 167:** `try { event = await PaypalWebhookEvent.create({ tenantId, eventId, eventType, status: "processing" }); }` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 168:** `catch (error) {` — Handles an exception from the preceding try block; check whether it returns, rethrows, logs safely, or continues.
- **Line 169:** `if (error?.code !== 11000) throw error;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 12: `const PAYPAL_PAYMENT_CURRENCIES = new Set(["AUD", "BRL", "CAD", "CNY", "CZK", "DKK", "EUR", "HKD", "HUF", "ILS", "JPY", "MYR", "MXN", "TWD", "NZD", "NOK", "PHP", "PLN", "GBP", "SGD`.
- Line 13: `const PAYPAL_ZERO_DECIMAL_CURRENCIES = new Set(["HUF", "JPY", "TWD"]);`.
- Line 14: `const amountValue = (amount, currency) => PAYPAL_ZERO_DECIMAL_CURRENCIES.has(currency) ? String(Math.round(Number(amount))) : Number(amount).toFixed(2);`.
- Line 15: `const currentTenantId = () => String(requireTenantId());`.
- Line 18: `const config = await PaymentGatewayConfig.findOne({ tenantId, provider: "PAYPAL" }).lean();`.
- Line 19: `const environment = normalizePaypalEnvironment(requestedEnvironment || config?.environment);`.
- Line 20: `const selected = getPaypalEnvironmentSettings(config || {}, environment);`.
- Line 22: `const error = new Error("PayPal is not configured and validated for this tenant environment.");`.
- Line 27: `const error = new Error("PayPal Production is unavailable until a complete Sandbox payment lifecycle has been verified.");`.
- Line 34: `const trustedClientUrl = () => {`.
- Line 35: `const value = String(process.env.CLIENT_URL || "").trim().replace(/\/+$/, "");`.
- Line 36: `const parsed = new URL(value);`.
- Line 42: `const getPayable = async (booking, settings) => {`.
- Line 43: `const amount = Number(getPayableBookingAmount(booking));`.
- Line 44: `const currency = String(booking.currency || settings?.currency || "").trim().toUpperCase();`.
- Line 48: `export const createPaypalOrder = async (req, res, next) => {`.
- Line 50: `const tenantId = currentTenantId();`.
- Line 51: `const settings = await getSystemSettings(req);`.
- Line 53: `const bookingId = String(req.body?.bookingId || "").trim();`.
- Line 55: `const booking = await Booking.findOne(mergeTenantFilter({ _id: bookingId }));`.
- Line 59: `const { amount, currency } = await getPayable(booking, settings);`.
- Line 62: `const existing = await Payment.findOne(mergeTenantFilter({ booking: booking._id, provider: "PAYPAL", status: { $in: ["pending", "processing"] } })).sort({ createdAt: -1 });`.
- Line 66: `const { provider } = await loadActiveConfig(tenantId);`.
- Line 67: `const payment = await Payment.create({ tenantId, customer: req.user._id, user: req.user._id, booking: booking._id, provider: "PAYPAL", method: "paypal", paymentMethod: "PAYPAL", am`.
- Line 69: `const origin = trustedClientUrl();`.
- Line 70: `const order = await paypalApiRequest(provider, "/v2/checkout/orders", {`.
- Line 78: `const approvalUrl = (order?.links || []).find((link) => link.rel === "approve")?.href;`.
- Line 106: `const order = await paypalApiRequest(provider, \`/v2/checkout/orders/${encodeURIComponent(orderId)}\`, { method: "GET" });`.
- Line 107: `const unit = order?.purchase_units?.find((item) => String(item.custom_id || "") === String(payment._id));`.
- Line 108: `const orderAmount = unit?.amount;`.
- Line 114: `export const capturePaypalOrder = async (req, res, next) => {`.
- Line 116: `const tenantId = currentTenantId();`.
- Line 117: `const orderId = String(req.body?.orderId || "").trim();`.
- Line 119: `const payment = await Payment.findOne(mergeTenantFilter({ provider: "PAYPAL", providerOrderId: orderId }));`.
- Line 122: `const booking = await Booking.findOne(mergeTenantFilter({ _id: payment.booking }));`.
- Line 125: `const { config, provider } = await loadActiveConfig(tenantId, { requireEnabled: false, environment: payment.providerEnvironment || "sandbox" });`.
- Line 127: `const captured = await paypalApiRequest(provider, \`/v2/checkout/orders/${encodeURIComponent(orderId)}/capture\`, { method: "POST", requestId: \`capture-${payment._id}\`, body: {} `.
- Line 128: `const capture = captured?.purchase_units?.flatMap((unit) => unit?.payments?.captures || []).find((item) => item.status === "COMPLETED");`.
- Line 137: `const captureAmount = capture?.amount;`.
- Line 142: `const completed = await completeBookingPayment({ payment, booking, paymentData: { amount: Number(payment.amount), paymentMethod: "PAYPAL", transactionId: payment.transactionId, pay`.
- Line 150: `export const paypalWebhook = async (req, res) => {`.
- Line 151: `const tenantId = String(req.params?.tenantId || "");`.
- Line 152: `const environment = normalizePaypalEnvironment(req.params?.environment);`.
- Line 154: `let event;`.
- Line 156: `const tenant = await Organization.findById(tenantId).select("_id").lean();`.
- Line 157: `const gateway = await PaymentGatewayConfig.findOne({ tenantId, provider: "PAYPAL" }).lean();`.
- Line 158: `const selected = getPaypalEnvironmentSettings(gateway || {}, environment);`.
- Line 160: `const verified = await verifyPaypalWebhook({ config: { ...selected, environment }, headers: req.headers, event: req.body });`.
- Line 162: `const eventId = String(req.body.id).slice(0, 160);`.
- Line 163: `const eventType = String(req.body.event_type).slice(0, 160);`.
- Line 164: `const leaseCutoff = new Date(Date.now() - 5 * 60 * 1000);`.
- Line 170: `const existing = await PaypalWebhookEvent.findOne({ tenantId, eventId }).lean();`.
- Line 176: `const supported = new Set(["PAYMENT.CAPTURE.COMPLETED", "CHECKOUT.ORDER.VOIDED"]);`.
- Line 178: `const resource = req.body.resource || {};`.
- Line 180: `const voidedOrderId = String(resource.id || "");`.
- Line 181: `const voidedPayment = await Payment.findOne({ tenantId, provider: "PAYPAL", providerOrderId: voidedOrderId });`.
- Line 191: `const orderId = String(resource?.supplementary_data?.related_ids?.order_id || "").trim();`.
- Line 193: `const payment = await Payment.findOne({ tenantId, provider: "PAYPAL", providerOrderId: orderId });`.
- Line 198: `const order = await paypalApiRequest({ ...selected, environment }, \`/v2/checkout/orders/${encodeURIComponent(orderId)}\`, { method: "GET" });`.
- Line 199: `const unit = order?.purchase_units?.find((item) => String(item.custom_id || "") === String(payment._id));`.
- Line 200: `const capture = unit?.payments?.captures?.find((item) => String(item.id) === String(resource.id) && item.status === "COMPLETED");`.
- Line 202: `const booking = await Booking.findOne({ tenantId, _id: payment.booking });`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
