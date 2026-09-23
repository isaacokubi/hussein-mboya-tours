# Stored Test Execution Queue

This file is the master test record for this project. It is intentionally stored in Git so the tests can be run later when a laptop/Node.js environment is available.

## Automated commands

Run from the repository root:

```bash
cd server
npm install
npm run check:all
npm run check:multitenancy:live
npm test
npm run test:tour-domain
npm run test:security
node --test tests/kenyaProductionReadiness.test.js
node --test tests/finalReleaseGateContract.test.js
npm run check:production
```

For the Firestore-backed tenant tests, use:

```bash
FIREBASE_PROJECT_ID=demo-global-tours
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
GCLOUD_PROJECT=demo-global-tours
JWT_SECRET=ci-only-test-secret
```

Start the emulator separately:

```bash
firebase emulators:start --only firestore --project demo-global-tours
```

Then run the client checks from the repository root:

```bash
cd client
npm install
npm run lint
npm run build
```

## Manual M-Pesa evidence tests

Do not run against real money until the provider account and tenant credentials are configured.

- valid Kenyan numbers: +2547XXXXXXXX, 2547XXXXXXXX, 07XXXXXXXX, 01XXXXXXXX
- reject malformed/non-Kenyan numbers
- reject zero/negative amount
- reject missing booking ID
- successful STK initiation
- provider authentication failure
- STK timeout/network failure
- provider rejection
- successful callback
- failed callback
- duplicate callback/replay
- callback for another tenant
- callback with unknown checkout request
- callback with unknown receipt/reference
- late callback after cancellation
- refund success
- refund failure
- payment reconciliation against booking/invoice
- duplicate provider reference must not create a second completed payment
- accounting posting failure must be visible and reconciled
- payment webhook retry must remain idempotent

Record timestamp, tenant, environment, provider reference, expected result, actual result and audit/log reference. Never store secrets or full credentials.

## Manual eTIMS evidence tests

- tenant eTIMS disabled
- missing adapter URL
- invalid adapter URL
- production HTTP adapter rejected
- private/local adapter address rejected
- invalid or expired credential
- successful invoice submission
- rejected invoice response
- adapter timeout
- network failure
- malformed adapter response
- duplicate invoice submission
- repeated job with the same idempotency key
- retry after failure
- successful retry
- persisted submission attempt history
- persisted request hash
- KRA/eTIMS invoice and receipt identifiers persisted
- credit note submission
- debit note submission
- reconciliation of local invoice status with provider result

Record provider/environment, request identifier, response status, local status before/after and reconciliation result. Never store credentials.

## Accounting and finance acceptance

- payment creates the expected financial entry
- duplicate payment callback does not duplicate ledger posting
- failed payment does not post revenue as completed
- refund reverses/adjusts the expected financial trail
- invoice amount paid and balance agree with completed/refunded payments
- supplier payable and tour cost records remain tenant-scoped
- withholding-tax records remain tenant-scoped
- accounting reconciliation agrees with payment records
- exported totals agree with underlying tenant records

## Multi-tenant acceptance

- tenant A cannot read tenant B records
- tenant A cannot update tenant B records
- tenant A cannot delete tenant B records
- missing tenant context fails closed
- public integration events require explicit verified tenant mapping
- payment callbacks resolve to the correct tenant
- eTIMS submissions remain tenant-scoped
- custom domains cannot select an unverified tenant

## Production infrastructure evidence

These cannot be certified from source code alone:

- backup destination configured
- backup retention verified
- real restore completed
- restored data passes tenant-isolation checks
- monitoring and alert delivery verified
- production API health verified
- production frontend reachable
- signed webhook delivery verified
- HTTPS/origin configuration verified
- rollback to last known-good release tested

## Status rule

This file stores tests and commands; it does not mean they have passed. Record actual results only after running them on a real environment.


## Phase 5 — Payment & M-Pesa hardening

Automated contract test:
```bash
cd server
node --test tests/paymentMpesaHardening.test.js
```

Manual payment acceptance remains external: STK success/failure, duplicate callback, callback amount mismatch, unknown checkout/receipt, late callback, provider timeout/auth failure, refund, duplicate provider reference, accounting posting failure, reconciliation, and tenant-isolation checks.

## Phase 4 — Deployment & infrastructure acceptance contract

Automated contract:

