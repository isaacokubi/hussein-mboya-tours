# Production Readiness Test Baseline

## Purpose

This document is the persistent hand-off point for production-readiness testing. Future engineers, agents, CI jobs, and release reviews must begin from the current `main` history and this evidence record. Every completed test must be recorded with its result and evidence. A test must never be marked PASS solely from source-code inspection when live infrastructure or a third-party provider is required.

## Current verified repository state

- Current `main` application/documentation head at the time of this record: `d60fec35e895d42eed3f49e26c8da1f03226e479`.
- Latest CI run verified before this documentation update: `34990056154`.
- CI jobs passed: **Server production checks**, **Live tenant isolation regression**, and **Client lint and production build**.
- Production smoke run: `34990056067` — **PASS**.
- Production MongoDB backup run: `34993023892` — **PASS**.

Documentation-only commits that follow do not invalidate the application test evidence above, but the complete CI gate must be rerun after material application changes.

## Verified test matrix

| Area | Test | Result | Evidence / acceptance |
|---|---|---:|---|
| Backend | Syntax, security, RBAC and multitenancy checks (`npm run check:all`) | PASS | CI `34990056154` |
| Backend | Automated test suite (`npm test`) | PASS | CI `34990056154` |
| Multi-tenancy | Live tenant isolation regression (`npm run check:multitenancy:live`) | PASS | CI `34990056154` |
| Frontend | ESLint (`npm run lint`) | PASS | CI `34990056154` |
| Frontend | Production build (`npm run build`) | PASS | CI `34990056154` |
| Release gate | Security and tenant integrity phase | PASS | Previously certified release gate `34942492468`; current CI remains green |
| Release gate | Kenya production readiness phase | PASS | Previously certified release gate `34942492468`; current CI remains green |
| Release gate | Final release gate phase | PASS | Previously certified release gate `34942492468`; current CI remains green |
| Production API | `/api/health` | PASS | Live HTTP 200; `success=true`, `status=healthy`, `database=connected` |
| Production API | `/` root endpoint | PASS | Live HTTP 200; expected Travel API success message |
| Production web | Vercel site endpoint | PASS | Live HTTP 200 |
| Production smoke | API health + API root + website smoke workflow | PASS | GitHub Actions run `34990056067` |
| Backup | Encrypted MongoDB archive creation | PASS | GitHub Actions run `34993023892` |
| Backup | Artifact upload and retention | PASS | Artifact `production-mongodb-backup-34993023892.zip`, ID `10405803526` |
| Backup | Decrypt + gzip integrity verification | PASS | Backup workflow completed successfully |

## Live tenant isolation evidence

The production API was checked with and without tenant context:

- **Missing tenant context:** HTTP 400 with `Tenant context is required`. This is the expected secure behavior; production does not silently select a default tenant.
- **Amani Trails Safaris:** HTTP 200 with tenant context.
- **Savanna Crown Safaris:** HTTP 200 with tenant context.
- **Coastal Horizon Adventures:** HTTP 200 with tenant context.

These checks establish the current production tenant-resolution behavior for the tested endpoints. They do not replace route-by-route authorization testing.

## Production smoke evidence

The production smoke workflow is configured to validate the API health contract, the API root contract, and the production website response. The successful run `34990056067` completed the smoke job successfully.

The live API also returned the deployed application version `73a5127695b2b8461c50ec034420af252881b5e6` at the time of testing. Current `main` is `d60fec35e895d42eed3f49e26c8da1f03226e479`, so **deployment currency is not yet certified against current main**. This is a deployment-state observation, not a claim that the current code is running in production. Vercel and Render were previously intentionally disconnected from GitHub and should not be reconnected unless explicitly requested.

## Production backup evidence

Run `34993023892` completed successfully.

- Encrypted MongoDB archive created using AES-256-CBC with PBKDF2.
- SHA-256 checksum generated for the archive.
- GitHub Actions artifact uploaded successfully.
- Artifact name: `production-mongodb-backup-34993023892.zip`.
- Artifact ID: `10405803526`.
- Artifact size: `90415` bytes.
- Artifact SHA-256: `131828e2f91a2ff12e205a3a35de4133584b70cfab30561c286b277258dfd281`.
- The workflow decrypted the encrypted archive and passed `gzip -t` integrity verification.
- The run contained non-blocking Node runtime deprecation warnings; the backup job itself completed successfully.

The backup workflow requires `MONGODB_BACKUP_URI` and `BACKUP_ENCRYPTION_PASSPHRASE`. Their values are never documented here.

## Nine production-readiness areas

### 1. End-to-end booking and payment

**Automated baseline: PASS.** Payment lifecycle safeguards and reconciliation infrastructure are covered by the repository readiness checks.

**Live acceptance still required:** real M-Pesa/Daraja and/or configured payment-provider transaction, STK completion, callback, booking update, invoice/payment record, accounting/reconciliation, duplicate callback protection, failed/expired payment, cancellation and refund behavior.

### 2. Kenyan business compliance

**Automated baseline: PASS.** Tax configuration, invoice/receipt infrastructure, eTIMS integration architecture, reconciliation services and related readiness checks are present.

