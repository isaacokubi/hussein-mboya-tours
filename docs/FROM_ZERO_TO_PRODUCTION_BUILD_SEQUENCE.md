# Build Global Tours From Zero — Exact File Order and Frontend/Backend Communication

> Companion to [System From Scratch Guide](SYSTEM_FROM_SCRATCH_GUIDE.md). This guide focuses on the practical creation sequence, dependencies between files, and the exact path a request takes from a React screen to Express, MongoDB and back.
>
> Paths below are based on the checked-in repository. When recreating the platform from an empty repository, create foundational modules first and add later files only after their imports and contracts exist. Use a disposable development database. Never commit credentials or run demo reset scripts against production.

## 1. Understand the finished architecture

- `client/` is the browser application. React renders pages and dashboards, collects user input, calls the API and displays returned data.
- `server/` is the trusted API. Express authenticates requests, resolves the organisation (tenant), checks permissions, applies business rules, accesses MongoDB and returns JSON.
- MongoDB stores durable records. Mongoose models define their structure, validation and indexes.
- Socket.IO is a separate real-time channel for supported events; it does not replace the HTTP API.
- External providers (Daraja, Stripe, PayPal, Cloudinary, email and AI) are called by the backend. Secret provider credentials must never be embedded in browser code.

```text
React page / dashboard
   -> feature API wrapper (client/src/api/bookingApi.js)
   -> shared Axios client (client/src/api/axios.js)
   -> HTTP request to /api/...
   -> Vite proxy in development (or configured HTTPS API in production)
   -> Express application (server/app.js)
   -> request context, security, parsing, tenant resolution and API router
   -> feature route + authentication/permission/plan middleware
   -> controller (server/controllers/...)
   -> business service (server/services/...)
   -> Mongoose model (server/models/...) with tenant isolation
   -> MongoDB
   <- controller returns HTTP status + JSON
   <- Axios resolves/rejects
   <- React state/query cache refreshes the visible interface
```

The browser must never connect directly to MongoDB. The backend is the security and business-rule boundary.

## 2. Create the repository foundation first

| Order | File/folder | Responsibility | Why now |
|---:|---|---|---|
| 1 | `.gitignore` | Excludes secrets, dependencies, build output, logs and local files. | Prevent accidental commits from day one. |
| 2 | `README.md` | Purpose, architecture, setup, commands and safety rules. | Establishes shared project instructions. |
| 3 | `server/package.json` | Backend dependencies and scripts. | Defines the API runtime. |
| 4 | `client/package.json` | React/Vite dependencies and scripts. | Defines the browser runtime independently. |
| 5 | `server/.env.example`, `client/.env.example` | Variable names with placeholders only. | Makes configuration reproducible without exposing secrets. |
| 6 | Both package lockfiles | Generated dependency resolution. | Makes installs repeatable. |
| 7 | `docs/` | Architecture, API, security, testing and release guides. | Captures decisions as the system grows. |

Do not place MongoDB URIs, JWT secrets, Daraja passkeys, Stripe/PayPal secrets, Cloudinary secrets or API keys in Git.

## 3. Backend creation order

Build from infrastructure toward business features. Do not start with controllers or dashboards; they depend on configuration, tenant identity, models and business rules.

### Phase A — environment and configuration

Create these first:

1. `server/config/envValidation.js` — reusable checks for required variables and valid values.
2. `server/config/mongoConfig.js` — validates the MongoDB URI and environment/database target.
3. `server/config/corsPolicy.js` — validates the exact browser origins allowed to call the API.
4. `server/config/env.js` — loads environment files, validates production settings and exports normalized configuration.
5. `server/config/database.js` — opens the Mongoose connection and checks the supported MongoDB version.

Configuration modules must not depend on controllers or feature routes.

### Phase B — tenant isolation and request context

Create before tenant-owned models and feature routes:

1. `server/tenancy/context.js` — stores/exposes the tenant context for the current asynchronous request.
2. `server/tenancy/tenantPlugin.js` — applies tenant-aware query and write behavior to Mongoose schemas.
3. `server/tenancy/bootstrap.js` — registers the tenant plugin before tenant-owned models are compiled.
4. `server/middleware/requestContext.js` — creates request metadata such as a request ID.
5. `server/utils/tenantHost.js` — normalizes and interprets tenant host names.
6. `server/middleware/tenantMiddleware.js` — resolves the organisation and establishes request tenant context.

Tenant isolation is a backend guarantee, not a frontend filter. A user changing a URL, request body or browser storage value must not gain access to another organisation's records.

### Phase C — constants and shared utilities

Create common contracts before feature code consumes them:

