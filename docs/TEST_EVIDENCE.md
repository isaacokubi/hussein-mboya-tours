# Global Tours — Test Evidence Register

## 2026-09-26 — Staging verification record

### Safety boundary — staging only

> **ALL TESTS IN THIS RECORD ARE STAGING TESTS.** Production must never be used for these tests.

| Environment | Endpoint / database | Use |
|---|---|---|
| Staging backend | `https://hussein-mboya-tours-1.onrender.com` | Disposable staging API checks only. |
| Staging frontend | `https://hussein-mboya-tours-2-l3m78h6fz-isaacokubis-projects.vercel.app` | Staging browser checks only. It was verified to call the staging backend. |
| Staging database | `global_tours_test` | Staging application data only. |
| Production | `https://hussein-mboya-tours.onrender.com` / `husseindb` | **Excluded from disposable test execution.** |

Never use the production frontend for test transactions, the production Render API for sandbox tests, or `husseindb` for disposable tests. Never manually invoke a production M-Pesa callback, expose secrets in documentation, commit `.env` files/credentials, or copy staging test data into production. No password, JWT, cookie, API key, M-Pesa credential, MongoDB credential, or private token belongs in this record. Do not perform cleanup or mutation against production.

Staging isolation is implemented and verified: staging requires `DEPLOYMENT_ENV=staging` and `STAGING_DATABASE_NAME`; that database name must match the database path in `MONGODB_URI`; staging rejects `husseindb`; production expects `husseindb`; and staging retains `NODE_ENV=production`. Staging health returned HTTP 200 with a healthy/ready database status. The exact staging Vercel origin is configured for staging CORS.

### Evidence matrix

Date for the following staging verification: **2026-09-26**. “Actual result” records the observed response supplied for this staging run. Results are specific to these staging endpoints and this disposable tenant; they do not certify production.