```bash
cd server
node --test tests/deploymentInfrastructureAcceptance.test.js
node --test tests/paymentMpesaHardening.test.js
```

External deployment smoke checks, once provider secrets are configured in GitHub Actions:

- `PRODUCTION_API_URL/api/health` returns HTTP success with `success=true`, `status=healthy`, and `database=connected`
- API root responds with the expected running-service marker
- `PRODUCTION_WEB_URL` returns a successful HTML document
- smoke checks run on pushes to `main`, on schedule, and manually
- absent production URL secrets skip external checks rather than fabricating success

External evidence remains required for backups, restore, monitoring/alerts, payment callbacks, eTIMS, signed webhooks and rollback.


## Phase 7 — Runtime Firestore cutover

Run from `server/`:

```bash
node --test tests/runtimeFirestoreCutover.test.js
```

This contract checks that the identified HTTP request paths no longer import Mongoose, that Firestore-backed ObjectId compatibility is used for request validation, that tenant bootstrap uses the Firestore transaction adapter, and that global error handling is database-runtime neutral.

Do not record Phase 7 as passed unless the command is actually executed successfully.

## Phase 6 — Firestore transaction integrity

Automated integration test:

```bash
cd server
FIREBASE_PROJECT_ID=demo-global-tours \
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 \
GCLOUD_PROJECT=demo-global-tours \
JWT_SECRET=ci-only-test-secret \
node --test tests/firestoreTransactionIntegrity.test.js
```

The Phase 6 test verifies both commit and rollback behavior for tour capacity reservation plus booking creation. It requires a running Firestore emulator and must not be recorded as passed unless the test actually executes.

Phase 6 also removes the direct `mongoose` transaction dependency from the booking-creation path and verifies that model `create`, `insertMany`, and bulk upserts propagate transaction sessions to the Firestore adapter.

## Phase 8 — Firestore maintenance & migration cutover

Automated contract:

```bash
cd server
node --test tests/firestoreMaintenanceCutover.test.js
```

Maintenance commands:

```bash
npm run migrate:booking-ledger
npm run migrate:orphan-staff
```

Preview the booking ledger migration without writes:

```bash
DRY_RUN=true npm run migrate:booking-ledger
```

The orphan-staff migration requires explicit tenant selection and does not mutate records unless CONFIRM_ORPHAN_STAFF_MIGRATION=true is set. No Phase 8 command is considered passed until actually executed against the intended Firestore environment.

## Phase 9 — Firestore demo seed cutover

Automated contract test:
```bash
cd server
node --test tests/firestoreDemoSeedCutover.test.js
```

Firestore emulator contract:
```bash
cd server
FIREBASE_PROJECT_ID=demo-global-tours \
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 \
GCLOUD_PROJECT=demo-global-tours \
JWT_SECRET=ci-only-test-secret \
node --test tests/firestoreDemoSeedCutover.test.js
```

Explicit demo reset command:
```bash
cd server
FIREBASE_PROJECT_ID=demo-global-tours \
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 \
GCLOUD_PROJECT=demo-global-tours \
CONFIRM_DEMO_RESET=YES \
npm run reset:demo
```

Phase 9 safety boundary:
- The demo reset no longer connects to MongoDB or drops arbitrary collections.
- It removes only the known synthetic Global Tours catalog before running Firestore-native seeders.
- Organizations, users, bookings and payments are intentionally preserved.
- Do not record the demo reset as passed until it has actually been executed against the intended Firestore environment.

## Phase 10 — Firestore authentication & seed cutover

Automated contract:
```bash
cd server
node --test tests/firestoreAuthSeedCutover.test.js
```

This verifies that local/shared-account authentication uses the Firestore model adapter rather than raw MongoDB connection/collection APIs, and that the maintained seed/repair scripts require and advertise `FIREBASE_PROJECT_ID` instead of obsolete MongoDB configuration.

Do not record Phase 10 as passed unless the command is actually executed successfully.

## Phase 11 — Firestore integration test cutover

Run with the Firestore emulator:

