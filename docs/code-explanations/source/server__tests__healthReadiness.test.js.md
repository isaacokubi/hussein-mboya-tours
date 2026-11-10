# Source explanation: server/tests/healthReadiness.test.js

**Source:** [server/tests/healthReadiness.test.js](../../../server/tests/healthReadiness.test.js)

## Purpose

A Node test module. Its assertions prove only the cases and environment configured by the test; inspect mocks and setup before generalizing.

## Imports and dependencies

- `assert` from `node:assert/strict`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `createServer` from `node:http`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `once` from `node:events`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `express` from `express`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `test` from `node:test`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `startApp` — lines 22–28

Parameters: none.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:
- **Line 23:** `const server = createServer(app);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `await once(server, "listening");` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 26:** `const address = server.address();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 27:** `return { server, baseUrl: \`http://127.0.0.1:${address.port}\` };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `launchServer` — lines 30–87

Parameters: `overrides (defaulted)`.
4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 31:** `const { spawn } = await import("node:child_process");` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 32:** `const { fileURLToPath } = await import("node:url");` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 33:** `const { dirname, resolve } = await import("node:path");` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 34:** `const serverDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `const child = spawn(process.execPath, ["server.js"], {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 53:** `const childExit = once(child, "exit");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 54:** `let output = "";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 58:** `let port;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 59:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 63:** `const timeout = setTimeout(() => reject(new Error(\`HTTP listener did not start promptly. Output: ${output}\`)), 30_000);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 64:** `const findPort = () => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 65:** `const match = output.match(/HTTP server listening on port (\d+)/);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 66:** `if (!match) return false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 69:** `return true;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 75:** `if (!findPort()) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 82:** `if (child.exitCode === null) child.kill("SIGTERM");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 83:** `throw error;` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 86:** `return { child, childExit, port, output: () => output };` — Exits this function and supplies its result (or response short-circuit) to the caller.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `findPort` — lines 64–70

Parameters: none.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 65:** `const match = output.match(/HTTP server listening on port (\d+)/);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 66:** `if (!match) return false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 69:** `return true;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `waitForChildExit` — lines 89–92

Parameters: `childExit`, `timeoutMs`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 90:** `const timeout = setTimeout(() => reject(new Error("Server process did not exit within its configured timeout.")), timeoutMs);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.

## Module-level declarations

- Line 9: `const healthTestMongoUri = process.env.HEALTH_TEST_MONGODB_URI;`.
- Line 15: `const [{ default: mongoose }, { default: app }, { setStartupPhase }, { default: upload }] = await Promise.all([`.
- Line 22: `const startApp = async () => {`.
- Line 23: `const server = createServer(app);`.
- Line 26: `const address = server.address();`.
- Line 30: `const launchServer = async (overrides = {}) => {`.
- Line 31: `const { spawn } = await import("node:child_process");`.
- Line 32: `const { fileURLToPath } = await import("node:url");`.
- Line 33: `const { dirname, resolve } = await import("node:path");`.
- Line 34: `const serverDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");`.
- Line 35: `const child = spawn(process.execPath, ["server.js"], {`.
- Line 53: `const childExit = once(child, "exit");`.
- Line 54: `let output = "";`.
- Line 58: `let port;`.
- Line 63: `const timeout = setTimeout(() => reject(new Error(\`HTTP listener did not start promptly. Output: ${output}\`)), 30_000);`.
- Line 64: `const findPort = () => {`.
- Line 65: `const match = output.match(/HTTP server listening on port (\d+)/);`.
- Line 89: `const waitForChildExit = (childExit, timeoutMs) => new Promise((resolveExit, reject) => {`.
- Line 90: `const timeout = setTimeout(() => reject(new Error("Server process did not exit within its configured timeout.")), timeoutMs);`.
- Line 96: `const { server, baseUrl } = await startApp();`.
- Line 103: `let response = await fetch(\`${baseUrl}/api/live\`);`.
- Line 104: `let payload = await response.json();`.
- Line 139: `const uploadApp = express();`.
- Line 143: `const uploadServer = createServer(uploadApp);`.
- Line 147: `const uploadUrl = \`http://127.0.0.1:${uploadServer.address().port}/upload\`;`.
- Line 149: `const fieldsOnly = new FormData();`.
- Line 151: `const fieldsResponse = await fetch(uploadUrl, { method: "POST", body: fieldsOnly });`.
- Line 155: `const fileUpload = new FormData();`.
- Line 157: `const fileResponse = await fetch(uploadUrl, { method: "POST", body: fileUpload });`.
- Line 163: `const runtime = await launchServer();`.
- Line 166: `const baseUrl = \`http://127.0.0.1:${runtime.port}\`;`.
- Line 167: `const response = await fetch(\`${baseUrl}/api/health\`);`.
- Line 168: `const payload = await response.json();`.
- Line 174: `const liveResponse = await fetch(\`${baseUrl}/api/live\`);`.
- Line 182: `const testDatabaseUrl = new URL(healthTestMongoUri);`.
- Line 183: `const sourceDatabase = decodeURIComponent(testDatabaseUrl.pathname.replace(/^\//, ""));`.
- Line 185: `const databaseName = \`hr_${process.pid}_${Date.now()}_${Math.random().toString(16).slice(2, 10)}\`;`.
- Line 188: `const isolatedMongoUri = testDatabaseUrl.toString();`.
- Line 189: `const runtime = await launchServer({`.
- Line 197: `const { default: cleanupMongoose } = await import("mongoose");`.
- Line 198: `const cleanupClient = new cleanupMongoose.mongo.MongoClient(isolatedMongoUri, { serverSelectionTimeoutMS: 10_000 });`.
- Line 201: `const cleanupDatabase = cleanupClient.db(databaseName);`.
- Line 204: `const knownCollections = new Set(Object.values(cleanupMongoose.models).map((model) => model.collection.collectionName));`.
- Line 205: `const collections = await cleanupDatabase.listCollections({}, { nameOnly: true }).toArray();`.
- Line 210: `const remaining = await cleanupDatabase.listCollections({}, { nameOnly: true }).toArray();`.
- Line 217: `const baseUrl = \`http://127.0.0.1:${runtime.port}\`;`.
- Line 218: `const deadline = Date.now() + 75_000;`.
- Line 219: `let healthResponse;`.
- Line 220: `let healthPayload;`.
- Line 239: `const invoiceIndexes = await mongoose.connection.db.collection("invoices").indexes();`.
- Line 245: `const rootResponse = await fetch(\`${baseUrl}/\`);`.
- Line 246: `const rootPayload = await rootResponse.json();`.
- Line 251: `const exit = await waitForChildExit(runtime.childExit, 15_000);`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
