# Phase 21 — Firestore Unique Payment Integrity

## Objective

Make the Firestore compatibility layer enforce the unique-index contracts already declared by the payment model.

This closes a critical Firestore-runtime gap: the compatibility `Schema.index()` implementation previously accepted unique indexes as metadata but did not enforce them when documents were written.

## Implemented

- `server/config/firestore.js`
  - stores schema index definitions;
  - evaluates partial-filter conditions;
  - enforces `unique: true` indexes before writes;
  - performs the uniqueness read inside the caller's Firestore transaction when a session is supplied;
  - returns a duplicate-key style error with code `11000`, key pattern, and key value.
- `server/tests/firestoreUniqueIndexIntegrity.test.js`
  - verifies a tenant/provider/reference composite unique index;
  - verifies duplicate rejection;
  - verifies updates to the same document are allowed;
  - verifies partial unique indexes permit inactive historical records.
- `server/tests/firestoreUniqueIndexIntegrityStatic.test.js`
  - verifies the compatibility-layer enforcement contract;
  - verifies the Payment model's tenant-scoped M-Pesa/provider uniqueness declarations.
- `server/package.json`
  - adds `npm run test:firestore:unique`.

## Payment integrity covered

The existing Payment model uniqueness contracts include tenant-scoped protection for:

- provider + transaction reference on completed payments;
- CheckoutRequestID;
- mpesaReceiptNumber;
- callbackEventId.

These protections are now meaningful on the Firestore runtime rather than being no-op schema metadata.

## Verification boundary

The integration test is designed for the Firestore emulator and is stored in the repository for later execution. It has **not** been executed in this environment because local Node/Firebase dependencies are unavailable.

This phase does not prove live Safaricom/M-Pesa connectivity, callback delivery, production deployment state, or financial reconciliation. Those remain external acceptance evidence.

## Required execution

```bash
cd server
npm install
FIREBASE_PROJECT_ID=demo-global-tours \
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 \
GCLOUD_PROJECT=demo-global-tours \
npm run test:firestore:unique
```

The release workflow runs the same suite against a Firestore emulator.
