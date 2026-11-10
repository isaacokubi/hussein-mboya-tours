# Source explanation: server/controllers/travelOperationsController.js

**Source:** [server/controllers/travelOperationsController.js](../../../server/controllers/travelOperationsController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `OperationalAsset` from `../models/OperationalAsset.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/OperationalAsset.js](../../../server/models/OperationalAsset.js)
- `TravelCommercialRule` from `../models/TravelCommercialRule.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/TravelCommercialRule.js](../../../server/models/TravelCommercialRule.js)
- `createScheduledOperation`, `updateScheduledOperation` from `../services/travelOperationsService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/travelOperationsService.js](../../../server/services/travelOperationsService.js)

## Runtime declarations and data flow

### `listOperations` — lines 8–14

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.user, req.query. Persistent operations detected: OperationalAsset.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 9:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 10:** `const filter = { tenantId: req.user.tenantId };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 11:** `for (const key of ["type", "status", "bookingId", "tourId", "assignedTo"]) if (req.query[key]) filter[key] = req.query[key];` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 12:** `res.json({ success: true, data: await OperationalAsset.find(filter).sort({ startAt: 1, createdAt: -1 }).lean() });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `createOperation` — lines 16–23

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 17:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 18:** `if (!TYPES.has(req.body.type) || !req.body.name) return res.status(400).json({ success: false, message: "Valid type and name are required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 19:** `if (req.body.startAt && req.body.endAt && new Date(req.body.endAt) <= new Date(req.body.startAt)) return res.status(400).json({ success: false, message: "End time must be after start time." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 20:** `const item = await createScheduledOperation({ ...req.body, tenantId: req.user.tenantId, createdBy: req.user._id });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 21:** `res.status(201).json({ success: true, data: item });` — Builds an HTTP response with an explicit status and JSON payload.

### `updateOperation` — lines 25–35

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.user, req.body. Persistent operations detected: OperationalAsset.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 26:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 27:** `const item = await OperationalAsset.findOne({ _id: req.params.id, tenantId: req.user.tenantId });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 28:** `if (!item) return res.status(404).json({ success: false, message: "Operation not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 29:** `const allowed = ["name", "code", "status", "bookingId", "tourId", "assignedTo", "startAt", "endAt", "metadata", "notes"];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 30:** `const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 32:** `await updateScheduledOperation(item, updates);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 33:** `res.json({ success: true, data: item });` — Sends a JSON response; inspect its caller for status and error semantics.

### `deleteOperation` — lines 37–43

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.user. Persistent operations detected: OperationalAsset.deleteOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 38:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 39:** `const result = await OperationalAsset.deleteOne({ _id: req.params.id, tenantId: req.user.tenantId });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 40:** `if (!result.deletedCount) return res.status(404).json({ success: false, message: "Operation not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 41:** `res.json({ success: true });` — Sends a JSON response; inspect its caller for status and error semantics.

### `listRules` — lines 45–51

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.user, req.query. Persistent operations detected: TravelCommercialRule.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 46:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 47:** `const filter = { tenantId: req.user.tenantId };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 48:** `if (req.query.type && RULES.has(req.query.type)) filter.type = req.query.type;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 49:** `res.json({ success: true, data: await TravelCommercialRule.find(filter).sort({ priority: -1, createdAt: -1 }).lean() });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `createRule` — lines 53–59

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user. Persistent operations detected: TravelCommercialRule.create; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 54:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 55:** `if (!RULES.has(req.body.type) || !req.body.name) return res.status(400).json({ success: false, message: "Valid rule type and name are required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 56:** `const rule = await TravelCommercialRule.create({ ...req.body, tenantId: req.user.tenantId });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 57:** `res.status(201).json({ success: true, data: rule });` — Builds an HTTP response with an explicit status and JSON payload.

### `updateRule` — lines 61–67

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.user, req.body. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 62:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 63:** `const rule = await TravelCommercialRule.findOneAndUpdate({ _id: req.params.id, tenantId: req.user.tenantId }, { $set: req.body }, { new: true, runValidators: true });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 64:** `if (!rule) return res.status(404).json({ success: false, message: "Rule not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 65:** `res.json({ success: true, data: rule });` — Sends a JSON response; inspect its caller for status and error semantics.

### `deleteRule` — lines 69–75

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.user. Persistent operations detected: TravelCommercialRule.deleteOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 70:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 71:** `const result = await TravelCommercialRule.deleteOne({ _id: req.params.id, tenantId: req.user.tenantId });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 72:** `if (!result.deletedCount) return res.status(404).json({ success: false, message: "Rule not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 73:** `res.json({ success: true });` — Sends a JSON response; inspect its caller for status and error semantics.

## Module-level declarations

- Line 5: `const TYPES = new Set(["transfer", "vehicle", "driver", "guide", "room", "voucher", "traveller_document", "incident", "park_fee"]);`.
- Line 6: `const RULES = new Set(["dynamic_price", "park_fee", "loyalty", "referral"]);`.
- Line 8: `export const listOperations = async (req, res, next) => {`.
- Line 10: `const filter = { tenantId: req.user.tenantId };`.
- Line 16: `export const createOperation = async (req, res, next) => {`.
- Line 20: `const item = await createScheduledOperation({ ...req.body, tenantId: req.user.tenantId, createdBy: req.user._id });`.
- Line 25: `export const updateOperation = async (req, res, next) => {`.
- Line 27: `const item = await OperationalAsset.findOne({ _id: req.params.id, tenantId: req.user.tenantId });`.
- Line 29: `const allowed = ["name", "code", "status", "bookingId", "tourId", "assignedTo", "startAt", "endAt", "metadata", "notes"];`.
- Line 30: `const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));`.
- Line 37: `export const deleteOperation = async (req, res, next) => {`.
- Line 39: `const result = await OperationalAsset.deleteOne({ _id: req.params.id, tenantId: req.user.tenantId });`.
- Line 45: `export const listRules = async (req, res, next) => {`.
- Line 47: `const filter = { tenantId: req.user.tenantId };`.
- Line 53: `export const createRule = async (req, res, next) => {`.
- Line 56: `const rule = await TravelCommercialRule.create({ ...req.body, tenantId: req.user.tenantId });`.
- Line 61: `export const updateRule = async (req, res, next) => {`.
- Line 63: `const rule = await TravelCommercialRule.findOneAndUpdate({ _id: req.params.id, tenantId: req.user.tenantId }, { $set: req.body }, { new: true, runValidators: true });`.
- Line 69: `export const deleteRule = async (req, res, next) => {`.
- Line 71: `const result = await TravelCommercialRule.deleteOne({ _id: req.params.id, tenantId: req.user.tenantId });`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
