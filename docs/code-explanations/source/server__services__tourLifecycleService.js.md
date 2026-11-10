# Source explanation: server/services/tourLifecycleService.js

**Source:** [server/services/tourLifecycleService.js](../../../server/services/tourLifecycleService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `mergeTenantFilter`, `runWithTenant` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `Staff` from `../models/Staff.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Staff.js](../../../server/models/Staff.js)
- `Vehicle` from `../models/Vehicle.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Vehicle.js](../../../server/models/Vehicle.js)

## Runtime declarations and data flow

### `startOfDay` — lines 6–9

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 7:** `const d = new Date(value);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 8:** `return new Date(d.getFullYear(), d.getMonth(), d.getDate());` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `endForTour` — lines 11–18

Parameters: `tour`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 12:** `if (tour.endDate) return new Date(tour.endDate);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 13:** `const start = new Date(tour.startDate || tour.date);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 14:** `const days = Math.max(1, Number(tour.durationDetails?.days || tour.duration || 1));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `const end = new Date(start);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `return end;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `syncTourLifecycle` — lines 20–72

Parameters: none.
Persistent operations detected: Tour.find, Tour.updateOne, Staff.findOne; verify tenant/ownership filters in the exact query. 8 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 11 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 21:** `const today = startOfDay(new Date());` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 22:** `const tours = await Tour.find({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 27:** `for (const tour of tours) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 31:** `const tenantId = tour.tenantId;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 32:** `if (!tenantId) continue;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 34:** `await runWithTenant({ tenantId, role: "system", bypass: false }, async () => {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 35:** `const start = startOfDay(tour.startDate || tour.date);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 36:** `const end = startOfDay(endForTour(tour));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 38:** `if (today > end) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 39:** `await Tour.updateOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 44:** `for (const staffId of [tour.assignedGuide, tour.assignedDriver].filter(Boolean)) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 45:** `const staff = await Staff.findOne(mergeTenantFilter({ _id: staffId }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 46:** `if (staff) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 48:** `if (staff.assignedTours.length === 0) staff.availability = "available";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 49:** `await staff.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 53:** `if (tour.assignedVehicle) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 54:** `await Vehicle.findOneAndUpdate(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 60:** `await Tour.updateOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 6: `const startOfDay = (value) => {`.
- Line 7: `const d = new Date(value);`.
- Line 11: `const endForTour = (tour) => {`.
- Line 13: `const start = new Date(tour.startDate || tour.date);`.
- Line 14: `const days = Math.max(1, Number(tour.durationDetails?.days || tour.duration || 1));`.
- Line 15: `const end = new Date(start);`.
- Line 20: `export const syncTourLifecycle = async () => runWithTenant({ bypass: true }, async () => {`.
- Line 21: `const today = startOfDay(new Date());`.
- Line 22: `const tours = await Tour.find({`.
- Line 31: `const tenantId = tour.tenantId;`.
- Line 35: `const start = startOfDay(tour.startDate || tour.date);`.
- Line 36: `const end = startOfDay(endForTour(tour));`.
- Line 45: `const staff = await Staff.findOne(mergeTenantFilter({ _id: staffId }));`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
