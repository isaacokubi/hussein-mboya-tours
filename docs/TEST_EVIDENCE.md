# Global Tours — Test Evidence Register

## 2026-09-21 — Full production-audit remediation verification

### Repository baseline

- Verified application commit: `8f9e90bb`.
- Branch: `main`.
- The only pre-existing local worktree change was the user's `.gitignore` modification; it was preserved and not overwritten.
- Documentation automation was added immediately after the application verification so future pushes keep repository-state documentation synchronized.

### Full verification results

| Test / check | Result | Evidence |
|---|---|---|
| Server dependency installation | PASS | `npm install`; 0 vulnerabilities |
| Full static/security/production checks | PASS | `npm run check:all` |
| Full backend test suite | PASS | 95 total; 92 passed, 0 failed, 3 skipped |
| Security tests | PASS | 4 passed, 0 failed, 0 skipped |
| Tour-domain tests | PASS | 5 passed, 0 failed |
| Targeted regression tests | PASS | 8 total; 5 passed, 0 failed, 3 skipped |
| RBAC final dry run | PASS | 19 role groups; 0 requiring normalization |
| Client dependency installation | PASS | 0 vulnerabilities |
| Client lint | PASS | `npm run lint` |
| Client production build | PASS | Vite build completed successfully |
| Production readiness contract | PASS | `npm run check:production` |

### Intentionally skipped tests

The three skipped tests were:

- airport-transfer payment completion atomic lifecycle;
- tour lifecycle transactional capacity reservation/release;
- payment-completion rollback when accounting posting fails.

They remain runtime/integration evidence gaps rather than source-code failures.

## Production certification boundary

The following are deliberately **not** marked PASS from the local run:

- current-main production deployment SHA;
- live tenant-isolation regression against the current deployment;
- M-Pesa callback/completion/replay/failure evidence; Phase 20 now adds offline callback-contract coverage, but live provider evidence remains pending.
- completed payment, invoice and accounting reconciliation using provider data;
- live KRA/eTIMS submission evidence;
- full desktop/mobile browser acceptance;
- production read-only Firestore integrity/reconciliation scan.

## 2026-09-21 — Audit remediation completed

The production-audit remediation included:

- strict JWT issuer/audience verification;
- secure HttpOnly browser session plus CSRF protection;
- removal of legacy browser JWT persistence;
- upload extension/MIME and filename validation with tenant-scoped media;
- bounded accounting account-cache TTL;
- tenant-aware canonical RBAC normalization;
- tenant enforcement for M-Pesa refund callbacks;
- expanded security/static regression coverage.

The final RBAC dry run returned:

```json
{
  "mode": "DRY_RUN",
  "roleGroups": 19,
  "groupsRequiringNormalization": 0,
  "report": []
}
```

No database changes were made by the final dry run.

## Historical evidence

Earlier production evidence remains useful background but is not silently promoted to current-main certification. Historical records include:

- production API/website smoke;
- live tenant-isolation regression;
- encrypted MongoDB backup and isolated restore drill;
- monitoring normal and intentional-alert paths;
- M-Pesa sandbox customer authentication, booking creation and STK initiation.

Those historical results remain valid for the environments/commits where they were actually executed. They do not prove that the current deployment is running the latest main commit.

## Evidence rules

A test is documented as **PASS** only when the required evidence exists.

- **PASS:** completed with evidence.
- **FAIL:** completed and expected behavior failed.
- **BLOCKED:** prerequisite unavailable.
- **PENDING:** not yet completed.
- **NOT VERIFIED:** observed but insufficient to prove acceptance.

Never document secrets, passwords, access tokens, private keys, MFA PINs or payment-provider credentials.

<!-- DOCS-AUTO:START -->
## Automatically captured repository state

- Snapshot date (UTC): 2026-09-23
- Branch: `main`
- Commit: `bef61a5c449e4649a2e13828403ea0b150e8a218`
- Server package: `hussein-mboya-tours-server@1.0.0`
- Client package: `client@0.0.0`
- Automated documentation updater: `scripts/update-documentation.js`
- CI automation: `.github/workflows/documentation.yml`

The generated state above is refreshed automatically after pushes to `main`. Historical test evidence below this section is retained and must only be updated when the corresponding test actually runs and produces evidence.

<!-- DOCS-AUTO:END -->


## Phase 18 — Firestore production integrity

The repository now contains a read-only Firestore production integrity/reconciliation scanner. It is not production evidence until executed against the intended deployed environment. A passing result requires `readOnly: true`, `ok: true` and `issueCount: 0`, with the deployment commit and environment retained alongside the evidence.


## Phase 19 — Production evidence ledger

The repository now contains a machine-checkable production evidence manifest validator. It remains a source-code contract until a real manifest references current external evidence. No production evidence flag is marked PASS by this phase alone.

## Phase 21 — Firestore unique payment integrity
- Stored: Firestore emulator tests for unique schema indexes, partial indexes and tenant-scoped Payment identities.
- Pending: actual emulator execution in an environment with Node dependencies/Firebase CLI.
- External evidence still required for live M-Pesa callbacks and production financial reconciliation.



## Phase 22 — Firestore field-level unique integrity
- Stored: emulator/static tests for `unique: true` field declarations and sparse uniqueness.
- Pending: actual emulator execution in an environment with Node dependencies/Firebase CLI.
- Production duplicate-data evidence remains dependent on the Phase 18 read-only Firestore integrity scan.
