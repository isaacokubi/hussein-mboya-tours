# Phase 5 — Payment & M-Pesa Hardening

## Scope

Phase 5 hardens the Kenyan payment initiation path so a provider request is not started before the application has a durable tenant-scoped payment record.

## Completed

- Persist a tenant-scoped pending M-Pesa payment before STK initiation.
- Generate a unique internal transaction reference for each STK request.
- Reuse the existing pending/processing guard to prevent a second STK request for the same booking while the first is unresolved.
- On provider failure, persist the payment as failed with a failure reason and timestamp.
- After a successful provider response, persist merchant and checkout request identifiers and move the payment to processing.
- Preserve the existing central callback lifecycle for successful and failed callbacks.
- Add a contract test covering persistence ordering, failure persistence, duplicate prevention and provider identifier contracts.
- Keep the full manual M-Pesa test matrix in `docs/STORED_TEST_EXECUTION_QUEUE.md`.

## Verification boundary

The repository-side contract is implemented, but no Node test or live M-Pesa transaction was executed in this environment. A successful production payment requires real sandbox/production provider credentials and external reconciliation evidence.

## Stored execution

```bash
cd server
node --test tests/paymentMpesaHardening.test.js
npm test
npm run check:all
```

## Exit condition

Phase 5 is complete only after the contract is committed and merged to `main`. Production payment certification remains external and must not be represented as passed until the stored manual tests are executed.
