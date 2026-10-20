# Build Global Tours From Scratch — File-by-File Learning Guide

> Purpose: teach a developer how to recreate this multi-tenant tours-and-travel SaaS from an empty repository, in the correct dependency order. This guide explains what to create, why each layer exists, how the layers connect, what must be tested before moving on, and how to verify the finished system safely.
>
> **Scope and safety:** Global Tours is a multi-tenant tours and travel platform. It handles customer identities, bookings, payments, invoices, accounting, refunds, staff permissions, tenant configuration and integrations. Use a disposable local/test database while learning. Never point a tutorial, seed script, migration, or test at a real production database. Do not commit credentials. A successful local build is not proof of live M-Pesa, KRA/eTIMS, email, hosting, backup, or production readiness.

## 1. The right creation order — overview

The order matters because later files depend on contracts and guarantees established by earlier files. For example, a booking must know which tenant owns it; a payment must refer to a valid booking and must not be trusted until a verified provider callback confirms it; an invoice/accounting entry must not be posted before the payment transition is committed.

1. **Define requirements and trust boundaries.** Write down user roles, tenant boundaries, business workflows, payment states, refund rules, tax obligations, and data-retention expectations before writing code.
2. **Create the repository and team conventions.** Add `.gitignore`, `.editorconfig`, a clear README, environment-variable examples with placeholders, and a consistent folder structure.
3. **Create package manifests and scripts.** Define Node versions, dependencies, test/lint/build/check commands, and lockfiles before application code so installs are repeatable.
4. **Create configuration and startup validation.** Parse environment variables, reject unsafe/missing production settings, and keep secrets out of source control.
5. **Create database connection and common infrastructure.** Add MongoDB connection handling, health/readiness checks, logging, error handling, request IDs, and graceful shutdown.
6. **Create shared domain constants and validation.** Define roles, permissions, booking/payment states, money/currency rules, and request schemas before routes use them.
7. **Create tenant identity and authentication.** Establish tenant resolution, password hashing, login, JWT/session handling, authorization, and tenant-scoped database access before adding business data.
8. **Create core data models and indexes.** Start with tenants and users; then destinations/tours, customers, bookings, payments, invoices, and related records. Add ownership fields, validation, uniqueness rules and indexes.
9. **Create domain/service logic.** Implement business rules in testable services rather than embedding all rules in HTTP controllers.
10. **Create API routes and controllers.** Routes map HTTP paths to middleware/controllers; controllers validate inputs and call services; services enforce invariants.
11. **Create financial workflows.** Implement booking totals, payment intent records, provider initiation, verified callbacks, idempotency, reconciliation, refunds, invoice state, and balanced accounting entries. Treat money as decimal-safe minor units, not floating-point arithmetic.
12. **Create integrations behind adapters.** Keep M-Pesa/Daraja, card/bank providers, KRA/eTIMS, email, cloud storage and external APIs behind small interfaces so provider outages do not corrupt core records.
13. **Create frontend application shell and API client.** Configure API/socket URLs, authentication state, tenant context, error/loading states, and accessible navigation before individual modules.
14. **Create frontend modules in dependency order.** Authentication and tenant selection → tours/destinations → customers → bookings → payments/invoices → finance/reports → operations and integrations → platform SuperAdmin.
15. **Create tests at every layer.** Unit tests first; then database/model tests; API and tenant-isolation tests; payment callback/replay tests; frontend tests; build/lint; finally disposable-environment end-to-end tests.
16. **Create demo fixtures and seeds only after schemas stabilize.** Seeds must be explicit, tenant-scoped, repeatable, guarded against production, and safe to rerun. Never use a demo reset as a production migration.
17. **Create deployment and release automation.** CI, environment-specific configuration, migrations, health checks, logs/alerts, backup/restore drills, rollback procedures and release gates.
18. **Run production acceptance last.** Verify the deployed commit SHA, tenant isolation, actual provider callbacks and failures, reconciliation, tax submissions, mobile/desktop workflows, backup restoration, and monitoring using approved test accounts.

Do not start by building a large dashboard. Dashboards depend on correct tenant scoping and trustworthy underlying booking/payment/accounting records.

