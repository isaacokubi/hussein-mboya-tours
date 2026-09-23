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


## Phase 4 — Deployment & infrastructure acceptance contract

Automated contract:

```bash
cd server
node --test tests/deploymentInfrastructureAcceptance.test.js
```

External deployment smoke checks, once provider secrets are configured in GitHub Actions:

- `PRODUCTION_API_URL/api/health` returns HTTP success with `success=true`, `status=healthy`, and `database=connected`
- API root responds with the expected running-service marker
- `PRODUCTION_WEB_URL` returns a successful HTML document
- smoke checks run on pushes to `main`, on schedule, and manually
- absent production URL secrets skip external checks rather than fabricating success

External evidence remains required for backups, restore, monitoring/alerts, payment callbacks, eTIMS, signed webhooks and rollback.
