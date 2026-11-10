# Source-reviewed API contracts for critical flows

This file records contracts hand-traced from route middleware through controllers/services. It complements, but does not replace, the 629-declaration [route inventory](API_ROUTE_INVENTORY.md). “Source-reviewed” means the contract below was compared with current source. It does **not** mean the command was run against a live deployment. The remaining declarations do not yet have complete contracts here.

## Shared request context

`server/app.js` mounts `apiRoutes` under `/api`. Before route dispatch it applies global rate limiting, CORS, database readiness, JSON/urlencoded parsing, cookies, logging, and tenant resolution. `server/routes/index.js` also applies tenant resolution and plan-feature middleware before most ordinary routers. Specific routes may resolve tenant context again. `X-Tenant-ID`, `X-Tenant-Slug`, or a tenant domain/key can influence initial context, but protected routes compare that context with the authenticated account in `protect`.

For browser cookie authentication, the Axios client sends credentials and the server requires matching CSRF cookie/header on unsafe requests. Curl examples below use a Bearer token to make the authentication requirement explicit. Set tenant selector headers only to the tenant belonging to that test account.

## `POST /api/auth/login`

**Source:** `server/routes/authRoutes.js`, `server/controllers/authController.js:75-163`, `server/middleware/authRateLimiters.js`.

- **Authentication/authorization:** Public, but tenant resolution and a login rate limiter run first. This endpoint establishes authentication.
- **Request body:** `email` and `password` strings. Email is trimmed/lowercased; password is not trimmed. Both are required.
- **Tenant selection:** The resolver-selected tenant scopes regular accounts. Local login without a tenant can resolve a unique matching tenant account; if the same email occurs in multiple tenants, response is 409 `TENANT_SELECTION_REQUIRED`. Platform owner lookup is restricted to platform role names with `tenantId: null`.
- **Validation/logic:** Finds the account, rejects inactive/locked accounts, calls the model's password matcher, increments failed login attempts, and locks after five failures for 30 minutes. A successful login resets counters, builds permissions, updates last-login time, issues a JWT, sets the auth cookie, and writes audit/security events. If customer MFA is enabled, it returns a challenge rather than a session token.
- **Database effects:** Reads `User` and its role/permission data; mutates login counters/lock state or `lastLoginAt`; writes security/audit events; may create an MFA challenge.
- **Responses:** 200 `{success, token, user}`; or 200 `{success, mfaRequired: true, userId, ...}` when MFA is required. Errors include 400 missing credentials, 401 generic invalid credentials, 403 inactive/platform-role invariant, 409 ambiguous tenant, 423 temporary lock, and rate-limit response. Unexpected errors go to centralized error handling.
- **Curl template (shape checked, not executed):**

```sh
curl -i "$API_BASE_URL/api/auth/login" \
  -H 'Content-Type: application/json' \
  -H 'X-Tenant-Slug: YOUR_TEST_TENANT' \
  --data '{"email":"customer@example.test","password":"REPLACE_WITH_TEST_PASSWORD"}'
```

`API_BASE_URL` should be the API origin without `/api`; omit the tenant header only when using a tenant domain or the specific local unique-email resolution path. Do not use real credentials in shell history or published examples.

## `POST /api/bookings`

**Source:** `server/routes/index.js` mount; `server/routes/bookingRoutes.js`; `server/controllers/customerBookingController.js:13-80`; `server/services/inventoryService.js`; `server/utils/bookingPricing.js`.

