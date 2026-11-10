# Source explanation: server/controllers/adminPackageController.js

**Source:** [server/controllers/adminPackageController.js](../../../server/controllers/adminPackageController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `TourPackage` from `../models/TourPackage.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/TourPackage.js](../../../server/models/TourPackage.js)
- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `slugify` — lines 5–5

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `packagePayload` — lines 14–53

Parameters: `body (defaulted)`, `existing (defaulted)`.
16 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 15:** `const payload = Object.fromEntries(Object.entries(body).filter(([key]) => fields.includes(key)));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `const current = existing?.toObject?.() || existing || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `if (body.published !== undefined && typeof body.published !== "boolean") throw Object.assign(new Error("published must be a boolean."), { status: 400 });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 18:** `for (const key of ["title", "description", "destination", "duration"]) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 19:** `if (payload[key] !== undefined) payload[key] = String(payload[key]).trim();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 21:** `for (const key of ["title", "description", "destination", "duration", "category"]) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 22:** `if (!String(payload[key] ?? current[key] ?? "").trim()) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 23:** `throw Object.assign(new Error("Title, description, destination, category and duration are required."), { status: 400 });` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 26:** `if (!existing || body.slug !== undefined) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 28:** `if (!payload.slug) throw Object.assign(new Error("A valid package slug is required."), { status: 400 });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 30:** `if (!existing) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 34:** `if (!allowedStatuses.has(payload.status)) throw Object.assign(new Error("Invalid package status."), { status: 400 });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 35:** `if (body.published !== undefined && typeof body.published !== "boolean") throw Object.assign(new Error("published must be a boolean."), { status: 400 });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 38:** `for (const key of ["basePrice", "agentPrice"]) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 39:** `const value = payload[key] ?? current[key];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `if (value !== undefined) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 42:** `if (!Number.isFinite(payload[key]) || payload[key] < 0) throw Object.assign(new Error("Base and agent prices must be valid non-negative amounts."), { status: 400 });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 45:** `if (payload.duration !== undefined || !existing) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `listAdminPackages` — lines 55–61

Parameters: `req`, `res`, `next`.
Persistent operations detected: TourPackage.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 56:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 58:** `const packages = await TourPackage.find(mergeTenantFilter(req, { isDeleted: { $ne: true } })).sort({ createdAt: -1 }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 59:** `return res.json({ success: true, count: packages.length, packages });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `listPublicPackages` — lines 63–77

Parameters: `req`, `res`, `next`.
Persistent operations detected: TourPackage.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 64:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 66:** `const records = await TourPackage.find(mergeTenantFilter(req, {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 69:** `const image = (item) => item ? { url: item.url, caption: item.caption } : undefined;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 70:** `const packages = records.map((item) => ({` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 75:** `return res.json({ success: true, count: packages.length, packages });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `image` — lines 69–69

Parameters: `item`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `createAdminPackage` — lines 79–89

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user. Persistent operations detected: TourPackage.create; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 80:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 81:** `const tenantId = requireTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 82:** `const payload = packagePayload(req.body);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 83:** `const created = await TourPackage.create({ ...payload, tenantId, createdBy: req.user._id });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 84:** `return res.status(201).json({ success: true, package: created });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 86:** `if (error?.code === 11000) return res.status(409).json({ success: false, message: "A package with this slug already exists in this tenant." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 87:** `return next(error);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `updateAdminPackage` — lines 91–113

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body. Persistent operations detected: TourPackage.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 7 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 92:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 94:** `if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid package ID." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 95:** `const existing = await TourPackage.findOne(mergeTenantFilter(req, { _id: req.params.id, isDeleted: { $ne: true } }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 96:** `if (!existing) return res.status(404).json({ success: false, message: "Package not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 97:** `const payload = packagePayload(req.body, existing);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 98:** `if (req.body?.slug !== undefined) payload.slug = slugify(req.body.slug);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 99:** `if (req.body?.status !== undefined) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 100:** `if (!allowedStatuses.has(String(req.body.status))) return res.status(400).json({ success: false, message: "Invalid package status." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 103:** `if (req.body?.published !== undefined) payload.published = req.body.published === true;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 104:** `const updated = await TourPackage.findOneAndUpdate(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 108:** `return res.json({ success: true, package: updated });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 110:** `if (error?.code === 11000) return res.status(409).json({ success: false, message: "A package with this slug already exists in this tenant." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 111:** `return next(error);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `deleteAdminPackage` — lines 115–126

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 116:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 118:** `if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid package ID." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 119:** `const deleted = await TourPackage.findOneAndUpdate(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 123:** `if (!deleted) return res.status(404).json({ success: false, message: "Package not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 124:** `return res.json({ success: true, deleted: true, packageId: String(deleted._id) });` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 5: `const slugify = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100);`.
- Line 6: `const fields = [`.
- Line 12: `const allowedStatuses = new Set(["draft", "active", "inactive", "sold_out"]);`.
- Line 14: `const packagePayload = (body = {}, existing = null) => {`.
- Line 15: `const payload = Object.fromEntries(Object.entries(body).filter(([key]) => fields.includes(key)));`.
- Line 16: `const current = existing?.toObject?.() || existing || {};`.
- Line 39: `const value = payload[key] ?? current[key];`.
- Line 46: `const value = payload.duration ?? current.duration;`.
- Line 47: `const match = String(value || "").match(/^\s*(\d+(?:\.\d+)?)\s*(?:days?|nights?)?\s*$/i);`.
- Line 48: `const durationDays = Number(match?.[1]);`.
- Line 58: `const packages = await TourPackage.find(mergeTenantFilter(req, { isDeleted: { $ne: true } })).sort({ createdAt: -1 }).lean();`.
- Line 66: `const records = await TourPackage.find(mergeTenantFilter(req, {`.
- Line 69: `const image = (item) => item ? { url: item.url, caption: item.caption } : undefined;`.
- Line 70: `const packages = records.map((item) => ({`.
- Line 81: `const tenantId = requireTenantId();`.
- Line 82: `const payload = packagePayload(req.body);`.
- Line 83: `const created = await TourPackage.create({ ...payload, tenantId, createdBy: req.user._id });`.
- Line 95: `const existing = await TourPackage.findOne(mergeTenantFilter(req, { _id: req.params.id, isDeleted: { $ne: true } }));`.
- Line 97: `const payload = packagePayload(req.body, existing);`.
- Line 104: `const updated = await TourPackage.findOneAndUpdate(`.
- Line 119: `const deleted = await TourPackage.findOneAndUpdate(`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