| Gate | Environment / endpoint | Expected result | Actual result | Status | Notes / next action |
|---|---|---|---|---|---|
| Database separation | Staging backend and `global_tours_test` | Staging fails closed unless explicitly configured for its separate database; production target remains `husseindb`. | Guard and target matching verified; staging rejects production database; production contract expects `husseindb`; `NODE_ENV=production` remains set on staging. | PASS | Keep staging and production targets excluded from one another. |
| Staging health | `GET /api/health` on staging backend | HTTP 200, healthy/ready database status. | HTTP 200; database reported healthy/ready. | PASS | Staging evidence only. |
| Frontend/backend target | Staging frontend | Browser API requests go to staging backend. | Staging frontend was verified to call `hussein-mboya-tours-1.onrender.com`, not production. | PASS | Continue to use only the staging frontend for this sequence. |
| CORS preflight | Staging backend with exact staging Vercel `Origin` | HTTP 204, credentials allowed, exact origin returned. | HTTP 204; `access-control-allow-credentials: true`; response included the exact staging frontend origin. | PASS | Staging CORS origin implementation merge: `a01553451e1c3d8e0adfa756e3e88b078f5057be`. |
| Platform login CORS | SuperAdmin login from staging frontend origin | Login request reaches staging API. | HTTP 200. | PASS | Same CORS gate; no credential or token recorded. |
| Login without tenant | Staging login path | Invalid/unknown login does not get incorrectly blocked by tenant resolution before platform login path. | Tenant-resolution behavior was corrected; login returns invalid credentials through the intended path. | PASS | Fix merges: `ad544dd47a5ed6d5997d897cd08976746a3989f6` and `61fc4afcb96436a227b6d4d6241692000ab0ac8c`. |
| Staging SuperAdmin bootstrap guards | Staging only | Require `NODE_ENV=production`, `DEPLOYMENT_ENV=staging`, `STAGING_DATABASE_NAME=global_tours_test`, matching Mongo URI path; reject `husseindb`. | Guards were implemented and verified. | PASS | Bootstrap implementation merge: `b7d2fca57f925fcf709bd161b06db99ddd15b499`; staging database validation merge: `da67dcba603ae83ebffca7a85f0bcbadcd2eab4d`. |
| Bootstrap behavior | Staging platform account | Create only a platform SuperAdmin, no tenant and no `tenantId`; idempotent; enforce password requirements. | Focused tests passed; bootstrap was used successfully. It creates no tenant and assigns no tenant ID to the platform account; repeat invocation is idempotent; password requirements are enforced. | PASS | No password is documented. Temporary trigger cleanup remains pending. |
| Bootstrap automated suite (historical run) | Focused bootstrap tests / full suite at bootstrap phase | Accurately distinguish passes, skips and failure. | Focused tests passed. Full suite: **164 passed, 4 skipped**, and **1 existing MongoDB-backed readiness timeout/failure was observed**. | PASS for focused tests; readiness case is not PASS | Historical bootstrap-era count, not the later Atlas run elsewhere in this register. The readiness timeout/failure remains an observed failure/limitation, not a passing test. |
| Temporary bootstrap trigger | Staging bootstrap phase | Temporary trigger permits intended staging bootstrap and is then removed/disabled. | Temporary HTTP trigger was successfully used to create the staging SuperAdmin. | PASS for use; cleanup PENDING | Temporary trigger implementation merge: `48b304f016243312a239a4df5c6c95315b1842f9`. This is not a permanent production feature. Remove/disable after bootstrap; do not document its trigger token or value. |
| SuperAdmin login | Staging platform login | HTTP 200 with platform role and no tenant context. | HTTP 200; role `super_admin`; `tenantId: null`. | PASS | No password, JWT, cookie, or token recorded. |
| Tenant creation | Staging SuperAdmin tenant-management API | Valid tenant and admin created in staging; invalid plan rejected; no payment performed. | Disposable tenant created successfully. Invalid subscription plan `trial` was rejected before creation; valid `starter` plan succeeded. No M-Pesa transaction occurred. | PASS | Tenant identifiers below are non-secret staging data. |
| Tenant admin login / identity | Staging tenant login | Authenticated tenant identity resolves to created tenant. | `success: true`; role `admin`; `tenantId: 6ab82dce30c1fd52b9dc3e80`; email `staging-tenant-admin@example.com`; status `active`. | PASS | Password/token omitted. |
| Public tenant settings | `GET /settings/public` for `staging-demo-tours` | Public tenant plan/locale/status values match created tenant. | `companyName=Staging Demo Tours`; `companySlug=staging-demo-tours`; `subscriptionPlan=starter`; `userSeats=5`; `tenantStatus=trial`; `country=Kenya`; `currency=KES`; `timezone=Africa/Nairobi`; `enableMpesa=true`. | PASS | Private configuration values intentionally omitted. |
| Initial tenant tours | `GET /tours` for `staging-demo-tours` | Tenant-scoped endpoint accessible; new tenant begins with no tours. | `success: true`; `data: []`; `tours: []`; `pagination.total: 0`. | PASS | Next: create one marked staging tour and verify scoped retrieval. |
| Tenant/platform access boundary | Tenant admin: `GET /superadmin/tenants` | Tenant administrator denied access to platform tenant management. | HTTP 403; message `Super administrator access required.` | PASS | Confirms tenant admin cannot access platform SuperAdmin tenant-management endpoints. |
| Customer endpoint discovery | Tenant admin: `GET /customers` | Customer-management endpoint is available on starter; empty initial result. | HTTP 200; `success: true`; `total: 0`; `count: 0`; `customers: []`. | PASS | Valid customer-management endpoint. |
| Generic users feature | Tenant admin: `GET /users` | Starter plan restriction is explicit. | HTTP 403; code `PLAN_FEATURE_LOCKED`; feature `users`; plan `starter`. | PASS | Expected subscription restriction; preserve as a valid gate result. |
| `/auth/users` discovery | Tenant admin: `GET /auth/users` | Record route availability exactly. | HTTP 404; Route not found. | OBSERVED / EXPECTED | Not an available API route; do not treat it as customer API. |
| Admin customer endpoint discovery | Tenant admin: `GET /admin/customers` | Admin customer route is available. | HTTP 200; `success: true`; `total: 0`; `count: 0`; `customers: []`. | PASS | Valid customer-management endpoint. |
| Generic booking endpoint discovery | Tenant admin: `GET /bookings` | Record route availability exactly. | HTTP 404; Route not found. | OBSERVED / EXPECTED | Do not use as generic booking endpoint unless a future code change adds it. |
| Admin booking endpoint discovery | Tenant admin: `GET /admin/bookings` | Admin booking route is available with an empty result. | HTTP 200; `success: true`; `count: 0`; `bookings: []`. | PASS | Use for the pending booking verification. |
| Agent feature | Tenant admin: `GET /agent/bookings` | Starter plan restriction is explicit. | HTTP 403; code `PLAN_FEATURE_LOCKED`; feature `agents`; plan `starter`. | PASS | Expected subscription restriction; preserve as a valid gate result. |

### Disposable staging tenant identifiers

| Record | Verified values |
|---|---|
| Tenant | Name `Staging Demo Tours`; slug `staging-demo-tours`; ID `6ab82dce30c1fd52b9dc3e80`; status `trial`; subscription plan `starter`; seats `5`; country `Kenya`; timezone `Africa/Nairobi`; currency `KES`. |
| Tenant admin | Name `Staging Tenant Admin`; email `staging-tenant-admin@example.com`; role `admin`; tenant ID `6ab82dce30c1fd52b9dc3e80`; status `active`. |

These are disposable staging identifiers, not credentials. Future disposable data should use a name, slug, or email containing `staging-demo` or another clearly documented staging marker. Remove data only after confirming it is disposable staging test data and safe to delete. Never delete production data.

