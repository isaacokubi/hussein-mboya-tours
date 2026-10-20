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


---

# 12. Complete repository file inventory (generated from the documented branch)

This inventory was assembled from the Git tree at commit `c767548fa35ad9943222b0b00150ff54c71978d8` on branch `chore/explain-every-file`. It records **1099 tracked files** at that snapshot. The list is intended to prevent files being silently omitted. The role descriptions are a first-pass guide based on path, extension and filename; for source modules, confirm exact behavior by reading the implementation and its callers. A filename alone is not proof of behavior.

**Commenting rule:** add meaningful comments to handwritten source where the purpose, decision, security boundary, data transformation, state transition or side effect is not obvious. Explain each logical line/statement where requested, but do not add misleading repetitive comments. Do not insert comments into JSON, package lockfiles, minified/generated bundles or binary assets when the format does not support comments; document those in this inventory instead. Preserve executable behavior while adding comments.

## Directory-by-directory file list


### `.github/` (1 files)

- `.github/dependabot.yml` — Dependency-update automation settings. (snapshot size: 271 bytes)

### `.github/workflows/` (8 files)

- `.github/workflows/ci.yml` — GitHub Actions workflow: defines automated CI, deployment, monitoring, backup, restore, or maintenance steps; inspect its `on`, permissions, jobs, steps, secrets and failure conditions. (snapshot size: 4,207 bytes)
- `.github/workflows/documentation.yml` — GitHub Actions workflow: defines automated CI, deployment, monitoring, backup, restore, or maintenance steps; inspect its `on`, permissions, jobs, steps, secrets and failure conditions. (snapshot size: 886 bytes)
- `.github/workflows/production-backup.yml` — GitHub Actions workflow: defines automated CI, deployment, monitoring, backup, restore, or maintenance steps; inspect its `on`, permissions, jobs, steps, secrets and failure conditions. (snapshot size: 4,173 bytes)
- `.github/workflows/production-monitoring.yml` — GitHub Actions workflow: defines automated CI, deployment, monitoring, backup, restore, or maintenance steps; inspect its `on`, permissions, jobs, steps, secrets and failure conditions. (snapshot size: 4,330 bytes)
- `.github/workflows/production-restore-drill.yml` — GitHub Actions workflow: defines automated CI, deployment, monitoring, backup, restore, or maintenance steps; inspect its `on`, permissions, jobs, steps, secrets and failure conditions. (snapshot size: 5,967 bytes)
- `.github/workflows/production-smoke.yml` — GitHub Actions workflow: defines automated CI, deployment, monitoring, backup, restore, or maintenance steps; inspect its `on`, permissions, jobs, steps, secrets and failure conditions. (snapshot size: 1,874 bytes)
- `.github/workflows/release-gate.yml` — GitHub Actions workflow: defines automated CI, deployment, monitoring, backup, restore, or maintenance steps; inspect its `on`, permissions, jobs, steps, secrets and failure conditions. (snapshot size: 4,576 bytes)
- `.github/workflows/tenant-itinerary-repair.yml` — GitHub Actions workflow: defines automated CI, deployment, monitoring, backup, restore, or maintenance steps; inspect its `on`, permissions, jobs, steps, secrets and failure conditions. (snapshot size: 1,426 bytes)

### `(repository root)/` (7 files)

- `.gitignore` — Repository support file; inspect its format and references before changing it. This inventory records it so it is not silently overlooked. (snapshot size: 1,267 bytes)
- `.npmrc` — Repository support file; inspect its format and references before changing it. This inventory records it so it is not silently overlooked. (snapshot size: 22 bytes)
- `DEMO_CREDENTIALS.md` — Documentation: explains setup, operation, architecture, safety or usage; keep commands and claims aligned with the actual implementation. (snapshot size: 1,384 bytes)
- `README.md` — Documentation: explains setup, operation, architecture, safety or usage; keep commands and claims aligned with the actual implementation. (snapshot size: 17,926 bytes)
- `SECURITY.md` — Documentation: explains setup, operation, architecture, safety or usage; keep commands and claims aligned with the actual implementation. (snapshot size: 529 bytes)
- `render.yaml` — YAML configuration/workflow: indentation is structural; explain each key, trigger, job, step and setting in context. (snapshot size: 2,353 bytes)
- `vercel.json` — JSON configuration/data file: syntax must remain valid; describe each key and avoid comments because standard JSON does not support comments. (snapshot size: 954 bytes)

### `client/` (9 files)

- `client/.env.example` — Environment-variable example/configuration; documents names and safe defaults. Real secrets belong in deployment secret storage, never committed. (snapshot size: 819 bytes)
- `client/.gitignore` — Repository support file; inspect its format and references before changing it. This inventory records it so it is not silently overlooked. (snapshot size: 347 bytes)
- `client/README.md` — Documentation: explains setup, operation, architecture, safety or usage; keep commands and claims aligned with the actual implementation. (snapshot size: 1,027 bytes)
- `client/eslint.config.js` — Configuration module: centralizes runtime settings and integration setup; confirm defaults, validation and secret handling. (snapshot size: 1,350 bytes)
- `client/index.html` — HTML document/template: establishes document metadata and the frontend mount point or page structure. (snapshot size: 366 bytes)
- `client/package-lock.json` — JavaScript package manifest/lockfile: declares scripts and dependencies or pins their resolved versions; lockfiles are generated by npm. (snapshot size: 380,823 bytes)
- `client/package.json` — JavaScript package manifest/lockfile: declares scripts and dependencies or pins their resolved versions; lockfiles are generated by npm. (snapshot size: 1,527 bytes)
- `client/playwright.config.js` — Configuration module: centralizes runtime settings and integration setup; confirm defaults, validation and secret handling. (snapshot size: 662 bytes)
- `client/vite.config.js` — Configuration module: centralizes runtime settings and integration setup; confirm defaults, validation and secret handling. (snapshot size: 1,161 bytes)

### `client/e2e/` (2 files)

- `client/e2e/production-smoke.spec.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 9,047 bytes)
- `client/e2e/seeded-users-audit.spec.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 29,574 bytes)

### `client/public/` (5 files)

- `client/public/hero1.jpeg` — Static browser asset (image, icon, font or vector); referenced by frontend code or served as-is. (snapshot size: 201,122 bytes)
- `client/public/hero2.jpeg` — Static browser asset (image, icon, font or vector); referenced by frontend code or served as-is. (snapshot size: 61,510 bytes)
- `client/public/hero4.jpeg` — Static browser asset (image, icon, font or vector); referenced by frontend code or served as-is. (snapshot size: 361,212 bytes)
- `client/public/icons.svg` — Static browser asset (image, icon, font or vector); referenced by frontend code or served as-is. (snapshot size: 5,031 bytes)
- `client/public/robots.txt` — Documentation: explains setup, operation, architecture, safety or usage; keep commands and claims aligned with the actual implementation. (snapshot size: 74 bytes)

### `client/public/demo-destinations/` (18 files)

- `client/public/demo-destinations/kenya-landscape-01.svg` — Static browser asset (image, icon, font or vector); referenced by frontend code or served as-is. (snapshot size: 1,692 bytes)
- `client/public/demo-destinations/kenya-landscape-02.svg` — Static browser asset (image, icon, font or vector); referenced by frontend code or served as-is. (snapshot size: 1,613 bytes)
- `client/public/demo-destinations/kenya-landscape-03.svg` — Static browser asset (image, icon, font or vector); referenced by frontend code or served as-is. (snapshot size: 1,613 bytes)
- `client/public/demo-destinations/kenya-landscape-04.svg` — Static browser asset (image, icon, font or vector); referenced by frontend code or served as-is. (snapshot size: 1,692 bytes)
- `client/public/demo-destinations/kenya-landscape-05.svg` — Static browser asset (image, icon, font or vector); referenced by frontend code or served as-is. (snapshot size: 1,615 bytes)
- `client/public/demo-destinations/kenya-landscape-06.svg` — Static browser asset (image, icon, font or vector); referenced by frontend code or served as-is. (snapshot size: 1,694 bytes)
- `client/public/demo-destinations/kenya-landscape-07.svg` — Static browser asset (image, icon, font or vector); referenced by frontend code or served as-is. (snapshot size: 1,692 bytes)
- `client/public/demo-destinations/kenya-landscape-08.svg` — Static browser asset (image, icon, font or vector); referenced by frontend code or served as-is. (snapshot size: 1,613 bytes)
- `client/public/demo-destinations/kenya-landscape-09.svg` — Static browser asset (image, icon, font or vector); referenced by frontend code or served as-is. (snapshot size: 1,613 bytes)
- `client/public/demo-destinations/kenya-landscape-10.svg` — Static browser asset (image, icon, font or vector); referenced by frontend code or served as-is. (snapshot size: 1,692 bytes)
- `client/public/demo-destinations/kenya-landscape-11.svg` — Static browser asset (image, icon, font or vector); referenced by frontend code or served as-is. (snapshot size: 1,615 bytes)
- `client/public/demo-destinations/kenya-landscape-12.svg` — Static browser asset (image, icon, font or vector); referenced by frontend code or served as-is. (snapshot size: 1,694 bytes)
- `client/public/demo-destinations/kenya-landscape-13.svg` — Static browser asset (image, icon, font or vector); referenced by frontend code or served as-is. (snapshot size: 1,692 bytes)
- `client/public/demo-destinations/kenya-landscape-14.svg` — Static browser asset (image, icon, font or vector); referenced by frontend code or served as-is. (snapshot size: 1,613 bytes)
- `client/public/demo-destinations/kenya-landscape-15.svg` — Static browser asset (image, icon, font or vector); referenced by frontend code or served as-is. (snapshot size: 1,613 bytes)
- `client/public/demo-destinations/kenya-landscape-16.svg` — Static browser asset (image, icon, font or vector); referenced by frontend code or served as-is. (snapshot size: 1,692 bytes)
- `client/public/demo-destinations/kenya-landscape-17.svg` — Static browser asset (image, icon, font or vector); referenced by frontend code or served as-is. (snapshot size: 1,615 bytes)
- `client/public/demo-destinations/kenya-landscape-18.svg` — Static browser asset (image, icon, font or vector); referenced by frontend code or served as-is. (snapshot size: 1,694 bytes)

### `client/public/demo-tours/` (1 files)

- `client/public/demo-tours/kenya-tour-08.svg` — Static browser asset (image, icon, font or vector); referenced by frontend code or served as-is. (snapshot size: 1,637 bytes)

### `client/public/destinations/` (3 files)

- `client/public/destinations/amboseli.jpg` — Static browser asset (image, icon, font or vector); referenced by frontend code or served as-is. (snapshot size: 48,491 bytes)
- `client/public/destinations/diani.jpg` — Static browser asset (image, icon, font or vector); referenced by frontend code or served as-is. (snapshot size: 66,138 bytes)
- `client/public/destinations/maasai-mara.jpg` — Static browser asset (image, icon, font or vector); referenced by frontend code or served as-is. (snapshot size: 39,384 bytes)

### `client/public/gallery/` (6 files)

- `client/public/gallery/amboseli.jpg` — Static browser asset (image, icon, font or vector); referenced by frontend code or served as-is. (snapshot size: 53,913 bytes)
- `client/public/gallery/beach.jpg` — Static browser asset (image, icon, font or vector); referenced by frontend code or served as-is. (snapshot size: 9,140 bytes)
- `client/public/gallery/culture.jpg` — Static browser asset (image, icon, font or vector); referenced by frontend code or served as-is. (snapshot size: 21,541 bytes)
- `client/public/gallery/diani.jpg` — Static browser asset (image, icon, font or vector); referenced by frontend code or served as-is. (snapshot size: 20,895 bytes)
- `client/public/gallery/mara.jpg` — Static browser asset (image, icon, font or vector); referenced by frontend code or served as-is. (snapshot size: 5,629 bytes)
- `client/public/gallery/safari.jpg` — Static browser asset (image, icon, font or vector); referenced by frontend code or served as-is. (snapshot size: 9,729 bytes)

### `client/public/testimonials/` (3 files)

- `client/public/testimonials/amina.jpg` — Static browser asset (image, icon, font or vector); referenced by frontend code or served as-is. (snapshot size: 42,029 bytes)
- `client/public/testimonials/james.jpg` — Static browser asset (image, icon, font or vector); referenced by frontend code or served as-is. (snapshot size: 22,530 bytes)
- `client/public/testimonials/sarah.jpg` — Static browser asset (image, icon, font or vector); referenced by frontend code or served as-is. (snapshot size: 39,323 bytes)

