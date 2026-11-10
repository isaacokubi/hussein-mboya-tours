# Source explanation: server/controllers/tourCrudController.js

**Source:** [server/controllers/tourCrudController.js](../../../server/controllers/tourCrudController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `Staff` from `../models/Staff.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Staff.js](../../../server/models/Staff.js)
- `Vehicle` from `../models/Vehicle.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Vehicle.js](../../../server/models/Vehicle.js)
- `Destination` from `../models/Destination.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Destination.js](../../../server/models/Destination.js)
- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `cancelTourAndBookings` from `../services/tourCancellationService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/tourCancellationService.js](../../../server/services/tourCancellationService.js)

## Runtime declarations and data flow

### `parseDuration` — lines 12–17

Parameters: `value`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 13:** `const match = String(value ?? "").match(/\d+(?:\.\d+)?/);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 14:** `const days = Number(match?.[0]);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `if (!Number.isFinite(days) || days < 1 || days > 365) throw Object.assign(new Error("Duration must be a whole number of days between 1 and 365."), { status: 400 });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 16:** `return Math.floor(days);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `tourWindow` — lines 19–26

Parameters: `tour`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 20:** `const start = new Date(tour.startDate || tour.date);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `if (Number.isNaN(start.getTime())) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 22:** `const days = Math.max(Number(tour.durationDays || tour.durationDetails?.days || tour.duration || 1), 1);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `const end = new Date(start);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `return { start, end };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `overlaps` — lines 28–31

Parameters: `a`, `b`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 29:** `const left = tourWindow(a); const right = tourWindow(b);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 30:** `return Boolean(left && right && left.start < right.end && right.start < left.end);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getResource` — lines 33–38

Parameters: `Model`, `id`, `filter`, `session`.
Persistent operations detected: Model.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 34:** `if (!id) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 35:** `const doc = await Model.findOne(mergeTenantFilter(filter)).session(session);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 36:** `if (!doc) throw Object.assign(new Error("Selected resource does not belong to this tenant or is inactive."), { status: 400 });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 37:** `return doc;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `assertAssignments` — lines 40–55

Parameters: `{guideId, driverId, vehicleId, tour, session}`.
Persistent operations detected: Tour.find; verify tenant/ownership filters in the exact query. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 41:** `const guide = guideId ? await getResource(Staff, guideId, { _id: guideId, position: { $in: ["guide","tour_guide","tourguide"] }, isActive: true, isDeleted: { $ne: true } }, session) : null;` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 42:** `const driver = driverId ? await getResource(Staff, driverId, { _id: driverId, position: "driver", isActive: true, isDeleted: { $ne: true } }, session) : null;` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 43:** `const vehicle = vehicleId ? await getResource(Vehicle, vehicleId, { _id: vehicleId, isActive: true, isDeleted: { $ne: true } }, session) : null;` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 44:** `if (guide && guide.availability !== "available") throw Object.assign(new Error("Selected guide is unavailable."), { status: 409 });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 45:** `if (driver && driver.availability !== "available") throw Object.assign(new Error("Selected driver is unavailable."), { status: 409 });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 46:** `if (vehicle && vehicle.status !== "available") throw Object.assign(new Error("Selected vehicle is unavailable."), { status: 409 });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 47:** `for (const [field, id] of [["assignedGuide", guide?._id], ["assignedDriver", driver?._id], ["assignedVehicle", vehicle?._id]]) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 48:** `if (!id) continue;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 49:** `const conflicts = await Tour.find(mergeTenantFilter({ _id: { $ne: tour._id }, isDeleted: { $ne: true }, status: { $in: ACTIVE_STATUSES }, [field]: id })).select("_id date startDate duration durationDays durationDetails")` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 50:** `if (conflicts.some((candidate) => overlaps(tour, candidate))) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 51:** `throw Object.assign(new Error(\`Selected ${field.replace("assigned","").toLowerCase()} is already assigned to another overlapping tour.\`), { status: 409, code: "RESOURCE_DOUBLE_BOOKED" });` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 54:** `return { guide, driver, vehicle };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `applyResourceState` — lines 57–62

Parameters: `{tour, resources, session}`.
3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 58:** `const { guide, driver, vehicle } = resources;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 59:** `if (guide) { guide.availability = "busy"; guide.assignedTours = [...new Set([...(guide.assignedTours || []).map(String), String(tour._id)])]; await guide.save({ session }); }` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 60:** `if (driver) { driver.availability = "busy"; driver.assignedTours = [...new Set([...(driver.assignedTours || []).map(String), String(tour._id)])]; await driver.save({ session }); }` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 61:** `if (vehicle) { vehicle.status = "assigned"; vehicle.assignedTour = tour._id; await vehicle.save({ session }); }` — This branch gates the following work on a condition; test both true and false paths when changing it.

