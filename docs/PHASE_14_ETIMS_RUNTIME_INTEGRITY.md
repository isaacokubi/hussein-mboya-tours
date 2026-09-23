# Phase 14 — eTIMS Runtime Integrity

## Scope

Phase 14 hardens the durable eTIMS submission lifecycle, with specific focus on the direct KRA OSCU path and its submission audit record.

## Defect fixed

The OSCU branch of `processEtimsInvoiceJob` referenced `audit` before the audit record was created. A successful or failed direct OSCU submission could therefore reach a runtime `ReferenceError` while trying to persist its submission evidence.

## Changes

- Create exactly one `EtimsSubmission` audit record before choosing OSCU versus adapter submission.
- Preserve a durable tenant-scoped idempotency key and submission attempt number.
- For OSCU success, replace the seed audit hash with the SHA-256 hash of the actual KRA payload returned by the OSCU submission service.
- Persist KRA invoice/receipt/unique-register/QR identifiers into the audit record.
- Persist OSCU failure state, KRA response data and retry timing into the same audit record.
- Preserve the adapter submission path's request hash and `x-idempotency-key`.

## Automated verification

Run from `server/`:

```bash
node --test tests/etimsRuntimeIntegrity.test.js
```

The release gate also runs this contract automatically.

## Evidence boundary

This phase verifies application-side runtime structure only. It does **not** prove live KRA/eTIMS certification, credentials, provider connectivity, or a production invoice submission.

Those remain external acceptance requirements and must be recorded only after an actual sandbox/production test with the target tenant and certified adapter.
