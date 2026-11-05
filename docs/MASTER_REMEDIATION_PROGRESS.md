# Master remediation progress — 2026-11-05

## Current state

**NOT PRODUCTION READY.** This follow-up starts from GitHub `main` at `1b5c8aacf340b3728852486400e31b96592fe242` on branch `codex/complete-readiness-2026-11-05`. The working changes are not yet pushed. No deployment or production database mutation was made. The current-main CI run `41960879516` failed to initialize its MongoDB 8 service on GitHub's latest runner kernel; its tour integration step remained stuck in an unbounded MongoDB startup loop. Production smoke run `41960879541` observed HTTP 503, followed by successful monitoring run `41963125543`, which passed API readiness and website checks and closed alerts #221 and #145. Latest backup run `41613200034` failed temporary MongoDB validation before artifact upload.

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
- **FIXED:** the release secret scan's false positive on an illustrative Stripe test literal; focused payment-method tests and the exact scan command pass, and the release-gate rerun passed.
- **FIXED IN THIS FOLLOW-UP:** MongoDB 8 workflows use Ubuntu 22.04 because Ubuntu 24.04 also reproduced the MongoDB kernel compatibility startup failure; tour replica-set startup is bounded with diagnostics; CI now runs isolated first-tenant acceptance and uses a database name accepted by its safety guard. Follow-up CI is still required to validate this runner workaround.
- **FIXED IN THIS FOLLOW-UP:** comprehensive demo seeding categorically refuses the application database `husseindb`; Atlas seeding is limited to the explicit disposable `global_tours_test` target. No seed was run.
- **FIXED IN TEST:** first-tenant acceptance now selects the MPESA method enabled by fresh-tenant defaults, while still asserting no provider payment is initiated. The prior test incorrectly selected an unconfigured bank-transfer method.

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
| Current follow-up `server/npm test` | **311 passed, 0 failed, 5 skipped** (316 total). |
| Current follow-up database-backed integration suite, disposable MongoDB 8 replica set | **8 passed, 0 failed, 0 skipped**: health/readiness, first tenant, tour capacity, airport transfer payment, and accounting rollback. |
| Live tenant isolation on authorized fake-data `husseindb` | **17 passed, 0 failed**; generated fixtures removed. |
| Dashboard mobile/checkout Playwright tests | **10 passed** using system Chrome. |
| Tour editor Playwright tests | **5 passed** using local Vite and mocked APIs. |
| Public production catalogue Playwright smoke | **1 passed**; read-only. |
| Public performance smoke | **2 passed** (desktop/mobile); this run sampled approximately 2.6–3.1 sec catalogue API responses and did not test against a published SLA. |
| Synthetic encrypted backup/restore on temporary MongoDB 8 containers | **PASS**: archive checksum, decrypt/gzip integrity, six collection restore, tenant references, indexes, and application-model reads verified. No production archive used. |
| Current dependency audit | **0 critical, 0 high**; server 2 moderate, client 8 moderate and 2 low. |
| Synthetic encrypted backup/restore against disposable MongoDB 8 (previous recorded result) | **PASS** in prior evidence; not recreated this turn. |
| Production workflows / live production API / actual archive / M-Pesa Sandbox / Playwright | **NOT RUN**. |

The initial sandbox run failed because loopback binding returned `EPERM`; the backend suite and readiness test passed when run with loopback access. Startup readiness used disposable local MongoDB 8 and cleaned its random test database namespace. The live tenant regression used only the user-authorized fake-data database and removed its fixture IDs in teardown.

## GitHub review

On current main, the monitoring run at `41963125543` passed health/readiness and website latency; it closed #221 and #145. Earlier same-commit smoke run `41960879541` received HTTP 503. The latest production backup run `41613200034` created an archive but failed temporary MongoDB validation; upload was skipped. Its old workflow did not emit useful container diagnostics. Ubuntu 24.04 reproduced the MongoDB 8 kernel compatibility failure, so MongoDB 8 backup/restore validation now uses Ubuntu 22.04. That is the likely cause of the old backup failure but remains an inference until rerun; the protected archive still needs successful validation.

Current open PRs are #222, #220, #210, #209, #198, #190, #186, #184, #183, #182, #174, #148, #130, #102, #100, #99, #97, and #96. The M-Pesa offline test from #222 is already on main; its MongoDB 7 workaround is replaced here by a supported-runner fix that preserves MongoDB 8. PR #190's seed safety has been implemented here. PR #186's account matrix writes account emails into report output, so it is not accepted as-is. #209/#210 have duplicate patches that delete overlapping controller blocks; current main syntax and tests pass, and neither was merged. #220 and #198 overlap broad checkout/public-site changes; dependency-only PRs need compatibility review; #148 contains a broad Firestore rewrite and is deferred. No unrelated PR was merged or closed in this follow-up.

The previous remediation PR has landed in current main. The follow-up CI fix is not yet pushed, so its GitHub CI result is pending. On main, server production checks and client lint/build passed; live isolation failed before tests while the `mongo:8` service exited on runner kernel 6.19, and the tour job remained in its unbounded readiness loop. A bounded wait, runner pin, safe disposable namespace and first-tenant test invocation are now in this working tree.

The isolated offline test portion of PR #222 was reviewed and incorporated as `server/tests/mpesaOfflineSimulation.test.js` (4/4 tests pass). Its proposed MongoDB 8→7.0 CI downgrade was not copied because it is unrelated to the test coverage and would change the repository's MongoDB 8 integration target. PR #222 itself remains open and unmerged.

## Remaining work by gate

- **TESTED, CURRENT MONITORING:** latest read-only monitor passed and closed alerts #221/#145. **BLOCKED EXTERNALLY:** establish the actual production deployment SHA and confirm recurring monitoring after any approved deployment.
- **BLOCKED EXTERNALLY:** run encrypted backup and restore drill with the actual protected archive and isolated restore target; collect business data, index, RPO/RTO, and retention evidence. The synthetic restore does not verify production archive contents or credentials.
- **BLOCKED EXTERNALLY:** inspect/rotate production database principal to least privilege through authorized Atlas/Render access.
- **BLOCKED EXTERNALLY:** complete tenant-configured Daraja Sandbox STK/callback/idempotency/refund/reconciliation lifecycle; no real or production payment was initiated.
- **BLOCKED EXTERNALLY:** verify staging/browser role workflows, email recovery, KRA/eTIMS, webhook consumers, production deployment, and operational rollback.
- **NOT TESTED:** complete the exhaustive finance, hotel/tour/fleet/supplier, SaaS billing, AI, auth recovery, mobile/browser and P0 cross-tenant test matrix.
- **NOT TESTED:** complete the full patch review and reconciliation of unrelated open PRs; no unrelated merge is claimed.
- **TESTED:** dependency vulnerability audit (`npm audit`); zero critical/high findings, with 2 server moderate and 8 client moderate/2 low findings remaining.
- **BLOCKED EXTERNALLY:** complete new branch CI after pushing; rerun protected production backup and verify an actual restore. Production workflow evidence remains separate from the synthetic local restore.

## Next actions

1. Push this branch and open/update its PR; wait for CI on the pinned Ubuntu runner, fix any failures, and merge only after checks pass.
2. Run the updated production backup and restore workflows with a dedicated restore target and protected secrets.
3. After approved deployment, run production smoke/monitoring; verify recovery closes #221 and #145.
4. Configure a separate isolated Sandbox environment and run provider acceptance without production data.
5. Complete full patch review of unrelated PRs, security review, remaining business workflow and browser acceptance; update this register with evidence rather than implementation assumptions.