### Current test status and remaining work

| Gate | Status | Current evidence / next action |
|---|---|---|
| Staging database separation | PASS | Isolation guards and target verified. |
| Staging health | PASS | HTTP 200; healthy/ready database status. |
| Staging frontend → staging backend connectivity | PASS | Frontend target verified. |
| Staging CORS | PASS | Exact origin preflight and platform login verified. |
| Platform SuperAdmin bootstrap | PASS | Staging-only, guarded, idempotent behavior and focused tests verified. |
| Platform SuperAdmin login | PASS | HTTP 200; `super_admin`; `tenantId: null`. |
| Tenant creation | PASS | Disposable starter tenant created; invalid `trial` plan rejected. |
| Tenant admin login | PASS | Login succeeded for the expected tenant identity. |
| Tenant identity resolution | PASS | Correct tenant ID and active status returned. |
| Tenant public settings | PASS | Expected public values returned. |
| Empty tenant tours retrieval | PASS | Tenant endpoint returned empty list and total zero. |
| Tenant admin denied SuperAdmin endpoint | PASS | HTTP 403. |
| Customer endpoint discovery | PASS | `/customers` available and empty. |
| Admin customer endpoint discovery | PASS | `/admin/customers` available and empty. |
| Admin booking endpoint discovery | PASS | `/admin/bookings` available and empty. |
| Starter-plan users feature lock | PASS | `/users` returned `PLAN_FEATURE_LOCKED` for `users`. |
| Starter-plan agents feature lock | PASS | `/agent/bookings` returned `PLAN_FEATURE_LOCKED` for `agents`. |
| Invalid subscription plan rejection | PASS | `trial` rejected; `starter` accepted. |
| `/auth/users` route discovery | OBSERVED / EXPECTED | HTTP 404 Route not found. |
| `/bookings` route discovery | OBSERVED / EXPECTED | HTTP 404 Route not found. |
| Create one staging tour | PENDING | Create only in staging with a recognizable marker. |
| Verify tour retrieval | PENDING | Confirm returned only for `staging-demo-tours`. |
| Create one staging customer | PENDING | Create only in staging with a recognizable marker. |
| Verify customer tenant ownership | PENDING | Confirm ownership belongs to `staging-demo-tours`. |
| Create one staging booking | PENDING | Use the staging tour and customer. |
| Verify booking tenant ownership | PENDING | Confirm the booking references the correct tenant. |
| Verify booking appears in admin bookings | PENDING | Check `/admin/bookings`. |
| Verify customer booking relationship | PENDING | Confirm the expected customer/booking relationship. |
| Cross-tenant data isolation | PENDING | Verify another tenant cannot access the staging tour, customer, or booking. |
| SuperAdmin tenant visibility/context | PENDING | Verify SuperAdmin can see/manage tenants and tenant requests do not inherit leaked tenant context. |
| Subscription behavior across plans | PENDING | Verify starter/professional/business/enterprise where applicable. |
| Booking status transitions | PENDING | Verify supported transitions. |
| Booking payment state before payment | PENDING | Capture state before any provider call. |
| Staging M-Pesa sandbox STK Push | PENDING | Exactly one KES 1 request, only after all isolation gates pass. |
| M-Pesa request persistence | PENDING | Verify staging request record. |
| Callback handling | PENDING | Verify staging callback behavior. |
| Successful payment affects correct booking only | PENDING | Verify exact booking update. |
| Duplicate callback protection/idempotency | PENDING | Replay-safe behavior to be verified. |
| Failed/cancelled payment handling | PENDING | Verify state remains correct. |
| Payment tenant ownership | PENDING | Confirm payment belongs to correct tenant. |
| No production endpoint/database touched | PENDING | Reconfirm throughout the sequence; production remains excluded. |
| Customer dashboard booking flow | PENDING | Manual staging browser flow. |
| Tenant admin dashboard | PENDING | Manual staging browser flow. |
| Tour manager flow where enabled | PENDING | Manual staging browser flow. |
| Guide assignment/operations where applicable | PENDING | Manual staging browser flow. |
| Driver operations where applicable | PENDING | Manual staging browser flow. |
| Finance/payment records | PENDING | Manual staging review after payment evidence. |
| Notification/email behavior where configured | PENDING | Verify only if staging configuration enables it. |
| Mobile frontend flow | PENDING | Staging mobile viewport/device verification. |
| API authorization boundaries | PENDING | Complete applicable role and tenant boundary checks. |
| Relevant automated suites after final fixes | PENDING | Run relevant suites and record exact counts. |
| Final production-readiness audit | PENDING | Separate audit; staging evidence alone is not production certification. |
| Temporary SuperAdmin bootstrap trigger removal/disablement | PENDING | Remove/disable after bootstrap phase; never treat as permanent production feature. |

