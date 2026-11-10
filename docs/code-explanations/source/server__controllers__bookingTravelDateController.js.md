# Source explanation: server/controllers/bookingTravelDateController.js

**Source:** [server/controllers/bookingTravelDateController.js](../../../server/controllers/bookingTravelDateController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `CustomTourRequest` from `../models/CustomTourRequest.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/CustomTourRequest.js](../../../server/models/CustomTourRequest.js)

## Runtime declarations and data flow

### `startOfDay` — lines 6–11

Parameters: `value`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 7:** `const date = new Date(value);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 8:** `if (Number.isNaN(date.getTime())) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 10:** `return date;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `parseDurationDays` — lines 13–17

Parameters: `value`, `fallback (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 14:** `const match = String(value ?? "").match(/\d+(?:\.\d+)?/);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `const days = match ? Number(match[0]) : Number(fallback);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `return Number.isFinite(days) && days >= 1 ? Math.max(1, Math.round(days)) : 1;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getDurationDays` — lines 19–19

Parameters: `...values`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getAllowedRange` — lines 21–52

Parameters: `booking`.
Persistent operations detected: Tour.findOne, CustomTourRequest.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 22:** `if (booking.tour) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 23:** `const tour = await Tour.findOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 26:** `if (!tour) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 27:** `const start = startOfDay(tour.startDate || tour.date);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 28:** `const storedEnd = startOfDay(tour.endDate);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 29:** `const days = getDurationDays(tour.durationDetails?.days, tour.duration);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 30:** `if (!start) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 31:** `const calculatedEnd = new Date(start);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 33:** `const end = storedEnd && storedEnd > calculatedEnd ? storedEnd : calculatedEnd;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `return { start, end };` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 37:** `if (booking.customTourRequest) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 38:** `const request = await CustomTourRequest.findOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 43:** `if (!request?.startDate) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 44:** `const start = startOfDay(request.startDate);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 45:** `const days = getDurationDays(request.durationDays, request.duration);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 46:** `const end = new Date(start);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 48:** `return { start, end };` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 51:** `return null;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `updateBookingTravelDate` — lines 54–97

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.user, req.body. Persistent operations detected: Booking.findOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 8 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 56:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 57:** `const booking = await Booking.findOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 63:** `if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 64:** `if (["cancelled", "completed", "refunded"].includes(booking.status)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 65:** `return res.status(400).json({ success: false, message: "This booking cannot be changed." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 68:** `const target = startOfDay(req.body?.travelDate);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 69:** `if (!target) return res.status(400).json({ success: false, message: "A valid travel date is required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 71:** `const range = await getAllowedRange(booking);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 72:** `if (!range?.start || !range?.end) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 73:** `return res.status(409).json({ success: false, message: "This booking has no configured travel-date range." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 76:** `if (target < range.start || target > range.end) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 77:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 84:** `if (booking.pickupTime) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 85:** `const pickup = new Date(booking.pickupTime);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 86:** `if (!Number.isNaN(pickup.getTime())) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 87:** `const updatedPickup = new Date(target);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 92:** `await booking.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 93:** `return res.json({ success: true, message: "Travel date updated successfully.", booking });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 6: `const startOfDay = (value) => {`.
- Line 7: `const date = new Date(value);`.
- Line 13: `const parseDurationDays = (value, fallback = 1) => {`.
- Line 14: `const match = String(value ?? "").match(/\d+(?:\.\d+)?/);`.
- Line 15: `const days = match ? Number(match[0]) : Number(fallback);`.
- Line 19: `const getDurationDays = (...values) => Math.max(1, ...values.map((value) => parseDurationDays(value, 1)));`.
- Line 21: `const getAllowedRange = async (booking) => {`.
- Line 23: `const tour = await Tour.findOne(`.
- Line 27: `const start = startOfDay(tour.startDate || tour.date);`.
- Line 28: `const storedEnd = startOfDay(tour.endDate);`.
- Line 29: `const days = getDurationDays(tour.durationDetails?.days, tour.duration);`.
- Line 31: `const calculatedEnd = new Date(start);`.
- Line 33: `const end = storedEnd && storedEnd > calculatedEnd ? storedEnd : calculatedEnd;`.
- Line 38: `const request = await CustomTourRequest.findOne(`.
- Line 44: `const start = startOfDay(request.startDate);`.
- Line 45: `const days = getDurationDays(request.durationDays, request.duration);`.
- Line 46: `const end = new Date(start);`.
- Line 54: `export const updateBookingTravelDate = async (req, res, next) => {`.
- Line 57: `const booking = await Booking.findOne(`.
- Line 68: `const target = startOfDay(req.body?.travelDate);`.
- Line 71: `const range = await getAllowedRange(booking);`.
- Line 85: `const pickup = new Date(booking.pickupTime);`.
- Line 87: `const updatedPickup = new Date(target);`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
