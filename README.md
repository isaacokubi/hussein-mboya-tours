# Global Tours

Kenya-focused, multi-tenant tours & travel SaaS for tour operators, with tenant isolation, bookings, payments, finance/accounting, compliance, hospitality/operations, website integrations, RBAC and production safeguards.

## Latest targeted first-tenant acceptance — 2026-10-10

**PASS — 1 test passed, 0 failed, 0 skipped** using `cd server && node --env-file=.env --test tests/firstTenantAcceptance.integration.test.js` (about 111.5 seconds). The flow covered disposable tenant provisioning, tenant-admin/customer access, public catalogue and booking paths, tenant-scoped data, and cross-tenant denial. The login regression now correctly asserts that Tenant A credentials are rejected by Tenant B's login with HTTP 401; the separate authenticated `/api/auth/me` test verifies a Tenant A JWT cannot select Tenant B and expects HTTP 404. The test diagnostic confirms no provider payment was initiated.

This is targeted disposable-database acceptance evidence, not a full-suite rerun or live production certification. M-Pesa callback/replay/failure, KRA/eTIMS submissions, current deployed SHA, browser/mobile acceptance, and backup/restore remain external verification gates.

## Latest verified repository status — 2026-10-09

The comprehensive three-tenant demo dataset was reconciled on 2026-10-09. Source-level and live checks below were run for this revision; full demo API and browser acceptance still have the limitations noted below. Production/provider certification remains a separate deployment-evidence gate.

### Latest verified checks

| Area | Result |
|---|---|
| Backend full suite | **229 passed, 0 failed, 5 skipped** (verified 2026-10-09 after the financial audit changes) |
| Seed syntax checks (`npm run check:seeds`) | **PASS** |
| Frontend lint | **PASS** |
| Frontend production build | **PASS** |
| Live health and CORS preflight | **PASS** |
| Live destination and tour APIs | **PASS** — 12 records for each of the three tenants |
| Live login/API checks | **PASS** — global superadmin and tenant admins authenticated; cross-tenant tenant-ID requests were denied |
| Complete 37-account API/browser audit | **INCOMPLETE** — API smoke stopped on a transient request failure; public browser smoke reported failed requests |
| Global superadmin browser audit | **PASS** — tenantless session and stale tenant selection cleared |
| Frontend lint/build | **PASS** |

### Test and remediation summary — 2026-10-03 through 2026-10-09

The following summarizes evidence recorded during the last seven days. Detailed chronology and limitations are in [Test Evidence Register](docs/TEST_EVIDENCE.md).

| Date / change | Test evidence | Result / boundary |
|---|---|---|
| 2026-10-04 — staging/security verification | Backend suite, seed checks, client lint/build, live health/CORS and role-login smoke were reported; historical suite count was 182 passed. | Automated and selected smoke checks passed. A full 28-account live staging login/RBAC audit was **not completed** because the documented Render/Vercel endpoints were inaccessible at that time. |
| 2026-10-09 — catalogue uniqueness and tenant isolation | Catalogue repair regression tests; CI server checks, client lint/build, live tenant-isolation regression and three-phase release gate. | Reported PASS, including catalogue repair tests 4/4 and release gate 3/3. Live deployment/browser verification remains separate and must be checked against the deployed SHA. |
| 2026-10-09 — financial seed and integrity audit | `npm test`; `npm run check:seeds`; `npm run seed:financial-dashboard`; `npm run audit:tenant-dashboards`. | **229 passed, 0 failed, 5 skipped**; seed syntax checks passed; read-only Atlas audit reported **PASS, 0 issues** across all three tenants. Five integration tests were skipped and are not counted as passes. |
| 2026-10-09 — tenant-specific data and financial reconciliation | Ownership/reference checks, booking/payment and invoice/payment reconciliation, balanced journals, revenue/refund posting rules and seed consistency. | Audit passed for Hussein Mboya Tours, Amani Trails Safaris and Demo Safari Adventures. Each has 8 tours and 12 destinations; matching counts do not alone prove unique content, so catalogue uniqueness is tracked separately. |
| 2026-10-09 — GitHub Actions | PR #196 CI and release-gate results. | Server production checks, live tenant-isolation regression, client lint/build, tour lifecycle runtime integration, and all three release-gate phases reported successful. |

