# Source explanation: server/controllers/hospitalityAdminController.js

**Source:** [server/controllers/hospitalityAdminController.js](../../../server/controllers/hospitalityAdminController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `Hotel` from `../models/Hotel.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Hotel.js](../../../server/models/Hotel.js)
- `HotelRoomType` from `../models/HotelRoomType.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/HotelRoomType.js](../../../server/models/HotelRoomType.js)
- `HotelBooking` from `../models/HotelBooking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/HotelBooking.js](../../../server/models/HotelBooking.js)
- `AirportTransfer` from `../models/AirportTransfer.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/AirportTransfer.js](../../../server/models/AirportTransfer.js)
- `AirportTransferBooking` from `../models/AirportTransferBooking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/AirportTransferBooking.js](../../../server/models/AirportTransferBooking.js)
- `Customer` from `../models/Customer.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Customer.js](../../../server/models/Customer.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `Vehicle` from `../models/Vehicle.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Vehicle.js](../../../server/models/Vehicle.js)

## Runtime declarations and data flow

### `tenantIdOf` — lines 10–10

Parameters: `req`.
Reads request/component inputs: req.tenantId, req.user.

Key statements:

### `roleOf` — lines 11–11

Parameters: `req`.
Reads request/component inputs: req.user.

Key statements:

### `requireTenant` — lines 14–21

Parameters: `req`, `res`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 15:** `const tenantId = tenantIdOf(req);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `if (!tenantId) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 17:** `res.status(400).json({ success: false, message: "Tenant context is required for hospitality operations." });` — Builds an HTTP response with an explicit status and JSON payload.
- **Line 18:** `return null;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 20:** `return tenantId;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `requireBookingAccess` — lines 23–30

Parameters: `req`, `res`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 24:** `const role = roleOf(req);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `if (!staffRoles.has(role) && role !== "customer") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 26:** `res.status(403).json({ success: false, message: "Not allowed." });` — Builds an HTTP response with an explicit status and JSON payload.
- **Line 27:** `return false;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 29:** `return true;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `ids` — lines 32–32

Parameters: `rows`, `key`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `listAdminHotelsSafe` — lines 34–55

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: Hotel.find, HotelRoomType.find; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 35:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 36:** `const tenantId = requireTenant(req, res);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `if (!tenantId) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 38:** `const filter = { tenantId };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 39:** `if (req.query.status) filter.status = req.query.status;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 40:** `const hotels = await Hotel.find(filter).sort({ createdAt: -1, name: 1 }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 41:** `if (!hotels.length) return res.json({ success: true, data: [] });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 42:** `const hotelIds = hotels.map((hotel) => hotel._id);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 43:** `const rooms = await HotelRoomType.find({ tenantId, hotel: { $in: hotelIds } }).sort({ nightlyRate: 1, name: 1 }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 44:** `const roomsByHotel = new Map();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 45:** `for (const room of rooms) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 46:** `const key = String(room.hotel);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 47:** `const current = roomsByHotel.get(key) || [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 51:** `res.json({ success: true, data: hotels.map((hotel) => ({ ...hotel, roomTypes: roomsByHotel.get(String(hotel._id)) || [] })) });` — Sends a JSON response; inspect its caller for status and error semantics.

### `listAdminTransfersSafe` — lines 57–68

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: AirportTransfer.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 58:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 59:** `const tenantId = requireTenant(req, res);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 60:** `if (!tenantId) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 61:** `const filter = { tenantId };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 62:** `if (req.query.status) filter.status = req.query.status;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 63:** `const transfers = await AirportTransfer.find(filter).sort({ createdAt: -1, airportCode: 1, price: 1, name: 1 }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 64:** `res.json({ success: true, data: transfers });` — Sends a JSON response; inspect its caller for status and error semantics.

### `listHotelBookingsSafe` — lines 70–120

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query, req.user. Persistent operations detected: HotelBooking.find, Hotel.find, HotelRoomType.find, Customer.find, User.find; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 9 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 71:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 72:** `if (!requireBookingAccess(req, res)) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 73:** `const tenantId = requireTenant(req, res);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 74:** `if (!tenantId) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 75:** `const role = roleOf(req);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 76:** `const filter = { tenantId };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 77:** `if (req.query.status) filter.status = req.query.status;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 78:** `if (req.query.customerId) filter.customer = req.query.customerId;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 79:** `if (role === "customer") filter.user = req.user._id;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 80:** `const rows = await HotelBooking.find(filter).sort({ checkIn: 1, createdAt: -1 }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 81:** `if (!rows.length) return res.json({ success: true, data: [] });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 83:** `const hotelIds = ids(rows, "hotel");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 84:** `const roomIds = ids(rows, "roomType");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 85:** `const customerIds = ids(rows, "customer");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 86:** `const userIds = ids(rows, "user");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 87:** `const [hotels, rooms, customers, users] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 88:** `Hotel.find({ tenantId, _id: { $in: hotelIds } }).select("name city county tenantId").lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 89:** `HotelRoomType.find({ tenantId, _id: { $in: roomIds } }).select("name nightlyRate hotel tenantId").lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `listTransferBookingsSafe` — lines 122–173

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query, req.user. Persistent operations detected: AirportTransferBooking.find, AirportTransfer.find, Customer.find, User.find, Vehicle.find; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 10 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 123:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 124:** `if (!requireBookingAccess(req, res)) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 125:** `const tenantId = requireTenant(req, res);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 126:** `if (!tenantId) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 127:** `const role = roleOf(req);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 128:** `const filter = { tenantId };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 129:** `if (req.query.status) filter.status = req.query.status;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 130:** `if (role === "customer") filter.user = req.user._id;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 131:** `const rows = await AirportTransferBooking.find(filter).sort({ pickupDateTime: 1, createdAt: -1 }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 132:** `if (!rows.length) return res.json({ success: true, data: [] });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 134:** `const transferIds = ids(rows, "transfer");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 135:** `const customerIds = ids(rows, "customer");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 136:** `const userIds = ids(rows, "user");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 137:** `const vehicleIds = ids(rows, "assignedVehicle");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 138:** `const driverIds = ids(rows, "assignedDriver");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 139:** `const [transfers, customers, users, vehicles] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 140:** `AirportTransfer.find({ tenantId, _id: { $in: transferIds } }).select("name airportName airportCode vehicleType tenantId").lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 141:** `customerIds.length ? Customer.find({ tenantId, _id: { $in: customerIds } }).select("firstName lastName email phone tenantId user").lean() : [],` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 10: `const tenantIdOf = (req) => req.tenantId || req.user?.tenantId || null;`.
- Line 11: `const roleOf = (req) => String(req.userRole || req.user?.role || "").trim().toLowerCase().replace(/[\s-]+/g, "_");`.
- Line 12: `const staffRoles = new Set(["admin", "manager", "tour_manager", "tourmanager", "agent", "super_admin", "superadmin"]);`.
- Line 14: `const requireTenant = (req, res) => {`.
- Line 15: `const tenantId = tenantIdOf(req);`.
- Line 23: `const requireBookingAccess = (req, res) => {`.
- Line 24: `const role = roleOf(req);`.
- Line 32: `const ids = (rows, key) => [...new Set(rows.map((row) => row?.[key]).filter(Boolean).map(String))];`.
- Line 34: `export const listAdminHotelsSafe = async (req, res, next) => {`.
- Line 36: `const tenantId = requireTenant(req, res);`.
- Line 38: `const filter = { tenantId };`.
- Line 40: `const hotels = await Hotel.find(filter).sort({ createdAt: -1, name: 1 }).lean();`.
- Line 42: `const hotelIds = hotels.map((hotel) => hotel._id);`.
- Line 43: `const rooms = await HotelRoomType.find({ tenantId, hotel: { $in: hotelIds } }).sort({ nightlyRate: 1, name: 1 }).lean();`.
- Line 44: `const roomsByHotel = new Map();`.
- Line 46: `const key = String(room.hotel);`.
- Line 47: `const current = roomsByHotel.get(key) || [];`.
- Line 57: `export const listAdminTransfersSafe = async (req, res, next) => {`.
- Line 59: `const tenantId = requireTenant(req, res);`.
- Line 61: `const filter = { tenantId };`.
- Line 63: `const transfers = await AirportTransfer.find(filter).sort({ createdAt: -1, airportCode: 1, price: 1, name: 1 }).lean();`.
- Line 70: `export const listHotelBookingsSafe = async (req, res, next) => {`.
- Line 73: `const tenantId = requireTenant(req, res);`.
- Line 75: `const role = roleOf(req);`.
- Line 76: `const filter = { tenantId };`.
- Line 80: `const rows = await HotelBooking.find(filter).sort({ checkIn: 1, createdAt: -1 }).lean();`.
- Line 83: `const hotelIds = ids(rows, "hotel");`.
- Line 84: `const roomIds = ids(rows, "roomType");`.
- Line 85: `const customerIds = ids(rows, "customer");`.
- Line 86: `const userIds = ids(rows, "user");`.
- Line 87: `const [hotels, rooms, customers, users] = await Promise.all([`.
- Line 93: `const hotelMap = new Map(hotels.map((hotel) => [String(hotel._id), hotel]));`.
- Line 94: `const roomMap = new Map(rooms.map((room) => [String(room._id), room]));`.
- Line 95: `const customerMap = new Map(customers.map((customer) => [String(customer._id), customer]));`.
- Line 96: `const userMap = new Map(users.map((user) => [String(user._id), user]));`.
- Line 98: `const valid = rows.filter((row) => {`.
- Line 99: `const hotel = hotelMap.get(String(row.hotel));`.
- Line 100: `const room = roomMap.get(String(row.roomType));`.
- Line 122: `export const listTransferBookingsSafe = async (req, res, next) => {`.
- Line 125: `const tenantId = requireTenant(req, res);`.
- Line 127: `const role = roleOf(req);`.
- Line 128: `const filter = { tenantId };`.
- Line 131: `const rows = await AirportTransferBooking.find(filter).sort({ pickupDateTime: 1, createdAt: -1 }).lean();`.
- Line 134: `const transferIds = ids(rows, "transfer");`.
- Line 135: `const customerIds = ids(rows, "customer");`.
- Line 136: `const userIds = ids(rows, "user");`.
- Line 137: `const vehicleIds = ids(rows, "assignedVehicle");`.
- Line 138: `const driverIds = ids(rows, "assignedDriver");`.
- Line 139: `const [transfers, customers, users, vehicles] = await Promise.all([`.
- Line 145: `const transferMap = new Map(transfers.map((transfer) => [String(transfer._id), transfer]));`.
- Line 146: `const customerMap = new Map(customers.map((customer) => [String(customer._id), customer]));`.
- Line 147: `const userMap = new Map(users.map((user) => [String(user._id), user]));`.
- Line 148: `const vehicleMap = new Map(vehicles.map((vehicle) => [String(vehicle._id), vehicle]));`.
- Line 150: `const valid = rows.filter((row) => {`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
