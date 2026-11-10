# Admin booking and payment operations: implementation walkthrough

This guide explains the route and controller paths used by the mounted admin booking and payment APIs. It is a source-scoped explanation of the handlers named below; it does not claim every export in these large controller modules has been reviewed.

## Entry path and trust boundaries

`server/routes/index.js` mounts `adminRoutes` at `/admin`, `adminBookingRoutes` at `/admin/bookings`, and `adminPaymentRoutes` at `/admin/payments`, beneath the API router's `/api` prefix. The two dedicated routers install tenant resolution, JWT protection and admin role checks at router scope. The booking router additionally requires `booking.manage`; the payment router requires `payment.manage`. `adminRoutes` has no payment-specific permission wrapper around its refund routes, a policy inconsistency recorded in [security review](../../SECURITY.md).

The route module determines the guard order. For resource assignment, `guardBookingResources` runs after the shared admin/permission middleware and before `assignResources`. This means malformed/cross-tenant/unavailable assignments fail before the controller writes the booking. `guardPaymentRefund` similarly checks a completed, tenant-owned payment and amount before `refundPayment` attempts a provider call.

## Tenant-scoped booking list

`server/controllers/tenantBookingAdminController.js` contains helper functions used by `getAllBookings`/`getBookings`:

1. `loadOwnership(model, ids, tenantId)` filters invalid ObjectIds, deduplicates them, and performs a raw collection query constrained by both `_id` and `tenantId`. Raw collection reads do not automatically get Mongoose query middleware, so the explicit tenant predicate matters.
2. `getReferenceOwnership` gathers customer, user, tour, assigned guide, driver and vehicle IDs plus emails in booking snapshots/contact fields. It loads ownership maps concurrently with `Promise.all`.
3. `snapshotIdentityBelongsToTenant` allows an unregistered guest email, but if the email belongs to a tenant account it must belong to the active tenant.
4. `belongsToTenant` rejects a populated reference when the referenced record is missing, has no explicit tenant, or belongs to another tenant. This hides unsafe legacy links instead of leaking the populated document.
5. `getAllBookings` normalizes page/limit, builds optional search and enum filters, loads candidate tenant bookings with selected populations, filters cross-document ownership, and only then slices the page. The response contains duplicate `data` and `bookings` arrays for compatibility.

The key trade-off is safety versus query/pagination cost: the handler currently loads the full matching candidate set and verifies references in application memory before pagination. Large tenant datasets may require a tenant-consistent aggregation or batched paging design.

## Booking status and assignment

`bookingAdminController.updateBookingStatus` normalizes neither status nor transition locally beyond the helper's valid-status check: caller values must match the enum spelling. It validates ID, checks the target status, tenant-loads the current booking, rejects a no-op, and calls `canTransitionBookingStatus`. A separate condition prevents `completed` while `paymentStatus` is not `paid`. It writes through `findOneAndUpdate` with validators, populates display references, then sends status email through a best-effort helper. Persistence happens before notification; email failure does not roll back status.

`resourceTenantGuard.guardBookingResources` checks the booking and each supplied ID. Staff must be active and have the correct `position`; vehicles must be active and not marked maintenance/out-of-service; agents must not be deleted. For guide/driver/vehicle it queries for another same-tenant, same-date, non-terminal booking with that resource. This check is a separate read before the controller update, not an atomic reservation; two simultaneous requests can both pass unless a database constraint or further serialization exists.

`assignResources` then requires a paid booking. A first assignment must follow the allowed status transition to `assigned`; an already assigned booking may be reassigned. It writes all four assignments using `id || null`, which means omitted assignment fields clear prior values. The route handler does not itself send assignment notifications.

The payment status route `PUT /api/admin/bookings/:id/payment` is a deliberate 410 response. The booking's payment status is derived from the Payment ledger; administrative edits must use payment lifecycle logic.

## Payment listing, reporting and export

`adminPaymentController.getPayments` composes a tenant query with optional exact `status` and `method` filters, paginates via Mongo skip/limit, populates customer and booking/hospitality references, and separately counts records. The controller does not validate the filter strings against enums.