## 2. Recommended repository layout and what each file is for

The exact filenames in an existing codebase may differ; follow the actual import paths and package scripts when recreating this repository. The paths below describe the responsibility that each file or file group should own. Keep one responsibility per file where practical.

### Repository root

| File or directory | What it does | Why it is needed / creation timing |
|---|---|---|
| `README.md` | Project overview, architecture, safe setup, commands, test evidence and deployment limitations. | Create early and keep updated. It is the first map for developers and operators. |
| `.gitignore` | Excludes `.env`, dependencies, build output, logs, local databases and private keys. | First, before any secret or generated file can accidentally be committed. |
| `.editorconfig` | Standardizes indentation, line endings and whitespace across editors. | Early; reduces noisy diffs and formatting inconsistency. |
| `.nvmrc` or equivalent runtime pin | Documents the Node.js runtime expected by the project. | Before installing dependencies in different environments. |
| Lockfiles (`package-lock.json`, etc.) | Record exact dependency resolution. | Generated and committed after package manifests are defined. |
| `.github/workflows/*.yml` | Runs automated checks on pushes/PRs and creates reviewable artifacts. | After the commands work locally; CI should run the same checks as developers. |
| `docs/` | Architecture, environment setup, release gates, test evidence, operational runbooks and this guide. | Start early; update when behavior or release evidence changes. |
| `scripts/` | Safe repeatable tasks such as checks, audit, documentation generation and controlled seed orchestration. | After the underlying commands exist; scripts should fail closed on unsafe inputs. |
| `client/` | Browser-facing application. | Build after the API contracts and authentication model are defined. |
| `server/` | HTTP API, business logic, database access, integrations and backend tests. | Build after architecture and configuration are defined. |

### Backend package and startup

| File/group | Responsibility | Why it exists |
|---|---|---|
| `server/package.json` | Declares backend dependencies and scripts such as start, test, lint/check and audit. | Makes setup reproducible and gives CI one authoritative command list. |
| `server/package-lock.json` | Pins backend dependency versions. | Prevents different machines from silently installing incompatible dependency trees. |
| `server/.env.example` (placeholders only) | Lists required and optional environment variable names without real secrets. | Lets a new developer configure the service without leaking credentials. |
| `server/src/config/*` or equivalent config modules | Reads and validates environment variables, URLs, keys and mode-specific settings. | Central validation prevents the app from starting with insecure or ambiguous production settings. |
| Server entry point (commonly `server.js` or `src/server.js`) | Creates the HTTP server, binds the deployment-provided port, starts readiness checks and handles graceful shutdown. | Keep process lifecycle separate from route definitions so tests can import the app without opening a port. |
| App composition file (commonly `app.js`) | Registers middleware, routes, error handlers and health endpoints. | Makes the HTTP application testable and keeps startup concerns out of route files. |
| Database connection module | Opens MongoDB connection, exposes connection state, and closes safely. | One place owns connection lifecycle; route handlers should not create independent connections. |
| Health/readiness route | Reports liveness and whether database/index migrations are ready. | Hosting platforms need a reliable signal; a live process is not necessarily ready to serve data. |
| Logger/request-ID middleware | Adds structured logs and correlates requests without logging passwords, tokens, or payment secrets. | Makes failures diagnosable without exposing private data. |
| Central error middleware | Converts expected errors into safe HTTP responses and hides stack traces/secrets in production. | Prevents inconsistent error handling and accidental leakage. |
| Security middleware | Applies CORS allowlists, secure headers, body-size limits, rate limits, CSRF/session protections where applicable, and input normalization. | Security should be consistently applied before requests reach business logic. |

### Backend domain layers

