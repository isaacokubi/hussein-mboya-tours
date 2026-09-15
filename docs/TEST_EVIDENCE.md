# Global Tours — Test Evidence Register

This file is the chronological evidence register for tests that have actually passed. Do not convert a pending or code-only check into a PASS without the required evidence.

## 2026-09-15 — Current verification

### CI release checks — PASS

GitHub Actions CI run `34990056154` completed successfully for `main`.

Passed jobs:

- **Server production checks**
  - dependency installation
  - `npm run check:all`
  - `npm test`
- **Live tenant isolation regression**
  - MongoDB service health
  - `npm run check:multitenancy:live`
- **Client lint and production build**
  - `npm run lint`
  - `npm run build`

### Production endpoint smoke — PASS

Production smoke run `34990056067` completed successfully.

Verified:

- Production API `/api/health` returned HTTP 200.
- Health response reported `success: true`, `status: healthy`, and `database: connected`.
- Production API `/` returned HTTP 200 and the expected Travel API success message.
- Production website returned HTTP 200.

The production API reported deployed version `73a5127695b2b8461c50ec034420af252881b5e6` during this test. Current repository `main` is now `c44db929ea9660572dd3177a0ef8b8a23aee29d8`; therefore this smoke test proves the deployed endpoints were healthy, but does **not** prove that the latest `main` commit is deployed.

### Production MongoDB backup — encryption/integrity PASS, application-data validation FAIL

Backup workflow run `34993023892` completed successfully under the original validation rules.

Evidence:

- Encrypted archive generated.
- AES-256-CBC with PBKDF2 encryption used by the workflow.
- SHA-256 checksum generated.
- Artifact upload completed.
- Artifact name: `production-mongodb-backup-34993023892.zip`.
- Artifact ID: `10405803526`.
- Artifact size: `90415` bytes.
- Artifact SHA-256: `131828e2f91a2ff12e205a3a35de4133584b70cfab30561c286b277258dfd281`.
- Encrypted archive was decrypted and passed gzip integrity verification.

However, these checks did not prove that the archive contained the application database.

### Production MongoDB restore drill — FAIL

Restore drill run `34995112932` used backup run `34993023892` and completed the restore operation into the isolated target, but the final database-content validation failed.

Evidence from job `104469287780`:

- Validate backup run — PASS.
- Download backup artifact — PASS.
- Validate restore secrets — PASS.
- Validate isolated restore target — PASS.
- Restore backup — PASS.
- Validate restored database — FAIL.

The restored target reported:

- database: `backups`
- collection count: `1`
- collection: `backup`

The validator correctly rejected this because expected application collections such as `tenants` or `users` were absent.

**Conclusion:** the backup/restore pipeline is not yet accepted as a production application backup. The evidence strongly indicates that `MONGODB_BACKUP_URI` is pointing to the wrong database/source. No secret value is recorded here.

### Backup workflow hardening — implemented

Commit `c44db929ea9660572dd3177a0ef8b8a23aee29d8` hardened `.github/workflows/production-backup.yml` so a future backup cannot be uploaded as a successful production backup unless the decrypted archive passes `mongorestore --dryRun --verbose` inspection and contains expected application collections (`tenants` or `users`). The temporary decrypted archive is written outside the artifact directory and removed before artifact upload.

After `MONGODB_BACKUP_URI` is corrected to the actual production application database, a **new backup run** must pass this validation before the restore drill is repeated.

### Production tenant-context checks — PASS

Live production API checks established:

- No tenant context → HTTP 400, `Tenant context is required`.
- Amani Trails Safaris tenant context → HTTP 200.
- Savanna Crown Safaris tenant context → HTTP 200.
- Coastal Horizon Adventures tenant context → HTTP 200.

This confirms the tested tenant resolution behavior and that missing tenant context does not silently select a tenant.

## Previously certified release baseline

Release gate run `34942492468` certified the application baseline at commit `0b00897efa85ab8e4097755670091d2abaa63285`.

Passed phases and checks included:

- Security and tenant integrity.
- Kenya production readiness.
- Final release gate.
- Backend test suite.
- Production/model/service/controller checks.
- Tenant-isolation and production-readiness contract checks.
- Kenya compliance/payment module verification.
- Client lint.
- Client production build.
- Release configuration checks.
- Committed environment-secret checks.

Historical application hardening references:

- Subscription hardening: `b077f25a698322f1d0f95c804a9ee001f0ee573f`.
- Production-readiness contract coverage: `088d4b27cc1ce03c4eb9a2923449c3e5c76fe79c`.
- Calendar lint repair: `46e11bcffe0f2069ef1446bd21a2ad3dc79d3b80`.
- Temporary lint repair workflow removed: `9fee53c1ed8d6ce95cf4a9177d719666d4f8ad0c`.

## Not yet PASS

The following require live/external evidence and remain pending until actually tested:

1. Correct production MongoDB backup containing application data.
2. Successful isolated MongoDB restore of the corrected backup.
3. Production monitoring and alert firing.
4. Real M-Pesa STK → callback → booking → reconciliation.
5. Duplicate M-Pesa callback protection.
6. Failed/expired M-Pesa behavior.
7. Live KRA/eTIMS submission and receipt/control-number evidence.
8. Full manual desktop/mobile browser acceptance across customer, Admin, Finance, Tour Manager, Driver and SuperAdmin flows.
9. Deployment currency proving the intended current `main` release is running on the production hosts.

## Evidence rules

- **PASS:** required test completed and evidence is available.
- **FAIL:** test executed and expected behavior was not met.
- **BLOCKED:** test cannot be executed because an external prerequisite is unavailable; record the prerequisite.
- **PENDING:** test has not yet been completed.
- **NOT VERIFIED:** information may be observed but does not prove the requested acceptance criterion.

Never document passwords, secrets, access tokens, private keys or full payment-provider credentials. Record only secret names and whether required configuration is present.