- `server/constants/` — role/permission names, booking states, payment states and other controlled values.
- `server/utils/apiResponse.js` — consistent JSON response helpers.
- `server/utils/publicError.js` — safe client-facing error messages.
- `server/utils/generateToken.js` and `server/utils/authCookie.js` — token/cookie helpers.
- `server/utils/bookingPricing.js` — reusable booking amount calculations.
- `server/utils/withTransaction.js` — transaction helpers where appropriate.

Keep shared rules in one place so routes do not invent incompatible statuses or money calculations.

### Phase D — database models

Create models in dependency order: tenant and identity first, then catalogue, customer transactions, and dependent finance/operations records.

| Order | Existing path examples | Stores |
|---:|---|---|
| 1 | `server/models/Organization.js` | Tenant/business workspace. |
| 2 | `Permission.js`, `Role.js`, `User.js` | Permissions, roles and user accounts. |
| 3 | `SystemSetting.js` | Tenant/platform settings. |
| 4 | `Destination.js`, `Tour.js`, `Category.js` | Public travel catalogue. |
| 5 | `Customer.js`, `Agent.js`, `Staff.js` | People and business participants. |
| 6 | `Booking.js`, `CustomTourRequest.js` | Reservations and custom-tour requests. |
| 7 | `Payment.js`, `Invoice.js`, `Commission.js` | Payment and finance records. |
| 8 | `Hotel.js`, `HotelRoomType.js`, `AccommodationInventory.js`, `AirportTransfer.js` | Hospitality inventory and transport. |
| 9 | Remaining finance, compliance, notification, audit, subscription and operations models | Supporting platform records. |

For each model define field types, references, validation, indexes and tenant ownership. Register tenant bootstrap before compiling tenant-owned models.

### Phase E — business services

Services own reusable business rules; controllers should not duplicate them. A representative booking/payment dependency chain is:

1. `server/services/inventoryService.js` — validates capacity and reserves/releases inventory.
2. `server/utils/bookingPricing.js` — calculates totals and amounts.
3. `server/services/customerBookingReservation.js` — coordinates reservation behavior.
4. `server/services/bookingCreationService.js` — creates the booking atomically with inventory reservation where supported.
5. `server/services/paymentLifecycleService.js` — coordinates payment status, booking synchronization and financial side effects.
6. `server/services/operationalAccountingService.js` — posts financial ledger effects.
7. Notification, email, SMS, webhook and reporting services — communicate/report after the core state transition is handled.

For other domains, create low-level validators/calculations first, then services that coordinate them.

### Phase F — middleware and access control

Create or complete:

- `server/middleware/authMiddleware.js` — validates user identity and applies role/permission guards.
- `server/middleware/tenantMiddleware.js` — resolves the tenant and blocks cross-tenant access.
- `server/middleware/planFeatureMiddleware.js` — checks tenant plan entitlements.
- Request validation, rate-limit, upload, logging and error middleware.

Hiding a button in React is not authorization. Every protected action must be enforced again by the API.

### Phase G — controllers, then routes

Create controllers only after the models, services and middleware they use exist. Then create route modules that connect HTTP methods/paths to middleware and controllers.

Booking examples:

- `server/controllers/customerBookingController.js` — receives customer booking input and delegates reservation work.
- `server/controllers/bookingController.js` and related booking controllers — retrieval and management actions.
- `server/routes/bookingRoutes.js` — declares booking endpoints and guards.
- `server/routes/index.js` — mounts feature routers under API prefixes.

Keep responsibilities separate: route = URL/middleware mapping; controller = HTTP input/output; service = business rules; model = persistence structure and validation.

### Phase H — assemble and start the API last

1. `server/app.js` — composes Express middleware, health/readiness endpoints, tenant resolution, API routers, 404 and central error handling.
2. `server/server.js` — process entry point: connects MongoDB, starts the HTTP listener, initializes Socket.IO and background workers/schedulers, and handles graceful shutdown.

`app.js` composes a testable HTTP application; `server.js` owns process startup/shutdown. Build these after their imports exist.

### Phase I — tests, seeds and scripts

- `server/tests/` — unit, model, integration, tenant-isolation, payment and regression tests.
- `server/seeds/` — repeatable sample data for disposable development/test databases.
- `server/scripts/` — safe checks, migrations, audits and controlled operational tasks.

Write tests alongside features. Never run demo reset/seed scripts against production.

## 4. Frontend creation order

The frontend consumes the API; it does not implement server-side authorization or database rules.

### Phase A — browser shell