### `client/public/videos/` (3 files)

- `client/public/videos/city1_web.mp4` — Binary/media asset: cannot accept ordinary source-code comments; explain its purpose in this inventory or a sidecar manifest. (snapshot size: 1,324,859 bytes)
- `client/public/videos/city2_web.mp4` — Binary/media asset: cannot accept ordinary source-code comments; explain its purpose in this inventory or a sidecar manifest. (snapshot size: 2,770,400 bytes)
- `client/public/videos/city3_web.mp4` — Binary/media asset: cannot accept ordinary source-code comments; explain its purpose in this inventory or a sidecar manifest. (snapshot size: 9,956,623 bytes)

### `client/src/` (5 files)

- `client/src/App.css` — Stylesheet: defines visual layout, responsive behavior, colors, spacing and states; selectors/classes must match rendered markup. (snapshot size: 2,891 bytes)
- `client/src/App.jsx` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 2,523 bytes)
- `client/src/i18n.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 1,622 bytes)
- `client/src/index.css` — Stylesheet: defines visual layout, responsive behavior, colors, spacing and states; selectors/classes must match rendered markup. (snapshot size: 9,333 bytes)
- `client/src/main.jsx` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 1,732 bytes)

### `client/src/admin/` (1 files)

- `client/src/admin/rolesApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 653 bytes)

### `client/src/api/` (71 files)

- `client/src/api/accommodationInventoryApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 516 bytes)
- `client/src/api/accountingApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 1,056 bytes)
- `client/src/api/adminAIApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 2,558 bytes)
- `client/src/api/adminAgentApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 1,934 bytes)
- `client/src/api/adminApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 967 bytes)
- `client/src/api/adminBookingApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 5,224 bytes)
- `client/src/api/adminDestinationApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 1,942 bytes)
- `client/src/api/adminExperienceApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 651 bytes)
- `client/src/api/adminGalleryApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 702 bytes)
- `client/src/api/adminHeroApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 427 bytes)
- `client/src/api/adminReportApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 518 bytes)
- `client/src/api/adminReviewApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 423 bytes)
- `client/src/api/adminTourApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 2,191 bytes)
- `client/src/api/adminUserApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 1,474 bytes)
- `client/src/api/agentApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 1,600 bytes)
- `client/src/api/agentBookingApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 1,753 bytes)
- `client/src/api/aiApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 577 bytes)
- `client/src/api/airportTransferApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 1,733 bytes)
- `client/src/api/analyticsApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 724 bytes)
- `client/src/api/apiUrls.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 1,478 bytes)
- `client/src/api/auditApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 173 bytes)
- `client/src/api/axios.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 11,726 bytes)
- `client/src/api/bookingApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 1,455 bytes)
- `client/src/api/categoryApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 302 bytes)
- `client/src/api/commissionApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 429 bytes)
- `client/src/api/complianceApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 478 bytes)
- `client/src/api/couponApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 849 bytes)
- `client/src/api/crmApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 505 bytes)
- `client/src/api/customTourApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 739 bytes)
- `client/src/api/customerApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 1,432 bytes)
- `client/src/api/destinationApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 902 bytes)
- `client/src/api/driverApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 716 bytes)
- `client/src/api/financeApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 1,541 bytes)
- `client/src/api/financeComplianceApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 1,097 bytes)
- `client/src/api/financeLifecycleApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 912 bytes)
- `client/src/api/galleryApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 459 bytes)
- `client/src/api/guideApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 1,767 bytes)
- `client/src/api/heroApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 1,161 bytes)
- `client/src/api/hospitalityOperationsApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 2,960 bytes)
- `client/src/api/hospitalityPaymentApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 845 bytes)
- `client/src/api/hotelApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 5,271 bytes)
- `client/src/api/integrationApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 440 bytes)
- `client/src/api/mpesaApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 491 bytes)
- `client/src/api/notificationApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 325 bytes)
- `client/src/api/operationsApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 119 bytes)
- `client/src/api/operationsModuleApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 2,167 bytes)
- `client/src/api/packageApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 740 bytes)
- `client/src/api/passwordResetApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 336 bytes)
- `client/src/api/paymentGatewayApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 492 bytes)
- `client/src/api/platformBillingApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 261 bytes)
- `client/src/api/privacyApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 405 bytes)
- `client/src/api/publicPackageApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 200 bytes)
- `client/src/api/quotationApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 341 bytes)
- `client/src/api/reviewApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 379 bytes)
- `client/src/api/searchApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 410 bytes)
- `client/src/api/settingsApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 1,021 bytes)
- `client/src/api/staffApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 271 bytes)
- `client/src/api/superAdminApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 2,092 bytes)
- `client/src/api/superAdminTenantsApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 903 bytes)
- `client/src/api/taxApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 521 bytes)
- `client/src/api/tenantApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 655 bytes)
- `client/src/api/tenantBrandingApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 1,064 bytes)
- `client/src/api/tenantSubscriptionApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 541 bytes)
- `client/src/api/tourApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 3,998 bytes)
- `client/src/api/tourAssignmentApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 1,316 bytes)
- `client/src/api/tourManagerApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 3,991 bytes)
- `client/src/api/travelOperationsApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 1,402 bytes)
- `client/src/api/travelServiceRequestApi.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 479 bytes)
- `client/src/api/userApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 173 bytes)
- `client/src/api/vehicleApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 3,567 bytes)
- `client/src/api/wishlistApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 1,162 bytes)

### `client/src/api/admin/` (3 files)

- `client/src/api/admin/adminPaymentApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 4,186 bytes)
- `client/src/api/admin/adminRoleApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 2,180 bytes)
- `client/src/api/admin/systemHealthApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 603 bytes)

### `client/src/api/superadmin/` (1 files)

- `client/src/api/superadmin/superAdminRoleApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 724 bytes)

### `client/src/components/` (3 files)

- `client/src/components/AICustomer.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 1,945 bytes)
- `client/src/components/HusseinAIWidget.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 3,352 bytes)
- `client/src/components/PermissionGuard.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 976 bytes)

### `client/src/components/admin/` (32 files)

- `client/src/components/admin/AIAlerts.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 533 bytes)
- `client/src/components/admin/AIAnalyticsCharts.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 4,430 bytes)
- `client/src/components/admin/AIBookingRisk.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 979 bytes)
- `client/src/components/admin/AICustomerSupport.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 1,168 bytes)
- `client/src/components/admin/AIFinancialForecast.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 832 bytes)
- `client/src/components/admin/AIFraudMonitor.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 976 bytes)
- `client/src/components/admin/AIMarketing.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 966 bytes)
- `client/src/components/admin/AIOperationsCenter.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 1,468 bytes)
- `client/src/components/admin/AIOperationsCopilot.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 2,064 bytes)
- `client/src/components/admin/AIRevenueAdvisor.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 4,099 bytes)
- `client/src/components/admin/AISalesAssistant.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 1,144 bytes)
- `client/src/components/admin/AISentiment.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 1,135 bytes)
- `client/src/components/admin/AITaskManager.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 576 bytes)
- `client/src/components/admin/AITourPricing.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 592 bytes)
- `client/src/components/admin/AITourRecommendations.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 523 bytes)
- `client/src/components/admin/AccommodationInventoryPanel.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 3,405 bytes)
- `client/src/components/admin/AddVehicleModal.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 8,620 bytes)
- `client/src/components/admin/AdminHeader.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 1,217 bytes)
- `client/src/components/admin/AdminLayout.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 1,494 bytes)
- `client/src/components/admin/AdminSidebar.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 5,137 bytes)
- `client/src/components/admin/DataTable.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 2,106 bytes)
- `client/src/components/admin/DeveloperPlatformCenter.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 8,198 bytes)
- `client/src/components/admin/FinanceLifecycleCenter.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 9,507 bytes)
- `client/src/components/admin/KenyaTaxCenter.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 7,919 bytes)
- `client/src/components/admin/OperationsActionCenter.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 13,359 bytes)
- `client/src/components/admin/Pagination.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 2,692 bytes)
- `client/src/components/admin/PaymentGatewayCenter.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 9,087 bytes)
- `client/src/components/admin/ProtectedAdminRoute.jsx` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 752 bytes)
- `client/src/components/admin/RevenueChart.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 509 bytes)
- `client/src/components/admin/TenantHeroManager.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 5,110 bytes)
- `client/src/components/admin/TravelOperationsCenter.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 9,705 bytes)
- `client/src/components/admin/TravelServiceDesk.jsx` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 8,846 bytes)

### `client/src/components/admin/dashboard/` (13 files)

- `client/src/components/admin/dashboard/AdminDashboard.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 11,540 bytes)
- `client/src/components/admin/dashboard/BookingOverview.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 3,036 bytes)
- `client/src/components/admin/dashboard/DashboardHeader.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 1,081 bytes)
- `client/src/components/admin/dashboard/ModuleCoverage.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 1,890 bytes)
- `client/src/components/admin/dashboard/PaymentAnalytics.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 1,757 bytes)
- `client/src/components/admin/dashboard/PopularTours.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 2,275 bytes)
- `client/src/components/admin/dashboard/QuickActions.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 1,985 bytes)
- `client/src/components/admin/dashboard/RecentBookings.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 4,923 bytes)
- `client/src/components/admin/dashboard/RevenueChart.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 1,728 bytes)
- `client/src/components/admin/dashboard/Statcard.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 3,993 bytes)
- `client/src/components/admin/dashboard/StatsGrid.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 3,884 bytes)
- `client/src/components/admin/dashboard/SystemHealth.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 5,143 bytes)
- `client/src/components/admin/dashboard/UserAnalytics.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 895 bytes)

### `client/src/components/agent/` (5 files)

- `client/src/components/agent/AgentHeader.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 1,177 bytes)
- `client/src/components/agent/AgentRoute.jsx` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 692 bytes)
- `client/src/components/agent/AgentSidebar.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 1,703 bytes)
- `client/src/components/agent/DashboardCard.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 653 bytes)
- `client/src/components/agent/iconMap.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 4,130 bytes)

### `client/src/components/ai/` (1 files)

- `client/src/components/ai/AIAssistant.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 1,985 bytes)

### `client/src/components/auth/` (3 files)

- `client/src/components/auth/AdminRoute.jsx` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 1,424 bytes)
- `client/src/components/auth/PlanFeatureGate.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 9,457 bytes)
- `client/src/components/auth/ProtectedRoute.jsx` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 1,653 bytes)

### `client/src/components/booking/` (2 files)

- `client/src/components/booking/CouponInput.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 909 bytes)
- `client/src/components/booking/TravellerForm.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 1,918 bytes)

### `client/src/components/common/` (5 files)

- `client/src/components/common/DashboardLogoutButton.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 942 bytes)
- `client/src/components/common/LazyImage.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 1,495 bytes)
- `client/src/components/common/Loader.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 337 bytes)
- `client/src/components/common/MobileDashboardNav.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 2,707 bytes)
- `client/src/components/common/ScrollToTop.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 279 bytes)

### `client/src/components/dashboard/` (1 files)

- `client/src/components/dashboard/DownloadInvoice.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 1,335 bytes)

### `client/src/components/destinations/` (1 files)

- `client/src/components/destinations/DestinationCard.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 2,624 bytes)

### `client/src/components/home/` (12 files)

- `client/src/components/home/CategoriesSection.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 4,177 bytes)
- `client/src/components/home/DestinationsSection.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 3,495 bytes)
- `client/src/components/home/FeaturedTours.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 5,086 bytes)
- `client/src/components/home/GallerySection.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 2,377 bytes)
- `client/src/components/home/HeroSlider.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 10,189 bytes)
- `client/src/components/home/HomeSearch.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 4,187 bytes)
- `client/src/components/home/MpesaCTA.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 1,037 bytes)
- `client/src/components/home/NewsletterSection.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 1,527 bytes)
- `client/src/components/home/PublicPackages.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 2,734 bytes)
- `client/src/components/home/StatsSection.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 1,589 bytes)
- `client/src/components/home/TestimonialsSection.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 2,019 bytes)
- `client/src/components/home/WhyChooseUs.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 1,514 bytes)

### `client/src/components/layout/` (4 files)

