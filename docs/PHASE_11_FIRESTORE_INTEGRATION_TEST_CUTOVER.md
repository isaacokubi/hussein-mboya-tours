# Phase 11 — Firestore Integration Test Cutover

## Scope

Move the two previously MongoDB-gated transactional integration suites onto the application's current Firestore runtime.

## Completed

- `server/tests/tourLifecycleIntegration.test.js`
  - now enables on Firestore emulator environment variables;
  - connects through `connectFirestore()`;
  - uses the Firestore adapter's ID helper.
  - covers tour capacity reservation, duplicate capacity rejection, payment completion/accounting, tour cancellation and capacity release, plus accounting rollback.
- `server/tests/hospitalityPaymentLifecycleIntegration.test.js`
  - now enables on Firestore emulator environment variables;
  - connects through `connectFirestore()`;
  - uses Firestore adapter IDs.
  - covers airport-transfer payment completion, invoice state, and accounting journal creation.
- Added `server/tests/firestoreIntegrationTestCutover.test.js` as a static contract.
- Added a Phase 11 Firestore emulator job to the release gate.
- Stored the executable commands in `docs/STORED_TEST_EXECUTION_QUEUE.md`.

## Verification boundary

These integration suites were not executed in the current environment. The release gate starts a Firestore emulator and executes all three suites.

## Exit condition

Phase 11 is verified only after the emulator-backed suites pass. This phase does not claim production payment-provider, eTIMS, DNS, or live infrastructure verification.
