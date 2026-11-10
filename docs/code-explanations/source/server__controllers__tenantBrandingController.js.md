# Source explanation: server/controllers/tenantBrandingController.js

**Source:** [server/controllers/tenantBrandingController.js](../../../server/controllers/tenantBrandingController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `publicErrorMessage` from `../utils/publicError.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/utils/publicError.js](../../../server/utils/publicError.js)
- `Organization` from `../models/Organization.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Organization.js](../../../server/models/Organization.js)

## Runtime declarations and data flow

### `getBranding` — lines 4–36

Parameters: `req`, `res`.
Reads request/component inputs: req.tenantId. Persistent operations detected: Organization.findById; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 5:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 6:** `if (!req.tenantId) return res.status(404).json({ success: false, message: "Tenant not resolved" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 8:** `const tenant = await Organization.findById(req.tenantId).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 9:** `if (!tenant) return res.status(404).json({ success: false, message: "Tenant not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 11:** `return res.json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 34:** `return res.status(500).json({ success: false, message: publicErrorMessage(error) });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `updateBranding` — lines 38–76

Parameters: `req`, `res`.
Reads request/component inputs: req.tenantId, req.body. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 39:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 40:** `if (!req.tenantId) return res.status(400).json({ success: false, message: "Tenant not resolved" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 42:** `const allowed = [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 46:** `const updates = {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 47:** `for (const key of allowed) if (req.body?.[key] !== undefined) updates[key] = req.body[key];` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 49:** `const updated = await Organization.findOneAndUpdate(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 55:** `if (!updated) return res.status(404).json({ success: false, message: "Tenant not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 56:** `return res.json({ success: true, organization: {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 73:** `if (error?.code === 11000) return res.status(409).json({ success: false, message: "That custom domain is already assigned to another company." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 74:** `return res.status(500).json({ success: false, message: publicErrorMessage(error) });` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 8: `const tenant = await Organization.findById(req.tenantId).lean();`.
- Line 42: `const allowed = [`.
- Line 46: `const updates = {};`.
- Line 49: `const updated = await Organization.findOneAndUpdate(`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
