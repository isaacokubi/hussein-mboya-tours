# Source explanation: server/controllers/hospitalityInventorySyncController.js

**Source:** [server/controllers/hospitalityInventorySyncController.js](../../../server/controllers/hospitalityInventorySyncController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `AccommodationInventory` from `../models/AccommodationInventory.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/AccommodationInventory.js](../../../server/models/AccommodationInventory.js)
- `Hotel` from `../models/Hotel.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Hotel.js](../../../server/models/Hotel.js)
- `HotelRoomType` from `../models/HotelRoomType.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/HotelRoomType.js](../../../server/models/HotelRoomType.js)

## Runtime declarations and data flow

### `clean` — lines 5–5

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `slugify` — lines 6–6

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `syncAccommodationInventoryToHotelPms` — lines 8–72

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.tenantId, req.user. Persistent operations detected: AccommodationInventory.find, Hotel.findOne, Hotel.create, HotelRoomType.findOne, HotelRoomType.create; verify tenant/ownership filters in the exact query. 7 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 7 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 9:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 10:** `const tenantId = req.tenantId || req.user?.tenantId;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 11:** `if (!tenantId) return res.status(400).json({ success: false, message: "Tenant context is required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 13:** `const legacy = await AccommodationInventory.find({ tenantId }).sort({ propertyName: 1, roomType: 1 }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 14:** `let hotelsCreated = 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `let roomsCreated = 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `let roomsUpdated = 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 18:** `for (const item of legacy) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 19:** `const propertyName = clean(item.propertyName);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `const roomName = clean(item.roomType);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `if (!propertyName || !roomName) continue;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 23:** `let hotel = await Hotel.findOne({ tenantId, name: propertyName });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 24:** `if (!hotel) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 25:** `const baseSlug = slugify(propertyName) || \`hotel-${Date.now()}\`;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 26:** `let slug = baseSlug;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 27:** `let suffix = 2;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 28:** `while (await Hotel.exists({ tenantId, slug })) slug = \`${baseSlug}-${suffix++}\`;` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 29:** `hotel = await Hotel.create({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 5: `const clean = (value) => String(value ?? "").trim();`.
- Line 6: `const slugify = (value) => clean(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 170);`.
- Line 8: `export const syncAccommodationInventoryToHotelPms = async (req, res, next) => {`.
- Line 10: `const tenantId = req.tenantId || req.user?.tenantId;`.
- Line 13: `const legacy = await AccommodationInventory.find({ tenantId }).sort({ propertyName: 1, roomType: 1 }).lean();`.
- Line 14: `let hotelsCreated = 0;`.
- Line 15: `let roomsCreated = 0;`.
- Line 16: `let roomsUpdated = 0;`.
- Line 19: `const propertyName = clean(item.propertyName);`.
- Line 20: `const roomName = clean(item.roomType);`.
- Line 23: `let hotel = await Hotel.findOne({ tenantId, name: propertyName });`.
- Line 25: `const baseSlug = slugify(propertyName) || \`hotel-${Date.now()}\`;`.
- Line 26: `let slug = baseSlug;`.
- Line 27: `let suffix = 2;`.
- Line 44: `const payload = {`.
- Line 57: `const existing = await HotelRoomType.findOne({ tenantId, hotel: hotel._id, name: roomName });`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
