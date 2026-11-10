# Core runtime walkthroughs

These are code-reading notes for the flows where a misunderstanding can cause a security, booking-capacity, or financial-integrity defect. The references point to current source. Read the linked source beside each section; the excerpts below focus on control flow and invariants rather than copying entire large modules.

## 1. Authentication, tenant selection, and permissions

### Mental model

Authentication answers **who is making this request**. Tenant resolution answers **which organization's data is in scope**. Authorization answers **whether that identity may perform this operation**. In this application those are separate checks and order matters.

### Trace

1. `server/app.js` installs request parsing and global middleware, then route modules add tenant and auth middleware.
2. `server/middleware/tenantMiddleware.js` resolves an initial tenant from configured request context.
3. `server/middleware/authMiddleware.js:16-49` parses Bearer and cookie JWT candidates, verifies signature/issuer/audience, and tracks the source.
4. `authMiddleware.js:51-58` enforces double-submit CSRF for unsafe requests authenticated by cookie. A Bearer request does not rely on ambient browser cookies in the same way.
5. `authMiddleware.js:60-75` extracts a subject, reloads `User` from MongoDB, excludes the password, and populates the current role/permission records. This means a disabled user or revoked permission is not accepted merely because an older token still has unexpired claims.
6. `authMiddleware.js:77-100` compares the requested tenant and token tenant with the user's current tenant. Ordinary users must belong to one tenant. The platform super-admin must be tenantless and receives an explicit bypass context.
7. `requireRoles` and `checkPermission` at `authMiddleware.js:106-145` are endpoint/action checks. Resource queries still need tenant and ownership constraints.

### Important security consequence

The user lookup intentionally runs under a short super-admin bypass so the system can find the user before it knows the user's tenant. Once the role is known, the middleware immediately replaces that context with either the user's tenant or the explicitly permitted platform bypass. Do not move ordinary domain queries into the pre-resolution section.

### How to debug

- 401: inspect token presence, issuer/audience/expiry, and whether the user still exists.
- 403 “another company” or “tenant mismatch”: inspect the tenant selector/header, token's tenant claim, and `User.tenantId` without logging the token itself.
- Cookie-authenticated write gets CSRF 403: confirm the CSRF cookie and `X-CSRF-Token` header are both sent and match.
- A user passes a role guard but sees another tenant's record: trace the controller's query filter independently; role permission is not ownership.

### Practice questions

- Why reload a user rather than trust only a JWT role claim?
- Why must frontend route guards not be treated as authorization?
- What query paths could bypass normal tenant scoping (aggregation, raw collection operations, background jobs)?

## 2. Customer booking creation and capacity

### Request path

`client/src/pages/Checkout.jsx` gathers booking inputs; `client/src/api/bookingApi.js:12` POSTs the serialized payload to `/bookings`. `server/routes/bookingRoutes.js:1-28` applies tenant resolution and `protect` to the router, then customer role and travel-date validation to `POST /`. The controller is `server/controllers/customerBookingController.js`.

### Controller logic, in execution order

- Lines 13-24 require tenant context and destructure the supported body fields. Defaults make omitted optional fields deterministic; they do not mean every field is validated here.
- Lines 26-31 reject missing tour/date, normalize payment method, check that the tenant has enabled it, and restrict booking type to individual/group/corporate.
- Lines 33-43 load a non-deleted tour under tenant scope, compute guest count, apply group minimum, check capacity, and calculate price on the server. A client-provided amount does not determine `totalAmount`.
- Lines 45-55 reserve corporate credit conditionally. The query checks active status and credit limit; the update repeats the condition while incrementing balance. Rechecking in the update closes the race between read and write better than relying on the first read.
- Lines 57-68 reserve tour slots and create a pending booking. The persisted contact snapshot is derived from authenticated user data with explicit contact values as fallbacks. The booking begins unpaid/pending, with `balanceAmount` equal to the calculated total.
- Lines 69-73 create best-effort staff notifications. Failure is logged but does not undo a valid booking.
- Lines 74-79 compensate for a booking-create failure by releasing reserved slots and decrementing corporate exposure, then pass the original error to Express.

