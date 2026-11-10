# Source explanation: server/services/loyaltyService.js

**Source:** [server/services/loyaltyService.js](../../../server/services/loyaltyService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)

## Runtime declarations and data flow

### `addPoints` — lines 13–41

Parameters: `userId`, `points`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 15:** `if (!userId) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 16:** `throw new Error("User ID is required.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 19:** `if (!Number.isFinite(points) || points <= 0) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 20:** `throw new Error("Points must be greater than zero.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 23:** `const user = await User.findByIdAndUpdate(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 36:** `if (!user) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 37:** `throw new Error("User not found.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 40:** `return user.loyaltyPoints;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `deductPoints` — lines 49–75

Parameters: `userId`, `points`.
Persistent operations detected: User.findById; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 50:** `if (!userId) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 51:** `throw new Error("User ID is required.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 54:** `if (!Number.isFinite(points) || points <= 0) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 55:** `throw new Error("Points must be greater than zero.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 58:** `const user = await User.findById(userId).select(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 62:** `if (!user) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 63:** `throw new Error("User not found.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 66:** `if ((user.loyaltyPoints || 0) < points) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 67:** `throw new Error("Insufficient loyalty points.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 72:** `await user.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 74:** `return user.loyaltyPoints;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getPoints` — lines 83–97

Parameters: `userId`.
Persistent operations detected: User.findById; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 84:** `if (!userId) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 85:** `throw new Error("User ID is required.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 88:** `const user = await User.findById(userId).select(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 92:** `if (!user) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 93:** `throw new Error("User not found.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 96:** `return user.loyaltyPoints || 0;` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 13: `export const addPoints = async (userId, points) => {`.
- Line 23: `const user = await User.findByIdAndUpdate(`.
- Line 49: `export const deductPoints = async (userId, points) => {`.
- Line 58: `const user = await User.findById(userId).select(`.
- Line 83: `export const getPoints = async (userId) => {`.
- Line 88: `const user = await User.findById(userId).select(`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
