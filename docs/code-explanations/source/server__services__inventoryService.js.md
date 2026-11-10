# Source explanation: server/services/inventoryService.js

**Source:** [server/services/inventoryService.js](../../../server/services/inventoryService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)

## Runtime declarations and data flow

### `normalizeDate` — lines 4–9

Parameters: `value`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 5:** `const d = new Date(value);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 6:** `if (Number.isNaN(d.getTime())) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 8:** `return d;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `calendarDateKey` — lines 13–31

Parameters: `value`.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 14:** `if (value instanceof Date && !Number.isNaN(value.getTime())) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 15:** `return [` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 21:** `const raw = String(value ?? "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 22:** `const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `if (match) return \`${match[1]}-${match[2]}-${match[3]}\`;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 24:** `const d = new Date(value);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `if (Number.isNaN(d.getTime())) return "";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 26:** `return [` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `syncDerivedAvailability` — lines 33–43

Parameters: `tour`, `session (defaulted)`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 34:** `const entries = Array.isArray(tour.availability) ? tour.availability : [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `const total = entries.length ? entries.reduce((sum, item) => sum + Number(item.totalSlots || 0), 0) : Number(tour.availabilitySettings?.totalSlots ?? tour.capacity ?? 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 36:** `const booked = entries.length ? entries.reduce((sum, item) => sum + Number(item.bookedSlots || 0), 0) : Number(tour.availabilitySettings?.bookedSlots || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `const hasSpace = entries.length ? entries.some((item) => Number(item.bookedSlots || 0) < Number(item.totalSlots || 0)) : booked < total;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 39:** `if (!hasSpace && total > 0 && !["completed","cancelled"].includes(tour.status)) tour.status = "fully-booked";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 40:** `else if (hasSpace && tour.status === "fully-booked") tour.status = "upcoming";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `await tour.save({ session });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 42:** `return tour;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `sameDay` — lines 45–45

Parameters: `a`, `b`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `tourDateWindow` — lines 47–60

Parameters: `tour`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 48:** `const start = calendarDateKey(tour?.startDate || tour?.date);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 49:** `if (!start) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 50:** `const storedEnd = calendarDateKey(tour?.endDate);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 51:** `const days = Math.max(Number(tour?.durationDays || tour?.durationDetails?.days || tour?.duration || 1), 1);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 52:** `const date = new Date(\`${start}T00:00:00Z\`);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 54:** `const calculatedEnd = calendarDateKey(date);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 56:** `const end = storedEnd && storedEnd >= start && storedEnd >= calculatedEnd` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 59:** `return { start, end };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `isWithinTourWindow` — lines 62–66

Parameters: `tour`, `travelDate`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 63:** `const target = calendarDateKey(travelDate);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 64:** `const window = tourDateWindow(tour);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 65:** `return Boolean(target && window && target >= window.start && target <= window.end);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getDateAvailability` — lines 68–77

Parameters: `tour`, `travelDate`.
5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 69:** `const target = normalizeDate(travelDate);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 70:** `if (!target) throw new Error("A valid travel date is required.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 71:** `const entries = Array.isArray(tour.availability) ? tour.availability : [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 72:** `if (entries.length === 0) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 73:** `const entry = entries.find((item) => sameDay(item.date, travelDate));` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 74:** `if (entry) return entry;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 75:** `if (isWithinTourWindow(tour, travelDate)) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 76:** `throw new Error("The selected travel date is not offered for this tour.");` — Stops the current operation with an error; callers or Express error handling determine the response.

### `validateTourCapacity` — lines 79–91

Parameters: `tourId`, `requestedGuests`, `travelDate`.
Persistent operations detected: Tour.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 81:** `if (!Number.isInteger(requestedGuests) || requestedGuests <= 0) throw new Error("Invalid traveler count.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 82:** `const tour = await Tour.findOne(mergeTenantFilter({ _id: tourId })).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 83:** `if (!tour) throw new Error("Tour not found.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 85:** `const dated = getDateAvailability(tour, travelDate);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 86:** `if (dated) return requestedGuests <= Math.max(Number(dated.totalSlots || 0) - Number(dated.bookedSlots || 0), 0);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 88:** `const totalSlots = Number(tour.availabilitySettings?.totalSlots ?? tour.capacity ?? 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 89:** `const bookedSlots = Number(tour.availabilitySettings?.bookedSlots ?? 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 90:** `return requestedGuests <= Math.max(totalSlots - bookedSlots, 0);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `reserveSlots` — lines 93–135

Parameters: `tourId`, `travelers`, `travelDate`, `session (defaulted)`.
Persistent operations detected: Tour.findOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 13 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 95:** `if (!Number.isInteger(travelers) || travelers <= 0) throw new Error("Invalid traveler count.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 96:** `const target = normalizeDate(travelDate);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 97:** `const current = await Tour.findOne(mergeTenantFilter({ _id: tourId })).session(session).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 98:** `if (!current) throw new Error("Tour not found.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 100:** `if (Array.isArray(current.availability) && current.availability.length) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 101:** `if (!target) throw new Error("A valid travel date is required.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 102:** `const index = current.availability.findIndex((item) => sameDay(item.date, travelDate));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 103:** `if (index < 0) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 104:** `if (!isWithinTourWindow(current, travelDate)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 105:** `throw new Error("The selected travel date is not offered for this tour.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 108:** `const entry = current.availability[index];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 109:** `const totalSlots = Number(entry.totalSlots || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 110:** `const bookedSlots = Number(entry.bookedSlots || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 111:** `if (bookedSlots + travelers > totalSlots) throw new Error("Not enough available tour slots for the selected travel date.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 112:** `const tour = await Tour.findOneAndUpdate(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 120:** `if (!tour) throw new Error("Not enough available tour slots for the selected travel date.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 121:** `return syncDerivedAvailability(tour, session);` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 125:** `const tour = await Tour.findOneAndUpdate(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `releaseSlots` — lines 137–162

Parameters: `tourId`, `travelers`, `travelDate`, `session (defaulted)`.
Persistent operations detected: Tour.findOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 8 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 139:** `if (!Number.isInteger(travelers) || travelers <= 0) throw new Error("Invalid traveler count.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 140:** `const target = normalizeDate(travelDate);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 141:** `const current = await Tour.findOne(mergeTenantFilter({ _id: tourId })).session(session).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 142:** `if (!current) throw new Error("Tour not found.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 144:** `if (Array.isArray(current.availability) && current.availability.length) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 145:** `if (!target) throw new Error("A valid travel date is required.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 146:** `const start = new Date(target); const end = new Date(target); end.setDate(end.getDate() + 1);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 147:** `const tour = await Tour.findOneAndUpdate(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 152:** `if (!tour) throw new Error("Tour travel date not found.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 153:** `const item = tour.availability.find((entry) => sameDay(entry.date, target));` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 154:** `if (item && item.bookedSlots < 0) item.bookedSlots = 0;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 155:** `return syncDerivedAvailability(tour, session);` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 158:** `const tour = await Tour.findOneAndUpdate(mergeTenantFilter({ _id: tourId }), { $inc: { "availabilitySettings.bookedSlots": -travelers } }, { new: true, session });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 159:** `if (!tour) throw new Error("Tour not found.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 160:** `if (tour.availabilitySettings.bookedSlots < 0) tour.availabilitySettings.bookedSlots = 0;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 161:** `return syncDerivedAvailability(tour, session);` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 4: `const normalizeDate = (value) => {`.
- Line 5: `const d = new Date(value);`.
- Line 13: `const calendarDateKey = (value) => {`.
- Line 21: `const raw = String(value ?? "").trim();`.
- Line 22: `const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);`.
- Line 24: `const d = new Date(value);`.
- Line 33: `const syncDerivedAvailability = async (tour, session = null) => {`.
- Line 34: `const entries = Array.isArray(tour.availability) ? tour.availability : [];`.
- Line 35: `const total = entries.length ? entries.reduce((sum, item) => sum + Number(item.totalSlots || 0), 0) : Number(tour.availabilitySettings?.totalSlots ?? tour.capacity ?? 0);`.
- Line 36: `const booked = entries.length ? entries.reduce((sum, item) => sum + Number(item.bookedSlots || 0), 0) : Number(tour.availabilitySettings?.bookedSlots || 0);`.
- Line 37: `const hasSpace = entries.length ? entries.some((item) => Number(item.bookedSlots || 0) < Number(item.totalSlots || 0)) : booked < total;`.
- Line 45: `const sameDay = (a, b) => Boolean(calendarDateKey(a) && calendarDateKey(a) === calendarDateKey(b));`.
- Line 47: `const tourDateWindow = (tour) => {`.
- Line 48: `const start = calendarDateKey(tour?.startDate || tour?.date);`.
- Line 50: `const storedEnd = calendarDateKey(tour?.endDate);`.
- Line 51: `const days = Math.max(Number(tour?.durationDays || tour?.durationDetails?.days || tour?.duration || 1), 1);`.
- Line 52: `const date = new Date(\`${start}T00:00:00Z\`);`.
- Line 54: `const calculatedEnd = calendarDateKey(date);`.
- Line 56: `const end = storedEnd && storedEnd >= start && storedEnd >= calculatedEnd`.
- Line 62: `const isWithinTourWindow = (tour, travelDate) => {`.
- Line 63: `const target = calendarDateKey(travelDate);`.
- Line 64: `const window = tourDateWindow(tour);`.
- Line 68: `const getDateAvailability = (tour, travelDate) => {`.
- Line 69: `const target = normalizeDate(travelDate);`.
- Line 71: `const entries = Array.isArray(tour.availability) ? tour.availability : [];`.
- Line 73: `const entry = entries.find((item) => sameDay(item.date, travelDate));`.
- Line 79: `export const validateTourCapacity = async (tourId, requestedGuests, travelDate) => {`.
- Line 82: `const tour = await Tour.findOne(mergeTenantFilter({ _id: tourId })).lean();`.
- Line 85: `const dated = getDateAvailability(tour, travelDate);`.
- Line 88: `const totalSlots = Number(tour.availabilitySettings?.totalSlots ?? tour.capacity ?? 0);`.
- Line 89: `const bookedSlots = Number(tour.availabilitySettings?.bookedSlots ?? 0);`.
- Line 93: `export const reserveSlots = async (tourId, travelers, travelDate, session = null) => {`.
- Line 96: `const target = normalizeDate(travelDate);`.
- Line 97: `const current = await Tour.findOne(mergeTenantFilter({ _id: tourId })).session(session).lean();`.
- Line 102: `const index = current.availability.findIndex((item) => sameDay(item.date, travelDate));`.
- Line 108: `const entry = current.availability[index];`.
- Line 109: `const totalSlots = Number(entry.totalSlots || 0);`.
- Line 110: `const bookedSlots = Number(entry.bookedSlots || 0);`.
- Line 112: `const tour = await Tour.findOneAndUpdate(`.
- Line 125: `const tour = await Tour.findOneAndUpdate(`.
- Line 137: `export const releaseSlots = async (tourId, travelers, travelDate, session = null) => {`.
- Line 140: `const target = normalizeDate(travelDate);`.
- Line 141: `const current = await Tour.findOne(mergeTenantFilter({ _id: tourId })).session(session).lean();`.
- Line 146: `const start = new Date(target); const end = new Date(target); end.setDate(end.getDate() + 1);`.
- Line 147: `const tour = await Tour.findOneAndUpdate(`.
- Line 153: `const item = tour.availability.find((entry) => sameDay(entry.date, target));`.
- Line 158: `const tour = await Tour.findOneAndUpdate(mergeTenantFilter({ _id: tourId }), { $inc: { "availabilitySettings.bookedSlots": -travelers } }, { new: true, session });`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