- **Authentication/authorization:** Required JWT; customer role; tenant context. Route chain is `resolveTenant` → `protect` → `customerOnly` → `validateBookingTravelDate` → controller.
- **Required body fields:** `tour` (tenant-visible tour ID) and `travelDate`. Controller defaults `travelers` to `[]`, `contact` to `{}`, payment method to the M-Pesa constant, and booking type to `individual`. `numberOfGuests` falls back to traveler count then 1.
- **Conditional fields/rules:** Type must be individual/group/corporate; group needs at least two guests. Payment method must be enabled for the tenant. Corporate type additionally requires a corporate account; a configured account may require a PO number. Travel-date middleware and inventory service apply their own date/capacity checks. The controller calculates amount from server tour data.
- **Database effects:** Tenant-scoped `Tour`/`CorporateAccount` reads; `createCustomerBookingWithReservations` reserves tour capacity first, then conditionally increments corporate exposure, then creates the booking. If credit reservation or booking creation fails, it compensates by releasing reserved slots and, when already claimed, decrementing credit. Compensation failures are logged while the original failure is rethrown. The six focused helper tests cover capacity failure, credit update rejection/failure, booking creation failure, compensation failure, and success. **Guarantee boundary:** this is ordered compensation, not a Mongo transaction. Process termination between writes, ambiguous write outcomes, failed compensation, and duplicate requests without idempotency can still create inconsistency. No production database transaction or live concurrency behavior was verified.
- **Success:** 201 `{success:true,message,data:{booking},booking}`. New booking starts `status: pending` and `paymentStatus: pending` with calculated total/balance.
- **Known controller errors:** 400 required fields/type/group/corporate account/PO; 404 tour not found; 409 unavailable payment method, insufficient capacity, invalid tour price, inactive/over-limit corporate account or concurrent credit exhaustion. Date middleware may reject an invalid/out-of-window date. Unexpected errors go to the application error handler.
- **Curl template (request shape checked, not executed):**

```sh
curl -i "$API_BASE_URL/api/bookings" \
  -H 'Authorization: Bearer YOUR_TEST_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -H 'X-Tenant-Slug: YOUR_TEST_TENANT' \
  --data '{"tour":"TOUR_OBJECT_ID","travelDate":"2030-06-15","numberOfGuests":1,"travelers":[],"contact":{"phone":"+254700000000"},"bookingType":"individual","paymentMethod":"MPESA"}'
```

Replace the placeholder date with a date accepted by the actual tour and middleware; replace IDs and token with a tenant-matched test fixture. The payload is syntactically aligned with the controller, but the route may reject it because the example tour, schedule, tenant method settings, token, or date do not exist.

## M-Pesa STK initiation aliases

**Paths:** `POST /api/mpesa/stkpush`, `/api/mpesa/mpesa`, `/api/payments/stkpush`, and `/api/payments/mpesa` are aliases to the same route/controller because `mpesaRoutes` is mounted at both `/mpesa` and `/payments`.

**Source:** `server/routes/index.js`, `server/routes/mpesaRoutes.js`, `server/middleware/prepareBookingForMpesa.js`, `server/controllers/mpesaController.js:18-63`, `server/services/mpesaService.js`.

- **Authentication/authorization:** JWT required; route has payment-initiation rate limit (10 per 15 minutes) and booking-repair middleware before controller. Controller requires tenant, checks booking owner/staff access, and payment feature enabled.
- **Request body:** `bookingId` required; `phoneNumber` or `phone` required. Optional `amount` is validated against server-calculated payable booking amount. Phone can fall back to booking/user contact only after the required body check, so the request still must contain one of the phone properties.
- **Validation/state:** Middleware repairs a specific legacy pending booking shape only if it has no completed payment. Controller rejects disabled M-Pesa, missing booking, inaccessible booking, no outstanding balance, invalid phone, invalid amount/config, or conflicting pending attempt. It preflights gateway OAuth before creating the `Payment` record.
- **Database/provider effects:** Reads/repairs `Booking`; checks pending `Payment`; calls Daraja OAuth and STK endpoint; creates a processing `Payment` then saves checkout/merchant IDs and pending status; updates booking payment method/status to pending. Provider timeout may be uncertain; do not blindly retry.
- **Success:** 200 with `data` containing checkout and merchant request IDs, amount, and pending status. Existing attempt can return 200 (known checkout ID) or 202 (attempt status uncertain/no checkout ID).
- **Errors:** 400 missing inputs/no balance/invalid phone or amount; 403 ownership failure; 404 booking missing; 409 disabled M-Pesa or duplicate active attempt; 429 rate-limited; provider/config errors may produce provider-derived status or 502/500 with a public message. If Daraja explicitly rejects after a `Payment` is created, that attempt is marked failed; ambiguous transport errors are not safely equivalent to rejection.

