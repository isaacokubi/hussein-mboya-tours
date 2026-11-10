# Source explanation: server/services/paymentCleanupScheduler.js

**Source:** [server/services/paymentCleanupScheduler.js](../../../server/services/paymentCleanupScheduler.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `mergeTenantFilter` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `cron` from `node-cron`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `cancelExpiredPendingBookings` from `./bookingPaymentCleanupService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/bookingPaymentCleanupService.js](../../../server/services/bookingPaymentCleanupService.js)

## Runtime declarations and data flow

### `startPaymentCleanupScheduler` — lines 6–33

Parameters: none.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 12:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 14:** `await cancelExpiredPendingBookings();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

## Module-level declarations

- Line 6: `export const startPaymentCleanupScheduler = () => {`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
