# Source explanation: server/tests/tourLifecycleIntegration.test.js

**Source:** [server/tests/tourLifecycleIntegration.test.js](../../../server/tests/tourLifecycleIntegration.test.js)

## Purpose

A Node test module. Its assertions prove only the cases and environment configured by the test; inspect mocks and setup before generalizing.

## Imports and dependencies

- `test` from `node:test`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `assert` from `node:assert/strict`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `JournalEntry` from `../models/JournalEntry.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/JournalEntry.js](../../../server/models/JournalEntry.js)
- `completeBookingPayment` from `../services/paymentLifecycleService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/paymentLifecycleService.js](../../../server/services/paymentLifecycleService.js)
- `cancelTourAndBookings` from `../services/tourCancellationService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/tourCancellationService.js](../../../server/services/tourCancellationService.js)
- `createBookingAtomically` from `../services/bookingCreationService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/bookingCreationService.js](../../../server/services/bookingCreationService.js)
- `runWithTenant` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `getDisposableIntegrationMongoUri` from `./integrationMongoUri.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tests/integrationMongoUri.js](../../../server/tests/integrationMongoUri.js)

## Runtime declarations and data flow

No named function declaration or arrow-function variable was extracted. The module may consist of static data, side effects, anonymous callbacks or syntax outside this extractor's current patterns.

## Module-level declarations

- Line 16: `const integrationMongoUri = getDisposableIntegrationMongoUri();`.
- Line 17: `const integrationEnabled = process.env.RUN_DATABASE_INTEGRATION_TESTS === "true" && Boolean(integrationMongoUri);`.
- Line 21: `const tenantId = new mongoose.Types.ObjectId();`.
- Line 22: `const travelDate = new Date("2099-06-15T00:00:00.000Z");`.
- Line 25: `const tour = await Tour.create({`.
- Line 44: `const baseBooking = {`.
- Line 58: `const first = await createBookingAtomically({ tourId: tour._id, travelers: 1, travelDate, bookingData: baseBooking });`.
- Line 61: `const reserved = await Tour.findById(tour._id).lean();`.
- Line 76: `const payment = await Payment.create({`.
- Line 89: `const completedPayment = await completeBookingPayment({`.
- Line 97: `const paymentJournal = await JournalEntry.findOne({`.
- Line 109: `const journalCountBeforeReplay = await JournalEntry.countDocuments({`.
- Line 112: `const replayed = await completeBookingPayment({`.
- Line 123: `const cancelled = await cancelTourAndBookings({`.
- Line 131: `const cancelledBooking = await Booking.findById(first._id).lean();`.
- Line 136: `const released = await Tour.findById(tour._id).lean();`.
- Line 154: `const tenantId = new mongoose.Types.ObjectId();`.
- Line 157: `const booking = await Booking.create({`.
- Line 171: `const payment = await Payment.create({`.
- Line 184: `const original = await JournalEntry.countDocuments({ tenantId });`.
- Line 195: `const freshPayment = await Payment.findById(payment._id).lean();`.
- Line 196: `const freshBooking = await Booking.findById(booking._id).lean();`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