## `GET /api/mpesa/status/:checkoutRequestId` and `/api/payments/status/:checkoutRequestId`

**Source:** M-Pesa route aliases and `checkCheckoutStatus` in `server/controllers/mpesaController.js`.

- **Authentication/authorization:** JWT required; tenant scope and `canAccessBookingPayment` must allow access to the payment's booking.
- **Path parameter:** `checkoutRequestId` is matched against either persisted `checkoutRequestID` or legacy `checkoutRequestId` spelling.
- **Database effects:** Reads tenant-scoped `Payment`, populates booking, and returns persisted current status. It does not query Daraja in this handler and is not itself a financial verification operation.
- **Success:** 200 `{success:true,data:{status,failureReason,booking,payment}}`.
- **Errors:** 400 empty ID (though Express normally requires a path segment), 404 payment/booking missing, 403 inaccessible booking; unexpected read failures are forwarded to centralized error handling.
- **Curl:** A template is only useful after initiation returns a real checkout ID. Use `GET` with the same Bearer token and tenant selector; do not fabricate a response ID and infer settlement.

## `POST /api/mpesa/callback` and `/api/payments/callback`

**Source:** `server/routes/mpesaRoutes.js`, `validateMpesaCallbackPayload`, `resolveMpesaCallbackTenant`, `verifyMpesaCallbackIntegrity`, `subscriptionMpesaCallbackController.js`, `mpesaController.js:65-67`, `paymentLifecycleService.js`.

- **Authentication:** No user JWT; the provider calls this endpoint. Integrity is established through payload shape, known checkout ID, tenant-bound stored attempt and an independent Daraja query. Network-level callback URL secrecy is not treated as sufficient verification.
- **Request:** Daraja STK callback structure under `Body.stkCallback`; required fields are defined by `server/services/mpesaCallbackPayload.js`. Do not handcraft a “successful” callback example: the integrity middleware queries the provider and compares outcomes.
- **Validation and side effects:** Validate callback; resolve tenant from stored attempt; query Daraja; reject unknown/pending/mismatched state; then `subscriptionMpesaCallbackController.js` checks whether the checkout belongs to a `SubscriptionPayment`. A match updates/fails the subscription payment and on valid amount+receipt calls `activateTenantSubscription`. Otherwise it delegates to `mpesaController.js`, which locates a booking/hospitality `Payment`; terminal payment states are ignored, amount/receipt/result are classified, and the relevant fail/complete lifecycle service persists state and may post ledger/email effects. Manager notification is best-effort.
- **Responses:** Validation/integrity stage may return 400, 409, or 503 with Daraja result fields. Controller returns `{ResultCode:0,ResultDesc:...}` for malformed/unknown/terminal callbacks and after handled result. Both the subscription callback and delegated booking/hospitality callback catch internal errors and acknowledge with result code 0; this avoids provider retry loops but means internal callback failures require logs and reconciliation.
- **Curl:** No verified success curl is supplied. A copied body alone cannot demonstrate verification, and synthetic requests can alter persisted financial state if they match configured mocks or a reachable provider attempt.

## Contract coverage status

The mounted inventory contains 629 method/path entries, including repeated router mounts. The coverage audit is authoritative for current counts. A source-traced status records inspection of route/middleware/controller and relevant model/service behavior; it does not mean a live request or every branch was tested. Curl templates are illustrative and were not executed against a live API. See [domain contract index](API_DOMAIN_CONTRACTS/INDEX.md).

