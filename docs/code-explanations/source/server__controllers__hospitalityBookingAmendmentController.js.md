# Source explanation: server/controllers/hospitalityBookingAmendmentController.js

**Source:** [server/controllers/hospitalityBookingAmendmentController.js](../../../server/controllers/hospitalityBookingAmendmentController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `HotelBooking` from `../models/HotelBooking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/HotelBooking.js](../../../server/models/HotelBooking.js)
- `HotelRoomType` from `../models/HotelRoomType.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/HotelRoomType.js](../../../server/models/HotelRoomType.js)
- `HotelBookingPayment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `HospitalityRoomBlock` from `../models/HospitalityRoomBlock.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/HospitalityRoomBlock.js](../../../server/models/HospitalityRoomBlock.js)
- `HospitalityRatePlan` from `../models/HospitalityRatePlan.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/HospitalityRatePlan.js](../../../server/models/HospitalityRatePlan.js)
- `syncHospitalityInvoicePayments` from `../services/hospitalityInvoiceService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/hospitalityInvoiceService.js](../../../server/services/hospitalityInvoiceService.js)
- `createAuditLog` from `../services/auditService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/auditService.js](../../../server/services/auditService.js)
- `acquireRoomInventoryGuard` from `../services/hospitalityInventoryConcurrencyService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/hospitalityInventoryConcurrencyService.js](../../../server/services/hospitalityInventoryConcurrencyService.js)

## Runtime declarations and data flow

### `tenantIdOf` — lines 10–10

Parameters: `req`.
Reads request/component inputs: req.tenantId, req.user.

Key statements:

### `clean` — lines 11–11

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `asDate` — lines 12–12

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `audit` — lines 15–30

Parameters: `req`, `action`, `id`, `metadata (defaulted)`.
Reads request/component inputs: req.user. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=false, finally=false.

Key statements:
- **Line 16:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 17:** `await createAuditLog({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `amendHotelBookingProduction` — lines 32–140

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body, req.user. Persistent operations detected: HotelBooking.findOne, HotelRoomType.findOne, HospitalityRatePlan.find, HotelBooking.aggregate, HospitalityRoomBlock.aggregate, HotelBookingPayment.find; verify tenant/ownership filters in the exact query. 10 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 11 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 33:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 34:** `const tenantId = tenantIdOf(req);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `const booking = await HotelBooking.findOne({ _id: req.params.id, tenantId });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 36:** `if (!booking) return res.status(404).json({ success: false, message: "Hotel booking not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 37:** `if (["cancelled", "checked_in", "checked_out", "completed"].includes(booking.status)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 38:** `return res.status(409).json({ success: false, message: "This booking can no longer be amended." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 41:** `const checkIn = req.body.checkIn ? asDate(req.body.checkIn) : booking.checkIn;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `const checkOut = req.body.checkOut ? asDate(req.body.checkOut) : booking.checkOut;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 43:** `const rooms = req.body.rooms === undefined ? Number(booking.rooms || 1) : Number(req.body.rooms);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 44:** `const adults = req.body.adults === undefined ? Number(booking.adults || 1) : Number(req.body.adults);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 45:** `const children = req.body.children === undefined ? Number(booking.children || 0) : Number(req.body.children);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 46:** `if (!checkIn || !checkOut || checkOut <= checkIn || rooms < 1 || adults < 1 || children < 0) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 47:** `return res.status(400).json({ success: false, message: "Invalid amended stay details." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 50:** `const room = await HotelRoomType.findOne({ _id: booking.roomType, hotel: booking.hotel, tenantId }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 51:** `if (!room) return res.status(404).json({ success: false, message: "The booked room type is no longer available." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 53:** `const guardVersion = Number(room.inventoryVersion || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 54:** `const guardedRoom = await acquireRoomInventoryGuard({ roomTypeId: room._id, tenantId, expectedVersion: guardVersion });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 55:** `if (!guardedRoom) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 10: `const tenantIdOf = req => req.tenantId || req.user?.tenantId;`.
- Line 11: `const clean = value => String(value ?? "").trim();`.
- Line 12: `const asDate = value => { const date = new Date(value); return Number.isNaN(date.getTime()) ? null : date; };`.
- Line 13: `const activeBookingStatuses = { $nin: ["cancelled", "no_show"] };`.
- Line 15: `const audit = async (req, action, id, metadata = {}) => {`.
- Line 32: `export const amendHotelBookingProduction = async (req, res, next) => {`.
- Line 34: `const tenantId = tenantIdOf(req);`.
- Line 35: `const booking = await HotelBooking.findOne({ _id: req.params.id, tenantId });`.
- Line 41: `const checkIn = req.body.checkIn ? asDate(req.body.checkIn) : booking.checkIn;`.
- Line 42: `const checkOut = req.body.checkOut ? asDate(req.body.checkOut) : booking.checkOut;`.
- Line 43: `const rooms = req.body.rooms === undefined ? Number(booking.rooms || 1) : Number(req.body.rooms);`.
- Line 44: `const adults = req.body.adults === undefined ? Number(booking.adults || 1) : Number(req.body.adults);`.
- Line 45: `const children = req.body.children === undefined ? Number(booking.children || 0) : Number(req.body.children);`.
- Line 50: `const room = await HotelRoomType.findOne({ _id: booking.roomType, hotel: booking.hotel, tenantId }).lean();`.
- Line 53: `const guardVersion = Number(room.inventoryVersion || 0);`.
- Line 54: `const guardedRoom = await acquireRoomInventoryGuard({ roomTypeId: room._id, tenantId, expectedVersion: guardVersion });`.
- Line 59: `const nights = Math.ceil((checkOut - checkIn) / 86400000);`.
- Line 60: `const requestedRateId = clean(req.body.ratePlanId || booking.ratePlan);`.
- Line 61: `const rateFilter = {`.
- Line 72: `const rates = await HospitalityRatePlan.find(rateFilter).sort({ nightlyRate: 1, createdAt: 1 }).lean();`.
- Line 73: `const validRates = rates.filter(rate => nights >= Number(rate.minNights || 1) && (!rate.maxNights || nights <= Number(rate.maxNights)));`.
- Line 74: `let rate = requestedRateId ? validRates.find(item => String(item._id) === requestedRateId) : validRates.find(Boolean);`.
- Line 77: `const bookingConflict = await HotelBooking.aggregate([`.
- Line 81: `const blockConflict = await HospitalityRoomBlock.aggregate([`.
- Line 85: `const bookedRooms = Number(bookingConflict[0]?.rooms || 0);`.
- Line 86: `const blockedRooms = Number(blockConflict[0]?.quantity || 0);`.
- Line 87: `const totalRooms = Number(guardedRoom.totalRooms || room.totalRooms || 0);`.
- Line 92: `const capacity = Number(room.maxOccupancy || room.capacity || room.guests || 0);`.
- Line 97: `const nightlyRate = rate ? Number(rate.nightlyRate || 0) : Number(room.nightlyRate || 0);`.
- Line 98: `const subtotal = nights * rooms * nightlyRate;`.
- Line 99: `const taxes = Number(booking.taxes || 0);`.
- Line 100: `const fees = Number(booking.fees || 0);`.
- Line 101: `const totalAmount = subtotal + taxes + fees;`.
- Line 103: `const completedPayments = await HotelBookingPayment.find({`.
- Line 109: `const paid = completedPayments.reduce((sum, payment) => sum + Math.max(0, Number(payment.amount || 0) - Number(payment.refundedAmount || 0)), 0);`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
