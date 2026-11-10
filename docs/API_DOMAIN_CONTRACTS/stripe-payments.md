# Stripe checkout and bank-transfer API contracts

These contracts trace the four mounted Stripe-router entries (inventory 394–397) through the route, controller, tenant context, payment lifecycle, signature verifier and persistence models. They describe source behavior; they do not assert that Stripe credentials, provider calls, webhook delivery or live payments were exercised.

## Router boundary and shared dependencies

server/routes/index.js mounts stripeRoutes at /payments/stripe, yielding the /api/payments/stripe prefix. The parent API router applies resolveTenant and enforcePlanFeature before the child mount. Inside stripeRoutes.js, the webhook declaration comes before the child router's resolveTenant and protect middleware; therefore it bypasses those child-router guards, while the parent router middleware still runs. Checkout, verification and bank-transfer routes are after the child resolveTenant and protect and require an authenticated user. Checkout and bank-transfer initiation share an in-memory Express rate limiter of 10 requests per 15 minutes, with standard headers and legacy headers disabled.

server/app.js captures the exact raw JSON request bytes as req.rawBody in the express.json verify callback (1 MB JSON limit). The webhook signature verifier requires a Buffer, a Stripe t timestamp, at least one v1 HMAC-SHA256 signature, and a timestamp within 300 seconds; it compares signatures with timingSafeEqual. The focused unit test covers valid raw bytes, altered bytes, stale timestamps and the wrong secret.

The Payment model is tenant-scoped and has a unique active-attempt index by tenant/booking/provider. StripeWebhookEvent is tenant-scoped and uniquely indexes tenant/event ID, with received/processing/processed/ignored/failed states. Successful and failed provider transitions use paymentLifecycleService; completion is performed in a Mongo transaction and is idempotent when payment and booking are already completed/paid. Provider and database behavior is not tested here as a live integration.

## POST /api/payments/stripe/webhook — inventory 394

Handler: stripeWebhook. This declaration precedes the child router's resolveTenant/protect middleware. It is not JWT-authenticated by the child Stripe router; the parent API middleware still runs. The endpoint relies on the exact raw JSON body and stripe-signature header.

- **Configuration and signature:** absent STRIPE_WEBHOOK_SECRET returns 503. Missing/invalid raw bytes, signature, secret, timestamp, or HMAC returns 400. The verifier's default timestamp tolerance is five minutes.
- **Event envelope:** reads id, type, and data.object. It requires a 24-character word-character tenant ID in data.object.metadata.tenantId, plus non-empty event ID and type; otherwise 400. The handler expects the object to be a Checkout Session carrying id, metadata.tenantId, and metadata.paymentId.
- **Idempotency/lease:** claims or reclaims a tenant/event record in StripeWebhookEvent. received/failed events can be claimed; a processing event can be reclaimed when its updatedAt is older than five minutes. The unique tenant/event index arbitrates concurrent creation. Existing processed/ignored/processing events, or a failed claim that cannot be acquired, return 200 {success:true,duplicate:true}.
- **Event handling:** checkout.session.completed and checkout.session.async_payment_succeeded are success events; checkout.session.async_payment_failed and checkout.session.expired are failure events. Other types are persisted as ignored and return 200 {success:true,ignored:true}.
- **Tenant/payment correlation:** recognized events execute inside runWithTenant using the metadata tenant ID and no bypass. Session ID and tenant metadata must match; a tenant-scoped STRIPE Payment must exist and its ID must match metadata.paymentId; its tenant-scoped Booking must exist. Missing/mismatched records throw into the handler's 500 path and leave the event marked failed for retry.
- **Success/failure:** failure events call failBookingPayment only while the payment is pending/processing. Success requires payment_status === "paid" and exact amount-in-minor-units and currency matches against the saved Payment, then calls completeBookingPayment. The lifecycle service transaction prevents over-credit and recognizes already-completed payment/booking state.
- **Responses:** accepted/ignored/duplicate deliveries return HTTP 200. Missing secret returns 503; invalid signature or correlation metadata returns 400; processing failures return HTTP 500 {success:false}. The catch logs only an error code, marks the event failed when a record was claimed, and does not expose provider/database details.
- **Operational caveat:** webhook event claiming and payment/booking completion are separate persistence phases, not one encompassing transaction. A failure after payment completion but before marking the webhook event processed can cause a redelivery; payment lifecycle idempotency is the protection against duplicate financial credit. There is no focused controller-level webhook integration test in the discovered tests.

## POST /api/payments/stripe/checkout — inventory 395

Handler: createStripeSession; child-router tenant resolution and JWT protection, then paymentInitiationLimit (10 requests/15 minutes).

