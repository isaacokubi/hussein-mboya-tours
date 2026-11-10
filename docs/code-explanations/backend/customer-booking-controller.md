# `server/controllers/customerBookingController.js` — customer reservation creation

The route authenticates a customer and validates the travel date before calling `createCustomerBooking`. This controller owns server-side eligibility, price calculation, inventory reservation, persistence, and notification orchestration.

## Control flow

- **Tenant and input boundary (lines 13–31):** `requireTenantId()` fails closed if called without tenant context. Destructuring sets defaults for omitted optional values. The controller explicitly requires tour/date, normalizes the selected payment method, checks tenant settings, and allows only individual/group/corporate booking types.
- **Tour/capacity/pricing (lines 33–43):** `Tour.findOne(mergeTenantFilter(...))` scopes by tenant and excludes soft-deleted tours. Guest count falls back from explicit count to travelers to one, with a minimum of one. Group size must be at least two. Capacity is checked by `validateTourCapacity`; price comes from `calculateBookingAmounts(tourData, guests)`. A non-finite or nonpositive total is rejected.
- **Corporate eligibility (lines 45–55):** Corporate bookings require an account. A tenant-scoped read checks active status, current balance plus this booking against the credit limit, with zero treated as unlimited; a configured account may require a PO number. The actual credit increment occurs later through a conditional `findOneAndUpdate` repeating the credit predicate, which prevents exceeding the configured limit for concurrent increments.
- **Reservation and booking write (lines 57–79):** `createCustomerBookingWithReservations` calls `reserveSlots` first, conditionally increments corporate balance second, then invokes `Booking.create`. `inventoryService.reserveSlots` uses a capacity-predicate update for the selected dated or general capacity, making that capacity decrement atomic. The helper compensates slots when credit claim fails, and compensates slots plus credit after booking creation failure. It preserves the original error if compensation fails. Booking price fields come from server-side calculations; model validation/hooks also apply.
- **Notification (lines 69–73):** Active staff are queried in the current tenant and receive notifications. This is best-effort: notification failure is logged and booking success is still returned.
- **Compensation/error path (lines 74–79):** If booking creation fails after reservation, the controller tries to release slots and restore corporate balance, logging compensation failures, then forwards the original error with `next`.

## Transaction boundary and real limitation

This controller does not use a Mongo transaction across capacity, credit and booking writes. The confirmed ordering defect was fixed by moving the credit increment after successful slot reservation. Capacity and corporate-credit predicates are individually atomic, but the complete multi-document workflow is not. A process crash or compensation failure can leave inconsistent state. A network/driver error after MongoDB applies the credit increment but before the callback receives its result is an ambiguous outcome: the helper cannot know whether to decrement safely. Requests also lack an idempotency key, so retried duplicate requests may create separate bookings when capacity and credit remain. Existing `bookingCreationService.js` has transaction behavior but is not used here; deployed transaction compatibility and this route's conversion remain unverified. The helper has six unit regression cases; they do not emulate ambiguous database outcomes or concurrent HTTP retries.

## Debugging and tests to write

Trace a test request through `bookingRoutes.js`, then inspect tenant, tour ID, travel date, guest count, capacity state and calculated amount. Remaining integration coverage should exercise concurrent duplicate requests, ambiguous credit-write results, compensation persistence failures, disabled payment method, notification failure, and invalid dates. Assert that no other tenant's tour or corporate account can be changed.

**Related:** [core booking trace](../../CORE_CODE_WALKTHROUGHS.md#2-customer-booking-creation-and-capacity), [API contract](../../API_VERIFIED_CONTRACTS.md#post-apibookings), [`Booking` schema](../database/models/Booking.md).
