# Source explanation: server/controllers/tourLifecycleController.js

**Source:** [server/controllers/tourLifecycleController.js](../../../server/controllers/tourLifecycleController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `releaseTourResources` from `../services/tourResourceLifecycleService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/tourResourceLifecycleService.js](../../../server/services/tourResourceLifecycleService.js)
- `cancelTourAndBookings` from `../services/tourCancellationService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/tourCancellationService.js](../../../server/services/tourCancellationService.js)

## Runtime declarations and data flow

### `bookingGuests` — lines 8–8

Parameters: `booking`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `completeTour` — lines 10–31

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: Tour.findOne; verify tenant/ownership filters in the exact query. 5 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 12:** `const session = await mongoose.startSession();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 13:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 14:** `let result;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `await session.withTransaction(async () => {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 16:** `if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw Object.assign(new Error("Invalid tour ID."), { status: 400 });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 17:** `const tour = await Tour.findOne(mergeTenantFilter({ _id: req.params.id, isDeleted: { $ne: true } })).session(session);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 18:** `if (!tour) throw Object.assign(new Error("Tour not found."), { status: 404 });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 19:** `if (tour.status === "completed") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 21:** `return;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 25:** `await releaseTourResources(tour, session);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 28:** `return res.status(200).json(result);` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 30:** `finally { await session.endSession(); }` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `cancelTour` — lines 33–43

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body, req.user. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 34:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 35:** `const result = await cancelTourAndBookings({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 41:** `return res.status(200).json({ success: true, message: "Tour cancelled, bookings reconciled and resources released.", data: result.tour, bookingsAffected: result.bookingsAffected });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `completeBookingAndMaybeRelease` — lines 45–93

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: Booking.findOne, Booking.countDocuments, Tour.findOne; verify tenant/ownership filters in the exact query. 9 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 8 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 47:** `const session = await mongoose.startSession();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 48:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 49:** `let result;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 50:** `await session.withTransaction(async () => {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 51:** `if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw Object.assign(new Error("Invalid booking ID."), { status: 400 });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 52:** `const booking = await Booking.findOne(mergeTenantFilter({ _id: req.params.id })).session(session);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 53:** `if (!booking) throw Object.assign(new Error("Booking not found."), { status: 404 });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 54:** `if (["cancelled", "refunded"].includes(booking.status)) throw Object.assign(new Error(\`A ${booking.status} booking cannot be completed.\`), { status: 400 });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 55:** `if (booking.status !== "completed") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 56:** `if (booking.paymentStatus !== "paid") throw Object.assign(new Error("Only paid bookings can be marked as completed."), { status: 400 });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 59:** `await booking.save({ session });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 62:** `if (booking.tour) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 63:** `const remaining = await Booking.countDocuments(mergeTenantFilter({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 69:** `if (remaining === 0) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 70:** `const tour = await Tour.findOne(mergeTenantFilter({ _id: booking.tour, isDeleted: { $ne: true } })).session(session);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 71:** `if (tour) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 74:** `await releaseTourResources(tour, session);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 79:** `const updated = await Booking.findOne(mergeTenantFilter({ _id: booking._id }))` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `cancelBookingAndUpdateCapacity` — lines 95–126

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.user, req.body. Persistent operations detected: Booking.findOne, Tour.findOne; verify tenant/ownership filters in the exact query. 7 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 97:** `const session = await mongoose.startSession();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 98:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 99:** `let result;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 100:** `await session.withTransaction(async () => {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 101:** `if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw Object.assign(new Error("Invalid booking ID."), { status: 400 });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 102:** `const booking = await Booking.findOne(mergeTenantFilter({ _id: req.params.id })).session(session);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 103:** `if (!booking) throw Object.assign(new Error("Booking not found."), { status: 404 });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 104:** `if (["cancelled", "refunded", "completed"].includes(booking.status)) throw Object.assign(new Error(\`A ${booking.status} booking cannot be cancelled.\`), { status: 400 });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 110:** `await booking.save({ session });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 112:** `if (booking.tour) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 113:** `const tour = await Tour.findOne(mergeTenantFilter({ _id: booking.tour, isDeleted: { $ne: true } })).session(session);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 114:** `if (tour) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 116:** `const current = Number(tour.availabilitySettings.bookedSlots || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 118:** `await tour.save({ session });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 123:** `return res.status(200).json(result);` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 125:** `finally { await session.endSession(); }` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

## Module-level declarations

- Line 8: `const bookingGuests = (booking) => Number(booking.numberOfGuests || booking.guests || booking.numberOfPeople || 1);`.
- Line 10: `export const completeTour = async (req, res, next) => {`.
- Line 12: `const session = await mongoose.startSession();`.
- Line 14: `let result;`.
- Line 17: `const tour = await Tour.findOne(mergeTenantFilter({ _id: req.params.id, isDeleted: { $ne: true } })).session(session);`.
- Line 33: `export const cancelTour = async (req, res, next) => {`.
- Line 35: `const result = await cancelTourAndBookings({`.
- Line 45: `export const completeBookingAndMaybeRelease = async (req, res, next) => {`.
- Line 47: `const session = await mongoose.startSession();`.
- Line 49: `let result;`.
- Line 52: `const booking = await Booking.findOne(mergeTenantFilter({ _id: req.params.id })).session(session);`.
- Line 63: `const remaining = await Booking.countDocuments(mergeTenantFilter({`.
- Line 70: `const tour = await Tour.findOne(mergeTenantFilter({ _id: booking.tour, isDeleted: { $ne: true } })).session(session);`.
- Line 79: `const updated = await Booking.findOne(mergeTenantFilter({ _id: booking._id }))`.
- Line 95: `export const cancelBookingAndUpdateCapacity = async (req, res, next) => {`.
- Line 97: `const session = await mongoose.startSession();`.
- Line 99: `let result;`.
- Line 102: `const booking = await Booking.findOne(mergeTenantFilter({ _id: req.params.id })).session(session);`.
- Line 113: `const tour = await Tour.findOne(mergeTenantFilter({ _id: booking.tour, isDeleted: { $ne: true } })).session(session);`.
- Line 116: `const current = Number(tour.availabilitySettings.bookedSlots || 0);`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
