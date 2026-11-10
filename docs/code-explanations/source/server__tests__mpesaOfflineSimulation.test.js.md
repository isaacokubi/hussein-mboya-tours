# Source explanation: server/tests/mpesaOfflineSimulation.test.js

**Source:** [server/tests/mpesaOfflineSimulation.test.js](../../../server/tests/mpesaOfflineSimulation.test.js)

## Purpose

A Node test module. Its assertions prove only the cases and environment configured by the test; inspect mocks and setup before generalizing.

## Imports and dependencies

- `assert` from `node:assert/strict`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `test` from `node:test`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getMpesaUrls`, `validateMpesaEnvironment` from `../config/mpesa.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/config/mpesa.js](../../../server/config/mpesa.js)
- `initiateStkPush`, `normalizePhoneNumber` from `../services/mpesaService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/mpesaService.js](../../../server/services/mpesaService.js)
- `runWithTenant` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

No named function declaration or arrow-function variable was extracted. The module may consist of static data, side effects, anonymous callbacks or syntax outside this extractor's current patterns.

## Module-level declarations

- Line 7: `const config = {`.
- Line 31: `let providerCalls = 0;`.
- Line 32: `const client = {`.
- Line 44: `let providerCalls = 0;`.
- Line 45: `const client = {`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
