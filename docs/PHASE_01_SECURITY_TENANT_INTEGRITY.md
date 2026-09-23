# Phase 1 — Security and Tenant Integrity

## Scope

This phase establishes a deterministic security/tenant-isolation gate for the current Firestore-backed application.

## Completed changes

- Added the missing `check:multitenancy:live` server script.
- Reworked `server/scripts/tenantIsolationRegressionCheck.js` to use the current Firestore model layer instead of the obsolete Mongoose/MONGODB_URI path.
- The regression now verifies:
  - tenant-scoped creation;
  - automatic tenant assignment;
  - cross-tenant reads are blocked;
  - cross-tenant updates are blocked;
  - cross-tenant deletes are blocked;
  - missing tenant context fails closed;
  - tenant-scoped bulk insertion;
  - tenant-owned data remains accessible to its owner after cross-tenant attack attempts.
- Added the tenant-isolation regression to the GitHub CI server gate.

## Important baseline finding

The application runtime and CI are Firestore/Firebase based, but a pre-existing tenant regression script still attempted to connect through Mongoose using `MONGODB_URI`. That meant the documented tenant-isolation gate could not validate the current production architecture.

This phase removes that mismatch from the executable security gate. It does **not** claim that every historical MongoDB reference in documentation or legacy utilities has been eliminated; those are addressed in later phases.

## Verification boundary

The GitHub repository connector can inspect and modify the repository, but it cannot execute the Node.js test suite or start the Firestore emulator in this environment. Therefore this phase is **code-complete but execution evidence is pending**.

The required execution on a machine with Node.js/Firebase CLI is:

```bash
cd server
npm install
npm run check:all
npm run check:multitenancy:live
npm test
```

The Firestore emulator must be available using the same CI environment contract:

- `FIREBASE_PROJECT_ID=demo-global-tours`
- `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080`
- `GCLOUD_PROJECT=demo-global-tours`
- a CI/test JWT secret

## Phase 1 exit condition

Phase 1 is structurally complete when the above gate executes successfully on the current branch. No external production credentials are required for this phase.

Production certification remains separate from source-code verification and still requires real deployment/provider evidence.
