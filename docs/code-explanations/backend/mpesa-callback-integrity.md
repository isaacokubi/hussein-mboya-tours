# `server/middleware/mpesaCallbackIntegrity.js` — callback verification gate

The callback route is unauthenticated by user JWT because Daraja calls it, so this middleware establishes provider/attempt integrity before application state changes.

## Sequence (`createVerifyMpesaCallbackIntegrity`)

1. Parse the Daraja STK callback using `getStkCallback`; validate its expected structure with `validateStkCallback`. Malformed payload returns provider-shaped 400.
2. Extract the checkout request ID. Resolve tenant context from the preceding `resolveMpesaCallbackTenant` middleware. Find a tenant-scoped `Payment` by current/legacy checkout ID, or a `SubscriptionPayment` by tenant and ID.
3. Reject an unknown checkout ID. A callback cannot create a payment record by claiming a success payload.
4. Select M-Pesa credentials/environment from the persisted payment attempt. Subscription attempts use the legacy configuration path when available. This binds verification to the environment used to create the attempt.
5. Call `queryStkPush(checkoutRequestID, config)` independently. Classify provider query result and callback result. If provider remains pending or the two classifications differ, return 409 and do not call `next()`.
6. Only matching, non-pending evidence proceeds to the controller. Query/network errors are logged using a code and return 503, preventing the controller from persisting a callback as verified.

## Why this matters

The callback body is remote input; successful HTTP delivery or a callback `ResultCode: 0` is not sufficient proof. The checkout ID must match a locally initiated attempt, tenant must be restored, and provider query state must agree. Amount and receipt validation still happen in the downstream callback lifecycle; this middleware alone does not settle a payment.

## Test seams and risks

`createVerifyMpesaCallbackIntegrity` accepts injected lookup functions, provider query and config checks, allowing deterministic unit tests without Daraja credentials. Cover unknown IDs, malformed callbacks, provider pending, callback/query mismatch, query rejection/timeout, subscription attempt lookup, and matching success/failure outcomes. Do not remove the second callback validation merely because the route validates shape too; the factory can be called independently in tests or other routes.

**Related:** [`mpesaRoutes.js`](../../../server/routes/mpesaRoutes.js), [`callback tenant resolution`](resolve-mpesa-callback-tenant.md), [M-Pesa flow](../../CORE_CODE_WALKTHROUGHS.md#3-payment-attempts-and-m-pesa-callback-trust).
