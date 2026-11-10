# Source explanation: server/controllers/bookingRetrievalController.js

**Source:** [server/controllers/bookingRetrievalController.js](../../../server/controllers/bookingRetrievalController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `mergeTenantFilter` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `successResponse` from `../utils/apiResponse.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/utils/apiResponse.js](../../../server/utils/apiResponse.js)

## Runtime declarations and data flow

### `isPrivilegedBookingViewer` — lines 6–25

Parameters: `user`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 7:** `const role = String(` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 14:** `return [` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getBookingById` — lines 39–99

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.user. Persistent operations detected: Booking.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 40:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 41:** `const { id } = req.params;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 43:** `if (!mongoose.Types.ObjectId.isValid(id)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 44:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 50:** `const booking = await Booking.findOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 64:** `if (!booking) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 65:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 71:** `if (!isPrivilegedBookingViewer(req.user)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 72:** `const requesterId = String(req.user?._id || req.user?.id || "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 73:** `const userOwnerId = booking.user?._id || booking.user;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 74:** `const customerUserId = booking.customer?.user?._id || booking.customer?.user;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 75:** `const customerId = booking.customer?._id || booking.customer;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 77:** `const ownsAsUser = String(userOwnerId || "") === requesterId;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 78:** `const ownsThroughCustomer =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 82:** `if (!ownsAsUser && !ownsThroughCustomer) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 83:** `return res.status(403).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 90:** `return successResponse(` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 97:** `return next(error);` — Exits this function and supplies its result (or response short-circuit) to the caller.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 6: `const isPrivilegedBookingViewer = (user) => {`.
- Line 7: `const role = String(`.
- Line 39: `export const getBookingById = async (req, res, next) => {`.
- Line 41: `const { id } = req.params;`.
- Line 50: `const booking = await Booking.findOne(`.
- Line 72: `const requesterId = String(req.user?._id || req.user?.id || "");`.
- Line 73: `const userOwnerId = booking.user?._id || booking.user;`.
- Line 74: `const customerUserId = booking.customer?.user?._id || booking.customer?.user;`.
- Line 75: `const customerId = booking.customer?._id || booking.customer;`.
- Line 77: `const ownsAsUser = String(userOwnerId || "") === requesterId;`.
- Line 78: `const ownsThroughCustomer =`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
