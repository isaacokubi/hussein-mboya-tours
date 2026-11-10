# Source explanation: server/scripts/migrateBookingPaymentLedger.js

**Source:** [server/scripts/migrateBookingPaymentLedger.js](../../../server/scripts/migrateBookingPaymentLedger.js)

## Purpose

An operational script for checks, repair, migration, or data setup; it is not part of ordinary request handling.

## Imports and dependencies

- `dotenv` from `dotenv`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)

## Runtime declarations and data flow

### `round` — lines 7–7

Parameters: `n`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `run` — lines 8–31

Parameters: none.
Persistent operations detected: Booking.find, Payment.find, Tour.findById; verify tenant/ownership filters in the exact query. 6 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 9:** `if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 10:** `await mongoose.connect(process.env.MONGODB_URI);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 11:** `const cursor = Booking.find({}).cursor(); let processed = 0; let changed = 0;` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 12:** `for await (const booking of cursor) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 13:** `const payments = await Payment.find({ booking: booking._id, status: { $in: ["completed", "refunded"] } }).select("amount refundedAmount").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 14:** `let paid = payments.reduce((sum, payment) => sum + Math.max(0, Number(payment.amount || 0) - Number(payment.refundedAmount || 0)), 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `if (paid <= 0 && booking.paymentStatus === "paid") paid = Number(booking.totalAmount || 0);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 17:** `let depositDue = Number(booking.depositAmount || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 18:** `if (booking.tour) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 19:** `const tour = await Tour.findById(booking.tour).select("depositRequired depositType").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 20:** `if (tour) { const configured = Number(tour.depositRequired || 0); depositDue = String(tour.depositType || "fixed").toLowerCase() === "percentage" ? round(Math.min(Number(booking.totalAmount || 0), Number(booking.totalAmo` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 22:** `const balance = Math.max(0, round(Number(booking.totalAmount || 0) - paid));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `const nextStatus = paid >= Number(booking.totalAmount || 0) && Number(booking.totalAmount || 0) > 0 ? "paid" : paid > 0 ? "partial" : booking.paymentStatus;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `const before = JSON.stringify({ amountPaid:Number(booking.amountPaid||0), balanceAmount:Number(booking.balanceAmount||0), depositAmount:Number(booking.depositAmount||0), paymentStatus:booking.paymentStatus });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 26:** `await booking.save({ validateBeforeSave: false });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 27:** `const after = JSON.stringify({ amountPaid:paid, balanceAmount:balance, depositAmount:depositDue, paymentStatus:nextStatus });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.

## Module-level declarations

- Line 7: `const round = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;`.
- Line 8: `const run = async () => {`.
- Line 11: `const cursor = Booking.find({}).cursor(); let processed = 0; let changed = 0;`.
- Line 13: `const payments = await Payment.find({ booking: booking._id, status: { $in: ["completed", "refunded"] } }).select("amount refundedAmount").lean();`.
- Line 14: `let paid = payments.reduce((sum, payment) => sum + Math.max(0, Number(payment.amount || 0) - Number(payment.refundedAmount || 0)), 0);`.
- Line 17: `let depositDue = Number(booking.depositAmount || 0);`.
- Line 19: `const tour = await Tour.findById(booking.tour).select("depositRequired depositType").lean();`.
- Line 22: `const balance = Math.max(0, round(Number(booking.totalAmount || 0) - paid));`.
- Line 23: `const nextStatus = paid >= Number(booking.totalAmount || 0) && Number(booking.totalAmount || 0) > 0 ? "paid" : paid > 0 ? "partial" : booking.paymentStatus;`.
- Line 24: `const before = JSON.stringify({ amountPaid:Number(booking.amountPaid||0), balanceAmount:Number(booking.balanceAmount||0), depositAmount:Number(booking.depositAmount||0), paymentSta`.
- Line 27: `const after = JSON.stringify({ amountPaid:paid, balanceAmount:balance, depositAmount:depositDue, paymentStatus:nextStatus });`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
