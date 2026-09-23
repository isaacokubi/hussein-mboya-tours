# Phase 9 — Firestore Demo Seed Cutover

## Scope

Remove the last known MongoDB/Mongoose dependency from the destructive demo reset utility and make demo/test data reset compatible with the application's current Firestore runtime.

## Completed

- Replaced `server/scripts/reset-and-seed-demo.js` with a Firestore-native implementation.
- Added an explicit `CONFIRM_DEMO_RESET=YES` safety gate.
- Added a required `FIREBASE_PROJECT_ID` guard.
- Limited destructive deletion to the known synthetic Global Tours destination/tour catalog.
- Preserved organizations, users, bookings and payments.
- Removed arbitrary collection enumeration/deletion and MongoDB connection logic.
- Registered `npm run reset:demo`.
- Corrected the misleading MongoDB environment error in `server/seeds/globalToursTestSeed.js`.
- Added `server/tests/firestoreDemoSeedCutover.test.js`.
- Added Phase 9 to the release gate with a Firestore emulator.
- Stored Phase 9 commands in `docs/STORED_TEST_EXECUTION_QUEUE.md`.

## Verification boundary

The repository changes and static contract are configured, but this environment does not provide a local Node/Firebase emulator execution path. The Phase 9 contract must therefore be executed by the GitHub Actions workflow or later on a laptop/CI environment before being recorded as passed.

Required commands:

```bash
cd server
npm install
node --test tests/firestoreDemoSeedCutover.test.js
```

For the actual demo reset:

```bash
FIREBASE_PROJECT_ID=demo-global-tours \
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 \
GCLOUD_PROJECT=demo-global-tours \
CONFIRM_DEMO_RESET=YES \
npm run reset:demo
```

## Exit condition

Phase 9 is complete when the Firestore demo reset contract is present in CI, the legacy MongoDB reset path is removed, and the test command is stored for later execution. A successful CI/runtime execution is separate evidence and must not be inferred from the code change alone.
