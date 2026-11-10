# Documentation coverage report

## Inventory method

Counts are computed from first-party `server/` and `client/src/` source files, excluding `node_modules`, generated output and non-source assets. The current inventory is **1,017 first-party JavaScript-family source files**: 350 client source files and 667 server source files, including one `.mjs` test setup module. The server count includes 97 route modules, 158 controllers, 96 Mongoose model files, 87 services, 36 middleware modules, 76 tests, 35 seed files and 34 scripts; other code is in config, tenancy, utilities, bootstrap, constants, startup and socket directories.

## Measured coverage status

| Area | Count/status | Documentation |
|---|---|---|
| Source files discovered | 1,017 | `client/src/` and `server/` inventory |
| Source files with an explanation link | 1,017 of 1,017; this measures existence/linkage, not semantic depth | [Source file index](SOURCE_FILE_INDEX.md) |
| AST-derived walkthrough artifacts | 735 artifacts exist; 725 source-index rows currently classify their primary guide as structural after ten critical files were redirected to detailed guides | [Walkthrough index](code-explanations/source/INDEX.md) |
| Dedicated subsystem/source guides | 22 source rows link to detailed/deep guides, plus 96 model files, 96 route modules, 77 client API modules, and the router mount graph; overlap counted in the source index | [Detailed code explanations](code-explanations/INDEX.md) |
| Source-index classification | 725 structural-label rows, 24 deep-label rows, and 268 specialized/non-deep rows; labels may overlap scoped reviews and are not quality certification | [Source file index](SOURCE_FILE_INDEX.md) |
| Registered source-verified critical scopes | 170 registered review-scope rows; scope is listed in [source review registry](SOURCE_REVIEW_REGISTRY.md), and does not imply exhaustive file review | [Review registry](SOURCE_REVIEW_REGISTRY.md) |
| Source files without a registered scoped review | 853 of 1,017; 0 files certified exhaustive line-by-line | [Source review registry](SOURCE_REVIEW_REGISTRY.md) |
| Fully source-traced API entries | 402 mounted method/path entries; 227 of 629 remain partial | [Verified contracts](API_VERIFIED_CONTRACTS.md) |
| Curl examples | 8 illustrative request templates are source-shape checked; 0 requests executed | [Verified critical contracts](API_VERIFIED_CONTRACTS.md) |
| Mounted route inventory | 629 method/path rows: 588 unique route-module/method/path declarations plus 41 repeated mount entries; 81 route declarations in unmounted modules | [API route inventory](API_ROUTE_INVENTORY.md) |
| API route declarations | See mounted route inventory count above; endpoint guides account for all 629 rows | [API route inventory](API_ROUTE_INVENTORY.md) |
| API endpoint handler cues | Per route module: exact expression/mount/middleware; statically extracted request keys, literal statuses, JSON keys, validation lines and direct model operations where handler resolution succeeds | [Route explanation index](code-explanations/backend/routes/INDEX.md) |
| API endpoint contracts | 402 SOURCE-TRACED path entries; 227 PARTIALLY VERIFIED entries; 0 unclassified entries. No claim of 629 complete contracts. | [API reference](API_REFERENCE.md) |
| Test evidence | 77 backend test files inventoried; 17 API domain documents mention test evidence and 13 explicitly report no focused test; endpoint-level coverage is not auto-inferred | Audit script; domain contracts |
| Model files | 96 of 96 have dedicated runtime-schema explanations | [Model explanation index](code-explanations/database/models/INDEX.md) |
| Model fields and indexes | 2,229 compiled paths and 633 schema indexes inventoried across the 96 runtime models | Per-model pages link sources/callers; inferred semantic descriptions are labeled |
| Environment identifiers | 173 source/template names indexed | [Environment variables](ENVIRONMENT_VARIABLES.md) |
| Main business workflows | 9 numbered workflow sections, covering registration, discovery, booking, custom tours, checkout/payments, M-Pesa, subscriptions, admin operations and hospitality | [Business logic](BUSINESS_LOGIC.md) |
| Architecture diagrams | System, auth, request, booking/payment, data relationships | [Architecture](ARCHITECTURE.md) |
| Interview materials | Presentation, walkthrough, deep dive, learning guide and questions | `docs/interview/` |

## Files explained individually

The source index has 1,017 rows. The coverage audit assigns mutually exclusive classifications: 164 SOURCE-VERIFIED scoped files, 238 PARTIAL explanation files, 615 STRUCTURAL summaries, and 0 UNREVIEWED files. The registry records 170 reviewed-scope rows across 164 source files; no file is certified exhaustive. Index label categories remain navigational and are not a semantic quality score. The audit reports zero exhaustive line-by-line reviews.

This is not 100% expert-level line-by-line coverage. 170 registered review-scope rows cover 164 distinct source files classified SOURCE-VERIFIED; 853 source files lack that scoped review designation, and no file is certified exhaustive. Of 629 mounted path entries, 390 have source-traced contracts and 239 remain partial.

## Known gaps

