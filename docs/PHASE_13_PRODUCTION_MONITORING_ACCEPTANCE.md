# Phase 13 — Production Monitoring & Observability Acceptance

## Scope

Phase 13 hardens the production monitoring path so uptime checks also enforce explicit latency budgets and retain a repeatable alert-delivery drill.

## Completed

- Production API and website monitoring continue to run every 15 minutes.
- Production endpoints are required to use HTTPS.
- API and website latency are measured for every monitoring run.
- Configurable latency budgets are enforced: `PRODUCTION_API_MAX_LATENCY_MS` and `PRODUCTION_WEB_MAX_LATENCY_MS`.
- Defaults are 5000 ms when repository/environment variables are not supplied.
- A failed monitoring run creates a deduplicated GitHub issue alert.
- `workflow_dispatch` supports `simulate_failure=true` so the alert path can be tested without changing production.
- Added `server/tests/productionMonitoringAcceptance.test.js` for the monitoring workflow contract.
- Added the phase to the release gate and stored test queue.

## External evidence boundary

Source control can prove the monitoring workflow is configured with health checks, latency thresholds and an alert path. It cannot prove that:

- production URLs are configured;
- the scheduled workflow is actually executing successfully;
- alert notifications are reaching the intended operators;
- observed production latency meets the buyer's SLA over time.

Those require a real deployment and an executed monitoring/alert drill.

## Required verification

    cd server
    node --test tests/productionMonitoringAcceptance.test.js

For the real alert-path drill:

1. Open GitHub Actions → Production Monitoring.
2. Run the workflow manually with `simulate_failure=true`.
3. Confirm the run fails intentionally.
4. Confirm a `Production monitoring alert` issue is created or an existing open alert is reused.
5. Close the alert after investigation.
6. Run the normal monitoring workflow and confirm a successful production check.
7. Record timestamps, URLs/environment, latency, workflow run and alert issue reference in the deployment evidence.

Do not mark `PRODUCTION_MONITORING_VERIFIED=true` until this external drill and the normal production monitoring check have actually completed.

## Exit condition

Phase 13 is complete in source control when the monitoring contract, workflow hardening, test and documentation are merged into `main`. It is not equivalent to production monitoring certification.