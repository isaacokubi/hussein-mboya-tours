# Source explanation: server/services/dataRetentionService.js

**Source:** [server/services/dataRetentionService.js](../../../server/services/dataRetentionService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `BackgroundJob` from `../models/BackgroundJob.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/BackgroundJob.js](../../../server/models/BackgroundJob.js)
- `WebhookDelivery` from `../models/WebhookDelivery.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/WebhookDelivery.js](../../../server/models/WebhookDelivery.js)
- `PrivacyRequest` from `../models/PrivacyRequest.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/PrivacyRequest.js](../../../server/models/PrivacyRequest.js)

## Runtime declarations and data flow

### `days` — lines 5–8

Parameters: `key`, `fallback`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 6:** `const value = Number(process.env[key] || fallback);` — Reads runtime/build configuration; never expose secret values through logs or browser-bundled variables.
- **Line 7:** `return Number.isFinite(value) && value >= 1 ? Math.floor(value) : fallback;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `cutoff` — lines 10–10

Parameters: `retentionDays`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `runDataRetentionSweep` — lines 17–44

Parameters: none.
3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:
- **Line 18:** `const operationalDays = days("OPERATIONAL_RECORD_RETENTION_DAYS", 365);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `const webhookDays = days("WEBHOOK_DELIVERY_RETENTION_DAYS", 180);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `const jobDays = days("BACKGROUND_JOB_RETENTION_DAYS", 90);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `const privacyDays = days("PRIVACY_REQUEST_RETENTION_DAYS", 730);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `const results = {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 39:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `startDataRetentionScheduler` — lines 46–58

Parameters: none.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 47:** `const intervalMs = Math.max(6 * 60 * 60 * 1000, Number(process.env.DATA_RETENTION_INTERVAL_MS || 24 * 60 * 60 * 1000));` — Reads runtime/build configuration; never expose secret values through logs or browser-bundled variables.
- **Line 48:** `const run = async () => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 49:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 50:** `const result = await runDataRetentionSweep();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 56:** `const interval = setInterval(() => void run(), intervalMs);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 57:** `return { interval, run };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `run` — lines 48–55

Parameters: none.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 49:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 50:** `const result = await runDataRetentionSweep();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

## Module-level declarations

- Line 5: `const days = (key, fallback) => {`.
- Line 6: `const value = Number(process.env[key] || fallback);`.
- Line 10: `const cutoff = (retentionDays) => new Date(Date.now() - retentionDays * 86400000);`.
- Line 18: `const operationalDays = days("OPERATIONAL_RECORD_RETENTION_DAYS", 365);`.
- Line 19: `const webhookDays = days("WEBHOOK_DELIVERY_RETENTION_DAYS", 180);`.
- Line 20: `const jobDays = days("BACKGROUND_JOB_RETENTION_DAYS", 90);`.
- Line 21: `const privacyDays = days("PRIVACY_REQUEST_RETENTION_DAYS", 730);`.
- Line 23: `const results = {};`.
- Line 46: `export function startDataRetentionScheduler() {`.
- Line 47: `const intervalMs = Math.max(6 * 60 * 60 * 1000, Number(process.env.DATA_RETENTION_INTERVAL_MS || 24 * 60 * 60 * 1000));`.
- Line 48: `const run = async () => {`.
- Line 50: `const result = await runDataRetentionSweep();`.
- Line 56: `const interval = setInterval(() => void run(), intervalMs);`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
