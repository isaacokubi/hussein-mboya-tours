# First Tenant Production Acceptance

## Current decision

**NOT READY.** The expanded end-to-end acceptance test is present and wired into the MongoDB 8 replica-set CI job, but this worktree's database-backed test has not run and no CI result for this candidate was obtained. On 2026-09-25, a read-only probe returned HTTP 200 for the Render root and `/api/health` (JSON content type) and HTTP 200 HTML for Vercel. The health body, CORS behavior and live API version were not established; a repeat probe failed DNS resolution. Complete the database-backed test and required external evidence before onboarding a real tenant.

## Environment contract

Production and integration use separate variables. Render keeps its existing `MONGODB_URI` Atlas connection targeting `/husseindb`. Atlas integration verification uses `FIRST_TENANT_TEST_MONGODB_URI` and/or `HEALTH_TEST_MONGODB_URI` targeting a separately available disposable `global_tours_test` database; transactional lifecycle tests use `LIFECYCLE_TEST_MONGODB_URI` plus `RUN_DATABASE_INTEGRATION_TESTS=true`. The integration URI values are never substituted for production `MONGODB_URI`. Do not use production `husseindb` for acceptance or lifecycle tests, and do not create a test database automatically. Without the relevant explicit test URI, database integration tests remain skipped; ordinary unit/static tests need no MongoDB server.

| Variable | Used by | Required | Safe/default | Secret | Service / failure behavior |
|---|---|---:|---|---:|---|
| `MONGODB_URI` | Mongoose | Yes | No default | Yes | Render API; missing value prevents startup; unreachable MongoDB leaves health degraded then critical startup exits. The current driver requires MongoDB 4.2 or newer; CI acceptance uses MongoDB 8 with replica-set transactions. |
| `FIRST_TENANT_TEST_MONGODB_URI` | First-tenant acceptance integration test | Optional, explicit opt-in | No default; must target disposable Atlas `global_tours_test`; test derives a uniquely named disposable database | Yes | Local test runner/CI only; unset means the test is skipped. Never set it to production `husseindb`. |
| `HEALTH_TEST_MONGODB_URI` | MongoDB-backed health and startup-index integration test | Optional, explicit opt-in | No default; must target disposable Atlas `global_tours_test`; test derives a uniquely named disposable database | Yes | Local test runner/CI only; unset means the database-backed test is skipped. Never set it to production `husseindb`. |
| `LIFECYCLE_TEST_MONGODB_URI` + `RUN_DATABASE_INTEGRATION_TESTS=true` | Transactional lifecycle integration tests | Optional, explicit opt-in | Dedicated disposable test database; refuses `husseindb`; no fallback to `MONGODB_URI` | Yes | Local test runner/CI only; normal backend suite skips unless both are explicitly configured. Atlas is preferred. |
| `MONGODB_SERVER_SELECTION_TIMEOUT_MS` | Mongoose | No | 10000 ms, bounded | No | Render API; connection attempts are bounded. |
| `MONGODB_STARTUP_MIGRATION_TIMEOUT_MS` | invoice-index startup migration | No | 60000 ms, max 120000 | No | Render API; migration failure is fatal and health never becomes healthy. |
| `JWT_SECRET` | JWT sign/verify | Yes | No production fallback; production requires 32+ mixed-case/numeric chars | Yes | Render API; invalid/missing production secret prevents startup. |
| `JWT_EXPIRES_IN` | JWT generation | No | 7d | No | Render API. |
| `CLIENT_URL`, `CLIENT_ORIGINS` | CORS and Socket.IO | At least one HTTPS origin in production | No production localhost | No | Render API; invalid or missing origins prevent startup. Use the Vercel frontend origin(s). |
| `PLATFORM_HOST` | tenant subdomain routing | Yes for production runtime certification | No production placeholder | No | Render API; missing/placeholder is rejected by runtime readiness validation. |
| `ALLOW_SINGLE_TENANT_DEV_FALLBACK` | tenant middleware | No | false | No | Render API; true is forbidden in production. |
| `ALLOW_GLOBAL_MPESA_FALLBACK` | M-Pesa provider selection | No | false | No | Render API; true is forbidden in production; M-Pesa configuration must be tenant-scoped. |
| `MFA_DEV_MODE` | customer MFA | No | false | No | Render API; true is forbidden in production. |
| `PAYMENT_CREDENTIAL_ENCRYPTION_KEY` | tenant payment credential encryption | Yes in production | No fallback in production; use independent strong 32+ char secret | Yes | Render API; missing/weak value prevents startup and payment config writes must fail closed. |
| `WEBHOOK_SECRET_KEY` | webhook secret encryption/signing | Yes in production | Independent strong 32+ char secret | Yes | Render API; missing/weak value prevents startup. |
| `ETIMS_CREDENTIAL_ENCRYPTION_KEY` | tenant eTIMS credential encryption | Required when eTIMS is configured | No fallback for production eTIMS | Yes | Render API; configured eTIMS without this key fails readiness/configuration. |
| `ETIMS_ADAPTER_URL`, `ETIMS_ADAPTER_TOKEN` | certified external adapter | Optional until tenant KRA setup | Empty means eTIMS adapter unavailable | Token is secret | Render API; no KRA certification is implied. |
| `MPESA_*` platform credentials | legacy provider adapter | Not needed for tenant mode | Empty; global fallback disabled | Yes | Render API; production transactions use tenant gateway settings only. Missing tenant credentials produce safe configuration failure. |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | legacy Stripe adapter | Provider-specific | Empty | Yes | Render API; configure provider credentials per tenant where supported; no real charge in acceptance tests. |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | media upload/delete | Optional | Empty | API secret is secret | Render API; service still starts; upload/delete that requires provider returns 503. |
| `SMTP_*`, `EMAIL_*` | outbound email | Optional for core API startup; required for email delivery workflows | Empty | Credentials are secret | Render API; delivery must report unavailable/failure, never mark unsent mail delivered. |
| `OPENAI_API_KEY` | optional AI | No | Empty | Yes | Render API; AI features unavailable without provider. |
| `VITE_API_URL` | Axios API base URL | Yes for deployed Vercel frontend | Must be `https://hussein-mboya-tours.onrender.com/api` for this deployment | No | Vercel build environment; production build fails closed if missing, non-HTTPS, local, or not ending in `/api`. |
| `VITE_SOCKET_URL` | Socket.IO | Recommended; optional when `VITE_API_URL` is absolute | `https://hussein-mboya-tours.onrender.com` | No | Vercel build environment; frontend now derives the origin from absolute `VITE_API_URL` when unset. |
| `VITE_PLATFORM_HOST` | client tenant-host parsing | Required for tenant subdomains | Exact platform domain, no scheme | No | Vercel build environment; missing value disables platform-subdomain parsing. |
| `VITE_PUBLIC_TENANT_SLUG` | tenant selection on shared Vercel hostname | Required when using one shared non-tenant hostname for a tenant website | Public slug, not a secret | No | Vercel build environment; do not use one fixed slug for a shared multi-tenant host. Prefer tenant subdomains/custom domains. |
| `PRODUCTION_API_URL` | GitHub smoke/monitoring workflows | Required to run external API check | Exact API origin, no `/api`: `https://hussein-mboya-tours.onrender.com` | No | GitHub Actions secret; workflow checks `/api/health` and requires healthy + connected. |
| `PRODUCTION_WEB_URL` | GitHub smoke/monitoring workflows | Required to run external frontend check | `https://hussein-mboya-tours.vercel.app` | No | GitHub Actions secret; checks actual frontend response. |
| `BOOTSTRAP_*` | one-time CLI setup only | Only before first platform owner exists | Prompted interactively when omitted | Password values are secret | Operator shell/backend only; never Vite or browser. The script refuses after an active SuperAdmin exists. |

