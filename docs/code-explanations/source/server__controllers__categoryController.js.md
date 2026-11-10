# Source explanation: server/controllers/categoryController.js

**Source:** [server/controllers/categoryController.js](../../../server/controllers/categoryController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `tenantFilter` from `../tenancy/tenantQuery.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/tenantQuery.js](../../../server/tenancy/tenantQuery.js)
- `TourCategory` from `../models/TourCategory.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/TourCategory.js](../../../server/models/TourCategory.js)

## Runtime declarations and data flow

### `getCategories` — lines 12–14

Parameters: `req`, `res`, `next`.
Persistent operations detected: TourCategory.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 13:** `try { requireTenantId(); const categories = await TourCategory.find({ ...tenantFilter(req), active: true }).sort({ createdAt: -1 }); res.json({ success: true, categories }); } catch (error) { next(error); }` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.

### `getAdminCategories` — lines 16–31

Parameters: `req`, `res`, `next`.
Persistent operations detected: TourCategory.find; verify tenant/ownership filters in the exact query. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 17:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 18:** `const tenantId = requireTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `let categories = await TourCategory.find(tenantFilter(req)).sort({ createdAt: -1 });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 20:** `if (categories.length === 0) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 21:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 22:** `await TourCategory.insertMany(DEFAULT_CATEGORIES.map((category) => ({ ...category, tenantId, active: true })), { ordered: false });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 23:** `categories = await TourCategory.find(tenantFilter(req)).sort({ createdAt: -1 });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 25:** `if (seedError?.code !== 11000) throw seedError;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 26:** `categories = await TourCategory.find(tenantFilter(req)).sort({ createdAt: -1 });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 29:** `res.json({ success: true, categories });` — Sends a JSON response; inspect its caller for status and error semantics.

### `createCategory` — lines 33–43

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body. Persistent operations detected: TourCategory.create; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 34:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 35:** `const tenantId = requireTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 36:** `const { name, slug, icon, description, image, active } = req.body;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `if (!name?.trim()) return res.status(400).json({ success: false, message: "Name is required" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 38:** `if (!description?.trim()) return res.status(400).json({ success: false, message: "Description is required" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 39:** `const normalizedSlug = (slug || name).toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `const category = await TourCategory.create({ tenantId, name: name.trim(), slug: normalizedSlug, icon: icon?.trim() || "Map", description: description.trim(), image: image?.trim() || "", active: active !== false });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 41:** `res.status(201).json({ success: true, category });` — Builds an HTTP response with an explicit status and JSON payload.
- **Line 42:** `} catch (error) { if (error?.code === 11000) return res.status(409).json({ success: false, message: "A travel experience with this slug already exists" }); next(error); }` — Builds an HTTP response with an explicit status and JSON payload.

### `updateCategory` — lines 45–61

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.params. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 46:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 48:** `const { name, slug, icon, description, image, active } = req.body;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 49:** `const update = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 57:** `const category = await TourCategory.findOneAndUpdate(mergeTenantFilter(req, { _id: req.params.id }), update, { new: true, runValidators: true });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 58:** `if (!category) return res.status(404).json({ success: false, message: "Travel experience not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 59:** `res.json({ success: true, category });` — Sends a JSON response; inspect its caller for status and error semantics.
- **Line 60:** `} catch (error) { if (error?.code === 11000) return res.status(409).json({ success: false, message: "A travel experience with this slug already exists" }); next(error); }` — Builds an HTTP response with an explicit status and JSON payload.

### `deleteCategory` — lines 63–65

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 64:** `try { requireTenantId(); const category = await TourCategory.findOneAndDelete(mergeTenantFilter(req, { _id: req.params.id })); if (!category) return res.status(404).json({ success: false, message: "Travel experience not ` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.

### `healthCheck` — lines 66–66

Parameters: `req`, `res`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 66:** `async (req, res) => res.json({ success: true, message: "Module operational" })` — Sends a JSON response; inspect its caller for status and error semantics.

## Module-level declarations

- Line 5: `const DEFAULT_CATEGORIES = [`.
- Line 12: `export const getCategories = async (req, res, next) => {`.
- Line 16: `export const getAdminCategories = async (req, res, next) => {`.
- Line 18: `const tenantId = requireTenantId();`.
- Line 19: `let categories = await TourCategory.find(tenantFilter(req)).sort({ createdAt: -1 });`.
- Line 33: `export const createCategory = async (req, res, next) => {`.
- Line 35: `const tenantId = requireTenantId();`.
- Line 36: `const { name, slug, icon, description, image, active } = req.body;`.
- Line 39: `const normalizedSlug = (slug || name).toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");`.
- Line 40: `const category = await TourCategory.create({ tenantId, name: name.trim(), slug: normalizedSlug, icon: icon?.trim() || "Map", description: description.trim(), image: image?.trim() |`.
- Line 45: `export const updateCategory = async (req, res, next) => {`.
- Line 48: `const { name, slug, icon, description, image, active } = req.body;`.
- Line 49: `const update = {`.
- Line 57: `const category = await TourCategory.findOneAndUpdate(mergeTenantFilter(req, { _id: req.params.id }), update, { new: true, runValidators: true });`.
- Line 63: `export const deleteCategory = async (req, res, next) => {`.
- Line 66: `export const healthCheck = async (req, res) => res.json({ success: true, message: "Module operational" });`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
