# Source explanation: server/tests/hospitalityPaymentLifecycleIntegration.test.js

**Source:** [server/tests/hospitalityPaymentLifecycleIntegration.test.js](../../../server/tests/hospitalityPaymentLifecycleIntegration.test.js)

## Purpose

A Node test module. Its assertions prove only the cases and environment configured by the test; inspect mocks and setup before generalizing.

## Imports and dependencies

- `test` from `node:test`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `assert` from `node:assert/strict`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `AirportTransferBooking` from `../models/AirportTransferBooking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/AirportTransferBooking.js](../../../server/models/AirportTransferBooking.js)
- `Invoice` from `../models/Invoice.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Invoice.js](../../../server/models/Invoice.js)
- `JournalEntry` from `../models/JournalEntry.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/JournalEntry.js](../../../server/models/JournalEntry.js)
- `completeHospitalityPayment` from `../services/hospitalityPaymentLifecycleService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/hospitalityPaymentLifecycleService.js](../../../server/services/hospitalityPaymentLifecycleService.js)
- `runWithTenant` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `getDisposableIntegrationMongoUri` from `./integrationMongoUri.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tests/integrationMongoUri.js](../../../server/tests/integrationMongoUri.js)

## Runtime declarations and data flow

No named function declaration or arrow-function variable was extracted. The module may consist of static data, side effects, anonymous callbacks or syntax outside this extractor's current patterns.

## Module-level declarations

- Line 12: `const integrationMongoUri = getDisposableIntegrationMongoUri();`.
- Line 13: `const integrationEnabled = process.env.RUN_DATABASE_INTEGRATION_TESTS === "true" && Boolean(integrationMongoUri);`.
- Line 17: `const tenantId = new mongoose.Types.ObjectId();`.
- Line 18: `const bookingId = new mongoose.Types.ObjectId();`.
- Line 21: `const booking = await AirportTransferBooking.create({`.
- Line 37: `const payment = await Payment.create({`.
- Line 51: `const result = await completeHospitalityPayment({`.
- Line 62: `const paymentJournal = await JournalEntry.findOne({`.
- Line 69: `const debit = paymentJournal.lines.reduce((sum, line) => sum + Number(line.debit || 0), 0);`.
- Line 70: `const credit = paymentJournal.lines.reduce((sum, line) => sum + Number(line.credit || 0), 0);`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
