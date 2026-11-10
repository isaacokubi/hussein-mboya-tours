# Source explanation: server/controllers/tourResourceAssignmentController.js

**Source:** [server/controllers/tourResourceAssignmentController.js](../../../server/controllers/tourResourceAssignmentController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `Staff` from `../models/Staff.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Staff.js](../../../server/models/Staff.js)
- `Vehicle` from `../models/Vehicle.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Vehicle.js](../../../server/models/Vehicle.js)
- `getTenantContext`, `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `queueWebhookEvent` from `../services/webhookDeliveryService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/webhookDeliveryService.js](../../../server/services/webhookDeliveryService.js)

## Runtime declarations and data flow

### `idOrNull` — lines 10–10

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `validId` — lines 12–12

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getTourWindow` — lines 14–21

Parameters: `tour`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 15:** `const start = new Date(tour.startDate || tour.date);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `if (Number.isNaN(start.getTime())) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 17:** `const days = Math.max(Number(tour.durationDetails?.days || tour.duration || 1), 1);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 18:** `const end = new Date(start);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `return { start, end };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `hasDateOverlap` — lines 23–28

Parameters: `tour`, `candidate`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 24:** `const a = getTourWindow(tour);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `const b = getTourWindow(candidate);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 26:** `if (!a || !b) return false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 27:** `return a.start < b.end && b.start < a.end;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `assertResourceAvailable` — lines 30–73

