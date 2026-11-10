# Source explanation: server/tests/bookingExternalIdIndex.test.js

**Source:** [server/tests/bookingExternalIdIndex.test.js](../../../server/tests/bookingExternalIdIndex.test.js)

## Purpose

A Node test module. Its assertions prove only the cases and environment configured by the test; inspect mocks and setup before generalizing.

## Imports and dependencies

- `assert` from `node:assert/strict`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `test` from `node:test`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)

## Runtime declarations and data flow

No named function declaration or arrow-function variable was extracted. The module may consist of static data, side effects, anonymous callbacks or syntax outside this extractor's current patterns.

## Module-level declarations

- Line 6: `const index = Booking.schema.indexes().find(([, options]) => options.name === "tenantId_1_externalSource_1_externalBookingId_1");`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
