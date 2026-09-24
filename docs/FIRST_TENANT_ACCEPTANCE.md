# First Tenant Production Acceptance

## Current decision

**CODE READY — EXTERNAL EVIDENCE REMAINING.** This is not a production certification. The current live Render API identifies itself as commit `aabbe5b2feddcf844c187b57f5934d9a16fadb00`, while the local source includes newer startup behavior. Deploy the reviewed local commits and repeat the live checks before onboarding a real tenant.

## Environment contract

| Variable | Used by | Required | Safe/default | Secret | Service / failure behavior |
|---|---|---:|---|---:|---|
| `MONGODB_URI` | Mongoose | Yes | No default | Yes | Render API; missing value prevents startup; unreachable MongoDB leaves health degraded then critical startup exits. |
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
| `VITE_API_URL` | Axios API base URL | Yes for deployed Vercel frontend | Must be `https://hussein-mboya-tours.onrender.com/api` for this deployment | No | Vercel build environment; missing value falls back to same-origin `/api`, which is wrong for separate Vercel/Render hosts. |
| `VITE_SOCKET_URL` | Socket.IO | Recommended; optional when `VITE_API_URL` is absolute | `https://hussein-mboya-tours.onrender.com` | No | Vercel build environment; frontend now derives the origin from absolute `VITE_API_URL` when unset. |
| `VITE_PLATFORM_HOST` | client tenant-host parsing | Required for tenant subdomains | Exact platform domain, no scheme | No | Vercel build environment; missing value disables platform-subdomain parsing. |
| `VITE_PUBLIC_TENANT_SLUG` | tenant selection on shared Vercel hostname | Required when using one shared non-tenant hostname for a tenant website | Public slug, not a secret | No | Vercel build environment; do not use one fixed slug for a shared multi-tenant host. Prefer tenant subdomains/custom domains. |
| `PRODUCTION_API_URL` | GitHub smoke/monitoring workflows | Required to run external API check | Exact API origin, no `/api`: `https://hussein-mboya-tours.onrender.com` | No | GitHub Actions secret; workflow checks `/api/health` and requires healthy + connected. |
| `PRODUCTION_WEB_URL` | GitHub smoke/monitoring workflows | Required to run external frontend check | `https://hussein-mboya-tours.vercel.app` | No | GitHub Actions secret; checks actual frontend response. |
| `BOOTSTRAP_*` | one-time CLI setup only | Only before first platform owner exists | Prompted interactively when omitted | Password values are secret | Operator shell/backend only; never Vite or browser. The script refuses after an active SuperAdmin exists. |

Tenant M-Pesa credentials, tenant integration keys, eTIMS credentials and payment gateway configuration are persisted in tenant-scoped MongoDB records. They are not Render global environment variables. `render.yaml` declares secret keys with `sync: false`; populate values in the Render dashboard without putting values in Git.

The production database must use a currently supported MongoDB deployment with replica-set transactions enabled. Tenant creation provisions Organization, Admin and settings transactionally. CI uses MongoDB 8 replica-set integration; this audit did not use the installed local MongoDB 3.6 binary.

## Tenant URL behavior

The API resolves tenants from a verified tenant subdomain under `PLATFORM_HOST`, an Organization custom `domain`, an authenticated tenant claim, or explicit tenant selection checked against authentication. Arbitrary forwarded headers alone do not bypass token/user tenant validation. The browser's public selector `X-Tenant-Slug` is an identifier, not authorization. The current shared Vercel hostname needs `VITE_PUBLIC_TENANT_SLUG` for a single tenant presentation; serving multiple tenants from that host requires tenant subdomains/custom domains plus Vercel domain routing and `VITE_PLATFORM_HOST`.

## First tenant procedure

