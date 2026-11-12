# Test execution ledger — 2026-11-12

Repository: `isaacokubi/hussein-mboya-tours`  
Recorded source revision: `f6a52fd4fa2b49f9f8ad86a4ab37091b12531410` (`main`)  
Purpose: preserve completed evidence and prevent unnecessary reruns. Update this file whenever a test is rerun; retain historical entries and add a new dated result.

## Completed evidence

### 1. Staging 28-account matrix — PASS (workflow-level evidence)

- GitHub Actions workflow: **Seed Staging Demo Accounts and Verify 28-Account Matrix**
- Run: **#2**, manually triggered; user supplied GitHub Actions run details on 2026-11-12.
- Commit: `f6a52fd` on `main`.
- Result: **Success**; duration **50m 22s**.
- Artifacts: `staging-28-account-matrix` (786 bytes) and `staging-demo-seed-report` (2.87 KB).
- Workflow warnings: Node.js 20 action deprecation notice and upcoming Ubuntu runner image migration notice. These were warnings/notices, not reported job failures.
- The workflow YAML pins the seed target to Atlas database `global_tours_test` and staging API origin `https://hussein-mboya-tours-1.onrender.com`; it refuses a different MongoDB host/database or API host.
- The verification script asserts exactly 28 accounts; 28 successful logins; matching roles; three distinct tenant identities; 12 customer logins; successful role-specific dashboard/booking endpoint access; and HTTP 403 when each customer attempts tenant-admin metrics.
- Evidence boundary: this entry records the successful Actions status and the test assertions in the checked-in script. The two JSON artifact contents have not yet been independently reviewed in this session, so individual account rows and seed counts are not reproduced here.
- Do not rerun this matrix merely to recreate evidence. First inspect the two artifacts from run #2. Rerun only after relevant code/configuration changes or if artifact inspection reveals a defect.

Workflow link: https://github.com/isaacokubi/hussein-mboya-tours/actions/workflows/seed-staging-demo-and-verify.yml

### 2. First-tenant provisioning and cross-tenant acceptance — PASS (targeted integration evidence)

- Existing evidence recorded in [FIRST_TENANT_ACCEPTANCE.md](FIRST_TENANT_ACCEPTANCE.md): 2026-10-10.
- Command recorded there: `cd server && node --env-file=.env --test tests/firstTenantAcceptance.integration.test.js`.
- Result: **1 passed, 0 failed, 0 skipped** (about 111.5 seconds).
- Scope: disposable first/second tenant provisioning, tenant-admin and customer access, public catalogue and booking paths, tenant-scoped records, and cross-tenant denial.
- Specific auth regression: Tenant A credentials submitted while selecting Tenant B returned HTTP 401; a Tenant A JWT presented to `/api/auth/me` while selecting Tenant B returned HTTP 404.
- No payment provider transaction was initiated.
- Safety: integration test derives a uniquely named disposable database from `FIRST_TENANT_TEST_MONGODB_URI`, whose source database must be `global_tours_test`. Never substitute production `husseindb`.

### 3. Previous repository-wide checks — historical PASS, not a fresh 2026-11-12 run

- [READINESS_UPDATE_2026-10-29.md](READINESS_UPDATE_2026-10-29.md) records: backend suite **267 passed, 0 failed, 5 skipped**; `npm run check:all`; client lint; client build; focused M-Pesa tests **4 files, 0 failures, 0 skips**.
- These are historical results from the documented implementation/revision. They must not be represented as a fresh run against the current revision.

## Pending / not certified

| Area | Status | What is still required |
|---|---|---|
| 28-account artifact review | PENDING REVIEW | Download and inspect both JSON artifacts from run #2; confirm all 28 rows, zero failures, seed totals and report timestamps. |
| Full backend suite on current revision | NOT RE-RUN | Run `cd server && npm ci && npm test` in CI or a supported isolated environment; preserve exact pass/fail/skip counts. |
| Static/backend release gates on current revision | NOT RE-RUN | Run `npm run check:all` and client lint/build in CI; do not infer from the prior 2026-10-29 run. |
| Tenant isolation regression suite | NOT RE-RUN ON CURRENT REVISION | Run only with an explicitly configured disposable `LIFECYCLE_TEST_MONGODB_URI`; never fall back to `MONGODB_URI` or `husseindb`. Include aggregation, bulk writes, background jobs and callback paths. |
| Production runtime / deployed SHA | UNVERIFIED FOR THIS REVISION | Compare the live Render server SHA with the intended release SHA and inspect health/readiness, database connection and CORS from the deployed service. |
| Live M-Pesa sandbox lifecycle | NOT CERTIFIED | Use a tenant-owned sandbox configuration and approved public HTTPS callback. Capture STK initiation, provider query, success, failure/cancel/expiry, duplicate callback replay/idempotency, payment/booking status and accounting reconciliation. No live customer charge. |
| KRA/eTIMS | NOT CERTIFIED | Requires tenant KRA onboarding, credentials/device setup, certified OSCU/VSCU or approved adapter, provider sandbox/vetting, and a real test invoice submission/receipt. Source code or queue tests are not certification. |
| Email delivery | NOT VERIFIED | Send a controlled test to an approved mailbox and verify provider delivery/bounce handling. |
| Production backup and restore | NOT VERIFIED | Confirm Atlas backup/PITR configuration and perform a documented restore drill to an isolated target. |
| Production database least privilege | UNVERIFIED | Atlas administrator must inspect the Render database user's direct/inherited roles and effective resources. Historical local development credential was broad; that is not proof of Render's role. |
| Browser/mobile authenticated acceptance | INCOMPLETE | Run role-based browser journeys and responsive/mobile checks against staging after artifacts and release SHA are confirmed. |

## Rules to avoid repeating work

1. Before running a test, check this ledger and the linked dated report for an existing passing result.
2. A passing result is reusable only for the same relevant code revision, configuration and test scope. If the code or configuration changed, record why a rerun is necessary.
3. Keep staging/integration data isolated. Production `husseindb` is not a test target.
4. Never put credentials, passwords, tokens, PINs, callback secrets or connection strings in reports or commits.
5. Label every result PASS, FAIL, SKIPPED, BLOCKED or NOT RUN. A skipped test is not a pass.
6. Preserve workflow artifacts and append a new dated section instead of overwriting historical evidence.

## Next execution order

1. Inspect the two 28-account artifacts from run #2 (no reseed or rerun).
2. Run current-revision backend tests and static/client checks in CI.
3. Run the disposable-database tenant isolation regression tests, respecting Atlas collection limits.
4. Complete staging M-Pesa sandbox callback lifecycle and accounting reconciliation.
5. Complete production runtime/configuration, backup/restore and security evidence.
6. Complete eTIMS only when the tenant has a real approved adapter and KRA/provider sandbox credentials.

**Current release decision: NOT CERTIFIED FOR LIVE TENANT ONBOARDING** until the blocking external/provider and production operational evidence above is captured.

## Ledger maintenance commits

- `2e4062c` — added this test execution ledger to `main`.
- `76edb6b` — changed the legacy `Staging 28-Account Demo Matrix` workflow to manual dispatch only. It previously ran the same staging account matrix on every push to `main`, causing duplicate/redundant account logins after unrelated documentation or code commits. The dedicated seed-and-verify workflow remains manually triggered. The normal CI workflow still runs on `main` pushes and pull requests.
- Vercel reported both frontend deployments as pending for `76edb6b` at the time of this ledger update. This is a documentation/workflow-only change; no application runtime code was modified.
