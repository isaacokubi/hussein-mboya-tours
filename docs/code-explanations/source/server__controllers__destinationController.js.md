# Source explanation: server/controllers/destinationController.js

**Source:** [server/controllers/destinationController.js](../../../server/controllers/destinationController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `getTenantContext`, `mergeTenantFilter` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Destination` from `../models/Destination.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Destination.js](../../../server/models/Destination.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)

## Runtime declarations and data flow

### `escapeRegex` — lines 12–12

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `parsePage` — lines 13–16

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 14:** `const page = Number(value);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `return Number.isSafeInteger(page) && page > 0 ? Math.min(page, 10_000) : 1;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `parsePageSize` — lines 17–20

Parameters: `value`, `fallback (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 18:** `const size = Number(value);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `return Number.isSafeInteger(size) ? Math.min(Math.max(size, 1), 24) : fallback;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `withPublicDestinationContext` — lines 22–26

Parameters: `callback`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 23:** `const context = getTenantContext();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `if (context.bypass === true) return callback(true);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 25:** `return callback(false);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getDestinations` — lines 28–61

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: Destination.find, Destination.countDocuments; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 29:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 30:** `return await withPublicDestinationContext(async (platformWide) => {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 31:** `const { page = 1, limit = 12, search, country, featured } = req.query;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 32:** `const currentPage = parsePage(page);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 33:** `const pageSize = parsePageSize(limit);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `const skip = (currentPage - 1) * pageSize;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `const filter = platformWide ? { ...publicDestinationFilter } : mergeTenantFilter({ ...publicDestinationFilter });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 36:** `if (country) filter.country = country;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 37:** `if (featured === "true") filter.featured = true;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 38:** `if (typeof search === "string" && search.trim()) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 39:** `const keyword = escapeRegex(search.trim().slice(0, 120));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 47:** `const [destinations, total] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 48:** `Destination.find(filter).select("name slug description shortDescription country city region images featured tenantId").slice("images", 1).sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 49:** `Destination.countDocuments(filter),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 51:** `return res.status(200).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getDestination` — lines 63–118

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: Destination.findOne, Tour.find, Destination.find; verify tenant/ownership filters in the exact query. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 64:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 65:** `return await withPublicDestinationContext(async (platformWide) => {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 66:** `const slug = req.params.slug?.trim().toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 67:** `if (!slug) return res.status(400).json({ success: false, message: "Destination slug is required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 68:** `const destinationFilter = platformWide` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 71:** `let destination = await Destination.findOne(destinationFilter).select("name slug description shortDescription country city region images featured tenantId seo").slice("images", 5).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 78:** `if (!destination) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 79:** `const canonicalName = slug.replace(/-/g, " ").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 80:** `const aliases = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 85:** `const candidates = aliases[canonicalName] || [canonicalName];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 86:** `const namePatterns = candidates.map((candidate) => candidate.split(" ").filter(Boolean).join(".*"));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 87:** `const nameFilter = platformWide` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 90:** `destination = await Destination.findOne(nameFilter).select("name slug description shortDescription country city region images featured tenantId seo").slice("images", 5).sort({ createdAt: -1 }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 92:** `if (!destination) return res.status(404).json({ success: false, message: "Destination not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 94:** `const tourFilter = platformWide` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 97:** `const relatedFilter = platformWide` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 100:** `const [tours, relatedDestinations] = await Promise.all([Tour.find(tourFilter)` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 106:** `.lean(), Destination.find(relatedFilter)` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `getFeaturedDestinations` — lines 120–135

Parameters: `req`, `res`, `next`.
Persistent operations detected: Destination.find; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 121:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 122:** `return await withPublicDestinationContext(async (platformWide) => {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 123:** `const filter = platformWide` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 126:** `const destinations = await Destination.find(filter)` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 130:** `return res.status(200).json({ success: true, count: destinations.length, data: destinations });` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 5: `const publicDestinationFilter = { status: "active", active: true, isDeleted: false };`.
- Line 6: `const publicTourFilter = {`.
- Line 12: `const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");`.
- Line 13: `const parsePage = (value) => {`.
- Line 14: `const page = Number(value);`.
- Line 17: `const parsePageSize = (value, fallback = 12) => {`.
- Line 18: `const size = Number(value);`.
- Line 22: `const withPublicDestinationContext = async (callback) => {`.
- Line 23: `const context = getTenantContext();`.
- Line 28: `export const getDestinations = async (req, res, next) => {`.
- Line 31: `const { page = 1, limit = 12, search, country, featured } = req.query;`.
- Line 32: `const currentPage = parsePage(page);`.
- Line 33: `const pageSize = parsePageSize(limit);`.
- Line 34: `const skip = (currentPage - 1) * pageSize;`.
- Line 35: `const filter = platformWide ? { ...publicDestinationFilter } : mergeTenantFilter({ ...publicDestinationFilter });`.
- Line 39: `const keyword = escapeRegex(search.trim().slice(0, 120));`.
- Line 47: `const [destinations, total] = await Promise.all([`.
- Line 63: `export const getDestination = async (req, res, next) => {`.
- Line 66: `const slug = req.params.slug?.trim().toLowerCase();`.
- Line 68: `const destinationFilter = platformWide`.
- Line 71: `let destination = await Destination.findOne(destinationFilter).select("name slug description shortDescription country city region images featured tenantId seo").slice("images", 5).`.
- Line 79: `const canonicalName = slug.replace(/-/g, " ").trim();`.
- Line 80: `const aliases = {`.
- Line 85: `const candidates = aliases[canonicalName] || [canonicalName];`.
- Line 86: `const namePatterns = candidates.map((candidate) => candidate.split(" ").filter(Boolean).join(".*"));`.
- Line 87: `const nameFilter = platformWide`.
- Line 94: `const tourFilter = platformWide`.
- Line 97: `const relatedFilter = platformWide`.
- Line 100: `const [tours, relatedDestinations] = await Promise.all([Tour.find(tourFilter)`.
- Line 120: `export const getFeaturedDestinations = async (req, res, next) => {`.
- Line 123: `const filter = platformWide`.
- Line 126: `const destinations = await Destination.find(filter)`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
