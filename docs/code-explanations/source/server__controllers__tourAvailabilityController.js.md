# Source explanation: server/controllers/tourAvailabilityController.js

**Source:** [server/controllers/tourAvailabilityController.js](../../../server/controllers/tourAvailabilityController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)

## Runtime declarations and data flow

### `activeBookingFilter` — lines 5–9

Parameters: `req`, `tourId`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getTourAvailability` — lines 13–65

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.query. Persistent operations detected: Tour.findOne, Booking.aggregate; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 15:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 16:** `const tour = await Tour.findOne(mergeTenantFilter(req, { _id: req.params.id, isDeleted: { $ne: true } })).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 17:** `if (!tour) return res.status(404).json({ success: false, message: "Tour not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 19:** `const normalize = (value) => { const d = new Date(value); if (Number.isNaN(d.getTime())) return null; d.setHours(0,0,0,0); return d; };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `const requestedDate = req.query?.travelDate ? normalize(req.query.travelDate) : null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `const entries = Array.isArray(tour.availability) ? tour.availability : [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 22:** `let selected = null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `if (requestedDate) selected = entries.find((entry) => { const d = normalize(entry.date); return d && d.getTime() === requestedDate.getTime(); });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 24:** `if (requestedDate && entries.length && !selected) return res.status(400).json({ success:false, message:"The requested travel date is not offered for this tour." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 26:** `const totalSlots = Math.max(0, Number(selected?.totalSlots ?? tour.availabilitySettings?.totalSlots ?? tour.capacity ?? tour.maxGuests ?? 0));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 27:** `const bookedSlots = Math.max(0, Number(selected?.bookedSlots ?? tour.availabilitySettings?.bookedSlots ?? 0));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 28:** `const availableSlots = Math.max(totalSlots - bookedSlots, 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 29:** `const availability = entries.map((entry) => ({` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 36:** `const bookingFilter = activeBookingFilter(req, tour._id);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `if (requestedDate) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 38:** `const end = new Date(requestedDate); end.setDate(end.getDate() + 1);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `const bookingStats = await Booking.aggregate([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 45:** `const totalBookings = Number(bookingStats[0]?.totalBookings || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `normalize` — lines 19–19

Parameters: `value`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `updateTourAvailability` — lines 67–94

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.params. Persistent operations detected: Tour.findOne, Booking.aggregate; verify tenant/ownership filters in the exact query. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 69:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 70:** `const requestedSlots = Number(req.body?.totalSlots);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 71:** `if (!Number.isFinite(requestedSlots) || requestedSlots <= 0 || !Number.isInteger(requestedSlots)) return res.status(400).json({ success: false, message: "Total slots must be a positive whole number." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 73:** `const tour = await Tour.findOne(mergeTenantFilter(req, { _id: req.params.id, isDeleted: { $ne: true } }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 74:** `if (!tour) return res.status(404).json({ success: false, message: "Tour not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 76:** `const bookingStats = await Booking.aggregate([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 80:** `const bookedGuests = Number(bookingStats[0]?.bookedGuests || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 81:** `if (requestedSlots < bookedGuests) return res.status(400).json({ success: false, message: \`Cannot reduce capacity below the current booked guests (${bookedGuests}).\` });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 88:** `if (tour.status === "fully-booked" && requestedSlots > bookedGuests) tour.status = "upcoming";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 89:** `await tour.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 91:** `const updatedTour = await Tour.findOne(mergeTenantFilter(req, { _id: tour._id })).populate("destination").populate("assignedGuide").populate("assignedDriver").populate("assignedVehicle").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 92:** `return res.status(200).json({ success: true, message: "Tour capacity updated successfully.", data: { tour: updatedTour, bookedSlots: bookedGuests, availableSlots: requestedSlots - bookedGuests } });` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 5: `const activeBookingFilter = (req, tourId) => mergeTenantFilter(req, {`.
- Line 11: `const guestExpression = { $ifNull: ["$numberOfGuests", { $ifNull: ["$guests", { $ifNull: ["$numberOfPeople", 1] }] }] };`.
- Line 13: `export const getTourAvailability = async (req, res, next) => {`.
- Line 16: `const tour = await Tour.findOne(mergeTenantFilter(req, { _id: req.params.id, isDeleted: { $ne: true } })).lean();`.
- Line 19: `const normalize = (value) => { const d = new Date(value); if (Number.isNaN(d.getTime())) return null; d.setHours(0,0,0,0); return d; };`.
- Line 20: `const requestedDate = req.query?.travelDate ? normalize(req.query.travelDate) : null;`.
- Line 21: `const entries = Array.isArray(tour.availability) ? tour.availability : [];`.
- Line 22: `let selected = null;`.
- Line 26: `const totalSlots = Math.max(0, Number(selected?.totalSlots ?? tour.availabilitySettings?.totalSlots ?? tour.capacity ?? tour.maxGuests ?? 0));`.
- Line 27: `const bookedSlots = Math.max(0, Number(selected?.bookedSlots ?? tour.availabilitySettings?.bookedSlots ?? 0));`.
- Line 28: `const availableSlots = Math.max(totalSlots - bookedSlots, 0);`.
- Line 29: `const availability = entries.map((entry) => ({`.
- Line 36: `const bookingFilter = activeBookingFilter(req, tour._id);`.
- Line 38: `const end = new Date(requestedDate); end.setDate(end.getDate() + 1);`.
- Line 41: `const bookingStats = await Booking.aggregate([`.
- Line 45: `const totalBookings = Number(bookingStats[0]?.totalBookings || 0);`.
- Line 46: `const occupancyRate = totalSlots ? Number(((bookedSlots / totalSlots) * 100).toFixed(1)) : 0;`.
- Line 67: `export const updateTourAvailability = async (req, res, next) => {`.
- Line 70: `const requestedSlots = Number(req.body?.totalSlots);`.
- Line 73: `const tour = await Tour.findOne(mergeTenantFilter(req, { _id: req.params.id, isDeleted: { $ne: true } }));`.
- Line 76: `const bookingStats = await Booking.aggregate([`.
- Line 80: `const bookedGuests = Number(bookingStats[0]?.bookedGuests || 0);`.
- Line 91: `const updatedTour = await Tour.findOne(mergeTenantFilter(req, { _id: tour._id })).populate("destination").populate("assignedGuide").populate("assignedDriver").populate("assignedVeh`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