## Admin booking and payment contracts (source-traced)

The following routes were traced through their mounted router, router-wide middleware, controller and directly called guards/services/models. They are documented separately in [Admin booking contracts](API_DOMAIN_CONTRACTS/admin-bookings.md) and [Admin payment contracts](API_DOMAIN_CONTRACTS/admin-payments.md). “Verified” here means source inspection; no request was sent to a running API.

- Admin booking: `GET /api/admin/bookings`, `GET /api/admin/bookings/:id`, `PUT /api/admin/bookings/:id/status`, `PUT /api/admin/bookings/:id/assign`, `PUT /api/admin/bookings/:id/payment`, `GET /api/admin/bookings/:id/timeline`, `GET /api/admin/bookings/:id/invoice`, `POST /api/admin/bookings/:id/notify`.
- Admin payment: `GET /api/admin/payments`, `GET /api/admin/payments/reconciliation`, `GET /api/admin/payments/stats`, `GET /api/admin/payments/analytics`, `GET /api/admin/payments/export/csv`, `GET /api/admin/payments/export/pdf`, `GET /api/admin/payments/:id`, `PATCH /api/admin/payments/:id/status`, `PATCH /api/admin/payments/:id`, `PATCH /api/admin/payments/:id/refund`, `PUT /api/admin/payments/:id/refund`, `POST /api/admin/payments/:id/refund`.
- Admin booking refund operations: `PUT /api/admin/bookings/:id/refund`, `POST /api/admin/bookings/:id/refund`, `PUT /api/admin/refunds/:id/process`.

These add 23 mounted method/path entries to the ten previously traced entries. The refund aliases share handlers but are still assessed as individual mounted entries. Their request/response bodies, error branches, tenant scope and side effects are recorded in the linked domain documents.


## Admin hero slide management

The four mounted admin hero contracts (`GET/POST /api/admin/hero`, `PUT/DELETE /api/admin/hero/:id`) are source-traced in [Admin hero slide contracts](API_DOMAIN_CONTRACTS/admin-hero.md). Their public read-only counterpart is `GET /api/hero` and is a separate router.


## Admin tour packages

The four mounted package contracts (`GET/POST /api/admin/packages`, `PUT/DELETE /api/admin/packages/:id`) are source-traced in [Admin tour package contracts](API_DOMAIN_CONTRACTS/admin-packages.md). No matching first-party client caller was found during this source review.


## Admin review moderation

The four mounted review contracts (`GET /api/admin/reviews`, approve, reject, and delete) are source-traced in [Admin review moderation contracts](API_DOMAIN_CONTRACTS/admin-reviews.md). The review save and tour rating recalculation are separate writes, not transactional.


## Admin roles and permissions

The eight mounted role and permission routes (GET list/permissions/detail, POST create, PUT/PATCH update, DELETE, PUT permission assignment) are source-traced in [Admin role and permission contracts](API_DOMAIN_CONTRACTS/admin-roles.md). Role default initialization and alias consolidation have non-transactional data side effects.


## Admin booking and revenue analytics

`GET /api/admin/bookings/analytics` and `GET /api/admin/revenue/analytics` are source-traced in [Admin booking and revenue analytics](API_DOMAIN_CONTRACTS/admin-analytics.md). Revenue derives from posted journal entries and is explicitly distinct from booking totals.


## Admin users and staff

The seven mounted user-management entries (list, staff creation, analytics, status PUT/PATCH aliases, profile update and deletion) are source-traced in [Admin user and staff management contracts](API_DOMAIN_CONTRACTS/admin-users.md). Staff creation and profile/deletion operations use compensations or separate writes rather than database transactions.


## Admin booking reports

The four daily/monthly/tour/agent report routes are source-traced in [Admin booking report contracts](API_DOMAIN_CONTRACTS/admin-booking-reports.md). The tour report payment lookup contains a tenant comparison that does not reference the declared aggregation variable; this is documented as a source risk.


