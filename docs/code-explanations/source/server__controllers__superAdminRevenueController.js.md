# Source explanation: server/controllers/superAdminRevenueController.js

**Source:** [server/controllers/superAdminRevenueController.js](../../../server/controllers/superAdminRevenueController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `runWithTenant` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `money` — lines 5–5

Parameters: `field`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getSuperAdminRevenue` — lines 15–82

Parameters: `req`, `res`, `next`.
Persistent operations detected: Payment.aggregate; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 16:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 17:** `const result = await runWithTenant({ tenantId: null, tenant: null, bypass: true, role: "super_admin" }, async () => {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 18:** `const byCurrency = await Payment.aggregate([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 59:** `const totals = byCurrency.reduce((acc, item) => ({` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 66:** `const primary = byCurrency.find((item) => item.currency === "KES") || byCurrency[0] || null;` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 67:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 78:** `return res.json({ success: true, ...result });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 80:** `return next(error);` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 4: `const REVENUE_STATUSES = ["completed", "refunded"];`.
- Line 5: `const money = (field) => ({ $convert: { input: field, to: "double", onError: 0, onNull: 0 } });`.
- Line 15: `export const getSuperAdminRevenue = async (req, res, next) => {`.
- Line 17: `const result = await runWithTenant({ tenantId: null, tenant: null, bypass: true, role: "super_admin" }, async () => {`.
- Line 18: `const byCurrency = await Payment.aggregate([`.
- Line 59: `const totals = byCurrency.reduce((acc, item) => ({`.
- Line 66: `const primary = byCurrency.find((item) => item.currency === "KES") || byCurrency[0] || null;`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
