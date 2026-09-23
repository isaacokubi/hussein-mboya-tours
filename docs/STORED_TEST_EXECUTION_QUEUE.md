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

