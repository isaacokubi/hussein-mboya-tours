# Global Tours

Kenya-focused multi-tenant tour-operator platform.

## Production test status

**Current repository HEAD:** `f0203925` — Add production monitoring and alert verification.

The repository has completed the current Step 1 production infrastructure/disaster-recovery/monitoring acceptance and has begun Step 2 Kenya financial acceptance using the **M-Pesa sandbox**. External production deployment currency is still not certified because the Render and Vercel integrations were intentionally disconnected from GitHub.

### Verified automated and live tests

| Test | Result | Evidence |
|---|---|---|
| Server production checks (`npm run check:all`) | PASS | CI run `34990056154` |
| Backend automated tests (`npm test`) | PASS | CI run `34990056154` |
| Live tenant-isolation regression | PASS | CI run `34990056154` |
| Client ESLint | PASS | CI run `34990056154` |
| Client production build | PASS | CI run `34990056154` |
| Security and tenant-integrity release gate | PASS | Release gate `34942492468` |
| Kenya production-readiness release phase | PASS | Release gate `34942492468` |
| Final release gate | PASS | Release gate `34942492468` |
| Production API `/api/health` | PASS | Live HTTP 200; healthy; database connected |
| Production API `/` | PASS | Live HTTP 200; expected API success response |
| Production website | PASS | Live HTTP 200 from Vercel |
| Production smoke workflow | PASS | Run `34990056067` |
| Corrected encrypted MongoDB backup | PASS | Run `34998687985`; encrypted artifact, checksum and isolated application-data validation |
| Isolated MongoDB restore drill | PASS | Run `35003760520`; restore and restored-database validation passed |
| Production monitoring normal-path test | PASS | Run `35004893911`; API and website checks passed |
| Production monitoring intentional alert test | PASS | Run `35005078875`; simulated failure created alert issue #135 |
| Customer authentication for payment acceptance | PASS | Local customer login succeeded; no secret/token recorded |
| Sandbox booking creation | PASS | Booking `6aa98e90589f95fc1fad1276`; KES 690; pending payment |
| M-Pesa sandbox STK initiation | PASS | Checkout request `ws_CO_150920262132451700100001`; provider response code `0` |

### M-Pesa sandbox acceptance status

The M-Pesa sandbox STK request for booking `6aa98e90589f95fc1fad1276` was accepted by the provider for **KES 690**. The application returned `success: true`, provider response code `0`, and `Success. Request accepted for processing`.

This proves **STK initiation**, not payment completion. The callback currently points to the existing Render URL, while Render is intentionally disconnected and is not running the latest repository commit. Therefore the following remain pending until callback delivery is captured against an approved test target:

- STK callback receipt and callback integrity validation.
- Payment completion and booking status transition.
- Invoice/payment journal and reconciliation verification.
- Duplicate callback/idempotency acceptance.
- Failed/expired M-Pesa acceptance.

Sandbox evidence must not be represented as live production payment acceptance.

### Production monitoring evidence

Normal monitoring run `35004893911` passed the production API and website checks. The API reported healthy/connected status; observed API latency was approximately 821 ms and website latency approximately 278 ms.

Intentional failure run `35005078875` deliberately exercised the alert path without modifying production. The run failed as designed and created GitHub issue **#135 — Production monitoring alert**, proving the monitoring alert path.

### Backup and restore evidence

The earlier backup/restore investigation found a bad source database and the workflow was hardened to reject archives without expected application collections. The corrected backup run `34998687985` then passed encrypted backup creation and isolated application-data validation. The artifact was retained with its checksum and the restore drill `35003760520` successfully restored and validated the application database in an isolated target.

The backup evidence includes application collections such as users, bookings, tours, payments, invoices, journal entries, security logs, notifications, eTIMS submissions/credentials and other operational data. No backup secret or connection string is documented here.

### Production deployment currency

Live production smoke checks are healthy, but the production API reported deployed version `73a5127695b2b8461c50ec034420af252881b5e6`, which is older than current repository `f0203925`. Render and Vercel were intentionally disconnected from GitHub and must not be reconnected unless explicitly requested. Therefore **deployment currency is NOT VERIFIED** against current `main`.

### Tests still pending external evidence

These are not marked PASS without the required evidence:

- M-Pesa sandbox callback → payment completion → booking update → accounting/reconciliation.
- Duplicate M-Pesa callback/idempotency replay.
- Failed/expired M-Pesa behavior.
- Live KRA/eTIMS production submission and receipt/control-number evidence.
- Full manual desktop/mobile browser acceptance across customer, Admin, Finance, Tour Manager, Driver and SuperAdmin flows.
- Deployment of the intended current `main` release to production.

A test is recorded as **PASS** only when its required evidence exists. Provider/infrastructure limitations may be recorded as **BLOCKED** or **NOT VERIFIED**; they must not be represented as successful based on code inspection alone.

## Production readiness baseline

The repository's automated security, multi-tenancy, subscription lifecycle, financial/compliance infrastructure, production safeguards, monitoring, backup/restore validation, and frontend release checks have a passing baseline. See [`docs/PRODUCTION_READINESS.md`](docs/PRODUCTION_READINESS.md) for the authoritative readiness matrix and [`docs/TEST_EVIDENCE.md`](docs/TEST_EVIDENCE.md) for the chronological evidence register.

## Current implementation scope

The platform includes tenant-scoped bookings, customers, tours, payments, invoices, Kenyan tax configuration, eTIMS integration architecture, supplier/procurement workflows, profitability, corporate controls, external-website booking capture, developer API/webhooks, and operational foundations.

Subscription lifecycle enforcement, tenant isolation safeguards, financial reconciliation infrastructure, security controls, production error handling, health/observability infrastructure, backup/restore safeguards, monitoring and release-gate automation are part of the current production-readiness baseline.

Optional enterprise integrations such as GDS/flight booking, hotel inventory APIs, travel insurance, enterprise SSO and advanced bank integrations are not prerequisites for the core Kenyan tour-operator product.

## Production documentation

- [`docs/PRODUCTION_READINESS.md`](docs/PRODUCTION_READINESS.md) — authoritative readiness matrix, test evidence and release rules.
- [`docs/TEST_EVIDENCE.md`](docs/TEST_EVIDENCE.md) — chronological record of verified tests and remaining acceptance gaps.
