# Phase 10 — Firestore Authentication & Seed Cutover

## Scope

Remove remaining executable authentication assumptions about MongoDB from the Firestore runtime and align maintained seed/repair configuration errors with Firebase.

## Completed changes

- Replaced the local/shared-account login lookup in `server/controllers/authController.js`.
  - Removed checks against `User.db`.
  - Removed direct `User.collection` access.
  - Removed `User.hydrate`.
  - Local tenant discovery now runs through the Firestore-backed `User` model inside a controlled platform bypass context.
  - Once a unique tenant is identified, the user is reloaded inside that tenant context before authentication continues.
- Removed the now-unused `setTenantContext` import from the authentication controller.
- Corrected obsolete MongoDB configuration error messages in maintained Firestore seed/repair utilities:
  - global tour test seed
  - global tour media repair
  - global tour reset
  - custom tour-request seed
  - dashboard operational seed
  - hospitality developer seed
  - dashboard master-data seed
  - financial dashboard seed
  - global-tour media repair script
  - demo-password reset script
- Added `server/tests/firestoreAuthSeedCutover.test.js`.
- Added Phase 10 to the release gate and stored test queue.

## Verification boundary

The current environment does not provide a runnable local Node.js/Firestore emulator session, so this phase was not runtime-executed here.

The release gate now provides the executable contract:

```bash
cd server
node --test tests/firestoreAuthSeedCutover.test.js
```

## Exit condition

Phase 10 is considered verified only after the contract test executes successfully in CI or a local Firestore-enabled environment. Passing this contract does not by itself certify production login, password recovery, email delivery, or other external integrations.
