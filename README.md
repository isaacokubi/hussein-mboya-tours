# Global Tours

Kenya-focused, multi-tenant tours & travel SaaS for tour operators, with tenant isolation, bookings, payments, finance/accounting, compliance, hospitality/operations, website integrations, RBAC and production safeguards.

## Current status

**Application verification baseline:** commit `8f9e90bb`  
**Verification date:** 2026-09-21  
**Repository branch:** `main`

The latest full local verification was completed after the production-audit remediation. Code-level checks and local release gates passed. Production launch certification is **not yet complete** because several acceptance gates require evidence from the actual deployment/provider environment.

### Latest verification results

| Area | Result | Evidence |
|---|---|---|
| Server install | PASS | npm install completed; 0 vulnerabilities |
| Server static checks | PASS | `npm run check:all` |
| Backend automated tests | PASS | 95 tests: 92 passed, 0 failed, 3 intentionally skipped |
| Security tests | PASS | 4 passed, 0 failed, 0 skipped |
| Tour-domain tests | PASS | 5 passed, 0 failed |
| Targeted regression tests | PASS | 8 total: 5 passed, 0 failed, 3 intentionally skipped |
| RBAC normalization dry run | PASS | 19 role groups; 0 groups requiring normalization |
| Client install | PASS | 0 vulnerabilities |
| Client lint | PASS | `npm run lint` |
| Client production build | PASS | Vite production build completed |
| Production readiness contract | PASS | `npm run check:production` |
| Live production certification | NOT VERIFIED | External deployment/provider evidence still required |

### Intentionally skipped integration tests

The following tests were skipped because they require the database/provider runtime conditions that are not available in the local verification environment:

- airport-transfer payment completion atomic lifecycle;
- tour lifecycle transactional capacity reservation/release;
- payment-completion rollback when accounting posting fails.

A skipped test is not treated as a failure or as production acceptance.

## Production acceptance still required

### API startup and deployment health

The API binds Render's `PORT` before connecting to MongoDB or running the critical invoice-index migration. `/api/health` stays reachable during startup and reports `starting` or `degraded` with the actual Mongoose connection state; it reports `healthy` only after MongoDB is connected and the required migration completes. Database-backed routes return 503 until then. A failed database connection or invoice-index migration terminates the process, and the startup migration has a bounded 60-second default (configurable up to 120 seconds).

Render must provide `MONGODB_URI`, a production-strength `JWT_SECRET`, HTTPS `CLIENT_URL`/`CLIENT_ORIGINS`, and the real `PLATFORM_HOST`. Cloudinary credentials are optional; without them the API still starts, and upload/image deletion endpoints that need Cloudinary fail closed with HTTP 503. Its frontend service must set `VITE_API_URL` to the public API origin followed by `/api` and `VITE_SOCKET_URL` to that API origin. These deployment values belong in Render's environment settings, not in this repository. The GitHub API smoke check allows up to 120 seconds for transient startup/network readiness and still requires HTTP 200 with `success=true`, `status=healthy`, and `database=connected`.

The production API and web endpoint results remain **NOT VERIFIED** until the configured GitHub Actions checks succeed against the live services. Vercel deployments must set the same build-time `VITE_API_URL` and `VITE_SOCKET_URL` values in the Vercel project environment; `vercel.json` intentionally contains no deployment hostname.

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
- **Current commit:** `336038c9c43f9e504b3638e605cfdcab476a7003`
- **Short commit:** `336038c`
- **Documentation snapshot date (UTC):** 2026-09-23
- **Server package:** `hussein-mboya-tours-server@1.0.0`
- **Client package:** `client@0.0.0`
- **Server verification commands:** `npm run check:all`, `npm test`, `npm run test:security`, `npm run test:tour-domain`
- **Client verification commands:** `npm run lint`, `npm run build`
- **Production contract:** `npm run check:production`
- **Release rule:** production certification requires current deployment/provider evidence; local or CI source checks alone do not certify live production.

### Documentation automation

The workflow has read-only repository permissions and does not modify or push repository contents. Manual changes to generated files should be reviewed as regular repository updates.

<!-- DOCS-AUTO:END -->
