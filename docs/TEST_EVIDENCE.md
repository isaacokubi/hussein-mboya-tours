# Global Tours — Test Evidence Register

## 2026-09-24 — Render API startup/readiness remediation

The API startup path now binds the HTTP listener before opening MongoDB and applying the required invoice indexes. The health endpoint is database-independent at the transport/middleware layer, reports actual startup/database state, and only returns healthy when MongoDB is connected and critical startup work is complete. MongoDB connection selection and startup index migration have explicit bounds. Production smoke/monitoring retain strict healthy-and-connected acceptance and retry transient startup/network states for a bounded 120 seconds.

**Live Render production result: NOT VERIFIED.** Repository-local and CI checks cannot establish that the external `PRODUCTION_API_URL` secret points to the intended active Render API or that Render has the required runtime environment configured. Record a PASS only after the smoke check receives the expected response from that external service.

## 2026-09-21 — Full production-audit remediation verification

### Repository baseline

- Verified application commit: `8f9e90bb`.
- Branch: `main`.
- The only pre-existing local worktree change was the user's `.gitignore` modification; it was preserved and not overwritten.
- A documentation workflow generates a repository-state artifact for review; it does not modify or push repository contents.

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
- M-Pesa callback/completion/replay/failure evidence;
- completed payment, invoice and accounting reconciliation using provider data;
- live KRA/eTIMS submission evidence;
- full desktop/mobile browser acceptance;
- production read-only MongoDB integrity/reconciliation scan.

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
- Commit: `336038c9c43f9e504b3638e605cfdcab476a7003`
- Server package: `hussein-mboya-tours-server@1.0.0`
- Client package: `client@0.0.0`
- Automated documentation updater: `scripts/update-documentation.js`
- CI automation: `.github/workflows/documentation.yml`

The workflow generates this state for artifact review; it does not alter the repository. Historical test evidence below this section is retained and must only be updated when the corresponding test actually runs and produces evidence.

<!-- DOCS-AUTO:END -->
