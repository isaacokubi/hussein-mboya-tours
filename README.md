# Global Tours

Kenya-focused, multi-tenant tours & travel SaaS for tour operators, with tenant isolation, bookings, payments, finance/accounting, compliance, hospitality/operations, website integrations, RBAC and production safeguards.

## Current status

**First-tenant decision: NOT READY.** The acceptance test now describes the platform-owner, tenant-admin, customer, catalogue, booking and isolation lifecycle, but its MongoDB-backed flow has not run. This machine has MongoDB 3.6.8 and no Docker runtime; the test requires a disposable MongoDB replica set. On 2026-09-24, Render root timed out and `/api/health` returned HTTP 503; Vercel root returned HTTP 200 HTML. The live Render version could not be identified from these responses. Atlas, payment, eTIMS, backup/restore and current-deployment evidence is outstanding.

See [First Tenant Production Acceptance](docs/FIRST_TENANT_ACCEPTANCE.md) for the production environment matrix, onboarding procedure and external actions.

**Reviewed local base:** `0048b99d1f2bee3f269bfa70d3af7eb3b4d075ed`
**Verification date:** 2026-09-24
**Repository branch:** `main` (local commits have not been pushed)

The latest full local verification was completed after the production-audit remediation. Code-level checks and local release gates passed. Production launch certification is **not yet complete** because several acceptance gates require evidence from the actual deployment/provider environment.

### Latest verification results

| Area | Result | Evidence |
|---|---|---|
| Server static/security/tenant/production checks | PASS | `npm run check:all` under Node 22 with `NODE_ENV=test` and CI-safe test credentials |
| Backend automated tests | PASS with skips | `npm test`: 127 total, 122 passed, 0 failed, 5 skipped |
| Security tests | PASS | `npm run test:security`: 2 passed, 0 failed, 0 skipped |
| Tour-domain tests | PASS | `npm run test:tour-domain`: 1 test passed, 0 failed, 0 skipped |
| Client lint/build | PASS | `npm run lint` and production `npm run build` with explicit HTTPS API/socket URLs |
| Workflow YAML | PASS | Seven workflow files parsed |
| First-tenant live integration | UNVERIFIED | Expanded MongoDB 8 replica-set test is wired into CI; no supported local MongoDB service is available |
| Production API/frontend integration | NOT VERIFIED | Render root timed out; `/api/health` returned 503; Vercel root returned 200 HTML. No deployed commit/version was exposed by this check. |
| Production certification | NOT VERIFIED | External deployment, database, payment, backup, monitoring and compliance evidence remains required |

### Intentionally skipped integration tests

The following database/provider tests were skipped because their runtime prerequisites were unavailable:

- airport-transfer payment completion atomic lifecycle;
- tour lifecycle transactional capacity reservation/release;
- payment-completion rollback when accounting posting fails;
- first-tenant provisioning and cross-tenant API acceptance;
- database-connected startup and invoice-index readiness.

A skipped test is not treated as a failure or as production acceptance.

## Production acceptance still required

### API startup and deployment health

The API binds Render's `PORT` before connecting to MongoDB or running the critical invoice-index migration. `/api/health` stays reachable during startup and reports `starting` or `degraded` with the actual Mongoose connection state; it reports `healthy` only after MongoDB is connected and the required migration completes. Database-backed routes return 503 until then. A failed database connection or invoice-index migration terminates the process, and the startup migration has a bounded 60-second default (configurable up to 120 seconds).

Render must provide `MONGODB_URI`, strong `JWT_SECRET`, dedicated `PAYMENT_CREDENTIAL_ENCRYPTION_KEY` and `WEBHOOK_SECRET_KEY`, HTTPS `CLIENT_URL`/`CLIENT_ORIGINS`, and the real `PLATFORM_HOST`. `ETIMS_CREDENTIAL_ENCRYPTION_KEY` is required when eTIMS is enabled. Cloudinary credentials are optional; without them the API still starts, and upload/image deletion endpoints that need Cloudinary fail closed with HTTP 503. The frontend must set `VITE_API_URL` to the public API origin followed by `/api`; Socket.IO uses explicit `VITE_SOCKET_URL` or derives the origin from that API URL. The GitHub API smoke check allows up to 120 seconds for transient startup/network readiness and still requires HTTP 200 with `success=true`, `status=healthy`, and `database=connected`.

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
- **Current commit:** `0048b99d1f2bee3f269bfa70d3af7eb3b4d075ed`
- **Short commit:** `0048b99`
- **Documentation snapshot date (UTC):** 2026-09-24
- **Server package:** `hussein-mboya-tours-server@1.0.0`
- **Client package:** `client@0.0.0`
- **Server verification commands:** `npm run check:all`, `npm test`, `npm run test:security`, `npm run test:tour-domain`
- **Client verification commands:** `npm run lint`, `npm run build`
- **Production contract:** `npm run check:production`
- **Release rule:** production certification requires current deployment/provider evidence; local or CI source checks alone do not certify live production.

### Documentation automation

The workflow has read-only repository permissions and does not modify or push repository contents. Manual changes to generated files should be reviewed as regular repository updates.

<!-- DOCS-AUTO:END -->
