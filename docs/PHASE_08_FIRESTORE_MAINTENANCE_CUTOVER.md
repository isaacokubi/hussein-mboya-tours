# Phase 8 — Firestore Maintenance & Migration Cutover

## Scope

Phase 8 removes remaining MongoDB/Mongoose dependencies from the identified maintenance and migration tooling that can still be invoked against the current Firestore runtime.

## Completed

- Replaced the runtime tenant-index repair service with a Firestore-safe compatibility layer.
- Preserved the existing `createWithTenantIndexRepair` caller contract without attempting MongoDB index operations.
- Converted the booking/payment ledger migration to the Firestore model adapter.
- Added tenant context while reading payment/tour records and writing booking ledger fields.
- Added a dry-run mode for the booking ledger migration (`DRY_RUN=true`).
- Skipped booking records without a tenant instead of performing an unscoped mutation.
- Converted the orphan-staff migration to Firestore model operations and corrected its Firebase environment/error messaging.
- Registered explicit package commands for both maintenance migrations.
- Added a contract test covering the cutover and booking-ledger calculation rules.

## Stored commands

```bash
cd server
node --test tests/firestoreMaintenanceCutover.test.js
npm run migrate:booking-ledger
npm run migrate:orphan-staff
```

For a non-mutating booking-ledger preview:

```bash
cd server
DRY_RUN=true npm run migrate:booking-ledger
```

For orphan-staff migration, set exactly one of `TENANT_ID`, `TENANT_SLUG`, or `TENANT_NAME`. The migration is non-mutating unless:

```bash
CONFIRM_ORPHAN_STAFF_MIGRATION=true
```

is explicitly set.

## Verification boundary

No Node.js runtime or Firestore emulator execution was performed in the current environment. The test and migration commands are stored for later execution and must not be recorded as passed until they actually run successfully.

This phase does **not** claim that every historical seed/demo utility or every stale documentation reference has been migrated. Those remain separate cleanup work.

## Exit condition

Phase 8 is complete when the Firestore maintenance contract passes and the migrated maintenance scripts execute safely against a test/emulator dataset before any production use.