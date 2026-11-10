# Source explanation: server/controllers/hotelAvailabilityController.js

**Source:** [server/controllers/hotelAvailabilityController.js](../../../server/controllers/hotelAvailabilityController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `Hotel` from `../models/Hotel.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Hotel.js](../../../server/models/Hotel.js)
- `HotelRoomType` from `../models/HotelRoomType.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/HotelRoomType.js](../../../server/models/HotelRoomType.js)
- `HotelBooking` from `../models/HotelBooking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/HotelBooking.js](../../../server/models/HotelBooking.js)
- `HospitalityRoomBlock` from `../models/HospitalityRoomBlock.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/HospitalityRoomBlock.js](../../../server/models/HospitalityRoomBlock.js)
- `HospitalityRatePlan` from `../models/HospitalityRatePlan.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/HospitalityRatePlan.js](../../../server/models/HospitalityRatePlan.js)

## Runtime declarations and data flow

### `tenantIdOf` — lines 7–7

Parameters: `req`.
Reads request/component inputs: req.tenantId, req.user.

Key statements:

### `nightsBetween` — lines 8–8

Parameters: `from`, `to`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `checkHotelAvailability` — lines 10–58

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: Hotel.findOne, HotelRoomType.find, HotelBooking.aggregate, HospitalityRoomBlock.aggregate, HospitalityRatePlan.find; verify tenant/ownership filters in the exact query. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 11:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 12:** `const tenantId = tenantIdOf(req);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `const { hotelId, checkIn, checkOut, ratePlanId } = req.query;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 14:** `const start = new Date(checkIn);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `const end = new Date(checkOut);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `if (!tenantId) return res.status(400).json({ success: false, message: "Tenant context is required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 17:** `if (!hotelId || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return res.status(400).json({ success: false, message: "Valid hotel, check-in and check-out dates are required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 19:** `const hotel = await Hotel.findOne({ _id: hotelId, tenantId, status: "active" }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 20:** `if (!hotel) return res.status(404).json({ success: false, message: "Hotel not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 21:** `const rooms = await HotelRoomType.find({ tenantId, hotel: hotel._id, status: "active" }).sort({ nightlyRate: 1 }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 22:** `const nights = nightsBetween(start, end);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `const result = await Promise.all(rooms.map(async (room) => {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 25:** `const [booked, blocks, rates] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 26:** `HotelBooking.aggregate([{ $match: { tenantId, roomType: room._id, status: { $nin: ["cancelled", "no_show"] }, checkIn: { $lt: end }, checkOut: { $gt: start } } }, { $group: { _id: null, rooms: { $sum: "$rooms" } } }]),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 27:** `HospitalityRoomBlock.aggregate([{ $match: { tenantId, roomType: room._id, status: "blocked", startDate: { $lt: end }, endDate: { $gt: start } } }, { $group: { _id: null, rooms: { $sum: "$quantity" } } }]),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 28:** `HospitalityRatePlan.find({ tenantId, hotel: hotel._id, roomType: room._id, status: "active", $or: [{ validFrom: null }, { validFrom: { $lte: start } }], $and: [{ $or: [{ validTo: null }, { validTo: { $gte: end } }] }] })` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 31:** `const reserved = Number(booked[0]?.rooms || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 32:** `const blocked = Number(blocks[0]?.rooms || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 7: `const tenantIdOf = (req) => req.tenantId || req.user?.tenantId;`.
- Line 8: `const nightsBetween = (from, to) => Math.ceil((new Date(to) - new Date(from)) / 86400000);`.
- Line 12: `const tenantId = tenantIdOf(req);`.
- Line 13: `const { hotelId, checkIn, checkOut, ratePlanId } = req.query;`.
- Line 14: `const start = new Date(checkIn);`.
- Line 15: `const end = new Date(checkOut);`.
- Line 19: `const hotel = await Hotel.findOne({ _id: hotelId, tenantId, status: "active" }).lean();`.
- Line 21: `const rooms = await HotelRoomType.find({ tenantId, hotel: hotel._id, status: "active" }).sort({ nightlyRate: 1 }).lean();`.
- Line 22: `const nights = nightsBetween(start, end);`.
- Line 24: `const result = await Promise.all(rooms.map(async (room) => {`.
- Line 25: `const [booked, blocks, rates] = await Promise.all([`.
- Line 31: `const reserved = Number(booked[0]?.rooms || 0);`.
- Line 32: `const blocked = Number(blocks[0]?.rooms || 0);`.
- Line 33: `const availableBase = Math.max(Number(room.totalRooms || 0) - reserved - blocked, 0);`.
- Line 34: `const validRates = rates.filter(r => nights >= Number(r.minNights || 1) && (!r.maxNights || nights <= Number(r.maxNights)));`.
- Line 35: `const selected = ratePlanId ? validRates.find(r => String(r._id) === String(ratePlanId)) : validRates.find(r => !r.stopSell);`.
- Line 36: `const selectedStopSell = Boolean(selected?.stopSell);`.
- Line 37: `const available = selectedStopSell ? 0 : availableBase;`.
- Line 38: `const nightlyRate = selected?.nightlyRate ?? room.nightlyRate;`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
