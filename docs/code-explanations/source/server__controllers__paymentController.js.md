# Source explanation: server/controllers/paymentController.js

**Source:** [server/controllers/paymentController.js](../../../server/controllers/paymentController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `getSystemSettings` from `../services/settingsService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/settingsService.js](../../../server/services/settingsService.js)
- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `completeBookingPayment`, `getPayableBookingAmount`, `userOwnsBooking` from `../services/paymentLifecycleService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/paymentLifecycleService.js](../../../server/services/paymentLifecycleService.js)

## Runtime declarations and data flow

### `getPaymentById` — lines 9–9

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: Payment.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 9:** `async (req, res, next) => { requireTenantId(); try { const settings = await getSystemSettings(); const payment = await Payment.findOne(mergeTenantFilter(req, { _id: req.params.id })).populate("booking").populate("custome` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `getPaymentByBooking` — lines 10–10

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: Payment.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 10:** `async (req, res, next) => { requireTenantId(); try { const payment = await Payment.findOne(mergeTenantFilter(req, { booking: req.params.bookingId })).sort({ createdAt: -1 }).populate("booking").populate("customer").popul` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `getPayments` — lines 11–11

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: Payment.find, Payment.countDocuments; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 11:** `async (req, res, next) => { requireTenantId(); try { const { status, provider, method, booking, customer, user, page = 1 } = req.query; const query = {}; if (status) query.status = status; if (provider) query.provider = ` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `createPayment` — lines 13–13

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user, req.tenantId. Persistent operations detected: Booking.findOne, Payment.create; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 13:** `async (req, res, next) => { requireTenantId(); try { const { booking: bookingId, provider, method, paymentMethod, phone, phoneNumber, transactionReference, notes } = req.body || {}; if (!bookingId || !provider || !method` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `updatePaymentStatus` — lines 14–14

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.params. Persistent operations detected: Payment.findOne, Booking.findOne; verify tenant/ownership filters in the exact query. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 8 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 14:** `async (req, res, next) => { requireTenantId(); try { const status = String(req.body?.status || "").trim().toLowerCase(); const payment = await Payment.findOne(mergeTenantFilter(req, { _id: req.params.id })); if (!payment` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `markPaymentCompleted` — lines 15–15

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body. Persistent operations detected: Payment.findOne, Booking.findOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 15:** `async (req, res, next) => { requireTenantId(); try { const payment = await Payment.findOne(mergeTenantFilter(req, { _id: req.params.id })); if (!payment) return res.status(404).json({ success: false, message: "Payment no` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `markPaymentFailed` — lines 16–16

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.params. Persistent operations detected: Payment.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 16:** `async (req, res, next) => { requireTenantId(); try { const { reason = "" } = req.body; const payment = await Payment.findOne(mergeTenantFilter(req, { _id: req.params.id })); if (!payment) return res.status(404).json({ su` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `requestRefund` — lines 17–17

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.params. Persistent operations detected: Payment.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 7 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 17:** `async (req, res, next) => { requireTenantId(); try { const { amount, refundReference = "" } = req.body; const payment = await Payment.findOne(mergeTenantFilter(req, { _id: req.params.id })); if (!payment) return res.stat` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

## Module-level declarations

- Line 7: `const PAYMENT_PAGE_SIZE = 10;`.
- Line 9: `export const getPaymentById = async (req, res, next) => { requireTenantId(); try { const settings = await getSystemSettings(); const payment = await Payment.findOne(mergeTenantFilt`.
- Line 10: `export const getPaymentByBooking = async (req, res, next) => { requireTenantId(); try { const payment = await Payment.findOne(mergeTenantFilter(req, { booking: req.params.bookingId`.
- Line 11: `export const getPayments = async (req, res, next) => { requireTenantId(); try { const { status, provider, method, booking, customer, user, page = 1 } = req.query; const query = {};`.
- Line 13: `export const createPayment = async (req, res, next) => { requireTenantId(); try { const { booking: bookingId, provider, method, paymentMethod, phone, phoneNumber, transactionRefere`.
- Line 14: `export const updatePaymentStatus = async (req, res, next) => { requireTenantId(); try { const status = String(req.body?.status || "").trim().toLowerCase(); const payment = await Pa`.
- Line 15: `export const markPaymentCompleted = async (req, res, next) => { requireTenantId(); try { const payment = await Payment.findOne(mergeTenantFilter(req, { _id: req.params.id })); if (`.
- Line 16: `export const markPaymentFailed = async (req, res, next) => { requireTenantId(); try { const { reason = "" } = req.body; const payment = await Payment.findOne(mergeTenantFilter(req,`.
- Line 17: `export const requestRefund = async (req, res, next) => { requireTenantId(); try { const { amount, refundReference = "" } = req.body; const payment = await Payment.findOne(mergeTena`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
