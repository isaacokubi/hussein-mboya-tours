# Source explanation: server/controllers/cashPaymentController.js

**Source:** [server/controllers/cashPaymentController.js](../../../server/controllers/cashPaymentController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `getPayableBookingAmount` from `../services/paymentLifecycleService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/paymentLifecycleService.js](../../../server/services/paymentLifecycleService.js)
- `getSystemSettings` from `../services/settingsService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/settingsService.js](../../../server/services/settingsService.js)
- `isTenantPaymentMethodAvailable` from `../services/tenantPaymentMethods.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/tenantPaymentMethods.js](../../../server/services/tenantPaymentMethods.js)

## Runtime declarations and data flow

### `ownsBooking` — lines 8–8

Parameters: `booking`, `user`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `createCashPayment` — lines 10–32

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user. Persistent operations detected: Booking.findOne, Payment.findOne, Payment.create; verify tenant/ownership filters in the exact query. 5 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 9 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 12:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 13:** `const settings = await getSystemSettings(req);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 14:** `if (!isTenantPaymentMethodAvailable(settings, "CASH")) return res.status(409).json({ success: false, message: "Cash payments are disabled or not configured for this tenant." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 15:** `const booking = await Booking.findOne(mergeTenantFilter(req, { _id: req.body?.bookingId }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 16:** `if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 17:** `if (!ownsBooking(booking, req.user)) return res.status(403).json({ success: false, message: "You cannot create a cash payment for this booking." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 18:** `if (["cancelled", "refunded"].includes(String(booking.status).toLowerCase()) || booking.paymentStatus === "paid") return res.status(409).json({ success: false, message: "This booking cannot receive another payment." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 19:** `const payableAmount = Number(getPayableBookingAmount(booking));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `const amount = req.body?.amount === undefined ? payableAmount : Number(req.body.amount);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `if (!Number.isFinite(amount) || amount <= 0 || amount > payableAmount) return res.status(400).json({ success: false, message: "Enter a valid amount up to the outstanding booking balance." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 22:** `const existing = await Payment.findOne(mergeTenantFilter(req, { booking: booking._id, provider: "CASH", status: { $in: ["pending", "processing"] } })).sort({ createdAt: -1 });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 23:** `if (existing) return res.status(200).json({ success: true, message: "Cash payment is awaiting staff confirmation.", payment: { id: existing._id, status: existing.status, amount: existing.amount, currency: existing.curren` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 24:** `const payment = await Payment.create({ tenantId: requireTenantId(), customer: req.user._id, user: req.user._id, booking: booking._id, provider: "CASH", method: "cash", paymentMethod: "CASH", amount, currency: String(sett` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 26:** `if (!booking.payments.some((id) => String(id) === String(payment._id))) booking.payments.push(payment._id);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 29:** `await booking.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 30:** `return res.status(201).json({ success: true, message: "Cash payment recorded as pending. Staff must confirm receipt before the booking is marked paid.", payment: { id: payment._id, status: payment.status, amount: payment` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 8: `const ownsBooking = (booking, user) => Boolean(user?._id) && [booking.user, booking.customer].some((owner) => String(owner || "") === String(user._id));`.
- Line 10: `export const createCashPayment = async (req, res, next) => {`.
- Line 13: `const settings = await getSystemSettings(req);`.
- Line 15: `const booking = await Booking.findOne(mergeTenantFilter(req, { _id: req.body?.bookingId }));`.
- Line 19: `const payableAmount = Number(getPayableBookingAmount(booking));`.
- Line 20: `const amount = req.body?.amount === undefined ? payableAmount : Number(req.body.amount);`.
- Line 22: `const existing = await Payment.findOne(mergeTenantFilter(req, { booking: booking._id, provider: "CASH", status: { $in: ["pending", "processing"] } })).sort({ createdAt: -1 });`.
- Line 24: `const payment = await Payment.create({ tenantId: requireTenantId(), customer: req.user._id, user: req.user._id, booking: booking._id, provider: "CASH", method: "cash", paymentMetho`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