Tenant M-Pesa credentials, tenant integration keys, eTIMS credentials and payment gateway configuration are persisted in tenant-scoped MongoDB records. They are not Render global environment variables. `render.yaml` declares secret keys with `sync: false`; populate values in the Render dashboard without putting values in Git.

The locked Mongoose 8.24.1 / MongoDB Node driver 6.20 dependency supports MongoDB 4.2 as the application minimum; tenant provisioning also requires replica-set transaction support. CI deliberately tests on MongoDB 8. This minimum is based on the [Mongoose 8 compatibility table](https://mongoosejs.com/docs/8.x/docs/compatibility.html). The installed local server is MongoDB 3.6.8 and Docker is unavailable, so it was not used for acceptance.

## Tenant URL behavior

The API resolves tenants from a verified tenant subdomain under `PLATFORM_HOST`, an Organization custom `domain`, an authenticated tenant claim, or explicit tenant selection checked against authentication. Arbitrary forwarded headers alone do not bypass token/user tenant validation. The browser's public selector `X-Tenant-Slug` is an identifier, not authorization. The current shared Vercel hostname needs `VITE_PUBLIC_TENANT_SLUG` for a single tenant presentation; serving multiple tenants from that host requires tenant subdomains/custom domains plus Vercel domain routing and `VITE_PLATFORM_HOST`.

## First tenant procedure

1. Configure all mandatory production environment variables above and confirm `/api/health` stays non-healthy until MongoDB and required invoice index migration are ready.
2. If this is a new database, run the controlled interactive `cd server && npm run bootstrap:first`. This seeds roles and creates the initial company, platform owner and first company Admin. Never invoke the retired public bootstrap endpoint.
3. For a later tenant, sign in as the platform owner and use SuperAdmin → Tenants, backed by `POST /api/superadmin/tenants`. The transaction creates Organization + unique slug + tenant Admin + default settings. Normal users cannot access this route.
4. Test tenant Admin login, `/api/auth/me`, dashboard, branding/settings, destination/tour/package creation, package publication, public package/tour catalogs, customer registration, booking creation, and tenant-admin booking retrieval with disposable data. Confirm the URL/host tenant matches the authenticated tenant.
5. Configure branding, tenant website settings, website integration keys, and per-tenant payment gateways. Test website integration using a publishable test key and no real financial transaction.
6. Verify a second tenant cannot read/update/delete the first tenant's records. Test unknown and suspended tenant behavior.
7. Only enable production payment provider mode after callback URL ownership, credentials, signature verification, idempotency/replay and reconciliation have external evidence.

## Acceptance evidence

| Area | Result | Evidence / limitation |
|---|---|---|
| Local code and static contracts | PASS | Node 24.18.0 `npm test`: 136 total (131 pass, 0 fail, 5 skip); tour-domain 1 pass; security 2 pass; `check:all`, client lint/build and parsing of all 7 workflow YAML files pass. |
| Tenant isolation | PASS for unit/contracts; live database UNVERIFIED | Tenant middleware, selectors, authorization and query-contract tests passed locally; live database acceptance was not run. |
| Production API | NOT VERIFIED | Read-only check: Render root and `/api/health` returned HTTP 200 with JSON content type. The health payload and deployed version were not captured; retry failed DNS resolution. |
| Production frontend | HTTP available; integration configuration UNVERIFIED | Vercel root returned HTTP 200 with `text/html`; no browser/API tenant flow was run. |
| Database/Atlas | UNVERIFIED | Need Atlas cluster version, network access, backup/PITR, restore drill, indexes and current-deployment health evidence. |
| Payments/M-Pesa | UNVERIFIED | Need tenant-owned sandbox callback/replay/failure evidence before live credentials/transactions. |
| First tenant onboarding | UNVERIFIED in runtime | Test source covers owner login and `/me`, first tenant provisioning, tenant-admin login and `/me`, dashboard, branding/public settings, destination and tour creation, package creation/publication plus invalid create/partial-update regression cases, public catalogues, customer registration/login/`/me`, pending booking and admin retrieval, second tenant, cross-tenant tour/destination/customer/booking/payment/user isolation, package list/update isolation, tenant B catalogue/settings isolation, platform-role denial, missing tenant M-Pesa configuration and disabled fallbacks/MFA dev bypass. No package GET-by-ID route exists; package reads are covered through tenant-scoped catalogues/lists. It runs only against a loopback disposable `first_tenant_acceptance*` database and was skipped locally; no payment provider is called. |
| KRA/eTIMS | UNVERIFIED | Requires tenant KRA onboarding and certified adapter evidence. |

## External operator actions

- Render: deploy the reviewed commit; ensure required MongoDB, JWT, payment encryption and webhook keys are present; configure HTTPS client origins and real platform host; keep all development fallback flags false. Do not copy production secrets into Git.
- Vercel: set `VITE_API_URL` to the exact API URL above at build time; production build now fails if it is missing or malformed. Set `VITE_SOCKET_URL` to the API origin or allow the frontend to derive it. Set `VITE_PLATFORM_HOST` and either map tenant subdomains/custom domains or set the single tenant's `VITE_PUBLIC_TENANT_SLUG` on the shared Vercel hostname. `vercel.json` intentionally contains no secrets or authoritative hostname.
- GitHub: set `PRODUCTION_API_URL` to the API origin above and `PRODUCTION_WEB_URL` to the frontend origin above. Never include an `/api` suffix in the API secret.
- MongoDB Atlas: verify a replica-set deployment on the supported MongoDB 4.2+ application minimum (MongoDB 8 is the CI target), indexes, TLS/network allow-list, backups/PITR, restore, credentials rotation and tenant isolation scan.
- Payment providers: issue each tenant its own credentials and configure production callback domains. Validate M-Pesa callback integrity and idempotency in sandbox first. Keep `ALLOW_GLOBAL_MPESA_FALLBACK=false`.
- Operations: collect monitoring/alert routing, backup/restore, data protection, browser acceptance, payment and eTIMS evidence before claiming production certification.
