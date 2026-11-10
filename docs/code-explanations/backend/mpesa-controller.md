# `server/controllers/mpesaController.js` — M-Pesa initiation, callback, and status

This controller is the HTTP boundary between routes and payment services. Several callback/status exports are compacted onto long source lines; use `nl -ba` to keep line references aligned with current source.

## STK initiation (`stkPush`, lines 18–63)

Requires tenant context, checks the tenant feature setting, then reads `bookingId` and phone from the body. It tenant-loads the booking and verifies payment ownership/staff access. `getPayableBookingAmount` derives the balance/deposit due from persisted booking values; `resolveMpesaPaymentAmount` bounds any requested partial amount. An existing pending/processing attempt is returned if its checkout ID exists; if the previous provider request is uncertain and has no ID, a 202 response blocks a duplicate prompt.

The controller validates/normalizes phone and checks gateway authentication before inserting the attempt. It creates a `Payment` marked processing, calls `initiateStkPush`, stores provider request IDs, changes payment to pending, and marks booking payment status pending. A known provider rejection marks the attempt failed; transport uncertainty receives a safe message telling the caller to query before retry. A duplicate-key conflict maps to 409. Amount and payment completion are server-owned.

## Callback (`mpesaCallback`, line 65–67)

This is the fallback handler called by `subscriptionMpesaCallbackController` when the checkout ID is not a subscription attempt. It parses checkout ID, finds tenant-scoped `Payment`, and returns an acceptance for missing or already-terminal records. `evaluateStkPaymentCallback` checks provider result, amount, receipt and callback metadata against expected payment amount. Hospitality records use hospitality lifecycle functions; ordinary booking payments load `Booking` and use `failBookingPayment` or `completeBookingPayment`. Staff notification is best-effort.

The catch also returns Daraja's accepted result shape. Operationally, this trades provider retry behavior for a requirement to monitor/reconcile internal processing failures. Never interpret HTTP 200/ResultCode 0 alone as proof of financial completion.

## Status and ownership

`checkCheckoutStatus` reads the persisted payment by checkout ID under tenant scope, populates its booking, then checks `canAccessBookingPayment`. It returns 404 for missing payment/booking, 403 for another user's booking, or 200 with saved status/failure reason/booking/payment. It does not call Daraja in this status endpoint. `verifyBookingPayment` similarly scopes the booking and checks access, then returns current booking/payment state.

## Debug order

For an initiation issue, inspect tenant feature/config, booking ownership/balance, normalized phone, duplicate pending attempt, and provider response code. For a stuck callback, trace checkout ID across persisted attempt → callback tenant resolver → integrity query → dispatch controller → lifecycle update. Do not retry an uncertain attempt before status/reconciliation.

**Related:** [API contracts](../../API_VERIFIED_CONTRACTS.md), [M-Pesa service explanation](../integrations/mpesa.md), [callback integrity](mpesa-callback-integrity.md).
