# Source explanation: server/controllers/superAdminDashboardMetricsController.js

**Source:** [server/controllers/superAdminDashboardMetricsController.js](../../../server/controllers/superAdminDashboardMetricsController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `publicErrorMessage` from `../utils/publicError.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/utils/publicError.js](../../../server/utils/publicError.js)
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getCanonicalSuperAdminCustomerMetrics` from `../services/superAdminDataConsistency.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/superAdminDataConsistency.js](../../../server/services/superAdminDataConsistency.js)

## Runtime declarations and data flow

### `count` — lines 5–6

Parameters: `db`, `collection`, `filter (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 6:** `db.collection(collection).countDocuments(filter)` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.

### `sum` — lines 8–9

Parameters: `rows`, `key`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getSuperAdminDashboardMetrics` — lines 11–272

Parameters: `_req`, `res`.
6 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 12:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 13:** `const db = mongoose.connection.db;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `if (!db) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 16:** `return res.status(503).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 22:** `const tenantRows = await db` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 24:** `.find({ status: { $in: ["active", "trial"] } })` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 36:** `const tenantIds = tenantRows.map((tenant) => tenant._id);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `const tenantFilter = tenantIds.length` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `const nonDeleted = { isDeleted: { $ne: true } };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `const customerMetrics = await getCanonicalSuperAdminCustomerMetrics(db, tenantIds);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 43:** `const [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 100:** `const [revenueRows, tenantSummaries] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 103:** `.aggregate([` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 155:** `const scope = { tenantId: tenant._id };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 156:** `const tenantCustomerMetrics = await getCanonicalSuperAdminCustomerMetrics(db, [tenant._id]);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 157:** `const [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 181:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 205:** `const primary = revenueRows.find((row) => row.currency === "KES") || revenueRows[0] || null;` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 5: `const count = async (db, collection, filter = {}) =>`.
- Line 8: `const sum = (rows, key) =>`.
- Line 11: `export const getSuperAdminDashboardMetrics = async (_req, res) => {`.
- Line 13: `const db = mongoose.connection.db;`.
- Line 22: `const tenantRows = await db`.
- Line 36: `const tenantIds = tenantRows.map((tenant) => tenant._id);`.
- Line 37: `const tenantFilter = tenantIds.length`.
- Line 40: `const nonDeleted = { isDeleted: { $ne: true } };`.
- Line 41: `const customerMetrics = await getCanonicalSuperAdminCustomerMetrics(db, tenantIds);`.
- Line 43: `const [`.
- Line 100: `const [revenueRows, tenantSummaries] = await Promise.all([`.
- Line 155: `const scope = { tenantId: tenant._id };`.
- Line 156: `const tenantCustomerMetrics = await getCanonicalSuperAdminCustomerMetrics(db, [tenant._id]);`.
- Line 157: `const [`.
- Line 205: `const primary = revenueRows.find((row) => row.currency === "KES") || revenueRows[0] || null;`.
- Line 206: `const tenantCount = tenantRows.length;`.
- Line 207: `const activeTenantCount = tenantRows.filter((tenant) => tenant.status === "active").length;`.
- Line 208: `const trialTenantCount = tenantRows.filter((tenant) => tenant.status === "trial").length;`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
