# Source explanation: server/middleware/validateBookingTravelDate.js

**Source:** [server/middleware/validateBookingTravelDate.js](../../../server/middleware/validateBookingTravelDate.js)

## Purpose

Express middleware that runs in a request pipeline, inspecting or enriching the request, rejecting it, or calling next().

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `CustomTourRequest` from `../models/CustomTourRequest.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/CustomTourRequest.js](../../../server/models/CustomTourRequest.js)

## Runtime declarations and data flow

### `startOfDay` — lines 5–10

Parameters: `value`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 6:** `const date = new Date(value);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 7:** `if (Number.isNaN(date.getTime())) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 9:** `return date;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `parseDurationDays` — lines 12–16

Parameters: `value`, `fallback (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 13:** `const match = String(value ?? "").match(/\d+(?:\.\d+)?/);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 14:** `const days = match ? Number(match[0]) : Number(fallback);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `return Number.isFinite(days) && days >= 1 ? Math.max(1, Math.round(days)) : 1;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getDurationDays` — lines 18–18

Parameters: `...values`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `validateBookingTravelDate` — lines 20–86

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user. Persistent operations detected: Tour.findOne, CustomTourRequest.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 17 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 21:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 22:** `if (!req.body?.travelDate) return next();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 25:** `let start = null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 26:** `let end = null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 27:** `let label = "tour";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 29:** `if (req.body.tour) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 30:** `const tour = await Tour.findOne(mergeTenantFilter({ _id: req.body.tour }))` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 33:** `if (!tour) return res.status(404).json({ success: false, message: "Tour not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 36:** `const days = getDurationDays(tour.durationDays, tour.durationDetails?.days, tour.duration);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `if (start) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 44:** `const request = await CustomTourRequest.findOne(mergeTenantFilter({ _id: req.body.customTourRequest, customer: req.user._id }))` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 47:** `if (!request) return res.status(404).json({ success: false, message: "Custom tour request not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 48:** `if (!request.startDate) return res.status(400).json({ success: false, message: "The custom tour does not have a start date." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 52:** `const days = getDurationDays(request.durationDays, request.duration);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 56:** `return next();` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 59:** `const target = startOfDay(req.body.travelDate);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 60:** `if (!target || !start || !end) return res.status(400).json({ success: false, message: \`This ${label} does not have a valid travel-date range configured.\` });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 62:** `if (target < start || target > end) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 5: `const startOfDay = (value) => {`.
- Line 6: `const date = new Date(value);`.
- Line 12: `const parseDurationDays = (value, fallback = 1) => {`.
- Line 13: `const match = String(value ?? "").match(/\d+(?:\.\d+)?/);`.
- Line 14: `const days = match ? Number(match[0]) : Number(fallback);`.
- Line 18: `const getDurationDays = (...values) => { for (const value of values) { if (value !== undefined && value !== null && String(value).trim() !== "") return parseDurationDays(value, 1);`.
- Line 20: `export const validateBookingTravelDate = async (req, res, next) => {`.
- Line 25: `let start = null;`.
- Line 26: `let end = null;`.
- Line 27: `let label = "tour";`.
- Line 30: `const tour = await Tour.findOne(mergeTenantFilter({ _id: req.body.tour }))`.
- Line 36: `const days = getDurationDays(tour.durationDays, tour.durationDetails?.days, tour.duration);`.
- Line 44: `const request = await CustomTourRequest.findOne(mergeTenantFilter({ _id: req.body.customTourRequest, customer: req.user._id }))`.
- Line 52: `const days = getDurationDays(request.durationDays, request.duration);`.
- Line 59: `const target = startOfDay(req.body.travelDate);`.
- Line 70: `const pickup = new Date(req.body.pickupTime);`.
- Line 71: `const pickupDay = startOfDay(pickup);`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
