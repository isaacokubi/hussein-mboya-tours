# Source explanation: server/services/recommendationService.js

**Source:** [server/services/recommendationService.js](../../../server/services/recommendationService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)

## Runtime declarations and data flow

### `recommendTours` — lines 10–135

Parameters: `preferences (defaulted)`.
Persistent operations detected: Tour.find; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 10 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 12:** `const {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `const query = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 33:** `if (preferredCountries.length) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 45:** `if (travelStyle.length) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 57:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 63:** `if (minBudget !== undefined) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 67:** `if (maxBudget !== undefined) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 78:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 84:** `if (minDuration !== undefined) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 88:** `if (maxDuration !== undefined) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 99:** `if (featuredOnly) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 103:** `let tours = await Tour.find(query)` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 122:** `if (!tours.length) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 123:** `tours = await Tour.find({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 134:** `return tours;` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 10: `export const recommendTours = async (preferences = {}) => {`.
- Line 12: `const {`.
- Line 23: `const query = {`.
- Line 103: `let tours = await Tour.find(query)`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
