# Source explanation: server/services/customerCommunicationScheduler.js

**Source:** [server/services/customerCommunicationScheduler.js](../../../server/services/customerCommunicationScheduler.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `Subscription` from `../models/Subscription.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Subscription.js](../../../server/models/Subscription.js)
- `runWithTenant` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `runCommunicationAutomation`, `sendSubscriptionReminderAutomation` from `./customerCommunicationService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/customerCommunicationService.js](../../../server/services/customerCommunicationService.js)

## Runtime declarations and data flow

### `startCustomerCommunicationScheduler` — lines 5–22

Parameters: none.
Persistent operations detected: Subscription.find; verify tenant/ownership filters in the exact query. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 6:** `const run = async () => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 7:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 8:** `await runWithTenant({ role: "super_admin", bypass: true }, async () => {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 9:** `await runCommunicationAutomation();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 10:** `const now = new Date();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 11:** `const expired = await Subscription.find({ status: "expired", currentPeriodEndsAt: { $ne: null, $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 12:** `for (const subscription of expired) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 13:** `await sendSubscriptionReminderAutomation({ subscription, expired: true }).catch((error) => console.error("Subscription expiry notification failed:", error.message));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 21:** `return setInterval(run, 60 * 60 * 1000);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `run` — lines 6–19

Parameters: none.
Persistent operations detected: Subscription.find; verify tenant/ownership filters in the exact query. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 7:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 8:** `await runWithTenant({ role: "super_admin", bypass: true }, async () => {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 9:** `await runCommunicationAutomation();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 10:** `const now = new Date();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 11:** `const expired = await Subscription.find({ status: "expired", currentPeriodEndsAt: { $ne: null, $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 12:** `for (const subscription of expired) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 13:** `await sendSubscriptionReminderAutomation({ subscription, expired: true }).catch((error) => console.error("Subscription expiry notification failed:", error.message));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

## Module-level declarations

- Line 5: `export const startCustomerCommunicationScheduler = () => {`.
- Line 6: `const run = async () => {`.
- Line 10: `const now = new Date();`.
- Line 11: `const expired = await Subscription.find({ status: "expired", currentPeriodEndsAt: { $ne: null, $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } }).lean();`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
