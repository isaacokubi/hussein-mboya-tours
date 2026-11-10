# Source explanation: server/controllers/privacyController.js

**Source:** [server/controllers/privacyController.js](../../../server/controllers/privacyController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `PrivacyRequest` from `../models/PrivacyRequest.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/PrivacyRequest.js](../../../server/models/PrivacyRequest.js)
- `Customer` from `../models/Customer.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Customer.js](../../../server/models/Customer.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `createPrivacyRequest` — lines 11–26

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body. Persistent operations detected: Customer.findOne, PrivacyRequest.create; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 12:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 13:** `const tenantId = requireTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 14:** `const type = String(req.body?.type || "").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `const requesterName = String(req.body?.requesterName || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `if (!TYPES.includes(type) || requesterName.length < 2) return res.status(400).json({ success: false, message: "Valid request type and requester name are required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 17:** `let customer = null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 18:** `if (req.body?.customer) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 19:** `if (!mongoose.isValidObjectId(req.body.customer)) return res.status(400).json({ success: false, message: "Invalid customer ID." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 20:** `customer = await Customer.findOne(mergeTenantFilter(req, { _id: req.body.customer })).select("_id").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 21:** `if (!customer) return res.status(404).json({ success: false, message: "Customer not found in this tenant." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 23:** `const request = await PrivacyRequest.create({ tenantId, type, requesterName, requesterEmail: String(req.body?.requesterEmail || "").trim().toLowerCase(), requesterPhone: String(req.body?.requesterPhone || "").trim(), cus` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 24:** `return res.status(201).json({ success: true, data: { requestNumber: request.requestNumber, status: request.status, receivedAt: request.receivedAt, dueAt: request.dueAt } });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `listPrivacyRequests` — lines 28–30

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: PrivacyRequest.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 29:** `try { requireTenantId(); const data = await PrivacyRequest.find(mergeTenantFilter(req, req.query?.status ? { status: req.query.status } : {})).populate("customer", "name email phone").populate("assignedTo", "name email")` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.

### `updatePrivacyRequest` — lines 32–54

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body. Persistent operations detected: PrivacyRequest.findOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 9 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 33:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 35:** `if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid privacy request ID." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 36:** `const request = await PrivacyRequest.findOne(mergeTenantFilter(req, { _id: req.params.id }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 37:** `if (!request) return res.status(404).json({ success: false, message: "Privacy request not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 38:** `const update = {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 39:** `if (req.body?.status !== undefined) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 40:** `const status = String(req.body.status).toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `if (!STATUSES.includes(status)) return res.status(400).json({ success: false, message: "Invalid privacy request status." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 42:** `if (status !== request.status && !TRANSITIONS[request.status]?.includes(status)) return res.status(409).json({ success: false, message: \`Privacy request cannot transition from ${request.status} to ${status}.\` });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 45:** `if (req.body?.assignedTo !== undefined) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 46:** `if (req.body.assignedTo && !mongoose.isValidObjectId(req.body.assignedTo)) return res.status(400).json({ success: false, message: "Invalid assignee ID." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 47:** `if (req.body.assignedTo && !(await User.exists(mergeTenantFilter(req, { _id: req.body.assignedTo })))) return res.status(404).json({ success: false, message: "Assignee not found in this tenant." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 50:** `if (req.body?.resolutionNotes !== undefined) update.resolutionNotes = String(req.body.resolutionNotes || "").trim();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 51:** `const updated = await PrivacyRequest.findOneAndUpdate({ ...mergeTenantFilter(req, { _id: request._id }) }, { $set: update }, { new: true, runValidators: true }).populate("assignedTo", "name email");` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 52:** `return res.json({ success: true, data: updated });` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 7: `const TYPES = ["access", "correction", "deletion", "portability", "objection", "restriction"];`.
- Line 8: `const STATUSES = ["received", "identity_verification", "in_progress", "completed", "rejected", "cancelled"];`.
- Line 9: `const TRANSITIONS = { received: ["identity_verification", "in_progress", "rejected", "cancelled"], identity_verification: ["in_progress", "rejected", "cancelled"], in_progress: ["c`.
- Line 13: `const tenantId = requireTenantId();`.
- Line 14: `const type = String(req.body?.type || "").toLowerCase();`.
- Line 15: `const requesterName = String(req.body?.requesterName || "").trim();`.
- Line 17: `let customer = null;`.
- Line 23: `const request = await PrivacyRequest.create({ tenantId, type, requesterName, requesterEmail: String(req.body?.requesterEmail || "").trim().toLowerCase(), requesterPhone: String(req`.
- Line 36: `const request = await PrivacyRequest.findOne(mergeTenantFilter(req, { _id: req.params.id }));`.
- Line 38: `const update = {};`.
- Line 40: `const status = String(req.body.status).toLowerCase();`.
- Line 51: `const updated = await PrivacyRequest.findOneAndUpdate({ ...mergeTenantFilter(req, { _id: request._id }) }, { $set: update }, { new: true, runValidators: true }).populate("assignedT`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
