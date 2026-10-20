# Global Tours: Build the System from Scratch

This guide explains the architecture, the recommended order for creating files, the role of each layer, and the tests required before release. It is a build manual, not a claim that all external production providers have been certified.

## 1. Architecture

The system has a React/Vite browser client, a Node.js/Express API, MongoDB/Mongoose persistence, and external providers such as Safaricom Daraja (M-Pesa). Vercel can host the client, a Node service such as Render can host the API, and GitHub Actions runs CI.

Normal request flow:

Browser page -> client API module -> shared Axios client -> Express route -> authentication -> tenant resolution -> permission/ownership validation -> controller -> domain service -> Mongoose model -> MongoDB -> response back to the client.

The browser is never authoritative for payment success, price, tenant identity, permissions, or accounting balances.

## 2. Recommended file creation order

### Phase A — Repository and configuration (create first)

1. README.md — purpose, architecture, roles, local setup, scripts and known limitations.
2. .gitignore — exclude node_modules, build output, local environment files, logs and credentials.
3. server/.env.example and client/.env.example — variable names only; never real secrets.
4. server/package.json — backend dependencies and run/check/test commands.
5. client/package.json — React/Vite dependencies and lint/build/browser-test commands.
6. client/index.html — browser document and root element loaded by Vite.
7. client/vite.config.js — frontend plugins, dev proxy and production build. The PWA/offline app-shell configuration is now in this file.
8. vercel.json, hosting configuration and GitHub Actions workflows — add after the application can run locally.

Test gate: run npm ci in both package directories; verify no secrets are tracked; run server syntax/security checks and client lint/build.

### Phase B — Server startup and shared infrastructure

Create these before business endpoints:

1. server/server.js — process entry point, environment validation, HTTP server, startup and graceful shutdown.
2. Database connection/configuration modules — connect to the intended MongoDB database and fail safely when production configuration is invalid.
3. server/tenancy/context.js and tenant-resolution middleware — establish trusted tenant context from host/session/token context. A client-supplied tenant ID is not proof of access.
4. server/middleware/authMiddleware.js — authenticate the current user.
5. server/middleware/tenantMiddleware.js — require valid tenant context for tenant-scoped requests.
6. Role/permission middleware and validation helpers — reject unauthorized roles and malformed inputs.
7. Error handling, request logging, rate limits, CORS, security headers, and health/readiness routes.
8. Shared constants, money/date helpers and audit logging.

Test gate: syntax checks; test-only startup; health/readiness; invalid/expired token rejection; missing tenant rejection; CORS and rate-limit tests. Never point tests at production data.

### Phase C — Data models and indexes

Create models after tenant conventions are defined:

- server/models/Organization.js — tenant/company identity and settings.
- server/models/User.js — user identity, credentials and role references.
- Tour and destination models — catalogue and inventory.
- server/models/Booking.js — booking, travellers, travel date, total, paid amount and balance.
- server/models/Payment.js — payment attempt, provider IDs, amount, currency, state, receipt, failure reason and callback/query metadata.
- server/models/Invoice.js and InvoiceSequence.js — invoices and safe invoice numbering.
- Accounting, supplier, expense, tax, hotel, airport-transfer, subscription and operations models as those modules are built.

Every tenant-owned record needs consistent tenant ownership. Use tenant-scoped reads and writes, and unique indexes for provider checkout IDs/idempotency keys with tenant-aware semantics. Before adding indexes, check existing duplicates and understand write costs.

Test gate: model validation, tenant-index contract, duplicate-index preflight, and tests proving tenant A cannot read or mutate tenant B. Never run demo seeds or repair scripts against an unknown database.

### Phase D — Domain services (before controllers)

Build business rules in reusable services:

1. Tour/booking lifecycle — capacity, dates, booking status and cancellation.
2. server/services/mpesaService.js — Daraja OAuth and STK Push initiation.
3. server/services/mpesaQueryService.js — query an STK request whose result is uncertain.
4. server/services/paymentLifecycleService.js — apply confirmed success/failure exactly once and synchronize booking, invoice and accounting state.
5. Refund services — keep refund lifecycle separate from the original charge.
6. Accounting, invoice, tax/eTIMS, notifications, jobs and webhook delivery services.
7. Tenant subscription and feature-limit services.

