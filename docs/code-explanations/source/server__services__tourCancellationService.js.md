# Source explanation: server/services/tourCancellationService.js

**Source:** [server/services/tourCancellationService.js](../../../server/services/tourCancellationService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Notification` from `../models/Notification.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Notification.js](../../../server/models/Notification.js)
- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `releaseTourResources` from `./tourResourceLifecycleService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/tourResourceLifecycleService.js](../../../server/services/tourResourceLifecycleService.js)

## Runtime declarations and data flow

### `dayIndex` — lines 8–14

Parameters: `tour`, `date`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 9:** `const target = new Date(date); target.setHours(0,0,0,0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 10:** `return (tour.availability || []).findIndex((item) => {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 11:** `const d = new Date(item.date); d.setHours(0,0,0,0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 12:** `return d.getTime() === target.getTime();` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `releaseBookingCapacity` — lines 16–25

Parameters: `tour`, `booking`, `session`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 17:** `const guests = Math.max(1, Number(booking.numberOfGuests || 1));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 18:** `const index = dayIndex(tour, booking.travelDate);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `if (index >= 0) {` — This branch gates the following work on a condition; test both true and false paths when changing it.

### `cancelTourAndBookings` — lines 27–95

Parameters: `{tourId, reason, deleted, userId}`.
Persistent operations detected: Tour.findOne, Booking.find; verify tenant/ownership filters in the exact query. 10 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=false, finally=true. 9 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 29:** `const session = await mongoose.startSession();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 30:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 31:** `let result;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 32:** `await session.withTransaction(async () => {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 33:** `if (!mongoose.Types.ObjectId.isValid(tourId)) throw Object.assign(new Error("Invalid tour ID."), { status: 400 });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 34:** `const tour = await Tour.findOne(mergeTenantFilter({ _id: tourId, isDeleted: { $ne: true } })).session(session);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 35:** `if (!tour) throw Object.assign(new Error("Tour not found."), { status: 404 });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 36:** `if (tour.status === "completed") throw Object.assign(new Error("A completed tour cannot be cancelled."), { status: 409 });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 38:** `const bookings = await Booking.find(mergeTenantFilter({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 44:** `for (const booking of bookings) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 45:** `await releaseBookingCapacity(tour, booking, session);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 50:** `if (Number(booking.amountPaid || 0) > 0) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 57:** `await booking.save({ session });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 66:** `if (deleted) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 71:** `await releaseTourResources(tour, session);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 72:** `await tour.save({ session });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 74:** `if (bookings.length) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 75:** `const recipients = [...new Set(bookings.map((b) => b.user).filter(Boolean).map(String))];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 8: `const dayIndex = (tour, date) => {`.
- Line 9: `const target = new Date(date); target.setHours(0,0,0,0);`.
- Line 11: `const d = new Date(item.date); d.setHours(0,0,0,0);`.
- Line 16: `const releaseBookingCapacity = async (tour, booking, session) => {`.
- Line 17: `const guests = Math.max(1, Number(booking.numberOfGuests || 1));`.
- Line 18: `const index = dayIndex(tour, booking.travelDate);`.
- Line 27: `export const cancelTourAndBookings = async ({ tourId, reason = "Tour cancelled", deleted = false, userId = null }) => {`.
- Line 29: `const session = await mongoose.startSession();`.
- Line 31: `let result;`.
- Line 34: `const tour = await Tour.findOne(mergeTenantFilter({ _id: tourId, isDeleted: { $ne: true } })).session(session);`.
- Line 38: `const bookings = await Booking.find(mergeTenantFilter({`.
- Line 75: `const recipients = [...new Set(bookings.map((b) => b.user).filter(Boolean).map(String))];`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
