# Source explanation: server/controllers/operationalAssetController.js

**Source:** [server/controllers/operationalAssetController.js](../../../server/controllers/operationalAssetController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `OperationalAsset` from `../models/OperationalAsset.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/OperationalAsset.js](../../../server/models/OperationalAsset.js)

## Runtime declarations and data flow

### `listOperationalAssets` — lines 5–16

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query, req.user. Persistent operations detected: OperationalAsset.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 6:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 7:** `const { type, status, bookingId, tourId } = req.query;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 8:** `const filter = { tenantId: req.user.tenantId };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 9:** `if (type && allowedTypes.has(type)) filter.type = type;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 10:** `if (status) filter.status = status;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 11:** `if (bookingId) filter.bookingId = bookingId;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 12:** `if (tourId) filter.tourId = tourId;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 13:** `const items = await OperationalAsset.find(filter).sort({ startAt: 1, createdAt: -1 }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 14:** `res.json({ success: true, data: items });` — Sends a JSON response; inspect its caller for status and error semantics.

### `createOperationalAsset` — lines 18–26

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user. Persistent operations detected: OperationalAsset.create; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 19:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 20:** `const { type, name, code, status, bookingId, tourId, assignedTo, startAt, endAt, metadata, notes } = req.body;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `if (!allowedTypes.has(type) || !name) return res.status(400).json({ success: false, message: "type and name are required" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 22:** `if (startAt && endAt && new Date(endAt) <= new Date(startAt)) return res.status(400).json({ success: false, message: "endAt must be after startAt" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 23:** `const item = await OperationalAsset.create({ tenantId: req.user.tenantId, type, name, code, status, bookingId, tourId, assignedTo, startAt, endAt, metadata, notes, createdBy: req.user._id });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 24:** `res.status(201).json({ success: true, data: item });` — Builds an HTTP response with an explicit status and JSON payload.

### `updateOperationalAsset` — lines 28–39

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.user, req.body. Persistent operations detected: OperationalAsset.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 29:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 30:** `const item = await OperationalAsset.findOne({ _id: req.params.id, tenantId: req.user.tenantId });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 31:** `if (!item) return res.status(404).json({ success: false, message: "Operational record not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 32:** `const allowed = ["name", "code", "status", "bookingId", "tourId", "assignedTo", "startAt", "endAt", "metadata", "notes"];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 33:** `for (const key of allowed) if (req.body[key] !== undefined) item[key] = req.body[key];` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 34:** `if (item.startAt && item.endAt && item.endAt <= item.startAt) return res.status(400).json({ success: false, message: "endAt must be after startAt" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 36:** `await item.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 37:** `res.json({ success: true, data: item });` — Sends a JSON response; inspect its caller for status and error semantics.

### `deleteOperationalAsset` — lines 41–47

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.user. Persistent operations detected: OperationalAsset.deleteOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 42:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 43:** `const result = await OperationalAsset.deleteOne({ _id: req.params.id, tenantId: req.user.tenantId });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 44:** `if (!result.deletedCount) return res.status(404).json({ success: false, message: "Operational record not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 45:** `res.json({ success: true });` — Sends a JSON response; inspect its caller for status and error semantics.

## Module-level declarations

- Line 3: `const allowedTypes = new Set(["vehicle", "driver", "guide", "room", "transfer", "park_fee", "voucher", "traveller_document", "incident"]);`.
- Line 5: `export const listOperationalAssets = async (req, res, next) => {`.
- Line 7: `const { type, status, bookingId, tourId } = req.query;`.
- Line 8: `const filter = { tenantId: req.user.tenantId };`.
- Line 13: `const items = await OperationalAsset.find(filter).sort({ startAt: 1, createdAt: -1 }).lean();`.
- Line 18: `export const createOperationalAsset = async (req, res, next) => {`.
- Line 20: `const { type, name, code, status, bookingId, tourId, assignedTo, startAt, endAt, metadata, notes } = req.body;`.
- Line 23: `const item = await OperationalAsset.create({ tenantId: req.user.tenantId, type, name, code, status, bookingId, tourId, assignedTo, startAt, endAt, metadata, notes, createdBy: req.u`.
- Line 28: `export const updateOperationalAsset = async (req, res, next) => {`.
- Line 30: `const item = await OperationalAsset.findOne({ _id: req.params.id, tenantId: req.user.tenantId });`.
- Line 32: `const allowed = ["name", "code", "status", "bookingId", "tourId", "assignedTo", "startAt", "endAt", "metadata", "notes"];`.
- Line 41: `export const deleteOperationalAsset = async (req, res, next) => {`.
- Line 43: `const result = await OperationalAsset.deleteOne({ _id: req.params.id, tenantId: req.user.tenantId });`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