## Admin tour catalogue

`GET /api/admin/tours` (inventory entry 101) is source-traced in [Admin tour catalogue contracts](API_DOMAIN_CONTRACTS/admin-tours.md). The handler relies on `Tour` query middleware for tenant filtering and does not have a dedicated list-contract integration test.

## Tenant sitemap

`GET /api/sitemap.xml` (inventory entry 381) is source-traced in [its endpoint guide](API_ENDPOINT_GUIDE/sitemap-xml.md). The route is tenant-resolved and unauthenticated; it returns generated XML based on fixed public pages and tenant-filtered active tour/destination reads. No dedicated route test was found.

## Tenant settings aliases

Entries 382–385 (`GET`/`PUT /api/admin/settings` and `/api/settings`) share the settings router and controller and are source-traced in [the settings endpoint guide](API_ENDPOINT_GUIDE/settings.md). All mounts use tenant resolution, JWT authentication and `settings.manage`; tenant setting changes synchronize selected organization fields in separate nontransactional writes.

## Staff directory and administration

Entries 386–393 are source-traced in [staff and operational personnel contracts](API_DOMAIN_CONTRACTS/staff-management.md). The guide records the shared tenant/JWT boundary, role gates, write side effects during staff listing, identical behavior of the two update aliases, and the hard-delete consequences. No focused endpoint tests were found.


## Admin tour lifecycle and resource operations

Entries 102–110 (tour detail, create/update/delete, publication, restore, and guide/driver/vehicle assignment) are source-traced in [Admin tour management contracts](API_DOMAIN_CONTRACTS/admin-tour-management.md). Create, resource assignment, and cancellation use Mongo transactions, which require a transaction-capable deployment topology not verified against production. The create future-date validator precedes multipart parsing.


## Agent booking aliases

The 12 mounted plural/singular agent booking entries (list/detail/create/status/cancel/delete) are source-traced in [Agent booking API contracts](API_DOMAIN_CONTRACTS/agent-bookings.md). The two prefixes mount the same router. The documentation records missing capacity reservation and non-session commission persistence in the create flow, plus cancellation side effects.


## Agent customer management

Entries 123–134 (plural and singular aliases for list, statistics, detail, create, update and soft delete) are source-traced in [Agent customer API contracts](API_DOMAIN_CONTRACTS/agent-customers.md). This review found no dedicated request-level tests. The count totals and next route are maintained in [DOCUMENTATION_COVERAGE.md](DOCUMENTATION_COVERAGE.md).


## Agent dashboard, package and overlapping aliases

Entries 135–140 cover agent package list/detail and dashboard aliases in [Agent tour package API contracts](API_DOMAIN_CONTRACTS/agent-packages.md) and [Agent dashboard API contract](API_DOMAIN_CONTRACTS/agent-dashboard.md). Entries 141–144 repeat broad agent list/customer route declarations; effective handler precedence and the response contract differences are recorded in those contracts and [Agent booking API contracts](API_DOMAIN_CONTRACTS/agent-bookings.md). The broad agent router is mounted before dedicated subrouters, so same-path requests can be served by a different controller than the later declaration suggests.


## Agent quotations, commissions and tours

Agent quote collection/create/detail/status aliases (entries 145–146, 367–374), commission list (147–148), and agent-created tour CRUD aliases (149–158) are traced in [Agent quotation contracts](API_DOMAIN_CONTRACTS/agent-quotations.md), [Agent commission contract](API_DOMAIN_CONTRACTS/agent-commission.md), and [Agent tour contracts](API_DOMAIN_CONTRACTS/agent-tours.md). The contracts document the broad-router precedence and multipart upload side effects.


## AI admin-prefixed routes

Entries 159–162 (`/api/ai/admin/dashboard`, query, analytics, briefing) are source-traced in [AI admin alias contracts](API_DOMAIN_CONTRACTS/ai-admin-aliases.md). They share implementations with `/api/admin-ai/*` but have no analytics permission gate; the risk is documented, not changed in application code.