- `client/src/components/layout/Footer.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 5,533 bytes)
- `client/src/components/layout/MainLayout.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 342 bytes)
- `client/src/components/layout/Navbar.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 8,539 bytes)
- `client/src/components/layout/TenantFooter.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 6,137 bytes)

### `client/src/components/layouts/` (1 files)

- `client/src/components/layouts/AgentLayout.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 1,021 bytes)

### `client/src/components/loyalty/` (1 files)

- `client/src/components/loyalty/LoyaltyCard.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 3,031 bytes)

### `client/src/components/notifications/` (2 files)

- `client/src/components/notifications/AssignmentNotifications.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 3,467 bytes)
- `client/src/components/notifications/NotificationBell.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 1,151 bytes)

### `client/src/components/reviews/` (3 files)

- `client/src/components/reviews/Rating.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 1,669 bytes)
- `client/src/components/reviews/ReviewCard.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 3,002 bytes)
- `client/src/components/reviews/ReviewForm.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 4,328 bytes)

### `client/src/components/search/` (1 files)

- `client/src/components/search/TravelSearch.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 4,425 bytes)

### `client/src/components/seo/` (2 files)

- `client/src/components/seo/SEO.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 2,101 bytes)
- `client/src/components/seo/TourSchema.jsx` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 1,831 bytes)

### `client/src/components/superadmin/` (1 files)

- `client/src/components/superadmin/SuperAdminSidebar.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 4,233 bytes)

### `client/src/components/superadmin/dashboard/` (3 files)

- `client/src/components/superadmin/dashboard/ActivityFeed.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 559 bytes)
- `client/src/components/superadmin/dashboard/MetricCard.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 605 bytes)
- `client/src/components/superadmin/dashboard/StatusCard.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 364 bytes)

### `client/src/components/tourManager/` (1 files)

- `client/src/components/tourManager/TourManagerSidebar.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 3,470 bytes)

### `client/src/components/tours/` (3 files)

- `client/src/components/tours/TourCard.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 4,263 bytes)
- `client/src/components/tours/TourFilters.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 2,872 bytes)
- `client/src/components/tours/wishListButton.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 1,285 bytes)

### `client/src/components/tours/tourManager/` (6 files)

- `client/src/components/tours/tourManager/BookingTable.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 6,427 bytes)
- `client/src/components/tours/tourManager/Notifications.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 3,708 bytes)
- `client/src/components/tours/tourManager/RevenueChart.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 2,010 bytes)
- `client/src/components/tours/tourManager/StatCard.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 1,600 bytes)
- `client/src/components/tours/tourManager/TourManagerSidebar.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 2,618 bytes)
- `client/src/components/tours/tourManager/UpcomingTours.jsx` — Frontend component: renders a user-interface unit and connects props/state to user interactions. (snapshot size: 6,196 bytes)

### `client/src/config/` (3 files)

- `client/src/config/iconMap.js` — Configuration module: centralizes runtime settings and integration setup; confirm defaults, validation and secret handling. (snapshot size: 327 bytes)
- `client/src/config/permissions.js` — Configuration module: centralizes runtime settings and integration setup; confirm defaults, validation and secret handling. (snapshot size: 1,408 bytes)
- `client/src/config/sidebbar.js` — Configuration module: centralizes runtime settings and integration setup; confirm defaults, validation and secret handling. (snapshot size: 381 bytes)

### `client/src/context/` (5 files)

- `client/src/context/AuthContext.jsx` — Shared frontend state/context provider; defines how state and actions are exposed to descendants. (snapshot size: 10,496 bytes)
- `client/src/context/CartContext.jsx` — Shared frontend state/context provider; defines how state and actions are exposed to descendants. (snapshot size: 1,482 bytes)
- `client/src/context/NotificationContext.jsx` — Shared frontend state/context provider; defines how state and actions are exposed to descendants. (snapshot size: 4,834 bytes)
- `client/src/context/SettingsContext.jsx` — Shared frontend state/context provider; defines how state and actions are exposed to descendants. (snapshot size: 8,353 bytes)
- `client/src/context/TenantContext.jsx` — Shared frontend state/context provider; defines how state and actions are exposed to descendants. (snapshot size: 5,146 bytes)

### `client/src/hooks/` (8 files)

- `client/src/hooks/useAdminNotifications.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 730 bytes)
- `client/src/hooks/useAgentBookings.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 616 bytes)
- `client/src/hooks/useAgentCustomers.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 619 bytes)
- `client/src/hooks/useAgentPackages.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 1,222 bytes)
- `client/src/hooks/useDebouncedValue.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 648 bytes)
- `client/src/hooks/useFeaturedTours.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 2,001 bytes)
- `client/src/hooks/useNotifications.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 172 bytes)
- `client/src/hooks/useVehicles.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 2,366 bytes)

### `client/src/layouts/` (4 files)

- `client/src/layouts/AdminLayout.jsx` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 11,582 bytes)
- `client/src/layouts/AgentLayout.jsx` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 1,898 bytes)
- `client/src/layouts/SuperAdminLayout.jsx` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 1,681 bytes)
- `client/src/layouts/TourManagerLayout.jsx` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 2,352 bytes)

### `client/src/lib/` (2 files)

- `client/src/lib/dateRange.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 2,071 bytes)
- `client/src/lib/queryClient.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 661 bytes)

### `client/src/pages/` (34 files)

- `client/src/pages/About.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 6,042 bytes)
- `client/src/pages/AirportTransferDetails.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 8,044 bytes)
- `client/src/pages/AirportTransferReservation.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 11,464 bytes)
- `client/src/pages/AirportTransfers.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 14,675 bytes)
- `client/src/pages/AirportTransfersMarketplace.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 7,119 bytes)
- `client/src/pages/BookingDetails.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 9,563 bytes)
- `client/src/pages/Checkout.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 24,422 bytes)
- `client/src/pages/Contact.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 9,088 bytes)
- `client/src/pages/CustomTourPackage.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 19,822 bytes)
- `client/src/pages/CustomTourRequest.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 7,445 bytes)
- `client/src/pages/CustomerMfa.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 3,221 bytes)
- `client/src/pages/Dashboard.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 10,108 bytes)
- `client/src/pages/DestinationDetails.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 4,455 bytes)
- `client/src/pages/Destinations.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 2,526 bytes)
- `client/src/pages/ForgotPassword.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 5,557 bytes)
- `client/src/pages/Home.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 10,138 bytes)
- `client/src/pages/HospitalityPayment.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 8,117 bytes)
- `client/src/pages/HotelDetails.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 8,451 bytes)
- `client/src/pages/HotelReservation.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 14,034 bytes)
- `client/src/pages/Hotels.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 19,905 bytes)
- `client/src/pages/HotelsMarketplace.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 7,713 bytes)
- `client/src/pages/Login.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 3,303 bytes)
- `client/src/pages/MyBookings.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 9,873 bytes)
- `client/src/pages/MyCustomTours.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 8,779 bytes)
- `client/src/pages/Notifications.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 3,478 bytes)
- `client/src/pages/PaymentLink.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 2,766 bytes)
- `client/src/pages/PaymentStatus.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 9,382 bytes)
- `client/src/pages/PolicyPage.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 5,148 bytes)
- `client/src/pages/Profile.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 13,187 bytes)
- `client/src/pages/Register.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 3,487 bytes)
- `client/src/pages/TourDetails.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 30,800 bytes)
- `client/src/pages/Tours.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 5,007 bytes)
- `client/src/pages/Unauthorized.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 607 bytes)
- `client/src/pages/Wishlist.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 7,228 bytes)

### `client/src/pages/admin/` (46 files)

- `client/src/pages/admin/AccountingLedger.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 16,449 bytes)
- `client/src/pages/admin/AdminAITools.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 16,525 bytes)
- `client/src/pages/admin/AdminAnalytics.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 8,306 bytes)
- `client/src/pages/admin/AdminCompliance.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 32,895 bytes)
- `client/src/pages/admin/AdminCoupons.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 14,191 bytes)
- `client/src/pages/admin/AdminCustomers.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 2,256 bytes)
- `client/src/pages/admin/AdminDashboard.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 290 bytes)
- `client/src/pages/admin/AdminGallery.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 13,461 bytes)
- `client/src/pages/admin/AdminHeroSlider.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 6,305 bytes)
- `client/src/pages/admin/AdminNotifications.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 18,289 bytes)
- `client/src/pages/admin/AdminReviews.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 9,574 bytes)
- `client/src/pages/admin/AdminSettings.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 23,628 bytes)
- `client/src/pages/admin/AdminSystemHealth.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 14,152 bytes)
- `client/src/pages/admin/AdminVehicles.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 102 bytes)
- `client/src/pages/admin/Agents.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 11,353 bytes)
- `client/src/pages/admin/BookingManagement.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 34,920 bytes)
- `client/src/pages/admin/Bookings.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 2,905 bytes)
- `client/src/pages/admin/CorporateAccounts.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 8,214 bytes)
- `client/src/pages/admin/CreateDestination.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 2,743 bytes)
- `client/src/pages/admin/CustomTourRequests.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 20,098 bytes)
- `client/src/pages/admin/CustomerDetails.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 13,042 bytes)
- `client/src/pages/admin/Customers.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 10,128 bytes)
- `client/src/pages/admin/DestinationDetails.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 1,763 bytes)
- `client/src/pages/admin/DestinationManagement.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 13,770 bytes)
- `client/src/pages/admin/EditDestination.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 9,372 bytes)
- `client/src/pages/admin/Finance.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 2,049 bytes)
- `client/src/pages/admin/GoLiveReadiness.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 3,349 bytes)
- `client/src/pages/admin/Guides.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 1,270 bytes)
- `client/src/pages/admin/HospitalityCommercial.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 23,531 bytes)
- `client/src/pages/admin/HospitalityManagement.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 39,463 bytes)
- `client/src/pages/admin/HospitalityOperations.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 13,199 bytes)
- `client/src/pages/admin/HospitalityReservationOperations.fixed.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 19 bytes)
- `client/src/pages/admin/HospitalityReservationOperations.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 36,540 bytes)
- `client/src/pages/admin/ManageBookings.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 2,311 bytes)
- `client/src/pages/admin/ManageTours.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 5,343 bytes)
- `client/src/pages/admin/OperationsDashboard.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 381 bytes)
- `client/src/pages/admin/OperationsProcurement.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 11,887 bytes)
- `client/src/pages/admin/PlatformArchitecture.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 3,599 bytes)
- `client/src/pages/admin/PrivacyRequests.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 9,782 bytes)
- `client/src/pages/admin/Reports.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 11,500 bytes)
- `client/src/pages/admin/StaffManagement.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 15,274 bytes)
- `client/src/pages/admin/TenantBilling.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 20,835 bytes)
- `client/src/pages/admin/TenantBranding.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 2,633 bytes)
- `client/src/pages/admin/Tours.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 788 bytes)
- `client/src/pages/admin/UserManagement.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 14,431 bytes)
- `client/src/pages/admin/Vehicles.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 14,983 bytes)

### `client/src/pages/admin/finance/` (11 files)

- `client/src/pages/admin/finance/AccountingCompletionCenter.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 22,224 bytes)
- `client/src/pages/admin/finance/AccountingControlReports.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 17,489 bytes)
- `client/src/pages/admin/finance/AccountingSubledgers.css` — Stylesheet: defines visual layout, responsive behavior, colors, spacing and states; selectors/classes must match rendered markup. (snapshot size: 2,057 bytes)
- `client/src/pages/admin/finance/AccountingSubledgers.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 20,053 bytes)
- `client/src/pages/admin/finance/AdminFinance.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 14,486 bytes)
- `client/src/pages/admin/finance/Commissions.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 11,118 bytes)
- `client/src/pages/admin/finance/FinanceReports.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 20,645 bytes)
- `client/src/pages/admin/finance/ManagementAccounting.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 20,995 bytes)
- `client/src/pages/admin/finance/MpesaTransactions.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 16,047 bytes)
- `client/src/pages/admin/finance/Reconciliation.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 13,238 bytes)
- `client/src/pages/admin/finance/WithholdingTax.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 19,934 bytes)

### `client/src/pages/admin/payments/` (1 files)

- `client/src/pages/admin/payments/AdminPayments.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 15,315 bytes)

### `client/src/pages/admin/roles/` (1 files)

- `client/src/pages/admin/roles/AdminRoles.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 2,216 bytes)

### `client/src/pages/admin/system/` (1 files)

