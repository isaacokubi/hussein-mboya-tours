# Source explanation: server/services/recoveryService.js

**Source:** [server/services/recoveryService.js](../../../server/services/recoveryService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `getSystemSettings` from `../services/settingsService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/settingsService.js](../../../server/services/settingsService.js)
- `sendEmail` from `./emailService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/emailService.js](../../../server/services/emailService.js)

## Runtime declarations and data flow

### `recoverBookings` — lines 18–109

Parameters: none.
Persistent operations detected: Booking.find; verify tenant/ownership filters in the exact query. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 21:** `const settings = await getSystemSettings();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 22:** `const companyName = settings.companyName || "Company";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `const now = new Date();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `const twentyFourHoursAgo = new Date(` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 29:** `const bookings = await Booking.find({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 52:** `let remindersSent = 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 53:** `let failures = 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 55:** `for (const booking of bookings) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 56:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 57:** `if (!booking.contact?.email) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 61:** `await sendEmail({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 91:** `await booking.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 104:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 18: `export const recoverBookings = async () => {`.
- Line 21: `const settings = await getSystemSettings();`.
- Line 22: `const companyName = settings.companyName || "Company";`.
- Line 23: `const now = new Date();`.
- Line 25: `const twentyFourHoursAgo = new Date(`.
- Line 29: `const bookings = await Booking.find({`.
- Line 52: `let remindersSent = 0;`.
- Line 53: `let failures = 0;`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