### Required next sequence — staging only

Follow this order exactly. **Never run the M-Pesa test before the tenant/tour/customer/booking isolation gates pass.**

1. Create one staging tour.
2. Verify the tour is returned only for `staging-demo-tours`.
3. Create one staging customer.
4. Verify the customer belongs to `staging-demo-tours`.
5. Create one staging booking using the staging tour and customer.
6. Verify the booking appears in `/admin/bookings`.
7. Verify the booking references the correct tenant.
8. Attempt cross-tenant access and confirm it is rejected or isolated.
9. Verify booking state before payment.
10. Only after all isolation checks pass, configure/verify staging M-Pesa sandbox.
11. Perform exactly one KES 1 sandbox STK Push test.
12. Verify callback and payment persistence.
13. Verify duplicate callback protection.
14. Verify payment does not affect another tenant.
15. Clean up disposable staging test data where safe.
16. Keep the fixed staging QA trigger for the seed phase; the obsolete temporary SuperAdmin bootstrap HTTP trigger has been removed.
17. Run final automated tests.
18. Record final results.

### Automated test history and interpretation

The bootstrap-phase full-suite result above is historical: 164 passed, 4 skipped, and one existing MongoDB-backed readiness timeout/failure was observed. That failure is not a pass. The focused bootstrap tests passed. Later, separate verification records in this file document the Atlas-backed full server suite at 136 passed, 0 failed, 0 skipped; those later results supersede older local suite snapshots only for the corresponding test run and do not erase the bootstrap-era readiness observation. The 2026-09-25 baseline recorded 136 total, 131 passed, 0 failed, 5 skipped before the later Atlas integration run. Do not combine counts from different runs.

Relevant repository commands actually recorded elsewhere in this register include `cd server && npm test`; `node --test --test-concurrency=1 tests/*.js` with database integrations enabled; `cd server && npm run test:security`; `cd server && npm run test:tour-domain`; `cd server && npm run check:all`; and client `npm run lint` / `npm run build`. Historical results and prerequisites are recorded in their dated sections below. This staging record does not claim that these commands were rerun on 2026-09-26.

Staging-related implementation merges in repository history (short descriptions are exact subjects; hashes are full merge commit IDs):

- Database isolation validation: `da67dcba603ae83ebffca7a85f0bcbadcd2eab4d` (merge; implementation commit `27ace83` is on branch `fix/isolated-staging-database`).
- Staging SuperAdmin bootstrap: `b7d2fca57f925fcf709bd161b06db99ddd15b499`.
- Temporary staging SuperAdmin trigger: `48b304f016243312a239a4df5c6c95315b1842f9`.
- Staging CORS origin handling: `a01553451e1c3d8e0adfa756e3e88b078f5057be`.
- SuperAdmin login tenant isolation: `ad544dd47a5ed6d5997d897cd08976746a3989f6`.
- No-tenant login validation follow-up: `61fc4afcb96436a227b6d4d6241692000ab0ac8c`.

The temporary HTTP bootstrap trigger was used only for staging bootstrap and has been removed. Its token/value is intentionally not recorded. The separate fixed QA seed trigger is documented below and remains staging-only.

### Evidence rules for future sessions

Future developers and Codex sessions must continue from this recorded state. Check this staging matrix before running a gate; do not repeat completed gates unnecessarily unless a deployment, code/configuration change, or new evidence invalidates them. Update each status only after collecting fresh evidence and record date, environment, endpoint, expected result, actual result, status, notes, and next action. Keep production acceptance status separate. An expected subscription denial is a successful verification of that restriction; a 404 route observation remains `OBSERVED / EXPECTED`, not a passed feature.

## 2026-09-26 — Atlas integration failure diagnosis and verification

The two initial Atlas failures had one root cause: the Atlas cluster had reached its 500-collection limit. The first-tenant request failed when MongoDB tried to create a collection implicitly on insert; the health test failed when the startup invoice-index migration needed its fresh `invoices` collection. Atlas returned code 8000 (`AtlasError`: collection limit reached), so this was neither a migration/index incompatibility nor a database-user permission failure. The target cluster showed 492 visible collections. The isolated `global_tours_test` database had 82 collections and 568 estimated test documents; those collections alone were dropped to restore test capacity. No production or other test database was changed. No application or test fixture code needed changing.

The configured Atlas URI was verified in memory as an Atlas SRV endpoint targeting `global_tours_test`; its value was never printed. Acceptance and readiness tests derive isolated disposable `fta_*` and `hr_*` database names from that Atlas test URI and guard cleanup against the expected test namespace. All integration tests ran on Atlas. No local MongoDB server was used.

