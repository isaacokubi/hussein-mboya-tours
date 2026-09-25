# Global Tours — Production Readiness

## Current application baseline

**Verification date:** 2026-09-25
**Verification scope:** complete system audit of local `main` at source commit `3e59ccad0cf5838a3a96fa6dd6a53a3ff6e834ae`; audit evidence is recorded in `TEST_EVIDENCE.md`. Node `v24.18.0` and npm `11.16.0` were used. This audit did not verify live deployments or external integrations.

The repository is **NOT READY** for a real tenant until the expanded MongoDB replica-set lifecycle test runs successfully and external service evidence is collected. A historical 2026-09-25 read-only probe returned HTTP 200 for Render root and `/api/health` and HTTP 200 HTML for Vercel. The API health body, CORS behavior and deployed commit were not established; a follow-up probe failed DNS resolution. Those observations were not repeated in this audit.

See [First Tenant Production Acceptance](FIRST_TENANT_ACCEPTANCE.md) for the environment matrix, secure onboarding procedure and external evidence boundary. Public tenant creation and browser-based bootstrap are disabled; tenant provisioning requires platform-owner authorization.

## Verification matrix

| Area | Status | Evidence |
|---|---|---|
| Server static/security/production checks | PASS | Node 24.18.0 `npm run check:all` completed successfully. |
| Backend automated suite | PASS with skips | Node 24.18.0 `npm test`: 136 total, 131 passed, 0 failed, 5 skipped. |
| Tour-domain / security | PASS | Tour-domain: 1 test passed; security: 2 passed. |
| Client lint/build | PASS | Node 24.18.0 `npm run lint` and `npm run build` with explicit HTTPS API/socket build URLs. |
| Dependency audit | PASS | Server and client `npm audit` each reported 0 vulnerabilities; client `npm ls --depth=0` resolved its declared dependency tree. |
| MongoDB version contract | PASS | Unit tests accept MongoDB 4.2+, reject 4.0/3.6/unknown. Mongoose 8.24.1 compatibility table supports 4.2; CI target remains MongoDB 8. |
| First-tenant replica-set acceptance | UNVERIFIED | Expanded lifecycle is wired to the MongoDB 8 CI replica set; this local machine has MongoDB 3.6.8 and no Docker runtime. |
| Live MongoDB tenant-isolation regression | UNVERIFIED | Must run against MongoDB 4.2+ on a replica set; CI deliberately targets MongoDB 8. No compatible local replica set is available. |
| Live API / frontend | NOT VERIFIED | No live endpoint, CORS, or deployed SHA check was performed in this audit. |
| Production runtime readiness | BLOCKED | Runtime check correctly rejects missing deployment-only configuration/evidence; see external gates below |
| Production launch certification | NOT VERIFIED | External deployment/provider evidence remains |

## Latest remediation covered by the verification

### API startup and health behavior

The API binds to the platform-provided `PORT` before MongoDB connection and invoice-index migration begin. `/api/health` bypasses tenant resolution and rate limiting, responds promptly during startup, and reports `starting`/`degraded` plus the actual database connection state. It reports healthy only when the application startup migration has completed and Mongoose is connected. Database-backed routes return 503 until that point. MongoDB selection is bounded to 10 seconds by default; invoice-index migration is bounded to 60 seconds by default and remains a critical startup operation whose failure terminates the process. Background schedulers start only after database readiness and do not delay the listener.

The production smoke and monitoring workflows share a bounded readiness probe. It requires an HTTPS origin in `PRODUCTION_API_URL`, retries transient startup/unreachable responses and database disconnects in an otherwise-ready process for at most 120 seconds, and fails immediately when critical startup has failed. Success still requires the exact healthy/connected response. The probe does not certify the live deployment by itself; current production status remains **NOT VERIFIED** until GitHub Actions receives that response from the configured Render service.

Cloudinary is an optional media provider and is not contacted during API startup. Without all three Cloudinary credentials, media upload and deletion operations fail closed with HTTP 503; database-backed API readiness is unchanged.