Parameters: `Model`, `resourceId`, `field`, `currentTourId`, `candidateTour`, `session`.
Persistent operations detected: Model.findOne, Tour.find; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 31:** `if (!resourceId) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 33:** `const extra = Model === Staff` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `const resource = await Model.findOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 41:** `if (!resource) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 42:** `const label = field.replace("Id", "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 43:** `throw Object.assign(new Error(\`Selected ${label} does not belong to this tenant or is inactive.\`), { status: 400 });` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 46:** `if (Model === Staff && resource.availability !== "available" && String(resource._id) !== String(candidateTour[field === "guideId" ? "assignedGuide" : "assignedDriver"])) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 47:** `throw Object.assign(new Error(\`Selected ${field.replace("Id", "")} is unavailable.\`), { status: 409 });` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 50:** `if (Model === Vehicle && resource.status !== "available" && String(resource._id) !== String(candidateTour.assignedVehicle)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 51:** `throw Object.assign(new Error("Selected vehicle is unavailable."), { status: 409 });` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 54:** `const resourceField = field === "guideId" ? "assignedGuide" : field === "driverId" ? "assignedDriver" : "assignedVehicle";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 55:** `const conflictingTours = await Tour.find(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 64:** `const conflict = conflictingTours.find((tour) => hasDateOverlap(candidateTour, tour));` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 65:** `if (conflict) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 66:** `throw Object.assign(` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 72:** `return resource;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `assignTourResourcesSafe` — lines 75–195

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body, req.user. Persistent operations detected: Tour.findOne, Staff.findOne; verify tenant/ownership filters in the exact query. 17 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 11 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 77:** `const session = await mongoose.startSession();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 79:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 80:** `let response;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 81:** `await session.withTransaction(async () => {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 82:** `const tourId = req.params.id;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 83:** `if (!mongoose.Types.ObjectId.isValid(tourId)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 84:** `throw Object.assign(new Error("Invalid tour ID."), { status: 400 });` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 87:** `const tour = await Tour.findOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 91:** `if (!tour) throw Object.assign(new Error("Tour not found."), { status: 404 });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 93:** `const nextGuideId = idOrNull(req.body?.guideId === undefined ? tour.assignedGuide : req.body.guideId);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 94:** `const nextDriverId = idOrNull(req.body?.driverId === undefined ? tour.assignedDriver : req.body.driverId);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 95:** `const nextVehicleId = idOrNull(req.body?.vehicleId === undefined ? tour.assignedVehicle : req.body.vehicleId);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 97:** `for (const [field, value] of [["guideId", nextGuideId], ["driverId", nextDriverId], ["vehicleId", nextVehicleId]]) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 98:** `if (!validId(value)) throw Object.assign(new Error(\`Invalid ${field}.\`), { status: 400 });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 101:** `const [guide, driver, vehicle] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 107:** `const oldGuideId = tour.assignedGuide ? String(tour.assignedGuide) : null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 108:** `const oldDriverId = tour.assignedDriver ? String(tour.assignedDriver) : null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 109:** `const oldVehicleId = tour.assignedVehicle ? String(tour.assignedVehicle) : null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `releaseStaff` — lines 117–124

Parameters: `id`, `nextId`.
Persistent operations detected: Staff.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 118:** `if (!id || id === String(nextId || "")) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 119:** `const staff = await Staff.findOne(mergeTenantFilter({ _id: id })).session(session);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 120:** `if (!staff) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 122:** `if (staff.assignedTours.length === 0) staff.availability = "available";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 123:** `await staff.save({ session });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `assignStaff` — lines 137–144

Parameters: `resource`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 138:** `if (!resource) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 139:** `await Staff.findOneAndUpdate(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

## Module-level declarations

- Line 8: `const ACTIVE_TOUR_STATUSES = new Set(["scheduled", "upcoming", "confirmed", "active", "ongoing"]);`.
- Line 10: `const idOrNull = (value) => (value === undefined || value === null || value === "" ? null : value);`.
- Line 12: `const validId = (value) => value == null || mongoose.Types.ObjectId.isValid(value);`.
- Line 14: `const getTourWindow = (tour) => {`.
- Line 15: `const start = new Date(tour.startDate || tour.date);`.
- Line 17: `const days = Math.max(Number(tour.durationDetails?.days || tour.duration || 1), 1);`.
- Line 18: `const end = new Date(start);`.
- Line 23: `const hasDateOverlap = (tour, candidate) => {`.
- Line 24: `const a = getTourWindow(tour);`.
- Line 25: `const b = getTourWindow(candidate);`.
- Line 33: `const extra = Model === Staff`.
- Line 37: `const resource = await Model.findOne(`.
- Line 42: `const label = field.replace("Id", "");`.
- Line 54: `const resourceField = field === "guideId" ? "assignedGuide" : field === "driverId" ? "assignedDriver" : "assignedVehicle";`.
- Line 55: `const conflictingTours = await Tour.find(`.
- Line 64: `const conflict = conflictingTours.find((tour) => hasDateOverlap(candidateTour, tour));`.
- Line 75: `export const assignTourResourcesSafe = async (req, res, next) => {`.
- Line 77: `const session = await mongoose.startSession();`.
- Line 80: `let response;`.
- Line 82: `const tourId = req.params.id;`.
- Line 87: `const tour = await Tour.findOne(`.
- Line 93: `const nextGuideId = idOrNull(req.body?.guideId === undefined ? tour.assignedGuide : req.body.guideId);`.
- Line 94: `const nextDriverId = idOrNull(req.body?.driverId === undefined ? tour.assignedDriver : req.body.driverId);`.
- Line 95: `const nextVehicleId = idOrNull(req.body?.vehicleId === undefined ? tour.assignedVehicle : req.body.vehicleId);`.
- Line 101: `const [guide, driver, vehicle] = await Promise.all([`.
- Line 107: `const oldGuideId = tour.assignedGuide ? String(tour.assignedGuide) : null;`.
- Line 108: `const oldDriverId = tour.assignedDriver ? String(tour.assignedDriver) : null;`.
- Line 109: `const oldVehicleId = tour.assignedVehicle ? String(tour.assignedVehicle) : null;`.
- Line 117: `const releaseStaff = async (id, nextId) => {`.
- Line 119: `const staff = await Staff.findOne(mergeTenantFilter({ _id: id })).session(session);`.
- Line 137: `const assignStaff = async (resource) => {`.
- Line 157: `const updatedTour = await Tour.findOne(mergeTenantFilter({ _id: tour._id }))`.
- Line 169: `const tenantId = getTenantContext()?.tenantId;`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
