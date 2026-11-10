# Source explanation: server/tests/mpesaCallbackPayload.test.js

**Source:** [server/tests/mpesaCallbackPayload.test.js](../../../server/tests/mpesaCallbackPayload.test.js)

## Purpose

A Node test module. Its assertions prove only the cases and environment configured by the test; inspect mocks and setup before generalizing.

## Imports and dependencies

- `assert` from `node:assert/strict`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `test` from `node:test`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `classifyStkQueryResult` from `../services/mpesaQueryService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/mpesaQueryService.js](../../../server/services/mpesaQueryService.js)
- `evaluateStkPaymentCallback`, `getCheckoutRequestId`, `getStkCallback`, `validateStkCallback` from `../services/mpesaCallbackPayload.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/mpesaCallbackPayload.js](../../../server/services/mpesaCallbackPayload.js)
- `createVerifyMpesaCallbackIntegrity`, `validateMpesaCallbackPayload` from `../middleware/mpesaCallbackIntegrity.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/middleware/mpesaCallbackIntegrity.js](../../../server/middleware/mpesaCallbackIntegrity.js)
- `express` from `express`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Readable` from `node:stream`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `runWithTenant` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `publicErrorMessage` from `../utils/publicError.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/utils/publicError.js](../../../server/utils/publicError.js)

## Runtime declarations and data flow

### `callback` — lines 11–17

Parameters: `ResultCode`, `items (defaulted)`, `extra (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `successItems` — lines 18–23

Parameters: `amount (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `status` — lines 56–56

Parameters: `code`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `json` — lines 56–56

Parameters: `bodyValue`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `status` — lines 67–67

Parameters: `code`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `json` — lines 67–67

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `status` — lines 98–98

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `json` — lines 98–98

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `status` — lines 120–120

Parameters: `code`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `json` — lines 120–120

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 11: `const callback = (ResultCode, items = [], extra = {}) => ({`.
- Line 18: `const successItems = (amount = 100) => [`.
- Line 47: `const calls = { payment: 0, subscription: 0, provider: 0, next: 0 };`.
- Line 48: `const middleware = createVerifyMpesaCallbackIntegrity({`.
- Line 54: `let statusCode = 200;`.
- Line 55: `let responseBody;`.
- Line 56: `const response = { status(code) { statusCode = code; return this; }, json(bodyValue) { responseBody = bodyValue; return this; } };`.
- Line 63: `let resolverCalls = 0;`.
- Line 64: `let earlyStatus = 200;`.
- Line 75: `const calls = { payment: 0, subscription: 0, provider: 0, next: 0 };`.
- Line 76: `const parser = express.json();`.
- Line 77: `const req = Readable.from(["{not-json"]);`.
- Line 81: `let parserError;`.
- Line 91: `const calls = [];`.
- Line 92: `const middleware = createVerifyMpesaCallbackIntegrity({`.
- Line 97: `let nextCalled = false;`.
- Line 106: `const calls = { payment: 0, subscription: 0, provider: 0, next: 0 };`.
- Line 107: `const middleware = createVerifyMpesaCallbackIntegrity({`.
- Line 116: `let statusCode = 200;`.
- Line 117: `let responseBody;`.
- Line 140: `const result = evaluateStkPaymentCallback(callback(code, successItems()), 100);`.
- Line 144: `<sensitive declaration redacted>`.
- Line 160: `const result = evaluateStkPaymentCallback(callback(0, successItems()), 100);`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
