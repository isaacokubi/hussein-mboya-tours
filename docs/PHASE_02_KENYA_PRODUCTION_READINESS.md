# Phase 2 — Kenya Production Readiness

## Scope

Strengthen the Kenya-specific production-readiness gate and create one persistent test queue so execution can happen later when a laptop/Node.js environment is available.

## Completed

- Added `server/tests/kenyaProductionReadiness.test.js`.
- Added static contract checks for tenant-scoped tax, M-Pesa, payment lifecycle, eTIMS and accounting components.
- Added checks for Kenya VAT categories and KES handling.
- Added checks for M-Pesa tenant context and Kenyan phone normalization.
- Added checks for tenant-scoped duplicate payment/provider identifiers.
- Added checks for eTIMS idempotency, attempt history and unsafe adapter protection.
- Added `docs/STORED_TEST_EXECUTION_QUEUE.md` as the persistent master test list for later execution.
- The stored queue includes automated commands plus manual M-Pesa, eTIMS, accounting, tenancy and production-infrastructure acceptance tests.
- No live M-Pesa, KRA/eTIMS, backup, restore, monitoring or webhook evidence is marked verified.

## Verification boundary

The GitHub repository connector can inspect and modify the repository but cannot execute the Node.js suite or start the Firebase emulator in this environment. Therefore no test is reported as passed merely because the test file exists.

## Later execution

When a laptop is available, follow `docs/STORED_TEST_EXECUTION_QUEUE.md` in order. The automated baseline is:

```bash
cd server
npm install
npm run check:all
npm run check:multitenancy:live
npm test
npm run test:tour-domain
npm run test:security
node --test tests/kenyaProductionReadiness.test.js
npm run check:production
```

Then run the client checks and the manual integration/evidence tests in the stored queue.

## Exit condition

Phase 2 is structurally complete when the Kenya readiness contract, release-gate invocation and persistent test queue are committed. Production is not declared live or certified until external evidence has actually been completed.
