# Source explanation: server/services/aiBookingCompleteService.js

**Source:** [server/services/aiBookingCompleteService.js](../../../server/services/aiBookingCompleteService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)

## Runtime declarations and data flow

### `generateBookingNumber` — lines 5–7

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 6:** `return "AI-" + Date.now();` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `completeAIBooking` — lines 9–55

Parameters: `{tourId, travelDate, travellers, name, email, phone, user}`.
Persistent operations detected: Tour.findOne, Booking.create; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 18:** `const tenantId = requireTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `const tour = await Tour.findOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 26:** `if (!tour) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 27:** `throw new Error("Tour not found");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 30:** `const guests = Number(travellers) || 1;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 31:** `const amount = (tour.price || 0) * guests;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 33:** `const booking = await Booking.create({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 54:** `return booking;` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 5: `const generateBookingNumber = () => {`.
- Line 9: `export const completeAIBooking = async ({`.
- Line 18: `const tenantId = requireTenantId();`.
- Line 20: `const tour = await Tour.findOne(`.
- Line 30: `const guests = Number(travellers) || 1;`.
- Line 31: `const amount = (tour.price || 0) * guests;`.
- Line 33: `const booking = await Booking.create({`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