1. Configure all mandatory production environment variables above and confirm `/api/health` stays non-healthy until MongoDB and required invoice index migration are ready.
2. If this is a new database, run the controlled interactive `cd server && npm run bootstrap:first`. This seeds roles and creates the initial company, platform owner and first company Admin. Never invoke the retired public bootstrap endpoint.
3. For a later tenant, sign in as the platform owner and use SuperAdmin → Tenants, backed by `POST /api/superadmin/tenants`. The transaction creates Organization + unique slug + tenant Admin + default settings. Normal users cannot access this route.
4. Test tenant Admin login, `/api/auth/me`, dashboard, and tenant-scoped destination/tour/package/customer/booking routes with disposable test data. Confirm the tenant context in the URL/host matches the token and tenant membership.
5. Configure branding, tenant website settings, website integration keys, and per-tenant payment gateways. Test website integration using a publishable test key and no real financial transaction.
6. Verify a second tenant cannot read/update/delete the first tenant's records. Test unknown and suspended tenant behavior.
7. Only enable production payment provider mode after callback URL ownership, credentials, signature verification, idempotency/replay and reconciliation have external evidence.

## Acceptance evidence

| Area | Result | Evidence / limitation |
|---|---|---|
| Local code and static contracts | PASS | `npm test`, `npm run test:tour-domain`, `npm run test:security`, `npm run check:all`, client lint/build and workflow YAML parse passed; details in `TEST_EVIDENCE.md`. |
| Tenant isolation | PASS for unit/contracts; live database UNVERIFIED | Static/unit tenant tests passed. Live regression requires MongoDB 8-compatible service; local MongoDB 3.6.8 is unsupported and was not used. |
| Production API | UNVERIFIED for current local commit | Live endpoint currently returns healthy/connected but reports deployed commit `aabbe5b...`; local `b46ad31...` is not deployed. |
| Production frontend | Responds, integration configuration UNVERIFIED | Vercel returns HTTP 200; project build env and tenant domain mapping require Vercel access. |
| Database/Atlas | UNVERIFIED | Need Atlas cluster version, network access, backup/PITR, restore drill, indexes and current-deployment health evidence. |
| Payments/M-Pesa | UNVERIFIED | Need tenant-owned sandbox callback/replay/failure evidence before live credentials/transactions. |
| First tenant onboarding | UNVERIFIED in runtime | Dedicated MongoDB replica-set CI test provisions two tenants through the platform-owner API, logs in both admins, exercises dashboard, tenant-admin package provisioning, and tenant-scoped destination/package catalogs, verifies cross-tenant denial and checks safe M-Pesa configuration failure. The local run skips without MongoDB 8 replica-set access. No provider payment is started. |
| KRA/eTIMS | UNVERIFIED | Requires tenant KRA onboarding and certified adapter evidence. |

## External operator actions

- Render: deploy the reviewed commit; ensure required MongoDB, JWT, payment encryption and webhook keys are present; configure HTTPS client origins and real platform host; keep all development fallback flags false. Do not copy production secrets into Git.
- Vercel: set `VITE_API_URL` to the exact API URL above at build time; set `VITE_SOCKET_URL` to the API origin explicitly or allow the frontend to derive it from `VITE_API_URL`. Configure tenant-host behavior and redeploy. `vercel.json` intentionally contains no secrets or authoritative hostname.
- GitHub: set `PRODUCTION_API_URL` to the API origin above and `PRODUCTION_WEB_URL` to the frontend origin above. Never include an `/api` suffix in the API secret.
- MongoDB Atlas: verify production-compatible MongoDB 8 behavior, indexes, TLS/network allow-list, backups/PITR, restore, credentials rotation and tenant isolation scan.
- Payment providers: issue each tenant its own credentials and configure production callback domains. Validate M-Pesa callback integrity and idempotency in sandbox first. Keep `ALLOW_GLOBAL_MPESA_FALLBACK=false`.
- Operations: collect monitoring/alert routing, backup/restore, data protection, browser acceptance, payment and eTIMS evidence before claiming production certification.
