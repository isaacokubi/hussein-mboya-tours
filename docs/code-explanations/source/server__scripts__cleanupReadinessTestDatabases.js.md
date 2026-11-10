# Source explanation: server/scripts/cleanupReadinessTestDatabases.js

**Source:** [server/scripts/cleanupReadinessTestDatabases.js](../../../server/scripts/cleanupReadinessTestDatabases.js)

## Purpose

An operational script for checks, repair, migration, or data setup; it is not part of ordinary request handling.

## Imports and dependencies

-  from `dotenv/config`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `fs` from `node:fs/promises`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `path` from `node:path`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `fileURLToPath` from `node:url`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `SEEDED_MODELS` from `../seeds/completeTestDemoSeed.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/seeds/completeTestDemoSeed.js](../../../server/seeds/completeTestDemoSeed.js)

## Runtime declarations and data flow

### `redact` — lines 10–10

Parameters: `error`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `assertTargets` — lines 13–24

Parameters: none.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 14:** `const appUri = process.env.MONGODB_URI;` — Reads runtime/build configuration; never expose secret values through logs or browser-bundled variables.
- **Line 15:** `const testUri = process.env.HEALTH_TEST_MONGODB_URI;` — Reads runtime/build configuration; never expose secret values through logs or browser-bundled variables.
- **Line 16:** `if (!appUri || !testUri) throw new Error("MONGODB_URI and HEALTH_TEST_MONGODB_URI must be loaded from the application environment.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 17:** `const app = new URL(appUri);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 18:** `const test = new URL(testUri);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `const appDatabase = decodeURIComponent(app.pathname.replace(/^\//, "").split("/")[0] || "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `const testDatabase = decodeURIComponent(test.pathname.replace(/^\//, "").split("/")[0] || "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `if (appDatabase !== "husseindb" || testDatabase !== "global_tours_test" || app.hostname !== test.hostname) throw new Error("Readiness cleanup requires the configured application Atlas cluster, husseindb, and its global_t` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 22:** `if (!app.hostname.endsWith(".mongodb.net")) throw new Error("Readiness cleanup refuses a non-Atlas host.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 23:** `return { appDatabase, testDatabase };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `clusterCollectionCount` — lines 26–29

Parameters: `client`, `databases`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:
- **Line 27:** `const counts = await Promise.all(databases.map(async ({ name }) => client.db(name).listCollections({}, { nameOnly: true }).toArray().then((items) => items.length)));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 28:** `return counts.reduce((sum, count) => sum + count, 0);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `main` — lines 31–77

Parameters: none.
12 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 11 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 32:** `const { appDatabase, testDatabase } = assertTargets();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 33:** `await import("../app.js");` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 35:** `await activeClient.connect();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 36:** `const client = activeClient;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `const beforeDatabases = (await client.db("admin").admin().listDatabases({ nameOnly: true })).databases || [];` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 38:** `const beforeCount = await clusterCollectionCount(client, beforeDatabases);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 39:** `const knownCollections = new Set([...SEEDED_MODELS, ...Object.values(mongoose.models)].map((model) => model.collection.collectionName));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `const candidates = beforeDatabases.map(({ name }) => name).filter((name) => generatedName.test(name));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `const validated = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 43:** `for (const name of candidates) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 45:** `if (name === appDatabase || name === testDatabase || /prod|production|stage|staging/i.test(name)) throw new Error(\`Refusing a protected readiness database name: ${name}\`);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 46:** `if (!generatedName.test(name)) throw new Error(\`Refusing an unexpected database name: ${name}\`);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 47:** `const collections = await client.db(name).listCollections({}, { nameOnly: true }).toArray();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 48:** `const collectionResults = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 49:** `for (const { name: collectionName } of collections) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 50:** `if (!knownCollections.has(collectionName)) throw new Error(\`Readiness database ${name} contains unrecognized collection ${collectionName}; refusing cleanup.\`);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 51:** `const count = await client.db(name).collection(collectionName).countDocuments({});` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 53:** `if (count !== 0) throw new Error(\`Readiness database ${name} contains documents; refusing cleanup because contents are not proven disposable.\`);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 8: `const generatedName = /^hr_[0-9]+_[0-9]+_[a-f0-9]{8}$/;`.
- Line 9: `const reportPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../reports/readiness-database-cleanup.json");`.
- Line 10: `const redact = (error) => String(error?.message || "cleanup failed").replace(/mongodb(?:\+srv)?:\/\/[^\s"']+/gi, "[MongoDB URI redacted]");`.
- Line 11: `let activeClient;`.
- Line 13: `function assertTargets() {`.
- Line 14: `const appUri = process.env.MONGODB_URI;`.
- Line 15: `const testUri = process.env.HEALTH_TEST_MONGODB_URI;`.
- Line 17: `const app = new URL(appUri);`.
- Line 18: `const test = new URL(testUri);`.
- Line 19: `const appDatabase = decodeURIComponent(app.pathname.replace(/^\//, "").split("/")[0] || "");`.
- Line 20: `const testDatabase = decodeURIComponent(test.pathname.replace(/^\//, "").split("/")[0] || "");`.
- Line 27: `const counts = await Promise.all(databases.map(async ({ name }) => client.db(name).listCollections({}, { nameOnly: true }).toArray().then((items) => items.length)));`.
- Line 32: `const { appDatabase, testDatabase } = assertTargets();`.
- Line 36: `const client = activeClient;`.
- Line 37: `const beforeDatabases = (await client.db("admin").admin().listDatabases({ nameOnly: true })).databases || [];`.
- Line 38: `const beforeCount = await clusterCollectionCount(client, beforeDatabases);`.
- Line 39: `const knownCollections = new Set([...SEEDED_MODELS, ...Object.values(mongoose.models)].map((model) => model.collection.collectionName));`.
- Line 40: `const candidates = beforeDatabases.map(({ name }) => name).filter((name) => generatedName.test(name));`.
- Line 41: `const validated = [];`.
- Line 47: `const collections = await client.db(name).listCollections({}, { nameOnly: true }).toArray();`.
- Line 48: `const collectionResults = [];`.
- Line 51: `const count = await client.db(name).collection(collectionName).countDocuments({});`.
- Line 67: `const afterDatabases = (await client.db("admin").admin().listDatabases({ nameOnly: true })).databases || [];`.
- Line 68: `const afterCount = await clusterCollectionCount(client, afterDatabases);`.
- Line 69: `const remaining = afterDatabases.map(({ name }) => name).filter((name) => generatedName.test(name));`.
- Line 71: `const report = { timestamp: new Date().toISOString(), applicationDatabase: appDatabase, testSourceDatabase: testDatabase, clusterCollectionsBefore: beforeCount, clusterCollectionsA`.

## Security, errors and performance checkpoints

- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
