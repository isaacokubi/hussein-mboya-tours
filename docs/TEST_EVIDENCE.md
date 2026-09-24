# Global Tours — Test Evidence Register

## 2026-09-24 — First-tenant production audit (local source)

Commands ran under Node `v22.23.3`. The ignored `server/.env` was temporarily moved out of discovery for the full test run and restored unchanged. Local MongoDB is `3.6.8`; Docker is unavailable. The test suite ran outside the sandbox because its HTTP readiness checks bind loopback sockets. The worktree was based on `0048b99d1f2bee3f269bfa70d3af7eb3b4d075ed`; the evidence below does not include a GitHub Actions run for the resulting local changes.

| Area | Result | Evidence |
|---|---|---|
| Backend automated suite | PASS with skips | `cd server && npm test`: 127 total, 122 passed, 0 failed, 5 skipped. Skips: first-tenant replica-set flow, connected MongoDB startup, tour lifecycle transaction (2 cases), and hospitality payment transaction. |
| Tour-domain suite | PASS | `cd server && npm run test:tour-domain`: 1 passed, 0 failed, 0 skipped. |
| Security suite | PASS | `cd server && npm run test:security`: 2 passed, 0 failed, 0 skipped. |
| Full syntax/model/service/security/tenant/production checks | PASS | `cd server && npm run check:all`; tenant model contract passed and production readiness contract passed. |
| Client lint and production build | PASS | `cd client && npm run lint`; `VITE_API_URL=https://api.example.invalid/api VITE_SOCKET_URL=https://api.example.invalid npm run build`. |
| MongoDB version guard | PASS | Full suite accepts 4.2+ and rejects 4.0, 3.6 and unknown versions. Mongoose compatibility lists MongoDB 4.2; CI target remains MongoDB 8. |
| Cloudinary optional path | PASS | Health/readiness test verified API middleware loads with Cloudinary unset, body-only multipart succeeds, and actual file upload returns 503. |
| Workflow YAML | PASS | PyYAML parsed all 7 `.github/workflows/*.yml` files. Workflow source uses Node 22 and MongoDB 8; the replica-set job invokes first-tenant acceptance. No candidate CI run was available. |
| Live Render | NOT VERIFIED / unhealthy observation | Root timed out after 20 seconds (HTTP code 000); `/api/health` returned HTTP 503. No version was obtained. |
| Live Vercel | HTTP available; app integration NOT VERIFIED | Root returned HTTP 200 with `text/html`; no browser or tenant API flow was run. |
| CORS | NOT CHECKED in this audit | Older CORS observations are historical and do not certify this candidate deployment. |
| Atlas, payment provider, M-Pesa, eTIMS, backup and restore | NOT VERIFIED | No production data operation, payment, KRA submission, backup or restore was performed or evidenced in this audit. |

The first-tenant API lifecycle itself remains **UNVERIFIED** because the only installed MongoDB is below the supported 4.2 minimum and is not a replica set. The local code and test coverage do not establish production readiness.

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

- Snapshot date (UTC): 2026-09-24
- Branch: `main`
- Commit: `0048b99d1f2bee3f269bfa70d3af7eb3b4d075ed`
- Server package: `hussein-mboya-tours-server@1.0.0`
- Client package: `client@0.0.0`
- Automated documentation updater: `scripts/update-documentation.js`
- CI automation: `.github/workflows/documentation.yml`

The workflow generates this state for artifact review; it does not alter the repository. Historical test evidence below this section is retained and must only be updated when the corresponding test actually runs and produces evidence.

<!-- DOCS-AUTO:END -->
