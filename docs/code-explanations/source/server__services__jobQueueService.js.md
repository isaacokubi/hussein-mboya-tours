# Source explanation: server/services/jobQueueService.js

**Source:** [server/services/jobQueueService.js](../../../server/services/jobQueueService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `crypto` from `crypto`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `BackgroundJob` from `../models/BackgroundJob.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/BackgroundJob.js](../../../server/models/BackgroundJob.js)
- `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `hashKey` — lines 5–5

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `enqueueJob` — lines 7–23

Parameters: `type`, `payload (defaulted)`, `options (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 8:** `const tenantId = options.tenantId || requireTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 9:** `const idempotencyKey = options.idempotencyKey || \`${type}:${hashKey(JSON.stringify(payload))}\`;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 10:** `const update = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 22:** `return BackgroundJob.findOneAndUpdate({ tenantId, idempotencyKey }, update, { upsert: true, new: true, setDefaultsOnInsert: true });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `claimNextJob` — lines 25–36

Parameters: `workerId`, `types (defaulted)`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 26:** `const now = new Date();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 27:** `const staleBefore = new Date(Date.now() - 10 * 60 * 1000);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 28:** `const query = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `if (types.length) query.type = { $in: types };` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 35:** `return BackgroundJob.findOneAndUpdate(query, { $set: { status: "running", lockedAt: now, lockedBy: workerId }, $inc: { attempts: 1 } }, { sort: { availableAt: 1, createdAt: 1 }, new: true });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `completeJob` — lines 38–45

Parameters: `job`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 44:** `return job.save();` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `failJob` — lines 47–60

Parameters: `job`, `error`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 48:** `const message = String(error?.message || error || "Job failed").slice(0, 2000);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 52:** `if (job.attempts >= job.maxAttempts) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 56:** `const delayMinutes = Math.min(1440, 2 ** Math.min(job.attempts, 9));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 59:** `return job.save();` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 5: `const hashKey = (value) => crypto.createHash("sha256").update(String(value)).digest("hex");`.
- Line 8: `const tenantId = options.tenantId || requireTenantId();`.
- Line 9: `const idempotencyKey = options.idempotencyKey || \`${type}:${hashKey(JSON.stringify(payload))}\`;`.
- Line 10: `const update = {`.
- Line 26: `const now = new Date();`.
- Line 27: `const staleBefore = new Date(Date.now() - 10 * 60 * 1000);`.
- Line 28: `const query = {`.
- Line 48: `const message = String(error?.message || error || "Job failed").slice(0, 2000);`.
- Line 56: `const delayMinutes = Math.min(1440, 2 ** Math.min(job.attempts, 9));`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
