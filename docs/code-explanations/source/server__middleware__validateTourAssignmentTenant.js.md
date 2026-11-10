# Source explanation: server/middleware/validateTourAssignmentTenant.js

**Source:** [server/middleware/validateTourAssignmentTenant.js](../../../server/middleware/validateTourAssignmentTenant.js)

## Purpose

Express middleware that runs in a request pipeline, inspecting or enriching the request, rejecting it, or calling next().

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `Staff` from `../models/Staff.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Staff.js](../../../server/models/Staff.js)
- `Vehicle` from `../models/Vehicle.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Vehicle.js](../../../server/models/Vehicle.js)

## Runtime declarations and data flow

### `validObjectId` — lines 7–7

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `validateTourAssignmentTenant` — lines 9–40

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body. Persistent operations detected: Tour.findOne, Model.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 11:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 12:** `const tourId = req.params.id || req.body?.tourId;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `if (!tourId || !validObjectId(tourId)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 14:** `return res.status(400).json({ success: false, message: "A valid tour ID is required." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 17:** `const tour = await Tour.findOne(mergeTenantFilter(req, { _id: tourId, isDeleted: { $ne: true } })).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 18:** `if (!tour) return res.status(404).json({ success: false, message: "Tour not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 20:** `const requested = [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 26:** `for (const [field, id, extra] of requested) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 27:** `if (id === undefined || id === null || id === "") continue;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 28:** `if (!validObjectId(id)) return res.status(400).json({ success: false, message: \`Invalid ${field}.\` });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 29:** `const Model = field === "vehicleId" ? Vehicle : Staff;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 30:** `const filter = mergeTenantFilter(req, { _id: id, isDeleted: { $ne: true }, ...(extra || {}) });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 31:** `const resource = await Model.findOne(filter).select("_id").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 32:** `if (!resource) return res.status(404).json({ success: false, message: \`Selected ${field.replace("Id", "")} does not belong to this tenant or is unavailable.\` });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 36:** `return next();` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 38:** `return next(error);` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 7: `const validObjectId = (value) => mongoose.Types.ObjectId.isValid(value);`.
- Line 12: `const tourId = req.params.id || req.body?.tourId;`.
- Line 17: `const tour = await Tour.findOne(mergeTenantFilter(req, { _id: tourId, isDeleted: { $ne: true } })).lean();`.
- Line 20: `const requested = [`.
- Line 29: `const Model = field === "vehicleId" ? Vehicle : Staff;`.
- Line 30: `const filter = mergeTenantFilter(req, { _id: id, isDeleted: { $ne: true }, ...(extra || {}) });`.
- Line 31: `const resource = await Model.findOne(filter).select("_id").lean();`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
