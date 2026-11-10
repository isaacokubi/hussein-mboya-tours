# Source explanation: server/services/kenyaStep2ReadinessService.js

**Source:** [server/services/kenyaStep2ReadinessService.js](../../../server/services/kenyaStep2ReadinessService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `ComplianceRecord` from `../models/ComplianceRecord.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/ComplianceRecord.js](../../../server/models/ComplianceRecord.js)
- `TaxProfile` from `../models/TaxProfile.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/TaxProfile.js](../../../server/models/TaxProfile.js)
- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `buildKenyaReadinessChecks` — lines 7–31

Parameters: `tax`, `records`, `now (defaulted)`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 8:** `const byType = new Map(records.map((record) => [record.type, record]));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 9:** `const timestamp = new Date(now).getTime();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 10:** `const expiryState = (record) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 11:** `if (!record?.expiryDate) return { expired: false, dueSoon: false };` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 12:** `const expiry = new Date(record.expiryDate).getTime();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `if (!Number.isFinite(expiry)) return { expired: true, dueSoon: false };` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 14:** `return { expired: expiry < timestamp, dueSoon: expiry >= timestamp && expiry <= timestamp + 30 * DAY_MS };` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 16:** `const activeLicence = (type) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `const record = byType.get(type);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 18:** `const state = expiryState(record);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `return Boolean(record && ["approved", "submitted"].includes(record.status) && !state.expired && !state.dueSoon);` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 21:** `return [` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `expiryState` — lines 10–15

Parameters: `record`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 11:** `if (!record?.expiryDate) return { expired: false, dueSoon: false };` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 12:** `const expiry = new Date(record.expiryDate).getTime();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `if (!Number.isFinite(expiry)) return { expired: true, dueSoon: false };` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 14:** `return { expired: expiry < timestamp, dueSoon: expiry >= timestamp && expiry <= timestamp + 30 * DAY_MS };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `activeLicence` — lines 16–20

Parameters: `type`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 17:** `const record = byType.get(type);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 18:** `const state = expiryState(record);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `return Boolean(record && ["approved", "submitted"].includes(record.status) && !state.expired && !state.dueSoon);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getKenyaStep2Readiness` — lines 33–42

Parameters: `req`.
Persistent operations detected: TaxProfile.findOne, ComplianceRecord.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:
- **Line 34:** `const tenantId = requireTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `const [tax, records] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 36:** `TaxProfile.findOne({ tenantId }).lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 37:** `ComplianceRecord.find(mergeTenantFilter(req, {})).lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 39:** `const checks = buildKenyaReadinessChecks(tax, records);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `const passed = checks.filter((check) => check.ok).length;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `return { ready: passed === checks.length, score: Math.round((passed / checks.length) * 100), checks, generatedAt: new Date().toISOString() };` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 5: `const DAY_MS = 86400000;`.
- Line 7: `export function buildKenyaReadinessChecks(tax, records, now = new Date()) {`.
- Line 8: `const byType = new Map(records.map((record) => [record.type, record]));`.
- Line 9: `const timestamp = new Date(now).getTime();`.
- Line 10: `const expiryState = (record) => {`.
- Line 12: `const expiry = new Date(record.expiryDate).getTime();`.
- Line 16: `const activeLicence = (type) => {`.
- Line 17: `const record = byType.get(type);`.
- Line 18: `const state = expiryState(record);`.
- Line 34: `const tenantId = requireTenantId();`.
- Line 35: `const [tax, records] = await Promise.all([`.
- Line 39: `const checks = buildKenyaReadinessChecks(tax, records);`.
- Line 40: `const passed = checks.filter((check) => check.ok).length;`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
