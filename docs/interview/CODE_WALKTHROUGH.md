# Interview code walkthrough

## Recommended order

1. `client/src/main.jsx` — provider tree and React entry.
2. `client/src/routes/AppRoutes.jsx` — URL map, lazy pages and guards.
3. A feature page such as `client/src/pages/Checkout.jsx` — user intent and form state.
4. `client/src/api/bookingApi.js` and `client/src/api/axios.js` — request path and auth/tenant headers.
5. `server/app.js` — global middleware order and route mounts.
6. `server/routes/bookingRoutes.js` — method/path and endpoint guards.
7. `server/controllers/customerBookingController.js` — validated request and domain orchestration.
8. `server/services/bookingCreationService.js` — Mongo transaction and inventory reservation.
9. `server/models/Booking.js` and `Tour.js` — persisted shape, invariants and indexes.
10. For payment, continue with `mpesaRoutes.js` → `mpesaController.js` → `mpesaService.js` → `paymentLifecycleService.js` → `Payment.js`.
11. `server/middleware/authMiddleware.js` and `tenancy/context.js` — cross-cutting trust boundaries.
12. `server/server.js`, `render.yaml`, `vercel.json` — lifecycle and configured deployment.

For the detailed step-by-step reasoning, open [Core runtime walkthroughs](../CORE_CODE_WALKTHROUGHS.md). In particular, do not describe the customer booking controller as using a Mongo transaction: `customerBookingController.js` reserves inventory and then writes the booking with compensating updates, while `bookingCreationService.js` contains a separate transaction helper.

## Trace one request

Start with the browser network action and exact URL. Follow the client API function, shared Axios interceptor, Express mount prefix, router middleware, controller, called service and model query. Note where tenant ID and user identity enter and where response shape is constructed. If asynchronous work/provider callback follows, treat it as a second request and follow its own authentication/integrity mechanism.

For endpoint-specific request/response details, use [the source-reviewed critical API contracts](../API_VERIFIED_CONTRACTS.md); the route inventory alone is not a complete API contract.

For the admin booking, reconciliation, manual payment and refund walkthrough, including beginner/intermediate/advanced answers, use the [admin finance interview deep dive](ADMIN_BOOKING_PAYMENT_DEEP_DIVE.md).

## Demonstration script

Use a non-production tenant and test account. Browse a tour, show a booking form and the server response/status, then show how staff sees the scoped booking. If demonstrating payment, use provider sandbox only and show the sequence of initiated → callback/query verified → persisted status. If provider credentials or callback are not configured, demonstrate the code path and explicitly say the live lifecycle is unverified. Never display real credentials, customer personal data or tokens.

## Explain design choices

- Why tenant context precedes data operations: prevent accidental cross-company access.
- The separate transaction helper can couple reservation and insertion where invoked; the customer route currently uses reservation plus compensating updates, so explain this gap and its crash/race implications accurately.
- Why server computes payment amount: client input is untrusted.
- Why provider callbacks need independent verification: asynchronous payload delivery is not equivalent to confirmed funds.
- Why query cache invalidation exists: refresh UI from persisted server state after mutations.

## Feature-by-feature interview demonstrations

Use a non-production tenant and test user. Keep the browser Network panel open. Do not show real tokens, payment credentials, customer PII or live provider transactions.

### 1. Login and tenant-aware session

Open `client/src/pages/Login.jsx` → `client/src/context/AuthContext.jsx` → `client/src/api/axios.js` → `server/routes/authRoutes.js` → `server/controllers/authController.js` → `server/models/User.js` → `server/middleware/authMiddleware.js`.

Say: “The browser clears stale tenant/query state, posts credentials, and stores the returned UI session. The server resolves the tenant, rate-limits login, checks the password through the User model, sets an HttpOnly cookie and returns the public user/token. Subsequent protected requests reload the account and compare tenant identity. The frontend permission helpers are navigation only.” Note that registration returns no token, unlike login.

### 2. Tour discovery and selection

Open `client/src/pages/Tours.jsx` → `client/src/api/tourApi.js` → `server/routes/tourRoutes.js` → the exact `getTours`/search controller → `server/models/Tour.js`.

Say: “Catalog display is a read path. It does not reserve a slot. I follow the exact query params into the handler and show where public/published/tenant filters are applied; reservation happens later in the booking POST.” Verify the live page's actual filter parameters before describing them.

### 3. Booking creation and capacity

Open `client/src/pages/TourDetails.jsx` → `client/src/pages/Checkout.jsx` → `client/src/api/bookingApi.js` → `server/routes/bookingRoutes.js` → `server/middleware/validateBookingTravelDate.js` → `server/controllers/customerBookingController.js` → `server/services/inventoryService.js` → `server/utils/bookingPricing.js` → `server/models/Booking.js`.

Say: “The browser sends booking intent, not an authoritative total. The backend reloads the tenant tour, validates date/guest count, calculates price and reserves capacity. This path uses compensating updates rather than the transaction helper. Corporate credit is incremented before slot reservation, and the current compensation try block begins after reservation succeeds, so a reservation failure can leave credit overstated. That is a specific consistency issue I would test and address.”

### 4. Checkout state and initial booking response

Keep `Checkout.jsx` open beside React Query Devtools/Network. Show the tour/booking/settings query keys, derived balance, mutation state, and `POST /bookings` response.

Say: “TanStack Query owns fetched server data; React state owns editable form/prompt state. A booking can persist even if the following payment initiation fails, so I explain those as separate operations. The displayed payment bounds improve UX; the server enforces the real balance.”

### 5. M-Pesa payment initiation

Open `client/src/api/mpesaApi.js` → `server/routes/mpesaRoutes.js` → `server/middleware/prepareBookingForMpesa.js` → `server/controllers/mpesaController.js` → `server/services/paymentLifecycleService.js` (payable amount) → `server/services/mpesaService.js` → `server/models/Payment.js`.

Say: “The backend checks tenant enablement, booking access, balance and phone; it reuses or blocks active attempts, creates a processing payment, and calls Daraja. An accepted STK request only produces provider identifiers and a pending record; it is not settlement.”

### 6. Callback, verification and payment status

Open `server/routes/mpesaRoutes.js` → `server/middleware/mpesaCallbackIntegrity.js` → `server/middleware/resolveMpesaCallbackTenant.js` → `server/controllers/subscriptionMpesaCallbackController.js` → `server/controllers/mpesaController.js` → `server/services/paymentLifecycleService.js` → `client/src/pages/PaymentStatus.jsx` or `Checkout.jsx`.

Say: “Callback handling is a separate server-to-server request. The middleware restores tenant by the stored checkout ID and independently queries Daraja. The callback controller first checks subscription attempts, then delegates booking/hospitality attempts. The lifecycle persists verified payment and booking state; the browser polls persisted status. The controller acknowledges internal errors to Daraja, so logs/reconciliation matter.”

### 7. Database persistence and staff follow-up

Open `server/models/Booking.js` and `Payment.js`, then the relevant admin booking/payment route and controller. In a safe test database, query only the test records by tenant and booking ID.

Say: “Mongo stores tenant-scoped documents and ObjectId references; Mongoose hooks add validation and derived state. I show both booking and payment after each step and identify which effects are transactional versus best-effort. I do not infer that a notification/email/ledger side effect succeeded just because the booking write did.”

### 8. Failure scenario demonstration

Use mocked tests or a disposable environment to show invalid booking date, capacity conflict, provider timeout/uncertain attempt, callback amount mismatch, and duplicate terminal callback. Explain expected status and which persisted record should remain. Do not invoke live M-Pesa, Stripe, PayPal or production database writes during an interview demo.
