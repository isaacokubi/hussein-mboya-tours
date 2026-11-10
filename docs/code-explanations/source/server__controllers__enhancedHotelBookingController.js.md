# Source explanation: server/controllers/enhancedHotelBookingController.js

**Source:** [server/controllers/enhancedHotelBookingController.js](../../../server/controllers/enhancedHotelBookingController.js)

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

## Runtime declarations and data flow

### `tenantIdOf` — lines 9–9

Parameters: `req`.
Reads request/component inputs: req.tenantId, req.user.

Key statements:

### `clean` — lines 10–10

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `nightsBetween` — lines 11–11

Parameters: `from`, `to`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `bookingReference` — lines 12–12

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `resolveCustomer` — lines 14–25

Parameters: `req`, `body`.
Reads request/component inputs: req.user. Persistent operations detected: Customer.findOne, Customer.create; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 15:** `if (!req.user?._id) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 16:** `const tenantId = tenantIdOf(req);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `let customer = await Customer.findOne({ tenantId, user: req.user._id });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 18:** `if (customer) return customer;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 19:** `const nameParts = clean(\`${req.user.firstName || ""} ${req.user.lastName || ""} ${req.user.name || ""}\`).trim().split(/\s+/).filter(Boolean);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `const firstName = clean(body.firstName || nameParts[0] || "Guest");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `const lastName = clean(body.lastName || nameParts.slice(1).join(" ") || "Customer");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 22:** `const phone = clean(body.phone || req.user.phone);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `if (!phone) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 24:** `return Customer.create({ tenantId, user: req.user._id, firstName, lastName, email: clean(body.email || req.user.email), phone, createdBy: req.user._id, updatedBy: req.user._id });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `createEnhancedHotelBooking` — lines 27–96

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user. Persistent operations detected: Hotel.findOne, HotelRoomType.findOne, HotelBooking.aggregate, HospitalityRoomBlock.aggregate, HospitalityRatePlan.find, HotelBooking.create; verify tenant/ownership filters in the exact query. 5 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 11 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 28:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 29:** `const tenantId = tenantIdOf(req);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 30:** `const { hotelId, roomTypeId } = req.body;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 31:** `if (!tenantId || !hotelId || !roomTypeId) return res.status(400).json({ success: false, message: "Hotel, room type and tenant context are required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 33:** `const [hotel, room] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 34:** `Hotel.findOne({ _id: hotelId, tenantId, status: "active" }).lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 35:** `HotelRoomType.findOne({ _id: roomTypeId, tenantId, hotel: hotelId, status: "active" }).lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 37:** `if (!hotel || !room) return res.status(404).json({ success: false, message: "Hotel or room type not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 39:** `const checkIn = new Date(req.body.checkIn);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `const checkOut = new Date(req.body.checkOut);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `const rooms = Number(req.body.rooms || 1);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `const adults = Number(req.body.adults || 1);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 43:** `const children = Number(req.body.children || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 44:** `if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime()) || checkOut <= checkIn || !Number.isInteger(rooms) || rooms < 1 || !Number.isInteger(adults) || adults < 1 || !Number.isInteger(children) || childre` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 45:** `return res.status(400).json({ success: false, message: "Valid check-in, check-out, rooms and guests are required." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 48:** `const nights = nightsBetween(checkIn, checkOut);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 49:** `if (adults > rooms * Number(room.maxAdults || 1) || children > rooms * Number(room.maxChildren || 0)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 50:** `return res.status(400).json({ success: false, message: "Guest count exceeds the selected room capacity." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 9: `const tenantIdOf = (req) => req.tenantId || req.user?.tenantId;`.
- Line 10: `const clean = (value) => String(value ?? "").trim();`.
- Line 11: `const nightsBetween = (from, to) => Math.ceil((new Date(to) - new Date(from)) / 86400000);`.
- Line 12: `const bookingReference = () => \`HTL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}\`;`.
- Line 16: `const tenantId = tenantIdOf(req);`.
- Line 17: `let customer = await Customer.findOne({ tenantId, user: req.user._id });`.
- Line 19: `const nameParts = clean(\`${req.user.firstName || ""} ${req.user.lastName || ""} ${req.user.name || ""}\`).trim().split(/\s+/).filter(Boolean);`.
- Line 20: `const firstName = clean(body.firstName || nameParts[0] || "Guest");`.
- Line 21: `const lastName = clean(body.lastName || nameParts.slice(1).join(" ") || "Customer");`.
- Line 22: `const phone = clean(body.phone || req.user.phone);`.
- Line 29: `const tenantId = tenantIdOf(req);`.
- Line 30: `const { hotelId, roomTypeId } = req.body;`.
- Line 33: `const [hotel, room] = await Promise.all([`.
- Line 39: `const checkIn = new Date(req.body.checkIn);`.
- Line 40: `const checkOut = new Date(req.body.checkOut);`.
- Line 41: `const rooms = Number(req.body.rooms || 1);`.
- Line 42: `const adults = Number(req.body.adults || 1);`.
- Line 43: `const children = Number(req.body.children || 0);`.
- Line 48: `const nights = nightsBetween(checkIn, checkOut);`.
- Line 53: `const [overlap, blockAgg, rates] = await Promise.all([`.
- Line 59: `const bookedRooms = Number(overlap[0]?.rooms || 0);`.
- Line 60: `const blockedRooms = Number(blockAgg[0]?.rooms || 0);`.
- Line 61: `const validRates = rates.filter(item => nights >= Number(item.minNights || 1) && (!item.maxNights || nights <= Number(item.maxNights)));`.
- Line 62: `const requestedRateId = clean(req.body.ratePlanId);`.
- Line 63: `const rate = requestedRateId ? validRates.find(item => String(item._id) === requestedRateId) : validRates.find(item => !item.stopSell);`.
- Line 68: `const availableRooms = Math.max(Number(room.totalRooms || 0) - bookedRooms - blockedRooms, 0);`.
- Line 71: `const customer = await resolveCustomer(req, req.body);`.
- Line 74: `const nightlyRate = Number(rate?.nightlyRate ?? room.nightlyRate ?? 0);`.
- Line 75: `const subtotal = nights * rooms * nightlyRate;`.
- Line 76: `const taxes = Number(req.body.taxes || 0);`.
- Line 77: `const fees = Number(req.body.fees || 0);`.
- Line 78: `const totalAmount = subtotal + taxes + fees;`.
- Line 80: `const booking = await HotelBooking.create({`.
- Line 91: `const invoice = await ensureHospitalityInvoice({ type: "hotel", booking });`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
