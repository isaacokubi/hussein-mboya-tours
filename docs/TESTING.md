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

## Validation run for the documentation quality pass (2026-11-10)

- `cd server && npm run check`: passed (`node --check server.js`).
- `cd server && npm test`: passed outside the sandbox: 316 tests, 311 passed, 5 skipped, 0 failed. The five skipped cases require isolated Mongo integration configuration. Running inside the sandbox caused `listen EPERM` for the readiness test's `127.0.0.1` listeners; rerunning the suite outside the sandbox resolved that environment restriction.
- Focused `node tests/healthReadiness.test.js` outside the sandbox: 3 passed, 1 Mongo-backed readiness test skipped because `HEALTH_TEST_MONGODB_URI` was not supplied. Its three runnable cases verify health/root behavior, fail-closed uploads without Cloudinary, and server liveness while Mongo is unavailable.
- `cd client && npm run lint`: passed.
- `cd client && npm run build`: passed; Vite transformed 3,232 modules.
- Documentation generation/coverage scripts passed `node --check`.
- `node scripts/check-documentation-coverage.js`: 1,015 source rows; no missing/stale source entries; 42 registered critical source scopes; 96 models and 2,229 schema paths; all 629 mounted API entries accounted for; 78 source-traced contracts, 551 partial, 0 unclassified; 100 interview questions; 9 business workflow sections; 0 broken links; 0 matches for selected credential patterns. It reports incomplete API and source review coverage.
- Eight curl templates are source-shaped but unexecuted. No live API request or M-Pesa/Stripe/PayPal transaction was run. Existing payment tests use mocks/fixtures; they do not establish provider settlement or production integration.

The outstanding readiness check is its Mongo-backed case, which requires `HEALTH_TEST_MONGODB_URI` pointing at the dedicated approved test source database. That case was not run, so successful startup against MongoDB and completion of its index migration remain unverified by this pass.
