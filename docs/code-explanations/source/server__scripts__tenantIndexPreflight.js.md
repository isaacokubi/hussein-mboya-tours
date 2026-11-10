# Source explanation: server/scripts/tenantIndexPreflight.js

**Source:** [server/scripts/tenantIndexPreflight.js](../../../server/scripts/tenantIndexPreflight.js)

## Purpose

An operational script for checks, repair, migration, or data setup; it is not part of ordinary request handling.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `env` from `../config/env.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/config/env.js](../../../server/config/env.js)

## Runtime declarations and data flow

### `valueLabel` — lines 18–21

Parameters: `value`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 19:** `if (value === null || value === undefined) return "<null>";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 20:** `return String(value);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `main` — lines 23–215

Parameters: none.
6 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 9 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 32:** `await mongoose.connect(env.MONGODB_URI);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 36:** `let failures = 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 38:** `for (const [collectionName, field] of checks) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 39:** `const collection = mongoose.connection.db.collection(collectionName);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 49:** `const duplicates = await collection.aggregate([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 81:** `if (!duplicates.length) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 92:** `for (const duplicate of duplicates) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 115:** `const destinationCollection =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 118:** `const destinationDuplicates =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 119:** `await destinationCollection.aggregate([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 144:** `if (destinationDuplicates.length) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 151:** `for (const duplicate of destinationDuplicates) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 176:** `for (const [collectionName, field] of checks) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 177:** `const collection = mongoose.connection.db.collection(collectionName);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 178:** `const indexes = await collection.indexes();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 180:** `const tenantIndexes = indexes.filter(` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 198:** `if (failures) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 204:** `await mongoose.disconnect();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 4: `const TENANT_ID = new mongoose.Types.ObjectId("6a876d12a0bc937f083ba25a");`.
- Line 6: `const checks = [`.
- Line 18: `function valueLabel(value) {`.
- Line 36: `let failures = 0;`.
- Line 39: `const collection = mongoose.connection.db.collection(collectionName);`.
- Line 49: `const duplicates = await collection.aggregate([`.
- Line 115: `const destinationCollection =`.
- Line 118: `const destinationDuplicates =`.
- Line 177: `const collection = mongoose.connection.db.collection(collectionName);`.
- Line 178: `const indexes = await collection.indexes();`.
- Line 180: `const tenantIndexes = indexes.filter(`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
