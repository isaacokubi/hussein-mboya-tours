# Source explanation: server/services/tenantIndexRepair.js

**Source:** [server/services/tenantIndexRepair.js](../../../server/services/tenantIndexRepair.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `repairLegacyTenantUniqueIndex` — lines 8–73

Parameters: `Model`, `error`.
2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 12 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 9:** `if (error?.code !== 11000) return false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 11:** `const keyPattern = error.keyPattern || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 12:** `const fields = Object.keys(keyPattern);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `const modelName = Model?.modelName;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `const isLegacyTenantIndex = fields.length === 1 && fields[0] === "tenantId";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `const isLegacyRoleNameIndex = modelName === "Role" && fields.length === 1 && fields[0] === "name";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `const isLegacyGlobalEmailIndex =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `const isLegacyGlobalPhoneIndex =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 30:** `const isLegacyStaffOperationalIndex =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 43:** `const collection = Model?.collection;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 44:** `if (!collection) return false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 46:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 47:** `const indexes = await collection.listIndexes().toArray();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 48:** `const legacyIndexes = indexes.filter((index) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 49:** `const keys = Object.keys(index.key || {});` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 50:** `if (index.unique !== true || keys.length !== 1) return false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 51:** `if (isLegacyTenantIndex) return keys[0] === "tenantId";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `createWithTenantIndexRepair` — lines 75–83

Parameters: `Model`, `payload`.
Persistent operations detected: Model.create; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 76:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 77:** `return await Model.create(payload);` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 79:** `const repaired = await repairLegacyTenantUniqueIndex(Model, error);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 80:** `if (!repaired) throw error;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 81:** `return Model.create(payload);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `isTenantIndexConflict` — lines 85–89

Parameters: `error`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 86:** `if (error?.code !== 11000) return false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 87:** `const fields = Object.keys(error.keyPattern || {});` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 88:** `return fields.length === 1 && fields[0] === "tenantId";` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 11: `const keyPattern = error.keyPattern || {};`.
- Line 12: `const fields = Object.keys(keyPattern);`.
- Line 13: `const modelName = Model?.modelName;`.
- Line 15: `const isLegacyTenantIndex = fields.length === 1 && fields[0] === "tenantId";`.
- Line 16: `const isLegacyRoleNameIndex = modelName === "Role" && fields.length === 1 && fields[0] === "name";`.
- Line 17: `const isLegacyGlobalEmailIndex =`.
- Line 21: `const isLegacyGlobalPhoneIndex =`.
- Line 30: `const isLegacyStaffOperationalIndex =`.
- Line 43: `const collection = Model?.collection;`.
- Line 47: `const indexes = await collection.listIndexes().toArray();`.
- Line 48: `const legacyIndexes = indexes.filter((index) => {`.
- Line 49: `const keys = Object.keys(index.key || {});`.
- Line 79: `const repaired = await repairLegacyTenantUniqueIndex(Model, error);`.
- Line 85: `export function isTenantIndexConflict(error) {`.
- Line 87: `const fields = Object.keys(error.keyPattern || {});`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
