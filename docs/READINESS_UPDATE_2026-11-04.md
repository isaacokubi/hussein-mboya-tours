# Readiness update — 2026-11-04

## Remediation source

The initial local checkout was `a186b7a6829b61fabd7bc65bbd966319f0b6f128`, while current GitHub `main` was `5ac913bd96504927c9bbfb0a9e10a620e7ecf82d`. The current main was merged on this branch (merge commit `607eae4`). The remediation is committed and pushed on `codex/global-tours-remediation-2026-11-04`; draft PR #223 is open. It has not been deployed or verified against production.

This record was refreshed on 2026-11-05. The user explicitly confirmed `husseindb` contains fake test data and authorized test/database modifications there. The live regression touched only uniquely named test fixtures and removed those fixture IDs in teardown; no production endpoint/database or payment provider was used.

## P0 repository fixes

- **FIXED:** the API retains its HTTP listener and retries MongoDB connection, staging startup work, and critical invoice-index migration after failure using bounded exponential backoff. Database-backed application routes continue to return 503 until startup and database readiness pass.
- **FIXED:** `/api/live` returns process liveness independently of MongoDB; `/api/ready` and backward-compatible `/api/health` report machine-readable startup/database readiness.
- **FIXED:** startup retries wait for timed-out migration work to settle, avoiding concurrent index-migration attempts.
- **FIXED IN CODE:** production backup validation performs checksum verification, authenticated decryption, actual restore in a disposable MongoDB container, and application/tenant reference checks before encrypted artifact upload.
- **FIXED IN CODE:** backup MongoDB startup failures now emit container state and bounded startup logs; unencrypted diagnostic files are excluded from uploaded artifacts.
- **FIXED IN CODE:** monitoring now closes duplicate open production-monitoring issues after health, readiness, and website checks recover.
- **FIXED IN CODE:** monitoring treats the startup retry-backoff state (`startup=failed`) as retryable until its 120-second readiness deadline, and scheduled/manual runs do not cancel an active check before alert delivery.
- **FIXED:** live tenant isolation now requires explicit `LIFECYCLE_TEST_MONGODB_URI`; `husseindb` requires the one-command `ALLOW_HUSSEINDB_TEST_DATABASE=true` opt-in.
- **FIXED:** compatible server and client lockfile updates remove all critical/high advisories. Current full audits find 2 moderate server advisories and 8 moderate/2 low client advisories; `npm audit` exits nonzero for these remaining findings.
- **FIXED:** merged-current-main Resend client-key rotation caused test injection to fall through to the provider SDK; the test stub now binds to the active test key. Focused email tests pass 5/5 without a provider request.

## Verification evidence

- Backend suite: **310 passed, 0 failed, 5 skipped** (`npm test` with loopback permission).
- Health/readiness: **4 passed, 0 failed, 0 skipped** against disposable MongoDB 8 with loopback permission, including database-connected startup and index migration.
- Authorized fake-data `husseindb` tenant-isolation regression: **17 passed, 0 failed**; teardown removed the generated fixture records.
- Post-merge backend suite: **310 passed, 0 failed, 5 skipped**.
- `npm run check:all`: **PASS**.
- Client ESLint: **PASS**.
- Client production build: **PASS** using `https://api.example.invalid` build endpoints.
- Current dependency audits: **0 critical/0 high** in both trees; server 2 moderate, client 8 moderate/2 low.
- MongoDB 8 synthetic backup/restore fixture: **PASS** in two disposable containers. A generated archive restored organizations, users, bookings, payments and invoices; each collection was readable, expected indexes existed, and tenant references had zero orphans. This does not verify the protected production archive.
- Production monitoring and smoke: **NOT VERIFIED** against a current deployment; the amended workflow has not run.
- Backup and restore: synthetic MongoDB restore mechanics **TESTED**; workflow implementation updated. The encrypted production archive and full GitHub Actions backup/restore drill remain **NOT TESTED**.
- Live Daraja Sandbox payment/callback/refund/reconciliation: **NOT TESTED**; no provider credential, callback, or payment operation was used.
- Production deployment SHA and live database role: **NOT VERIFIED**.

GitHub run metadata confirms the cited monitoring run failed at API health/readiness (website check skipped), and the backup run failed during temporary MongoDB validation before upload. Issues #221/#145 remain open. For PR #223 head `c3bb671`, release gate passed all three phases; server production and client checks passed. Main CI's live-isolation Mongo service failed initialization before tests, while tour lifecycle integration was still running at last check. The secret-scan false positive was fixed and the rerun release gate passed. Overall CI remains incomplete. Recovery closure has not run against production monitoring.

## Verdict

**NOT PRODUCTION READY.** The repository changes still need CI and deployment review. Production monitoring, verified backup/restore, least-privilege production database access, Sandbox payment lifecycle, eTIMS, and staging/browser acceptance require external evidence. See [Master remediation audit](MASTER_REMEDIATION_AUDIT.md) and [Master remediation progress](MASTER_REMEDIATION_PROGRESS.md).