- No source file is certified fully reviewed line-by-line. The source index has structural, deep, and specialized navigation labels; exclusive audit classifications are 160 SOURCE-VERIFIED, 240 PARTIAL, 617 STRUCTURAL, and 0 UNREVIEWED. 160 source files have registered scoped reviews; 857 lack that designation.
- Runtime schema pages cover all 96 models (2,229 compiled paths); dynamic Mixed subkeys, out-of-band database indexes, database contents, and all controller-level field rules are not established by schema introspection.
- 390 source-traced method/path entries include prior critical contracts and continuation batches. The other 239 entries are explicitly PARTIALLY VERIFIED and lack complete request/response/error/database contracts. Their endpoint guides record route declaration, middleware/handler pipeline and available cues, then state the missing controller/service/schema evidence. Most curl examples are intentionally omitted.
- Exact current deployment state, provider credentials, sandbox/production transaction evidence, and production operations cannot be inferred from repository manifests.
- Historical engineering challenges cannot be asserted unless supported by commit or issue evidence; interview material labels inferences.

## Accuracy/secret review

Documentation uses placeholders and does not reproduce `.env` values. The README does not claim active production payment certification or deployment. Route counts and source-file counts should be regenerated after substantive source changes.

## Validation performed for this documentation update

- `node scripts/check-documentation-coverage.js` reports 1,017 source files/index rows, no missing/stale source entries, 166 registered scope rows across 160 source files, 96 model files/guides, 2,229 model field paths, and all 629 API entries accounted for. It reports 387 source-traced API entries, 242 partial entries, and 0 unclassified entries.
- Generated directories contain 735 AST walkthrough artifacts, 96 model pages, 96 route module guides, 77 client API wrapper guides, and 57 API endpoint domain guides. These categories overlap and are not additive.
- Markdown local-link validation across `README.md` and `docs/**/*.md`: **0 broken links** (also checked by the audit script).
- Trailing-whitespace scan across documentation and documentation generators: **0 findings**.
- `node --check` passed for the documentation extraction/generation and coverage scripts; `git diff --check` passed.
- Eight curl templates in the hand-traced API material are illustrative and were not executed against a live API. Interview question document contains 100 numbered questions with source references.
- A narrowly scoped corporate booking reservation-ordering change and its unit tests were added in this continuation. Final validation outcomes are listed below and in the continuation checkpoint; lint timed out and is not reported as passed.


## Continuation checkpoint (2026-11-10, current)

- Continuation began at `GET /api/admin/hero` (entry 53), proceeded through the prior batches up to `GET /api/security/events` (entry 380), and now source-traced `GET /api/sitemap.xml` (381) plus all four tenant settings aliases (382–385). Last completed route: `PUT /api/settings` (entry 385). First incomplete route: `GET /api/staff/guides` (entry 386). Current totals: 390 SOURCE-TRACED, 239 PARTIALLY VERIFIED, 0 unclassified.
- Current coverage audit: 1,017 source files; classifications SOURCE-VERIFIED 164, PARTIAL 238, STRUCTURAL 615, UNREVIEWED 0; 1,017 with explanation links. These labels do not certify all lines/functions. 96/96 model guides and 2,229 compiled schema paths / 633 indexes are indexed. API inventory has 629 mounted entries: 390 SOURCE-TRACED, 239 PARTIALLY VERIFIED, 0 unclassified. 0 broken documentation links; 0 missing/stale source targets; 0 possible secret matches; all 629 entries have guide records.
- This continuation source-traced sitemap generation and settings reads/updates, including route aliases, tenant/auth/permission middleware, normalization/validation, settings and organization persistence, response/error branches, and absence of focused route tests. Remaining: 239 partial API contracts; 853 source files without a registered scoped review; 0 files certified exhaustive line-by-line.
- Corporate reservation code now orders capacity before conditional credit reservation and booking insertion, then compensates downstream failures. There is no MongoDB transaction. Crashes or compensation failures can strand state; concurrent request idempotency is unverified. Regression unit tests passed 6/6.
- Backend suite rerun: 322 tests, 317 passed, 0 failed, 5 skipped, 0 todo. `server npm run check:all` passed, including tenant model contract and static production-readiness contract; runtime deployment certification still requires external evidence. Mongo-backed cases were skipped without isolated database configuration.
- Frontend `npm run lint` passed. `npm run build` passed (Vite transformed 3,232 modules). No frontend unit-test script exists. Playwright `--list` discovered 16 tests in 5 files; tests were not executed because the default base URL is the hosted site and the suite includes seeded-account/mutation cases; no local API+test-data fixture was started.
- Documentation audit: 1,017 files; 164 SOURCE-VERIFIED, 238 PARTIAL, 615 STRUCTURAL, 0 UNREVIEWED; 390 traced/239 partial APIs; 96 models, 2,229 paths, 633 indexes; 0 broken links, 0 missing/stale sources and 0 possible secret matches. Documentation and source syntax checks passed; `git diff --check` passed before the final report update and must be rerun. No live API request, provider verification or payment occurred.
- Exact next action: source-trace inventory entry 386, `GET /api/staff/guides`, then continue in route order. Do not call the documentation complete while 239 API contracts and the listed source reviews remain.
