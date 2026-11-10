# Documentation coverage report

## Inventory method

Counts are computed from first-party `server/` and `client/src/` source files, excluding `node_modules`, generated output and non-source assets. The audited inventory contains **1,017 JavaScript-family source files**: 350 client and 667 server files. The server inventory includes 97 route modules, 158 controllers, 96 Mongoose model files, 88 services, 36 middleware modules, 77 tests, 35 seed files and 34 scripts; remaining files are in configuration, tenancy, utilities, bootstrap, constants, startup and socket directories.

## Measured coverage status

The latest locally supplied audit was run after pulling commit `605facb` on 2026-11-10. The counts below have since been reconciled with the current source index and review registry after adding focused M-Pesa refund callback and status-query handler tests; the coverage script has not yet been rerun against this latest commit. Re-run `node scripts/check-documentation-coverage.js` locally to confirm the refreshed counts and link integrity before treating this as a fresh automated audit.

| Area | Audited count/status | Documentation |
|---|---:|---|
| Source files discovered | 1,017 | `client/src/` and `server/` inventory |
| Source files indexed | 1,017/1,017 | [Source file index](SOURCE_FILE_INDEX.md) |
| Source files with explanation links | 1,017/1,017 | Link existence, not semantic depth |
| Source classifications | 263 SOURCE-VERIFIED; 195 PARTIAL; 559 STRUCTURAL; 0 UNREVIEWED | [Source review registry](SOURCE_REVIEW_REGISTRY.md) and [source index](SOURCE_FILE_INDEX.md) |
| Registered scoped-review rows | 270 rows across 263 distinct source files | [Source review registry](SOURCE_REVIEW_REGISTRY.md) |
| Source files without registered scoped review | 754/1,017 | Not an exhaustive line-review count |
| Fully reviewed source files | 0 | No file is certified exhaustive line-by-line |
| AST-derived walkthrough artifacts | 735 | [Walkthrough index](code-explanations/source/INDEX.md) |
| Structural walkthrough labels | 725 | Navigation classification; not a review certification |
| Deep-linked source files | 24 | Detailed guides may overlap other categories |
| Specialized indexed but non-deep files | 268 | Includes overlapping specialized guides |
| Mounted API inventory entries | 629 | [API route inventory](API_ROUTE_INVENTORY.md) |
| Unique mounted route-module/method/path declarations | 588 | Plus 41 repeated mount entries |
| Unmounted route declarations in route guides | 81 | Not part of the mounted inventory |
| Endpoint guide entries | 629/629 | [Endpoint guide index](API_ENDPOINT_GUIDE/INDEX.md) |
| Source-traced API entries | 629 | Guide status classification; not runtime test coverage |
| Partially verified / unreviewed API entries | 0 / 0 | Based on endpoint-guide status markers |
| API domain guides | 57 | [API domain contracts](API_DOMAIN_CONTRACTS/INDEX.md) |
| Backend test files | 77 | `server/tests/` |
| Domain contracts with test-evidence notes | 76 | Evidence notes are not equivalent to passing tests |
| Domain contracts explicitly reporting no focused tests | 56 | Focused test coverage remains a gap |
| Model guides | 96/96 | [Model guide index](code-explanations/database/models/INDEX.md) |
| Model schema paths described | 2,229 | Schema introspection inventory |
| Model schema indexes described | 633 | Does not prove all database indexes are captured |
| Environment identifiers | 173 | [Environment variables](ENVIRONMENT_VARIABLES.md) |
| Business workflow sections | 9 | [Business logic](BUSINESS_LOGIC.md) |
| Interview questions | 100 | `docs/interview/` |
| Broken documentation links | 0 | Audit script result |
| Possible secret matches | 0 | Audit script result |

## Interpretation and known gaps

- **API documentation inventory is complete by its current classification:** all 629 mounted method/path rows have endpoint-guide records marked SOURCE-TRACED. This does not prove every runtime branch, authorization combination, validation failure, or provider interaction has been tested.
- **Source review is not complete:** 754 source files lack a registered source-verified critical-scope review. The 263 SOURCE-VERIFIED classification applies only to the named scope in each registry row; it is not a whole-file certification.
- **No source file is certified fully reviewed line-by-line.** The 195 PARTIAL and 563 STRUCTURAL classifications are explanatory/indexing states, not evidence that those files are defect-free.
- **Focused API test coverage remains incomplete:** 56 domain contract documents explicitly report no focused test. The audit does not infer endpoint-level test coverage automatically.
- Runtime schema pages cover all 96 model files and 2,229 compiled schema paths. Dynamic Mixed subkeys, out-of-band database indexes, database contents, and all controller-level field rules are not established by schema introspection.
- Exact deployment state, provider credentials, sandbox/production transaction evidence, and production operations cannot be inferred from repository manifests or static checks.
- Historical engineering challenges cannot be asserted unless supported by commit or issue evidence; interview material labels inferences.

## Validation evidence

### Local verification supplied on 2026-11-10

At local commit `605facb`, the supplied terminal output records the baseline verification below. The later M-Pesa refund callback and status-query handler changes are covered by the current GitHub CI run, but the full documentation coverage script should be rerun after pulling them:

- `node scripts/check-documentation-coverage.js`: completed and reported the counts above, with no reported broken links or possible secret matches.
- `npm --prefix server run check:all`: passed, including server syntax checks, tenant model contract and static production-readiness contract.
- `npm --prefix client run lint`: passed.
- `npm --prefix client run build`: passed; Vite transformed 3,232 modules and completed the production build.
- Git working tree was clean after the pull at that checkpoint.

The production-readiness script explicitly states that launch certification remains blocked until external production evidence gates are verified in the deployment environment.

### Runtime and release evidence

- CI on commit `ca84f2d` completed successfully: server production checks, automated backend tests, tour lifecycle runtime integration, live tenant-isolation regression, client ESLint and production build all passed.
- The Three-Phase Release Gate on `ca84f2d` completed successfully, including Phase 1 (security and tenant integrity), Phase 2 (Kenya production readiness) and Phase 3 (final release gate).
- Production Smoke Check on `ca84f2d` failed at `Check API health when configured`; the public web check was skipped. The failure needs investigation in the deployment environment and must not be described as a passing live API health check. Earlier smoke checks on `786335a` passed.
- A smoke check does not prove live M-Pesa or card transactions, verified production credentials, or all production operational controls.
- No live payment or provider transaction is claimed by this report.

## Historical measurements

Earlier snapshots such as 387/629, 390/629 and 412/629 source-traced API entries are historical only. The current audited endpoint-guide status at the 2026-11-10 local checkpoint is 629 SOURCE-TRACED, 0 PARTIALLY VERIFIED and 0 unreviewed.

## Accuracy and secret review

Documentation uses placeholders and does not reproduce `.env` values. Route counts and source-file counts should be regenerated after substantive source changes. The audit's zero possible-secret-match result is a pattern scan, not a guarantee that no secret exists anywhere in repository history or external systems.
