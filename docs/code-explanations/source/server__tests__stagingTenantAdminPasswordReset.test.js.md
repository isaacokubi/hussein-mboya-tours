# Source explanation: server/tests/stagingTenantAdminPasswordReset.test.js

**Source:** [server/tests/stagingTenantAdminPasswordReset.test.js](../../../server/tests/stagingTenantAdminPasswordReset.test.js)

## Purpose

A Node test module. Its assertions prove only the cases and environment configured by the test; inspect mocks and setup before generalizing.

## Imports and dependencies

- `test` from `node:test`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `assert` from `node:assert/strict`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `bcrypt` from `bcryptjs`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `createStagingTenantAdminPasswordResetHandler` from `../routes/internal/stagingSuperAdminBootstrapRoutes.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/routes/internal/stagingSuperAdminBootstrapRoutes.js](../../../server/routes/internal/stagingSuperAdminBootstrapRoutes.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `runWithTenant` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `validEnvironment` — lines 12–20

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `setup` — lines 22–55

Parameters: `arg1 (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 23:** `const state = { uri: null, closed: false, saved: 0, found: null, doc: null };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `const raw = rawUser || {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 33:** `const mongooseClient = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 36:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 39:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 42:** `const doc = { ...document, save: async () => { state.saved += 1; } };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 44:** `return doc;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 51:** Sensitive-configuration/data operation; inspect source without copying secret values. — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 54:** `return { state, handler };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `createConnection` — lines 34–49

Parameters: `uri`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 36:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 39:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 42:** `const doc = { ...document, save: async () => { state.saved += 1; } };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 44:** `return doc;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `model` — lines 38–47

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 39:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 42:** `const doc = { ...document, save: async () => { state.saved += 1; } };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 44:** `return doc;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `hydrate` — lines 41–45

Parameters: `document`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 42:** `const doc = { ...document, save: async () => { state.saved += 1; } };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 44:** `return doc;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `call` — lines 57–66

Parameters: `handler`, `arg2 (defaulted)`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:
- **Line 58:** `const result = { status: 200, body: null };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 59:** `const response = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 64:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 65:** `return result;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `status` — lines 60–60

Parameters: `code`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `sendStatus` — lines 61–61

Parameters: `code`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `json` — lines 62–62

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 9: `<sensitive declaration redacted>`.
- Line 10: `const targetTenant = "6ab82dce30c1fd52b9dc3e80";`.
- Line 11: `<sensitive declaration redacted>`.
- Line 12: `const validEnvironment = () => ({`.
- Line 22: `function setup({ environment = validEnvironment(), databaseName = "global_tours_test", rawUser } = {}) {`.
- Line 23: `const state = { uri: null, closed: false, saved: 0, found: null, doc: null };`.
- Line 24: `const raw = rawUser || {`.
- Line 33: `const mongooseClient = {`.
- Line 42: `const doc = { ...document, save: async () => { state.saved += 1; } };`.
- Line 51: `<sensitive declaration redacted>`.
- Line 58: `const result = { status: 200, body: null };`.
- Line 59: `const response = {`.
- Line 76: `const { state, handler } = setup({ environment });`.
- Line 83: `const { state, handler } = setup({ databaseName: "husseindb" });`.
- Line 94: `const { state, handler } = setup({ environment });`.
- Line 102: `const { state, handler } = setup({ rawUser });`.
- Line 109: `const { state, handler } = setup();`.
- Line 115: `const { state, handler } = setup();`.
- Line 116: `const response = await call(handler);`.
- Line 137: `<sensitive declaration redacted>`.
- Line 144: `const { state, handler } = setup();`.
- Line 145: `const first = await call(handler);`.
- Line 146: `const second = await call(handler);`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