| File/group | Responsibility | Why it exists |
|---|---|---|
| Tenant model and tenant-resolution middleware | Stores tenant identity/configuration and resolves the active tenant from a trusted, validated source. | Tenant isolation is foundational: a tenant ID supplied by a client must never grant access by itself. |
| User model and authentication service | Stores password hashes and user status; authenticates credentials; issues/validates tokens or sessions. | Identity is separate from permission to perform an action. |
| Role/permission definitions and authorization middleware | Expresses which roles may perform each action, then enforces it on the server. | Hiding a button in the frontend is not authorization. |
| Shared enums/constants | Centralizes status names for bookings, payments, invoices, refunds and operational records. | Prevents different routes from inventing incompatible states. |
| Validation schemas | Validates request bodies, query strings, identifiers, amounts, dates and enumerated states. | Rejects malformed input before business rules or database writes run. |
| Domain models (`Tour`, `Destination`, `Customer`, `Booking`, `Payment`, `Invoice`, etc.) | Define persisted record shapes, constraints, relationships and indexes. | Models provide a consistent persistence contract; every tenant-owned record needs an enforceable ownership rule. |
| Repository/data-access modules (if used) | Encapsulate tenant-scoped database queries. | Reduces the risk that one route forgets the tenant filter. |
| Domain services | Implement operations such as creating a booking, reserving capacity, completing a payment, issuing a refund, or posting a journal. | Business invariants belong in reusable services that can be tested without HTTP. |
| Controllers | Translate an HTTP request into a validated service call and format the response. | Keeps transport concerns separate from business rules. |
| Routes | Bind HTTP method/path to middleware and controller. | Makes the public API discoverable and allows route-level authorization to be audited. |
| Scheduled/background jobs | Retry safe transient work, reconcile pending payments, send notifications, or process queued tasks. | Long-running or retryable work should not depend on a browser staying open. Jobs must be idempotent. |

### Financial and integration modules

| File/group | Responsibility | Why it exists |
|---|---|---|
| Payment model/service | Tracks the internal payment record, amount, currency, provider, checkout/request IDs, status and timestamps. | The internal record is the source for application workflows; a redirect or STK initiation is not proof of payment. |
| Provider adapter (e.g. Daraja/M-Pesa) | Initiates provider requests and normalizes provider responses. | Isolates provider-specific formats and supports sandbox/live configuration. |
| Callback/webhook controller | Authenticates/verifies provider notifications, validates references and records the result. | Public callbacks are untrusted input until verified. |
| Idempotency/replay guard | Stores unique provider event/receipt identifiers and prevents duplicate processing. | Providers may retry callbacks; the same event must not double-credit an account or post duplicate journals. |
| Reconciliation job/report | Compares internal records with provider records and flags mismatches. | Webhooks can be delayed, lost or delivered out of order. |
| Invoice service | Creates/updates invoice records based on approved business events. | An invoice must remain consistent with booking and payment rules. |
| Accounting/journal service | Posts balanced debit/credit entries and links them to source records. | Reports should derive from traceable entries, not hand-edited totals. |
| Refund service | Enforces refund permissions, available refundable balance, provider result tracking and accounting reversals. | Refunds are separate financial events; never erase the original payment history. |
| Tax/eTIMS adapter | Maps eligible transactions to the tax provider, records request/response references and tracks submission status. | Tax submission must be auditable and must not be reported as successful until the provider confirms it. |
| Email/notification adapter | Sends password recovery, booking updates and alerts through configured providers. | Business logic should still be testable when email is unavailable. |
| File/media adapter | Handles image uploads and deletion through configured storage. | Store references and validate ownership; never assume a client-supplied file URL is safe. |
| Integration secrets/configuration service | Loads or decrypts provider credentials using dedicated keys and restricted access. | Payment and tax credentials need separation from general application configuration. |

### Frontend

