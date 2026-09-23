# Phase 22 — Firestore Field-Level Unique Integrity

## Objective

Close the remaining Mongoose-to-Firestore integrity gap where model fields declared with `unique: true` were treated as metadata but were not enforced by the Firestore compatibility layer.

## Changes

- `server/config/firestore.js`
  - records top-level field declarations containing `unique: true` as `schema._uniqueFields`;
  - enforces those declarations during `save()`;
  - preserves sparse behavior by allowing missing/null values on sparse unique fields;
  - uses the same tenant/session-aware Firestore transaction path and duplicate-key error contract as declared unique indexes.
- Added emulator coverage for:
  - duplicate field-level unique values;
  - sparse unique fields;
  - same-document updates;
  - representative existing models that rely on field-level uniqueness.
- Added `npm run test:firestore:field-unique`.
- Added the Phase 22 release-gate job and stored execution commands.

## Acceptance boundary

The stored/emulator tests prove the compatibility-layer behavior when actually executed. They do not by themselves certify existing production data is already clean. A production integrity scan remains required for live data, and live M-Pesa/eTIMS/provider evidence remains separate.

## Required execution

```bash
cd server
node --test tests/firestoreFieldUniqueIntegrity.test.js tests/firestoreFieldUniqueIntegrityStatic.test.js
```

Firestore emulator:

```bash
cd server
npm install
FIREBASE_PROJECT_ID=demo-global-tours \
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 \
GCLOUD_PROJECT=demo-global-tours \
npm run test:firestore:field-unique
```

Do not record this phase as passed unless the commands actually execute successfully.