- `client/src/pages/admin/system/SystemHealth.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 9,760 bytes)

### `client/src/pages/agent/` (6 files)

- `client/src/pages/agent/AgentBookings.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 10,231 bytes)
- `client/src/pages/agent/AgentCommission.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 5,950 bytes)
- `client/src/pages/agent/AgentCustomers.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 8,062 bytes)
- `client/src/pages/agent/AgentDashboard.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 13,022 bytes)
- `client/src/pages/agent/AgentPackages.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 5,648 bytes)
- `client/src/pages/agent/AgentQuotes.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 13,963 bytes)

### `client/src/pages/driver/` (1 files)

- `client/src/pages/driver/DriverDashboard.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 20,287 bytes)

### `client/src/pages/guide/` (2 files)

- `client/src/pages/guide/AssignedTours.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 2,736 bytes)
- `client/src/pages/guide/TourGuideDashboard.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 20,572 bytes)

### `client/src/pages/rbac/` (1 files)

- `client/src/pages/rbac/RolesPage.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 24,249 bytes)

### `client/src/pages/superadmin/` (12 files)

- `client/src/pages/superadmin/SecurityCenter.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 3,307 bytes)
- `client/src/pages/superadmin/SuperAdminApiMonitor.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 14,678 bytes)
- `client/src/pages/superadmin/SuperAdminAudit.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 21,032 bytes)
- `client/src/pages/superadmin/SuperAdminDashboard.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 14,500 bytes)
- `client/src/pages/superadmin/SuperAdminDatabase.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 18,700 bytes)
- `client/src/pages/superadmin/SuperAdminPlanFeatures.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 7,766 bytes)
- `client/src/pages/superadmin/SuperAdminRoles.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 15,793 bytes)
- `client/src/pages/superadmin/SuperAdminSecurity.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 12,416 bytes)
- `client/src/pages/superadmin/SuperAdminSettings.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 19,860 bytes)
- `client/src/pages/superadmin/SuperAdminSystem.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 14,718 bytes)
- `client/src/pages/superadmin/SuperAdminTenants.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 15,469 bytes)
- `client/src/pages/superadmin/SuperAdminUsers.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 29,707 bytes)

### `client/src/pages/tourManager/` (15 files)

- `client/src/pages/tourManager/AssignGuide.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 5,258 bytes)
- `client/src/pages/tourManager/AssignGuides.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 6,905 bytes)
- `client/src/pages/tourManager/AssignVehicle.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 5,624 bytes)
- `client/src/pages/tourManager/CreateTour.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 32,717 bytes)
- `client/src/pages/tourManager/EditTour.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 13,010 bytes)
- `client/src/pages/tourManager/Itineraries.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 26,634 bytes)
- `client/src/pages/tourManager/ManagerSettings.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 2,100 bytes)
- `client/src/pages/tourManager/TourAssignments.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 25,973 bytes)
- `client/src/pages/tourManager/TourAvailability.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 4,426 bytes)
- `client/src/pages/tourManager/TourManagerBookings.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 30,983 bytes)
- `client/src/pages/tourManager/TourManagerCalendar.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 24,672 bytes)
- `client/src/pages/tourManager/TourManagerCopilot.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 16,036 bytes)
- `client/src/pages/tourManager/TourManagerDashboard.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 7,117 bytes)
- `client/src/pages/tourManager/TourManagerGuides.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 13,653 bytes)
- `client/src/pages/tourManager/TourManagerTours.jsx` — Page/view: composes components and data loading for a user-facing screen. (snapshot size: 22,175 bytes)

### `client/src/routes/` (1 files)

- `client/src/routes/AppRoutes.jsx` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 17,552 bytes)

### `client/src/services/` (1 files)

- `client/src/services/tourManagerService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 579 bytes)

### `client/src/socket/` (1 files)

- `client/src/socket/socket.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 939 bytes)

### `client/src/styles/` (4 files)

- `client/src/styles/admin-compliance.css` — Stylesheet: defines visual layout, responsive behavior, colors, spacing and states; selectors/classes must match rendered markup. (snapshot size: 7,689 bytes)
- `client/src/styles/admin-dashboard.css` — Stylesheet: defines visual layout, responsive behavior, colors, spacing and states; selectors/classes must match rendered markup. (snapshot size: 3,417 bytes)
- `client/src/styles/admin-settings.css` — Stylesheet: defines visual layout, responsive behavior, colors, spacing and states; selectors/classes must match rendered markup. (snapshot size: 2,606 bytes)
- `client/src/styles/enterprise.css` — Stylesheet: defines visual layout, responsive behavior, colors, spacing and states; selectors/classes must match rendered markup. (snapshot size: 13,718 bytes)

### `client/src/utils/` (6 files)

- `client/src/utils/currency.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 659 bytes)
- `client/src/utils/dashboardData.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 1,338 bytes)
- `client/src/utils/exportBookings.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 1,097 bytes)
- `client/src/utils/roleUtils.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 2,003 bytes)
- `client/src/utils/syncPickupTimeWithTravelDate.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 2,411 bytes)
- `client/src/utils/tourImage.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 3,958 bytes)

### `docs/` (26 files)

- `docs/BATCH_2_OPERATIONS_CUSTOMER_COMPLIANCE_STATUS.md` — Documentation: explains setup, operation, architecture, safety or usage; keep commands and claims aligned with the actual implementation. (snapshot size: 1,944 bytes)
- `docs/BATCH_3_SAAS_SECURITY_RELIABILITY_STATUS.md` — Documentation: explains setup, operation, architecture, safety or usage; keep commands and claims aligned with the actual implementation. (snapshot size: 1,520 bytes)
- `docs/COMMERCIAL_READINESS_IMPLEMENTATION_STATUS.md` — Documentation: explains setup, operation, architecture, safety or usage; keep commands and claims aligned with the actual implementation. (snapshot size: 7,093 bytes)
- `docs/DEMO_SEEDING.md` — Documentation: explains setup, operation, architecture, safety or usage; keep commands and claims aligned with the actual implementation. (snapshot size: 6,571 bytes)
- `docs/DOCUMENTATION_INDEX.md` — Documentation: explains setup, operation, architecture, safety or usage; keep commands and claims aligned with the actual implementation. (snapshot size: 597 bytes)
- `docs/EXTERNAL_WEBSITE_CONNECTOR.md` — Documentation: explains setup, operation, architecture, safety or usage; keep commands and claims aligned with the actual implementation. (snapshot size: 5,269 bytes)
- `docs/EXTERNAL_WEBSITE_CONNECTOR_GO_LIVE.md` — Documentation: explains setup, operation, architecture, safety or usage; keep commands and claims aligned with the actual implementation. (snapshot size: 4,674 bytes)
- `docs/EXTERNAL_WEBSITE_CONNECTOR_QUICKSTART.md` — Documentation: explains setup, operation, architecture, safety or usage; keep commands and claims aligned with the actual implementation. (snapshot size: 1,100 bytes)
- `docs/FIRST_ADMIN_ONBOARDING.md` — Documentation: explains setup, operation, architecture, safety or usage; keep commands and claims aligned with the actual implementation. (snapshot size: 4,504 bytes)
- `docs/FIRST_TENANT_ACCEPTANCE.md` — Documentation: explains setup, operation, architecture, safety or usage; keep commands and claims aligned with the actual implementation. (snapshot size: 18,248 bytes)
- `docs/FRONTEND_BACKEND_COVERAGE_AUDIT.md` — Documentation: explains setup, operation, architecture, safety or usage; keep commands and claims aligned with the actual implementation. (snapshot size: 4,688 bytes)
- `docs/KENYA_PRODUCTION_RUNBOOK.md` — Documentation: explains setup, operation, architecture, safety or usage; keep commands and claims aligned with the actual implementation. (snapshot size: 2,783 bytes)
- `docs/MPESA_DARAJA_SANDBOX_READINESS.md` — Documentation: explains setup, operation, architecture, safety or usage; keep commands and claims aligned with the actual implementation. (snapshot size: 5,444 bytes)
- `docs/MULTITENANCY.md` — Documentation: explains setup, operation, architecture, safety or usage; keep commands and claims aligned with the actual implementation. (snapshot size: 3,008 bytes)
- `docs/PRODUCTION_GO_LIVE_CHECKLIST.md` — Documentation: explains setup, operation, architecture, safety or usage; keep commands and claims aligned with the actual implementation. (snapshot size: 4,042 bytes)
- `docs/PRODUCTION_READINESS.md` — Documentation: explains setup, operation, architecture, safety or usage; keep commands and claims aligned with the actual implementation. (snapshot size: 41,724 bytes)
- `docs/PROJECT_DOCUMENTATION.md` — Documentation: explains setup, operation, architecture, safety or usage; keep commands and claims aligned with the actual implementation. (snapshot size: 30,121 bytes)
- `docs/PUBLIC_TENANT_ONBOARDING.md` — Documentation: explains setup, operation, architecture, safety or usage; keep commands and claims aligned with the actual implementation. (snapshot size: 2,696 bytes)
- `docs/README_DOCUMENTATION.md` — Documentation: explains setup, operation, architecture, safety or usage; keep commands and claims aligned with the actual implementation. (snapshot size: 484 bytes)
- `docs/STAGE1_DEPLOYMENT_ACCEPTANCE.md` — Documentation: explains setup, operation, architecture, safety or usage; keep commands and claims aligned with the actual implementation. (snapshot size: 5,324 bytes)
- `docs/STEP1_MPESA_HARDENING.md` — Documentation: explains setup, operation, architecture, safety or usage; keep commands and claims aligned with the actual implementation. (snapshot size: 1,953 bytes)
- `docs/STEP3_PRODUCTION_RELEASE_RUNBOOK.md` — Documentation: explains setup, operation, architecture, safety or usage; keep commands and claims aligned with the actual implementation. (snapshot size: 7,155 bytes)
- `docs/SYSTEM_FROM_SCRATCH_GUIDE.md` — Documentation: explains setup, operation, architecture, safety or usage; keep commands and claims aligned with the actual implementation. (snapshot size: 30,657 bytes)
- `docs/TEST_DEMO_SEED.md` — Documentation: explains setup, operation, architecture, safety or usage; keep commands and claims aligned with the actual implementation. (snapshot size: 2,113 bytes)
- `docs/TEST_EVIDENCE.md` — Documentation: explains setup, operation, architecture, safety or usage; keep commands and claims aligned with the actual implementation. (snapshot size: 52,462 bytes)
- `docs/TOUR_DOMAIN_RULES.md` — Documentation: explains setup, operation, architecture, safety or usage; keep commands and claims aligned with the actual implementation. (snapshot size: 2,495 bytes)

### `docs/evidence/` (1 files)

- `docs/evidence/production-validation-2026-10-06.json` — JSON configuration/data file: syntax must remain valid; describe each key and avoid comments because standard JSON does not support comments. (snapshot size: 16,353 bytes)

### `scripts/` (2 files)

- `scripts/check-production-api-health.sh` — Shell script: automates command-line steps; document inputs, side effects, error handling and safe execution order. (snapshot size: 2,971 bytes)
- `scripts/update-documentation.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 3,435 bytes)

### `server/` (8 files)

- `server/.env.example` — Environment-variable example/configuration; documents names and safe defaults. Real secrets belong in deployment secret storage, never committed. (snapshot size: 3,862 bytes)
- `server/.npmrc` — Repository support file; inspect its format and references before changing it. This inventory records it so it is not silently overlooked. (snapshot size: 22 bytes)
- `server/README_MULTITENANCY.md` — Documentation: explains setup, operation, architecture, safety or usage; keep commands and claims aligned with the actual implementation. (snapshot size: 1,226 bytes)
- `server/app.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 16,911 bytes)
- `server/nodemon.json` — JSON configuration/data file: syntax must remain valid; describe each key and avoid comments because standard JSON does not support comments. (snapshot size: 244 bytes)
- `server/package-lock.json` — JavaScript package manifest/lockfile: declares scripts and dependencies or pins their resolved versions; lockfiles are generated by npm. (snapshot size: 119,847 bytes)
- `server/package.json` — JavaScript package manifest/lockfile: declares scripts and dependencies or pins their resolved versions; lockfiles are generated by npm. (snapshot size: 10,390 bytes)
- `server/server.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 5,508 bytes)

### `server/bootstrap/` (2 files)

