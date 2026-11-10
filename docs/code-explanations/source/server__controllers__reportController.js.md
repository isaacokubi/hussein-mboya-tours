# Source explanation: server/controllers/reportController.js

**Source:** [server/controllers/reportController.js](../../../server/controllers/reportController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `generateCSV` from `../services/reportService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/reportService.js](../../../server/services/reportService.js)

## Runtime declarations and data flow

### `exportBookings` — lines 13–107

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: Booking.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 15:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 16:** `const { status, paymentStatus, from, to } = req.query;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 18:** `const filter = {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 26:** `if (status) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 30:** `if (paymentStatus) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 34:** `if (from || to) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 37:** `if (from) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 41:** `if (to) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 52:** `const bookings = await Booking.find(filter)` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 66:** `const rows = bookings.map((booking) => ({` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 93:** `const csv = generateCSV(rows);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 102:** `return res.status(200).send(csv);` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 13: `export const exportBookings = async (req, res, next) => {`.
- Line 16: `const { status, paymentStatus, from, to } = req.query;`.
- Line 18: `const filter = {};`.
- Line 52: `const bookings = await Booking.find(filter)`.
- Line 66: `const rows = bookings.map((booking) => ({`.
- Line 93: `const csv = generateCSV(rows);`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
