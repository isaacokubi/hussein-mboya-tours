# Source explanation: server/middleware/prepareBookingForMpesa.js

**Source:** [server/middleware/prepareBookingForMpesa.js](../../../server/middleware/prepareBookingForMpesa.js)

## Purpose

Express middleware that runs in a request pipeline, inspecting or enriching the request, rejecting it, or calling next().

## Imports and dependencies

- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `mergeTenantFilter` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `createPrepareBookingForMpesa` — lines 11–45

Parameters: `arg1 (defaulted)`.
Reads request/component inputs: req.body. Persistent operations detected: BookingModel.findOne, PaymentModel.countDocuments; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 12:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 13:** `const bookingId = req.body?.bookingId;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 14:** `if (!bookingId) return next();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 19:** `const booking = await BookingModel.findOne(mergeTenantFilter({ _id: bookingId }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 20:** `if (!booking) return next();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 22:** `const status = String(booking.paymentStatus || "pending").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `const total = Number(booking.totalAmount || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `const recordedPaid = Number(booking.depositAmount || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 26:** `if (status !== "paid" && total > 0 && recordedPaid >= total) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 27:** `const completedPayments = await PaymentModel.countDocuments(mergeTenantFilter({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 32:** `if (completedPayments === 0) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 36:** `if (booking.status === "failed") booking.status = "pending";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 37:** `await booking.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 41:** `return next();` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 43:** `return next(error);` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 11: `export const createPrepareBookingForMpesa = ({ BookingModel = Booking, PaymentModel = Payment } = {}) => async (req, res, next) => {`.
- Line 13: `const bookingId = req.body?.bookingId;`.
- Line 19: `const booking = await BookingModel.findOne(mergeTenantFilter({ _id: bookingId }));`.
- Line 22: `const status = String(booking.paymentStatus || "pending").toLowerCase();`.
- Line 23: `const total = Number(booking.totalAmount || 0);`.
- Line 24: `const recordedPaid = Number(booking.depositAmount || 0);`.
- Line 27: `const completedPayments = await PaymentModel.countDocuments(mergeTenantFilter({`.
- Line 47: `export const prepareBookingForMpesa = createPrepareBookingForMpesa();`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