- `server/bootstrap/invoiceIndexMigration.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 1,111 bytes)
- `server/bootstrap/operationalAccountingHooks.js` — Reusable frontend hook or lifecycle helper; inspect state, effects, dependencies and cleanup behavior. (snapshot size: 2,768 bytes)

### `server/certs/` (1 files)

- `server/certs/cert.cer` — Repository support file; inspect its format and references before changing it. This inventory records it so it is not silently overlooked. (snapshot size: 74,810 bytes)

### `server/config/` (9 files)

- `server/config/cloudinary.js` — Configuration module: centralizes runtime settings and integration setup; confirm defaults, validation and secret handling. (snapshot size: 548 bytes)
- `server/config/companyDefaults.js` — Configuration module: centralizes runtime settings and integration setup; confirm defaults, validation and secret handling. (snapshot size: 311 bytes)
- `server/config/corsPolicy.js` — Configuration module: centralizes runtime settings and integration setup; confirm defaults, validation and secret handling. (snapshot size: 1,536 bytes)
- `server/config/database.js` — Configuration module: centralizes runtime settings and integration setup; confirm defaults, validation and secret handling. (snapshot size: 3,321 bytes)
- `server/config/env.js` — Configuration module: centralizes runtime settings and integration setup; confirm defaults, validation and secret handling. (snapshot size: 6,507 bytes)
- `server/config/envValidation.js` — Configuration module: centralizes runtime settings and integration setup; confirm defaults, validation and secret handling. (snapshot size: 288 bytes)
- `server/config/mongoConfig.js` — Configuration module: centralizes runtime settings and integration setup; confirm defaults, validation and secret handling. (snapshot size: 4,158 bytes)
- `server/config/mpesa.js` — Configuration module: centralizes runtime settings and integration setup; confirm defaults, validation and secret handling. (snapshot size: 5,214 bytes)
- `server/config/tenantPluginLoader.js` — Configuration module: centralizes runtime settings and integration setup; confirm defaults, validation and secret handling. (snapshot size: 331 bytes)

### `server/constants/` (2 files)

- `server/constants/bookingConstants.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 6,288 bytes)
- `server/constants/paymentConstants.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 2,607 bytes)

### `server/controllers/` (155 files)

- `server/controllers/accommodationInventoryController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 1,353 bytes)
- `server/controllers/accountingControlReportsController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 18,862 bytes)
- `server/controllers/accountingController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 9,271 bytes)
- `server/controllers/accountingExportController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 2,745 bytes)
- `server/controllers/accountingOperationalReconciliationController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 8,921 bytes)
- `server/controllers/accountingReconciliationController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 4,407 bytes)
- `server/controllers/accountingReportsController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 9,189 bytes)
- `server/controllers/accountingSubledgerController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 14,963 bytes)
- `server/controllers/adminAIAlertsController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 2,239 bytes)
- `server/controllers/adminAIAnalyticsController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 2,140 bytes)
- `server/controllers/adminAIBookingRiskController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 2,067 bytes)
- `server/controllers/adminAIBriefingController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 2,269 bytes)
- `server/controllers/adminAIController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 2,378 bytes)
- `server/controllers/adminAICustomerSupportController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 980 bytes)
- `server/controllers/adminAIFinanceForecastController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 1,795 bytes)
- `server/controllers/adminAIFraudController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 1,736 bytes)
- `server/controllers/adminAIIntelligenceController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 3,346 bytes)
- `server/controllers/adminAIMarketingController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 1,265 bytes)
- `server/controllers/adminAIOperationsController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 2,144 bytes)
- `server/controllers/adminAIRevenueController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 2,057 bytes)
- `server/controllers/adminAISalesController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 1,800 bytes)
- `server/controllers/adminAISentimentController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 1,411 bytes)
- `server/controllers/adminAITaskController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 1,844 bytes)
- `server/controllers/adminAITourPricingController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 1,219 bytes)
- `server/controllers/adminAITourRecommendationController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 1,219 bytes)
- `server/controllers/adminAgentController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 11,095 bytes)
- `server/controllers/adminAuthController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 3,094 bytes)
- `server/controllers/adminBookingController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 12,072 bytes)
- `server/controllers/adminController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 7,695 bytes)
- `server/controllers/adminCouponController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 6,002 bytes)
- `server/controllers/adminDashboardMetricsController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 9,979 bytes)
- `server/controllers/adminDashboardTenantController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 7,775 bytes)
- `server/controllers/adminDestinationController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 8,241 bytes)
- `server/controllers/adminGalleryController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 2,895 bytes)
- `server/controllers/adminHeroController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 2,053 bytes)
- `server/controllers/adminHotelCreationController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 4,097 bytes)
- `server/controllers/adminPackageController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 7,051 bytes)
- `server/controllers/adminPaymentController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 11,630 bytes)
- `server/controllers/adminReviewController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 2,853 bytes)
- `server/controllers/adminRoleController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 15,305 bytes)
- `server/controllers/adminTourController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 9,784 bytes)
- `server/controllers/adminUserController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 13,297 bytes)
- `server/controllers/adminUserProfileController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 4,441 bytes)
- `server/controllers/agentBookingController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 17,013 bytes)
- `server/controllers/agentController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 9,353 bytes)
- `server/controllers/agentCustomerController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 9,088 bytes)
- `server/controllers/agentPackageController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 5,718 bytes)
- `server/controllers/agentTourController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 6,253 bytes)
- `server/controllers/aiBookingController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 536 bytes)
- `server/controllers/aiController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 2,762 bytes)
- `server/controllers/airportTransferController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 11,733 bytes)
- `server/controllers/analyticsController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 2,831 bytes)
- `server/controllers/apiMonitorController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 1,774 bytes)
- `server/controllers/authController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 30,651 bytes)
- `server/controllers/bookingAdminController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 22,935 bytes)
- `server/controllers/bookingController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 27,736 bytes)
- `server/controllers/bookingReportController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 9,611 bytes)
- `server/controllers/bookingRetrievalController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 2,995 bytes)
- `server/controllers/bookingTravelDateController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 3,672 bytes)
- `server/controllers/calendarReminderController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 3,478 bytes)
- `server/controllers/categoryController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 4,386 bytes)
- `server/controllers/commissionController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 7,632 bytes)
- `server/controllers/complianceController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 4,542 bytes)
- `server/controllers/couponController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 1,993 bytes)
- `server/controllers/creditDebitNoteController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 3,456 bytes)
- `server/controllers/crmController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 929 bytes)
- `server/controllers/customTourRequestController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 10,390 bytes)
- `server/controllers/customerBookingController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 6,918 bytes)
- `server/controllers/customerController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 7,227 bytes)
- `server/controllers/customerDashboardController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 3,760 bytes)
- `server/controllers/destinationController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 5,571 bytes)
- `server/controllers/developerIntegrationController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 5,906 bytes)
- `server/controllers/documentController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 3,073 bytes)
- `server/controllers/driverController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 4,571 bytes)
- `server/controllers/driverTourController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 5,313 bytes)
- `server/controllers/enhancedAirportTransferBookingController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 6,365 bytes)
- `server/controllers/enhancedHotelBookingController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 6,758 bytes)
- `server/controllers/expenseLifecycleController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 2,684 bytes)
- `server/controllers/financeComplianceController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 13,011 bytes)
- `server/controllers/financeController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 5,345 bytes)
- `server/controllers/financeExportController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 1,912 bytes)
- `server/controllers/galleryController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 3,383 bytes)
- `server/controllers/guideController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 10,993 bytes)
- `server/controllers/heroController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 713 bytes)
- `server/controllers/hospitalityAdminController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 8,097 bytes)
- `server/controllers/hospitalityBookingAmendmentController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 7,341 bytes)
- `server/controllers/hospitalityCommercialController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 10,643 bytes)
- `server/controllers/hospitalityInventoryConcurrencyController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 9,505 bytes)
- `server/controllers/hospitalityInventorySyncController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 2,821 bytes)
- `server/controllers/hospitalityOperationsController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 17,048 bytes)
- `server/controllers/hospitalityPaymentController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 13,482 bytes)
- `server/controllers/hotelAvailabilityController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 4,059 bytes)
- `server/controllers/hotelController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 16,649 bytes)
- `server/controllers/integrationController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 18,162 bytes)
- `server/controllers/invoiceController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 5,542 bytes)
- `server/controllers/itineraryController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 5,315 bytes)
- `server/controllers/managementAccountingController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 13,769 bytes)
- `server/controllers/mfaController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 6,419 bytes)
- `server/controllers/mpesaController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 13,680 bytes)
- `server/controllers/mpesaRefundController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 2,630 bytes)
- `server/controllers/mpesaStatusController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 3,506 bytes)
- `server/controllers/notificationController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 18,244 bytes)
- `server/controllers/operationalAssetController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 2,691 bytes)
- `server/controllers/operationsController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 6,664 bytes)
- `server/controllers/operationsCopilotController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 7,043 bytes)
- `server/controllers/operationsModuleController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 4,322 bytes)
- `server/controllers/paymentController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 9,206 bytes)
- `server/controllers/paymentGatewayController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 5,953 bytes)
- `server/controllers/paymentLinkController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 4,140 bytes)
- `server/controllers/phase3InvoiceAccess.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 524 bytes)
- `server/controllers/platformBillingController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 3,616 bytes)
- `server/controllers/privacyComplianceController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 1,270 bytes)
- `server/controllers/privacyController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 4,288 bytes)
- `server/controllers/quotationController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 5,828 bytes)
- `server/controllers/recommendationController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 1,012 bytes)
- `server/controllers/reconciliationController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 8,544 bytes)
- `server/controllers/reportController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 2,988 bytes)
- `server/controllers/reviewController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 4,232 bytes)
- `server/controllers/securityController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 788 bytes)
- `server/controllers/settingsController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 17,053 bytes)
- `server/controllers/staffController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 11,546 bytes)
- `server/controllers/stripeController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 27,124 bytes)
- `server/controllers/subscriptionMpesaCallbackController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 2,969 bytes)
- `server/controllers/superAdminBackupController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 5,628 bytes)
- `server/controllers/superAdminDashboardMetricsController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 9,085 bytes)
- `server/controllers/superAdminOperationsController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 9,705 bytes)
- `server/controllers/superAdminRevenueController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 3,081 bytes)
- `server/controllers/superAdminRoleController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 6,149 bytes)
- `server/controllers/superAdminTenantController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 15,219 bytes)
- `server/controllers/superAdminToolsController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 2,768 bytes)
- `server/controllers/superAdminUserController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 5,779 bytes)
- `server/controllers/systemHealthController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 3,127 bytes)
- `server/controllers/taxController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 2,195 bytes)
- `server/controllers/tenantBookingAdminController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 9,062 bytes)
- `server/controllers/tenantBrandingController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 2,941 bytes)
- `server/controllers/tenantController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 5,348 bytes)
- `server/controllers/tenantDirectoryController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 3,900 bytes)
- `server/controllers/tenantSubscriptionController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 6,161 bytes)
- `server/controllers/tourAvailabilityController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 4,864 bytes)
- `server/controllers/tourController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 7,514 bytes)
- `server/controllers/tourCrudController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 13,867 bytes)
- `server/controllers/tourLifecycleController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 6,050 bytes)
- `server/controllers/tourManagerBookingController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 3,329 bytes)
- `server/controllers/tourManagerController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 7,572 bytes)
- `server/controllers/tourReportController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 2,964 bytes)
- `server/controllers/tourResourceAssignmentController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 8,139 bytes)
- `server/controllers/travelLifecycleController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 6,619 bytes)
- `server/controllers/travelOperationsController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 3,975 bytes)
- `server/controllers/travelServiceRequestController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 4,063 bytes)
- `server/controllers/userController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 4,234 bytes)
- `server/controllers/vehicleController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 13,228 bytes)
- `server/controllers/voucherController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 15,877 bytes)
- `server/controllers/websiteLeadController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 5,160 bytes)
- `server/controllers/wishlistController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 2,860 bytes)
- `server/controllers/withholdingTaxController.js` — Controller layer: receives validated HTTP request data, coordinates application logic, and returns HTTP responses; business rules should remain in services. (snapshot size: 6,323 bytes)

### `server/docs/` (1 files)

- `server/docs/demo-login-account-reconciliation.md` — Documentation: explains setup, operation, architecture, safety or usage; keep commands and claims aligned with the actual implementation. (snapshot size: 3,003 bytes)

### `server/middleware/` (36 files)

- `server/middleware/adminMiddleware.js` — Middleware: runs before/after a request handler to enforce cross-cutting concerns such as authentication, tenant scope, validation and errors. (snapshot size: 1,338 bytes)
- `server/middleware/agentMiddleware.js` — Middleware: runs before/after a request handler to enforce cross-cutting concerns such as authentication, tenant scope, validation and errors. (snapshot size: 2,487 bytes)
- `server/middleware/aiRateLimiter.js` — Middleware: runs before/after a request handler to enforce cross-cutting concerns such as authentication, tenant scope, validation and errors. (snapshot size: 780 bytes)
- `server/middleware/auditMiddleware.js` — Middleware: runs before/after a request handler to enforce cross-cutting concerns such as authentication, tenant scope, validation and errors. (snapshot size: 1,559 bytes)
- `server/middleware/authMiddleware.js` — Middleware: runs before/after a request handler to enforce cross-cutting concerns such as authentication, tenant scope, validation and errors. (snapshot size: 8,567 bytes)
- `server/middleware/authRateLimiters.js` — Middleware: runs before/after a request handler to enforce cross-cutting concerns such as authentication, tenant scope, validation and errors. (snapshot size: 1,149 bytes)
- `server/middleware/bookingCommercialGuard.js` — Middleware: runs before/after a request handler to enforce cross-cutting concerns such as authentication, tenant scope, validation and errors. (snapshot size: 2,539 bytes)
- `server/middleware/contentManagerMiddleware.js` — Middleware: runs before/after a request handler to enforce cross-cutting concerns such as authentication, tenant scope, validation and errors. (snapshot size: 1,623 bytes)
- `server/middleware/customerProfileSync.js` — Middleware: runs before/after a request handler to enforce cross-cutting concerns such as authentication, tenant scope, validation and errors. (snapshot size: 642 bytes)
- `server/middleware/errorMiddleware.js` — Middleware: runs before/after a request handler to enforce cross-cutting concerns such as authentication, tenant scope, validation and errors. (snapshot size: 4,370 bytes)
- `server/middleware/integrationAuth.js` — Middleware: runs before/after a request handler to enforce cross-cutting concerns such as authentication, tenant scope, validation and errors. (snapshot size: 4,913 bytes)
- `server/middleware/mpesaCallbackIntegrity.js` — Middleware: runs before/after a request handler to enforce cross-cutting concerns such as authentication, tenant scope, validation and errors. (snapshot size: 2,309 bytes)
- `server/middleware/notFoundMiddleware.js` — Middleware: runs before/after a request handler to enforce cross-cutting concerns such as authentication, tenant scope, validation and errors. (snapshot size: 519 bytes)
- `server/middleware/paymentMutationGuard.js` — Middleware: runs before/after a request handler to enforce cross-cutting concerns such as authentication, tenant scope, validation and errors. (snapshot size: 387 bytes)
- `server/middleware/paymentTenantMiddleware.js` — Middleware: runs before/after a request handler to enforce cross-cutting concerns such as authentication, tenant scope, validation and errors. (snapshot size: 1,464 bytes)
- `server/middleware/permissionMiddleware.js` — Middleware: runs before/after a request handler to enforce cross-cutting concerns such as authentication, tenant scope, validation and errors. (snapshot size: 4,443 bytes)
- `server/middleware/planFeatureMiddleware.js` — Middleware: runs before/after a request handler to enforce cross-cutting concerns such as authentication, tenant scope, validation and errors. (snapshot size: 7,167 bytes)
- `server/middleware/prepareBookingForMpesa.js` — Middleware: runs before/after a request handler to enforce cross-cutting concerns such as authentication, tenant scope, validation and errors. (snapshot size: 1,352 bytes)
- `server/middleware/productionError.js` — Middleware: runs before/after a request handler to enforce cross-cutting concerns such as authentication, tenant scope, validation and errors. (snapshot size: 553 bytes)
- `server/middleware/rateLimiter.js` — Middleware: runs before/after a request handler to enforce cross-cutting concerns such as authentication, tenant scope, validation and errors. (snapshot size: 304 bytes)
- `server/middleware/requestContext.js` — Middleware: runs before/after a request handler to enforce cross-cutting concerns such as authentication, tenant scope, validation and errors. (snapshot size: 486 bytes)
- `server/middleware/requestLogger.js` — Middleware: runs before/after a request handler to enforce cross-cutting concerns such as authentication, tenant scope, validation and errors. (snapshot size: 581 bytes)
- `server/middleware/requireFullPaymentForTrip.js` — Middleware: runs before/after a request handler to enforce cross-cutting concerns such as authentication, tenant scope, validation and errors. (snapshot size: 1,732 bytes)
- `server/middleware/resolveMpesaCallbackTenant.js` — Middleware: runs before/after a request handler to enforce cross-cutting concerns such as authentication, tenant scope, validation and errors. (snapshot size: 1,676 bytes)
- `server/middleware/resolveMpesaRefundTenant.js` — Middleware: runs before/after a request handler to enforce cross-cutting concerns such as authentication, tenant scope, validation and errors. (snapshot size: 757 bytes)
- `server/middleware/resourceTenantGuard.js` — Middleware: runs before/after a request handler to enforce cross-cutting concerns such as authentication, tenant scope, validation and errors. (snapshot size: 4,858 bytes)
- `server/middleware/roleMiddleware.js` — Middleware: runs before/after a request handler to enforce cross-cutting concerns such as authentication, tenant scope, validation and errors. (snapshot size: 868 bytes)
- `server/middleware/securityMonitor.js` — Middleware: runs before/after a request handler to enforce cross-cutting concerns such as authentication, tenant scope, validation and errors. (snapshot size: 2,683 bytes)
- `server/middleware/superAdminOnly.js` — Middleware: runs before/after a request handler to enforce cross-cutting concerns such as authentication, tenant scope, validation and errors. (snapshot size: 400 bytes)
- `server/middleware/tenantMiddleware.js` — Middleware: runs before/after a request handler to enforce cross-cutting concerns such as authentication, tenant scope, validation and errors. (snapshot size: 10,580 bytes)
- `server/middleware/tourManagerMiddleware.js` — Middleware: runs before/after a request handler to enforce cross-cutting concerns such as authentication, tenant scope, validation and errors. (snapshot size: 417 bytes)
- `server/middleware/uploadMiddleware.js` — Middleware: runs before/after a request handler to enforce cross-cutting concerns such as authentication, tenant scope, validation and errors. (snapshot size: 4,457 bytes)
- `server/middleware/validateBookingTravelDate.js` — Middleware: runs before/after a request handler to enforce cross-cutting concerns such as authentication, tenant scope, validation and errors. (snapshot size: 3,649 bytes)
- `server/middleware/validateFutureTourDate.js` — Middleware: runs before/after a request handler to enforce cross-cutting concerns such as authentication, tenant scope, validation and errors. (snapshot size: 749 bytes)
- `server/middleware/validateTourAssignmentTenant.js` — Middleware: runs before/after a request handler to enforce cross-cutting concerns such as authentication, tenant scope, validation and errors. (snapshot size: 1,759 bytes)
- `server/middleware/validateTourCommand.js` — Middleware: runs before/after a request handler to enforce cross-cutting concerns such as authentication, tenant scope, validation and errors. (snapshot size: 2,812 bytes)

### `server/models/` (94 files)

- `server/models/AIConversation.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 1,320 bytes)
- `server/models/AITask.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 868 bytes)
- `server/models/AccommodationInventory.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 1,152 bytes)
- `server/models/AccountingPeriod.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 910 bytes)
- `server/models/AccountingReconciliation.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 1,623 bytes)
- `server/models/AccountingSubledger.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 1,851 bytes)
- `server/models/Agent.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 5,957 bytes)
- `server/models/AirportTransfer.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 2,010 bytes)
- `server/models/AirportTransferBooking.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 3,627 bytes)
- `server/models/ApiKey.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 818 bytes)
- `server/models/AuditLog.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 2,241 bytes)
- `server/models/BackgroundJob.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 1,331 bytes)
- `server/models/Booking.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 14,891 bytes)
- `server/models/CalendarReminder.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 920 bytes)
- `server/models/Campaign.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 6,574 bytes)
- `server/models/ChartOfAccount.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 1,096 bytes)
- `server/models/Commission.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 4,212 bytes)
- `server/models/ComplianceRecord.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 1,625 bytes)
- `server/models/CorporateAccount.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 1,960 bytes)
- `server/models/Coupon.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 2,432 bytes)
- `server/models/CreditDebitNote.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 2,396 bytes)
- `server/models/Currency.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 2,208 bytes)
- `server/models/CustomTourRequest.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 2,131 bytes)
- `server/models/Customer.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 9,252 bytes)
- `server/models/CustomerProfile.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 8,920 bytes)
- `server/models/DatabaseBackup.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 925 bytes)
- `server/models/Destination.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 9,724 bytes)
- `server/models/EtimsCredential.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 2,537 bytes)
- `server/models/EtimsSubmission.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 1,664 bytes)
- `server/models/Expense.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 2,535 bytes)
- `server/models/FinanceBudget.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 1,197 bytes)
- `server/models/FixedAsset.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 1,127 bytes)
- `server/models/Gallery.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 792 bytes)
- `server/models/HeroSlide.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 1,061 bytes)
- `server/models/HospitalityDeposit.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 2,880 bytes)
- `server/models/HospitalityRatePlan.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 1,457 bytes)
- `server/models/HospitalityRoomBlock.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 1,029 bytes)
- `server/models/HospitalitySupplierContract.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 1,646 bytes)
- `server/models/Hotel.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 2,222 bytes)
- `server/models/HotelBooking.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 3,510 bytes)
- `server/models/HotelRoomType.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 2,978 bytes)
- `server/models/Invoice.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 9,125 bytes)
- `server/models/InvoiceSequence.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 754 bytes)
- `server/models/Itinerary.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 5,211 bytes)
- `server/models/JournalEntry.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 2,666 bytes)
- `server/models/Lead.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 2,124 bytes)
- `server/models/Loyalty.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 6,760 bytes)
- `server/models/LoyaltyAccount.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 988 bytes)
- `server/models/Media.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 5,704 bytes)
- `server/models/Notification.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 3,495 bytes)
- `server/models/OperationalAsset.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 1,573 bytes)
- `server/models/Organization.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 2,569 bytes)
- `server/models/Payment.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 12,361 bytes)
- `server/models/PaymentGatewayConfig.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 2,916 bytes)
- `server/models/PaymentLink.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 1,200 bytes)
- `server/models/Permission.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 2,328 bytes)
- `server/models/PrivacyRequest.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 1,950 bytes)
- `server/models/Promotion.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 6,607 bytes)
- `server/models/PurchaseOrder.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 3,158 bytes)
- `server/models/Quotation.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 8,058 bytes)
- `server/models/Referral.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 2,515 bytes)
- `server/models/Refund.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 954 bytes)
- `server/models/RefundAudit.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 972 bytes)
- `server/models/Review.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 6,833 bytes)
- `server/models/Role.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 3,099 bytes)
- `server/models/SecurityLog.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 2,531 bytes)
- `server/models/Staff.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 4,107 bytes)
- `server/models/StaffProfile.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 4,733 bytes)
- `server/models/Subscription.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 1,487 bytes)
- `server/models/SubscriptionPayment.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 1,803 bytes)
- `server/models/Supplier.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 1,854 bytes)
- `server/models/SupplierPayable.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 2,334 bytes)
- `server/models/SystemSetting.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 4,243 bytes)
- `server/models/SystemSettings.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 5,926 bytes)
- `server/models/TaxProfile.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 3,006 bytes)
- `server/models/TaxRule.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 1,302 bytes)
- `server/models/Tour.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 9,802 bytes)
- `server/models/TourCategory.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 830 bytes)
- `server/models/TourCost.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 1,755 bytes)
- `server/models/TourGallery.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 4,216 bytes)
- `server/models/TourPackage.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 10,086 bytes)
- `server/models/TourReport.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 5,967 bytes)
- `server/models/TravelCommercialRule.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 1,016 bytes)
- `server/models/TravelServiceRequest.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 1,843 bytes)
- `server/models/User.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 5,054 bytes)
- `server/models/UserPreference.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 6,172 bytes)
- `server/models/Vehicle.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 3,425 bytes)
- `server/models/WalletTransaction.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 6,126 bytes)
- `server/models/Webhook.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 786 bytes)
- `server/models/WebhookDelivery.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 1,225 bytes)
- `server/models/WebsiteIntegrationEvent.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 1,269 bytes)
- `server/models/WebsiteIntegrationKey.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 1,791 bytes)
- `server/models/Wishlist.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 3,527 bytes)
- `server/models/WithholdingTax.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 1,959 bytes)

### `server/reports/` (4 files)

- `server/reports/demo-api-validation.json` — JSON configuration/data file: syntax must remain valid; describe each key and avoid comments because standard JSON does not support comments. (snapshot size: 9,812 bytes)
- `server/reports/demo-image-validation.json` — JSON configuration/data file: syntax must remain valid; describe each key and avoid comments because standard JSON does not support comments. (snapshot size: 137 bytes)
- `server/reports/readiness-database-cleanup.json` — JSON configuration/data file: syntax must remain valid; describe each key and avoid comments because standard JSON does not support comments. (snapshot size: 966 bytes)
- `server/reports/test-seed-report.json` — JSON configuration/data file: syntax must remain valid; describe each key and avoid comments because standard JSON does not support comments. (snapshot size: 28,417 bytes)

### `server/routes/` (94 files)

- `server/routes/accommodationInventoryRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 596 bytes)
- `server/routes/accountingRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 4,492 bytes)
- `server/routes/adminAIRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 3,550 bytes)
- `server/routes/adminAgentRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 781 bytes)
- `server/routes/adminAuthRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 662 bytes)
- `server/routes/adminBookingRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 1,260 bytes)
- `server/routes/adminCategoryRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 638 bytes)
- `server/routes/adminCouponRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 746 bytes)
- `server/routes/adminDashboardRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 744 bytes)
- `server/routes/adminDestinationRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 1,979 bytes)
- `server/routes/adminGalleryRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 815 bytes)
- `server/routes/adminHeroRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 626 bytes)
- `server/routes/adminPackageRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 719 bytes)
- `server/routes/adminPaymentRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 1,462 bytes)
- `server/routes/adminReviewRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 768 bytes)
- `server/routes/adminRoleRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 815 bytes)
- `server/routes/adminRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 2,023 bytes)
- `server/routes/adminTourRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 1,481 bytes)
- `server/routes/agentBookingRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 807 bytes)
- `server/routes/agentCustomerRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 779 bytes)
- `server/routes/agentPackageRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 569 bytes)
- `server/routes/agentRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 1,671 bytes)
- `server/routes/aiRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 1,083 bytes)
- `server/routes/airportTransferRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 1,122 bytes)
- `server/routes/analyticsRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 1,229 bytes)
- `server/routes/apiMonitorRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 441 bytes)
- `server/routes/authRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 1,652 bytes)
- `server/routes/bookingRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 1,847 bytes)
- `server/routes/categoryRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 303 bytes)
- `server/routes/commissionRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 821 bytes)
- `server/routes/complianceRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 989 bytes)
- `server/routes/couponRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 410 bytes)
- `server/routes/creditDebitNoteRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 763 bytes)
- `server/routes/crmRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 1,169 bytes)
- `server/routes/customTourRequestRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 1,124 bytes)
- `server/routes/customerRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 1,318 bytes)
- `server/routes/databaseRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 612 bytes)
- `server/routes/destinationRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 887 bytes)
- `server/routes/developerIntegrationRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 835 bytes)
- `server/routes/documentRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 1,100 bytes)
- `server/routes/driverRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 807 bytes)
- `server/routes/financeComplianceRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 1,912 bytes)
- `server/routes/financeRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 1,713 bytes)
- `server/routes/galleryRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 320 bytes)
- `server/routes/guideRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 922 bytes)
- `server/routes/heroRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 295 bytes)
- `server/routes/hospitalityOperationsRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 2,320 bytes)
- `server/routes/hospitalityPaymentRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 730 bytes)
- `server/routes/hotelRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 1,685 bytes)
- `server/routes/index.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 10,205 bytes)
- `server/routes/integrationRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 2,198 bytes)
- `server/routes/invoiceRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 1,415 bytes)
- `server/routes/kenyaReadinessRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 562 bytes)
- `server/routes/mfaRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 708 bytes)
- `server/routes/mpesaRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 1,567 bytes)
- `server/routes/notificationRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 1,717 bytes)
- `server/routes/operationalAssetRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 501 bytes)
- `server/routes/operationsModuleRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 1,585 bytes)
- `server/routes/operationsRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 532 bytes)
- `server/routes/paymentGatewayRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 668 bytes)
- `server/routes/paymentLinkRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 656 bytes)
- `server/routes/privacyRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 1,026 bytes)
- `server/routes/publicPackageRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 298 bytes)
- `server/routes/quotationRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 1,322 bytes)
- `server/routes/recommendationRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 1,035 bytes)
- `server/routes/reviewRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 1,114 bytes)
- `server/routes/securityRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 557 bytes)
- `server/routes/seoRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 862 bytes)
- `server/routes/settingsRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 522 bytes)
- `server/routes/staffRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 1,037 bytes)
- `server/routes/stripeRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 541 bytes)
- `server/routes/superAdminMaintenanceRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 1,225 bytes)
- `server/routes/superAdminOperationsRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 735 bytes)
- `server/routes/superAdminRevenueRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 310 bytes)
- `server/routes/superAdminRoleRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 627 bytes)
- `server/routes/superAdminRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 3,871 bytes)
- `server/routes/superAdminToolsRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 574 bytes)
- `server/routes/superAdminUserRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 364 bytes)
- `server/routes/systemHealthRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 784 bytes)
- `server/routes/taxRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 833 bytes)
- `server/routes/tenantBrandingRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 454 bytes)
- `server/routes/tenantRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 529 bytes)
- `server/routes/tenantSubscriptionRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 580 bytes)
- `server/routes/tourAssignmentRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 569 bytes)
- `server/routes/tourManagerRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 4,092 bytes)
- `server/routes/tourReportRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 526 bytes)
- `server/routes/tourRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 3,910 bytes)
- `server/routes/travelLifecycleRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 653 bytes)
- `server/routes/travelOperationsRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 737 bytes)
- `server/routes/travelServiceRequestRoutes.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 666 bytes)
- `server/routes/userRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 1,448 bytes)
- `server/routes/vehicleRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 1,486 bytes)
- `server/routes/websiteLeadRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 724 bytes)
- `server/routes/wishlistRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 1,299 bytes)

### `server/routes/internal/` (1 files)

- `server/routes/internal/stagingSuperAdminBootstrapRoutes.js` — Routing layer: maps HTTP method/path to middleware and controller handlers. (snapshot size: 8,129 bytes)

### `server/scripts/` (33 files)

- `server/scripts/auditTenantDashboardData.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 18,197 bytes)
- `server/scripts/autoCancelExpiredPendingBookings.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 911 bytes)
- `server/scripts/bootstrapFirstSuperAdmin.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 4,128 bytes)
- `server/scripts/bootstrapStagingSuperAdmin.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 2,096 bytes)
- `server/scripts/cleanupReadinessTestDatabases.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 5,841 bytes)
- `server/scripts/createAdmin.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 3,074 bytes)
- `server/scripts/createGlobalToursAdmins.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 4,065 bytes)
- `server/scripts/demoApiValidationSafety.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 639 bytes)
- `server/scripts/migrateBookingPaymentLedger.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 2,570 bytes)
- `server/scripts/migrateOrphanStaffToTenant.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 2,628 bytes)
- `server/scripts/mongodb-application-audit.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 11,741 bytes)
- `server/scripts/production-readiness-check.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 9,016 bytes)
- `server/scripts/reconcileDemoLoginAccounts.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 15,031 bytes)
- `server/scripts/reconcileDemoSeedData.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 14,888 bytes)
- `server/scripts/reconcileTenantIndexes.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 3,269 bytes)
- `server/scripts/repairFinancialReconciliation.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 8,051 bytes)
- `server/scripts/repairGlobalToursMedia.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 9,293 bytes)
- `server/scripts/repairHusseindbTenantCatalogues.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 21,445 bytes)
- `server/scripts/repairLocalTenantTourItineraries.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 5,562 bytes)
- `server/scripts/repairTenantHomepages.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 25,311 bytes)
- `server/scripts/repairTenantTourItineraries.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 9,508 bytes)
- `server/scripts/reset-and-seed-demo.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 746 bytes)
- `server/scripts/reset-demo-passwords.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 5,764 bytes)
- `server/scripts/resetGlobalToursData.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 5,758 bytes)
- `server/scripts/seedStagingQaData.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 1,191 bytes)
- `server/scripts/stagingQaSeedCore.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 11,551 bytes)
- `server/scripts/stagingQaStartupSeed.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 1,858 bytes)
- `server/scripts/tenantIndexPreflight.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 5,540 bytes)
- `server/scripts/tenantIsolationRegressionCheck.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 9,176 bytes)
- `server/scripts/tenantModelContractCheck.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 1,326 bytes)
- `server/scripts/verifyDemoApi.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 20,019 bytes)
- `server/scripts/verifyDemoImageAssets.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 2,052 bytes)
- `server/scripts/verifyStagingQaData.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 978 bytes)