### Critical nuance: not a single database transaction

The route's actual `createCustomerBooking` flow calls `reserveSlots` and then `Booking.create` directly. It uses compensating updates if `Booking.create` fails. The separate `server/services/bookingCreationService.js` wraps slot reservation and insertion in `session.withTransaction`, but this controller does not call that helper. Therefore do not claim this route is atomic. A process crash between reservation and booking insert can leave capacity reserved. Also, corporate credit is incremented before `reserveSlots`, while the compensation `try` begins only after `reserveSlots`; if slot reservation throws, this route does not execute the corporate-credit rollback. Both are consistency gaps to address with transactions or explicit compensation around the full sequence. Transaction support also depends on MongoDB topology.

### Failure map

| Condition | Result | State effect |
|---|---|---|
| Missing tour/date | 400 | No booking write |
| Disabled tenant payment method | 409 | No booking write |
| Tour absent in tenant | 404 | No booking write |
| Capacity unavailable | 409 | No booking write |
| Invalid/nonpositive server price | 409 | No booking write |
| Corporate account missing / PO missing | 400 | No reservation if rejected before credit increment |
| Corporate account inactive/credit exhausted | 409 | No booking write |
| Slot reservation throws after corporate credit increment | central error handling | current compensation block has not started; corporate credit may remain incremented |
| Booking insert fails after slot reservation | central error handling | attempts slot and credit compensation |
| Notification insert fails | booking still returns 201 | error logged only |

### How to debug

Use the request ID and tenant ID in server logs, then inspect the booking's `tour`, `travelDate`, `numberOfGuests`, `totalAmount`, status, and tenant-scoped capacity data. For a mismatch between displayed and persisted amount, trace `calculateBookingAmounts` and the tour fields; never “fix” it by trusting the browser amount.

## 3. Payment attempts and M-Pesa callback trust

### Initiation is not settlement

`mpesaRoutes.js:17-24` mounts STK aliases behind `protect`, the initiation rate limiter, and booking preparation. `mpesaController.js:18-63` then:

1. Requires tenant context and checks the tenant's M-Pesa feature switch.
2. Requires `bookingId` and phone, loads the booking under tenant scope, and calls `canAccessBookingPayment`.
3. Calculates the payable amount from persisted booking balance/deposit through `getPayableBookingAmount`; the client amount is constrained by `resolveMpesaPaymentAmount`.
4. Reuses or rejects an existing pending/processing attempt. If an existing attempt has no provider checkout ID, it returns 202 with an uncertain-state message instead of making another prompt.
5. Normalizes the Kenyan number and obtains tenant gateway configuration/token before inserting a `Payment` attempt. This ordering prevents invalid phone/configuration from leaving a stuck attempt.
6. Creates a processing `Payment`, submits STK Push, stores `MerchantRequestID` and `CheckoutRequestID`, sets the attempt pending, and keeps the booking payment status pending.

HTTP success here means the provider accepted the request and returned identifiers. It does not prove a PIN was entered or funds settled.

### Callback request and tenant binding

`mpesaRoutes.js:19` exposes `/callback` without user JWT because Daraja calls it server-to-server. The route applies, in order: payload validation, callback tenant resolution, integrity verification, then `subscriptionMpesaCallback` in `server/controllers/subscriptionMpesaCallbackController.js`.

- `resolveMpesaCallbackTenant.js` extracts the checkout ID, performs a narrow cross-tenant lookup under explicit bypass, derives the stored payment's tenant, then sets request-scoped tenant context. Its comment explains why simply wrapping `next()` in `runWithTenant` would end the async context too soon.
- `mpesaCallbackIntegrity.js` validates shape again, locates the known payment attempt (or subscription attempt), queries Daraja using the stored provider environment, classifies both provider and callback result codes, and rejects pending/mismatched states. Unknown checkouts fail closed. Provider verification failure returns 503 so the callback is not treated as verified.
- `subscriptionMpesaCallback` first searches `SubscriptionPayment` by tenant and checkout ID. If found, it handles subscription result codes, verifies amount and receipt, persists callback metadata, and calls `activateTenantSubscription`. Otherwise it delegates to `mpesaCallback` in `mpesaController.js`. The latter ignores unknown/malformed/already-terminal callbacks with a provider-compatible acceptance response. For a known booking/hospitality payment, `evaluateStkPaymentCallback` checks result, amount and receipt; failure states call failure lifecycle functions, success calls the relevant completion service, and manager notifications are best-effort.

