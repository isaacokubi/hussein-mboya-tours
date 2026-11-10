# `server/services/paymentLifecycleService.js` — authoritative booking payment state

The service centralizes booking-payment rules so provider callbacks and staff-confirmed flows use the same amount, state, and accounting decisions. It is not a gateway client: it consumes payment evidence supplied by a trusted caller.

## Amount and ownership helpers

- `normalizePaymentMethod` requires tenant context, normalizes spelling and maps supported aliases to constants; unknown values become `null`.
- `getRequesterRole` and `isStaffUser` normalize current/legacy roles.
- `userOwnsBooking` checks direct user/customer IDs and a normalized snapshot email fallback. `canAccessBooking` allows staff or owner. Tenant-scoped query must still happen before this helper; access check alone is not a tenant filter.
- `getPayableBookingAmount` rejects missing/invalid totals and selects outstanding balance when there is already a payment, otherwise configured deposit when unpaid, else total. This is why client totals are not authoritative.
- `findPendingBookingPayment` finds latest tenant-context pending/processing payment for a booking.

## Failure transition

`failBookingPayment` requires both documents, starts a Mongoose session, reloads payment and booking scoped to payment tenant within `withTransaction`, and then updates attempt/booking failure state consistently. Terminal/duplicate state checks prevent a replay from applying a second transition. The `finally` path ends the session. Review its current full body before modifying status semantics, as it coordinates failure reason, attempt metadata and potentially booking cancellation behavior.

## Completion transition

`completeBookingPayment` similarly reloads the attempt and booking in a session. It reloads both records scoped by payment tenant and has an early return when the attempt is already completed and the booking is already fully paid. It validates positive amount and booking total, marks the attempt completed, caps booking paid amount at total, updates balance/status/references, and attaches the payment to the booking in one transaction. For partial payments, the helper’s early-return predicate is not sufficient by itself to prove a repeated direct call cannot add the same amount twice; the M-Pesa controller also rejects already-terminal payment statuses before invoking it. Preserve that route guard and test all other callers/replay paths. The service may generate related commission/accounting records when business conditions are satisfied. Inspect their exact transaction/catch boundaries before assuming external effects commit atomically.

## Invariants to preserve

- All lookups and writes must preserve tenant ownership.
- The normal M-Pesa callback path checks terminal payment status before invoking completion. Verify duplicate/replay handling at every other call site; the completion helper’s local early return specifically recognizes the fully paid pair.
- A partial payment updates paid amount and remaining balance without marking the booking fully paid.
- A full settlement must synchronize payment status and booking status consistently.
- Refund processing is a separate lifecycle and must not be confused with payment failure.
- Mongo multi-document atomicity requires supported replica-set/sharded deployment; local standalone behavior may differ.

## How to debug/test

Test with an isolated tenant and injected provider evidence: exact full amount, partial amount, mismatch, missing receipt, duplicate receipt/callback, already-completed attempt, missing booking, wrong-tenant documents, and transaction abort. Assert both `Payment` and `Booking` after each case, including ledger/commission effects. Inspect `session.withTransaction` boundaries around source lines 288 onward and 449 onward.

**Related:** [`Payment` model](../database/models/Payment.md), [`Booking` model](../database/models/Booking.md), [callback walkthrough](../../CORE_CODE_WALKTHROUGHS.md#3-payment-attempts-and-m-pesa-callback-trust).
