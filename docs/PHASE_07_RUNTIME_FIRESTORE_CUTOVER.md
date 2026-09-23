# Phase 7 — Runtime Firestore Cutover

## Scope

Remove remaining direct Mongoose dependencies from the identified HTTP request paths so the active application runtime consistently uses the Firestore adapter.

## Completed

- Removed Mongoose error-type dependency from the global error middleware.
- Replaced request-path ObjectId validation with the Firestore adapter's compatibility API.
- Removed unused Mongoose imports from tour-manager paths.
- Replaced initial tenant bootstrap's Mongoose session with `firestore.startSession()`.
- Added a static runtime-cutover contract test.

## Verification boundary

No local Node test execution was possible in the current environment. The Phase 7 contract is stored in `server/tests/runtimeFirestoreCutover.test.js` and must be executed in CI or on a laptop.

This phase intentionally does **not** claim that every legacy script or migration utility has been converted. Remaining legacy database utilities are handled separately so they are not silently rewritten without migration requirements.

## Required verification

```bash
cd server
node --test tests/runtimeFirestoreCutover.test.js
npm test
npm run check:all
```

## Exit condition

Phase 7 is complete when the runtime-cutover contract passes and the changed request paths execute against the Firestore runtime without importing Mongoose.