### `server/seeds/` (35 files)

- `server/seeds/adminSeed.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 2,616 bytes)
- `server/seeds/agentSeed.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 3,375 bytes)
- `server/seeds/bookingAgentSeed.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 2,697 bytes)
- `server/seeds/categories.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 602 bytes)
- `server/seeds/categorySeed.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 1,073 bytes)
- `server/seeds/cleanAndReseedGlobalTours.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 20,393 bytes)
- `server/seeds/completeTestDemoSeed.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 105,726 bytes)
- `server/seeds/customTourRequestsSeed.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 4,916 bytes)
- `server/seeds/customerSeed.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 2,706 bytes)
- `server/seeds/dashboardOperationalSeed.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 12,592 bytes)
- `server/seeds/destinationSeed.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 2,380 bytes)
- `server/seeds/ensureDashboardMasterData.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 3,160 bytes)
- `server/seeds/financialDashboardSeed.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 27,278 bytes)
- `server/seeds/financialDashboardSeedRunner.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 229 bytes)
- `server/seeds/globalToursTestSeed.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 8,148 bytes)
- `server/seeds/guideSeed.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 4,761 bytes)
- `server/seeds/hospitalityDeveloperSeed.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 13,504 bytes)
- `server/seeds/index.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 760 bytes)
- `server/seeds/migrateLegacyRoles.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 4,560 bytes)
- `server/seeds/permissionSeed.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 1,172 bytes)
- `server/seeds/repairGlobalTourMedia.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 4,515 bytes)
- `server/seeds/replaceGlobalToursImages.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 6,236 bytes)
- `server/seeds/resetAdminPassword.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 1,251 bytes)
- `server/seeds/resetBookingAgentPassword.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 1,571 bytes)
- `server/seeds/resetCustomerPassword.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 2,198 bytes)
- `server/seeds/resetFinanceOfficerPassword.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 2,362 bytes)
- `server/seeds/resetManagerPassword.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 1,617 bytes)
- `server/seeds/resetTourGuidePassword.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 2,332 bytes)
- `server/seeds/roleSeed.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 1,178 bytes)
- `server/seeds/seedDestinations.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 1,471 bytes)
- `server/seeds/staffSeed.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 3,143 bytes)
- `server/seeds/tourGuideSeed.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 3,121 bytes)
- `server/seeds/tourManagerSeed.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 5,358 bytes)
- `server/seeds/tourSeed.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 6,023 bytes)
- `server/seeds/vehicleSeed.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 1,233 bytes)

### `server/services/` (82 files)

- `server/services/aiBookingCompleteService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 1,096 bytes)
- `server/services/aiBookingDraftService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 1,272 bytes)
- `server/services/aiBookingService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 758 bytes)
- `server/services/aiConversationService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 814 bytes)
- `server/services/aiIntentService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 801 bytes)
- `server/services/aiKnowledgeFormatter.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 1,128 bytes)
- `server/services/aiKnowledgeService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 890 bytes)
- `server/services/aiService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 4,742 bytes)
- `server/services/aiTourSearchService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 2,089 bytes)
- `server/services/analyticsService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 2,197 bytes)
- `server/services/auditService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 603 bytes)
- `server/services/availabilityService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 3,247 bytes)
- `server/services/bookingCreationService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 690 bytes)
- `server/services/bookingNotificationService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 1,726 bytes)
- `server/services/bookingPaymentCleanupService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 3,051 bytes)
- `server/services/bookingRevenueService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 1,094 bytes)
- `server/services/bookingStatusService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 2,100 bytes)
- `server/services/campaignService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 2,246 bytes)
- `server/services/commissionService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 2,952 bytes)
- `server/services/complianceExpiryService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 1,492 bytes)
- `server/services/couponService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 2,987 bytes)
- `server/services/currencyService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 729 bytes)
- `server/services/customerAnalyticsService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 849 bytes)
- `server/services/customerCommunicationScheduler.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 1,057 bytes)
- `server/services/customerCommunicationService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 12,726 bytes)
- `server/services/customerProfileService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 1,521 bytes)
- `server/services/customerSegmentationService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 1,425 bytes)
- `server/services/dataRetentionService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 2,217 bytes)
- `server/services/duplicateKeyDiagnostic.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 686 bytes)
- `server/services/emailService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 5,705 bytes)
- `server/services/etimsNoteService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 7,918 bytes)
- `server/services/etimsService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 10,543 bytes)
- `server/services/financeLifecycleService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 6,830 bytes)
- `server/services/financeReportingService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 2,889 bytes)
- `server/services/historicalCustomerMetrics.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 1,347 bytes)
- `server/services/hospitalityInventoryConcurrencyService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 1,125 bytes)
- `server/services/hospitalityInvoiceService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 3,976 bytes)
- `server/services/hospitalityPaymentLifecycleService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 8,638 bytes)
- `server/services/inventoryService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 7,811 bytes)
- `server/services/invoiceLifecycleService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 1,092 bytes)
- `server/services/jobQueueService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 2,104 bytes)
- `server/services/jobRetryService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 379 bytes)
- `server/services/jobWorkerService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 2,599 bytes)
- `server/services/kenyaComplianceService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 1,606 bytes)
- `server/services/kenyaFinanceReadinessGuard.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 1,529 bytes)
- `server/services/kenyaStep2ReadinessService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 2,365 bytes)
- `server/services/loyaltyService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 2,107 bytes)
- `server/services/mfaService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 710 bytes)
- `server/services/mpesaQueryService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 1,519 bytes)
- `server/services/mpesaRefundService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 2,190 bytes)
- `server/services/mpesaService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 4,885 bytes)
- `server/services/notificationService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 5,071 bytes)
- `server/services/onboardingService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 10,265 bytes)
- `server/services/operationalAccountingService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 20,679 bytes)
- `server/services/operationsCopilotCalculations.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 6,777 bytes)
- `server/services/operationsService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 9,061 bytes)
- `server/services/paymentAnalyticsService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 1,557 bytes)
- `server/services/paymentCleanupScheduler.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 548 bytes)
- `server/services/paymentGatewayService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 2,367 bytes)
- `server/services/paymentLifecycleService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 34,263 bytes)
- `server/services/paymentReconciliationGuard.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 1,357 bytes)
- `server/services/pdfService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 3,778 bytes)
- `server/services/planFeatureService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 7,169 bytes)
- `server/services/quotationCalculator.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 1,427 bytes)
- `server/services/recommendationService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 2,965 bytes)
- `server/services/recoveryService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 2,344 bytes)
- `server/services/reportService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 784 bytes)
- `server/services/securityService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 2,966 bytes)
- `server/services/settingsService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 4,476 bytes)
- `server/services/sitemapService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 1,934 bytes)
- `server/services/smsService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 3,045 bytes)
- `server/services/ssrfSafeHttpsService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 2,749 bytes)
- `server/services/superAdminDataConsistency.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 3,673 bytes)
- `server/services/taxEngineService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 5,079 bytes)
- `server/services/tenantIndexRepair.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 3,282 bytes)
- `server/services/tenantSubscriptionService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 9,697 bytes)
- `server/services/tourCancellationService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 4,119 bytes)
- `server/services/tourLifecycleService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 2,921 bytes)
- `server/services/tourResourceLifecycleService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 1,455 bytes)
- `server/services/travelOperationsService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 1,170 bytes)
- `server/services/webhookDeliveryService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 7,619 bytes)
- `server/services/whatsappService.js` — Service layer: contains reusable application/business operations called by controllers, jobs or other services. (snapshot size: 1,804 bytes)