## AI assistant and booking creation

Entries 163–165 are source-traced in [AI assistant and booking contracts](API_DOMAIN_CONTRACTS/ai-assistant-booking.md). The booking completion endpoint creates a pending booking without capacity reservation or payment, and the AI chat can create a separate pending draft on booking intent.


## Airport transfer catalog and bookings

Entries 166–173 are source-traced in [Airport transfer API contracts](API_DOMAIN_CONTRACTS/airport-transfers.md). These include public catalogue access, manager operations, customer/staff booking views, resource assignment and status transitions.


## Analytics

Entries 174–176 are source-traced in [Tenant analytics API contracts](API_DOMAIN_CONTRACTS/analytics.md), including permission requirements, query behavior and the distinction between booking revenue metrics and posted journal revenue.


## Customer registration

`POST /api/auth/register` (entry 178) is source-traced in [Customer registration contract](API_DOMAIN_CONTRACTS/auth-registration.md). The backend contains MongoDB-backed registration integration coverage, but that integration group was skipped in the latest suite run.


## Account recovery and authenticated session routes

Entries 180–186 are source-traced in [Recovery contracts](API_DOMAIN_CONTRACTS/auth-recovery.md) and [session contracts](API_DOMAIN_CONTRACTS/auth-session.md), including email-code limits, session-cookie effects and residual token revocation limits.


## Customer booking management

Entries 189–192 are source-traced in [Customer booking management](API_DOMAIN_CONTRACTS/customer-booking-management.md). Cancellation releases capacity but is not atomic with the Booking save and does not refund paid bookings; the distinct travel-date routes have different ownership and side-effect behavior.


## Booking operational reads and lifecycle status

Entries 193–197 are source-traced in [Booking operations read/status contracts](API_DOMAIN_CONTRACTS/booking-operations-read.md), including role differences between list aliases, tenant-reference consistency filtering and payment gates before active-trip status.


## Cash payment initiation

`POST /api/payments/cash` (entry 198) is source-traced in [Cash payment initiation](API_DOMAIN_CONTRACTS/cash-payment.md). Creation is pending and distinct from verified receipt; its Payment/Booking writes are not atomic.


## Public tour categories

`GET /api/categories` (entry 199) is source-traced in [Public tour categories](API_DOMAIN_CONTRACTS/public-categories.md).


## Admin commission operations

Entries 200–203 are source-traced in [Administrative commission APIs](API_DOMAIN_CONTRACTS/commission-admin.md). The pay route records an administrative payment and adjusts Agent counters; it does not execute an external disbursement.


## Coupon validation

`POST /api/coupons/validate` (entry 209) is source-traced in [Coupon validation](API_DOMAIN_CONTRACTS/coupon-validation.md), including the service/schema mismatch for expiry and minimum purchase checks.


## Stripe checkout and bank-transfer lifecycle

Entries 394–397 are source-traced in [Stripe checkout and bank-transfer API contracts](API_DOMAIN_CONTRACTS/stripe-payments.md). The trace distinguishes signed public webhook processing from authenticated checkout/session verification and bank-transfer initiation. Bank-transfer submission remains pending until staff verification; Stripe payment completion uses the transactional payment lifecycle. The focused webhook-signature unit test exists, but endpoint/provider integration tests and live Stripe verification were not run.


## Super Admin maintenance operations

Entries 398–406 are source-traced in [Super Admin maintenance API contracts](API_DOMAIN_CONTRACTS/superadmin-maintenance.md). The nine routes map to five controller handlers: backup listing/creation, cache clearing, backup deletion and download. The contract documents tenant-filter behavior, destructive process-wide cache deletion, filesystem/database partial-failure boundaries and the absence of a restore route. No focused tests were found for these maintenance handlers, and no backup or deletion operation was executed.