| File/group | Responsibility | Why it exists |
|---|---|---|
| `client/package.json` and lockfile | Declare frontend dependencies and lint/build scripts. | Makes browser builds repeatable. |
| `client/index.html` | Browser document entry point and metadata. | The frontend bundler needs a stable HTML shell. |
| `client/src/main.*` | Mounts the UI framework into the browser document. | This is the frontend runtime entry point. |
| `client/src/App.*` or route configuration | Defines the top-level application and page routing. | Keeps page navigation centralized. |
| `client/src/api/*` | Configures the API base URL, common headers, token handling, timeout behavior and response errors. | Avoids duplicating network logic in every screen. |
| Authentication context/store | Holds the current user/session and handles login/logout/expiry. | Pages need one consistent identity state; server authorization remains authoritative. |
| Tenant context/resolver | Selects and displays the tenant context and clears stale context on tenant changes/logout. | Prevents a prior tenant selection leaking into a new session. |
| Shared UI components | Reusable form controls, dialogs, tables, loading states and error notices. | Improves consistency and accessibility. |
| Feature pages/modules | Separate screens for tours, destinations, customers, bookings, finance, operations, integrations and platform administration. | Each module can evolve and be tested independently. |
| Permission-aware navigation | Hides unavailable actions and links based on user role. | Improves usability; it complements, but never replaces, backend authorization. |
| Frontend environment example | Documents public build-time variables such as API/socket origins. | The browser needs correct deployment URLs; never put server secrets in frontend variables. |
| Offline/service-worker/cache files, if implemented | Cache only safe static assets and deliberately selected non-sensitive read data; queue eligible writes for later sync. | Offline behavior must be designed explicitly. Do not cache secrets or treat offline payment requests as completed. |

### Tests and automation

| File/group | Responsibility | Why it exists |
|---|---|---|
| Unit tests beside services | Test calculations and state transitions with controlled fixtures. | Fast feedback for core rules. |
| Model/database tests | Test schema constraints, indexes, ownership and persistence behavior. | Catches failures that mocks can hide. |
| API integration tests | Exercise authentication, validation, HTTP status codes and response contracts. | Verifies that middleware, routes and services work together. |
| Tenant-isolation tests | Create two tenants and prove users cannot read/write each other's data by changing IDs, tokens or request context. | Cross-tenant access is a critical security failure, not a cosmetic bug. |
| Payment callback tests | Cover success, failure, timeout, duplicate callbacks, invalid signatures, mismatched amounts/references, and out-of-order events. | Financial state must be correct under retries and hostile input. |
| Accounting/refund tests | Verify balanced journals, no duplicate posting, partial/full refund bounds and rollback behavior. | Protects financial integrity. |
| Seed validation/audit scripts | Check fixture tenant ownership, references, duplicate content and financial consistency without silently rewriting data. | Demo data must not conceal broken production invariants. |
| Client lint/build tests | Detect syntax, type, dependency and production-bundle errors. | A page that works in development may fail in the deployed bundle. |
| End-to-end acceptance tests | Exercise real workflows against a disposable environment. | Confirms multiple layers cooperate; do not run destructive acceptance tests against production. |
| CI workflows | Run required checks for changes and retain artifacts/evidence. | Prevents known regressions from being merged without review. |

## 3. Database design: create collections in dependency order

1. **Tenant** — the organization/account boundary. Define a stable identifier/slug and active/suspended status.
2. **User** — link each tenant user to a tenant; define global platform-admin handling separately and deliberately.
3. **Role/permission assignments** — establish authorization rules before exposing write APIs.
4. **Destination** — tenant-owned places used by tour records.
5. **Tour** — tenant-owned offering; validate references and publish/availability status.
6. **Customer** — tenant-owned customer identity/contact information with privacy controls.
7. **Booking** — tenant, customer, selected tour(s), dates, quantity/capacity, price snapshot, currency and lifecycle status.
8. **Payment** — tenant, booking/source reference, amount, currency, provider identifiers, status, idempotency keys and audit timestamps.
9. **Invoice and invoice lines** — immutable or versioned financial snapshots linked to booking/customer/payment as applicable.
10. **Journal entries and lines** — traceable balanced accounting postings with source-event identifiers.
11. **Refunds** — separate refund request/provider state and reversal links; preserve original payment records.
12. **Operational records** — suppliers, purchase orders, tour costs, vehicles, staff assignments, accommodation and transfers as required by business workflows.
13. **Integration/audit/outbox records** — provider event receipts, webhook idempotency, delivery attempts, audit events and retryable outbound events.

For every tenant-owned collection, decide how ownership is enforced and indexed before adding routes. Add compound indexes that begin with the tenant key for common tenant-scoped queries; add unique compound indexes for tenant-scoped uniqueness. Validate indexes against real query patterns and data volume rather than adding indexes blindly.

Do not use a destructive schema reset to evolve a database. Introduce backward-compatible migrations, take verified backups before high-risk changes, test restore, and use staged rollout/rollback plans.

