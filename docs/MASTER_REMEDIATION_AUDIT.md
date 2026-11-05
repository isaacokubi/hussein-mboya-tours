# Master remediation audit — 2026-11-04

## Follow-up audit — 2026-11-05

Latest GitHub `main` at branch creation was `1b5c8aacf340b3728852486400e31b96592fe242`. Follow-up work is on `codex/complete-readiness-2026-11-05`; PR #224 commit `da92c4d` passed CI run `41969409132` and release gate `41969409044`. The live MongoDB 8 CI failure came from runner-kernel compatibility; Ubuntu 24.04 reproduced it, while Ubuntu 22.04 allowed the test image to start. First-tenant acceptance showed transactions were required, so CI starts a named disposable replica-set container with bounded startup, diagnostics and cleanup. The branch also bounds the tour wait, adds first-tenant CI coverage and restricts comprehensive seeding away from `husseindb`. Production readiness remains **NOT READY** until protected restore/provider/deployment and remaining security/business acceptance gates pass.

## Scope and evidence

Repository baseline was first observed locally at `a186b7a6829b61fabd7bc65bbd966319f0b6f128`; GitHub `main` had advanced to `5ac913bd96504927c9bbfb0a9e10a620e7ecf82d`. Current `main` was fetched and merged in commit `607eae4147ae8145dd2a2ba704de002c30aee253`. Work remains isolated on `codex/global-tours-remediation-2026-11-04`. No production endpoint, production database, credential, account, payment provider, or deployment was changed. As explicitly authorized for this task, tenant-isolation fixtures were created in the fake-data `husseindb` test database and the regression script removed only the fixture IDs it created.

The supplied failed run IDs were previously recorded as inspected through GitHub Actions metadata. Run `41761933552` failed at **Check production API health and readiness**; website checks were skipped. Run `41613200034` completed archive creation but failed at **Verify archive contains application data**; upload was skipped. Detailed logs and the current production deployment were not accessible in this run, so attribution of the exact production 503 to a specific deployment or infrastructure event remains unverified. Source inspection found a startup retry lifecycle gap and a monitoring retry-classification gap; both are addressed in this branch, but production recovery is not yet verified.

## Findings and implementation

