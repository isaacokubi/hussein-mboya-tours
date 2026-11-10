# `server/controllers/subscriptionMpesaCallbackController.js` — subscription callback dispatch

This is the callback route's controller. It first distinguishes tenant subscription attempts from booking/hospitality payment attempts; it imports and delegates the latter to `mpesaCallback` in `mpesaController.js`.

## Dispatch and subscription branch

1. Read `Body.stkCallback` and normalize checkout ID spelling.
2. If callback or checkout ID is absent, delegate to the general callback handler; the route's preceding validator/integrity middleware is expected to guard malformed/untrusted requests.
3. Read tenant ID from middleware-established request context. Without it, delegate to the general handler, where tenant-scoped lookup/integrity rules decide the outcome.
4. Find `SubscriptionPayment` by both tenant and checkout ID. If no subscription record matches, delegate to general payment handling.
5. If status is already completed/failed/cancelled, acknowledge as already processed.
6. A nonzero Daraja result marks the subscription payment failed and records failure text plus callback metadata.
7. For a success result, parse `Amount`, `MpesaReceiptNumber`, and phone metadata. Missing/invalid amount, mismatch with stored amount, or missing receipt marks payment failed. Otherwise save receipt/time/callback metadata and call `activateTenantSubscription` with tenant, plan, period and receipt reference.

## Error behavior

The catch logs only an error code and returns `{ResultCode:0,ResultDesc:"Accepted"}`. This avoids provider retry loops but means a failure in activation can be acknowledged as delivered. The code therefore needs operational logs and a reconciliation path; an acknowledgment is not evidence that a subscription was activated or payment settled.

## Test focus

Test callback dispatch to booking path, unknown subscription IDs, duplicate terminal callbacks, provider failure, amount mismatch, missing receipt, valid activation, and activation failure after payment persistence. Consider whether activation and payment update need one transaction/outbox strategy if a failure can leave a paid record without an active subscription.

**Related:** [`mpesaRoutes.js`](../../../server/routes/mpesaRoutes.js), [`mpesaCallbackIntegrity.js`](mpesa-callback-integrity.md), [`tenantSubscriptionService.js`](../../../server/services/tenantSubscriptionService.js).