## 4. Critical workflow: booking to confirmed payment

1. The customer selects a published tour and dates.
2. The API authenticates the user where required and resolves the tenant from trusted context.
3. Validation checks tour ownership, dates, quantity, availability and price rules.
4. A booking service reserves capacity atomically or with a concurrency-safe strategy, then creates a booking with a clear pending/awaiting-payment state.
5. The payment service creates a pending internal payment record and a unique request/idempotency reference.
6. The provider adapter sends the payment request. The response that says a prompt was initiated changes the record to an initiation/pending state only; it does **not** mean money was received.
7. A verified callback or trusted reconciliation response is validated against provider request ID, amount, currency, account/booking reference and expected state.
8. An idempotency guard records the provider event/receipt so retries cannot post the same payment twice.
9. A transaction or carefully designed recoverable workflow changes payment status, updates booking payment state, creates/updates invoice records and posts accounting entries exactly once.
10. If any step fails, record enough state to retry or reconcile safely; do not mark payment successful just because the browser returned to a success page.
11. Failed, cancelled, expired or timed-out attempts remain visible as such. Release capacity only according to an explicit, concurrency-safe booking policy.
12. Reconciliation checks provider records against internal payment, booking, invoice and journal records and reports unresolved differences.

Suggested payment lifecycle: `CREATED → INITIATED/PENDING → SUCCESS` or `FAILED/CANCELLED/EXPIRED`. Actual enum names must match the implementation and provider semantics. Do not allow arbitrary client requests to set `SUCCESS`. Use a documented transition table and reject impossible transitions.

## 5. Tenant isolation: non-negotiable design rule

- Resolve the tenant from a validated hostname, membership/session, or other server-controlled mapping.
- Never trust a request body/query `tenantId` as proof of access.
- Every read, update and delete of tenant-owned data must be scoped to the authorized tenant.
- Validate ownership of related records too: a booking must not reference another tenant's customer or tour.
- Global platform administration should use explicit, separately tested authorization paths.
- Cache keys, sessions, sockets, uploads, exports, background jobs and logs must preserve tenant boundaries.
- Tests must try cross-tenant access using altered IDs, another tenant's token, direct API calls, stale browser context and socket subscriptions.
- A test that only verifies the UI hides another tenant is insufficient; test the server and database boundary.

## 6. Offline behavior: what it can and cannot mean

Offline support should improve access to the app shell and carefully chosen previously fetched data; it must not pretend that a server-side action or financial transaction succeeded without confirmation.

- Cache static assets using versioned cache names and a deliberate eviction strategy.
- Store offline-eligible drafts in a local queue with unique operation IDs, creation time and retry metadata.
- On reconnect, submit queued work through authenticated, idempotent APIs and reconcile the server response into the UI.
- Show explicit states such as **Saved on this device**, **Waiting to sync**, **Sync failed**, and **Confirmed by server**.
- Avoid caching passwords, tokens, provider secrets, sensitive personal information, or financial pages by default.
- M-Pesa/STK Push, provider callback verification, refunds, invoice posting and accounting confirmation require a server/provider connection. A local queue may remember the user's intent to retry a request, but must not report money received or create a second charge on replay.
- Test airplane mode, offline startup, cache upgrades, storage eviction, logout, tenant switching, reconnect, duplicate sync attempts and server rejection.

## 7. Environment setup and secrets

Use a local environment file ignored by Git and a checked-in example containing placeholder values only. Configure separate values for local development, CI, staging and production.

Typical backend configuration categories include:
- runtime mode and listening port;
- MongoDB connection string with an explicit database name;
- strong JWT/session signing secret;
- dedicated encryption keys for stored provider credentials and a separate webhook/signature secret where required;
- allowed frontend origins and public platform host;
- payment provider environment (sandbox vs live), consumer credentials, shortcode/till/paybill details and callback URLs;
- tax/eTIMS configuration and encryption key when enabled;
- email and file-storage credentials if those features are enabled;
- log level, timeouts and health/readiness settings.

Typical frontend configuration includes the public API origin ending in `/api`, and an explicit socket origin if used. Frontend build variables are public to users; never place server-only secrets in them.

