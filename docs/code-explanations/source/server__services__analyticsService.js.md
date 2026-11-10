# Source explanation: server/services/analyticsService.js

**Source:** [server/services/analyticsService.js](../../../server/services/analyticsService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `tenantFilter` from `../tenancy/tenantQuery.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/tenantQuery.js](../../../server/tenancy/tenantQuery.js)
- `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `getBookingRevenueMetrics` from `./bookingRevenueService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/bookingRevenueService.js](../../../server/services/bookingRevenueService.js)

## Runtime declarations and data flow

### `getRevenueAnalytics` — lines 22–30

Parameters: `req`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:
- **Line 23:** `const metrics = await getBookingRevenueMetrics(req);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 24:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getBookingAnalytics` — lines 32–39

Parameters: `req`.
Persistent operations detected: Booking.aggregate; verify tenant/ownership filters in the exact query.

Key statements:
- **Line 34:** `return Booking.aggregate([` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getPopularTours` — lines 41–57

Parameters: `req`.
Persistent operations detected: Payment.aggregate; verify tenant/ownership filters in the exact query.

Key statements:
- **Line 43:** `return Payment.aggregate([` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 7: `const amountAfterRefund = {`.
- Line 14: `const nonNegativeAmount = {`.
- Line 22: `export const getRevenueAnalytics = async (req) => {`.
- Line 23: `const metrics = await getBookingRevenueMetrics(req);`.
- Line 32: `export const getBookingAnalytics = async (req) => {`.
- Line 41: `export const getPopularTours = async (req) => {`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
