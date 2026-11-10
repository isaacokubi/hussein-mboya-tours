# Source explanation: server/services/aiBookingDraftService.js

**Source:** [server/services/aiBookingDraftService.js](../../../server/services/aiBookingDraftService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `findTourForBooking` from `./aiBookingService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/aiBookingService.js](../../../server/services/aiBookingService.js)

## Runtime declarations and data flow

### `generateBookingNumber` — lines 6–13

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 8:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `createAIBookingDraft` — lines 16–108

Parameters: `message`, `user (defaulted)`.
Persistent operations detected: Booking.create; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 23:** `const tour =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `await findTourForBooking(message);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 27:** `if (!tour) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 29:** `return null;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 34:** `const futureDate =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `const booking =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 43:** `await Booking.create({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 103:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 6: `const generateBookingNumber = () => {`.
- Line 16: `export const createAIBookingDraft = async (`.
- Line 23: `const tour =`.
- Line 34: `const futureDate =`.
- Line 42: `const booking =`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
