# Source explanation: server/services/travelOperationsService.js

**Source:** [server/services/travelOperationsService.js](../../../server/services/travelOperationsService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `OperationalAsset` from `../models/OperationalAsset.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/OperationalAsset.js](../../../server/models/OperationalAsset.js)

## Runtime declarations and data flow

### `assertNoScheduleConflict` — lines 3–13

Parameters: `{tenantId, assignedTo, startAt, endAt, excludeId}`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 4:** `if (!assignedTo || !startAt || !endAt) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 5:** `const filter = { tenantId, assignedTo, status: { $nin: ["cancelled", "completed"] }, startAt: { $lt: new Date(endAt) }, endAt: { $gt: new Date(startAt) } };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 6:** `if (excludeId) filter._id = { $ne: excludeId };` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 7:** `const conflict = await OperationalAsset.exists(filter);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 8:** `if (conflict) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 9:** `const error = new Error("The assigned resource is already scheduled during this period.");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 11:** `throw error;` — Stops the current operation with an error; callers or Express error handling determine the response.

### `createScheduledOperation` — lines 15–18

Parameters: `payload`.
Persistent operations detected: OperationalAsset.create; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:
- **Line 16:** `await assertNoScheduleConflict(payload);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 17:** `return OperationalAsset.create(payload);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `updateScheduledOperation` — lines 20–25

Parameters: `item`, `updates`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:
- **Line 21:** `const merged = { tenantId: item.tenantId, assignedTo: updates.assignedTo ?? item.assignedTo, startAt: updates.startAt ?? item.startAt, endAt: updates.endAt ?? item.endAt, excludeId: item._id };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 22:** `await assertNoScheduleConflict(merged);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 24:** `return item.save();` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 3: `export const assertNoScheduleConflict = async ({ tenantId, assignedTo, startAt, endAt, excludeId = null }) => {`.
- Line 5: `const filter = { tenantId, assignedTo, status: { $nin: ["cancelled", "completed"] }, startAt: { $lt: new Date(endAt) }, endAt: { $gt: new Date(startAt) } };`.
- Line 7: `const conflict = await OperationalAsset.exists(filter);`.
- Line 9: `const error = new Error("The assigned resource is already scheduled during this period.");`.
- Line 15: `export const createScheduledOperation = async (payload) => {`.
- Line 20: `export const updateScheduledOperation = async (item, updates) => {`.
- Line 21: `const merged = { tenantId: item.tenantId, assignedTo: updates.assignedTo ?? item.assignedTo, startAt: updates.startAt ?? item.startAt, endAt: updates.endAt ?? item.endAt, excludeId`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
