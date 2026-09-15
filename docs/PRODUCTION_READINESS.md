# Production Readiness Test Baseline

This document is the production-readiness hand-off point. Live/provider tests require evidence and must not be marked PASS from source inspection alone.

## Current state — 2026-09-15

- Repository head: `f0203925` — monitoring and alert verification.
- CI/release baseline: PASS — CI `34990056154`; release gate `34942492468`.
- Production API/website smoke: PASS — run `34990056067`.
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
| Server checks / backend tests | PASS | CI `34990056154` |
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

## Backup / restore

An earlier backup run `34993023892` passed encryption/upload/decryption/gzip checks but was found during restore validation to contain `backups.backup` instead of the application database. Restore run `34995112932` correctly failed application-data validation. Backup validation was then hardened.

Corrected backup run `34998687985` passed application-data validation and included expected application collections. Restore run `35003760520` successfully restored the corrected backup into an isolated target and passed database-content validation. No connection strings or secrets are recorded here.

## Monitoring

Normal monitoring run `35004893911` passed the production API/database and website checks. The intentional failure run `35005078875` deliberately failed without modifying production and created GitHub issue #135, proving the alert path.

## M-Pesa sandbox

The current sandbox test proves:

1. Customer authentication succeeds.
2. A KES 690 MPESA booking can be created.
3. The local application can initiate an M-Pesa sandbox STK Push.
4. The provider accepts the request with response code `0`.

The checkout request used for this evidence is `ws_CO_150920262132451700100001`.

**Important:** STK initiation is not payment completion. Callback delivery, payment completion, booking update, invoice/journal/reconciliation, duplicate callback protection and failed/expired payment scenarios remain pending. The configured callback points at the existing Render deployment, which is intentionally disconnected from GitHub and is not running current `main`; callback acceptance therefore needs an approved public HTTPS sandbox target.

Sandbox evidence must remain separate from live production payment acceptance.

## Deployment currency

Production smoke is healthy, but the production API reported deployed version `73a5127695b2b8461c50ec034420af252881b5e6` while current repository head is `f0203925`. Therefore deployment currency is **NOT VERIFIED**. Render and Vercel must not be reconnected unless explicitly requested.

## Remaining acceptance

| Test | Status |
|---|---|
| M-Pesa sandbox callback | PENDING |
| Payment/booking completion after callback | PENDING |
| Payment, invoice and accounting reconciliation | PENDING |
| Duplicate M-Pesa callback/idempotency | PENDING |
| Failed/expired M-Pesa | PENDING |
| Live KRA/eTIMS submission and receipt evidence | PENDING |
| Full desktop/mobile browser acceptance | PENDING |
| Current-main production deployment | NOT VERIFIED |

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
- Current head: `f0203925`
