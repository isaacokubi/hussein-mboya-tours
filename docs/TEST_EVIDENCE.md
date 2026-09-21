# Global Tours — Test Evidence Register

## 2026-09-21 — Production audit remediation

### Code remediation — MERGED

- Audit-remediation PR **#144** was merged into the main branch.
- Current main commit: 6f530243993b847e887595b9247b6435aaa12541.
- Browser authentication now uses an HttpOnly session cookie plus a separate CSRF token for state-changing cookie-authenticated requests.
- JWT issuer/audience verification is strict; the previous compatibility fallback is removed.
- MFA and public tenant onboarding now establish the same secure session cookie.
- Legacy browser JWT persistence and the dedicated M-Pesa browser bearer-token client were removed.
- Upload type/filename validation and tenant media scoping were hardened.
- Accounting account-cache entries now expire instead of remaining indefinitely.
- Legacy role migration is now tenant-aware and dry-run-first, with canonical RBAC normalization.
- New security/RBAC regression tests are included in the server test suite.

### Verification boundary — NOT YET PASS

The remediation merge itself is not test evidence. Current-head automated CI execution was not available through the repository connector at the time this section was recorded, so no new PASS is claimed here.

The following still require live/current-head evidence before production certification:

- current main server checks and automated tests;
- current-head live tenant-isolation regression;
- current-head client lint/build;
- browser/mobile acceptance;
- M-Pesa sandbox callback completion, duplicate callback, failed/expired payment and accounting reconciliation;
- current production deployment SHA verification;
- read-only production data-integrity reconciliation.

This file is the chronological evidence register for tests that have actually passed. Do not convert a pending or code-only check into a PASS without the required evidence.

## 2026-09-15 — Current verification

### Repository / CI baseline — PASS

- Current repository head: `f0203925` — Add production monitoring and alert verification.
- CI release checks run `34990056154` — PASS.
- Server production checks (`npm run check:all`) — PASS.
- Backend automated tests (`npm test`) — PASS.
- Live tenant-isolation regression (`npm run check:multitenancy:live`) — PASS.
- Client ESLint — PASS.
- Client production build — PASS.
- Previously certified security/tenant-integrity, Kenya readiness and final release-gate phases — PASS in release gate `34942492468`.

### Production endpoint smoke — PASS

Production smoke run `34990056067` completed successfully.

Verified:

- Production API `/api/health` returned HTTP 200.
- Health reported `success: true`, `status: healthy`, and `database: connected`.
- Production API `/` returned HTTP 200 with the expected Travel API success response.
- Production website returned HTTP 200.

The live API reported deployed version `73a5127695b2b8461c50ec034420af252881b5e6`. Current repository head is `f0203925`, so endpoint health is PASS but deployment currency against current `main` is **NOT VERIFIED**. Render and Vercel were intentionally disconnected from GitHub.

### Tenant isolation — PASS

Live production tenant-context checks established:

- Missing tenant context → HTTP 400, `Tenant context is required`.
- Amani Trails Safaris tenant context → HTTP 200.
- Savanna Crown Safaris tenant context → HTTP 200.
- Coastal Horizon Adventures tenant context → HTTP 200.

Missing tenant context does not silently select a default tenant for the tested endpoint.

### MongoDB backup investigation and correction — PASS

An earlier backup run `34993023892` proved encryption/upload/decryption/gzip integrity but failed application-data validation during restore because it contained `backups.backup` rather than the application database. Restore run `34995112932` correctly rejected that content. The workflow was then hardened to validate application collections before accepting/uploading a production backup.

Corrected backup run `34998687985` subsequently passed the hardened application-data validation. Evidence recorded for that run:

- Encrypted MongoDB backup completed.
- Artifact: `production-mongodb-backup-34998687985.zip`.
- Artifact size: approximately 92,554 bytes.
- SHA-256: `fe8a488e161c91d222098235d66aad9ff19733bc1bc3d8829727d5a76b67a08`.
- Retention: through 2026-10-15.
- Isolated validation discovered expected application collections including `husseindb.users` and other booking, payment, accounting, finance, security, notification, eTIMS, vehicle, hotel and lead data.

No backup URI, passphrase or other secret is recorded here.

### Isolated MongoDB restore drill — PASS

Restore run `35003760520` completed successfully using the corrected backup and an isolated target.

Verified:

- Restore target isolation — PASS.
- Backup restore operation — PASS.
- Restored database validation — PASS.
- Application collections were present after restore.

This supersedes the earlier failed restore evidence as the current accepted backup/restore result; the earlier failure remains documented as a historical diagnostic event.

### Production monitoring — PASS

Normal monitoring run `35004893911` passed:

- Production API health check.
- Database-connected health contract.
- Production website HTTP check.
- API latency observed at approximately 821 ms.
- Website latency observed at approximately 278 ms.

