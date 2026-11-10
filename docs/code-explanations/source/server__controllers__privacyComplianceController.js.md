# Source explanation: server/controllers/privacyComplianceController.js

**Source:** [server/controllers/privacyComplianceController.js](../../../server/controllers/privacyComplianceController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `PrivacyRequest` from `../models/PrivacyRequest.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/PrivacyRequest.js](../../../server/models/PrivacyRequest.js)
- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `getPrivacyComplianceSummary` — lines 4–19

Parameters: `req`, `res`, `next`.
Persistent operations detected: PrivacyRequest.countDocuments, PrivacyRequest.aggregate; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 5:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 6:** `const tenantId = requireTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 7:** `const now = new Date();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 8:** `const soon = new Date(now.getTime() + 7 * 86400000);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 9:** `const filter = mergeTenantFilter(req, {});` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 10:** `const [total, open, overdue, dueSoon, byType] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 11:** `PrivacyRequest.countDocuments(filter),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 12:** `PrivacyRequest.countDocuments({ ...filter, status: { $in: ["received", "identity_verification", "in_progress"] } }),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 13:** `PrivacyRequest.countDocuments({ ...filter, status: { $in: ["received", "identity_verification", "in_progress"] }, dueAt: { $lt: now } }),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 14:** `PrivacyRequest.countDocuments({ ...filter, status: { $in: ["received", "identity_verification", "in_progress"] }, dueAt: { $gte: now, $lte: soon } }),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 15:** `PrivacyRequest.aggregate([{ $match: filter }, { $group: { _id: "$type", count: { $sum: 1 } } }]),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 17:** `return res.json({ success: true, data: { tenantId, total, open, overdue, dueSoon, byType: Object.fromEntries(byType.map((item) => [item._id, item.count])), generatedAt: now.toISOString() } });` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 6: `const tenantId = requireTenantId();`.
- Line 7: `const now = new Date();`.
- Line 8: `const soon = new Date(now.getTime() + 7 * 86400000);`.
- Line 9: `const filter = mergeTenantFilter(req, {});`.
- Line 10: `const [total, open, overdue, dueSoon, byType] = await Promise.all([`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
