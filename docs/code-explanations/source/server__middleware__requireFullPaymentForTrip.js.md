# Source explanation: server/middleware/requireFullPaymentForTrip.js

**Source:** [server/middleware/requireFullPaymentForTrip.js](../../../server/middleware/requireFullPaymentForTrip.js)

## Purpose

Express middleware that runs in a request pipeline, inspecting or enriching the request, rejecting it, or calling next().

## Imports and dependencies

- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)

## Runtime declarations and data flow

### `requireFullPaymentForTrip` — lines 8–54

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.params. Persistent operations detected: Booking.findById; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 9:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 10:** `const targetStatus = String(req.body?.status || "").trim().toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 12:** `if (!targetStatus || !["ongoing", "completed"].includes(targetStatus)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 13:** `return next();` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 16:** `const booking = await Booking.findById(req.params.id).select(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 20:** `if (!booking) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 21:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 27:** `const total = Number(booking.totalAmount || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 28:** `const paid = Number(` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 31:** `const balance = Math.max(` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 38:** `if (balance > 0 || String(booking.paymentStatus || "").toLowerCase() !== "paid") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 39:** `return res.status(409).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 50:** `return next();` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 52:** `return next(error);` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 8: `export const requireFullPaymentForTrip = async (req, res, next) => {`.
- Line 10: `const targetStatus = String(req.body?.status || "").trim().toLowerCase();`.
- Line 16: `const booking = await Booking.findById(req.params.id).select(`.
- Line 27: `const total = Number(booking.totalAmount || 0);`.
- Line 28: `const paid = Number(`.
- Line 31: `const balance = Math.max(`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
