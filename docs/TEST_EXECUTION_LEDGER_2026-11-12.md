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

### 8. Dependency audit — PRODUCTION CRITICAL FIX VALIDATED IN OPEN PR

- The original audit found production Mongoose `8.24.1` affected by query/filter sanitization advisories, including critical GHSA-pcrw-h46h-c93h. The Mongoose package range was `^8.12.0`.
- Isolated patch branch `security/mongoose-8-24-7` updated the dependency to `^8.24.7`, lockfile `8.24.7`.
- Isolated validation run [43224325996](https://github.com/isaacokubi/hussein-mboya-tours/actions/runs/43224325996) passed: `npm run check:all`, `npm test` (**354 tests, 349 passed, 0 failed, 5 skipped**), and production-only audit (**0 vulnerabilities**).
- PR [#243](https://github.com/isaacokubi/hussein-mboya-tours/pull/243) was opened from clean branch `security/mongoose-8-24-7-pr`. The complete PR CI run [43224711637](https://github.com/isaacokubi/hussein-mboya-tours/actions/runs/43224711637) passed all four jobs; the three-phase release gate [43224711510](https://github.com/isaacokubi/hussein-mboya-tours/actions/runs/43224711510) also passed all three phases. The PR is **open and not merged**.
- The full development dependency tree still reports **2 moderate** findings through `nodemon` / `minimatch@10.2.6` (GHSA-g3hv-75wg-m249). The production-only audit is clean. Do not force an override to minimatch 11 across the current transitive `^10.2.1` requirement without compatibility validation.
- The initial temporary workflow on the first security branch had a YAML condition syntax issue and produced two no-job failed runs; the corrected workflow completed successfully. The temporary workflow was removed from the final PR branch. These initial failures are not Mongoose test failures.
- The `africastalking@0.8.4` npm engine warning (requires npm >=11.12.1 while Node 22 runner provides npm 10.9.9) remains to be assessed separately.

### Updated release decision

Automated application checks, staging tenant-account verification, production health smoke checks, and one isolated backup-restore drill now have passing evidence. **The product is still NOT CERTIFIED for live tenant onboarding** until the dependency vulnerability report is reviewed, M-Pesa provider sandbox callback lifecycle is exercised, KRA/eTIMS provider onboarding and a real test submission are verified, email delivery is checked, production DB effective privileges are confirmed, and browser/mobile acceptance is completed.



## Current resume checkpoint — 2026-11-12

### Mongoose remediation status

- Production dependency finding was confirmed against Mongoose `8.24.1`; the fix is available in Mongoose `8.24.7`.
- Isolated validation passed on `security/mongoose-8-24-7`: production audit clear; `npm run check:all` passed; backend tests **349 passed, 0 failed, 5 skipped**.
- Pull request [#243](https://github.com/isaacokubi/hussein-mboya-tours/pull/243) is open, based on current `main`, and changes only `server/package.json` and `server/package-lock.json`.
- PR CI [43224711637](https://github.com/isaacokubi/hussein-mboya-tours/actions/runs/43224711637) passed all four jobs. Three-phase release gate [43224711510](https://github.com/isaacokubi/hussein-mboya-tours/actions/runs/43224711510) passed all three phases.
- **Do not claim the fix is deployed or merged.** No production deployment or database migration was performed for this dependency patch. Merge only after explicit review/approval; redeployment must then be verified by the live Render version and production smoke check.

### Remaining release blockers

1. M-Pesa: provider-backed sandbox lifecycle (STK initiation, query, success, failure/cancel/expiry, duplicate callback replay/idempotency, booking/payment state, reconciliation) using tenant-owned sandbox credentials and approved HTTPS callback. No live customer charge.
2. eTIMS: KRA tenant onboarding, credentials/device, certified OSCU/VSCU or approved adapter, provider sandbox/vetting, and a test invoice submission/receipt.
3. Email: controlled provider delivery and bounce verification.
4. Database security: verify effective Render MongoDB user roles in Atlas; do not assume least privilege from app tests.
5. Operations: confirm Atlas PITR/continuous backup configuration separately from the successful encrypted archive restore drill.
6. Browser/mobile: role-based authenticated staging journeys and responsive/mobile acceptance.
7. Development dependency audit: two moderate `nodemon`/`minimatch` findings remain; assess compatible upstream fixes. Review the Africa's Talking npm engine mismatch separately.

### Safety

- Production database `husseindb` was not used for dependency validation and remains excluded from tests.
- Do not expose or request database passwords, M-Pesa secrets, API tokens, or callback credentials in chat or committed files.
- Overall release remains **NOT CERTIFIED FOR LIVE TENANT ONBOARDING** until the external/provider and operational blockers above are closed and the Mongoose PR is merged and deployed safely.
