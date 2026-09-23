# Phase 6 — Firestore Transaction Integrity

## Scope

This phase hardens the Firestore-backed transaction boundary for booking creation and tour-capacity reservation.

## Completed

- Replaced the direct `mongoose` transaction dependency in `bookingCreationService.js` with the repository's Firestore session adapter.
- Updated the Firestore model adapter so `Model.create(data, options)` propagates `options.session` for both single and array creates.
- Updated `insertMany` to propagate transaction sessions.
- Added transactional `bulkWrite` support for the adapter, including `$setOnInsert` handling used by accounting master-data provisioning.
- Added Firestore-compatible `ObjectId.isValid` support required by transaction paths.
- Added executable Firestore-emulator integration coverage for:
  - successful capacity reservation plus booking creation in one transaction;
  - rollback of reserved capacity when the booking write fails.
- Added the Phase 6 release-gate job with a dedicated Firestore emulator.
- Stored the Phase 6 execution command in the master test queue.

## Verification boundary

No local Node.js test or Firestore emulator was executed in the current environment. Therefore this phase is code/documentation complete, not runtime-certified here.

Run later:

```bash
cd server
npm install
FIREBASE_PROJECT_ID=demo-global-tours \
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 \
GCLOUD_PROJECT=demo-global-tours \
JWT_SECRET=ci-only-test-secret \
node --test tests/firestoreTransactionIntegrity.test.js
```

Start the emulator separately when required:

```bash
firebase emulators:start --only firestore --project demo-global-tours
```

## Known boundary

The repository still contains other legacy `mongoose` imports outside this booking transaction path. Phase 6 does not claim that the entire repository has been migrated away from those references.

## Exit condition

Phase 6 is complete when the transaction integration tests execute successfully against the Firestore emulator and the release-gate job remains green. Production acceptance still requires real deployment evidence and does not follow from emulator tests alone.