| Test/check | Result |
|---|---|
| `firstTenantAcceptance.integration.test.js` targeted acceptance | PASS, 1/1; includes selected-tenant auth, `X-Tenant-ID`, JWT tenant binding, mismatched selector rejection, cross-tenant isolation, and provisioning. |
| `healthReadiness.test.js` Atlas-backed fresh-start/index-migration test | PASS, 1/1. |
| Complete server suite: `node --test --test-concurrency=1 tests/*.js`, with database integrations enabled | PASS: 136 passed, 0 failed, 0 skipped. |
| `npm run test:security` | PASS: 2 passed. |
| `npm run test:tour-domain` | PASS: 1 passed. |
| `npm run check:all` | PASS, including server syntax, controllers, models, services, seeds, tenant-model contract, and static production-readiness validation. |
| `npm run lint` (client) | PASS. |
| `npm run build` (client) | PASS. |

The runtime production launch gate remains unverified because the deployment credentials and external evidence flags are intentionally not supplied in this test environment. Earlier entries below remain historical snapshots and are superseded for Atlas integration-test status by this entry.

## 2026-09-26 — Verification of synchronized main baseline

Baseline: `9c0046633c79f230b2fcd2cc9897988d6a0c0bb5` (`main`). No application code or credential files were changed.

| Check | Result | Evidence / limitation |
|---|---|---|
| Server checks | PASS | `cd server && npm run check:all`; syntax, contracts, tenant-model contract and static production-readiness contract passed. |
| Backend suite | PASS with skips | `cd server && npm test`: 136 total, 131 passed, 0 failed, 5 skipped. Skips are first-tenant MongoDB acceptance, MongoDB-connected health/index readiness, airport-transfer payment transaction, tour-capacity transaction, and accounting rollback transaction. |
| Auth/RBAC and tour domain | PASS | `npm run test:security`: 2 passed; `npm run test:tour-domain`: 1 passed. |
| Client lint/build | PASS | `cd client && npm run lint`; `cd client && npm run build`. |
| CI workflow YAML | PASS | All seven workflow YAML files parsed. |
| MongoDB application audit | BLOCKED as onboarding evidence | The script reported `global_tours_test` has zero organizations and zero platform owners, plus empty/lazy operational collections. This is an empty test database, not evidence about production. No tenant data was seeded or altered for this audit. |
| Live transactional integration | NOT RUN | Local MongoDB is 3.6.8, below the supported 4.2 minimum. The Docker daemon denied access, preventing a temporary MongoDB 8 replica-set run. |
| Production runtime check | BLOCKED as expected | With a clean environment and no `.env` loading, production validation rejected absent runtime settings and external evidence flags. This validates fail-closed behavior only; deployment configuration was not inspected. |
| External/browser evidence | NOT VERIFIED | No live deployment/browser session, real provider payment/callback, email delivery, KRA/eTIMS submission, webhook receipt, backup or restore evidence was obtained. |

No application-code defect was demonstrated by the available checks, so no application-code fix was made. The end-to-end categories that require a supported replica set, owner-created tenant, browser/device access or external provider credentials remain unverified; static contracts and unit coverage are not substitutes for that evidence.

## 2026-09-25 — Complete system audit of local HEAD

The audited source was local branch `main` at `3e59ccad0cf5838a3a96fa6dd6a53a3ff6e834ae`. Verification used Node `v24.18.0` and npm `11.16.0`. Commands used isolated process environments and test-only values for relevant runtime settings; the ignored `server/.env` was not inspected or printed. The protected untracked backup file was left untouched. Existing untracked files under `codex-logs/` and `server/reports/` were preserved. No application code change was needed from the checks performed.

| Area | Result | Evidence |
|---|---|---|
| Server syntax, model/service contracts, security, tenancy and production readiness | PASS | `cd server && npm run check:all`; all component checks and the production readiness contract passed. |
| Backend automated suite | PASS with skips | `cd server && npm test`: 136 total, 131 passed, 0 failed, 5 skipped. Skips require MongoDB-backed replica-set/transaction acceptance. |
| Security suite | PASS | `cd server && npm run test:security`: 2 passed, 0 failed, 0 skipped. |
| Tour-domain suite | PASS | `cd server && npm run test:tour-domain`: 1 passed, 0 failed, 0 skipped. |
| Client lint and production build | PASS | `cd client && npm run lint`; `VITE_API_URL=https://api.example.invalid/api VITE_SOCKET_URL=https://api.example.invalid npm run build`. |
| Dependency tree and vulnerability audit | PASS | `npm ls --depth=0` in the client; `npm audit` in server and client each reported 0 vulnerabilities. `npm ci` was not needed because installed dependency trees were present. |
| MongoDB acceptance | BLOCKED | Installed `mongod` is 3.6.8, below the application's MongoDB 4.2 minimum; Docker is not installed. No live database acceptance was attempted. |
| Live Render, Vercel, CORS and production deployment SHA | NOT VERIFIED | No live endpoint or deployment identity check was performed during this audit. |
| M-Pesa, card/bank provider, eTIMS/KRA, Cloudinary, backup/restore | NOT VERIFIED | No live provider transaction, KRA submission, production upload, backup or restore was performed. |