A successful STK initiation means only that a prompt was requested. It is not proof that money was received. A payment becomes completed only after a valid provider callback or equally authoritative verification supplies the expected result code, amount, receipt and matching checkout reference.

Payment state machine: pending/processing -> completed, failed or cancelled. A timeout means the result is unknown, not failed. Query the provider before retrying so an existing charge is not duplicated.

### Phase E — Routes and controllers

Create routes only after the models/services exist:

1. Authentication routes/controllers.
2. Tenant and user management.
3. Public catalogue, destinations and booking endpoints.
4. Authenticated customer booking endpoints.
5. Admin/staff tour and booking operations.
6. server/routes/mpesaRoutes.js — STK initiation, callback, status/query, verification and refund result.
7. Finance, invoices, reporting, subscriptions, hotels, airport transfers and integrations.
8. Mount routers in server.js with middleware in the correct order.

Controllers should validate and authorize, call a domain service, and shape the response. Do not duplicate payment or accounting rules across handlers.

Test gate: API tests for valid/invalid payloads, role permissions, ownership, cross-tenant access, rollback and expected HTTP statuses. Callback routes need verification protection and replay tests.

### Phase F — Client foundation

Create client files in this order:

1. client/src/main.jsx — mount React and configure providers.
2. client/src/index.css and shared styles — global styling and design tokens.
3. client/src/api/axios.js — shared API client, authentication handling and consistent errors.
4. client/src/api/apiUrls.js — API and Socket.IO URL configuration.
5. API modules such as bookingApi.js, tourApi.js and mpesaApi.js — keep HTTP details outside pages.
6. AuthContext, TenantContext, SettingsContext and CartContext — shared session/application state.
7. Shared layouts, route guards, navigation and role-specific layouts.
8. Public catalogue, authentication and booking pages.
9. Customer pages, checkout, booking details, then staff/admin/finance pages.
10. Forms, loading/error/empty states, responsive layouts and accessibility labels.

client/src/pages/Checkout.jsx loads/creates a booking, validates the amount/phone/date, requests STK Push and polls the server status endpoint. It must not infer payment success just because the initiation endpoint returned HTTP 200.

Test gate: lint/build, API-module tests where available, route smoke tests, and browser tests for each role on mobile and desktop.

### Phase G — Offline/PWA

client/vite.config.js now configures vite-plugin-pwa to generate a service worker and manifest and precache the production app shell/static assets. This supports reopening the already-loaded interface when connectivity is lost.

Important limits:
- Static assets can load offline, but server-backed authentication, authoritative bookings, synchronization, M-Pesa initiation and payment confirmation need a reachable server/network.
- Never queue payment initiation, refunds, cancellations or financial writes as if they succeeded offline.
- Do not cache private tenant API responses in a generic shared service-worker cache; that risks stale balances and cross-account data leakage.
- A future true offline-first module needs tenant/user-scoped IndexedDB, device-threat review, explicit pending-sync UI, conflict resolution, logout/account-switch purge and server-side idempotency. Start with safe read-only operational data and non-financial drafts; keep payments online-only.

Test service-worker installation, cold launch in airplane mode after one successful visit, version updates, cache cleanup, and API-unavailable behavior. Offline payment controls must clearly say no payment was sent.

### Phase H — M-Pesa end-to-end lifecycle

Use the Daraja sandbox and an isolated staging database:

1. User submits a booking/payment amount and Safaricom number.
2. API validates tenant, ownership, outstanding balance, phone, amount and payment configuration.
3. Server creates a pending payment and calls Daraja STK Push.
4. Server stores the returned merchant/checkout request IDs and returns “prompt requested,” not “paid.”
5. Safaricom sends a callback. Handler resolves the payment by checkout ID, resolves tenant context, verifies the result as designed, and validates amount/receipt.
6. Payment lifecycle service updates payment and related booking/invoice/ledger state atomically or idempotently.
7. Client polls the authenticated status endpoint and reads its canonical paymentStatus field. Completed, failed and cancelled outcomes stop polling.
8. If callback delivery is delayed, show “awaiting confirmation”; reconcile uncertainty rather than marking it paid or immediately launching another charge.
9. Deliver the same callback repeatedly and assert one ledger posting and one balance update.
10. Test wrong checkout ID, wrong amount, missing receipt, non-zero result code, provider timeout, malformed callback, cross-tenant ID and simultaneous duplicate callbacks.

