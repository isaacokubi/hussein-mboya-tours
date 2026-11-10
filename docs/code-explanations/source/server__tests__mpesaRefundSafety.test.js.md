# Source explanation: server/tests/mpesaRefundSafety.test.js

**Source:** [server/tests/mpesaRefundSafety.test.js](../../../server/tests/mpesaRefundSafety.test.js)

## Purpose

A Node test module. Its assertions prove only the cases and environment configured by the test; inspect mocks and setup before generalizing.

## Imports and dependencies

- `assert` from `node:assert/strict`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `fs` from `node:fs`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `path` from `node:path`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `test` from `node:test`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `buildRefundCallbackUrls` from `../services/mpesaRefundService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/mpesaRefundService.js](../../../server/services/mpesaRefundService.js)

## Runtime declarations and data flow

### `read` — lines 8–8

Parameters: `file`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 7: `const root = path.resolve(process.cwd());`.
- Line 8: `const read = (file) => fs.readFileSync(path.join(root, file), "utf8");`.
- Line 21: `const service = read("services/mpesaRefundService.js");`.
- Line 22: `const config = read("config/mpesa.js");`.
- Line 38: `const controller = read("controllers/adminPaymentController.js");`.
- Line 48: `const controller = read("controllers/adminPaymentController.js");`.
- Line 54: `const invoice = read("models/Invoice.js");`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
