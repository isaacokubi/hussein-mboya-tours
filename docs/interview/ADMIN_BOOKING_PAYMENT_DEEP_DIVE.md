# Interview deep dive: admin bookings, payment controls and refunds

This walkthrough adds a three-level explanation for the source-reviewed admin finance batch. It is based on the current checked-in code; it does not claim these routes were exercised against a live deployment.

## Five-minute presentation

### Minute 1: explain the domain simply

“The admin area lets authorized staff review bookings, move bookings through operational statuses, assign guides/drivers/vehicles, and inspect payment records. Booking and payment state are kept separate: a booking is the operational reservation, while Payment is the financial ledger record.”

Open `server/routes/adminBookingRoutes.js` and `server/routes/adminPaymentRoutes.js`. Point out their shared tenant/auth/admin middleware and distinct named permissions.

### Minute 2: trace booking visibility

Open `tenantBookingAdminController.js` at `getAllBookings`. Explain that a booking query being tenant-filtered is not enough if populated customer/tour/staff references point outside the tenant. The code loads reference ownership maps and filters unsafe references before building the response. Mention its current pagination trade-off: it filters candidate bookings before slicing pages, which may load many records for a large tenant.

### Minute 3: explain operations and state transitions

Open `bookingAdminController.js` at `updateBookingStatus` and `assignResources`, then `resourceTenantGuard.js`. Explain lifecycle transition checks, the separate payment-before-completion/assignment conditions, resource ownership/availability checks, and same-day conflict queries. State that those checks and the final booking write are separate operations, so concurrent assignments are a race boundary.

### Minute 4: explain financial truth and reconciliation

Open `adminPaymentController.js` at `updatePaymentStatus` and `reconciliationController.js`. Explain that manual completion is accepted only for bank/cash providers; provider payments require provider verification. Reconciliation compares Payment ledger totals with booking, invoice and commission state and reports exceptions without fixing them.

### Minute 5: explain refunds and limitations

Open `resourceTenantGuard.js` at `guardPaymentRefund`, then `adminPaymentController.js` at `submitMpesaRefund`/`refundPayment`. Explain the conditional database claim before the Daraja request and why provider acceptance is not proof of completed reversal. Point out that payment, provider, booking and refund-record writes are not one distributed transaction. Close with the security policy difference: payment router checks `payment.manage`; admin booking refund aliases do not visibly add that named permission.

## Three levels of interview answers

### Question: How does an admin booking list avoid cross-tenant data leakage?

**Beginner:** The API scopes bookings to the current tenant and checks related customer, tour and staff records before returning them.

**Intermediate:** `tenantBookingAdminController.getAllBookings` builds a tenant filter, populates references, then `filterTenantConsistentBookings` gathers ownership maps for Customer, User, Tour, Staff and Vehicle. A referenced document must have explicit ownership matching the request tenant. Snapshot emails are permitted for guest records unless an account with that email belongs to a different tenant. See [the controller walkthrough](../code-explanations/backend/admin-booking-payment-operations.md).

**Advanced:** The reference check deliberately fails closed for missing/null-tenant references, preventing legacy data from being exposed accidentally. It performs raw collection reads with explicit tenant predicates because those reads do not use normal Mongoose query middleware. The cost is that it loads and filters all candidate records before pagination; an indexed aggregation or batched strategy could improve scale, but must preserve the same cross-reference checks.

### Question: Why not edit `Booking.paymentStatus` directly?

**Beginner:** The Payment record is the financial evidence. The booking payment state is derived from it.

**Intermediate:** `PUT /api/admin/bookings/:id/payment` returns 410 with a read-only code. The admin payments endpoint can manually complete only bank/cash payment records and delegates to `completeBookingPayment`; provider-backed methods must be confirmed by provider callbacks/verification.

**Advanced:** This avoids creating a paid booking without a corresponding ledger transition. The manual completion path still has multiple writes: it calls the lifecycle service and then stores manual confirmation metadata. A failure between those writes can leave the financial transition without its audit details, so reliability/reconciliation needs to account for that boundary.

### Question: How does resource assignment prevent conflicts?

**Beginner:** It checks that the selected staff and vehicle belong to the tenant and are available, then checks for another booking on the same day.

**Intermediate:** `guardBookingResources` validates IDs and loads active tenant resources. It queries for another non-terminal booking with the same guide, driver or vehicle during the booking's calendar day. `assignResources` requires payment status `paid`, applies status transition rules, and saves the assignment.

**Advanced:** Guard reads and the assignment write are not one transaction or atomic compare-and-set. Two concurrent assignment requests can both pass the conflict read. A stronger design would serialize assignment per resource/date or enforce an equivalent unique reservation constraint, while accounting for terminal statuses and reassignment semantics.

### Question: How do refunds avoid duplicate M-Pesa requests?

**Beginner:** The server checks the amount and marks a refund as processing before contacting M-Pesa.

**Intermediate:** `guardPaymentRefund` checks tenant ownership, completed payment status and remaining refundable balance. `submitMpesaRefund` uses a conditional `findOneAndUpdate` constrained to completed payments with refund state `none` or `failed`, and ensures cumulative amounts do not exceed the payment amount. Only the request that changes the record receives a claim and calls Daraja.

**Advanced:** The claim is a database-level concurrency guard, but it cannot make the provider call and Mongo write atomic. If the provider receives the request and the response is lost, the application can be uncertain whether a reversal was created. The controller stores a conversation reference when available and reconciliation/provider status checks must settle ambiguous outcomes; HTTP success only records request submission.

## Guided source order

1. `server/routes/index.js` — router mounts and `/api` boundary.
2. `server/routes/adminBookingRoutes.js` — tenant/auth/admin/permission pipeline and booking route map.
3. `server/controllers/tenantBookingAdminController.js` — tenant reference verification and list/detail response.
4. `server/middleware/resourceTenantGuard.js` — assignment/refund preconditions.
5. `server/controllers/bookingAdminController.js` — status, assignment, 410 payment route, timeline, invoice and notification.
6. `server/routes/adminPaymentRoutes.js` — finance permission and refund aliases.
7. `server/controllers/adminPaymentController.js` — list, manual completion, refund and status control.
8. `server/services/paymentLifecycleService.js` — financial persistence and state effects.
9. `server/controllers/reconciliationController.js` — comparison algorithm.
10. `client/src/api/adminBookingApi.js` and `client/src/api/admin/adminPaymentApi.js` — actual frontend calls; note `exportBookings()` calls an unmatched route.

## Practice exercises

1. In a disposable database, test a booking with a populated reference owned by another tenant. Confirm the list/detail controller omits it and identify the ownership predicate involved.
2. Test each booking status transition and explain why a completed status requires paid state.
3. Build a concurrency test with two assignment requests attempting the same guide/date. Show whether both can pass the current guard under parallel execution.
4. Test manual cash completion with tenant setting `cashReceiptRequired` on and off; verify the payment and booking records after lifecycle completion.
5. Simulate a Daraja refund timeout after the provider accepts the request. Describe what local state is known and what reconciliation evidence is required.
6. Compare `GET /api/admin/payments/reconciliation` output with intentionally inconsistent fixture records. Verify it reports without mutating them.
7. Trace the frontend `exportBookings()` wrapper and prove whether its requested path appears in any mounted route.

Run these only with disposable tenant data and mocked providers; this documentation pass did not execute them.