1. `client/index.html` — browser document and React mount element.
2. `client/vite.config.js` — React/Tailwind plugins, development API proxy and build settings.
3. `client/src/index.css` and `client/src/App.css` — global/application styles.
4. `client/src/main.jsx` — final bootstrap that mounts React and providers.

### Phase B — API transport before pages

1. `client/src/api/apiUrls.js` — resolves API and Socket.IO origins from deployment configuration.
2. `client/src/api/axios.js` — shared Axios instance, base URL and request/response handling, including authentication/tenant request context.
3. `client/src/lib/queryClient.js` — shared TanStack Query cache/defaults.
4. Feature API wrappers, for example `authApi.js`, `tourApi.js`, `destinationApi.js`, `bookingApi.js`, and admin API modules.

Every feature wrapper should use the shared Axios client. Do not put provider secrets in browser code.

### Phase C — contexts and shared UI

Create contexts after API transport exists:

- `client/src/context/AuthContext.jsx` — current user, authentication and client-side permission information.
- `client/src/context/TenantContext.jsx` — active tenant identity and branding.
- `client/src/context/SettingsContext.jsx` — shared settings.
- `client/src/context/CartContext.jsx` — booking selections where used.

Then create shared components, layouts and route guards such as `ProtectedRoute.jsx`, `AdminRoute.jsx`, and the role-specific guards/layouts. Preserve provider nesting dependencies: a context that reads another context must be below its provider.

### Phase D — pages and route registration

Build pages in business dependency order:

1. Public shell: home, tours, destinations and tour details.
2. Identity: login, registration, password recovery and profile.
3. Customer flow: booking, checkout, payment status and customer bookings.
4. Staff workspaces: agent, guide, driver and tour manager.
5. Tenant administration: catalogue, customers, bookings, payments, finance, staff and settings.
6. Platform SuperAdmin: platform governance and monitoring.

Register pages in `client/src/routes/AppRoutes.jsx`. Keep `client/src/App.jsx` responsible for the top-level shell and `client/src/main.jsx` responsible for mounting providers and App.

## 5. Exactly how frontend and backend communicate

This is a real booking path in the checked-in source.

### Step 1 — React calls the feature API wrapper

A booking screen gathers the selected tour, date, travelers and contact information. It calls a function in `client/src/api/bookingApi.js`, rather than embedding raw HTTP logic in the page:

```js
export const createBooking = async (data) =>
  (await api.post("/bookings", data)).data;
```

The JavaScript object is serialized by Axios as the JSON request body.

### Step 2 — Axios selects the API base URL

`client/src/api/axios.js` exports the shared Axios client. Local development can use the relative `/api` path; deployed builds use the configured API URL, such as `VITE_API_URL`. Centralizing transport avoids hard-coding different URLs in every page.

### Step 3 — Vite proxies local requests

`client/vite.config.js` proxies `/api` to the development API target (default `http://localhost:5000`) and `/socket.io` to the same target with WebSocket proxying enabled.

Thus a browser request to `http://localhost:5173/api/bookings` is forwarded to Express on port 5000. In production, the deployed browser app calls its configured HTTPS API URL directly; the Vite proxy is only for development.

### Step 4 — Express receives and prepares the request

`server/app.js` composes the HTTP application. It registers request context, security headers, rate limiting, CORS, JSON/form parsing, cookies and logging, then resolves tenant context and mounts API routers under `/api`.

CORS only controls which browser origins may read responses; it is not authentication.

### Step 5 — API route matching

`server/app.js` mounts `server/routes/index.js` at `/api`. The API index mounts `bookingRoutes` under `/bookings`. In `server/routes/bookingRoutes.js`, customer creation is wired as:

```js
router.post("/", customerOnly, validateBookingTravelDate, createCustomerBooking);
```

The full endpoint is:

```text
POST /api + /bookings + /
= POST /api/bookings
```

The route runs the relevant tenant/authentication and validation middleware before the controller.

### Step 6 — backend guards verify identity and access

The middleware chain validates the session/token, role/permission and relevant tenant/plan constraints. The backend derives trusted identity from verified credentials and trusted tenant resolution. Never trust a tenant ID or role simply because the browser included it in a request body.

### Step 7 — controller delegates business work

`server/controllers/customerBookingController.js` receives the Express request/response. It validates required fields, normalizes the payment method, loads tenant settings and checks that the payment method is enabled for the tenant. It delegates reservation work to services.

### Step 8 — services and models persist data

The booking flow uses `server/services/customerBookingReservation.js`, `inventoryService.js` and `bookingCreationService.js`. The creation service uses a MongoDB session/transaction for booking creation and inventory reservation where supported. `server/models/Booking.js` defines the persisted booking shape and tenant ownership; tenant context/plugin protect tenant-scoped database operations.

