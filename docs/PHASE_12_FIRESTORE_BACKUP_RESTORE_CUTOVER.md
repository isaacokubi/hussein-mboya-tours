# Phase 12 — Firestore Backup & Restore Cutover

## Scope

Phase 12 replaces the remaining production backup/restore automation that still targeted MongoDB, aligning disaster-recovery tooling with the application's current Firestore runtime.

## Completed

- Added `server/scripts/firestoreBackup.js`.
  - Exports top-level collections and nested subcollections.
  - Preserves timestamps and GeoPoints using explicit portable type markers.
  - Writes a versioned backup format with document count and SHA-256 checksum.
- Added `server/scripts/firestoreRestore.js`.
  - Requires an explicitly isolated restore target.
  - Refuses to restore when the target Firebase project equals the production project.
  - Verifies backup format and checksum before writes.
  - Restores in Firestore batches.
  - Validates tenantId references against restored organizations after restore.
- Added `server/tests/firestoreBackupRestoreCutover.test.js`.
- Added package commands:
  - `npm run backup:firestore`
  - `npm run restore:firestore`
- Replaced `.github/workflows/production-backup.yml` with encrypted Firestore backup automation.
- Replaced `.github/workflows/production-restore-drill.yml` with an isolated Firestore restore drill.
- Removed MongoDB-specific backup/restore requirements from those workflows.
- Corrected platform backup administration so it uses the Firestore model adapter instead of Mongo-style `.collection.insertOne/findOne/deleteOne` APIs.
- Added the phase to the stored test queue.

## External evidence boundary

Source code can prove that the backup and restore mechanisms are wired to Firestore and contain safety controls. It cannot prove:

- a real production backup has completed;
- backup retention meets the commercial SLA;
- the backup artifact is stored in an approved off-site destination;
- a real restore has completed against an isolated production-like Firebase project;
- restored tenant isolation has been accepted by the deployment owner;
- measured RPO/RTO meets the buyer's SLA.

Those remain required external production evidence before setting the corresponding production flags to true.

## Required verification

```bash
cd server
node --check scripts/firestoreBackup.js
node --check scripts/firestoreRestore.js
node --test tests/firestoreBackupRestoreCutover.test.js
```

For an actual isolated restore, use the commands in `docs/STORED_TEST_EXECUTION_QUEUE.md` and keep production credentials outside Git.

## Exit condition

Phase 12 is complete in source control when the Firestore backup/restore contract is merged into `main`. It is not equivalent to production disaster-recovery certification.
