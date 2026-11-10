# Source explanation: server/config/database.js

**Source:** [server/config/database.js](../../../server/config/database.js)

## Purpose

Server configuration or provider initialization. Values and validation affect runtime startup or request behavior.

## Imports and dependencies

- `loadTenantPlugin` from `./tenantPluginLoader.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/config/tenantPluginLoader.js](../../../server/config/tenantPluginLoader.js)
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `env` from `./env.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/config/env.js](../../../server/config/env.js)
- `assertSupportedMongoVersion` from `../utils/mongodbVersion.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/utils/mongodbVersion.js](../../../server/utils/mongodbVersion.js)

## Runtime declarations and data flow

### `connectDatabase` — lines 14–40

Parameters: none.
2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 15:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 16:** `if (!env.MONGODB_URI) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 17:** `throw new Error("MONGODB_URI is not configured.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 20:** `const connection = await mongoose.connect(env.MONGODB_URI, {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 31:** `const buildInfo = await connection.connection.db.admin().command({ buildInfo: 1 });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 36:** `if (error?.code === "UNSUPPORTED_MONGODB_VERSION") console.error(error.message);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 37:** `else console.error("MongoDB connection failed:", error.name || "Error", error.code || "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 38:** `throw error;` — Stops the current operation with an error; callers or Express error handling determine the response.

## Module-level declarations

- Line 9: `const requestedServerSelectionTimeout = Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS);`.
- Line 10: `const serverSelectionTimeoutMS = Number.isFinite(requestedServerSelectionTimeout) && requestedServerSelectionTimeout > 0`.
- Line 14: `const connectDatabase = async () => {`.
- Line 20: `const connection = await mongoose.connect(env.MONGODB_URI, {`.
- Line 31: `const buildInfo = await connection.connection.db.admin().command({ buildInfo: 1 });`.

## Security, errors and performance checkpoints

- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