### Step 9 — JSON returns to React

The controller sends an HTTP status and JSON payload. Axios resolves successful responses and rejects HTTP/network errors. The page can show success, refresh cached data, navigate to the booking, or display a safe error. TanStack Query can cache/invalidate server data where used.

## 6. Payment communication is asynchronous

A payment initiation response is not proof of settlement. For M-Pesa:

1. Browser requests initiation through the API wrapper.
2. Backend verifies booking, tenant, amount, payment method and gateway configuration.
3. Backend calls Daraja using server-side credentials.
4. Daraja may accept the STK request; this means processing was initiated, not that the customer paid.
5. Safaricom calls the backend callback URL.
6. Backend validates the callback, resolves the owning tenant, checks transaction details and processes it idempotently.
7. Payment lifecycle service updates payment/booking state and triggers appropriate accounting effects.
8. Frontend fetches/displays the verified payment state.

Handle duplicate callbacks safely, verify amount and reference, and reconcile uncertain transactions using provider status/query workflows. Card, PayPal, bank and cash flows have their own verification rules, but the backend owns the final payment state.

## 7. Real-time events are a separate channel

The browser resolves Socket.IO origin through `client/src/api/apiUrls.js`; the backend initializes sockets through `server/socket/socketManager.js` from server startup. Use HTTP for normal reads/writes and Socket.IO for supported pushed events such as notifications or operational updates. Socket connections must authenticate and join only rooms authorised for the user and tenant.

## 8. Local build and verification sequence

Use separate terminals and a disposable development database.

**Backend**

```bash
cd server
npm ci
cp .env.example .env
# Configure a local MongoDB URI, strong local JWT secret and local CORS origins.
npm run dev
```

**Frontend**

```bash
cd client
npm ci
cp .env.example .env
# Configure VITE_API_URL if required by the local environment.
npm run dev
```

**Checks**

```bash
cd server
npm test
npm run check:all
```

```bash
cd client
npm run lint
npm run build
npm run test:e2e
```

Run end-to-end checks only against disposable test or approved staging environments. Some integration tests require MongoDB transactions and sandbox provider configuration.

## 9. Completion gates

The system is not complete just because the homepage renders. Verify and retain evidence for each gate:

1. Foundation: clean installs from lockfiles; environment validation rejects unsafe production configuration.
2. Database: models, indexes, migrations and tenant isolation work.
3. Identity: login/logout, recovery, MFA where enabled, token expiry and role/permission checks work.
4. Catalogue: tenant tours, destinations, images, availability and pricing work.
5. Booking: booking, capacity reservation, cancellation and rescheduling preserve ownership/inventory.
6. Payments: sandbox initiation, callbacks, duplicate callback handling, status queries, refunds and reconciliation work.
7. Finance: invoices, ledger, tax and reports reconcile to verified transactions.
8. Operations: staff assignments, vehicles, guides, hospitality and notifications have correct tenant scope.
9. Frontend: mobile/desktop layouts, loading/error/empty states, forms and protected navigation work.
10. Security: cross-tenant tests, rate limits, CORS, secret handling, webhook verification and audit trails pass.
11. Deployment: frontend/backend URLs and secrets are correct; health/readiness, logs, monitoring and backups are active.
12. Recovery: backup restoration and rollback have been rehearsed in a safe environment.

A passing build does not prove production readiness or live payment acceptance. Record deployed commit, test environment, provider evidence and outstanding limitations before go-live.

## 10. Suggested reading path through this repository

Read these in order rather than opening hundreds of files at random:

1. `README.md`
2. `server/package.json` and `client/package.json`
3. `server/config/env.js` and `server/config/database.js`
4. `server/tenancy/context.js`, `tenantPlugin.js` and `middleware/tenantMiddleware.js`
5. `server/models/Organization.js`, `User.js`, `Tour.js`, `Booking.js` and `Payment.js`
6. `server/services/bookingCreationService.js` and `paymentLifecycleService.js`
7. `server/controllers/customerBookingController.js`
8. `server/routes/bookingRoutes.js` and `server/routes/index.js`
9. `server/app.js` and `server/server.js`
10. `client/src/api/axios.js`, `apiUrls.js` and `bookingApi.js`
11. `client/src/context/AuthContext.jsx` and `TenantContext.jsx`
12. `client/src/pages/Checkout.jsx`, `client/src/routes/AppRoutes.jsx`, `client/src/App.jsx` and `client/src/main.jsx`
13. Related tests under `server/tests/` and `client/e2e/`

This sequence follows the dependency chain: infrastructure → tenant/security foundation → data → business rules → API → browser transport → UI → tests → deployment.
