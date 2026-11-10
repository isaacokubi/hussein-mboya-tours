# Source explanation: server/services/tourResourceLifecycleService.js

**Source:** [server/services/tourResourceLifecycleService.js](../../../server/services/tourResourceLifecycleService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `Staff` from `../models/Staff.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Staff.js](../../../server/models/Staff.js)
- `Vehicle` from `../models/Vehicle.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Vehicle.js](../../../server/models/Vehicle.js)
- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `releaseTourResources` — lines 7–41

Parameters: `tourOrId`, `session (defaulted)`.
Persistent operations detected: Tour.findOne, Staff.findOne; verify tenant/ownership filters in the exact query. 5 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 9:** `const tour = typeof tourOrId === "object" && tourOrId?._id` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 11:** `: await Tour.findOne(mergeTenantFilter({ _id: tourOrId })).session(session);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 13:** `if (!tour) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 15:** `const staffIds = [tour.assignedGuide, tour.assignedDriver].filter(Boolean);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `for (const staffId of staffIds) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 17:** `const staff = await Staff.findOne(mergeTenantFilter({ _id: staffId })).session(session);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 18:** `if (!staff) continue;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 20:** `if (staff.assignedTours.length === 0) staff.availability = "available";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 21:** `await staff.save({ session });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 24:** `if (tour.assignedVehicle) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 25:** `await Vehicle.findOneAndUpdate(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 36:** `if (tour.availabilitySettings) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 39:** `await tour.save({ session });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 40:** `return tour;` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 9: `const tour = typeof tourOrId === "object" && tourOrId?._id`.
- Line 15: `const staffIds = [tour.assignedGuide, tour.assignedDriver].filter(Boolean);`.
- Line 17: `const staff = await Staff.findOne(mergeTenantFilter({ _id: staffId })).session(session);`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