### `parseStructuredField` — lines 64–78

Parameters: `value`, `field`.
Error control: try=true, catch=true, finally=false. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 65:** `if (typeof value !== "string") return value;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 66:** `const trimmed = value.trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 67:** `if (!trimmed) return [];` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 68:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 69:** `const parsed = JSON.parse(trimmed);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 70:** `if (!Array.isArray(parsed) && !["highlights", "inclusions", "exclusions", "languages", "tags"].includes(field)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 71:** `throw new Error(\`${field} must be a JSON array.\`);` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 73:** `return parsed;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 75:** `if (error.message?.includes("must be a JSON array")) throw Object.assign(error, { status: 400 });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 76:** `throw Object.assign(new Error(\`Invalid JSON supplied for tour field: ${field}.\`), { status: 400 });` — Stops the current operation with an error; callers or Express error handling determine the response.

### `normalizedPayload` — lines 80–144

Parameters: `body`, `files`, `userId`, `existing (defaulted)`.
19 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 81:** `const normalizedBody = { ...body };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 82:** `for (const field of ["highlights", "inclusions", "exclusions", "languages", "tags", "itinerary", "availability", "pricingRules"]) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 83:** `if (typeof normalizedBody[field] === "string") normalizedBody[field] = parseStructuredField(normalizedBody[field], field);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 85:** `for (const field of ["published", "available", "featured", "instantBooking", "taxEnabled"]) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 86:** `if (typeof normalizedBody[field] === "string") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 87:** `if (!["true", "false"].includes(normalizedBody[field].toLowerCase())) throw Object.assign(new Error(\`${field} must be true or false.\`), { status: 400 });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 91:** `const source = existing ? { ...existing.toObject(), ...normalizedBody } : normalizedBody;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 92:** `const payload = {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 93:** `for (const field of MUTABLE_FIELDS) if (Object.prototype.hasOwnProperty.call(source, field)) payload[field] = source[field];` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 94:** `if (!payload.title?.trim() || !payload.description?.trim() || !payload.destination || !payload.country?.trim() || !payload.location?.trim()) throw Object.assign(new Error("Title, description, destination, country and loc` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 95:** `if (!payload.date && !payload.startDate) throw Object.assign(new Error("A tour date or startDate is required."), { status: 400 });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 96:** `if (payload.price === undefined || !Number.isFinite(Number(payload.price)) || Number(payload.price) < 0) throw Object.assign(new Error("A valid non-negative price is required."), { status: 400 });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 97:** `const requestedDuration = Object.prototype.hasOwnProperty.call(body, "durationDays")` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 104:** `const durationDays = parseDuration(requestedDuration);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 108:** `const startValue = payload.startDate || payload.date;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 109:** `if (startValue) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 110:** `const startDate = new Date(startValue);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 111:** `if (!Number.isNaN(startDate.getTime())) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `createTour` — lines 146–173

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user. Persistent operations detected: Destination.findOne, Tour.create, Tour.findOne; verify tenant/ownership filters in the exact query. 8 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 148:** `const session = await mongoose.startSession();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 149:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 150:** `let created;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 151:** `await session.withTransaction(async () => {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 152:** `const payload = normalizedPayload(req.body || {}, req.files || [], req.user?._id);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 153:** `const destination = await Destination.findOne(mergeTenantFilter({ _id: payload.destination, isDeleted: { $ne: true } })).session(session);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 154:** `if (!destination) throw Object.assign(new Error("The selected destination does not belong to this tenant."), { status: 400 });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 155:** `const resources = await assertAssignments({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 166:** `[created] = await Tour.create([payload], { session });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 167:** `await applyResourceState({ tour: created, resources, session });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 169:** `const tour = await Tour.findOne(mergeTenantFilter({ _id: created._id })).populate("destination assignedGuide assignedDriver assignedVehicle").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 170:** `return res.status(201).json({ success: true, message: "Tour created successfully.", data: tour, tour });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 172:** `finally { await session.endSession(); }` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `updateTour` — lines 175–188

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body, req.user. Persistent operations detected: Tour.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 177:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 178:** `if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid tour ID." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 179:** `const existing = await Tour.findOne(mergeTenantFilter({ _id: req.params.id, isDeleted: { $ne: true } }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 180:** `if (!existing) return res.status(404).json({ success: false, message: "Tour not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 181:** `if (["assignedGuide","assignedDriver","assignedVehicle","guide","driver","vehicle"].some((key) => req.body?.[key] !== undefined)) return res.status(400).json({ success: false, message: "Use the dedicated tour resource as` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 182:** `const payload = normalizedPayload(req.body || {}, req.files || [], req.user?._id, existing);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 185:** `const updated = await Tour.findOneAndUpdate(mergeTenantFilter({ _id: existing._id }), payload, { new: true, runValidators: true }).populate("destination assignedGuide assignedDriver assignedVehicle").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 186:** `return res.json({ success: true, message: "Tour updated successfully.", data: updated, tour: updated });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `deleteTour` — lines 190–197

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body, req.user. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 192:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 193:** `if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid tour ID." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 194:** `const result = await cancelTourAndBookings({ tourId: req.params.id, reason: req.body?.reason || "Tour deleted/cancelled", deleted: true, userId: req.user?._id || null });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 195:** `return res.json({ success: true, message: "Tour deleted after cancelling/reconciling active bookings.", data: result.tour, bookingsAffected: result.bookingsAffected });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `setPublication` — lines 199–209

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 201:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 202:** `if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid tour ID." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 203:** `const published = req.body?.published;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 204:** `if (typeof published !== "boolean" && !["true","false"].includes(String(published))) return res.status(400).json({ success: false, message: "published must be a boolean." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 205:** `const tour = await Tour.findOneAndUpdate(mergeTenantFilter({ _id: req.params.id, isDeleted: { $ne: true } }), { $set: { published: String(published) === "true" } }, { new: true, runValidators: true }).populate("destinati` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 206:** `if (!tour) return res.status(404).json({ success: false, message: "Tour not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 207:** `return res.json({ success: true, message: \`Tour ${tour.published ? "published" : "unpublished"} successfully.\`, data: tour, tour });` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 9: `const ACTIVE_STATUSES = ["scheduled", "upcoming", "confirmed", "active", "ongoing"];`.
- Line 10: `const MUTABLE_FIELDS = ["title","description","shortDescription","slug","tags","category","destination","country","location","meetingPoint","coordinates","duration","durationDays",`.
- Line 12: `const parseDuration = (value) => {`.
- Line 13: `const match = String(value ?? "").match(/\d+(?:\.\d+)?/);`.
- Line 14: `const days = Number(match?.[0]);`.
- Line 19: `const tourWindow = (tour) => {`.
- Line 20: `const start = new Date(tour.startDate || tour.date);`.
- Line 22: `const days = Math.max(Number(tour.durationDays || tour.durationDetails?.days || tour.duration || 1), 1);`.
- Line 23: `const end = new Date(start);`.
- Line 28: `const overlaps = (a, b) => {`.
- Line 29: `const left = tourWindow(a); const right = tourWindow(b);`.
- Line 33: `const getResource = async (Model, id, filter, session) => {`.
- Line 35: `const doc = await Model.findOne(mergeTenantFilter(filter)).session(session);`.
- Line 40: `const assertAssignments = async ({ guideId, driverId, vehicleId, tour, session }) => {`.
- Line 41: `const guide = guideId ? await getResource(Staff, guideId, { _id: guideId, position: { $in: ["guide","tour_guide","tourguide"] }, isActive: true, isDeleted: { $ne: true } }, session`.
- Line 42: `const driver = driverId ? await getResource(Staff, driverId, { _id: driverId, position: "driver", isActive: true, isDeleted: { $ne: true } }, session) : null;`.
- Line 43: `const vehicle = vehicleId ? await getResource(Vehicle, vehicleId, { _id: vehicleId, isActive: true, isDeleted: { $ne: true } }, session) : null;`.
- Line 49: `const conflicts = await Tour.find(mergeTenantFilter({ _id: { $ne: tour._id }, isDeleted: { $ne: true }, status: { $in: ACTIVE_STATUSES }, [field]: id })).select("_id date startDate`.
- Line 57: `const applyResourceState = async ({ tour, resources, session }) => {`.
- Line 58: `const { guide, driver, vehicle } = resources;`.
- Line 64: `const parseStructuredField = (value, field) => {`.
- Line 66: `const trimmed = value.trim();`.
- Line 69: `const parsed = JSON.parse(trimmed);`.
- Line 80: `const normalizedPayload = (body, files, userId, existing = null) => {`.
- Line 81: `const normalizedBody = { ...body };`.
- Line 91: `const source = existing ? { ...existing.toObject(), ...normalizedBody } : normalizedBody;`.
- Line 92: `const payload = {};`.
- Line 97: `const requestedDuration = Object.prototype.hasOwnProperty.call(body, "durationDays")`.
- Line 104: `const durationDays = parseDuration(requestedDuration);`.
- Line 108: `const startValue = payload.startDate || payload.date;`.
- Line 110: `const startDate = new Date(startValue);`.
- Line 113: `const calculatedEnd = new Date(startDate);`.
- Line 116: `const requestedEnd = new Date(body.endDate);`.
- Line 132: `const images = files.filter((file) => file?.path).map((file) => ({ url: file.path, publicId: file.filename || file.public_id || "" }));`.
- Line 146: `export const createTour = async (req, res, next) => {`.
- Line 148: `const session = await mongoose.startSession();`.
- Line 150: `let created;`.
- Line 152: `const payload = normalizedPayload(req.body || {}, req.files || [], req.user?._id);`.
- Line 153: `const destination = await Destination.findOne(mergeTenantFilter({ _id: payload.destination, isDeleted: { $ne: true } })).session(session);`.
- Line 155: `const resources = await assertAssignments({`.
- Line 169: `const tour = await Tour.findOne(mergeTenantFilter({ _id: created._id })).populate("destination assignedGuide assignedDriver assignedVehicle").lean();`.
- Line 175: `export const updateTour = async (req, res, next) => {`.
- Line 179: `const existing = await Tour.findOne(mergeTenantFilter({ _id: req.params.id, isDeleted: { $ne: true } }));`.
- Line 182: `const payload = normalizedPayload(req.body || {}, req.files || [], req.user?._id, existing);`.
- Line 185: `const updated = await Tour.findOneAndUpdate(mergeTenantFilter({ _id: existing._id }), payload, { new: true, runValidators: true }).populate("destination assignedGuide assignedDrive`.
- Line 190: `export const deleteTour = async (req, res, next) => {`.
- Line 194: `const result = await cancelTourAndBookings({ tourId: req.params.id, reason: req.body?.reason || "Tour deleted/cancelled", deleted: true, userId: req.user?._id || null });`.
- Line 199: `export const setPublication = async (req, res, next) => {`.
- Line 203: `const published = req.body?.published;`.
- Line 205: `const tour = await Tour.findOneAndUpdate(mergeTenantFilter({ _id: req.params.id, isDeleted: { $ne: true } }), { $set: { published: String(published) === "true" } }, { new: true, ru`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
