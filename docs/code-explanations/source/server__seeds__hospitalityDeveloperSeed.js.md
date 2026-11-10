# Source explanation: server/seeds/hospitalityDeveloperSeed.js

**Source:** [server/seeds/hospitalityDeveloperSeed.js](../../../server/seeds/hospitalityDeveloperSeed.js)

## Purpose

A seed/migration helper that creates or updates database records. Review safety gates and target database before executing.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `crypto` from `node:crypto`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `dotenv` from `dotenv`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Organization` from `../models/Organization.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Organization.js](../../../server/models/Organization.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `Customer` from `../models/Customer.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Customer.js](../../../server/models/Customer.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Hotel` from `../models/Hotel.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Hotel.js](../../../server/models/Hotel.js)
- `HotelRoomType` from `../models/HotelRoomType.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/HotelRoomType.js](../../../server/models/HotelRoomType.js)
- `HospitalityRatePlan` from `../models/HospitalityRatePlan.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/HospitalityRatePlan.js](../../../server/models/HospitalityRatePlan.js)
- `HotelBooking` from `../models/HotelBooking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/HotelBooking.js](../../../server/models/HotelBooking.js)
- `AirportTransfer` from `../models/AirportTransfer.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/AirportTransfer.js](../../../server/models/AirportTransfer.js)
- `AirportTransferBooking` from `../models/AirportTransferBooking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/AirportTransferBooking.js](../../../server/models/AirportTransferBooking.js)
- `ApiKey` from `../models/ApiKey.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/ApiKey.js](../../../server/models/ApiKey.js)
- `Webhook` from `../models/Webhook.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Webhook.js](../../../server/models/Webhook.js)
- `runWithTenant` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `protectWebhookSecret` from `../services/webhookDeliveryService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/webhookDeliveryService.js](../../../server/services/webhookDeliveryService.js)

## Runtime declarations and data flow

### `daysFromNow` — lines 21–21

Parameters: `n`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `clean` — lines 22–22

Parameters: `v`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `seedTenant` — lines 24–196

Parameters: `tenant`, `tenantIndex`.
Persistent operations detected: User.find, Customer.find, Booking.find, Hotel.countDocuments, HotelRoomType.countDocuments, HospitalityRatePlan.countDocuments, HotelBooking.countDocuments, AirportTransfer.countDocuments, AirportTransferBooking.countDocuments, ApiKey.countDocuments, Webhook.countDocuments; verify tenant/ownership filters in the exact query. 18 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 10 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 25:** `return runWithTenant({ tenantId: tenant._id, role: "manager", bypass: false }, async () => {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 26:** `const [users, customers, bookings] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 27:** `User.find({ tenantId: tenant._id, isDeleted: { $ne: true } }).limit(100).lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 28:** `Customer.find({ tenantId: tenant._id, isDeleted: { $ne: true } }).limit(30).lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 29:** `Booking.find({ tenantId: tenant._id, isDeleted: { $ne: true } }).sort({ createdAt: -1 }).limit(20).lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 32:** `const actor = users.find((u) => ["admin", "manager", "super_admin", "superadmin"].includes(clean(u.role).toLowerCase())) || users[0] || null;` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 33:** `const customer = customers[tenantIndex % Math.max(customers.length, 1)] || null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `const linkedBooking = bookings[tenantIndex % Math.max(bookings.length, 1)] || null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 36:** `const hotelDefs = [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `const hotels = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `for (const d of hotelDefs) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 42:** `const hotel = await Hotel.findOneAndUpdate(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 59:** `const roomDefs = [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 65:** `const roomTypes = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 66:** `for (const [hotel, name, maxAdults, maxChildren, totalRooms, availableRooms, nightlyRate, mealPlans] of roomDefs) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 67:** `const room = await HotelRoomType.findOneAndUpdate(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 78:** `await HospitalityRatePlan.findOneAndUpdate(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 89:** `const transferDefs = [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `guestFromCustomer` — lines 110–113

Parameters: `c`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `main` — lines 198–208

Parameters: none.
Persistent operations detected: Organization.find; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 199:** `if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 200:** `await mongoose.connect(process.env.MONGODB_URI);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 201:** `const tenants = await Organization.find({ isDeleted: { $ne: true } }).sort({ createdAt: 1 }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 202:** `if (tenants.length !== 3) throw new Error(\`SAFE STOP: expected exactly 3 tenants, found ${tenants.length}.\`);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 204:** `const results = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 205:** `for (let i = 0; i < tenants.length; i += 1) results.push(await seedTenant(tenants[i], i));` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.

## Module-level declarations

- Line 21: `const daysFromNow = (n) => new Date(Date.now() + n * 86400000);`.
- Line 22: `const clean = (v) => String(v || "").trim();`.
- Line 26: `const [users, customers, bookings] = await Promise.all([`.
- Line 32: `const actor = users.find((u) => ["admin", "manager", "super_admin", "superadmin"].includes(clean(u.role).toLowerCase())) || users[0] || null;`.
- Line 33: `const customer = customers[tenantIndex % Math.max(customers.length, 1)] || null;`.
- Line 34: `const linkedBooking = bookings[tenantIndex % Math.max(bookings.length, 1)] || null;`.
- Line 36: `const hotelDefs = [`.
- Line 40: `const hotels = [];`.
- Line 42: `const hotel = await Hotel.findOneAndUpdate(`.
- Line 59: `const roomDefs = [`.
- Line 65: `const roomTypes = [];`.
- Line 67: `const room = await HotelRoomType.findOneAndUpdate(`.
- Line 89: `const transferDefs = [`.
- Line 94: `const transfers = [];`.
- Line 96: `const transfer = await AirportTransfer.findOneAndUpdate(`.
- Line 110: `const guestFromCustomer = (c) => ({`.
- Line 115: `const hotelStatuses = ["confirmed", "checked_in", "pending", "checked_out"];`.
- Line 117: `const room = roomTypes[i % roomTypes.length];`.
- Line 118: `const hotel = hotels.find((h) => String(h._id) === String(room.hotel)) || hotels[0];`.
- Line 119: `const c = customers[i % Math.max(customers.length, 1)] || customer;`.
- Line 120: `const checkIn = daysFromNow(i - 2);`.
- Line 121: `const checkOut = daysFromNow(i + 1);`.
- Line 122: `const nights = Math.max(1, Math.round((checkOut - checkIn) / 86400000));`.
- Line 123: `const subtotal = room.nightlyRate * nights;`.
- Line 140: `const transferStatuses = ["confirmed", "assigned", "driver_en_route", "completed"];`.
- Line 142: `const transfer = transfers[i % transfers.length];`.
- Line 143: `const c = customers[(i + 1) % Math.max(customers.length, 1)] || customer;`.
- Line 144: `const pickupDateTime = daysFromNow(i + 0.5);`.
- Line 163: `const apiRaw = \`gt_demo_${crypto.randomBytes(24).toString("base64url")}\`;`.
- Line 173: `<sensitive declaration redacted>`.
- Line 201: `const tenants = await Organization.find({ isDeleted: { $ne: true } }).sort({ createdAt: 1 }).lean();`.
- Line 204: `const results = [];`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
