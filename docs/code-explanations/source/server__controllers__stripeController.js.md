# Source explanation: server/controllers/stripeController.js

**Source:** [server/controllers/stripeController.js](../../../server/controllers/stripeController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `StripeWebhookEvent` from `../models/StripeWebhookEvent.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/StripeWebhookEvent.js](../../../server/models/StripeWebhookEvent.js)
- `runWithTenant` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `verifyStripeWebhookSignature` from `../services/stripeWebhookSecurity.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/stripeWebhookSecurity.js](../../../server/services/stripeWebhookSecurity.js)
- `completeBookingPayment`, `getPayableBookingAmount`, `normalizePaymentMethod`, `userOwnsBooking` from `../services/paymentLifecycleService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/paymentLifecycleService.js](../../../server/services/paymentLifecycleService.js)
- `getSystemSettings` from `../services/settingsService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/settingsService.js](../../../server/services/settingsService.js)
- `isTenantPaymentMethodAvailable`, `isStripeRuntimeEnvironmentValid` from `../services/tenantPaymentMethods.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/tenantPaymentMethods.js](../../../server/services/tenantPaymentMethods.js)

## Runtime declarations and data flow

### `stripeRequest` — lines 41–111

Parameters: `path`, `body (defaulted)`, `method (defaulted)`, `idempotencyKey (defaulted)`.
2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 48:** `const key =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 51:** `if (!key) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 52:** `throw new Error(` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 56:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 58:** `const options = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 68:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 83:** `const response =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 84:** `await fetch(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 89:** `const data =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 90:** `await response.json();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 92:** `if (!response.ok) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 94:** `const message =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 98:** `const error =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 107:** `throw error;` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 110:** `return data;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `normalizeCurrency` — lines 120–129

Parameters: `currency`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 124:** `return String(` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getServerCurrency` — lines 141–179

Parameters: `source (defaulted)`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=false, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 143:** `let configuredCurrency =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 147:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 149:** `const settings =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 150:** `await getSystemSettings(source);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 166:** `const currency =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 171:** `if (!/^[A-Z]{3}$/.test(currency)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 173:** `throw new Error(` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 178:** `return currency;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getTrustedClientOrigin` — lines 190–237

Parameters: none.
Error control: try=true, catch=false, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 192:** `const configured =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 199:** `if (!configured) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 201:** `throw new Error(` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 212:** `let parsed;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 214:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 221:** `throw new Error(` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 226:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 231:** `throw new Error(` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 236:** `return configured;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getCustomerBooking` — lines 246–276

Parameters: `bookingId`, `user`.
Persistent operations detected: Booking.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 251:** `if (!bookingId) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 252:** `return null;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 255:** `const booking =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 256:** `await Booking.findOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 262:** `if (!booking) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 263:** `return null;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 266:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 272:** `return null;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 275:** `return booking;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `createStripeSession` — lines 285–630

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.user, req.body. Persistent operations detected: Payment.findOne, Payment.create; verify tenant/ownership filters in the exact query. 11 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 20 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 291:** `let initiatingPayment = null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 293:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 295:** `const tenantSettings = await getSystemSettings(req);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 296:** `if (!isTenantPaymentMethodAvailable(tenantSettings, "CARD")) return res.status(409).json({ success: false, message: "Card payments are disabled or not configured for this tenant." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 298:** `if (!req.user?._id) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 300:** `return res.status(401).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 307:** `const bookingId =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 312:** `if (!bookingId) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 314:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 328:** `const booking =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 329:** `await getCustomerBooking(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 334:** `if (!booking) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 336:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 350:** `if (booking.isDeleted) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 352:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 359:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 364:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 371:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `verifyStripeSession` — lines 649–1011

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.user, req.params. Persistent operations detected: Payment.findOne; verify tenant/ownership filters in the exact query. 5 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 12 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 655:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 657:** `if (!req.user?._id) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 659:** `return res.status(401).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 667:** `const sessionId =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 672:** `if (!sessionId) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 674:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 688:** `const session =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 689:** `await stripeRequest(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 698:** `const bookingId =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 704:** `const metadataUserId =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 710:** `if (!bookingId) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 712:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 726:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 732:** `return res.status(403).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 746:** `const booking =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 747:** `await getCustomerBooking(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 752:** `if (!booking) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 754:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `createBankTransferPayment` — lines 1025–1302

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.user, req.body. Persistent operations detected: Payment.findOne, Payment.create; verify tenant/ownership filters in the exact query. 6 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 12 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 1031:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 1033:** `const tenantSettings = await getSystemSettings(req);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 1034:** `if (!isTenantPaymentMethodAvailable(tenantSettings, "BANK_TRANSFER")) return res.status(409).json({ success: false, message: "Bank transfer is disabled or not configured for this tenant." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 1036:** `if (!req.user?._id) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 1038:** `return res.status(401).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 1046:** `const bookingId =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 1051:** `if (!bookingId) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 1053:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 1067:** `const booking =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 1068:** `await getCustomerBooking(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 1073:** `if (!booking) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 1075:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 1089:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 1094:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 1102:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 1106:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 1120:** `const payableAmount = getPayableBookingAmount(booking);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 1121:** `const amount = req.body?.amount === undefined ? payableAmount : Number(req.body.amount);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `stripeWebhook` — lines 1304–1365

Parameters: `req`, `res`.
Reads request/component inputs: req.body. Persistent operations detected: StripeWebhookEvent.create, StripeWebhookEvent.findOne, Payment.findOne, Booking.findOne; verify tenant/ownership filters in the exact query. 13 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 17 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 1305:** Sensitive-configuration/data operation; inspect source without copying secret values. — Reads runtime/build configuration; never expose secret values through logs or browser-bundled variables.
- **Line 1306:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 1307:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 1308:** `const eventPayload = req.body || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 1309:** `const eventId = String(eventPayload.id || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 1310:** `const eventType = String(eventPayload.type || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 1311:** `const sessionObject = eventPayload?.data?.object || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 1312:** `const tenantId = String(sessionObject?.metadata?.tenantId || "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 1313:** `if (!/^\w{24}$/.test(tenantId) || !eventId || !eventType) return res.status(400).json({ success: false, message: "Stripe event is missing payment correlation metadata." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 1314:** `const leaseCutoff = new Date(Date.now() - 5 * 60 * 1000);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 1315:** `let event;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 1316:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 1322:** `if (!event) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 1323:** `try { event = await StripeWebhookEvent.create({ tenantId, eventId, eventType, status: "processing" }); }` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 1324:** `catch (error) {` — Handles an exception from the preceding try block; check whether it returns, rethrows, logs safely, or continues.
- **Line 1325:** `if (error?.code !== 11000) throw error;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 1326:** `const existing = await StripeWebhookEvent.findOne({ tenantId, eventId }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 1327:** `if (existing?.status === "processed" || existing?.status === "ignored" || existing?.status === "processing") return res.status(200).json({ success: true, duplicate: true });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 41: `const stripeRequest = async (`.
- Line 48: `const key =`.
- Line 58: `const options = {`.
- Line 83: `const response =`.
- Line 89: `const data =`.
- Line 94: `const message =`.
- Line 98: `const error =`.
- Line 120: `const normalizeCurrency = (`.
- Line 141: `const getServerCurrency = async (source = {}) => {`.
- Line 143: `let configuredCurrency =`.
- Line 149: `const settings =`.
- Line 166: `const currency =`.
- Line 190: `const getTrustedClientOrigin = () => {`.
- Line 192: `const configured =`.
- Line 212: `let parsed;`.
- Line 246: `const getCustomerBooking = async (`.
- Line 255: `const booking =`.
- Line 285: `export const createStripeSession = async (`.
- Line 291: `let initiatingPayment = null;`.
- Line 295: `const tenantSettings = await getSystemSettings(req);`.
- Line 307: `const bookingId =`.
- Line 328: `const booking =`.
- Line 392: `const payableAmount = getPayableBookingAmount(booking);`.
- Line 393: `const amount = req.body?.amount === undefined ? payableAmount : Number(req.body.amount);`.
- Line 412: `const currency =`.
- Line 424: `const existingPayment =`.
- Line 457: `const existingSession =`.
- Line 499: `const origin =`.
- Line 502: `const canonicalPaymentMethod = normalizePaymentMethod("CARD") || "CARD";`.
- Line 512: `const session =`.
- Line 574: `const payment = initiatingPayment;`.
- Line 589: `const paymentAlreadyAttached =`.
- Line 649: `export const verifyStripeSession = async (`.
- Line 667: `const sessionId =`.
- Line 688: `const session =`.
- Line 698: `const bookingId =`.
- Line 704: `const metadataUserId =`.
- Line 746: `const booking =`.
- Line 768: `const payment = await Payment.findOne(mergeTenantFilter(req, { booking: booking._id, provider: "STRIPE", transactionReference: session.id }));`.
- Line 771: `const expectedAmount = Number(payment.amount);`.
- Line 773: `const expectedCurrency =`.
- Line 785: `const stripeAmount =`.
- Line 790: `const stripeCurrency =`.
- Line 921: `const result =`.
- Line 1025: `export const createBankTransferPayment = async (`.
- Line 1033: `const tenantSettings = await getSystemSettings(req);`.
- Line 1046: `const bookingId =`.
- Line 1067: `const booking =`.
- Line 1120: `const payableAmount = getPayableBookingAmount(booking);`.
- Line 1121: `const amount = req.body?.amount === undefined ? payableAmount : Number(req.body.amount);`.
- Line 1143: `const currency =`.
- Line 1155: `const reference =`.
- Line 1165: `const notes =`.
- Line 1183: `const existingPayment =`.
- Line 1223: `const payment =`.
- Line 1267: `const alreadyAttached =`.
- Line 1304: `export const stripeWebhook = async (req, res) => {`.
- Line 1305: `<sensitive declaration redacted>`.
- Line 1308: `const eventPayload = req.body || {};`.
- Line 1309: `const eventId = String(eventPayload.id || "").trim();`.
- Line 1310: `const eventType = String(eventPayload.type || "").trim();`.
- Line 1311: `const sessionObject = eventPayload?.data?.object || {};`.
- Line 1312: `const tenantId = String(sessionObject?.metadata?.tenantId || "");`.
- Line 1314: `const leaseCutoff = new Date(Date.now() - 5 * 60 * 1000);`.
- Line 1315: `let event;`.
- Line 1326: `const existing = await StripeWebhookEvent.findOne({ tenantId, eventId }).lean();`.
- Line 1332: `const successful = ["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(eventType);`.
- Line 1333: `const failed = ["checkout.session.async_payment_failed", "checkout.session.expired"].includes(eventType);`.
- Line 1336: `const session = sessionObject;`.
- Line 1338: `const payment = await Payment.findOne({ tenantId, provider: "STRIPE", transactionReference: String(session.id) });`.
- Line 1341: `const booking = await Booking.findOne({ tenantId, _id: payment.booking });`.
- Line 1346: `const { failBookingPayment } = await import("../services/paymentLifecycleService.js");`.
- Line 1352: `const expectedAmount = Math.round(Number(payment.amount) * 100);`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