Intentional alert-path run `35005078875` was then executed with `simulate_failure=true`. It failed **as designed**, without modifying production, and created GitHub issue **#135 — Production monitoring alert**. This verifies the monitoring failure/alert path. The intentional failure is not treated as an application defect.

### Customer authentication and booking acceptance — PASS

Local sandbox acceptance used an active customer account. Authentication succeeded without exposing the JWT or password.

A customer booking was created for the available **Amboseli Wildlife Escape** tour:

- Booking ID: `6aa98e90589f95fc1fad1276`.
- Travel date: 2026-09-17.
- Payment method: MPESA.
- Total: KES 690.
- Deposit: KES 0.
- Balance: KES 690.
- Booking status: `pending`.
- Payment status: `pending`.

The booking creation response was HTTP 201/successful and the stored pickup time correctly represented the requested 07:00 EAT pickup.

### M-Pesa sandbox STK initiation — PASS

M-Pesa configuration was inspected without printing secrets:

- `MPESA_ENVIRONMENT=sandbox`.
- Sandbox shortcode `174379` configured.
- Consumer key configured.
- Consumer secret configured.
- Passkey configured.
- HTTPS callback configured as `https://hussein-mboya-tours.onrender.com/api/mpesa/callback`.

The sandbox STK request was sent to the local backend for booking `6aa98e90589f95fc1fad1276`:

- Amount: **KES 690**.
- Phone used: the customer's configured sandbox test phone.
- Application response: `success: true`.
- Provider response code: `0`.
- Provider message: `Success. Request accepted for processing`.
- Checkout request ID: `ws_CO_150920262132451700100001`.
- Merchant request ID: recorded by the application but not required for future documentation.

**Acceptance boundary:** this proves that the application successfully authenticated the customer, located the booking, generated and sent a sandbox STK Push, and received provider acceptance. It does **not** prove that the sandbox payment was completed or that the callback updated the booking/accounting records.

The callback currently points to the existing Render deployment, while Render is intentionally disconnected and is not running current `main`. Therefore callback delivery must be captured against an approved public HTTPS test target or an explicitly updated sandbox callback before payment completion is marked PASS.

## Step 2 — Kenya financial/compliance acceptance status

| Test | Status | Evidence / blocker |
|---|---|---|
| M-Pesa sandbox STK initiation | PASS | Local booking + provider response code `0` |
| M-Pesa sandbox callback | PENDING | Callback delivery to approved test target not yet captured |
| Booking/payment completion after callback | PENDING | Requires successful callback processing |
| Payment/invoice/accounting reconciliation | PENDING | Requires completed sandbox payment and matching records |
| Duplicate M-Pesa callback/idempotency | PENDING | Requires callback replay/provider-supported evidence |
| Failed/expired M-Pesa | PENDING | Requires sandbox/provider-supported failure scenario |
| Live KRA/eTIMS submission | PENDING | Requires production KRA/eTIMS onboarding, credentials and receipt/control-number evidence |
| Full desktop/mobile browser acceptance | PENDING | Manual evidence still required across customer, Admin, Finance, Tour Manager, Driver and SuperAdmin |
| Current-main deployment acceptance | NOT VERIFIED | Production is healthy but reports older deployed version `73a51276` |

Sandbox testing must remain clearly separated from live production payment acceptance.

## Historical release evidence

Release gate `34942492468` certified the application baseline and included security/tenant integrity, Kenya production readiness, final release gate, backend tests, service/controller checks, tenant-isolation checks, compliance/payment module verification, client lint/build, release configuration and committed-secret checks.

Historical hardening references:

- Subscription hardening: `b077f25a698322f1d0f95c804a9ee001f0ee573f`.
- Production-readiness contract coverage: `088d4b27cc1ce03c4eb9a2923449c3e5c76fe79c`.
- Calendar lint repair: `46e11bcffe0f2069ef1446bd21a2ad3dc79d3b80`.
- Temporary lint repair workflow removed: `9fee53c1ed8d6ce95cf4a9177d719666d4f8ad0c`.
- Backup validation hardening and subsequent restore-drill fixes are recorded in repository history before current head `f0203925`.

## Evidence rules

- **PASS:** required test completed and evidence is available.
- **FAIL:** test executed and expected behavior was not met.
- **BLOCKED:** test cannot be executed because an external prerequisite is unavailable; record the prerequisite.
- **PENDING:** test has not yet been completed.
- **NOT VERIFIED:** an observation exists but does not prove the requested acceptance criterion.

Never document passwords, secrets, access tokens, private keys, JWTs, MFA PINs, M-Pesa consumer secrets/passkeys or full payment-provider credentials. Record only secret names and whether required configuration is present.