Startup should fail closed when a required production secret is missing, too weak, or configured for the wrong database/environment. Optional integrations should report a clear disabled/unavailable state rather than falsely claiming success.

## 8. How to work through the repository

Run commands from the directory that owns the relevant package manifest; do not run a client command from the repository root unless a root script explicitly delegates to it.

1. Read `README.md`, the package scripts, environment examples, deployment config, and the current test-evidence/release-readiness documents.
2. Draw the request path: browser → API client → route → auth/tenant middleware → controller → service → model/database → provider adapter → callback/reconciliation → updated UI.
3. Search for each domain model and follow its imports to the service, controller, route and tests. Do not infer behavior from filenames alone.
4. For every business action, identify: input validation, authorization, tenant filter, state transition, database writes, external calls, retry behavior, audit trail, and tests.
5. Before editing, record the current branch/SHA and working-tree state. Make small coherent changes and inspect the diff.
6. Run focused tests for changed behavior, then the full backend checks, client lint/build, security checks, seed checks and release gates documented in package scripts/CI.
7. Keep test claims exact: distinguish passed, failed, skipped, blocked and not run. A skipped integration test is not a pass.
8. Commit related changes with a descriptive message and verify CI on the exact commit.
9. Before deployment, check required environment variables and migration/rollback plans. After deployment, verify the deployed SHA and actual health/readiness.
10. Never use production credentials or live customer data in a tutorial, local fixture, or automated destructive test.

## 9. Acceptance checklist before calling the system ready

### Core functionality
- [ ] Authentication, logout, password recovery and role permissions work.
- [ ] Each tenant can manage its own tours, destinations, customers, bookings and operational records.
- [ ] Invalid inputs and invalid state transitions are rejected safely.
- [ ] Frontend loading, empty, offline, error and success states are clear.

### Security and isolation
- [ ] Cross-tenant reads/writes are denied in automated API tests.
- [ ] Passwords are hashed; secrets are never returned or logged.
- [ ] CORS, rate limits, request validation, file upload restrictions and session/token expiry are tested.
- [ ] Provider callbacks cannot be forged or replayed to duplicate financial effects.

### Money and reconciliation
- [ ] Provider initiation is distinct from payment success.
- [ ] Success/failure/cancel/timeout and duplicate/out-of-order callbacks are covered.
- [ ] Payment, booking, invoice and accounting changes are atomic or recoverably coordinated.
- [ ] Journal entries balance; refunds preserve history and respect refundable amounts.
- [ ] Reconciliation identifies missing, duplicate and mismatched records.

### Operations and deployment
- [ ] Automated tests, lint and production builds pass on the exact commit.
- [ ] Readiness remains degraded until the database and required indexes are ready.
- [ ] Backups are configured and a restore has been tested.
- [ ] Monitoring, alerts, logs, incident procedures and rollback are documented.
- [ ] Live M-Pesa, eTIMS and other external provider checks have actual provider evidence.
- [ ] Current production deployment SHA and full desktop/mobile acceptance are verified.

## 10. What this guide does not claim

This guide is an implementation blueprint, not proof that every file has been recreated, every line commented, or every external integration certified. The repository's source, actual package scripts, current CI results and provider evidence remain authoritative. Before declaring completion, update the test evidence register with real command outputs and mark external gates **PENDING/NOT VERIFIED** until they have been performed.

## 11. Further repository documents

Use the current repository's documentation for exact commands and environment-specific requirements:
- `docs/PRODUCTION_READINESS.md` — production readiness gates and environment matrix.
- `docs/TEST_EVIDENCE.md` — dated test results, skipped cases and outstanding verification.
- `docs/DEMO_SEEDING.md` — controlled demo-data seeding safeguards.
- `docs/FIRST_TENANT_ACCEPTANCE.md` — first-tenant acceptance and external verification requirements.
- `scripts/update-documentation.js` — repository-state documentation generator.
- `.github/workflows/documentation.yml` — generated documentation snapshot workflow.

When recreating the actual repository, verify each linked path exists on the current branch before relying on it. Keep this guide aligned with real source files and commands as the system evolves.