### `server/socket/` (1 files)

- `server/socket/socketManager.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 3,244 bytes)

### `server/startup/` (1 files)

- `server/startup/readiness.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 814 bytes)

### `server/tenancy/` (10 files)

- `server/tenancy/README.md` — Documentation: explains setup, operation, architecture, safety or usage; keep commands and claims aligned with the actual implementation. (snapshot size: 325 bytes)
- `server/tenancy/addTenantFilter.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 137 bytes)
- `server/tenancy/backgroundContext.js` — Shared frontend state/context provider; defines how state and actions are exposed to descendants. (snapshot size: 374 bytes)
- `server/tenancy/backgroundTenantFilter.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 198 bytes)
- `server/tenancy/bootstrap.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 524 bytes)
- `server/tenancy/context.js` — Shared frontend state/context provider; defines how state and actions are exposed to descendants. (snapshot size: 3,282 bytes)
- `server/tenancy/secureModels.js` — Data model/schema: defines stored record shape, validation, indexes and persistence behavior. (snapshot size: 163 bytes)
- `server/tenancy/secureQuery.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 737 bytes)
- `server/tenancy/tenantPlugin.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 13,018 bytes)
- `server/tenancy/tenantQuery.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 167 bytes)

### `server/tests/` (63 files)

- `server/tests/accountingOperationalReconciliationIntegrity.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 2,236 bytes)
- `server/tests/authCookie.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 1,191 bytes)
- `server/tests/bookingExternalIdIndex.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 664 bytes)
- `server/tests/completeTestDemoSeedSafety.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 5,148 bytes)
- `server/tests/complianceExpiryService.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 708 bytes)
- `server/tests/consolidatedProductionAudit.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 4,657 bytes)
- `server/tests/corsPolicy.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 3,346 bytes)
- `server/tests/demoApiValidationContract.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 3,702 bytes)
- `server/tests/demoLoginAccountMigration.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 1,774 bytes)
- `server/tests/demoSeedAuthentication.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 3,258 bytes)
- `server/tests/disableMongoAutoIndexForStartupTest.mjs` — Repository support file; inspect its format and references before changing it. This inventory records it so it is not silently overlooked. (snapshot size: 224 bytes)
- `server/tests/etimsInvoicePayload.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 2,423 bytes)
- `server/tests/etimsProductionSafety.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 4,512 bytes)
- `server/tests/externalWebsiteCapture.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 4,386 bytes)
- `server/tests/externalWebsiteGoLive.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 2,114 bytes)
- `server/tests/financeRevenueBasisContract.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 1,326 bytes)
- `server/tests/financialDashboardSeedIntegrity.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 931 bytes)
- `server/tests/firstTenantAcceptance.integration.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 32,393 bytes)
- `server/tests/firstTenantProvisioningSecurity.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 3,483 bytes)
- `server/tests/frontendCoverageContract.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 7,015 bytes)
- `server/tests/healthReadiness.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 11,313 bytes)
- `server/tests/hospitalityFinanceIntegrity.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 1,449 bytes)
- `server/tests/hospitalityPaymentLifecycleIntegration.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 3,213 bytes)
- `server/tests/integrationMongoUri.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 1,025 bytes)
- `server/tests/kenyaFinanceReadinessGuard.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 1,111 bytes)
- `server/tests/kenyaStep2ReadinessService.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 1,401 bytes)
- `server/tests/mongoConfig.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 5,738 bytes)
- `server/tests/mongodbVersion.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 984 bytes)
- `server/tests/mpesaCallbackLifecycleContract.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 2,941 bytes)
- `server/tests/mpesaConfiguration.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 5,186 bytes)
- `server/tests/mpesaRefundSafety.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 2,288 bytes)
- `server/tests/operationalFinancialInvariants.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 7,832 bytes)
- `server/tests/operationsCopilotCalculations.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 5,003 bytes)
- `server/tests/operationsModule.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 2,243 bytes)
- `server/tests/partialUniqueIndexes.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 1,266 bytes)
- `server/tests/paymentFinancialIntegrity.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 1,379 bytes)
- `server/tests/paymentGatewaySecurity.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 621 bytes)
- `server/tests/planFeatureEntitlement.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 1,880 bytes)
- `server/tests/productionReadinessContract.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 8,266 bytes)
- `server/tests/publicError.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 1,157 bytes)
- `server/tests/publicTourCategoryFilter.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 537 bytes)
- `server/tests/rbacCanonicalRoles.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 812 bytes)
- `server/tests/repairHusseindbTenantCatalogues.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 6,288 bytes)
- `server/tests/repairLocalTenantTourItineraries.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 1,287 bytes)
- `server/tests/repairTenantTourItineraries.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 3,583 bytes)
- `server/tests/resendEmailService.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 3,189 bytes)
- `server/tests/roleNormalization.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 795 bytes)
- `server/tests/stagingQaSeed.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 12,347 bytes)
- `server/tests/stagingSuperAdminBootstrap.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 4,090 bytes)
- `server/tests/stagingTenantAdminPasswordReset.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 6,779 bytes)
- `server/tests/subscriptionBillingIntegrity.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 3,784 bytes)
- `server/tests/superAdminBackupListing.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 2,688 bytes)
- `server/tests/taxEngine.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 1,663 bytes)
- `server/tests/tenant-context-async.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 1,028 bytes)
- `server/tests/tenantDashboardAudit.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 3,013 bytes)
- `server/tests/tenantDashboardCacheIsolation.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 1,322 bytes)
- `server/tests/tenantDashboardDataIsolation.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 950 bytes)
- `server/tests/tenantUrlResolution.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 2,844 bytes)
- `server/tests/testTenantHeaderResolution.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 840 bytes)
- `server/tests/testTenantMiddleware.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 501 bytes)
- `server/tests/testTenantSecurity.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 451 bytes)
- `server/tests/tourDomainIntegrity.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 1,972 bytes)
- `server/tests/tourLifecycleIntegration.test.js` — Automated test or end-to-end scenario; arrange setup, execute real behavior, and assert expected results and safety boundaries. (snapshot size: 7,095 bytes)

### `server/utils/` (19 files)

- `server/utils/apiResponse.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 774 bytes)
- `server/utils/authCookie.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 864 bytes)
- `server/utils/bookingOwnership.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 1,266 bytes)
- `server/utils/bookingPricing.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 2,818 bytes)
- `server/utils/buildPermissions.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 1,992 bytes)
- `server/utils/calculateBookingAmounts.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 2,615 bytes)
- `server/utils/createInvoice.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 3,574 bytes)
- `server/utils/createTicketQR.JS` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 930 bytes)
- `server/utils/emailTemplates.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 3,103 bytes)
- `server/utils/generateToken.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 1,159 bytes)
- `server/utils/mongodbVersion.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 940 bytes)
- `server/utils/publicError.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 650 bytes)
- `server/utils/roleUtils.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 1,908 bytes)
- `server/utils/sitemap.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 2,951 bytes)
- `server/utils/tenantAggregationPlugin.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 582 bytes)
- `server/utils/tenantHost.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 622 bytes)
- `server/utils/tenantIsolationPlugin.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 667 bytes)
- `server/utils/tenantQuery.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 248 bytes)
- `server/utils/withTransaction.js` — JavaScript/TypeScript source module; follow imports, exported symbols and callers to understand its exact runtime responsibility. (snapshot size: 745 bytes)

