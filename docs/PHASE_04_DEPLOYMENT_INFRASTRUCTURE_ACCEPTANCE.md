# Phase 4 — Deployment & Infrastructure Acceptance

## Scope

Phase 4 converts the deployment/infrastructure readiness requirements into a repeatable repository contract and preserves the remaining live deployment checks for later execution.

## Completed

- Added `server/tests/deploymentInfrastructureAcceptance.test.js`.
- Added Phase 4 to the release-gate workflow.
- Verified the production smoke workflow contract covers API health and public frontend availability.
- Verified production smoke checks fail closed when deployment secrets are absent.
- Verified development authentication/payment fallbacks remain disabled in the production environment template.
- Added the Phase 4 execution commands and external evidence requirements to `docs/STORED_TEST_EXECUTION_QUEUE.md`.

## External boundary

The following still require access to the deployed environment/provider accounts and are not claimed as passed:

- deployed API health and database connectivity
- deployed frontend availability
- backup destination and retention
- real restore drill
- monitoring and alert delivery
- payment provider callback acceptance
- eTIMS provider/regulatory acceptance
- signed webhook delivery
- production rollback

The repository intentionally does not mark these evidence controls true merely because source-code contracts exist.

## Stored execution

When a laptop/CI environment is available:

```bash
cd server
npm install
node --test tests/deploymentInfrastructureAcceptance.test.js
```

For live deployment smoke checks, configure only the appropriate GitHub Actions repository secrets:

- `PRODUCTION_API_URL`
- `PRODUCTION_WEB_URL`

Never commit provider credentials or production secrets.

## Exit condition

Phase 4 is structurally complete when the contract is committed and wired into the release gate. Production certification remains dependent on the external evidence listed above.