### Idempotency and exception boundary

Terminal statuses are checked before processing, and lifecycle service functions own the persisted state transition. Review `server/services/paymentLifecycleService.js` for transactional updates and duplicate receipt behavior before changing callback behavior. The controller catches processing errors and returns Daraja's accepted shape even on internal errors; this prevents repeated delivery storms but can hide an unprocessed callback unless logs/monitoring and reconciliation catch it. This is a concrete operational risk, not proof of successful settlement.

### How to debug safely

Trace one attempt by `CheckoutRequestID` across `Payment`, callback logs, provider query result, and `Booking`. Never put credentials, access tokens, raw phone numbers, or full callback personal data in ad hoc logs. Simulate malformed, duplicate, amount-mismatch, missing-receipt, provider-failed, and provider-query-timeout cases with mocks before using sandbox credentials.

## 4. Frontend state and API communication

### Remote state versus UI state

`Checkout.jsx` uses TanStack Query for remote tour/booking/settings data and React state for draft inputs and transient payment state. The query keys include the entity ID (and host for public settings) so cache entries correspond to the data scope. `enabled` prevents requests until the relevant checkout kind/ID exists. `useMemo` derives normalized views and totals; it does not make server values authoritative.

Effects hydrate form state when loaded booking/tour data changes, constrain dates to an allowed range, synchronize pickup time with travel date, and keep payment amount within the UI's balance/deposit bounds. These are UX safeguards; the API must validate again.

### Mutation and payment status

The M-Pesa mutation normalizes and checks the phone, calls the API wrapper, and requires a returned checkout ID before showing “prompt sent.” Its state is explicitly pending. The status effect polls every three seconds, up to 60 attempts, and cleans up the timer when state changes or the component unmounts. A completed/failed/cancelled status stops polling. Network errors continue polling, while 60 unresolved attempts become a UI timeout, not a payment failure.

Other methods branch by selected method. Stripe/PayPal require a redirect URL and navigate to it; bank/cash are shown as pending staff verification. None of these branches should be described as payment completion merely because the initiation endpoint succeeded.

### Shared Axios responsibilities

`client/src/api/axios.js` chooses the base URL, rejects unsafe/malformed production API URLs, derives a public tenant selector where needed, sets `withCredentials`, and installs request/response interceptors. It coordinates cookie credentials, tenant headers, CSRF behavior, and stale-auth response handling. Values prefixed `VITE_` are public build-time configuration, never secrets. For auth/tenant bugs, inspect interceptor configuration and browser Network headers before changing individual API wrappers.

### API request trace exercise

Open `bookingApi.js:12`, inspect the actual URL and body supplied by the form, then follow the mounted prefix in `server/routes/index.js`, route middleware in `bookingRoutes.js`, `createCustomerBooking`, model hooks in `Booking.js`, and the JSON response. Repeat for payment using `initiateMpesa` and the independent callback request.

## 5. Interview-ready source-backed claims

- “The booking route validates capacity and computes price server-side.” Reference `customerBookingController.js:33-43`.
- “The customer booking flow uses compensating rollback, not the available Mongo transaction helper.” Reference `customerBookingController.js:57-79` versus `bookingCreationService.js:6-19`.
- “M-Pesa initiation persists a pending attempt; callback is independently validated and provider-queried.” Reference `mpesaController.js:18-63`, `mpesaRoutes.js:17-24`, and `mpesaCallbackIntegrity.js:16-58`.
- “The callback controller acknowledges errors to Daraja, so operational reconciliation is important.” Reference `mpesaController.js:65-67`.
- “The browser separates server cache from transient checkout state.” Reference `Checkout.jsx` query/mutation/effect blocks and `bookingApi.js`.

Do not claim that all production payment flows, deployed behavior, or all route contracts have been verified by reading source alone.
