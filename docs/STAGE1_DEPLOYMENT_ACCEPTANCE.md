# Stage 1 — Deployment & Infrastructure Acceptance

This document records the remote production-readiness setup that can be completed from GitHub without exposing production secrets in the repository.

## Automated baseline

The repository already has a passing three-phase release gate covering backend checks/tests, Kenya readiness contracts, frontend lint/build, release configuration and committed-secret scanning. Stage 1 does not replace that baseline; it adds production endpoint smoke coverage.

## GitHub Actions production smoke checks

Workflow: `.github/workflows/production-smoke.yml`

Configure these **GitHub Actions repository secrets** only when the corresponding service is deployed:

- `PRODUCTION_API_URL` — base URL of the deployed Express API, for example `https://api.example.com`
- `PRODUCTION_WEB_URL` — public frontend URL, for example `https://app.example.com`

The workflow:

1. Calls `${PRODUCTION_API_URL}/api/health`.
2. Requires HTTP success and JSON values `success=true`, `status=healthy`, and `database=connected`.
3. Requires `PRODUCTION_API_URL` to be an HTTPS origin (scheme and hostname only; no `/api` path, credentials, query or fragment).
4. Retries transient connection failures, explicit `starting` responses, and database disconnects during an otherwise-ready process for at most 120 seconds. Critical startup failure responses fail immediately; success still requires the exact healthy/connected contract.
5. Confirms `GET /` still responds with `Travel API running successfully`.
6. Runs on pushes to `main`, every six hours, and manually through GitHub Actions.
7. Skips an external check when its secret is not configured, so repository CI remains usable before deployment.

The workflow also performs a lightweight HTTP check against the public web URL.

The API binds its HTTP listener before MongoDB connection and the critical invoice-index migration. `/api/health` is served before tenant/database-backed middleware so it responds promptly and accurately reports `starting`, `degraded`, or `healthy`. Database-backed routes remain unavailable until required startup work succeeds. The default MongoDB server-selection bound is 10 seconds and the invoice-index migration bound is 60 seconds; failures remain fatal to the service.

For Render, set the backend's `MONGODB_URI`, strong `JWT_SECRET`, dedicated payment/webhook encryption keys, HTTPS `CLIENT_URL` and `CLIENT_ORIGINS`, and actual `PLATFORM_HOST`. Set the static frontend's `VITE_API_URL` to the public API origin ending in `/api`; set `VITE_SOCKET_URL` to the API origin or allow the client to derive it from `VITE_API_URL`. These values must not be committed to the repository. The deployed current source remains **NOT VERIFIED** until the live GitHub Actions smoke check passes.

Cloudinary is optional for API startup. If credentials are absent or incomplete, upload and deletion paths that require Cloudinary return HTTP 503; `/api/health` continues to reflect MongoDB and critical startup readiness only.

## Production environment controls

Before enabling live acceptance, configure the deployment environment from `server/.env.example`. In production, development fallbacks must remain disabled, especially:

- `ALLOW_SINGLE_TENANT_DEV_FALLBACK=false`
- `ALLOW_GLOBAL_MPESA_FALLBACK=false`

Set the production client/API origins and required encryption/signing keys. Do not commit any real credentials.

The following evidence flags must remain `false` until the corresponding real-world control has actually been completed:

- `PRODUCTION_BACKUP_VERIFIED`
- `PRODUCTION_MONITORING_VERIFIED`
- `PRODUCTION_PAYMENT_VERIFIED`
- `PRODUCTION_ETIMS_VERIFIED`
- `PRODUCTION_RESTORE_TESTED`
- `PRODUCTION_WEBHOOKS_VERIFIED`

These flags are evidence controls, not substitutes for the underlying live tests.

## Stage 1 exit criteria

Live endpoint observation found the Render API responding healthy/connected at deployed version `aabbe5b2feddcf844c187b57f5934d9a16fadb00`. The local startup/readiness fix is newer and is not yet deployed; current-source production acceptance remains unverified. See [First Tenant Production Acceptance](FIRST_TENANT_ACCEPTANCE.md) for required deployment values and evidence.

- [x] Release gate baseline exists and is documented.
- [x] Production API health endpoint exists at `/api/health`.
- [x] Production smoke workflow committed to `main`.
- [x] Smoke workflow reads `PRODUCTION_API_URL` and `PRODUCTION_WEB_URL` only from GitHub Actions secrets.
- [ ] Deployed API returns healthy/connected from the smoke workflow.
- [ ] Deployed frontend responds successfully from the smoke workflow.
- [ ] Production backup and restore evidence collected.
- [ ] Production monitoring/alerting evidence collected.

The unchecked items require access to the actual deployment/provider accounts and cannot be truthfully certified from source code alone.
