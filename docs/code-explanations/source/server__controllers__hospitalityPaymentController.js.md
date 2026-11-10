# Source explanation: server/controllers/hospitalityPaymentController.js

**Source:** [server/controllers/hospitalityPaymentController.js](../../../server/controllers/hospitalityPaymentController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `initiateStkPush` from `../services/mpesaService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/mpesaService.js](../../../server/services/mpesaService.js)
- `getHospitalityModel`, `getHospitalityPayableAmount`, `assertHospitalityPaymentAccess`, `completeHospitalityPayment`, `failHospitalityPayment` from `../services/hospitalityPaymentLifecycleService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/hospitalityPaymentLifecycleService.js](../../../server/services/hospitalityPaymentLifecycleService.js)
- `ensureHospitalityInvoice` from `../services/hospitalityInvoiceService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/hospitalityInvoiceService.js](../../../server/services/hospitalityInvoiceService.js)

## Runtime declarations and data flow

### `staff` — lines 6–6

Parameters: `user`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `clean` — lines 7–7

Parameters: `v`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `stripeRequest` — lines 8–12

Parameters: `path`, `body (defaulted)`, `method (defaulted)`.
2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 9:** Sensitive-configuration/data operation; inspect source without copying secret values. — Reads runtime/build configuration; never expose secret values through logs or browser-bundled variables.
- **Line 10:** `const options = { method, headers: { Authorization: \`Bearer ${key}\` } }; if (method !== "GET") { options.headers["Content-Type"] = "application/x-www-form-urlencoded"; options.body = new URLSearchParams(body); }` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 11:** `const response = await fetch(\`https://api.stripe.com/v1/${path}\`, options); const data = await response.json(); if (!response.ok) { const error = new Error(data?.error?.message || "Stripe request failed."); error.statu` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `getBooking` — lines 13–13

Parameters: `req`.
Reads request/component inputs: req.body, req.query, req.tenantId, req.params. Persistent operations detected: Model.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 13:** `async (req) => { const type = String(req.body?.type || req.query?.type || "").toLowerCase(); const Model = getHospitalityModel(type); if (!Model) return { type, Model, booking: null }; const booking = await Model.findOne` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `initiateHospitalityMpesa` — lines 15–24

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.user, req.body, req.tenantId. Persistent operations detected: Payment.findOne, Payment.create; verify tenant/ownership filters in the exact query. 6 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 11 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 16:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 17:** `const { type, Model, booking } = await getBooking(req); if (!Model) return res.status(400).json({ success: false, message: "Invalid hospitality booking type." }); if (!booking) return res.status(404).json({ success: fals` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 18:** `const payable = await getHospitalityPayableAmount(booking); if (payable <= 0) return res.status(400).json({ success: false, message: "No balance remains for this reservation." }); const amount = Number(req.body.amount ||` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 19:** `const existing = await Payment.findOne({ tenantId: req.tenantId, hospitalityBooking: booking._id, hospitalityType: type, status: { $in: ["pending", "processing"] } }).sort({ createdAt: -1 }); if (existing) return res.jso` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 20:** `const phone = String(req.body.phoneNumber || booking.passengerPhone || req.user?.phone || "").trim(); if (!phone) return res.status(400).json({ success: false, message: "A valid Kenyan phone number is required for M-Pesa` — Builds an HTTP response with an explicit status and JSON payload.
- **Line 21:** `const response = await initiateStkPush({ phone, amount, bookingId: booking._id.toString() }); const payment = await Payment.create({ tenantId: booking.tenantId, user: booking.user || req.user._id, customer: booking.user ` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 22:** `return res.json({ success: true, message: \`M-Pesa STK Push sent for KES ${amount.toLocaleString()}.\`, data: { ...response, amount, paymentId: payment._id, hospitalityType: type, bookingId: booking._id } });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `initiateHospitalityCard` — lines 26–34

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.user. Persistent operations detected: Payment.create; verify tenant/ownership filters in the exact query. 5 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 27:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 28:** `const { type, Model, booking } = await getBooking(req); if (!Model) return res.status(400).json({ success: false, message: "Invalid hospitality booking type." }); if (!booking) return res.status(404).json({ success: fals` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 29:** `const amount = await getHospitalityPayableAmount(booking); if (amount <= 0) return res.status(400).json({ success: false, message: "No balance remains for this reservation." }); const currency = String(process.env.DEFAUL` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 30:** `const session = await stripeRequest("checkout/sessions", { mode: "payment", currency, "line_items[0][price_data][currency]": currency, "line_items[0][price_data][product_data][name]": type === "hotel" ? \`Hotel reservati` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 31:** `const payment = await Payment.create({ tenantId: booking.tenantId, user: booking.user || req.user._id, customer: booking.user || req.user._id, hospitalityBooking: booking._id, hospitalityBookingModel: type === "hotel" ? ` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 32:** `return res.status(201).json({ success: true, data: { sessionId: session.id, url: session.url, paymentId: payment._id, amount, currency } });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `verifyHospitalityCard` — lines 36–44

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.user, req.tenantId. Persistent operations detected: Model.findOne, Payment.findOne; verify tenant/ownership filters in the exact query. 6 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 9 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 37:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 38:** `const sessionId = clean(req.params.sessionId); if (!sessionId) return res.status(400).json({ success: false, message: "Stripe session ID is required." }); const session = await stripeRequest(\`checkout/sessions/${encodeU` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 39:** `const booking = await Model.findOne({ tenantId: req.tenantId, _id: bookingId }); if (!booking) return res.status(404).json({ success: false, message: "Hospitality booking not found." }); if (!assertHospitalityPaymentAcce` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 40:** `if (session.payment_status !== "paid") { if (session.status === "expired") await failHospitalityPayment({ payment, booking, reason: "Stripe Checkout session expired." }); return res.json({ success: true, paid: false, sta` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 41:** `const expected = await getHospitalityPayableAmount(booking); const actual = Number(session.amount_total || 0) / 100; if (Math.round(actual * 100) !== Math.round(expected * 100)) return res.status(400).json({ success: fal` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 42:** `const result = await completeHospitalityPayment({ payment, booking, paymentData: { amount: actual, paymentMethod: "CARD", transactionId: session.payment_intent ? String(session.payment_intent) : session.id, paymentRefere` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `submitHospitalityBank` — lines 46–51

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.user, req.body. Persistent operations detected: Payment.create; verify tenant/ownership filters in the exact query. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 47:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 48:** `const { type, Model, booking } = await getBooking(req); if (!Model) return res.status(400).json({ success: false, message: "Invalid hospitality booking type." }); if (!booking) return res.status(404).json({ success: fals` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 49:** `const payment = await Payment.create({ tenantId: booking.tenantId, user: booking.user || req.user._id, customer: booking.user || req.user._id, hospitalityBooking: booking._id, hospitalityBookingModel: type === "hotel" ? ` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `confirmHospitalityBank` — lines 53–57

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.user, req.tenantId, req.params, req.body. Persistent operations detected: Payment.findOne, Model.findOne; verify tenant/ownership filters in the exact query. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 54:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 55:** `if (!staff(req.user)) return res.status(403).json({ success: false, message: "Staff authorization is required." }); const payment = await Payment.findOne({ tenantId: req.tenantId, _id: req.params.paymentId, hospitalityTy` — This branch gates the following work on a condition; test both true and false paths when changing it.

### `getHospitalityPayments` — lines 59–63

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query, req.tenantId, req.params, req.user. Persistent operations detected: Model.findOne, Payment.find; verify tenant/ownership filters in the exact query. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 60:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 61:** `const type = String(req.query?.type || "").toLowerCase(); const Model = getHospitalityModel(type); if (!Model) return res.status(400).json({ success: false, message: "Invalid hospitality booking type." }); const booking ` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

## Module-level declarations

- Line 6: `const staff = (user) => ["admin", "super_admin", "superadmin", "manager", "tour_manager", "tourmanager", "agent"].includes(String(user?.role || user?.legacyRole || "").toLowerCase(`.
- Line 7: `const clean = (v) => String(v ?? "").trim();`.
- Line 8: `const stripeRequest = async (path, body = {}, method = "POST") => {`.
- Line 9: `<sensitive declaration redacted>`.
- Line 10: `const options = { method, headers: { Authorization: \`Bearer ${key}\` } }; if (method !== "GET") { options.headers["Content-Type"] = "application/x-www-form-urlencoded"; options.bo`.
- Line 11: `const response = await fetch(\`https://api.stripe.com/v1/${path}\`, options); const data = await response.json(); if (!response.ok) { const error = new Error(data?.error?.message |`.
- Line 13: `const getBooking = async (req) => { const type = String(req.body?.type || req.query?.type || "").toLowerCase(); const Model = getHospitalityModel(type); if (!Model) return { type, `.
- Line 15: `export const initiateHospitalityMpesa = async (req, res, next) => {`.
- Line 17: `const { type, Model, booking } = await getBooking(req); if (!Model) return res.status(400).json({ success: false, message: "Invalid hospitality booking type." }); if (!booking) ret`.
- Line 18: `const payable = await getHospitalityPayableAmount(booking); if (payable <= 0) return res.status(400).json({ success: false, message: "No balance remains for this reservation." }); `.
- Line 19: `const existing = await Payment.findOne({ tenantId: req.tenantId, hospitalityBooking: booking._id, hospitalityType: type, status: { $in: ["pending", "processing"] } }).sort({ create`.
- Line 20: `const phone = String(req.body.phoneNumber || booking.passengerPhone || req.user?.phone || "").trim(); if (!phone) return res.status(400).json({ success: false, message: "A valid Ke`.
- Line 21: `const response = await initiateStkPush({ phone, amount, bookingId: booking._id.toString() }); const payment = await Payment.create({ tenantId: booking.tenantId, user: booking.user `.
- Line 26: `export const initiateHospitalityCard = async (req, res, next) => {`.
- Line 28: `const { type, Model, booking } = await getBooking(req); if (!Model) return res.status(400).json({ success: false, message: "Invalid hospitality booking type." }); if (!booking) ret`.
- Line 29: `const amount = await getHospitalityPayableAmount(booking); if (amount <= 0) return res.status(400).json({ success: false, message: "No balance remains for this reservation." }); co`.
- Line 30: `const session = await stripeRequest("checkout/sessions", { mode: "payment", currency, "line_items[0][price_data][currency]": currency, "line_items[0][price_data][product_data][name`.
- Line 31: `const payment = await Payment.create({ tenantId: booking.tenantId, user: booking.user || req.user._id, customer: booking.user || req.user._id, hospitalityBooking: booking._id, hosp`.
- Line 36: `export const verifyHospitalityCard = async (req, res, next) => {`.
- Line 38: `const sessionId = clean(req.params.sessionId); if (!sessionId) return res.status(400).json({ success: false, message: "Stripe session ID is required." }); const session = await str`.
- Line 39: `const booking = await Model.findOne({ tenantId: req.tenantId, _id: bookingId }); if (!booking) return res.status(404).json({ success: false, message: "Hospitality booking not found`.
- Line 41: `const expected = await getHospitalityPayableAmount(booking); const actual = Number(session.amount_total || 0) / 100; if (Math.round(actual * 100) !== Math.round(expected * 100)) re`.
- Line 42: `const result = await completeHospitalityPayment({ payment, booking, paymentData: { amount: actual, paymentMethod: "CARD", transactionId: session.payment_intent ? String(session.pay`.
- Line 46: `export const submitHospitalityBank = async (req, res, next) => {`.
- Line 48: `const { type, Model, booking } = await getBooking(req); if (!Model) return res.status(400).json({ success: false, message: "Invalid hospitality booking type." }); if (!booking) ret`.
- Line 49: `const payment = await Payment.create({ tenantId: booking.tenantId, user: booking.user || req.user._id, customer: booking.user || req.user._id, hospitalityBooking: booking._id, hosp`.
- Line 53: `export const confirmHospitalityBank = async (req, res, next) => {`.
- Line 59: `export const getHospitalityPayments = async (req, res, next) => {`.
- Line 61: `const type = String(req.query?.type || "").toLowerCase(); const Model = getHospitalityModel(type); if (!Model) return res.status(400).json({ success: false, message: "Invalid hospi`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