The checkout UI had a response-field mismatch: the API returns paymentStatus, but the page previously checked only status. Checkout now reads paymentStatus first and distinguishes timeout/unknown from confirmed failure. The server remains authoritative.

Code tests do not prove live Safaricom callback delivery or production credentials work. Record sandbox evidence and deployed commit SHA separately. Never use real production transactions as test fixtures.

### Phase I — Tests in increasing scope

From the server directory, run:

    npm ci
    npm run check
    npm run check:controllers
    npm run check:models
    npm run check:services
    npm run check:seeds
    npm run check:security
    npm run check:tenant-models
    npm run check:production
    npm test
    npm run test:security
    npm run test:tour-domain

From the client directory, run:

    npm ci
    npm run lint
    npm run build
    npm run test:e2e

Browser tests require the repository's Playwright configuration and a running test environment. Inspect configuration before assuming all flows are covered.

Then run: (1) model/unit tests with isolated data; (2) controller/API integration tests against a disposable database; (3) tenant-isolation and permission tests; (4) mocked Daraja lifecycle tests; (5) sandbox STK/callback/replay/failure tests; (6) client lint/build/browser tests; (7) offline/PWA tests; (8) staging smoke tests and deployed-SHA verification; (9) read-only production integrity audit; (10) backup restore drill and monitoring/alert verification.

Record command, timestamp, commit SHA, environment, pass/fail/skip totals and evidence for every run. Skipped is not passed. A build is not end-to-end testing. Sandbox success is not production certification.

## 3. Safe local development

1. Use a dedicated test database and a .env file excluded by Git.
2. Use strong test-only JWT, payment encryption and webhook secrets.
3. Start the API from server/ using the documented development script.
4. Start the client from client/ with npm run dev and configure its API target.
5. Verify health/readiness identifies the test database.
6. Use demo seed accounts only in an explicitly authorized demo database. Follow docs/DEMO_SEEDING.md. Never run reset/seed scripts on production husseindb.
7. Use Daraja sandbox credentials and a sandbox-reachable callback URL; redact secrets and personal data from logs.
8. Run automated tests and then browser acceptance against staging.

## 4. Production checklist

Server environment: MONGODB_URI explicitly names the intended database; JWT_SECRET; PAYMENT_CREDENTIAL_ENCRYPTION_KEY; WEBHOOK_SECRET_KEY; HTTPS client origins; correct platform host; Daraja credentials/callback URL; optional provider credentials only when enabled.

Client environment: production VITE_API_URL ends in /api; set VITE_SOCKET_URL if required.

Database: indexes verified, backups enabled, restore drill complete, monitoring enabled, tenant-isolation audit passed.

Payments: provider credentials, callback reachability, idempotency/replay proof, reconciliation and alerting verified.

Release: CI green, deployed SHA recorded, health/readiness green, browser acceptance complete and rollback plan ready.

Privacy/security: no secrets in Git/logs, least-privilege provider credentials, retention and incident procedures documented.

## 5. Line-by-line code comments

Useful comments explain why a decision exists and what a non-obvious block does, rather than repeating syntax. For tutoring, add short comments before imports/groups, helpers, state blocks, validation, side effects and lifecycle transitions. JSON cannot contain comments; document its fields in adjacent Markdown.

The Vite configuration and checkout page changed for this task now contain explanatory comments. The repository contains hundreds of source/config/test files. Complete line-by-line annotation of every file is a large, separate effort and must be done in small verified batches so generated files, lockfiles, JSON, migrations and secrets are not corrupted. This guide is the master learning map and must be updated as annotation batches are completed.

## 6. Acceptance checklist

- [ ] Client production build succeeds with PWA generation.
- [ ] First online visit caches the app shell; later cold launch works offline.
- [ ] Offline UI never claims server writes/payments succeeded.
- [ ] M-Pesa status polling reads paymentStatus and displays completed/failed/cancelled results.
- [ ] STK initiation is never treated as payment confirmation.
- [ ] Callback validation, duplicate handling, amount/receipt matching and tenant isolation pass integration tests.
- [ ] Full server suite, client lint/build and browser tests have recorded outcomes.
- [ ] Staging/provider evidence is distinct from local test results.
- [ ] Every source file has been annotated and reviewed in tracked batches before claiming the line-by-line commenting task complete.
