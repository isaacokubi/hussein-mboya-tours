# Source explanation: server/services/availabilityService.js

**Source:** [server/services/availabilityService.js](../../../server/services/availabilityService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)

## Runtime declarations and data flow

### `checkAvailability` — lines 21–64

Parameters: `tourId`, `numberOfTravelers (defaulted)`.
Persistent operations detected: Tour.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 27:** `if (!Number.isInteger(numberOfTravelers) || numberOfTravelers < 1) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 28:** `throw new Error("Invalid number of travelers.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 32:** `const tour = await Tour.findOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 38:** `if (!tour) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 39:** `throw new Error("Tour not found.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 43:** `const availability = tour.availabilitySettings || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 45:** `const totalSlots = availability.totalSlots ?? 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 46:** `const bookedSlots = availability.bookedSlots ?? 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 49:** `const remainingSlots = Math.max(totalSlots - bookedSlots, 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 51:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `reserveSlots` — lines 76–117

Parameters: `tourId`, `numberOfTravelers (defaulted)`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 80:** `if (!Number.isInteger(numberOfTravelers) || numberOfTravelers < 1) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 81:** `throw new Error("Invalid number of travelers.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 84:** `const tour = await Tour.findOneAndUpdate(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 110:** `if (!tour) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 111:** `throw new Error(` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 116:** `return tour;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `releaseSlots` — lines 131–159

Parameters: `tourId`, `numberOfTravelers (defaulted)`.
Persistent operations detected: Tour.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 137:** `if (!Number.isInteger(numberOfTravelers) || numberOfTravelers < 1) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 138:** `throw new Error("Invalid number of travelers.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 141:** `const tour = await Tour.findOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 147:** `if (!tour) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 148:** `throw new Error("Tour not found.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 156:** `await tour.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 158:** `return tour;` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 21: `export const checkAvailability = async (`.
- Line 32: `const tour = await Tour.findOne(`.
- Line 43: `const availability = tour.availabilitySettings || {};`.
- Line 45: `const totalSlots = availability.totalSlots ?? 0;`.
- Line 46: `const bookedSlots = availability.bookedSlots ?? 0;`.
- Line 49: `const remainingSlots = Math.max(totalSlots - bookedSlots, 0);`.
- Line 76: `export const reserveSlots = async (`.
- Line 84: `const tour = await Tour.findOneAndUpdate(`.
- Line 131: `export const releaseSlots = async (`.
- Line 141: `const tour = await Tour.findOne(`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