The backend suite initially failed inside the sandbox because its HTTP readiness tests could not bind to loopback (`EPERM`). The same complete `npm test` command was rerun with the required local-listener permission and completed with 131 passes, 0 failures and 5 skips. This sandbox limitation is not an application test failure.

## 2026-09-25 — Continued first-tenant production audit (local source)

The audit began from `9b594ee8297d35400083a3ebe7af2ef7659ad40b` (`main` and `origin/main` matched at audit start); the verified source, tests and evidence were recorded in the local first-tenant audit commit after checks completed. Node 22 was unavailable; commands used Node `v24.18.0`. The ignored `server/.env` was moved out of discovery for backend verification and restored unchanged. Local MongoDB is `3.6.8`; Docker is unavailable. No GitHub Actions result for this local commit was obtained.

| Area | Result | Evidence |
|---|---|---|
| Backend automated suite | PASS with skips | `cd server && npm test`: 136 total, 131 passed, 0 failed, 5 skipped. Skips: first-tenant replica-set flow, connected MongoDB startup, tour lifecycle transaction, hospitality payment transaction and payment-accounting rollback transaction. |
| Tour-domain suite | PASS | `cd server && npm run test:tour-domain`: 1 passed, 0 failed, 0 skipped. |
| Security suite | PASS | `cd server && npm run test:security`: 2 passed, 0 failed, 0 skipped. |
| Full syntax/model/service/security/tenant/production checks | PASS | `cd server && npm run check:all`; tenant model contract passed and production readiness contract passed. |
| Client lint and production build | PASS | `cd client && npm run lint`; build used explicit `VITE_API_URL=https://hussein-mboya-tours.onrender.com/api`, matching HTTPS socket origin, and `VITE_PLATFORM_HOST=globaltours.com`. |
| MongoDB version guard | PASS | Full suite accepts 4.2+ and rejects 4.0, 3.6 and unknown versions. Mongoose compatibility lists MongoDB 4.2; CI target remains MongoDB 8. |
| Cloudinary optional path | PASS | Health/readiness test verified API middleware loads with Cloudinary unset, body-only multipart succeeds, and actual file upload returns 503. |
| Workflow YAML | PASS | Ruby Psych parsed all 7 `.github/workflows/*.yml` files. Node jobs target Node 22; CI uses MongoDB 8 and invokes the first-tenant test against a replica set. No candidate CI run was available. |
| Live Render | HTTP available; readiness NOT VERIFIED | Root and `/api/health` returned HTTP 200 with `application/json`. Health response body and deployed version were not captured. A follow-up request failed DNS resolution. |
| Live Vercel | HTTP available; app integration NOT VERIFIED | Root returned HTTP 200 with `text/html`; no browser or tenant API flow was run. |
| CORS | NOT VERIFIED | The CORS follow-up request failed DNS resolution; no CORS response was obtained. |
| Atlas, payment provider, M-Pesa, eTIMS, backup and restore | NOT VERIFIED | No production data operation, payment, KRA submission, backup or restore was performed or evidenced in this audit. |

The first-tenant API lifecycle itself remains **UNVERIFIED** because the only installed MongoDB is below the supported 4.2 minimum and is not a replica set. The acceptance test was skipped, not passed. The local code and test coverage do not establish production readiness.

## 2026-09-25 — Test-seed credential and acceptance-test hardening

The disposable demo seed requires `TEST_DEMO_SEED_PASSWORD` from the operator environment and omits its value from reports. The acceptance contract asserts both unsafe tenant/payment fallbacks and the MFA development bypass are disabled and that missing/invalid public tenant selection does not choose a default tenant. No seed was executed and no MongoDB writes were made by the seed.

## 2026-09-24 — Render API startup/readiness remediation

The API startup path now binds the HTTP listener before opening MongoDB and applying the required invoice indexes. The health endpoint is database-independent at the transport/middleware layer, reports actual startup/database state, and only returns healthy when MongoDB is connected and critical startup work is complete. MongoDB connection selection and startup index migration have explicit bounds. Production smoke/monitoring retain strict healthy-and-connected acceptance and retry transient startup/network states for a bounded 120 seconds.

**Live Render production result: NOT VERIFIED.** Repository-local and CI checks cannot establish that the external `PRODUCTION_API_URL` secret points to the intended active Render API or that Render has the required runtime environment configured. Record a PASS only after the smoke check receives the expected response from that external service.

## 2026-09-21 — Full production-audit remediation verification

### Repository baseline

- Verified application commit: `8f9e90bb`.
- Branch: `main`.
- The only pre-existing local worktree change was the user's `.gitignore` modification; it was preserved and not overwritten.
- A documentation workflow generates a repository-state artifact for review; it does not modify or push repository contents.

