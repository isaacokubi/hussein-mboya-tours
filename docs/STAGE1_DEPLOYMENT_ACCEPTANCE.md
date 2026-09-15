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
3. Performs a lightweight HTTP check against the public web URL.
4. Runs on pushes to `main`, every six hours, and manually through GitHub Actions.
5. Skips an external check when its secret is not configured, so repository CI remains usable before deployment.

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

- [x] Release gate baseline exists and is documented.
- [x] Production API health endpoint exists at `/api/health`.
- [x] Production smoke workflow committed to `main`.
- [x] `PRODUCTION_API_URL` configured as a GitHub Actions secret.
- [x] `PRODUCTION_WEB_URL` configured as a GitHub Actions secret.
- [ ] Deployed API returns healthy/connected from the smoke workflow.
- [ ] Deployed frontend responds successfully from the smoke workflow.
- [ ] Production backup and restore evidence collected.
- [ ] Production monitoring/alerting evidence collected.

The unchecked items require access to the actual deployment/provider accounts and cannot be truthfully certified from source code alone.
