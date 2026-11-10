# Source explanation: server/services/bookingStatusService.js

**Source:** [server/services/bookingStatusService.js](../../../server/services/bookingStatusService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `mergeTenantFilter` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `BOOKING_STATUSES`, `isValidBookingStatus`, `canTransitionBookingStatus` from `../constants/bookingConstants.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/constants/bookingConstants.js](../../../server/constants/bookingConstants.js)

## Runtime declarations and data flow

### `validateBookingStatus` — lines 16–28

Parameters: `status`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 17:** `if (!isValidBookingStatus(status)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 18:** `const error = new Error(` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `throw error;` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 27:** `return true;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `transitionBookingStatus` — lines 30–94

Parameters: `booking`, `nextStatus`, `options (defaulted)`.
4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 35:** `const {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `const currentStatus = booking.status;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 44:** `if (currentStatus === nextStatus) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 45:** `if (allowSame) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 46:** `return booking;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 49:** `const error = new Error(` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 55:** `throw error;` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 68:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 73:** `return booking;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 76:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 82:** `const error = new Error(` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 88:** `throw error;` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 93:** `return booking;` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 16: `export const validateBookingStatus = (status) => {`.
- Line 18: `const error = new Error(`.
- Line 30: `export const transitionBookingStatus = (`.
- Line 35: `const {`.
- Line 42: `const currentStatus = booking.status;`.
- Line 49: `const error = new Error(`.
- Line 82: `const error = new Error(`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