```bash
cd server
FIREBASE_PROJECT_ID=demo-global-tours \
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 \
GCLOUD_PROJECT=demo-global-tours \
JWT_SECRET=ci-only-test-secret \
node --test tests/firestoreIntegrationTestCutover.test.js

FIREBASE_PROJECT_ID=demo-global-tours \
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 \
GCLOUD_PROJECT=demo-global-tours \
JWT_SECRET=ci-only-test-secret \
node --test tests/tourLifecycleIntegration.test.js

FIREBASE_PROJECT_ID=demo-global-tours \
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 \
GCLOUD_PROJECT=demo-global-tours \
JWT_SECRET=ci-only-test-secret \
node --test tests/hospitalityPaymentLifecycleIntegration.test.js
```

These tests replace the old MongoDB-gated integration path. They must not be recorded as passed until they execute successfully against the Firestore emulator.



## Phase 12 — Firestore backup & restore cutover

Automated contract:
```bash
cd server
node --check scripts/firestoreBackup.js
node --check scripts/firestoreRestore.js
node --test tests/firestoreBackupRestoreCutover.test.js
```

Create a Firestore backup manually:
```bash
cd server
FIREBASE_PROJECT_ID=<production-project> \
FIREBASE_SERVICE_ACCOUNT_JSON='<service-account-json>' \
npm run backup:firestore backup/firestore.json
```

Restore only into an isolated Firebase project:
```bash
cd server
FIREBASE_PROJECT_ID=<isolated-project> \
PRODUCTION_FIREBASE_PROJECT_ID=<production-project> \
FIREBASE_SERVICE_ACCOUNT_JSON='<restore-service-account-json>' \
RESTORE_TARGET_ISOLATED=true \
npm run restore:firestore restore/firestore.json
```

Phase 12 safety requirements:
- production backup no longer depends on the retired MongoDB backup URI or `mongodump`;
- backups are encrypted before GitHub artifact upload;
- restore requires an explicitly different Firebase project and `RESTORE_TARGET_ISOLATED=true`;
- restore verifies the backup format/checksum and validates tenantId references against restored organizations;
- GitHub Actions secrets must contain credentials only; never commit service-account JSON or encryption passphrases;
- backup retention, off-site destination/SLA, actual production backup execution and real restore evidence remain external acceptance items.

Do not record Phase 12 as passed until the workflow or equivalent commands have actually executed successfully.


## Phase 13 — Production monitoring & observability acceptance

Automated contract:
    cd server
    node --test tests/productionMonitoringAcceptance.test.js

Production monitoring workflow:
- runs every 15 minutes;
- requires HTTPS API and web endpoints;
- measures API and website latency;
- enforces configurable latency budgets via `PRODUCTION_API_MAX_LATENCY_MS` and `PRODUCTION_WEB_MAX_LATENCY_MS`;
- creates a deduplicated `Production monitoring alert` issue when a monitoring run fails;
- supports a manual `simulate_failure=true` drill without modifying production.

External monitoring evidence:
- configure `PRODUCTION_API_URL` and `PRODUCTION_WEB_URL` in GitHub Actions;
- run the simulated failure drill and verify the alert issue path;
- run a normal monitoring check and record the successful workflow run;
- compare observed latency with the agreed production SLA;
- record the alert/run references before setting `PRODUCTION_MONITORING_VERIFIED=true`.

Do not record Phase 13 as passed until the automated contract and the real monitoring/alert drill have actually executed successfully.


## Phase 14 — eTIMS runtime integrity

Automated contract:
```bash
cd server
node --test tests/etimsRuntimeIntegrity.test.js
```

This contract verifies that every eTIMS invoice attempt creates its durable submission audit before OSCU or adapter execution, that OSCU success/failure updates the audit, and that the adapter path preserves idempotency and request hashing.

Phase 14 does **not** certify live KRA/eTIMS connectivity or production evidence. Do not set `PRODUCTION_ETIMS_VERIFIED=true` until the real provider/regulatory acceptance test has been completed.


## Phase 15 — Webhook runtime integrity

Automated contract:
```bash
cd server
node --test tests/webhookRuntimeIntegrity.test.js
```

This contract verifies that webhook delivery jobs carry explicit tenant identity, that the worker rejects tenant-mismatched webhook jobs, and that HTTPS/SSRF pinning, HMAC signing and delivery idempotency controls remain present.

External webhook evidence remains required: deliver a real signed webhook to an approved consuming system, verify the signature/event ID/tenant payload, and record the receiving-system evidence before setting `PRODUCTION_WEBHOOKS_VERIFIED=true`.

Do not record Phase 15 as passed until the automated contract actually executes successfully. Do not mark the production webhook evidence flag true based on source-code inspection alone.


