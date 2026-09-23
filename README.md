# Global Tours

Kenya-focused, multi-tenant tours & travel SaaS for tour operators, with tenant isolation, bookings, payments, finance/accounting, compliance, hospitality/operations, website integrations, RBAC and production safeguards.

## Current status

**Application verification baseline:** commit `8f9e90bb`  
**Verification date:** 2026-09-21  
**Repository branch:** `main`

The latest full local verification was completed after the production-audit remediation. Code-level checks and local release gates passed. Production launch certification is **not yet complete** because several acceptance gates require evidence from the actual deployment/provider environment.

### Latest verification results

| Area | Result | Evidence |
|---|---|---|
| Server install | PASS | npm install completed; 0 vulnerabilities |
| Server static checks | PASS | `npm run check:all` |
| Backend automated tests | PASS | 95 tests: 92 passed, 0 failed, 3 intentionally skipped |
| Security tests | PASS | 4 passed, 0 failed, 0 skipped |
| Tour-domain tests | PASS | 5 passed, 0 failed |
| Targeted regression tests | PASS | 8 total: 5 passed, 0 failed, 3 intentionally skipped |
| RBAC normalization dry run | PASS | 19 role groups; 0 groups requiring normalization |
| Client install | PASS | 0 vulnerabilities |
| Client lint | PASS | `npm run lint` |
| Client production build | PASS | Vite production build completed |
| Production readiness contract | PASS | `npm run check:production` |
| Live production certification | NOT VERIFIED | External deployment/provider evidence still required |

### Intentionally skipped integration tests

The following tests were skipped because they require the database/provider runtime conditions that are not available in the local verification environment:

- airport-transfer payment completion atomic lifecycle;
- tour lifecycle transactional capacity reservation/release;
- payment-completion rollback when accounting posting fails.

A skipped test is not treated as a failure or as production acceptance.

## Production acceptance still required

The remaining gates are runtime/provider evidence gates, not unresolved source-code fixes:

- current `main` deployment SHA verification;
- live tenant-isolation regression against the deployed current release;
- M-Pesa sandbox callback delivery and completion;
- duplicate M-Pesa callback/idempotency replay;
- failed/expired M-Pesa behavior;
- payment → booking → invoice → accounting reconciliation using completed provider data;
- live KRA/eTIMS submission and receipt/control-number evidence;
- full desktop/mobile browser acceptance across customer, Admin, Finance, Tour Manager, Driver and SuperAdmin flows;
- production read-only MongoDB integrity/reconciliation scan.

Sandbox STK initiation must not be represented as completed payment acceptance.

## Current implementation scope

The platform includes:

- tenant-scoped users, roles and permissions;
- customer, admin, agent, manager and guide workflows;
- tours, destinations, bookings and tour lifecycle controls;
- M-Pesa, card and bank payment architecture;
- payment lifecycle, refunds, invoices and accounting;
- Kenyan tax configuration and eTIMS integration architecture;
- supplier, purchase-order, tour-cost and supplier-payable workflows;
- profitability, finance reporting and reconciliation controls;
- hotel/accommodation and airport-transfer foundations;
- corporate accounts and operational workflows;
- website booking capture and website integration APIs;
- developer APIs and webhooks;
- security controls, tenant isolation and CSRF/session protections;
- monitoring, health checks and backup/restore safeguards;
- production release-gate automation and audit documentation.

## Production documentation

- [Production readiness](docs/PRODUCTION_READINESS.md) — current readiness matrix and release rules.
- [Test evidence register](docs/TEST_EVIDENCE.md) — chronological evidence and explicit pending/not-verified gates.
- [Documentation automation](scripts/update-documentation.js) — generates the current repository-state section.
- [Documentation workflow](.github/workflows/documentation.yml) — generates a reviewable documentation snapshot artifact on pushes to `main`.

## Documentation policy

Documentation is part of the release process. The GitHub Actions documentation workflow generates repository metadata after every push to `main` and publishes it as an artifact for review; it does not write to the repository.

Historical test evidence is **not** auto-marked PASS. A test is recorded as PASS only when its required evidence actually exists. External/provider results remain explicitly PENDING, BLOCKED or NOT VERIFIED until verified.

<!-- DOCS-AUTO:START -->
## Current repository state

This section is maintained by `scripts/update-documentation.js`. The GitHub Actions workflow uploads a generated snapshot artifact for review.

- **Repository:** Global Tours — multi-tenant tours & travel SaaS
- **Branch:** `main`
- **Current commit:** `336038c9c43f9e504b3638e605cfdcab476a7003`
- **Short commit:** `336038c`
- **Documentation snapshot date (UTC):** 2026-09-23
- **Server package:** `hussein-mboya-tours-server@1.0.0`
- **Client package:** `client@0.0.0`
- **Server verification commands:** `npm run check:all`, `npm test`, `npm run test:security`, `npm run test:tour-domain`
- **Client verification commands:** `npm run lint`, `npm run build`
- **Production contract:** `npm run check:production`
- **Release rule:** production certification requires current deployment/provider evidence; local or CI source checks alone do not certify live production.

### Documentation automation

The workflow has read-only repository permissions and does not modify or push repository contents. Manual changes to generated files should be reviewed as regular repository updates.

<!-- DOCS-AUTO:END -->