Recent merged remediation includes [PR #187](https://github.com/isaacokubi/hussein-mboya-tours/pull/187) tenant-scoped dashboard revenue/customer counts; [PR #188](https://github.com/isaacokubi/hussein-mboya-tours/pull/188) tenant-aware cache/session isolation; [PR #189](https://github.com/isaacokubi/hussein-mboya-tours/pull/189), [PR #191](https://github.com/isaacokubi/hussein-mboya-tours/pull/191), and [PR #192](https://github.com/isaacokubi/hussein-mboya-tours/pull/192) tenant-unique catalogues and guarded repair; [PR #193](https://github.com/isaacokubi/hussein-mboya-tours/pull/193) read-only tenant dashboard audit; [PR #194](https://github.com/isaacokubi/hussein-mboya-tours/pull/194) dashboard tenant-context correction; [PR #195](https://github.com/isaacokubi/hussein-mboya-tours/pull/195) financial seed payment synchronization; and [PR #196](https://github.com/isaacokubi/hussein-mboya-tours/pull/196) financial integrity audit and seed reconciliation.

**Important limits:** demo bookings, payments, refunds and financial totals are synthetic test fixtures, not real revenue or evidence of live M-Pesa transactions. Live KRA/eTIMS submissions, payment-provider callbacks/idempotency, full 37-account browser acceptance, current production deployment SHA, backup/restore and production certification are not proven by these automated tests. Do not infer them as PASS.

### Demo account architecture

The authoritative demo login set is `TEST_LOGIN_EMAILS` in `server/seeds/completeTestDemoSeed.js`: one global platform superadmin and 12 tenant users for each of `hussein-mboya`, `amani-trails`, and `demo-safari` (37 total). The database was reseeded and validated on 2026-10-09 with 3 tenants and 37 active users. The 2026-09-28, 28-user seed verification below is historical and does not describe the current account architecture.

Demo credentials use the private `SEED_DEMO_PASSWORD` environment variable; never commit its value to Git. All seeded payment records are synthetic internal fixtures. No live M-Pesa transaction is initiated by the seed.

### Controlled demo seeding

The authoritative seed is `server/seeds/completeTestDemoSeed.js`; the legacy `seed:demo` command delegates to it. Atlas use requires explicit `ALLOW_ATLAS_DEMO_SEED=YES` and `CONFIRM_TEST_SEED=YES`, and writes only under the three exact demo tenant identities after writing a preflight count report. The seed refuses production mode and unsafe fallback configuration. **Do not run it against an unknown or real production database.**

See [Demo Data & Seed Runbook](docs/DEMO_SEEDING.md) for the exact safety gates and verification procedure.

## Staging Verification Status

**Staging/demo verification has been completed for the latest controlled dataset.** The staging database separation, health/readiness, frontend-to-staging API connectivity, CORS, SuperAdmin bootstrap/login, disposable tenant creation, tenant identity/settings, initial empty tour retrieval, access isolation, and endpoint/subscription discovery gates are recorded as passed or observed as expected. The next gate is to create and verify staging tour, customer, and booking records and complete cross-tenant isolation checks. M-Pesa testing must wait until every data-isolation gate passes; no production endpoint or database may be used for these tests.

See the [Staging Test Record](docs/TEST_EVIDENCE.md#2026-09-26--staging-verification-record) for environment boundaries, evidence, historical automated results, pending checks, and the exact staging-only test order. The [Test Evidence Register](docs/TEST_EVIDENCE.md) remains the chronological QA record.

## Current status

**First-tenant decision: TARGETED DATABASE-BACKED ACCEPTANCE PASSED ON 2026-10-10; LIVE PROVIDER/DEPLOYMENT EVIDENCE STILL REQUIRED.** The dedicated disposable-database flow passed 1/1 with no failures. The older 2026-09-25 endpoint probe and its missing health-body/CORS/deployed-SHA evidence are historical and do not describe this acceptance run. Atlas production state, payment-provider callbacks, eTIMS, backup/restore, current deployment SHA, and complete browser/mobile acceptance remain outstanding.

See [First Tenant Production Acceptance](docs/FIRST_TENANT_ACCEPTANCE.md) for the production environment matrix, onboarding procedure and external actions.

**Historical production-audit source snapshot:** `0b7949865e67a4fa5dd45076a120f9d7f69f1e39`
**Verification date:** 2026-10-09 (current demo-seed reconciliation; historical production-audit source snapshot above)
**Repository branch:** `main`

The latest full local verification was completed after the production-audit remediation. Code-level checks and local release gates passed. Production launch certification is **not yet complete** because several acceptance gates require evidence from the actual deployment/provider environment.

### Earlier local release-audit results (historical)

| Area | Result | Evidence |
|---|---|---|
| Server static/security/tenant/production checks | PASS | `npm run check:all` under Node 24.18.0 with `NODE_ENV=test` and CI-safe test credentials |
| Backend automated tests | PASS with skips | `npm test`: 136 total, 131 passed, 0 failed, 5 skipped |
| Security tests | PASS | `npm run test:security`: 2 passed, 0 failed, 0 skipped |
| Tour-domain tests | PASS | `npm run test:tour-domain`: 1 test passed, 0 failed, 0 skipped |
| Client lint/build | PASS | `npm run lint` and production `npm run build` with explicit HTTPS API/socket URLs |
| Workflow YAML | PASS | Ruby Psych parsed all 7 workflow YAML files |
| First-tenant live integration | UNVERIFIED | Expanded MongoDB 8 replica-set test is wired into CI; no supported local MongoDB service is available |
| Production API/frontend integration | NOT VERIFIED | Render root and `/api/health` returned 200 JSON; Vercel root returned 200 HTML. Health body, CORS and deployed commit/version were not established. |
| Production certification | NOT VERIFIED | External deployment, database, payment, backup, monitoring and compliance evidence remains required |

### Intentionally skipped integration tests

The five skipped cases were:

- first-tenant provisioning and cross-tenant API acceptance (skipped in the 2026-10-09 full-suite run; subsequently passed as a dedicated targeted test on 2026-10-10);
- database-connected startup and invoice-index readiness;
- airport-transfer payment completion atomic lifecycle;
- tour lifecycle transactional capacity reservation/release;
- payment-completion rollback when accounting posting fails.

A skipped test is not treated as a failure or as production acceptance.

## Production acceptance still required

### API startup and deployment health

The API binds Render's `PORT` before connecting to MongoDB or running the critical invoice-index migration. `/api/health` stays reachable during startup and reports `starting` or `degraded` with the actual Mongoose connection state; it reports `healthy` only after MongoDB is connected and the required migration completes. Database-backed routes return 503 until then. A failed database connection or invoice-index migration terminates the process, and the startup migration has a bounded 60-second default (configurable up to 120 seconds).

Render must provide `MONGODB_URI`, strong `JWT_SECRET`, dedicated `PAYMENT_CREDENTIAL_ENCRYPTION_KEY` and `WEBHOOK_SECRET_KEY`, HTTPS `CLIENT_URL`/`CLIENT_ORIGINS`, and the real `PLATFORM_HOST`. The MongoDB URI must explicitly name the existing `husseindb` database in its path (for Atlas, the URI path ends in `/husseindb` before query options); production startup rejects a missing database name or a different database. Atlas `mongodb+srv://` and standard `mongodb://` connection strings are supported. `ETIMS_CREDENTIAL_ENCRYPTION_KEY` is required when eTIMS is enabled. Cloudinary credentials are optional; without them the API still starts, and upload/image deletion endpoints that need Cloudinary fail closed with HTTP 503. The frontend must set `VITE_API_URL` to the public API origin followed by `/api`; Socket.IO uses explicit `VITE_SOCKET_URL` or derives the origin from that API URL. The GitHub API smoke check allows up to 120 seconds for transient startup/network readiness and still requires HTTP 200 with `success=true`, `status=healthy`, and `database=connected`.

The local source deployment remains **NOT VERIFIED** until the configured GitHub Actions checks succeed against the live services. Vercel deployments must set build-time `VITE_API_URL`; `VITE_SOCKET_URL` is recommended, and `vercel.json` intentionally contains no deployment hostname.

The remaining gates are runtime/provider evidence gates, not unresolved source-code fixes:

- current `main` deployment SHA verification;
- live tenant-isolation regression against the deployed current release;
- M-Pesa sandbox callback delivery and completion;
- duplicate M-Pesa callback/idempotency replay;
- failed/expired M-Pesa behavior;
- payment → booking → invoice → accounting reconciliation using completed provider data;
- live KRA/eTIMS submission and receipt/control-number evidence;
- full desktop/mobile browser acceptance across customer, Admin, Finance, Tour Manager, Driver and SuperAdmin flows;
- production read-only MongoDB integrity/reconciliation scan.

Sandbox STK initiation must not be represented as completed payment acceptance.

## Current implementation scope

The platform includes:

- tenant-scoped users, roles and permissions;
- customer, admin, agent, manager and guide workflows;
- tours, destinations, bookings and tour lifecycle controls;
- M-Pesa, card and bank payment architecture;
- payment lifecycle, refunds, invoices and accounting;
- Kenyan tax configuration and eTIMS integration architecture;
- supplier, purchase-order, tour-cost and supplier-payable workflows;
- profitability, finance reporting and reconciliation controls;
- hotel/accommodation and airport-transfer foundations;
- corporate accounts and operational workflows;
- website booking capture and website integration APIs;
- developer APIs and webhooks;
- security controls, tenant isolation and CSRF/session protections;
- monitoring, health checks and backup/restore safeguards;
- production release-gate automation and audit documentation.

## Production documentation

- [Production readiness](docs/PRODUCTION_READINESS.md) — current readiness matrix and release rules.
- [Test evidence register](docs/TEST_EVIDENCE.md) — chronological evidence and explicit pending/not-verified gates.
- [Documentation automation](scripts/update-documentation.js) — generates the current repository-state section.
- [Documentation workflow](.github/workflows/documentation.yml) — generates a reviewable documentation snapshot artifact on pushes to `main`.

## Documentation policy

Documentation is part of the release process. The GitHub Actions documentation workflow generates repository metadata after every push to `main` and publishes it as an artifact for review; it does not write to the repository.

Historical test evidence is **not** auto-marked PASS. A test is recorded as PASS only when its required evidence actually exists. External/provider results remain explicitly PENDING, BLOCKED or NOT VERIFIED until verified.

<!-- DOCS-AUTO:START -->
## Current repository state

This section is maintained by `scripts/update-documentation.js`. The GitHub Actions workflow uploads a generated snapshot artifact for review.

- **Repository:** Global Tours — multi-tenant tours & travel SaaS
- **Branch:** `main`
- **Current commit:** `0b7949865e67a4fa5dd45076a120f9d7f69f1e39`
- **Short commit:** `0b79498`
- **Documentation snapshot date (UTC):** 2026-09-27
- **Server package:** `hussein-mboya-tours-server@1.0.0`
- **Client package:** `client@0.0.0`
- **Server verification commands:** `npm run check:all`, `npm test`, `npm run test:security`, `npm run test:tour-domain`
- **Client verification commands:** `npm run lint`, `npm run build`
- **Production contract:** `npm run check:production`
- **Release rule:** production certification requires current deployment/provider evidence; local or CI source checks alone do not certify live production.

### Documentation automation

The workflow has read-only repository permissions and does not modify or push repository contents. Manual changes to generated files should be reviewed as regular repository updates.

<!-- DOCS-AUTO:END -->

## 2026-09-28 demo seed verification

The controlled reset completed against the explicitly authorized demo Atlas database `husseindb`. It preserved one platform owner and seeded all three tenants. Actual totals are **28 users, 36 tours, 36 destinations, 36 bookings, 30 payments, 6 staff, 12 customers, 6 quotations, 6 custom-tour requests, 3 vehicles, 9 reviews, and 18 notifications**. Every tenant has 12 unique tour images and destination images. Both public catalogues returned 12 entries through the deployed API. Finance, operations, website-integration, hospitality, hotel, and airport-transfer counts are recorded in [Demo Seeding Verification](docs/DEMO_SEEDING.md). This is demo/staging evidence only; it does not certify production readiness.
