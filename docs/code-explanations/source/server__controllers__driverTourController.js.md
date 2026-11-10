# Source explanation: server/controllers/driverTourController.js

**Source:** [server/controllers/driverTourController.js](../../../server/controllers/driverTourController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Staff` from `../models/Staff.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Staff.js](../../../server/models/Staff.js)

## Runtime declarations and data flow

### `startOfDay` — lines 6–6

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `tourStart` — lines 7–7

Parameters: `tour`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `tourEnd` — lines 8–8

Parameters: `tour`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `resolveDriver` — lines 9–9

Parameters: `user`.
Persistent operations detected: Staff.findOne; verify tenant/ownership filters in the exact query.

Key statements:
- **Line 9:** `(user) => Staff.findOne(mergeTenantFilter({ $or: [{ user: user._id }, { email: String(user.email || "").toLowerCase() }], position: "driver", isDeleted: { $ne: true } }))` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.

### `assigned` — lines 10–10

Parameters: `driver`, `id`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `addGuestCounts` — lines 12–21

Parameters: `tours`.
Persistent operations detected: Booking.aggregate; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 13:** `if (!tours.length) return tours;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 14:** `const tourIds = tours.map((tour) => tour._id);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `const stats = await Booking.aggregate([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 19:** `const map = new Map(stats.map((item) => [item._id.toString(), { guests: Number(item.guests) || 0, bookings: Number(item.bookings) || 0 }]));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `return tours.map((tour) => ({ ...tour.toObject ? tour.toObject() : tour, ...(map.get(tour._id.toString()) || { guests: 0, bookings: 0 }) }));` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getAssignedTours` — lines 23–26

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.user. Persistent operations detected: Tour.find; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 25:** `try { const driver = await resolveDriver(req.user); if (!driver) return res.status(404).json({ success:false, message:"Driver profile not found" }); const tours = await Tour.find(mergeTenantFilter({ assignedDriver:driver` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.

### `getTourDetails` — lines 28–31

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.user, req.params. Persistent operations detected: Tour.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 30:** `try { const driver = await resolveDriver(req.user); if (!driver) return res.status(404).json({ success:false, message:"Driver profile not found" }); const tour = await Tour.findOne(assigned(driver, req.params.id)).popula` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.

### `getTourGuests` — lines 33–36

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.user, req.params. Persistent operations detected: Tour.findOne, Booking.find; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 35:** `try { const driver = await resolveDriver(req.user); if (!driver) return res.status(404).json({ success:false, message:"Driver profile not found" }); const tour = await Tour.findOne(assigned(driver, req.params.id)); if (!` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.

### `updateTourStatus` — lines 38–49

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user, req.params. Persistent operations detected: Tour.findOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 9 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 40:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 41:** `const { status } = req.body; if (!["ongoing","completed"].includes(status)) return res.status(400).json({ success:false, message:"Driver may only start or complete a tour" });` — Builds an HTTP response with an explicit status and JSON payload.
- **Line 42:** `const driver = await resolveDriver(req.user); if (!driver) return res.status(404).json({ success:false, message:"Driver profile not found" });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 43:** `const tour = await Tour.findOne(assigned(driver, req.params.id)); if (!tour) return res.status(404).json({ success:false, message:"Tour not found or not assigned to you" });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 44:** `const today = startOfDay(new Date()), start = startOfDay(tourStart(tour)), end = startOfDay(tourEnd(tour));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 45:** `if (status === "ongoing") { if (today.getTime() !== start.getTime()) return res.status(400).json({ success:false, message:\`This tour can only be started on ${start.toLocaleDateString()}.\` }); if (!["scheduled","upcomin` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 46:** `if (status === "completed") { if (today < end) return res.status(400).json({ success:false, message:"This tour cannot be completed before its final day." }); if (tour.status !== "ongoing") return res.status(400).json({ s` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 47:** `tour.status = status; await tour.save(); res.json({ success:true, message:"Tour status updated successfully", tour, data:{ tour } });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

## Module-level declarations

- Line 6: `const startOfDay = (value) => { const d = new Date(value); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); };`.
- Line 7: `const tourStart = (tour) => new Date(tour.startDate || tour.date || tour.travelDate);`.
- Line 8: `const tourEnd = (tour) => { if (tour.endDate) return new Date(tour.endDate); const d = new Date(tourStart(tour)); const days = Math.max(1, Number(tour.durationDetails?.days || tour`.
- Line 9: `const resolveDriver = (user) => Staff.findOne(mergeTenantFilter({ $or: [{ user: user._id }, { email: String(user.email || "").toLowerCase() }], position: "driver", isDeleted: { $ne`.
- Line 10: `const assigned = (driver, id) => mergeTenantFilter({ _id: id, assignedDriver: driver._id, isDeleted: { $ne: true } });`.
- Line 12: `const addGuestCounts = async (tours) => {`.
- Line 14: `const tourIds = tours.map((tour) => tour._id);`.
- Line 15: `const stats = await Booking.aggregate([`.
- Line 19: `const map = new Map(stats.map((item) => [item._id.toString(), { guests: Number(item.guests) || 0, bookings: Number(item.bookings) || 0 }]));`.
- Line 23: `export const getAssignedTours = async (req, res, next) => {`.
- Line 28: `export const getTourDetails = async (req, res, next) => {`.
- Line 33: `export const getTourGuests = async (req, res, next) => {`.
- Line 38: `export const updateTourStatus = async (req, res, next) => {`.
- Line 41: `const { status } = req.body; if (!["ongoing","completed"].includes(status)) return res.status(400).json({ success:false, message:"Driver may only start or complete a tour" });`.
- Line 42: `const driver = await resolveDriver(req.user); if (!driver) return res.status(404).json({ success:false, message:"Driver profile not found" });`.
- Line 43: `const tour = await Tour.findOne(assigned(driver, req.params.id)); if (!tour) return res.status(404).json({ success:false, message:"Tour not found or not assigned to you" });`.
- Line 44: `const today = startOfDay(new Date()), start = startOfDay(tourStart(tour)), end = startOfDay(tourEnd(tour));`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
