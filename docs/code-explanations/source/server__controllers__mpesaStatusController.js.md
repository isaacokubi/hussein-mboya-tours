# Source explanation: server/controllers/mpesaStatusController.js

**Source:** [server/controllers/mpesaStatusController.js](../../../server/controllers/mpesaStatusController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `queryStkPush`, `classifyStkQueryResult` from `../services/mpesaQueryService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/mpesaQueryService.js](../../../server/services/mpesaQueryService.js)
- `failBookingPayment` from `../services/paymentLifecycleService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/paymentLifecycleService.js](../../../server/services/paymentLifecycleService.js)

## Runtime declarations and data flow

### `isStaff` — lines 7–10

Parameters: `user`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 8:** `const role = String(user?.roleId?.name || user?.role || user?.legacyRole || "").toLowerCase().replace(/[\s_-]/g, "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 9:** `return ["admin", "superadmin", "administrator", "manager", "tourmanager", "agent", "travelagent"].includes(role);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `canAccess` — lines 11–11

Parameters: `booking`, `user`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `queryMpesaPayment` — lines 13–59

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.user. Persistent operations detected: Payment.findOne, Booking.findOne; verify tenant/ownership filters in the exact query. 8 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 10 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 15:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 16:** `const checkoutRequestID = String(req.params.checkoutRequestId || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `if (!checkoutRequestID) return res.status(400).json({ success: false, message: "CheckoutRequestID is required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 18:** `const payment = await Payment.findOne(mergeTenantFilter(req, { $or: [{ checkoutRequestID }, { checkoutRequestId: checkoutRequestID }] }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 19:** `if (!payment) return res.status(404).json({ success: false, message: "Payment request not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 20:** `const booking = await Booking.findOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 23:** `if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 24:** `if (!canAccess(booking, req.user)) return res.status(403).json({ success: false, message: "You do not have permission to query this payment." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 25:** `if (["completed", "failed", "cancelled", "refunded"].includes(payment.status)) return res.json({ success: true, data: { paymentStatus: payment.status, providerQueried: false, payment } });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 27:** `const providerResponse = await queryStkPush(checkoutRequestID);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 28:** `const resultCode = String(providerResponse?.ResultCode ?? "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 29:** `const providerStatus = classifyStkQueryResult(resultCode);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `if (providerStatus === "cancelled") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 39:** `if (!["completed", "cancelled", "refunded"].includes(booking.status)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 45:** `await payment.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 46:** `await booking.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 48:** `await payment.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 49:** `await failBookingPayment({ payment, booking, failureReason: providerResponse?.ResultDesc || "M-Pesa payment failed.", paymentData: { checkoutRequestID } });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 7: `const isStaff = (user) => {`.
- Line 8: `const role = String(user?.roleId?.name || user?.role || user?.legacyRole || "").toLowerCase().replace(/[\s_-]/g, "");`.
- Line 11: `const canAccess = (booking, user) => isStaff(user) || booking?.user?.toString() === user?._id?.toString() || booking?.customer?.toString() === user?._id?.toString();`.
- Line 13: `export const queryMpesaPayment = async (req, res, next) => {`.
- Line 16: `const checkoutRequestID = String(req.params.checkoutRequestId || "").trim();`.
- Line 18: `const payment = await Payment.findOne(mergeTenantFilter(req, { $or: [{ checkoutRequestID }, { checkoutRequestId: checkoutRequestID }] }));`.
- Line 20: `const booking = await Booking.findOne(`.
- Line 27: `const providerResponse = await queryStkPush(checkoutRequestID);`.
- Line 28: `const resultCode = String(providerResponse?.ResultCode ?? "");`.
- Line 29: `const providerStatus = classifyStkQueryResult(resultCode);`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