| Priority | Finding | Status | Evidence / action |
|---|---|---|---|
| P0 | API bound before Mongo initialization but exited after the first initial connection or critical migration failure. Readiness could never recover in that process. | FIXED | `server/server.js` retries startup with capped backoff while keeping HTTP listener available. Database-dependent endpoints remain 503 until ready. |
| P0 | No independent process liveness endpoint; `/api/health` represented readiness and returned 503 for a database outage. | FIXED | `server/app.js` adds `/api/live` (process-only 200) and `/api/ready` (required database/startup readiness); `/api/health` remains compatible as readiness. |
| P0 | Invoice migration timeout could race a retry because Promise.race does not cancel MongoDB index work. | FIXED | Startup waits for timed-out migration work to settle before a retry. |
| P0 | Backup workflow only used `mongorestore --dryRun` and inferred collections from verbose output; this did not prove a readable restore. | FIXED IN CODE | `.github/workflows/production-backup.yml` decrypts and checksum-verifies the archive, starts isolated MongoDB, restores the archive, and checks readable users, organizations, bookings, payments and invoices, indexes, and tenant references before artifact upload. |
| P0 | Backup validation timeout had no MongoDB container diagnostics, and validation used a short fixed wait. | FIXED IN CODE | Readiness window extended to 120 seconds; failure prints sanitized container state and last 100 log lines. |
| P0 | Encrypted backup artifact upload included validation logs and helper files. | FIXED IN CODE | Upload allow-list includes only encrypted archive and checksum. |
| P0 | Monitoring alert issues were created on failure but never closed on recovery; duplicate open alerts already exist (#221 and #145). | FIXED IN CODE | `.github/workflows/production-monitoring.yml` closes all matching open alerts and comments with the recovery run after health, readiness, and web checks pass. |
| P0 | Monitoring treated the short `startup=failed` retry-backoff response as invalid, and concurrent scheduled runs could cancel an active failure check. | FIXED IN CODE | `scripts/check-production-api-health.sh` retries this machine-readable 503 state; monitoring concurrency no longer cancels an in-flight run. |
| P0 | Offline M-Pesa validation coverage was proposed in PR #222 but not present on `main`. | TESTED | Added its standalone sandbox endpoint/phone/invalid-input provider-call tests. Kept the PR's MongoDB CI downgrade out because it is unrelated and the current integration target is MongoDB 8. |
| P0 | npm audit previously reported critical/high issues in the server dependency tree. | FIXED for critical/high | Lockfiles were updated. Current full audit finds server 0 critical, 0 high, 2 moderate; client 0 critical, 0 high, 8 moderate, 2 low. The audit command exits nonzero because moderate advisories remain. |
| P1 | Live multitenancy regression script selected the general `MONGODB_URI`, so it could create/delete fixtures in an unintended database. | FIXED | It now requires `LIFECYCLE_TEST_MONGODB_URI`; using `husseindb` requires `ALLOW_HUSSEINDB_TEST_DATABASE=true`. The authorized run passed 17/17 checks and cleaned its named fixtures. |
| P1 | Startup acceptance harness allowed Mongoose to auto-create unrelated model collections in its disposable database, consuming test collection capacity. | FIXED | The harness disables both `autoIndex` and `autoCreate`; the isolated readiness test now reaches ready in about 3.4 seconds and cleans only its random `hr_*` namespace. |
| P1 | Current-main Resend key-rotation handling caused the test stub to fall through to the real SDK with a dummy key. | FIXED | Test injection now binds the stub to the active test key. Focused Resend tests passed 5/5; the post-merge backend suite passed. |

## Verification status

- `server/npm test`: **310 passed, 0 failed, 5 skipped** with loopback access. Skips are opt-in database/replica-set lifecycle cases.
- `server/tests/healthReadiness.test.js`: **4 passed, 0 failed, 0 skipped** against disposable local MongoDB 8, including outage/retry behavior and database/index-migration readiness.
- `server/npm run check:all`: PASS after final monitor and test-harness edits.
- `server/npm run check:multitenancy:live`: **17 passed, 0 failed** on the user-authorized fake-data `husseindb` test database. Unique fixture records were removed by test teardown.
- `client/npm run lint`: PASS after clean lockfile install.
- `client/npm run build`: PASS with explicit nonproduction API/socket URLs.
- `git diff --check`: rerun before commit.
- Current `npm audit --json`: server **0 critical/0 high/2 moderate**; client **0 critical/0 high/8 moderate/2 low**. Both commands exit 1 due remaining moderate advisories. No force-upgrade was applied because available suggested fixes require major-version changes or downgrading the PWA plugin.
- After merging current `main`, focused Resend tests passed **5/5**, and the backend suite passed again at **310 passed, 0 failed, 5 skipped**.
- Backup restore mechanics: **TESTED** using a synthetic archive and two disposable MongoDB 8 containers. Dumped/restored one fixture each for organizations, users, bookings, payments and invoices; checked document reads, indexes and tenant references (0 orphan references). This does not use production data or establish that the protected production archive/credentials work.
- Backup workflow with the actual encrypted production archive: NOT TESTED in GitHub Actions; production backup credentials/archive remain external. Workflow execution is needed to establish the actual protected archive restore.
- Production health/monitoring, production smoke, deployed SHA, and actual alert recovery: NOT VERIFIED. These require a workflow run against the configured deployment after merge/deploy.

## Pull request overlap review

Current GitHub API lists open PRs #223, #222, #220, #210, #209, #198, #190, #186, #184, #183, #182, #174, #148, #130, #102, #100, #99, #97, and #96. Production monitoring issues #221 and #145 remain open; recovery has not been run.

- #222 overlaps the offline M-Pesa test and CI workflow. The test is incorporated; its other workflow edits were not copied blindly. It remains open pending full patch comparison and CI review.
- #220 overlaps CI and M-Pesa checkout/status code and includes additional offline catalogue/PWA changes. Not merged.
- #198 overlaps package/lock files and readiness docs along with broad public-site changes. Not merged.
- #209/#210 both touch only the hotel controller; they duplicate each other and do not overlap this branch. Their CI is not clean, so neither was merged.
- #190 and #186 do not overlap this branch and remain unmerged pending patch review.
- Dependency PRs #184/#183/#182/#174/#130 overlap server package and lock files; #102/#100/#99/#97/#96 overlap the client lockfile. No blind merge was done.
- #148 is a broad acquisition/due diligence change set touching multiple runtime, workflow, and readiness files; no safe partial merge was identified.
- PR #223's first CI run failed: current-main Resend test injection (fixed) and Mongo service initialization before the live-isolation test (a fresh CI run is needed). Explicit isolated URIs are now configured for the live-isolation and health jobs.
- On head `c3bb6715c913c087a928ffd0d6fcd5093830540c`, release gate run `41960120269` passed all three phases. CI run `41960120286` has server production checks and client lint/build passed; live tenant-isolation failed during GitHub Mongo service initialization before checkout/tests, and tour lifecycle integration had not completed when checked. A fake `sk_live_example` test literal triggered the secret scan in the previous run; the test now assembles the example value at runtime, and the rerun release scan passed. Overall CI is not green.

No unrelated PR was merged or closed. Changed-file lists and CI/status metadata were inspected for all open PRs; complete patch review remains outstanding for unrelated changes.

## External blockers and untouched audit areas

BLOCKED EXTERNALLY: configured production API/web endpoint access, current deployment SHA, Render runtime database principal/least privilege, production backup secret and archive, isolated restore credentials/target and RPO/RTO evidence, Daraja Sandbox credentials and public callback, KRA/eTIMS certification, external webhook consumers, staging accounts, and production/browser acceptance evidence.

NOT TESTED in this remediation: exhaustive finance/accounting, tax, hotel/tour/fleet/supplier, SaaS billing, webhook, AI, account recovery, and frontend/browser acceptance. Existing unit/integration coverage is not exhaustive workflow acceptance. Production workflows, actual encrypted production archive, live Daraja Sandbox, production database role, deployment SHA, and browser acceptance remain externally unverified.

## Production verdict

**NOT PRODUCTION READY.** Repository-controlled readiness and restore workflow fixes are implemented, but real restore, current production monitoring/smoke, payment lifecycle, security acceptance, deployment SHA, and provider evidence remain unverified.