**Live acceptance still required:** KRA/eTIMS production onboarding, credentials, submission and receipt/control-number evidence, confirmed tax configuration, and applicable TRA/ODPC/business obligations.

### 3. Multi-tenant isolation

**Automated baseline: PASS.** Tenant-scoped models, tenant resolution/context, authorization safeguards and live isolation regression checks are passing.

**Future regression scope:** read/create/update/delete, reporting, payment, booking, user, vehicle, guide, dashboard and export paths across multiple tenants.

### 4. Subscription enforcement

**Automated baseline: PASS.** Trial expiry, paid expiry/grace behavior, suspension/recovery, billing access and plan/feature enforcement are represented in readiness checks.

**Future regression scope:** verify every protected feature honors the same subscription state and SuperAdmin recovery controls remain available.

### 5. Security hardening

**Automated baseline: PASS.** Authentication, RBAC, tenant authorization, security headers, validation, rate limiting, CORS, secure uploads, webhook security, environment validation and production safeguards are covered by the release checks.

**Future regression scope:** every new route, role, integration, upload path, webhook and privileged action.

### 6. Financial/accounting reliability

**Automated baseline: PASS.** Tenant-scoped payments, invoices, expenses, accounting/subledger models, reconciliation services, reporting, audit metadata and Kenya financial infrastructure are represented in production-readiness checks.

**Live/future acceptance:** reconcile payments against bookings, invoices, refunds, expenses, taxes, balances, exports and reports using isolated tenant fixtures and real transactions where applicable.

### 7. Production error handling

**Automated baseline: PASS.** Centralized errors, response utilities, validation, health/diagnostic services and production resilience infrastructure are included in the readiness surface.

**Future regression scope:** unavailable databases, provider failures, malformed callbacks, expired sessions, network failures, missing configuration and unexpected errors. Responses must not leak secrets or stack traces.

### 8. Deployment, backup and monitoring

**Backup execution: PASS.** Encrypted production MongoDB backup and integrity verification passed in run `34993023892`.

**Production smoke: PASS.** API and website smoke passed in run `34990056067`.

**Still pending:** isolated restore drill, real monitoring/alert firing test, and deployment acceptance against the intended current release.

### 9. UI/UX and device acceptance

**Automated baseline: PASS.** Client lint and production build passed in CI.

**Still pending manual acceptance:** customer booking, payment states, admin, finance/accounting, tour manager, driver, SuperAdmin, responsive navigation, mobile layouts, loading/empty/error states, accessibility, performance and browser/device compatibility.

## Pending test register

| Test | Status | Required evidence |
|---|---|---|
| Isolated MongoDB restore drill | PENDING | Successful restore to explicitly isolated non-production target plus validation queries |
| Production monitoring/alert test | PENDING | Alert generated, delivered and resolved/acknowledged |
| Real M-Pesa STK → callback → booking → reconciliation | PENDING | Real provider transaction and matching application/accounting records |
| Duplicate M-Pesa callback protection | PENDING | Provider-supported callback replay/idempotency evidence with no duplicate financial effect |
| Failed/expired M-Pesa | PENDING | Payment remains non-paid and booking/accounting remain consistent |
| Live KRA/eTIMS submission | PENDING | Successful live submission plus KRA/eTIMS receipt/control-number evidence |
| Full browser/device acceptance | PENDING | Desktop + mobile evidence across customer and operational roles |

If a required provider credential, onboarding step or external service is unavailable, record the item as **BLOCKED** with the missing prerequisite rather than PASS or FAIL.

## Required future test procedure

1. Read this document and the root `README.md` before testing.
2. Pull the current `main` branch and record its HEAD SHA.
3. Run the existing CI/release gate before changing application code.
4. Treat only the evidence in this matrix as established PASS evidence.
5. Investigate regressions, newly added code paths and pending external acceptance items.
6. For a regression, fix the code, rerun the affected test, then rerun the complete release gate.
7. After a materially changed application baseline is re-certified, update this document and `README.md` with the new passing run ID and commit SHA.
8. Never mark live provider, compliance, backup/restore, monitoring or deployment acceptance as PASS solely because repository CI passed.
9. Never record secrets, passwords, tokens, private keys or full provider credentials in this documentation.

## Release decision rule

A passing repository release gate means the **codebase baseline is passing automated readiness checks**. It is not by itself a declaration that every external production prerequisite is complete. Commercial launch requires the pending external evidence to be completed or explicitly accepted as out of scope.

## Historical evidence

- Subscription hardening: `b077f25a698322f1d0f95c804a9ee001f0ee573f`
- Production-readiness contract coverage: `088d4b27cc1ce03c4eb9a2923449c3e5c76fe79c`
- Calendar lint repair: `46e11bcffe0f2069ef1446bd21a2ad3dc79d3b80`
- Temporary lint repair workflow removed: `9fee53c1ed8d6ce95cf4a9177d719666d4f8ad0c`
- Verified passing application release gate: `34942492468`
- Current CI verification: `34990056154`
- Production smoke verification: `34990056067`
- Production encrypted backup verification: `34993023892`