`getPaymentStats` and `getPaymentAnalytics` use Mongo aggregation pipelines. Stats groups by status and calculates gross and net-of-refund amounts; analytics groups count and gross amount and sorts by count. These results are computed from Payment documents, not from booking status fields.

`reconciliationController.getPaymentReconciliation` reads tenant payments, bookings, invoices and commissions concurrently, then builds maps keyed by booking ID. For each booking it sums qualifying completed/refunded ledger activity, computes expected paid/balance, and compares those values with booking and invoice snapshots using a one-cent tolerance. It separately detects overpayments, missing invoices/receipts, duplicate references, orphan financial payments and commission refund adjustments. The route is diagnostic and read-only; it does not repair inconsistencies. Because whole tenant result sets are loaded, memory/runtime grow with tenant dataset size.

`financeExportController.exportPaymentsCSV` maps tenant payment records into a smaller CSV projection. `exportPaymentsPDF` streams a PDF. Both expose customer/transaction information and therefore depend on privileged route access. In the current handler, PDF system settings are awaited before the `try`; a rejection is outside the local catch (Express 5 still propagates an async rejection through its error path).

## Manual payment confirmation

Both `PATCH /api/admin/payments/:id/status` and `PATCH /api/admin/payments/:id` call `updatePaymentStatus`.

- The controller loads the tenant payment and validates the requested status against a local list.
- For `completed`, it loads the linked tenant booking and allows manual confirmation only for `BANK` or `CASH` providers. Other providers must use callback/verification. Already-completed manual attempts are rejected.
- Tenant settings may require a cash receipt. The controller calls `completeBookingPayment`, which handles financial lifecycle state, then saves a separate `manualConfirmation` record with actor/time/amount/currency/reference/notes.
- For `failed`, it writes a bounded reason and timestamp. Other non-completed statuses are written directly; this branch does not call `canTransitionPaymentStatus`.
- For `refunded`, it rejects direct status mutation and directs the caller to refund flow.

The completion lifecycle and the later manual-confirmation metadata save are not wrapped together in one transaction. If the second save fails, payment/booking completion may already have persisted without the confirmation audit metadata.

## Refund claiming and provider boundary

`guardPaymentRefund` validates payment ID, tenant ownership, completed state and a positive amount no greater than the remaining refundable amount. The controller then re-reads/populates Payment. Only M-Pesa is automated; other payment providers return 501 for this path.

`submitMpesaRefund` revalidates amount and requires an original provider transaction reference. Its conditional `findOneAndUpdate` is the concurrency guard: it only claims a completed payment whose refund state is `none` or `failed` and whose cumulative requested amount stays within the original amount. The database mutation to `refundStatus:"processing"` occurs before the Daraja call, so a concurrent request should no longer claim the same payment. On a provider response it requires a returned conversation reference, stores it, and marks the linked booking processing. On an exception it tries to reset the claim to failed and clears request metadata; reset failure is swallowed so the original error is retained.

The HTTP success means the provider accepted a refund request and supplied a conversation reference. It does not mean the funds have been reversed. Later reconciliation/provider evidence must determine final status. Payment, provider and booking updates are not one distributed transaction.

`processRefund` is a separate internal/admin refund-record workflow. It saves the Refund status first, then updates payment via `refundBookingPayment` for completed refunds or updates the booking status for other refund states. Those writes are sequential and can partially complete; the reconciliation report is relevant if a downstream write fails.

## Source links

- [admin booking route](../../../server/routes/adminBookingRoutes.js)
- [admin payment route](../../../server/routes/adminPaymentRoutes.js)
- [admin routes](../../../server/routes/adminRoutes.js)
- [tenant booking admin controller](../../../server/controllers/tenantBookingAdminController.js)
- [booking admin controller](../../../server/controllers/bookingAdminController.js)
- [admin payment controller](../../../server/controllers/adminPaymentController.js)
- [resource tenant guards](../../../server/middleware/resourceTenantGuard.js)
- [payment reconciliation controller](../../../server/controllers/reconciliationController.js)
- [finance exports](../../../server/controllers/financeExportController.js)
- [payment lifecycle service](payment-lifecycle-service.md)
- [admin booking frontend API wrapper](../../../client/src/api/adminBookingApi.js)
- [admin payment frontend API wrapper](../../../client/src/api/admin/adminPaymentApi.js)
