# Step 1 — M-Pesa Payment Lifecycle Hardening

Date: 2026-09-17

This release adds an automated production contract around the M-Pesa callback lifecycle. It does not claim live Safaricom callback acceptance; provider acceptance still requires a real sandbox callback reaching an approved public HTTPS endpoint.

## What is now guarded in CI

The contract test verifies that:

1. The `/api/mpesa/callback` route resolves the tenant before processing and runs callback-integrity verification.
2. A successful booking callback validates the provider result code, paid amount and M-Pesa receipt before completing the payment.
3. Failed provider callbacks go through the central failure lifecycle instead of mutating payment and booking state ad hoc.
4. Successful callbacks go through the central completion lifecycle, which uses a MongoDB transaction and idempotency checks.
5. Provider identifiers are tenant-unique for checkout requests, M-Pesa receipts and callback event IDs.
6. The central lifecycle protects against overpayment/double credit and repeated completion.

## What still requires provider evidence

These are deliberately not marked PASS by source inspection:

- Real sandbox callback delivery.
- Successful callback changing payment and booking state in a live sandbox database.
- Invoice and accounting reconciliation after callback completion.
- Provider callback replay against the same transaction.
- Provider-supported failed/cancelled/expired payment callback.
- Live KRA/eTIMS submission and receipt evidence.

## Verification command

From `server/`:

```bash
npm test
```

The new contract is `tests/mpesaCallbackLifecycleContract.test.js` and runs with the existing test suite.

## Production rule

Never promote the M-Pesa integration from "sandbox initiation verified" to "production payment accepted" until the callback evidence above is captured without storing secrets, PINs or access tokens in repository documentation.