## Super Admin audit and operational status

Entries 407–409 are source-traced in [Super Admin operational status and audit APIs](API_DOMAIN_CONTRACTS/superadmin-operations.md). The audit listing's queries and aggregate counts are not tenant-filtered despite tenant resolution at the router, so access depends materially on the roles.manage permission boundary. Database/system status expose infrastructure metadata. No focused endpoint tests or live requests were run.


## Super Admin platform revenue

Entry 410 is source-traced in [Super Admin platform revenue API contract](API_DOMAIN_CONTRACTS/superadmin-revenue.md). The source review found a potential cross-tenant financial disclosure: tenant admins receive admin.dashboard via compatibility permissions, while this handler explicitly enters platform-wide tenant bypass. A platform-only authorization guard is recommended; no application code was changed in this documentation pass.


## Super Admin role and dashboard APIs

Entries 411–414 are source-traced in [Super Admin role and permission API contracts](API_DOMAIN_CONTRACTS/superadmin-roles.md). Entries 415–418 are source-traced in [Super Admin dashboard metrics](API_DOMAIN_CONTRACTS/superadmin-dashboard.md). The role permission update accepts empty normalized ID lists, including non-array and all-invalid input, and can therefore clear a role's permissions; this is documented as a validation edge case. The dashboard aliases are protected by protect and superAdminOnly and use explicit tenant filters for tenant operational metrics.


## Super Admin tenant directory

Entries 419–426 are source-traced in [Super Admin tenant plans and tenant directory APIs](API_DOMAIN_CONTRACTS/superadmin-tenants.md). The guide covers static plan tiers, tenant listing filters/pagination and per-tenant counts, transactional tenant/admin/default-settings creation, validation and duplicate-key handling, and tenant detail lookup. Search text is used as an unescaped regular expression; creation's post-commit safe-admin read is outside the transaction.


## Super Admin tenant gateway and company status

Entries 427–434 are source-traced in [Super Admin tenant M-Pesa gateway and status APIs](API_DOMAIN_CONTRACTS/superadmin-tenant-gateways.md), including tenant context isolation, AES-GCM credential storage, strict callback URL validation and OAuth-only validation behavior. Entries 435–436 use the same guide for status activation. The status endpoint's active branch invokes manual subscription activation without requiring a payment reference or creating a SubscriptionPayment; non-active status updates only Organization.status.


## Super Admin subscription operations

Entries 437–444 are source-traced in [Super Admin subscription operations](API_DOMAIN_CONTRACTS/superadmin-subscriptions.md). Manual activation requires a non-empty reference but does not independently verify provider settlement before creating and completing a manual payment record. Plan seat definitions differ between tenant creation and subscription activation/switching (professional 20 vs 15; enterprise 100 vs 250). Tenant deletion hard-deletes tenantId-tagged records across Mongo collections within a transaction.


## Super Admin platform billing

Entries 445–450 are source-traced in [Super Admin platform billing configuration APIs](API_DOMAIN_CONTRACTS/superadmin-billing.md). All four plan prices are required on update and must be integer KES amounts from 0 to 100,000,000. Optional feature configuration must provide an array for each plan, rejects unknown feature IDs and always includes billing. Platform settings are read/written in explicit bypass context.


## Super Admin user administration

Entries 451–460 are source-traced in [Super Admin user administration API contracts](API_DOMAIN_CONTRACTS/superadmin-users.md). The account-creation route does not assign tenantId to created User/Staff/Agent records while operating in platform bypass context, so resulting records can be tenantless. User deletion cascades Staff/Agent deletes without a transaction and does not remove other related records. Search patterns are not escaped.


## Super Admin monitoring, settings and backup operations

Entries 460–490 are source-traced in [Super Admin audit, security, settings, monitoring and backup APIs](API_DOMAIN_CONTRACTS/superadmin-operations-and-backups.md), with entry 460 sharing the user deletion contract. Effective mount order applies protect/superAdminOnly before the overlapping later routers. The backup endpoints write full platform data to plaintext JSON under server/backups without visible encryption/retention/size guards; cache clear is process-wide. API monitor reports database-derived status and does not probe endpoints or measure latency.