- JWT issuer/audience validation is enforced consistently.
- Browser authentication uses secure HttpOnly session cookies with CSRF protection.
- Legacy browser JWT persistence and the dedicated browser M-Pesa bearer-token path were removed.
- Upload validation checks extension/MIME agreement, filename safety and tenant media scoping.
- Accounting chart-of-accounts cache entries have bounded lifetime.
- RBAC canonicalization is tenant-aware and dry-run-first; the final dry run reported zero groups requiring normalization.
- M-Pesa refund callback handling enforces tenant context before payment lookup/mutation.
- Tenant URL resolution rejects unknown explicit tenant selectors rather than silently resolving another tenant; tenant-origin CORS is tied to a registered tenant subdomain, custom domain or active website integration origin.
- Raw customer/user/tour/staff/vehicle lookups used in tenant booking administration include tenant scope.
- Tenant-scoped Mongoose update pipelines reject string-form tenantId removal and document-root replacement/projection; aggregate tenant enforcement also descends into facet, lookup and union subpipelines.
- Production API errors now suppress internal exception details while preserving explicitly safe client-facing payment-configuration errors.
- M-Pesa callback completion requires a correlated payment, valid provider status and tenant context; failed callbacks are validated as well as successful callbacks.
- Legacy/global M-Pesa credentials require explicit opt-in outside production; production can never use the global fallback.
- eTIMS invoice/note synchronization only records success when the normalized provider response explicitly succeeds and includes provider reference data.
- Production readiness now requires a configured platform hostname and the deployment's external evidence flags.
- Documentation CI uploads a generated snapshot artifact with read-only repository permissions; it no longer commits or pushes changes to `main`.

Historical live tenant-isolation results belong to their recorded commits and do not certify the current local source. The first-tenant lifecycle and MongoDB-connected startup cases were skipped, not passed. Local MongoDB is 3.6.8; Docker is unavailable. The health/readiness tests passed when run with loopback-listener permission; the initial sandbox run was blocked by `EPERM`.

## Intentionally skipped local integration tests

These are skipped by the local suite and require provider/database capabilities or dedicated integration harnesses:

1. first-tenant onboarding and cross-tenant API acceptance against a disposable MongoDB replica set;
2. MongoDB-connected startup and invoice-index readiness;
3. airport-transfer payment completion atomic lifecycle;
4. tour lifecycle transactional capacity reservation/release;
5. payment-completion rollback when accounting posting fails.

They must be exercised against the intended deployment before being used as production evidence.

## External acceptance gates

### Deployment

**Current-main production deployment:** NOT VERIFIED

**Status: NOT VERIFIED**

The deployed production environment must report the intended current `main` commit before current-main launch certification can be claimed.

The production runtime readiness check was explicitly exercised with `NODE_ENV=production`. It rejected the runtime because the required deployment-specific eTIMS/webhook encryption secrets, HTTPS client origins, platform hostname and evidence flags were unavailable in that invocation. No credential values are included here. The local non-production `.env` is not evidence that production is configured.

### M-Pesa

**M-Pesa sandbox callback:** PENDING

**Status: PENDING external evidence**

Required:

- callback receipt on an approved HTTPS target;
- callback integrity and tenant validation;
- successful payment completion;
- booking status transition;
- invoice/payment journal/accounting reconciliation;
- duplicate callback/idempotency replay;
- failed/expired payment behavior.

STK initiation alone does not prove payment completion.

### eTIMS/KRA

**Live KRA/eTIMS submission:** PENDING

**Status: PENDING external evidence**

The application boundary now fails closed unless the provider returns explicit success plus invoice and receipt references. Required production onboarding/configuration and an actual submission receipt/control number remain external evidence; source-code checks are not KRA certification.

### Browser acceptance

**Status: PENDING**

Manual desktop/mobile acceptance remains required for customer, Admin, Finance, Tour Manager, Driver and SuperAdmin workflows.

### Data integrity

**Status: PENDING**

A read-only production MongoDB integrity/reconciliation scan must be completed against the intended deployed release.

## Acceptance rules

- **PASS:** required test ran and evidence exists.
- **FAIL:** test ran and expected behavior was not met.
- **BLOCKED:** an external prerequisite prevents execution.
- **PENDING:** required test/evidence has not yet been completed.
- **NOT VERIFIED:** an observation exists but does not prove the acceptance criterion.

Never record passwords, tokens, private keys, MFA PINs, M-Pesa secrets/passkeys or other credentials in documentation.

<!-- DOCS-AUTO:START -->
## Current repository state

This section is maintained by `scripts/update-documentation.js`. The GitHub Actions workflow uploads a generated snapshot artifact for review.

- **Repository:** Global Tours — multi-tenant tours & travel SaaS
- **Branch:** `main`
- **Current commit:** `9b594ee8297d35400083a3ebe7af2ef7659ad40b`
- **Short commit:** `9b594ee`
- **Documentation snapshot date (UTC):** 2026-09-25
- **Server package:** `hussein-mboya-tours-server@1.0.0`
- **Client package:** `client@0.0.0`
- **Server verification commands:** `npm run check:all`, `npm test`, `npm run test:security`, `npm run test:tour-domain`
- **Client verification commands:** `npm run lint`, `npm run build`
- **Production contract:** `npm run check:production`
- **Release rule:** production certification requires current deployment/provider evidence; local or CI source checks alone do not certify live production.

### Documentation automation

The workflow has read-only repository permissions and does not modify or push repository contents. Manual changes to generated files should be reviewed as regular repository updates.

<!-- DOCS-AUTO:END -->
