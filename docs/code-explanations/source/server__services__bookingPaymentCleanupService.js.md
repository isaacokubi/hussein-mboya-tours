# Source explanation: server/services/bookingPaymentCleanupService.js

**Source:** [server/services/bookingPaymentCleanupService.js](../../../server/services/bookingPaymentCleanupService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `runWithTenant` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `cancelExpiredPendingBookings` — lines 12–97

Parameters: none.
Persistent operations detected: Booking.find, Booking.findOne, Payment.find; verify tenant/ownership filters in the exact query. 8 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 14:** `const cutoff = new Date(Date.now() - 30 * 60 * 1000);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `const expiredBookings = await Booking.find({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 24:** `let cancelledBookings = 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `let expiredPayments = 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 27:** `for (const candidate of expiredBookings) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 28:** `const session = await mongoose.startSession();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 30:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 31:** `let transactionCancelled = false;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 32:** `let transactionExpiredPayments = 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `await session.withTransaction(async () => {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 37:** `const booking = await Booking.findOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 45:** `if (!booking) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 47:** `const payments = await Payment.find({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 53:** `const now = new Date();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 55:** `for (const payment of payments) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 60:** `await payment.save({ session });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 69:** `await booking.save({ session });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 73:** `if (transactionCancelled) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 6: `const PAYMENT_EXPIRY_REASON =`.
- Line 9: `const BOOKING_EXPIRY_REASON =`.
- Line 12: `export const cancelExpiredPendingBookings = async () =>`.
- Line 14: `const cutoff = new Date(Date.now() - 30 * 60 * 1000);`.
- Line 16: `const expiredBookings = await Booking.find({`.
- Line 24: `let cancelledBookings = 0;`.
- Line 25: `let expiredPayments = 0;`.
- Line 28: `const session = await mongoose.startSession();`.
- Line 31: `let transactionCancelled = false;`.
- Line 32: `let transactionExpiredPayments = 0;`.
- Line 37: `const booking = await Booking.findOne({`.
- Line 47: `const payments = await Payment.find({`.
- Line 53: `const now = new Date();`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
