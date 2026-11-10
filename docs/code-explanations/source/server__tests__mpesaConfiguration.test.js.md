# Source explanation: server/tests/mpesaConfiguration.test.js

**Source:** [server/tests/mpesaConfiguration.test.js](../../../server/tests/mpesaConfiguration.test.js)

## Purpose

A Node test module. Its assertions prove only the cases and environment configured by the test; inspect mocks and setup before generalizing.

## Imports and dependencies

- `assert` from `node:assert/strict`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `test` from `node:test`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getMpesaUrls`, `validateMpesaEnvironment` from `../config/mpesa.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/config/mpesa.js](../../../server/config/mpesa.js)
- `generateAccessToken`, `initiateStkPush`, `normalizePhoneNumber` from `../services/mpesaService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/mpesaService.js](../../../server/services/mpesaService.js)
- `runWithTenant` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `mockConfig` — lines 35–35

Parameters: `suffix`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 16: `const previous = process.env.MPESA_SANDBOX_BASE_URL;`.
- Line 35: `<sensitive declaration redacted>`.
- Line 38: `const config = mockConfig("oauth");`.
- Line 39: `let observed;`.
- Line 40: `<sensitive declaration redacted>`.
- Line 48: `const config = mockConfig("stk");`.
- Line 49: `const calls = [];`.
- Line 50: `const client = {`.
- Line 54: `const result = await runWithTenant({ tenantId: "test-tenant" }, () => initiateStkPush({ phone: "254708374149", amount: 1200, bookingId: "booking-mock", config, client, companyName:`.
- Line 56: `const [{ url, payload, options }] = calls;`.
- Line 71: `const config = mockConfig("invalid-amount");`.
- Line 72: `let requests = 0;`.
- Line 73: `const client = {`.
- Line 89: `const config = mockConfig("failure");`.
- Line 90: `const messages = [];`.
- Line 91: `const originalError = console.error;`.
- Line 95: `const client = {`.
- Line 101: `const combined = messages.join(" ");`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
