# Source explanation: server/utils/mongodbVersion.js

**Source:** [server/utils/mongodbVersion.js](../../../server/utils/mongodbVersion.js)

## Purpose

A backend utility shared by controllers, services, or models.

## Imports and dependencies

No ES module imports were found.

## Runtime declarations and data flow

### `assertSupportedMongoVersion` — lines 6–20

Parameters: `version`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 7:** `const match = String(version || "").match(/^(\d+)\.(\d+)\.(\d+)/);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 8:** `if (!match) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 9:** `throw Object.assign(new Error(\`MongoDB ${MINIMUM_MONGODB_VERSION} or later is required; server version could not be identified.\`), {` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 13:** `const [major, minor, patch] = match.slice(1).map(Number);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 14:** `if (major < 4 || (major === 4 && minor < 2)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 15:** `throw Object.assign(new Error(\`MongoDB ${MINIMUM_MONGODB_VERSION} or later is required; connected server reports ${major}.${minor}.${patch}.\`), {` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 19:** `return true;` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 4: `export const MINIMUM_MONGODB_VERSION = "4.2.0";`.
- Line 6: `export function assertSupportedMongoVersion(version) {`.
- Line 7: `const match = String(version || "").match(/^(\d+)\.(\d+)\.(\d+)/);`.
- Line 13: `const [major, minor, patch] = match.slice(1).map(Number);`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