### Full verification results

| Test / check | Result | Evidence |
|---|---|---|
| Server dependency installation | PASS | `npm install`; 0 vulnerabilities |
| Full static/security/production checks | PASS | `npm run check:all` |
| Full backend test suite | PASS | 95 total; 92 passed, 0 failed, 3 skipped |
| Security tests | PASS | 4 passed, 0 failed, 0 skipped |
| Tour-domain tests | PASS | 5 passed, 0 failed |
| Targeted regression tests | PASS | 8 total; 5 passed, 0 failed, 3 skipped |
| RBAC final dry run | PASS | 19 role groups; 0 requiring normalization |
| Client dependency installation | PASS | 0 vulnerabilities |
| Client lint | PASS | `npm run lint` |
| Client production build | PASS | Vite build completed successfully |
| Production readiness contract | PASS | `npm run check:production` |

### Intentionally skipped tests

The three skipped tests were:

- airport-transfer payment completion atomic lifecycle;
- tour lifecycle transactional capacity reservation/release;
- payment-completion rollback when accounting posting fails.

They remain runtime/integration evidence gaps rather than source-code failures.

## Production certification boundary

The following are deliberately **not** marked PASS from the local run:

- current-main production deployment SHA;
- live tenant-isolation regression against the current deployment;
- M-Pesa callback/completion/replay/failure evidence;
- completed payment, invoice and accounting reconciliation using provider data;
- live KRA/eTIMS submission evidence;
- full desktop/mobile browser acceptance;
- production read-only MongoDB integrity/reconciliation scan.

## 2026-09-21 — Audit remediation completed

The production-audit remediation included:

- strict JWT issuer/audience verification;
- secure HttpOnly browser session plus CSRF protection;
- removal of legacy browser JWT persistence;
- upload extension/MIME and filename validation with tenant-scoped media;
- bounded accounting account-cache TTL;
- tenant-aware canonical RBAC normalization;
- tenant enforcement for M-Pesa refund callbacks;
- expanded security/static regression coverage.

The final RBAC dry run returned:

```json
{
  "mode": "DRY_RUN",
  "roleGroups": 19,
  "groupsRequiringNormalization": 0,
  "report": []
}
```

No database changes were made by the final dry run.

## Historical evidence

Earlier production evidence remains useful background but is not silently promoted to current-main certification. Historical records include:

- production API/website smoke;
- live tenant-isolation regression;
- encrypted MongoDB backup and isolated restore drill;
- monitoring normal and intentional-alert paths;
- M-Pesa sandbox customer authentication, booking creation and STK initiation.

Those historical results remain valid for the environments/commits where they were actually executed. They do not prove that the current deployment is running the latest main commit.

## Evidence rules

A test is documented as **PASS** only when the required evidence exists.

- **PASS:** completed with evidence.
- **FAIL:** completed and expected behavior failed.
- **BLOCKED:** prerequisite unavailable.
- **PENDING:** not yet completed.
- **NOT VERIFIED:** observed but insufficient to prove acceptance.

Never document secrets, passwords, access tokens, private keys, MFA PINs or payment-provider credentials.

<!-- DOCS-AUTO:START -->
## Automatically captured repository state

- Snapshot date (UTC): 2026-09-25
- Branch: `main`
- Commit: `9b594ee8297d35400083a3ebe7af2ef7659ad40b`
- Server package: `hussein-mboya-tours-server@1.0.0`
- Client package: `client@0.0.0`
- Automated documentation updater: `scripts/update-documentation.js`
- CI automation: `.github/workflows/documentation.yml`

The workflow generates this state for artifact review; it does not alter the repository. Historical test evidence below this section is retained and must only be updated when the corresponding test actually runs and produces evidence.

<!-- DOCS-AUTO:END -->

## 2026-09-27 — Controlled staging QA seed

Added a fixed dataset seed and verifier for the existing `Staging Demo Tours` tenant (`staging-demo-tours`, tenant ID `6ab82dce30c1fd52b9dc3e80`) in the isolated staging database `global_tours_test`. The script requires `NODE_ENV=production`, `DEPLOYMENT_ENV=staging`, `STAGING_DATABASE_NAME=global_tours_test`, and an explicit `MONGODB_URI` whose database path is exactly `global_tours_test`. It rejects `husseindb`, checks the actual connected database identity, and refuses the known production backend hostname. The script does not load dotenv or read `server/.env`.

The seed finds the existing tenant and tenant admin without changing either. It idempotently upserts one synthetic customer (`QA Staging Customer`, `qa-staging-customer@example.com`), a Maasai Mara destination, one active published upcoming tour (`QA Maasai Mara Safari`, `qa-staging-maasai-mara`, KES 25,000), and one booking (`QA-STAGING-BOOKING-001`). The booking starts pending with zero paid, and the seed creates no payment record or operational records. Stable tenant-scoped identifiers make repeated execution update/find the same records; it performs no broad deletes.

