# Source explanation: server/controllers/adminHotelCreationController.js

**Source:** [server/controllers/adminHotelCreationController.js](../../../server/controllers/adminHotelCreationController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Hotel` from `../models/Hotel.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Hotel.js](../../../server/models/Hotel.js)

## Runtime declarations and data flow

### `clean` — lines 4–4

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `tenantIdOf` — lines 5–5

Parameters: `req`.
Reads request/component inputs: req.tenantId, req.user.

Key statements:

### `slugify` — lines 7–12

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `normalizeEmail` — lines 14–14

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `normalizeNumber` — lines 16–20

Parameters: `value`, `fallback (defaulted)`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 17:** `if (value === "" || value === null || value === undefined) return fallback;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 18:** `const number = Number(value);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `return Number.isFinite(number) ? number : NaN;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `createAdminHotel` — lines 22–110

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user. Persistent operations detected: Hotel.create; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 11 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 23:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 24:** `const tenantId = tenantIdOf(req);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `if (!tenantId || !mongoose.isValidObjectId(tenantId)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 26:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 32:** `const body = req.body || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 33:** `const name = clean(body.name);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `const city = clean(body.city);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `const location = clean(body.location);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `if (!name) return res.status(400).json({ success: false, message: "Hotel name is required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 38:** `if (!city) return res.status(400).json({ success: false, message: "City is required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 39:** `if (!location) return res.status(400).json({ success: false, message: "Location is required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 41:** `const starRating = normalizeNumber(body.starRating, 3);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `if (!Number.isInteger(starRating) || starRating < 1 || starRating > 5) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 43:** `return res.status(400).json({ success: false, message: "Star rating must be a whole number from 1 to 5." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 46:** `const latitude = normalizeNumber(body.latitude);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 47:** `const longitude = normalizeNumber(body.longitude);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 48:** `if (Number.isNaN(latitude) || latitude < -90 || latitude > 90) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 49:** `return res.status(400).json({ success: false, message: "Latitude must be between -90 and 90." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 4: `const clean = (value) => String(value ?? "").trim();`.
- Line 5: `const tenantIdOf = (req) => req.tenantId || req.user?.tenantId || null;`.
- Line 7: `const slugify = (value) =>`.
- Line 14: `const normalizeEmail = (value) => clean(value).toLowerCase();`.
- Line 16: `const normalizeNumber = (value, fallback = null) => {`.
- Line 18: `const number = Number(value);`.
- Line 22: `export const createAdminHotel = async (req, res, next) => {`.
- Line 24: `const tenantId = tenantIdOf(req);`.
- Line 32: `const body = req.body || {};`.
- Line 33: `const name = clean(body.name);`.
- Line 34: `const city = clean(body.city);`.
- Line 35: `const location = clean(body.location);`.
- Line 41: `const starRating = normalizeNumber(body.starRating, 3);`.
- Line 46: `const latitude = normalizeNumber(body.latitude);`.
- Line 47: `const longitude = normalizeNumber(body.longitude);`.
- Line 55: `const contactEmail = normalizeEmail(body.contactEmail);`.
- Line 60: `const requestedSlug = slugify(body.slug || name) || \`hotel-${Date.now()}\`;`.
- Line 61: `let slug = requestedSlug;`.
- Line 62: `let suffix = 2;`.
- Line 65: `const hotel = await Hotel.create({`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
