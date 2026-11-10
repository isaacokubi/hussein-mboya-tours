# Source explanation: server/controllers/driverController.js

**Source:** [server/controllers/driverController.js](../../../server/controllers/driverController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Staff` from `../models/Staff.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Staff.js](../../../server/models/Staff.js)

## Runtime declarations and data flow

### `resolveDriver` — lines 8–65

Parameters: `user`.
Persistent operations detected: Staff.findOne, Staff.updateOne; verify tenant/ownership filters in the exact query. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 8 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 9:** `const tenantFilter = mergeTenantFilter({});` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 10:** `const email = String(user.email || "").trim().toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 11:** `let driver = await Staff.findOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 21:** `if (driver) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 22:** `const updates = {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `if (!driver.user || driver.user.toString() !== user._id.toString()) updates.user = user._id;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 24:** `if (driver.position !== "driver") updates.position = "driver";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 25:** `if (driver.role !== "driver") updates.role = "driver";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 26:** `if (!driver.isActive || driver.status !== "active") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 30:** `if (Object.keys(updates).length) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 31:** `await Staff.updateOne(mergeTenantFilter({ _id: driver._id }), { $set: updates });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 34:** `return driver;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 37:** `if (!email) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 39:** `driver = await Staff.findOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 46:** `if (driver) return driver;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 63:** `await driver.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 64:** `return driver;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `driverTourFilter` — lines 67–81

Parameters: `driver`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 68:** `const alternatives = [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 73:** `if (Array.isArray(driver.assignedTours) && driver.assignedTours.length) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 77:** `return mergeTenantFilter({` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `guestCount` — lines 83–85

Parameters: `booking`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `driverDashboard` — lines 87–137

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.user. Persistent operations detected: Tour.find, Booking.aggregate; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 89:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 90:** `const driver = await resolveDriver(req.user);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 91:** `if (!driver) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 92:** `return res.status(404).json({ success: false, message: "Driver profile not found. Ask an administrator to complete the driver account." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 95:** `const tours = await Tour.find(driverTourFilter(driver))` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 103:** `const tourIds = tours.map((tour) => tour._id);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 104:** `const guestStats = tourIds.length` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 105:** `? await Booking.aggregate([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 111:** `const guestMap = new Map(guestStats.map((item) => [item._id.toString(), { guests: item.guests || 0, bookings: item.bookings || 0 }]));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 112:** `const formatted = tours.map((tour) => ({` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 118:** `const assignedVehicle = formatted.find((tour) => tour.assignedVehicle)?.assignedVehicle || null;` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 120:** `return res.status(200).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 6: `const DRIVER_POSITIONS = ["driver", "tour_driver", "tourdriver"];`.
- Line 8: `const resolveDriver = async (user) => {`.
- Line 9: `const tenantFilter = mergeTenantFilter({});`.
- Line 10: `const email = String(user.email || "").trim().toLowerCase();`.
- Line 11: `let driver = await Staff.findOne({`.
- Line 22: `const updates = {};`.
- Line 67: `const driverTourFilter = (driver) => {`.
- Line 68: `const alternatives = [`.
- Line 83: `const guestCount = (booking) => Number(`.
- Line 87: `export const driverDashboard = async (req, res, next) => {`.
- Line 90: `const driver = await resolveDriver(req.user);`.
- Line 95: `const tours = await Tour.find(driverTourFilter(driver))`.
- Line 103: `const tourIds = tours.map((tour) => tour._id);`.
- Line 104: `const guestStats = tourIds.length`.
- Line 111: `const guestMap = new Map(guestStats.map((item) => [item._id.toString(), { guests: item.guests || 0, bookings: item.bookings || 0 }]));`.
- Line 112: `const formatted = tours.map((tour) => ({`.
- Line 118: `const assignedVehicle = formatted.find((tour) => tour.assignedVehicle)?.assignedVehicle || null;`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
