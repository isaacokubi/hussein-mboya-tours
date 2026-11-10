# Source explanation: server/controllers/travelServiceRequestController.js

**Source:** [server/controllers/travelServiceRequestController.js](../../../server/controllers/travelServiceRequestController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `TravelServiceRequest` from `../models/TravelServiceRequest.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/TravelServiceRequest.js](../../../server/models/TravelServiceRequest.js)
- `tenantFilter` from `../tenancy/tenantQuery.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/tenantQuery.js](../../../server/tenancy/tenantQuery.js)

## Runtime declarations and data flow

### `uid` — lines 4–4

Parameters: `req`.
Reads request/component inputs: req.user.

Key statements:

### `clean` — lines 5–5

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `listTravelServiceRequests` — lines 10–26

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: TravelServiceRequest.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 11:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 12:** `const filter = tenantFilter(req);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `if (req.query.type) filter.type = req.query.type;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 14:** `if (req.query.status) filter.status = req.query.status;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 15:** `if (req.query.priority) filter.priority = req.query.priority;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 16:** `if (req.query.booking) filter.booking = req.query.booking;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 17:** `const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 250);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 18:** `const data = await TravelServiceRequest.find(filter)` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 24:** `return res.json({ success: true, data });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `createTravelServiceRequest` — lines 28–42

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.tenantId. Persistent operations detected: TravelServiceRequest.create; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 29:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 30:** `const type = clean(req.body.type);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 31:** `const title = clean(req.body.title);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 32:** `if (!allowedTypes.has(type)) return res.status(400).json({ success: false, message: "Invalid travel service type." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 33:** `if (!title) return res.status(400).json({ success: false, message: "A request title is required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 34:** `const data = await TravelServiceRequest.create({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 40:** `return res.status(201).json({ success: true, data });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `updateTravelServiceRequest` — lines 44–58

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.params. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 45:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 46:** `const patch = { ...req.body, updatedBy: uid(req) };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 47:** `if (patch.status && !allowedStatuses.has(patch.status)) return res.status(400).json({ success: false, message: "Invalid request status." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 48:** `if (patch.priority && !allowedPriorities.has(patch.priority)) return res.status(400).json({ success: false, message: "Invalid request priority." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 49:** `if (patch.type && !allowedTypes.has(patch.type)) return res.status(400).json({ success: false, message: "Invalid travel service type." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 50:** `if (patch.status === "resolved") { patch.resolvedAt = new Date(); }` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 51:** `const data = await TravelServiceRequest.findOneAndUpdate({ ...tenantFilter(req), _id: req.params.id }, patch, { new: true, runValidators: true })` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 55:** `if (!data) return res.status(404).json({ success: false, message: "Service request not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 56:** `return res.json({ success: true, data });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getTravelServiceSummary` — lines 60–70

Parameters: `req`, `res`, `next`.
Persistent operations detected: TravelServiceRequest.aggregate, TravelServiceRequest.countDocuments; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 61:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 62:** `const filter = tenantFilter(req);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 63:** `const [byType, byStatus, urgent] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 64:** `TravelServiceRequest.aggregate([{ $match: filter }, { $group: { _id: "$type", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 65:** `TravelServiceRequest.aggregate([{ $match: filter }, { $group: { _id: "$status", count: { $sum: 1 } } }]),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 66:** `TravelServiceRequest.countDocuments({ ...filter, priority: "urgent", status: { $nin: ["resolved", "cancelled"] } }),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 68:** `return res.json({ success: true, data: { byType, byStatus, urgent } });` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 4: `const uid = (req) => req.user?._id || req.user?.id || null;`.
- Line 5: `const clean = (value) => String(value ?? "").trim();`.
- Line 6: `const allowedTypes = new Set(["airport_transfer", "accommodation", "rooming_list", "travel_document", "insurance", "manifest", "incident", "schedule", "cancellation", "special_serv`.
- Line 7: `const allowedStatuses = new Set(["open", "in_progress", "awaiting_customer", "resolved", "cancelled"]);`.
- Line 8: `const allowedPriorities = new Set(["low", "normal", "high", "urgent"]);`.
- Line 10: `export const listTravelServiceRequests = async (req, res, next) => {`.
- Line 12: `const filter = tenantFilter(req);`.
- Line 17: `const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 250);`.
- Line 18: `const data = await TravelServiceRequest.find(filter)`.
- Line 28: `export const createTravelServiceRequest = async (req, res, next) => {`.
- Line 30: `const type = clean(req.body.type);`.
- Line 31: `const title = clean(req.body.title);`.
- Line 34: `const data = await TravelServiceRequest.create({`.
- Line 44: `export const updateTravelServiceRequest = async (req, res, next) => {`.
- Line 46: `const patch = { ...req.body, updatedBy: uid(req) };`.
- Line 51: `const data = await TravelServiceRequest.findOneAndUpdate({ ...tenantFilter(req), _id: req.params.id }, patch, { new: true, runValidators: true })`.
- Line 60: `export const getTravelServiceSummary = async (req, res, next) => {`.
- Line 62: `const filter = tenantFilter(req);`.
- Line 63: `const [byType, byStatus, urgent] = await Promise.all([`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