## Super Admin backup downloads and tools

Entries 491–492 are source-traced in [Super Admin operations and backups](API_DOMAIN_CONTRACTS/superadmin-operations-and-backups.md); platform backup downloads require a valid ObjectId and tenantId:null metadata and use a basename-safe file path. Entries 493–494 are source-traced in [Super Admin tools](API_DOMAIN_CONTRACTS/superadmin-tools.md); those routes use tenant resolution and system.security permission (which is granted to admin compatibility roles), and the settings handler is a static empty placeholder.


The duplicate POST /api/superadmin/users/accounts declaration in superAdminUserRoutes (inventory 495) is shadowed by the earlier superAdminRoutes declaration, which applies superAdminOnly before invoking the same createCompanyAccount handler.


## Tenant system health

Entries 496–499 are source-traced in [Tenant system health API contracts](API_DOMAIN_CONTRACTS/system-health.md). Both aliases use the same handler and require tenant resolution, JWT authentication, admin role and system.security permission. Each request performs Cloudinary ping and tenant M-Pesa Daraja OAuth connectivity checks; an unavailable integration is reported in the component payload rather than changing the overall HTTP success status.


## Tenant branding

Entries 504–507 are source-traced in [Tenant branding API contracts and mount reconciliation](API_DOMAIN_CONTRACTS/tenant-branding.md). The router is mounted at /api/tenant through routes/index.js and directly at /api/tenant/branding in app.js before the consolidated /api router; all four GET/PUT paths are live. Updates are limited to admin and tour_manager roles, and the settings Mixed field has no nested allowlist.


## Platform tenant directory

Entries 508–511 are source-traced in [Platform tenant directory APIs](API_DOMAIN_CONTRACTS/platform-tenants.md). The GET /api/tenants handler has a source-level defect: it calls tenantFilter(req), but the platform Super Admin flow intentionally has no req.tenantId, so the helper throws missing tenant context. The tenant create/detail/update paths are also traced, including non-transactional compensating cleanup on create.


## Tenant subscription checkout

Entries 512–514 are source-traced in [Tenant subscription and M-Pesa checkout API contracts](API_DOMAIN_CONTRACTS/tenant-subscriptions.md). Checkout uses platform-level legacy M-Pesa environment credentials, not tenant PaymentGatewayConfig; it creates a pending payment and initiates STK Push. Payment-status reads are tenant-filtered but do not poll Daraja.


## Tour resource assignment

Entry 515 is source-traced in [Tenant-safe tour resource assignment API contract](API_DOMAIN_CONTRACTS/tour-resource-assignment.md). Assignment is restricted to tenant managers, checks tenant ownership and resource availability/date overlaps, commits Tour/Staff/Vehicle changes in a Mongo transaction, then queues a webhook after commit.

## Tour manager dashboard aliases

Entries 516–517 are source-traced in [Tour manager dashboard contract](API_DOMAIN_CONTRACTS/tour-manager-dashboard.md). Both route prefixes reach the same tenant-scoped handler and return the same dashboard snapshot. The response's `revenueSource: "paid_booking_value"` label does not match the service's posted-journal revenue calculation; that discrepancy is documented in the contract.

## Tour Manager Operations Copilot

Entries 518–521 are source-traced in [Tour Manager Operations Copilot API contracts](API_DOMAIN_CONTRACTS/operations-copilot.md). Both route prefixes share the same tenant-scoped summary and preview-only quote handlers. Summary totals are based on bounded samples and its overall estimated margin can mix all bookings with only the first 100 tours; the quote endpoint uses catalogue price and persists no records. Static access tests and pure calculation tests are present; no live HTTP/controller integration was run in this documentation pass.
