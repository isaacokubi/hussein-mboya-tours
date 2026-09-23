# Phase 3 — Final Release Gate

## Scope

Phase 3 hardens the final release control between Kenya readiness and a releasable buyer handoff.

## Completed

- Added `server/tests/finalReleaseGateContract.test.js`.
- The contract checks release documentation, environment-template safety, disabled development fallbacks, required server verification scripts, frontend-only Vercel configuration, and explicit external production evidence.
- Added the final release contract to `.github/workflows/release-gate.yml` before the client lint/build steps.
- Kept the existing committed-secret scan in the release workflow.
- Preserved the distinction between source-code release checks and external production certification.

## Verification boundary

The connector can inspect and modify repository files, but this environment does not provide a local Node.js/npm runtime or the Firebase emulator. Therefore the Phase 3 test has been stored and wired into CI, but it has not been executed here.

Required later execution:

```bash
cd server
npm install
node --test tests/finalReleaseGateContract.test.js
```

Then run the complete release queue in `docs/STORED_TEST_EXECUTION_QUEUE.md`.

## Production boundary

Passing this contract does **not** prove:

- current production deployment is the intended commit;
- live M-Pesa completion/refund/reconciliation;
- live KRA/eTIMS submission;
- real webhook delivery;
- backup/restore;
- monitoring/alert delivery;
- browser acceptance;
- production data integrity.

Those require external environment evidence.

## Exit condition

Phase 3 is structurally complete when the final release contract is committed and enforced by CI. Production launch certification remains a separate external acceptance step.
