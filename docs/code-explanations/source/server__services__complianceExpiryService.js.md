# Source explanation: server/services/complianceExpiryService.js

**Source:** [server/services/complianceExpiryService.js](../../../server/services/complianceExpiryService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `ComplianceRecord` from `../models/ComplianceRecord.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/ComplianceRecord.js](../../../server/models/ComplianceRecord.js)

## Runtime declarations and data flow

### `buildComplianceExpiryUpdates` — lines 6–18

Parameters: `records`, `now (defaulted)`.
5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 7:** `const timestamp = new Date(now).getTime();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 8:** `const soon = timestamp + 30 * DAY_MS;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 9:** `return records.map((record) => {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 10:** `if (!record || ["closed", "expired"].includes(record.status)) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 11:** `if (!record.expiryDate) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 12:** `const expiry = new Date(record.expiryDate).getTime();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `if (!Number.isFinite(expiry)) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 14:** `if (expiry < timestamp) return "expired";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 15:** `if (expiry <= soon && ["approved", "submitted"].includes(record.status)) return "action_required";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 16:** `return null;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `syncComplianceExpiry` — lines 20–35

Parameters: none.
Persistent operations detected: ComplianceRecord.updateMany; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:
- **Line 21:** `const now = new Date();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 22:** `const soon = new Date(now.getTime() + 30 * DAY_MS);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `await ComplianceRecord.updateMany(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 29:** `await ComplianceRecord.updateMany(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 34:** `return true;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `startComplianceExpiryScheduler` — lines 37–43

Parameters: none.
Error control: try=false, catch=true, finally=false.

Key statements:
- **Line 38:** `const run = () => syncComplianceExpiry().catch((error) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `const interval = setInterval(run, INTERVAL_MS);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `return { interval, run };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `run` — lines 38–40

Parameters: none.
Error control: try=false, catch=true, finally=false.

Key statements:

## Module-level declarations

- Line 3: `const DAY_MS = 24 * 60 * 60 * 1000;`.
- Line 4: `const INTERVAL_MS = 6 * 60 * 60 * 1000;`.
- Line 6: `export function buildComplianceExpiryUpdates(records, now = new Date()) {`.
- Line 7: `const timestamp = new Date(now).getTime();`.
- Line 8: `const soon = timestamp + 30 * DAY_MS;`.
- Line 12: `const expiry = new Date(record.expiryDate).getTime();`.
- Line 21: `const now = new Date();`.
- Line 22: `const soon = new Date(now.getTime() + 30 * DAY_MS);`.
- Line 37: `export function startComplianceExpiryScheduler() {`.
- Line 38: `const run = () => syncComplianceExpiry().catch((error) => {`.
- Line 41: `const interval = setInterval(run, INTERVAL_MS);`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
