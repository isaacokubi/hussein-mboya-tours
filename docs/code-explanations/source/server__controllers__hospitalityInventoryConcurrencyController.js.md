# Source explanation: server/controllers/hospitalityInventoryConcurrencyController.js

**Source:** [server/controllers/hospitalityInventoryConcurrencyController.js](../../../server/controllers/hospitalityInventoryConcurrencyController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `Hotel` from `../models/Hotel.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Hotel.js](../../../server/models/Hotel.js)
- `HotelRoomType` from `../models/HotelRoomType.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/HotelRoomType.js](../../../server/models/HotelRoomType.js)
- `HotelBooking` from `../models/HotelBooking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/HotelBooking.js](../../../server/models/HotelBooking.js)
- `HospitalityRoomBlock` from `../models/HospitalityRoomBlock.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/HospitalityRoomBlock.js](../../../server/models/HospitalityRoomBlock.js)
- `HospitalityRatePlan` from `../models/HospitalityRatePlan.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/HospitalityRatePlan.js](../../../server/models/HospitalityRatePlan.js)
- `Customer` from `../models/Customer.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Customer.js](../../../server/models/Customer.js)
- `ensureHospitalityInvoice` from `../services/hospitalityInvoiceService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/hospitalityInvoiceService.js](../../../server/services/hospitalityInvoiceService.js)
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

### `nightsBetween` — lines 12–12

Parameters: `from`, `to`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `bookingReference` — lines 13–13

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `resolveCustomer` — lines 15–26

Parameters: `req`, `body`.
Reads request/component inputs: req.user. Persistent operations detected: Customer.findOne, Customer.create; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 16:** `if (!req.user?._id) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 17:** `const tenantId = tenantIdOf(req);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 18:** `let customer = await Customer.findOne({ tenantId, user: req.user._id });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 19:** `if (customer) return customer;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 20:** `const parts = clean(\`${req.user.firstName || ""} ${req.user.lastName || ""} ${req.user.name || ""}\`).split(/\s+/).filter(Boolean);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `const firstName = clean(body.firstName || parts[0] || "Guest");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 22:** `const lastName = clean(body.lastName || parts.slice(1).join(" ") || "Customer");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `const phone = clean(body.phone || req.user.phone);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `if (!phone) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 25:** `return Customer.create({ tenantId, user: req.user._id, firstName, lastName, email: clean(body.email || req.user.email), phone, createdBy: req.user._id, updatedBy: req.user._id });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `reserveInventoryVersion` — lines 28–36

Parameters: `roomTypeId`, `tenantId`, `attempts (defaulted)`.
Persistent operations detected: HotelRoomType.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 29:** `for (let attempt = 0; attempt < attempts; attempt += 1) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 30:** `const room = await HotelRoomType.findOne({ _id: roomTypeId, tenantId }).select("inventoryVersion").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 31:** `if (!room) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 32:** `const guarded = await acquireRoomInventoryGuard({ roomTypeId, tenantId, expectedVersion: Number(room.inventoryVersion || 0) });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 33:** `if (guarded) return guarded;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 35:** `return null;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `createConcurrentSafeHotelBooking` — lines 38–92

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user. Persistent operations detected: Hotel.findOne, HotelRoomType.findOne, HotelBooking.aggregate, HospitalityRoomBlock.aggregate, HospitalityRatePlan.find, HotelBooking.create; verify tenant/ownership filters in the exact query. 6 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 13 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 39:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 40:** `const tenantId = tenantIdOf(req);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `const { hotelId, roomTypeId } = req.body;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `if (!tenantId || !hotelId || !roomTypeId) return res.status(400).json({ success: false, message: "Hotel, room type and tenant context are required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 44:** `const [hotel, room] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 45:** `Hotel.findOne({ _id: hotelId, tenantId, status: "active" }).lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 46:** `HotelRoomType.findOne({ _id: roomTypeId, tenantId, hotel: hotelId, status: "active" }).lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 48:** `if (!hotel || !room) return res.status(404).json({ success: false, message: "Hotel or room type not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 50:** `const checkIn = new Date(req.body.checkIn);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 51:** `const checkOut = new Date(req.body.checkOut);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 52:** `const rooms = Number(req.body.rooms || 1);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 53:** `const adults = Number(req.body.adults || 1);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 54:** `const children = Number(req.body.children || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 55:** `if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime()) || checkOut <= checkIn || !Number.isInteger(rooms) || rooms < 1 || !Number.isInteger(adults) || adults < 1 || !Number.isInteger(children) || childre` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 57:** `const nights = nightsBetween(checkIn, checkOut);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 58:** `if (adults > rooms * Number(room.maxAdults || 1) || children > rooms * Number(room.maxChildren || 0)) return res.status(400).json({ success: false, message: "Guest count exceeds the selected room capacity." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 60:** `const guard = await reserveInventoryVersion(room._id, tenantId);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 61:** `if (!guard) return res.status(409).json({ success: false, message: "Room inventory changed while this booking was being processed. Please retry." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `createConcurrentSafeRoomBlock` — lines 94–112

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user. Persistent operations detected: HotelRoomType.findOne, HotelBooking.aggregate, HospitalityRoomBlock.aggregate, HospitalityRoomBlock.create; verify tenant/ownership filters in the exact query. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 95:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 96:** `const tenantId = tenantIdOf(req);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 97:** `const room = await HotelRoomType.findOne({ _id: req.body.roomTypeId, tenantId, status: "active" }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 98:** `if (!room) return res.status(404).json({ success: false, message: "Room type not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 99:** `const start = new Date(req.body.startDate), end = new Date(req.body.endDate), quantity = Number(req.body.quantity);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 100:** `if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start || !Number.isInteger(quantity) || quantity < 1) return res.status(400).json({ success: false, message: "Valid block dates and quantity are ` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 101:** `const guard = await reserveInventoryVersion(room._id, tenantId);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 102:** `if (!guard) return res.status(409).json({ success: false, message: "Room inventory changed while the block was being processed. Please retry." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 103:** `const [overlap, blocks] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 104:** `HotelBooking.aggregate([{ $match: { tenantId, roomType: room._id, status: { $nin: ["cancelled", "no_show"] }, checkIn: { $lt: end }, checkOut: { $gt: start } } }, { $group: { _id: null, rooms: { $sum: "$rooms" } } }]),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 105:** `HospitalityRoomBlock.aggregate([{ $match: { tenantId, roomType: room._id, status: "blocked", startDate: { $lt: end }, endDate: { $gt: start } } }, { $group: { _id: null, rooms: { $sum: "$quantity" } } }]),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 107:** `const used = Number(overlap[0]?.rooms || 0) + Number(blocks[0]?.rooms || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 108:** `if (used + quantity > Number(room.totalRooms || 0)) return res.status(409).json({ success: false, message: \`Only ${Math.max(Number(room.totalRooms || 0) - used, 0)} room(s) can be blocked for those dates.\` });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 109:** `const block = await HospitalityRoomBlock.create({ tenantId, hotel: room.hotel, roomType: room._id, startDate: start, endDate: end, quantity, reason: clean(req.body.reason) || "Maintenance", createdBy: req.user?._id || nu` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 110:** `return res.status(201).json({ success: true, data: block });` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 10: `const tenantIdOf = req => req.tenantId || req.user?.tenantId;`.
- Line 11: `const clean = value => String(value ?? "").trim();`.
- Line 12: `const nightsBetween = (from, to) => Math.ceil((new Date(to) - new Date(from)) / 86400000);`.
- Line 13: `const bookingReference = () => \`HTL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}\`;`.
- Line 17: `const tenantId = tenantIdOf(req);`.
- Line 18: `let customer = await Customer.findOne({ tenantId, user: req.user._id });`.
- Line 20: `const parts = clean(\`${req.user.firstName || ""} ${req.user.lastName || ""} ${req.user.name || ""}\`).split(/\s+/).filter(Boolean);`.
- Line 21: `const firstName = clean(body.firstName || parts[0] || "Guest");`.
- Line 22: `const lastName = clean(body.lastName || parts.slice(1).join(" ") || "Customer");`.
- Line 23: `const phone = clean(body.phone || req.user.phone);`.
- Line 30: `const room = await HotelRoomType.findOne({ _id: roomTypeId, tenantId }).select("inventoryVersion").lean();`.
- Line 32: `const guarded = await acquireRoomInventoryGuard({ roomTypeId, tenantId, expectedVersion: Number(room.inventoryVersion || 0) });`.
- Line 40: `const tenantId = tenantIdOf(req);`.
- Line 41: `const { hotelId, roomTypeId } = req.body;`.
- Line 44: `const [hotel, room] = await Promise.all([`.
- Line 50: `const checkIn = new Date(req.body.checkIn);`.
- Line 51: `const checkOut = new Date(req.body.checkOut);`.
- Line 52: `const rooms = Number(req.body.rooms || 1);`.
- Line 53: `const adults = Number(req.body.adults || 1);`.
- Line 54: `const children = Number(req.body.children || 0);`.
- Line 57: `const nights = nightsBetween(checkIn, checkOut);`.
- Line 60: `const guard = await reserveInventoryVersion(room._id, tenantId);`.
- Line 63: `const [overlap, blockAgg, rates] = await Promise.all([`.
- Line 69: `const bookedRooms = Number(overlap[0]?.rooms || 0);`.
- Line 70: `const blockedRooms = Number(blockAgg[0]?.rooms || 0);`.
- Line 71: `const validRates = rates.filter(item => nights >= Number(item.minNights || 1) && (!item.maxNights || nights <= Number(item.maxNights)));`.
- Line 72: `const requestedRateId = clean(req.body.ratePlanId);`.
- Line 73: `const rate = requestedRateId ? validRates.find(item => String(item._id) === requestedRateId) : validRates.find(item => !item.stopSell);`.
- Line 77: `const availableRooms = Math.max(Number(room.totalRooms || 0) - bookedRooms - blockedRooms, 0);`.
- Line 80: `const customer = await resolveCustomer(req, req.body);`.
- Line 83: `const nightlyRate = Number(rate?.nightlyRate ?? room.nightlyRate ?? 0);`.
- Line 84: `const subtotal = nights * rooms * nightlyRate;`.
- Line 85: `const taxes = Number(req.body.taxes || 0);`.
- Line 86: `const fees = Number(req.body.fees || 0);`.
- Line 87: `const totalAmount = subtotal + taxes + fees;`.
- Line 88: `const booking = await HotelBooking.create({ tenantId, reference: bookingReference(), hotel: hotel._id, roomType: room._id, ratePlan: rate?._id || null, customer: customer?._id || n`.
- Line 89: `const invoice = await ensureHospitalityInvoice({ type: "hotel", booking });`.
- Line 96: `const tenantId = tenantIdOf(req);`.
- Line 97: `const room = await HotelRoomType.findOne({ _id: req.body.roomTypeId, tenantId, status: "active" }).lean();`.
- Line 99: `const start = new Date(req.body.startDate), end = new Date(req.body.endDate), quantity = Number(req.body.quantity);`.
- Line 101: `const guard = await reserveInventoryVersion(room._id, tenantId);`.
- Line 103: `const [overlap, blocks] = await Promise.all([`.
- Line 107: `const used = Number(overlap[0]?.rooms || 0) + Number(blocks[0]?.rooms || 0);`.
- Line 109: `const block = await HospitalityRoomBlock.create({ tenantId, hotel: room.hotel, roomType: room._id, startDate: start, endDate: end, quantity, reason: clean(req.body.reason) || "Main`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
