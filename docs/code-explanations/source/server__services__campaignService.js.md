# Source explanation: server/services/campaignService.js

**Source:** [server/services/campaignService.js](../../../server/services/campaignService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `sendEmail` from `./emailService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/emailService.js](../../../server/services/emailService.js)

## Runtime declarations and data flow

### `sendCampaign` — lines 12–101

Parameters: `campaign`.
Persistent operations detected: User.find; verify tenant/ownership filters in the exact query. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 14:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 21:** `const filter = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 26:** `if (campaign.audience === "vip") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 30:** `const users = await User.find(filter).select(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 34:** `let sentCount = 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `let failedCount = 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 43:** `for (const user of users) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 44:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 45:** `await sendEmail({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 81:** `await campaign.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 83:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 97:** `await campaign.save().catch(() => {});` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 99:** `throw error;` — Stops the current operation with an error; callers or Express error handling determine the response.

## Module-level declarations

- Line 12: `export const sendCampaign = async (campaign) => {`.
- Line 21: `const filter = {`.
- Line 30: `const users = await User.find(filter).select(`.
- Line 34: `let sentCount = 0;`.
- Line 35: `let failedCount = 0;`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
