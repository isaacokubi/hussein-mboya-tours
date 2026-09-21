# Production Readiness Test Baseline

This document is the production-readiness hand-off point. Live/provider tests require evidence and must not be marked PASS from source inspection alone.

## Current state — 2026-09-17

- Repository head: `5227ddc874bd48d1eef73f965aa822b23dd58747` — production-readiness hardening through Steps 1–3.
- Step 1 merged to `main`: M-Pesa callback lifecycle integrity contracts and tenant-unique provider identifiers.
- Step 2 merged to `main`: tenant-safe operational accounting reconciliation integrity contracts.
- Step 3 merged to `main`: eTIMS production safety, adapter SSRF controls, durable audit and idempotency contracts.
- Historical CI/release baseline: PASS — CI `34990056154`; release gate `34942492468`.
- Historical production API/website smoke: PASS — run `34990056067`.
- Corrected encrypted MongoDB backup: PASS — run `34998687985`.
- Isolated MongoDB restore: PASS — run `35003760520`.
- Production monitoring normal path: PASS — run `35004893911`.
- Monitoring intentional failure/alert path: PASS — run `35005078875`; GitHub alert issue #135 created as designed.
- Customer sandbox authentication: PASS.
- Customer sandbox booking creation: PASS — booking `6aa98e90589f95fc1fad1276`, KES 690.
- M-Pesa sandbox STK initiation: PASS — provider response code `0`; request accepted for processing.

## Verified matrix

| Area | Result | Evidence |
|---|---|---|
| Server checks / backend tests | PASS | Historical CI `34990056154`; new contract tests merged through Steps 1–3 |
| Live tenant isolation regression | PASS | CI `34990056154` |
| Client lint / production build | PASS | CI `34990056154` |
| Security / Kenya readiness / final release gate | PASS | `34942492468` |
| Production API health | PASS | HTTP 200, healthy, database connected |
| Production API root | PASS | HTTP 200 |
| Production website | PASS | HTTP 200 |
| Tenant-context rejection and tenant checks | PASS | Production checks for three tenants |
| Corrected encrypted backup | PASS | `34998687985` |
| Isolated restore drill | PASS | `35003760520` |
| Monitoring healthy path | PASS | `35004893911` |
| Monitoring alert path | PASS | `35005078875`, issue #135 |
| M-Pesa sandbox STK initiation | PASS | KES 690, provider response `0` |
| M-Pesa callback code-level safeguards | PASS | Merged Step 1 contract coverage |
| Operational accounting reconciliation code-level safeguards | PASS | Merged Step 2 contract coverage |
| eTIMS adapter production safety code-level safeguards | PASS | Merged Step 3 contract coverage |

## Implemented production hardening

### Step 1 — M-Pesa callback lifecycle

The repository now contains automated contract coverage requiring tenant resolution and callback-integrity middleware, provider-result/amount/receipt validation, central payment completion/failure lifecycle usage, idempotency/overpayment protections and tenant-unique provider identifiers.

### Step 2 — Accounting reconciliation

The repository now contains contract coverage for tenant-scoped operational reconciliation. Payment, refund, expense, supplier-payable and supplier-payment flows must use tenant-aware existence checks before posting; posting failures are collected as reconciliation errors rather than reported as a clean success.

### Step 3 — eTIMS production safety

The eTIMS service is contract-tested for HTTPS-only production adapters, rejection of private/local targets, tenant-scoped invoice/tax/credential access, durable submission auditing, idempotency keys, fail-closed behavior when no adapter is configured, retry state and persistence of provider identifiers.

These are code-level controls. They do not constitute KRA certification or live provider acceptance.

## Backup / restore

An earlier backup run `34993023892` passed encryption/upload/decryption/gzip checks but was found during restore validation to contain `backups.backup` instead of the application database. Restore run `34995112932` correctly failed application-data validation. Backup validation was then hardened.

