# M-Pesa status query, booking verification and refund callbacks

## Entries 326, 328, 330 and 332

### `GET /api/mpesa/query/:checkoutRequestId` (326)

Requires tenant resolution and JWT. `queryMpesaPayment` in `server/controllers/mpesaStatusController.js` loads the tenant Payment by either checkout ID spelling, then its tenant Booking and checks owner/customer or a hard-coded staff role. Missing payment/booking 404, unauthorized 403. Terminal payment states return without provider call as `{success:true,data:{paymentStatus,providerQueried:false,payment}}`. Otherwise calls `queryStkPush`, stores raw provider query response/result code/query time. Cancelled result sets payment cancelled and booking payment failed; also cancels booking unless already completed/cancelled/refunded. Failed result saves query metadata and calls `failBookingPayment`. Successful/pending query does not itself settle payment because receipt/amount confirmation is needed; it stores query details and leaves payment pending. Response includes provider status/result data and payment. Provider/query failures use centralized error handler. No focused status-query integration test was identified.

### `GET /api/mpesa/verify/:bookingId` (328)

Requires tenant + JWT. `verifyBookingPayment` in `mpesaController.js` loads tenant booking and verifies owner/staff access; returns 404/403 as appropriate. It only reads latest tenant Payment and booking's persisted `paymentStatus`, returning `{success:true,data:{booking,payment,paymentStatus}}`. Despite the path name, it does not call Daraja and does not independently verify settlement. No state change.

### `POST /api/mpesa/refund/result` (330) and `POST /api/mpesa/refund/timeout` (332)

Provider callbacks have no JWT. `resolveMpesaRefundTenant` extracts `Result.ConversationID` or `OriginatorConversationID`, looks up a Payment by `refundReference` in bypass context, then installs its tenant context. Missing/unknown reference continues without tenant assignment; controllers acknowledge with `{ResultCode:0,ResultDesc:"Accepted"}`.

For result callbacks, missing/malformed result or reference and unmatched payment are acknowledged without mutation. A matching already completed refund is idempotently acknowledged. `ResultCode === 0` invokes `refundBookingPayment` for persisted `refundRequestedAmount`, setting completed status/reference/response; other codes set refund failed, zero requested amount, store response. Timeout marks matching noncompleted refund failed and zeroes requested amount. Both catch/log internal errors and still acknowledge success, so callers do not receive processing failures and reconciliation must inspect persisted refund status.

No independent provider signature or transaction-status verification is visible in these callback chains; correlation depends on the conversation ID matching a stored refund reference. This is source-confirmed and should be treated as a callback-integrity risk to review against the provider's network/authentication controls. The refund completion service may post financial/booking side effects; no live refund was performed. Missing tenant/reference callbacks are intentionally acknowledged without mutation. No focused callback test for these two routes was identified.

The same router is mounted at `/api/payments`; therefore the query, verify, refund-result and refund-timeout aliases at `/api/payments/...` execute the same handlers and middleware described above. They are counted as separate mounted inventory entries, not separate implementations.
