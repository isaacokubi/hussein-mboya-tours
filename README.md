# Global Tours

Kenya-focused multi-tenant tour-operator platform.

## Production test status

**Current repository HEAD:** `c44db929ea9660572dd3177a0ef8b8a23aee29d8`

The current `main` branch has a successful CI release baseline and successful production endpoint smoke test. The first production MongoDB backup artifact was encrypted and integrity-verified, but the subsequent isolated restore drill proved that backup run `34993023892` contained the wrong database (`backups.backup`) rather than the application database. The backup workflow has now been hardened to reject archives that do not contain expected application collections before an artifact is uploaded.

### Verified automated tests

| Test | Result | Evidence |
|---|---|---|
| Server production checks (`npm run check:all`) | PASS | CI run `34990056154` |
| Backend automated tests (`npm test`) | PASS | CI run `34990056154` |
| Live tenant-isolation regression | PASS | CI run `34990056154` |
| Client ESLint | PASS | CI run `34990056154` |
| Client production build | PASS | CI run `34990056154` |
| Security and tenant-integrity release gate | PASS | Release gate previously certified; current CI remains green |
| Kenya production-readiness checks | PASS | Release gate previously certified; current CI remains green |
| Final release gate | PASS | Release gate previously certified; current CI remains green |
| Production API health endpoint | PASS | Live check: HTTP 200, healthy, database connected |
| Production API root endpoint | PASS | Live check: HTTP 200, expected API message |
| Production website endpoint | PASS | Live check: HTTP 200 from Vercel |
| Production smoke workflow | PASS | Run `34990056067` |
| Backup encryption/upload/integrity | PASS | Run `34993023892`; encrypted artifact uploaded and decryption/gzip verification passed |
| Backup application-data validation | FAIL | Restore drill showed only `backups.backup`; workflow now rejects archives without `tenants`/`users` |
| Isolated MongoDB restore drill | FAIL | Run `34995112932`; restore completed but validation found only `backups.backup` |

### Live tenant-isolation checks

The following tenant-context behavior has been verified against the production API:

- Request without tenant context: safely rejected with HTTP 400 and `Tenant context is required`.
- Amani Trails Safaris tenant context: HTTP 200.
- Savanna Crown Safaris tenant context: HTTP 200.
- Coastal Horizon Adventures tenant context: HTTP 200.
- Production API health reports MongoDB as `connected`.

Tenant isolation remains a release-blocking control: production must never silently fall back to a single tenant when tenant context is missing.

### Production backup evidence

Backup run `34993023892` demonstrated that encryption, artifact upload and cryptographic/gzip integrity checks work, but it **must not be treated as a valid application backup**. The subsequent restore drill `34995112932` restored database `backups` with a single collection named `backup`, so the required application data was absent.

The backup workflow has been hardened in `c44db929ea9660572dd3177a0ef8b8a23aee29d8` to decrypt the archive temporarily in the runner, perform a `mongorestore --dryRun --verbose` inspection, require expected application collections such as `tenants` or `users`, and delete the temporary plaintext archive before artifact upload.

The `MONGODB_BACKUP_URI` repository secret must point to the actual production application database. Do not record the URI value in documentation or issue comments. After correcting the secret, a new backup run must pass application-data validation before the restore drill is repeated.

### Tests still pending external evidence

These are **not marked PASS** merely because automated CI is green:

- Correct production MongoDB backup containing application data.
- Successful isolated MongoDB restore of the corrected backup.
- Production monitoring and alert firing test.
- Real M-Pesa STK → callback → booking → reconciliation transaction.
- Duplicate M-Pesa callback/idempotency acceptance using provider-supported evidence.
- Failed/expired M-Pesa acceptance.
- Live KRA/eTIMS submission and receipt/control-number acceptance.
- Full manual desktop/mobile browser acceptance across customer, admin, finance, tour manager, driver and SuperAdmin flows.

A test is recorded as **PASS** only when its required evidence exists. External integrations may be recorded as **BLOCKED** when credentials/onboarding or provider access is unavailable; they must not be represented as successful based on code inspection alone.

## Production readiness baseline

The repository's automated security, multi-tenancy, subscription lifecycle, financial/compliance infrastructure, production safeguards, and frontend release checks have a passing baseline. See [`docs/PRODUCTION_READINESS.md`](docs/PRODUCTION_READINESS.md) for the authoritative test matrix and evidence history.

## Current implementation scope

The platform includes tenant-scoped bookings, customers, tours, payments, invoices, Kenyan tax configuration, eTIMS integration architecture, supplier/procurement workflows, profitability, corporate controls, external-website booking capture, developer API/webhooks, and operational foundations.

Subscription lifecycle enforcement, tenant isolation safeguards, financial reconciliation infrastructure, security controls, production error handling, health/observability infrastructure, and release-gate automation are part of the current production-readiness baseline.

Optional enterprise integrations such as GDS/flight booking, hotel inventory APIs, travel insurance, enterprise SSO and advanced bank integrations are not prerequisites for the core Kenyan tour-operator product.

## Production documentation

- [`docs/PRODUCTION_READINESS.md`](docs/PRODUCTION_READINESS.md) — authoritative readiness matrix, test evidence and release rules.
- [`docs/TEST_EVIDENCE.md`](docs/TEST_EVIDENCE.md) — chronological record of verified tests and remaining acceptance gaps.
