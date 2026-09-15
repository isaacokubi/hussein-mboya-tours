# Global Tours

Kenya-focused multi-tenant tour-operator platform.

## Production test status

**Current repository HEAD:** `d60fec35e895d42eed3f49e26c8da1f03226e479`

The current `main` branch has a successful CI release run and successful production endpoint smoke test. The production MongoDB encrypted-backup workflow has also completed successfully.

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
| Encrypted MongoDB backup | PASS | Run `34993023892`, artifact uploaded and integrity verified |

### Live tenant-isolation checks

The following tenant-context behavior has been verified against the production API:

- Request without tenant context: safely rejected with HTTP 400 and `Tenant context is required`.
- Amani Trails Safaris tenant context: HTTP 200.
- Savanna Crown Safaris tenant context: HTTP 200.
- Coastal Horizon Adventures tenant context: HTTP 200.
- Production API health reports MongoDB as `connected`.

Tenant isolation remains a release-blocking control: production must never silently fall back to a single tenant when tenant context is missing.

### Production backup evidence

The Production MongoDB Backup workflow completed successfully in run `34993023892`.

- Encrypted MongoDB archive created with AES-256-CBC and PBKDF2.
- SHA-256 checksum generated.
- GitHub Actions artifact uploaded successfully.
- Artifact: `production-mongodb-backup-34993023892.zip`.
- Artifact ID: `10405803526`.
- Artifact size: `90415` bytes.
- Artifact SHA-256: `131828e2f91a2ff12e205a3a35de4133584b70cfab30561c286b277258dfd281`.
- The workflow successfully decrypted the archive and passed gzip integrity verification.

### Tests still pending external evidence

These are **not marked PASS** merely because automated CI is green:

- Isolated MongoDB restore drill.
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
