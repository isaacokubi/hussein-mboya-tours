# Master remediation progress — 2026-11-04

## Current state

**NOT PRODUCTION READY.** Current branch `codex/global-tours-remediation-2026-11-04` includes current GitHub `main` SHA `5ac913bd96504927c9bbfb0a9e10a620e7ecf82d` via merge commit `607eae4`. Commits are pushed and draft PR #223 is open against `main`; the newest CI run must complete before the PR can be considered green. No deployment was made.

## Completed repository work

- **FIXED:** startup retries database connection and critical initialization without terminating the HTTP listener.
- **FIXED:** process liveness is separated from database/startup readiness; legacy `/api/health` remains readiness-compatible.
- **FIXED:** startup migration timeout cannot launch concurrent retry work while the timed-out operation is still active.
- **FIXED IN CODE:** backup workflow now checksum-checks and decrypts the archive, performs an actual isolated restore, validates critical readable collections/indexes/tenant references, and uploads only the encrypted archive and checksum after validation.
- **FIXED IN CODE:** MongoDB readiness failure collects bounded container diagnostics.
- **FIXED IN CODE:** monitoring recovery closes duplicate open monitoring alerts after API, readiness, and website checks pass.
- **FIXED:** compatible server/client dependency updates removed all critical and high severity advisories (last recorded audit: 2 moderate server, 19 moderate/2 low client findings; audit not rerun in this turn).
- **FIXED:** the live multitenancy script now requires a dedicated `LIFECYCLE_TEST_MONGODB_URI`; using fake-data `husseindb` requires a one-command explicit authorization flag. Its authorized run created and removed only uniquely named fixtures.
- **FIXED:** monitoring retries the startup failure state during its configured wait and does not cancel an in-progress failure check when a new scheduled run starts.
- **FIXED:** current-main Resend key-rotation logic now honors the test client's active test key; focused provider mock tests pass 5/5 without making a provider call.

## Commands executed

| Command | Result |
|---|---|
| `node --test tests/healthReadiness.test.js` in `server` with loopback permission and disposable MongoDB 8 | **4 passed, 0 failed, 0 skipped**. |
| `npm test` in `server` with loopback permission | **310 passed, 0 failed, 5 skipped**. |
| `npm run check:all` in `server` after final edits | **PASS**. |
| `npm run lint` in `client` after clean lockfile install | **PASS**. |
| `VITE_API_URL=https://api.example.invalid/api VITE_SOCKET_URL=https://api.example.invalid npm run build` in `client` after compatible lockfile update | **PASS**. |
| Live tenant isolation regression on authorized fake-data `husseindb` | **17 passed, 0 failed**; named fixtures cleaned in teardown. |
| Focused Resend mock tests after merging current main | **5 passed, 0 failed**; no provider call. |
| `npm audit --json` current advisory data | Server **0 critical/0 high/2 moderate**; client **0 critical/0 high/8 moderate/2 low**; both exit nonzero because moderate advisories remain. |
| `git diff --check` | Rerun required after final documentation edits. |
| Synthetic encrypted backup/restore against disposable MongoDB 8 (previous recorded result) | **PASS** in prior evidence; not recreated this turn. |
| Production workflows / live production API / actual archive / M-Pesa Sandbox / Playwright | **NOT RUN**. |

The initial sandbox run failed because loopback binding returned `EPERM`; the backend suite and readiness test passed when run with loopback access. Startup readiness used disposable local MongoDB 8 and cleaned its random test database namespace. The live tenant regression used only the user-authorized fake-data database and removed its fixture IDs in teardown.

## GitHub review

The cited monitoring run failed its API health/readiness step and skipped the website check. The backup run created the encrypted archive, then failed at temporary MongoDB validation; upload was skipped. Current issue state confirms #221 and #145 are still open. The workflow closes matching alerts after recovery, but it has not run.

Current open PRs are #223, #222, #220, #210, #209, #198, #190, #186, #184, #183, #182, #174, #148, #130, #102, #100, #99, #97, and #96. No unrelated PR was merged or closed. #222 overlaps the incorporated M-Pesa offline test/CI workflow; #220 overlaps CI and M-Pesa status/checkout code; #198 overlaps lockfiles and readiness documentation; #209/#210 duplicate a hotel-controller fix; dependency PRs overlap the lockfiles; #148 is a broad acquisition change. Full unrelated patch review remains outstanding.

PR #223's first CI run failed in the backend test job because the current-main Resend client-rotation code bypassed the test stub, and the live-isolation job failed before its test step while GitHub initialized its Mongo service. The Resend injection was fixed; explicit test URIs were added for live isolation and health. A fresh CI run is required.

The isolated offline test portion of PR #222 was reviewed and incorporated as `server/tests/mpesaOfflineSimulation.test.js` (4/4 tests pass). Its proposed MongoDB 8→7.0 CI downgrade was not copied because it is unrelated to the test coverage and would change the repository's MongoDB 8 integration target. PR #222 itself remains open and unmerged.

## Remaining work by gate

- **BLOCKED EXTERNALLY:** run production smoke and monitoring against the correct deployed SHA; verify alert creation and recovery against GitHub Actions.
- **BLOCKED EXTERNALLY:** run encrypted backup and restore drill with the actual protected archive and isolated restore target; collect business data, index, RPO/RTO, and retention evidence. The synthetic restore does not verify production archive contents or credentials.
- **BLOCKED EXTERNALLY:** inspect/rotate production database principal to least privilege through authorized Atlas/Render access.
- **BLOCKED EXTERNALLY:** complete tenant-configured Daraja Sandbox STK/callback/idempotency/refund/reconciliation lifecycle; no real or production payment was initiated.
- **BLOCKED EXTERNALLY:** verify staging/browser role workflows, email recovery, KRA/eTIMS, webhook consumers, production deployment, and operational rollback.
- **NOT TESTED:** complete the exhaustive finance, hotel/tour/fleet/supplier, SaaS billing, AI, auth recovery, mobile/browser and P0 cross-tenant test matrix.
- **NOT TESTED:** complete the full patch review and reconciliation of unrelated open PRs; no unrelated merge is claimed.
- **TESTED:** dependency vulnerability audit (`npm audit`); zero critical/high findings, with 2 server moderate and 8 client moderate/2 low findings remaining.
- **BLOCKED EXTERNALLY:** wait for the fresh PR #223 CI results; production workflow verification remains external.

## Next actions

1. Wait for PR #223 CI to rerun after the current-main merge, Resend test injection fix, and explicit isolated test database configuration; review and merge through GitHub only after checks pass.
2. Run the updated production backup and restore workflows with a dedicated restore target and protected secrets.
3. After approved deployment, run production smoke/monitoring; verify recovery closes #221 and #145.
4. Configure a separate isolated Sandbox environment and run provider acceptance without production data.
5. Complete full patch review of unrelated PRs, security review, remaining business workflow and browser acceptance; update this register with evidence rather than implementation assumptions.
