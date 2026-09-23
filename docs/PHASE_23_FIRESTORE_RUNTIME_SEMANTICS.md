# Phase 23 — Firestore Runtime Semantics Hardening

## Objective

Close the remaining high-risk Mongoose-to-Firestore compatibility gaps in the active runtime so application behavior does not silently diverge from the schema and document lifecycle assumptions used throughout the codebase.

## Fixes included

- Enforced schema-level required, enum, numeric bounds, string length bounds, regex and custom validators.
- Applied schema setters for trim, lowercase and uppercase.
- Preserved schema defaults and timestamps during Firestore document construction/save.
- Implemented select: false defaults plus Mongoose-style +field projection overrides.
- Preserved unselected persisted fields during document save so partial queries cannot erase hidden fields.
- Implemented real isModified(path) tracking instead of reporting every field as modified.
- Added populated-reference support for select, match, refPath and nested populate.
- Added findOneAndDelete and findByIdAndDelete compatibility helpers.
- Added regression coverage for validation, projection, hidden-field preservation, modification tracking and nested population.

## Verification

Stored commands:

    cd server
    npm run test:firestore:runtime-semantics

Or with the emulator explicitly configured:

    cd server
    npm install
    FIREBASE_PROJECT_ID=demo-global-tours FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 GCLOUD_PROJECT=demo-global-tours npm run test:firestore:runtime-semantics

The release gate runs the same suite against the Firestore emulator.

## Acceptance boundary

This phase hardens the Firestore compatibility layer and records executable tests. It does not by itself prove production deployment, production-data cleanliness, live M-Pesa/eTIMS behavior, browser acceptance, backup/restore evidence or regulatory certification.
