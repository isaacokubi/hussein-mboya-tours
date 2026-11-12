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


## Verification addendum — 2026-11-12 (direct artifact and workflow review)

### 4. Staging 28-account matrix — PASS (artifact contents independently reviewed)

- Run: [43211534900](https://github.com/isaacokubi/hussein-mboya-tours/actions/runs/43211534900), commit `f6a52fd4fa2b49f9f8ad86a4ab37091b12531410`.
- Verification artifact reports **28 accounts, 28 authenticated, 0 failures**. Each account has login HTTP 200 and dashboard HTTP 200. All expected roles match.
- Customer accounts receive HTTP 403 from tenant-admin metrics, as required.
- Seed report confirms database `global_tours_test`, three tenants, 12 tenant users per tenant (36 total) plus the platform super-admin, and 93 application collections after seeding. No application collections were skipped.
- Test target is the staging API `https://hussein-mboya-tours-1.onrender.com`; no production API/database target was used.
- A separate redundant legacy matrix run timed out before completing any logins. The legacy workflow was changed to manual dispatch only; the dedicated seed-and-verify workflow remains the authoritative passing result.

### 5. Current CI and tenant-isolation checks — PASS

- CI run [43222457610](https://github.com/isaacokubi/hussein-mboya-tours/actions/runs/43222457610), commit `2e00ceadd93f7e196ec7ab023317bab469e6451b): all four jobs passed (server checks, live tenant isolation, tour lifecycle integration, client lint/build).
- Backend suite: **354 tests, 349 passed, 0 failed, 5 skipped**. Skips are not counted as passes.
- Live tenant isolation regression: **17 passed, 0 failed**. Coverage in the log includes cross-tenant delete blocking, tenant-scoped insertMany/bulkWrite, aggregation lookup isolation, nested facet isolation, tenantId immutability and cross-tenant data preservation.
- Database-backed health/readiness: **4 passed, 0 failed, 0 skipped**.
- First-tenant acceptance: **1 passed, 0 failed, 0 skipped** on a disposable local MongoDB replica set.
- Client ESLint and production build passed.
- Three-phase release gate [43222457182](https://github.com/isaacokubi/hussein-mboya-tours/actions/runs/43222457182) passed all three phases.

### 6. Production endpoint smoke check — PASS, with deployment SHA noted

- Run [43222457386](https://github.com/isaacokubi/hussein-mboya-tours/actions/runs/43222457386) passed against the configured production API and public web endpoint.
- API health response reported healthy/ready and database connected to `husseindb`; the public website returned valid HTML.
- The live API reported application version `f82661e884cae968076446c26e9580fe33bf2fe2`. The five commits between that application revision and `2e00cea` changed only GitHub workflows and documentation, not application source files. Do not deploy a docs-only change solely to alter the reported runtime SHA.

### 7. Production backup and isolated restore — PASS for this backup run

- Scheduled backup run [43195968316](https://github.com/isaacokubi/hussein-mboya-tours/actions/runs/43195968316) completed successfully.
- Backup was encrypted, checksum-verified, decrypted only inside the workflow, and restored into an isolated temporary MongoDB instance.
- Restore evidence: **2,218 documents restored, 0 failures**; 37 users, 3 organizations, 33 bookings, 33 payments, 30 invoices; zero orphaned tenant references in bookings, payments and invoices.
- Encrypted archive and checksum were uploaded as a GitHub Actions artifact with 30-day retention.
- This proves this archive can be restored; Atlas PITR/continuous backup settings and a provider-managed restore remain unverified.

### 8. Dependency audit — INVESTIGATION REQUIRED

- The current CI `npm ci` output reported **3 dependency vulnerabilities (2 moderate, 1 critical)**. The installation warning also reported an engine mismatch for `africastalking@0.8.4` (the package requires npm >=11.12.1 while the Node 22 runner provides npm 10.9.9).
- Commit `5e22962` adds non-blocking full-tree and production-only `npm audit --json` reports as a CI artifact so exact package/advisory/fix details can be reviewed before changing dependencies.
- Do not run `npm audit fix --force` or upgrade payment dependencies blindly. Await the detailed report and test any dependency changes through CI.

### Updated release decision

Automated application checks, staging tenant-account verification, production health smoke checks, and one isolated backup-restore drill now have passing evidence. **The product is still NOT CERTIFIED for live tenant onboarding** until the dependency vulnerability report is reviewed, M-Pesa provider sandbox callback lifecycle is exercised, KRA/eTIMS provider onboarding and a real test submission are verified, email delivery is checked, production DB effective privileges are confirmed, and browser/mobile acceptance is completed.



## Resume checkpoint — 2026-11-12: Mongoose dependency security remediation

**This is the exact point to resume from next session. Do not restart the earlier test plan.**

### Current finding

- The latest CI dependency-install log reported **3 vulnerabilities: 2 moderate and 1 critical**. The critical finding was identified in the production dependency tree and relates to Mongoose filter/query sanitization.
- Repository dependency declarations at the time of review:
  - `server/package.json`: Mongoose range `^8.12.0`.
  - `server/package-lock.json`: resolved Mongoose `8.24.1`.
  - Resolved Mongoose engine requirement: Node `>=16.20.1`.
- A newer patched target `mongoose@8.24.7` was selected for an isolated compatibility/security validation. **This is a proposed patch target, not yet a confirmed safe production upgrade.**
- No Mongoose version or lockfile change has been merged into `main`. No production deployment or database migration was performed for this investigation.

### Isolated validation branch and workflow

- Branch: `security/mongoose-8-24-7`
- Branch base: `935b4491393fef86d9af19b00f206ab5352a86c8` (the `main` tip at branch creation).
- Workflow file: `.github/workflows/isolated-mongoose-security-patch.yml`
- Workflow creation commit: `7b5e36d49328b01931e9f7b258891f56c93d5f35`.
- Intended workflow sequence: install the current locked dependencies; upgrade Mongoose only to 8.24.7 on this isolated branch; inspect production dependency audit; fail if critical/high production vulnerabilities remain; run `npm run check:all`; run the complete `npm test` suite; commit only `server/package.json` and `server/package-lock.json` if all gates pass.
- Workflow run [43224068726](https://github.com/isaacokubi/hussein-mboya-tours/actions/runs/43224068726) completed with conclusion **failure**. GitHub's run jobs endpoint reported `total_count: 0` and no jobs. Therefore **no dependency install, Mongoose upgrade, audit, or test step is evidenced as having run**. Treat this as a workflow-trigger/registration failure, not as evidence that Mongoose 8.24.7 failed compatibility tests.
- The workflow file was fetched and reviewed from the security branch. The branch and workflow are still isolated from `main`; no pull request was opened and nothing was merged.

### Exact next action when resuming

1. Resume on branch `security/mongoose-8-24-7` and inspect why run `43224068726` was created with zero jobs. First check GitHub's workflow registration/validation and event requirements for a workflow file introduced on a non-default branch. Do not assume the reason without evidence.
2. Make the smallest correction so the isolated workflow can execute (for example, register the workflow on the default branch in a safe, non-production-triggering way, or use an already registered CI workflow/PR path). Keep the Mongoose patch itself isolated from `main`.
3. Trigger the isolated validation and verify that jobs actually start. Inspect the audit output and exact advisories; do not rely only on the overall green/red badge.
4. If the patched Mongoose release clears critical/high production advisories, run all backend checks and tests, and review compatibility-sensitive Mongoose query/update, aggregation, middleware, and tenant-isolation behavior. Capture the exact test counts and audit report.
5. Only after all checks pass, open a PR for the dependency patch and review the diff. Do not merge or deploy until the PR checks pass and the change is explicitly approved.
6. If 8.24.7 does not clear the advisory or breaks compatibility, stop and evaluate the smallest supported patched version based on the advisory's affected/fixed ranges. Never use `npm audit fix --force`.

### Safety and status

- Production database `husseindb` was not used for this security validation and must remain excluded from tests.
- Do not expose or request database passwords, M-Pesa secrets, API tokens, or callback credentials in chat or committed files.
- Overall release remains **NOT CERTIFIED FOR LIVE TENANT ONBOARDING** until the outstanding dependency, payment-provider, eTIMS/KRA, email, effective database-privilege, and browser/mobile acceptance items are completed.
- Last verified `main` revision before this checkpoint: `935b4491393fef86d9af19b00f206ab5352a86c8`.