Corrected backup run `34998687985` passed application-data validation and included expected application collections. Restore run `35003760520` successfully restored the corrected backup into an isolated target and passed database-content validation. No connection strings or secrets are recorded here.

## Monitoring

Normal monitoring run `35004893911` passed the production API/database and website checks. The intentional failure run `35005078875` deliberately failed without modifying production and created GitHub issue #135, proving the alert path.

## M-Pesa sandbox

The current sandbox evidence proves:

1. Customer authentication succeeds.
2. A KES 690 MPESA booking can be created.
3. The local application can initiate an M-Pesa sandbox STK Push.
4. The provider accepts the request with response code `0`.

The checkout request used for this evidence is `ws_CO_150920262132451700100001`.

**Important:** STK initiation is not payment completion. Callback delivery, payment completion, booking update, invoice/journal/reconciliation, duplicate callback replay and failed/expired payment scenarios still require provider-level evidence. The configured callback previously pointed at a Render deployment that was not running current `main`; callback acceptance therefore needs an approved public HTTPS sandbox target.

Sandbox evidence must remain separate from live production payment acceptance.

## Deployment currency

Historical production smoke was healthy, but the production API previously reported deployed version `73a5127695b2b8461c50ec034420af252881b5e6` while repository head was `f0203925`. Therefore current-main deployment remains **NOT VERIFIED** until the deployment target reports the new `main` commit. Render/Vercel changes are not performed automatically by this repository work.

## Remaining acceptance

| Test | Status |
|---|---|
| M-Pesa sandbox callback | PENDING |
| Payment/booking completion after callback | PENDING |
| Payment, invoice and accounting reconciliation against real provider data | PENDING |
| Duplicate M-Pesa callback/replay evidence | PENDING |
| Failed/expired M-Pesa provider evidence | PENDING |
| Live KRA/eTIMS submission and receipt evidence | PENDING |
| Full desktop/mobile browser acceptance | PENDING |
| Current-main production deployment | NOT VERIFIED |
| Kenya operator-specific TRA/ODPC compliance | EXTERNAL / OPERATOR-SPECIFIC |

## Acceptance rules

- PASS requires the required evidence.
- FAIL means the test was executed and the expected result was not met.
- BLOCKED means an external prerequisite prevents execution.
- PENDING means the test has not yet been completed.
- NOT VERIFIED means an observation exists but does not prove the acceptance criterion.
- Never record passwords, access tokens, private keys, MFA PINs or payment-provider secrets.

## Historical references

- Release gate: `34942492468`
- CI verification: `34990056154`
- Production smoke: `34990056067`
- Corrected backup: `34998687985`
- Corrected restore: `35003760520`
- Monitoring healthy path: `35004893911`
- Monitoring alert path: `35005078875`
- Previous documented head: `f0203925`
- Current main after production-readiness hardening: `5227ddc874bd48d1eef73f965aa822b23dd58747`

<!-- DOCS-AUTO:START -->
## Current repository state

This section is maintained automatically by `scripts/update-documentation.js` and the GitHub Actions documentation workflow.

- **Repository:** Global Tours — multi-tenant tours & travel SaaS
- **Branch:** `main`
- **Current commit:** `23a130728619460c0952b6e45faef32352e3fd5c`
- **Short commit:** `23a13072`
- **Documentation snapshot date (UTC):** 2026-09-21
- **Server package:** `hussein-mboya-tours-server@1.0.0`
- **Client package:** `client@0.0.0`
- **Server verification commands:** `npm run check:all`, `npm test`, `npm run test:security`, `npm run test:tour-domain`
- **Client verification commands:** `npm run lint`, `npm run build`
- **Production contract:** `npm run check:production`
- **Release rule:** production certification requires current deployment/provider evidence; local or CI source checks alone do not certify live production.

### Documentation automation

Every push to `main` runs the documentation workflow. It refreshes this generated repository-state section and commits documentation-only changes when the generated content changes. Manual edits outside the generated markers are preserved.

<!-- DOCS-AUTO:END -->
