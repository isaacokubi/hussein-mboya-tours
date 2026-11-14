# Source explanation: server/tests/corsPolicy.test.js

**Source:** [server/tests/corsPolicy.test.js](../../../server/tests/corsPolicy.test.js)

## Purpose

A Node test module. Its assertions prove only the cases and environment configured by the test; inspect mocks and setup before generalizing.

## Imports and dependencies

- `test` from `node:test`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `assert` from `node:assert/strict`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `cors` from `cors`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getConfiguredOrigins`, `isConfiguredOrigin`, `isValidConfiguredOrigin` from `../config/corsPolicy.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/config/corsPolicy.js](../../../server/config/corsPolicy.js)

## Runtime declarations and data flow

### `invoke` — lines 28–42

Parameters: `method`, `headers`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 29:** `const responseHeaders = {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 30:** `const req = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `const res = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.

## Module-level declarations

- Line 6: `const stagingOrigin = "https://hussein-mboya-tours-2-l3m78h6fz-isaacokubis-projects.vercel.app";`.
- Line 7: `const productionOrigin = "https://www.(unregistered platform domain)";`.
- Line 21: `const configuredOrigins = [stagingOrigin, productionOrigin];`.
- Line 22: `const middleware = cors({`.
- Line 28: `const invoke = (method, headers) => new Promise((resolve, reject) => {`.
- Line 29: `const responseHeaders = {};`.
- Line 30: `const req = {`.
- Line 35: `const res = {`.
- Line 44: `const preflight = await invoke("OPTIONS", {`.
- Line 54: `const normal = await invoke("GET", { origin: stagingOrigin });`.
- Line 58: `const production = await invoke("GET", { origin: productionOrigin });`.
- Line 61: `const unrelated = await invoke("GET", { origin: "https://unrelated.example" });`.
- Line 64: `const wildcard = await invoke("GET", { origin: "*" });`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
