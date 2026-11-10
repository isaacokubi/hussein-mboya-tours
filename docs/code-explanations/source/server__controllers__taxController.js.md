# Source explanation: server/controllers/taxController.js

**Source:** [server/controllers/taxController.js](../../../server/controllers/taxController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `TaxRule` from `../models/TaxRule.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/TaxRule.js](../../../server/models/TaxRule.js)
- `tenantFilter` from `../tenancy/tenantQuery.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/tenantQuery.js](../../../server/tenancy/tenantQuery.js)
- `ensureDefaultTaxRules`, `calculateTenantTax` from `../services/taxEngineService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/taxEngineService.js](../../../server/services/taxEngineService.js)

## Runtime declarations and data flow

### `actorId` — lines 5–5

Parameters: `req`.
Reads request/component inputs: req.user.

Key statements:

### `listTaxRules` — lines 7–15

Parameters: `req`, `res`, `next`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 8:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 12:** `const rules = await ensureDefaultTaxRules();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 13:** `return res.json({ success: true, data: rules });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `initializeTaxRules` — lines 17–20

Parameters: `req`, `res`, `next`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 18:** `try { return res.status(201).json({ success: true, data: await ensureDefaultTaxRules(req) }); }` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 19:** `catch (error) { return next(error); }` — Handles an exception from the preceding try block; check whether it returns, rethrows, logs safely, or continues.

### `upsertTaxRule` — lines 22–36

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.tenantId. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 23:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 24:** `const body = req.body || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `const code = String(body.code || "").trim().toUpperCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 26:** `const name = String(body.name || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 27:** `const rate = Number(body.rate);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 28:** `if (!code || !name || !Number.isFinite(rate) || rate < 0 || rate > 100) return res.status(400).json({ success: false, message: "Valid code, name and rate are required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 29:** `const data = await TaxRule.findOneAndUpdate(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 34:** `return res.status(200).json({ success: true, data });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `calculateTaxQuote` — lines 38–41

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 39:** `try { return res.json({ success: true, data: await calculateTenantTax(req.body || {}) }); }` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 40:** `catch (error) { return next(error); }` — Handles an exception from the preceding try block; check whether it returns, rethrows, logs safely, or continues.

## Module-level declarations

- Line 5: `const actorId = (req) => req.user?._id || req.user?.id || null;`.
- Line 7: `export const listTaxRules = async (req, res, next) => {`.
- Line 12: `const rules = await ensureDefaultTaxRules();`.
- Line 17: `export const initializeTaxRules = async (req, res, next) => {`.
- Line 22: `export const upsertTaxRule = async (req, res, next) => {`.
- Line 24: `const body = req.body || {};`.
- Line 25: `const code = String(body.code || "").trim().toUpperCase();`.
- Line 26: `const name = String(body.name || "").trim();`.
- Line 27: `const rate = Number(body.rate);`.
- Line 29: `const data = await TaxRule.findOneAndUpdate(`.
- Line 38: `export const calculateTaxQuote = async (req, res, next) => {`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