## Phase 16 — Browser acceptance harness

Automated contract:
```bash
cd server
node --test tests/browserAcceptanceHarness.test.js
```

Browser acceptance against an approved HTTPS staging/production target:
```bash
cd client
npm install
npm install --no-save playwright@1.55.0
npx playwright install --with-deps chromium
BROWSER_ACCEPTANCE_BASE_URL=https://<approved-host> npx playwright test
```

GitHub Actions workflow: `.github/workflows/browser-acceptance.yml`. Configure `BROWSER_ACCEPTANCE_BASE_URL` as a repository/environment secret or provide an HTTPS `base_url` on manual dispatch.

The browser harness covers public pages, unauthenticated protected-route redirects, login form behavior, desktop Chrome and mobile Pixel 5. It does not certify authenticated role workflows or provider integrations. Do not record browser acceptance as PASS until the target environment test actually executes successfully.


## Phase 17 — Authenticated role browser acceptance

Automated contract:
```bash
cd server
node --test tests/authenticatedRoleAcceptanceHarness.test.js
```

Authenticated browser acceptance requires an approved HTTPS target plus non-production test accounts supplied through `BROWSER_ACCEPTANCE_ROLE_USERS_JSON`. The JSON must contain Customer, Admin, Finance, Tour Manager, Guide, Driver and SuperAdmin entries with `email`, `password` and `route`, plus optional `paths`.

Run:
```bash
cd client
npm install
npm install --no-save playwright@1.55.0
npx playwright install --with-deps chromium
BROWSER_ACCEPTANCE_BASE_URL=https://<approved-host> \
BROWSER_ACCEPTANCE_ROLE_USERS_JSON='{"customer":...}' \
npx playwright test e2e/authenticatedRoleAcceptance.spec.js
```

Do not store credentials in Git and do not use production credentials. A missing role-account secret means authenticated role acceptance is not certified.


## Phase 18 — Firestore production integrity & reconciliation

Automated contract:
```bash
cd server
node --test tests/firestoreProductionIntegrityScan.test.js
```

Read-only production/staging scan:
```bash
cd server
npm install
FIREBASE_PROJECT_ID=<approved-project> npm run audit:firestore-integrity
```

The scan must report `readOnly: true`, `ok: true` and `issueCount: 0` before setting `PRODUCTION_DATA_INTEGRITY_VERIFIED=true`. Retain timestamp, deployed commit, environment/project and issue count as evidence. Never store credentials or customer data exports in Git.


## Phase 19 — Production evidence ledger

Automated contract:
```bash
cd server
node --test tests/productionEvidenceManifest.test.js
node --check scripts/productionEvidenceCheck.js
```

Validate a real external evidence register only when the evidence exists:
```bash
cd server
PRODUCTION_EVIDENCE_MANIFEST=/secure/evidence/manifest.json npm run check:production:evidence
```

The manifest must reference the exact deployed 40-character Git SHA and PASS evidence for every required external gate. Never put credentials or customer data in the manifest. A passing validator is structural validation, not proof that the referenced external evidence is genuine.


## Phase 20 — M-Pesa callback contract

Offline automated tests:
```bash
cd server
node --test tests/mpesaCallbackContract.test.js tests/mpesaCallbackContractStatic.test.js
node --check services/mpesaCallbackContract.js
node --check controllers/mpesaController.js
```

Live acceptance remains separate: use an approved Safaricom/M-Pesa sandbox tenant to send success, failure, duplicate/replay, amount-mismatch, missing-receipt and provider-timeout callbacks, then retain payment/invoice/accounting reconciliation evidence without storing credentials.

## Phase 21 — Firestore unique payment integrity

Automated tests:
```bash
cd server
node --test tests/firestoreUniqueIndexIntegrity.test.js tests/firestoreUniqueIndexIntegrityStatic.test.js
```

Or:
```bash
cd server
npm run test:firestore:unique
```

Firestore emulator execution:
```bash
cd server
npm install
FIREBASE_PROJECT_ID=demo-global-tours \
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 \
GCLOUD_PROJECT=demo-global-tours \
npm run test:firestore:unique
```

Acceptance boundary: this proves the Firestore compatibility layer enforces declared unique indexes, including tenant-scoped Payment identities and partial indexes. It does not prove live M-Pesa provider connectivity, production callback delivery, or production reconciliation.