## How to use this inventory while learning the system

1. Start with root documentation and root/client/server package manifests so you know the commands and runtime boundaries.
2. Follow the API path from the client API wrapper to the matching server route, middleware, controller, service, model, and tests. Record the real function names and data shape as you read each file.
3. For payment code, trace initiation → persisted pending state → signed/validated provider callback → idempotent state transition → booking/invoice updates → reconciliation and tests. Never infer payment success from a successful initiation response alone.
4. For tenant-aware code, trace how the tenant is resolved, where authorization happens, and where every database query includes tenant scope. Verify negative cross-tenant tests.
5. For each UI page, trace its imports, data-fetching functions, loading/error/empty states, forms and backend endpoints. Explain why each state update occurs and what the user sees.
6. For configuration/workflows, explain each trigger, environment variable, permission, job, command and failure condition. Never document secrets or paste their values.
7. Treat lockfiles, generated outputs and binary assets as tracked files that must be inventoried, not as files to corrupt by forcing comments into unsupported formats.
8. Re-run tests and builds after comment-only changes. Keep an explicit completion table that distinguishes commented, documented externally, generated/binary, reviewed, and not-yet-reviewed files.

**Important status:** this inventory is complete for the cited Git tree snapshot, but it does not claim that all 1,099 files already have line-by-line source comments. The source-commenting work must continue in small verified batches, and the inventory must be regenerated when files are added or removed.
