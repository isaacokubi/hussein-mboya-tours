# Source explanation: server/services/commissionService.js

**Source:** [server/services/commissionService.js](../../../server/services/commissionService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Commission` from `../models/Commission.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Commission.js](../../../server/models/Commission.js)
- `Agent` from `../models/Agent.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Agent.js](../../../server/models/Agent.js)
- `getSystemSettings` from `./settingsService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/settingsService.js](../../../server/services/settingsService.js)

## Runtime declarations and data flow

### `getGlobalCommissionRate` — lines 6–10

Parameters: `tenantId`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:
- **Line 7:** `const settings = await getSystemSettings({ tenantId });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 8:** `const rate = Number(settings?.defaultCommissionRate);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 9:** `return Number.isFinite(rate) && rate >= 0 && rate <= 100 ? rate : 10;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `createCommission` — lines 12–83

Parameters: `booking`.
Persistent operations detected: Commission.findOne, Agent.findOne, Agent.updateOne, Commission.create; verify tenant/ownership filters in the exact query. 6 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 10 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 13:** `const tenantId = requireTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 14:** `if (!booking?.agent) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 16:** `if (booking.tenantId && String(booking.tenantId) !== String(tenantId)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 17:** `const error = new Error("Cross-tenant commission creation rejected.");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `throw error;` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 26:** `const existingCommission = await Commission.findOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 29:** `if (existingCommission) return existingCommission;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 31:** `const agent = await Agent.findOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 34:** `if (!agent) throw new Error("Agent profile not found.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 36:** `if (agent.tenantId && String(agent.tenantId) !== String(tenantId)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 37:** `const error = new Error("Cross-tenant agent commission rejected.");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `throw error;` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 44:** `const rate = await getGlobalCommissionRate(tenantId);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 45:** `const bookingAmount = Number(booking.totalAmount || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 46:** `const amount = Number(((bookingAmount * rate) / 100).toFixed(2));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 49:** `if (Number(agent.commissionRate) !== rate) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 50:** `await Agent.updateOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 56:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 6: `const getGlobalCommissionRate = async (tenantId) => {`.
- Line 7: `const settings = await getSystemSettings({ tenantId });`.
- Line 8: `const rate = Number(settings?.defaultCommissionRate);`.
- Line 12: `export const createCommission = async (booking) => {`.
- Line 13: `const tenantId = requireTenantId();`.
- Line 17: `const error = new Error("Cross-tenant commission creation rejected.");`.
- Line 26: `const existingCommission = await Commission.findOne(`.
- Line 31: `const agent = await Agent.findOne(`.
- Line 37: `const error = new Error("Cross-tenant agent commission rejected.");`.
- Line 44: `const rate = await getGlobalCommissionRate(tenantId);`.
- Line 45: `const bookingAmount = Number(booking.totalAmount || 0);`.
- Line 46: `const amount = Number(((bookingAmount * rate) / 100).toFixed(2));`.
- Line 75: `const concurrentCommission = await Commission.findOne(`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
