# Source explanation: server/controllers/galleryController.js

**Source:** [server/controllers/galleryController.js](../../../server/controllers/galleryController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `getTenantContext`, `mergeTenantFilter` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Gallery` from `../models/Gallery.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Gallery.js](../../../server/models/Gallery.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)

## Runtime declarations and data flow

### `isUsableImage` — lines 11–26

Parameters: `value`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 12:** `const url = typeof value === "string"` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `if (!url || typeof url !== "string") return false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 18:** `const normalized = url.trim().toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `if (!normalized) return false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 21:** `return !(` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `normalizeImage` — lines 28–35

Parameters: `value`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 29:** `if (!isUsableImage(value)) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 31:** `if (typeof value === "string") return { url: value };` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 33:** `const url = value?.url || value?.secure_url || value?.path;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `return url ? { ...value, url } : null;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getFeaturedGallery` — lines 37–110

Parameters: `req`, `res`, `next`.
Persistent operations detected: Gallery.find, Tour.find; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 38:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 39:** `const context = getTenantContext();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `const platformWide = context.bypass === true;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `const galleryFilter = platformWide` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 48:** `const galleryRecords = await Gallery.find(galleryFilter)` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 54:** `let images = galleryRecords` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 56:** `const image = normalizeImage(item.image);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 57:** `return image ? { ...item, image } : null;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 64:** `if (images.length === 0) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 65:** `const tourFilter = platformWide` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 69:** `const tours = await Tour.find(tourFilter)` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 77:** `const candidates = [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 87:** `return candidates.slice(0, 4).map((image, index) => ({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 101:** `return res.json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 108:** `return next(error);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `healthCheck` — lines 112–114

Parameters: `req`, `res`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 113:** `res.json({ success: true, message: "Module operational" });` — Sends a JSON response; inspect its caller for status and error semantics.

## Module-level declarations

- Line 5: `const publicTourFilter = {`.
- Line 11: `const isUsableImage = (value) => {`.
- Line 12: `const url = typeof value === "string"`.
- Line 18: `const normalized = url.trim().toLowerCase();`.
- Line 28: `const normalizeImage = (value) => {`.
- Line 33: `const url = value?.url || value?.secure_url || value?.path;`.
- Line 37: `export const getFeaturedGallery = async (req, res, next) => {`.
- Line 39: `const context = getTenantContext();`.
- Line 40: `const platformWide = context.bypass === true;`.
- Line 42: `const galleryFilter = platformWide`.
- Line 48: `const galleryRecords = await Gallery.find(galleryFilter)`.
- Line 54: `let images = galleryRecords`.
- Line 56: `const image = normalizeImage(item.image);`.
- Line 65: `const tourFilter = platformWide`.
- Line 69: `const tours = await Tour.find(tourFilter)`.
- Line 77: `const candidates = [`.
- Line 112: `export const healthCheck = async (req, res) => {`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