The fixed HTTP trigger remains available on the staging application as a secondary execution path. Startup and HTTP execution share the fixed seed core and durable completion marker. The startup hook is the recommended path and requires only `STAGING_QA_SEED_ON_STARTUP=true`; it uses the Render service's already configured connection. The HTTP route additionally requires `STAGING_QA_SEED_TOKEN` (random staging-only value, at least 32 characters) and the usual staging runtime values. Request shape:

```http
POST /api/internal/staging/seed-qa
X-Staging-QA-Seed-Token: <STAGING_QA_SEED_TOKEN>
Content-Type: application/json

{}
```

To seed without Render Shell or a local MongoDB URI, open the **staging** Render service (`srv-darqj87pn0mc73dl37e0`), go to **Environment**, add `STAGING_QA_SEED_ON_STARTUP` with value `true`, save, and let Render restart/deploy the service. The hook refuses to run unless `NODE_ENV=production`, `DEPLOYMENT_ENV=staging`, `STAGING_DATABASE_NAME=global_tours_test`, `MONGODB_URI` names exactly `global_tours_test`, the connected Mongoose database is exactly `global_tours_test`, and neither the database nor Render hostname is production. A seed failure prevents readiness and terminates startup. The fixed seed makes no payment calls and does not alter tenant admin credentials. After the log says `Staging QA fixture seed completed and verified.` (or already complete on a later restart), remove the flag or set it to `false`, then save. Keep the staging-only marker in place; a later intentional restart will not repeat the seed. Safe confirmation is also available through the staging `GET /api/internal/staging/verify-qa` route using its staging token, or the guarded `npm run verify:staging-qa` from an environment with staging access.

Focused automated coverage checks production/non-staging/missing/wrong target rejection, explicit `husseindb` rejection, connected database identity, existing tenant/admin, record tenant IDs and booking references, pending unpaid status with no successful payment, verification, and repeat-run idempotency. Cross-tenant regression remains in the isolated integration infrastructure; no second persistent staging tenant is created. The obsolete temporary SuperAdmin bootstrap HTTP trigger and its route tests were removed; the CLI SuperAdmin bootstrap remains. The separate staging tenant-admin password reset route remains independent.

Next functional sequence after fixture creation: verify the fixture through the staging-only verification route; use only the staging frontend to sign in as the existing staging tenant admin; confirm the QA tour is visible, create/read/update the QA booking through normal tenant flows while it remains unpaid, and run both directions of tenant-isolation checks. After those checks pass, a separate approved staging payment QA phase can exercise one sandbox STK Push, callback persistence, duplicate protection, and tenant isolation. No payment action belongs to this seed. **Staging M-Pesa acceptance has NOT yet been tested; no M-Pesa transaction or callback was performed for this work.**

## 2026-09-27 — Staging-only startup QA seed

Added an explicitly enabled, fixed-purpose startup hook for the staging Render service. Configure `STAGING_QA_SEED_ON_STARTUP=true` only on staging Render, save the Environment settings, and allow the service restart. No Render Shell, local staging MongoDB URI, or extra seed token is needed for this startup path. Once the seed succeeds and the service logs the safe completion message, unset the flag or set it to `false`.

The hook requires `NODE_ENV=production`, `DEPLOYMENT_ENV=staging`, `STAGING_DATABASE_NAME=global_tours_test`, an explicitly named matching Mongo URI database path, a matching connected Mongoose database, and a non-production Render hostname. Production `DEPLOYMENT_ENV=production`, `husseindb`, missing/mismatched configuration, and the production Render hostname are refused. Startup remains unready and exits on an explicitly enabled seed failure. A deterministic marker in `staging_qa_seed_markers` is recorded only after the existing fixture seed and read-only verification both succeed; the marker makes subsequent starts no-ops. The seed touches only the deterministic QA customer/destination/tour/booking in the fixed staging tenant, never tenant admin credentials, and does not create successful payment records, invoke M-Pesa/Safaricom, or perform broad deletes. The HTTP seed route uses this same one-shot core and marker.

Focused test coverage verifies all environment and connected-database guards, opt-in behavior, durable marker creation and repeat-start idempotency, marker target ownership, no marker after seed failure, fail-closed startup, and existing fixture isolation/payment-state assertions. The full local suite completed with **178 passed, 5 skipped, 0 failed**. The five skips are database-backed integrations; the shared `global_tours_test` integration URIs were deliberately unset so the run could not mutate staging or production data. Health HTTP tests used only ephemeral localhost servers and the configured Mongo target was an isolated localhost test name. `npm run check:all` and `git diff --check` passed. The historical Atlas error 8000 readiness failure remains documented above and its integration was not rerun against Atlas for this change. No staging/production host or database was contacted, and no payment-provider operation was performed.
