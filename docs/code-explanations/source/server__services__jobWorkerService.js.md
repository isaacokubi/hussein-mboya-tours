# Source explanation: server/services/jobWorkerService.js

**Source:** [server/services/jobWorkerService.js](../../../server/services/jobWorkerService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `crypto` from `crypto`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `claimNextJob`, `completeJob`, `failJob` from `./jobQueueService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/jobQueueService.js](../../../server/services/jobQueueService.js)
- `processEtimsInvoiceJob` from `./etimsService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/etimsService.js](../../../server/services/etimsService.js)
- `processEtimsNoteJob` from `./etimsNoteService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/etimsNoteService.js](../../../server/services/etimsNoteService.js)
- `deliverWebhookJob` from `./webhookDeliveryService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/webhookDeliveryService.js](../../../server/services/webhookDeliveryService.js)

## Runtime declarations and data flow

### `isDatabaseReady` — lines 19–19

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `processOneJob` — lines 21–42

Parameters: none.
4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 22:** `if (!isDatabaseReady()) return false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 24:** `const job = await claimNextJob(WORKER_ID, Object.keys(handlers));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 25:** `if (!job) return false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 27:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 28:** `const handler = handlers[job.type];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 29:** `if (!handler) throw new Error(\`No handler registered for job type ${job.type}.\`);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 30:** `await handler(job.payload, job);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 31:** `await completeJob(job);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 33:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 34:** `await failJob(job, error);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 41:** `return true;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `startJobWorker` — lines 44–93

Parameters: none.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 45:** `let stopped = false;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 46:** `let timer = null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 47:** `let consecutiveErrors = 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 49:** `const schedule = (delay) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 50:** `if (stopped) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 51:** `if (timer) clearTimeout(timer);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 55:** `const tick = async () => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 56:** `if (stopped) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 58:** `if (!isDatabaseReady()) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 60:** `const delay = Math.min(` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 65:** `return;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 68:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 69:** `const processed = await processOneJob();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 74:** `const delay = Math.min(` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 88:** `return () => {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 90:** `if (timer) clearTimeout(timer);` — This branch gates the following work on a condition; test both true and false paths when changing it.

### `schedule` — lines 49–53

Parameters: `delay`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 50:** `if (stopped) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 51:** `if (timer) clearTimeout(timer);` — This branch gates the following work on a condition; test both true and false paths when changing it.

### `tick` — lines 55–84

Parameters: none.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 56:** `if (stopped) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 58:** `if (!isDatabaseReady()) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 60:** `const delay = Math.min(` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 65:** `return;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 68:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 69:** `const processed = await processOneJob();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 74:** `const delay = Math.min(` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.

## Module-level declarations

- Line 8: `const WORKER_ID = \`${process.pid}-${crypto.randomBytes(6).toString("hex")}\`;`.
- Line 9: `const handlers = {`.
- Line 15: `const DB_READY = 1;`.
- Line 16: `const MIN_IDLE_DELAY_MS = 1500;`.
- Line 17: `const MAX_ERROR_BACKOFF_MS = 60 * 1000;`.
- Line 19: `const isDatabaseReady = () => mongoose.connection.readyState === DB_READY;`.
- Line 24: `const job = await claimNextJob(WORKER_ID, Object.keys(handlers));`.
- Line 28: `const handler = handlers[job.type];`.
- Line 44: `export function startJobWorker() {`.
- Line 45: `let stopped = false;`.
- Line 46: `let timer = null;`.
- Line 47: `let consecutiveErrors = 0;`.
- Line 49: `const schedule = (delay) => {`.
- Line 55: `const tick = async () => {`.
- Line 60: `const delay = Math.min(`.
- Line 69: `const processed = await processOneJob();`.
- Line 74: `const delay = Math.min(`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