- **Body:** bookingId is required and string-normalized/trimmed. amount is optional; when supplied it is converted to a number. No client currency, origin, or success/cancel URL is accepted as authoritative.
- **Eligibility:** tenant setting must enable/configure CARD or 409. Authenticated user is required (401). Booking is fetched tenant-scoped and must belong to the user; otherwise 404. Deleted, cancelled, refunded, already-paid or no-balance bookings are rejected with 400.
- **Amount/currency/origin:** amount defaults to getPayableBookingAmount(booking) and must be finite, positive and no greater than the payable amount. Currency comes from tenant system settings with DEFAULT_CURRENCY/KES fallback and must be a three-letter uppercase code. Redirect origin comes only from validated CLIENT_URL (HTTP or HTTPS); request-body origin is ignored.
- **Existing attempt:** finds the latest active pending/processing STRIPE payment for the booking. A processing attempt without a provider reference returns 409. A referenced session is retrieved from Stripe: an open session with URL is reused with 200 and reused:true; expired sessions are marked cancelled and a new attempt can proceed; other/uncertain outcomes return 409.
- **Persistence/provider call:** creates a Payment in processing state before calling Stripe, with tenant/customer/booking, card method, amount/currency and active attempt. It creates a Checkout Session with a deterministic Payment-derived idempotency key and metadata for booking, tenant, payment and user. It then saves the Stripe session identifiers/URL and pending status, attaches the Payment to Booking, sets paymentMethod CARD and paymentStatus pending, and returns 201 {success:true,sessionId,url}. The provider call and subsequent Payment/Booking writes are not one database transaction. A Stripe 4xx marks the initiating Payment failed; other exceptions are delegated to centralized error handling and can leave an uncertain processing attempt.
- **Responses:** 409 when card is unavailable or an attempt is active/uncertain; 401 unauthenticated; 400 invalid/missing booking/payment amount or ineligible booking; 404 missing/not-owned booking; 200 reused session; 201 newly created session. Errors not handled locally are passed to next.

## GET /api/payments/stripe/verify/:sessionId — inventory 396

Handler: verifyStripeSession; child-router tenant resolution and JWT protection.

- **Input:** non-empty path sessionId; no request body/query fields. Empty session ID returns 400; absent user returns 401.
- **Provider and ownership checks:** retrieves the Checkout Session from Stripe, reads booking/user metadata, requires booking metadata (400), rejects a different metadata user (403), and loads the tenant-scoped booking only when owned by the caller (404 otherwise). It then requires a matching tenant-scoped STRIPE Payment for that booking/session (404) and rejects a Payment owned by another user (403).
- **Financial checks:** compares Stripe amount_total in minor units with the saved Payment amount and Stripe currency with server-configured currency. Mismatch returns 400. It does not trust a client amount or client payment status.
- **State transition:** if Payment is completed and Booking paid, returns 200 with paid:true and alreadyCompleted:true. If Stripe does not report payment_status:"paid", returns 200 with paid:false and session status details without marking the booking paid. A paid session is passed to completeBookingPayment with the saved amount and card method; success returns 200 with success, paid, alreadyCompleted, booking, payment and a limited session projection.
- **Errors:** unexpected provider/database/lifecycle errors are delegated to Express via next. The provider session retrieval is an external read; verification is not evidence that the provider integration has been exercised in this audit.

## POST /api/payments/stripe/bank-transfer — inventory 397

Handler: createBankTransferPayment; child-router tenant resolution and JWT protection, then the same 10-per-15-minute initiation limiter.

- **Body:** required bookingId; optional numeric-converted amount, reference (trimmed, max 200 characters), and notes (trimmed, max 1,000 characters). No client currency is accepted.
- **Eligibility:** tenant setting must enable/configure BANK_TRANSFER or 409. User must be authenticated (401). Booking must be tenant-scoped and owned by the user (404 otherwise); cancelled/refunded or already-paid bookings return 400.
- **Amount/currency:** amount defaults to getPayableBookingAmount; it must be finite, positive and no greater than the payable amount. Currency comes from server settings/environment fallback, not the request.
- **Duplicate behavior:** an existing pending/processing BANK Payment for the booking is returned as 200 with a message that it is awaiting verification. Otherwise a pending BANK Payment is created, attached to Booking, and the booking payment method/status become BANK_TRANSFER/pending.
- **Critical confirmation boundary:** HTTP 201 only records the customer's bank-transfer claim/reference. It does not confirm receipt, complete the Payment, or mark the Booking paid. Administrator verification must use the central payment-completion lifecycle. The Payment creation and Booking save are separate writes, not a transaction.
- **Response/errors:** 201 {success:true,message,payment:{id,status,amount,currency,transactionReference}}; duplicate pending transfer 200; unavailable method 409; unauthenticated 401; invalid/missing/ineligible booking or amount 400; missing/not-owned booking 404; unexpected failures go to next.

## Tests and verification limits

server/tests/stripeWebhookSecurity.test.js directly tests signature verification against valid bytes, tampered bytes, a timestamp outside tolerance, and a wrong secret. No focused controller-level tests were found for the four mounted Stripe endpoints, their provider calls, Mongo webhook lease/idempotency behavior, or bank-transfer confirmation. No Stripe live/sandbox request or live webhook was executed as part of this documentation trace.
