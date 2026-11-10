# Source explanation: server/tests/operationsCopilotCalculations.test.js

**Source:** [server/tests/operationsCopilotCalculations.test.js](../../../server/tests/operationsCopilotCalculations.test.js)

## Purpose

A Node test module. Its assertions prove only the cases and environment configured by the test; inspect mocks and setup before generalizing.

## Imports and dependencies

- `test` from `node:test`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `assert` from `node:assert/strict`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `buildTripOperations`, `buildPaymentFollowUp`, `buildAssetAlerts`, `buildQuoteDraft`, `toMoney` from `../services/operationsCopilotCalculations.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/operationsCopilotCalculations.js](../../../server/services/operationsCopilotCalculations.js)

## Runtime declarations and data flow

No named function declaration or arrow-function variable was extracted. The module may consist of static data, side effects, anonymous callbacks or syntax outside this extractor's current patterns.

## Module-level declarations

- Line 6: `const trip = buildTripOperations(`.
- Line 21: `const trip = buildTripOperations({ _id: "tour-2", title: "Nairobi city tour" }, { bookedValue: 0 }, {});`.
- Line 31: `const now = new Date("2026-10-12T10:00:00.000Z");`.
- Line 32: `const item = buildPaymentFollowUp({`.
- Line 54: `const item = buildPaymentFollowUp({ _id: "bad-date", totalAmount: 10, amountPaid: 2, travelDate: "not-a-date" }, new Date());`.
- Line 61: `const now = new Date("2026-10-12T00:00:00.000Z");`.
- Line 62: `const result = buildAssetAlerts({`.
- Line 78: `const result = buildAssetAlerts({`.
- Line 89: `const quote = buildQuoteDraft({`.
- Line 109: `const tour = { _id: "tour", title: "Safari", price: 1000 };`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
