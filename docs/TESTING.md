# Testing

## Available infrastructure

- Backend uses Node's built-in `node:test` runner with files under `server/tests/*.js`; `npm test` runs that glob.
- Focused commands include `npm run test:security` and `npm run test:tour-domain`.
- Backend has syntax/contract/readiness commands (`check`, `check:controllers`, `check:models`, `check:services`, `check:seeds`, `check:security`, `check:tenant-models`, `check:production`). `check:all` composes these and may access environment/database state through its readiness component.
- Frontend uses ESLint (`npm run lint`), Vite production build (`npm run build`), and Playwright (`npm run test:e2e`). Configs/specs are in `client/`.
- Existing tests include isolated unit/helper tests and opt-in Mongo integration tests. Environment variables gate some tests; inspect test setup before running.

## What a test result proves

Pure unit tests can validate deterministic logic under their inputs/mocks. A Mongo integration test can validate behavior only against the configured test database. A mocked provider test checks request construction/handling, not provider connectivity or settlement. Browser tests depend on the configured site/API and test data. None of these alone proves production readiness.

## Safe commands

From `server/`: `npm run check`, `npm run check:controllers`, `npm run check:models`, and `npm run check:services` are syntax checks. `npm run test:security` runs selected unit tests, but inspect environment setup first. From `client/`: `npm run lint` and `npm run build` validate source/build. Full backend suite and Playwright may require database/site credentials and should only be pointed at isolated test resources.

## Payment tests

Payment tests should cover normalization, amount bounds, booking ownership, duplicate attempts, invalid/replayed callbacks, callback tenant/environment pinning, provider query verification, idempotent lifecycle transitions and refund handling. A real sandbox lifecycle requires sandbox credentials, reachable HTTPS callback, provider-authorized test phone/account and persisted evidence. Repository readiness docs describe what was and was not exercised at their dates.

The current test suite includes mock/fixture coverage for M-Pesa payload validation, provider verification branches, payment lifecycle integrity, refund safety and tenant isolation. Passing these tests establishes the covered mocked/application logic only; no real Daraja transaction or settlement was performed.

## Latest local validation run (2026-11-10)

- `cd server && npm test`: 322 tests, 317 passed, 0 failed, 5 skipped, 0 todo. Mongo-dependent cases were skipped because this local run did not supply an isolated replica-set test database.
- `cd server && npm run check:all`: passed, including source syntax checks, tenant model contract check and static production-readiness contract. This is not production launch certification; the script explicitly leaves external deployment evidence gates pending.
- `cd client && npm run lint`: passed.
- `cd client && npm run build`: passed; Vite transformed 3,232 modules.
- `cd client && npm run test:e2e -- --list`: discovered 16 tests in 5 files. The E2E tests were not run: Playwright defaults to the hosted app and some tests use seeded accounts or mutations; no local end-to-end fixture was configured for this run. No frontend unit/component test command is defined.
- `node --check` passed for documentation audit/generator scripts and the touched sitemap source modules.
- `node scripts/check-documentation-coverage.js`: 1,017 source rows; 164 SOURCE-VERIFIED, 238 PARTIAL, 615 STRUCTURAL, 0 UNREVIEWED; 170 registered scope rows across 164 files; 96 model guides and 2,229 schema paths; all 629 mounted API entries accounted for; 390 source-traced, 239 partial, 0 unclassified; 100 interview questions; 9 workflow sections; 0 broken links, stale references, or selected credential-pattern matches. The audit reports remaining API/source review work.
- Eight curl templates are source-shaped but unexecuted. No live API request or M-Pesa/Stripe/PayPal transaction was run. Existing payment tests use mocks/fixtures; they do not establish provider settlement or production integration.

The Mongo-backed tests require isolated replica-set MongoDB configuration. Live Playwright and provider verification require a dedicated test deployment/data and genuine sandbox configuration. These tests were not reported as passing.
