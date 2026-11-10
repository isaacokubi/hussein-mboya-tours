# Source explanation: server/seeds/index.js

**Source:** [server/seeds/index.js](../../../server/seeds/index.js)

## Purpose

A seed/migration helper that creates or updates database records. Review safety gates and target database before executing.

## Imports and dependencies

- `dotenv` from `dotenv`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `seedRoles` from `./roleSeed.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/seeds/roleSeed.js](../../../server/seeds/roleSeed.js)
- `seedPermissions` from `./permissionSeed.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/seeds/permissionSeed.js](../../../server/seeds/permissionSeed.js)
- `seedDestinations` from `./seedDestinations.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/seeds/seedDestinations.js](../../../server/seeds/seedDestinations.js)

## Runtime declarations and data flow

### `runSeeds` — lines 10–34

Parameters: none.
5 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 11:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 12:** `if (!process.env.MONGODB_URI) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 13:** `throw new Error("MONGODB_URI is missing.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 18:** `await mongoose.connect(process.env.MONGODB_URI);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 22:** `await seedPermissions();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 23:** `await seedRoles();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 24:** `await seedDestinations();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 31:** `await mongoose.connection.close().catch(() => {});` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

## Module-level declarations

- Line 10: `const runSeeds = async () => {`.

## Security, errors and performance checkpoints

- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
